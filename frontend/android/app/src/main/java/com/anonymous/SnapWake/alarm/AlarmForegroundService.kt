package com.anonymous.SnapWake.alarm

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.provider.Settings
import android.util.Log
import androidx.core.app.NotificationCompat
import com.anonymous.SnapWake.R

class AlarmForegroundService : Service() {
  private val logTag = "SnapWakeAlarm"
  private var mediaPlayer: MediaPlayer? = null
  private var wakeLock: PowerManager.WakeLock? = null

  override fun onCreate() {
    super.onCreate()
    createChannel()
    Log.i(logTag, "service.created")
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    if (intent?.action == ACTION_STOP_ALARM) {
      Log.i(logTag, "service.stop.requested")
      stopAlarm()
      stopSelf()
      return START_NOT_STICKY
    }

    val alarmId = intent?.getStringExtra(EXTRA_ALARM_ID) ?: "active"
    val label = intent?.getStringExtra(EXTRA_ALARM_LABEL) ?: "SnapWake Alarm"
    val ringtone = intent?.getStringExtra(EXTRA_ALARM_RINGTONE) ?: "ringtone"
    val vibrationEnabled = intent?.getBooleanExtra(EXTRA_ALARM_VIBRATION, true) ?: true
    Log.i(
      logTag,
      "service.start alarmId=$alarmId label=$label ringtone=$ringtone vibration=$vibrationEnabled"
    )

    getSharedPreferences(ALARM_PREFS, Context.MODE_PRIVATE)
      .edit()
      .putString(ACTIVE_ALARM_ID, alarmId)
      .apply()

    acquireWakeLock()
    startForeground(1001, buildNotification(alarmId, label))
    Log.i(logTag, "service.foreground alarmId=$alarmId")
    startSound(ringtone)
    if (vibrationEnabled) {
      startVibration()
    }
    launchAlarmActivity(alarmId)

    return START_STICKY
  }

  override fun onDestroy() {
    Log.i(logTag, "service.destroy")
    stopAlarm()
    super.onDestroy()
  }

  override fun onBind(intent: Intent?): IBinder? = null

  private fun acquireWakeLock() {
    val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
    wakeLock = powerManager.newWakeLock(
      PowerManager.FULL_WAKE_LOCK or
        PowerManager.ACQUIRE_CAUSES_WAKEUP or
        PowerManager.ON_AFTER_RELEASE,
      "SnapWake:AlarmWakeLock"
    ).apply {
      setReferenceCounted(false)
      acquire(10 * 60 * 1000L)
    }
    Log.i(logTag, "wakelock.acquired")
  }

  private fun startSound(ringtone: String) {
    val soundRes = when (ringtone.trim()) {
      "cincin" -> R.raw.cincin
      "iphone" -> R.raw.iphone
      "ringtone" -> R.raw.ringtone
      "Silent", "silent" -> null
      else -> R.raw.ringtone
    } ?: return

    if (!playRawSound(soundRes)) {
      playSystemAlarmFallback()
    }
  }

  private fun playRawSound(soundRes: Int): Boolean {
    return try {
      val assetFileDescriptor = resources.openRawResourceFd(soundRes)
      stopSound()

      mediaPlayer = MediaPlayer().apply {
        setAudioAttributes(alarmAudioAttributes())
        setDataSource(
          assetFileDescriptor.fileDescriptor,
          assetFileDescriptor.startOffset,
          assetFileDescriptor.length
        )
        isLooping = true
        setOnErrorListener { player, what, extra ->
          Log.e(logTag, "Alarm audio playback error: what=$what extra=$extra")
          releasePlayer(player)
          true
        }
        prepare()
        start()
      }
      assetFileDescriptor.close()
      Log.i(logTag, "audio.raw.started res=$soundRes")
      true
    } catch (error: Exception) {
      Log.e(logTag, "Raw alarm sound failed, falling back to system alarm", error)
      stopSound()
      false
    }
  }

  private fun playSystemAlarmFallback() {
    try {
      stopSound()
      mediaPlayer = MediaPlayer().apply {
        setAudioAttributes(alarmAudioAttributes())
        setDataSource(this@AlarmForegroundService, Settings.System.DEFAULT_ALARM_ALERT_URI)
        isLooping = true
        setOnErrorListener { player, what, extra ->
          Log.e(logTag, "Fallback alarm audio playback error: what=$what extra=$extra")
          releasePlayer(player)
          true
        }
        prepare()
        start()
      }
      Log.i(logTag, "audio.system.started")
    } catch (error: Exception) {
      Log.e(logTag, "System alarm fallback failed. Continuing alarm without audio.", error)
      stopSound()
    }
  }

  private fun alarmAudioAttributes(): AudioAttributes {
    return AudioAttributes.Builder()
      .setUsage(AudioAttributes.USAGE_ALARM)
      .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
      .build()
  }

  private fun releasePlayer(player: MediaPlayer) {
    try {
      player.release()
    } catch (error: Exception) {
      Log.w(logTag, "Unable to release alarm audio player", error)
    }

    if (mediaPlayer === player) {
      mediaPlayer = null
    }
  }

  private fun stopSound() {
    mediaPlayer?.let { player ->
      try {
        if (player.isPlaying) {
          player.stop()
        }
      } catch (error: IllegalStateException) {
        Log.w(logTag, "Alarm audio was already stopped", error)
      } finally {
        releasePlayer(player)
      }
    }
  }

  private fun startVibration() {
    val pattern = longArrayOf(0, 700, 450, 700, 900)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      val manager = getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
      manager.defaultVibrator.vibrate(VibrationEffect.createWaveform(pattern, 0))
    } else {
      @Suppress("DEPRECATION")
      (getSystemService(Context.VIBRATOR_SERVICE) as Vibrator).vibrate(pattern, 0)
    }
  }

  private fun stopVibration() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      val manager = getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
      manager.defaultVibrator.cancel()
    } else {
      @Suppress("DEPRECATION")
      (getSystemService(Context.VIBRATOR_SERVICE) as Vibrator).cancel()
    }
  }

  private fun launchAlarmActivity(alarmId: String) {
    val intent = Intent(this, AlarmActivity::class.java).apply {
      flags = Intent.FLAG_ACTIVITY_NEW_TASK or
        Intent.FLAG_ACTIVITY_CLEAR_TOP or
        Intent.FLAG_ACTIVITY_SINGLE_TOP
      putExtra(EXTRA_ALARM_ID, alarmId)
    }
    startActivity(intent)
    Log.i(logTag, "activity.launch alarmId=$alarmId")
  }

  private fun buildNotification(alarmId: String, label: String): Notification {
    val fullScreenIntent = Intent(this, AlarmActivity::class.java).apply {
      putExtra(EXTRA_ALARM_ID, alarmId)
      flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
    }

    val fullScreenPendingIntent = PendingIntent.getActivity(
      this,
      2001,
      fullScreenIntent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )

    return NotificationCompat.Builder(this, ALARM_CHANNEL_ID)
      .setSmallIcon(R.mipmap.ic_launcher)
      .setContentTitle(label)
      .setContentText("Complete your challenge to stop the alarm.")
      .setPriority(NotificationCompat.PRIORITY_MAX)
      .setCategory(NotificationCompat.CATEGORY_ALARM)
      .setOngoing(true)
      .setAutoCancel(false)
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
      .setFullScreenIntent(fullScreenPendingIntent, true)
      .setContentIntent(fullScreenPendingIntent)
      .build()
  }

  private fun createChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return

    val channel = NotificationChannel(
      ALARM_CHANNEL_ID,
      "SnapWake Alarms",
      NotificationManager.IMPORTANCE_HIGH
    ).apply {
      description = "Full-screen alarm alerts"
      lockscreenVisibility = Notification.VISIBILITY_PUBLIC
      setSound(null, null)
      enableVibration(false)
    }

    getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
    Log.i(logTag, "notification.channel.ready")
  }

  private fun stopAlarm() {
    stopSound()
    stopVibration()
    wakeLock?.takeIf { it.isHeld }?.release()
    wakeLock = null
  }
}
