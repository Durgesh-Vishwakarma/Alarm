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
import android.net.Uri
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.core.app.NotificationCompat
import com.anonymous.SnapWake.R

class AlarmForegroundService : Service() {
  private var mediaPlayer: MediaPlayer? = null
  private var wakeLock: PowerManager.WakeLock? = null

  override fun onCreate() {
    super.onCreate()
    createChannel()
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    if (intent?.action == ACTION_STOP_ALARM) {
      stopAlarm()
      stopSelf()
      return START_NOT_STICKY
    }

    val alarmId = intent?.getStringExtra(EXTRA_ALARM_ID) ?: "active"
    val label = intent?.getStringExtra(EXTRA_ALARM_LABEL) ?: "SnapWake Alarm"
    val ringtone = intent?.getStringExtra(EXTRA_ALARM_RINGTONE) ?: "ringtone"

    getSharedPreferences(ALARM_PREFS, Context.MODE_PRIVATE)
      .edit()
      .putString(ACTIVE_ALARM_ID, alarmId)
      .apply()

    acquireWakeLock()
    startForeground(1001, buildNotification(alarmId, label))
    startSound(ringtone)
    startVibration()
    launchAlarmActivity(alarmId)

    return START_STICKY
  }

  override fun onDestroy() {
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
  }

  private fun startSound(ringtone: String) {
    val soundRes = when (ringtone) {
      "cincin" -> R.raw.cincin
      "iphone" -> R.raw.iphone
      "ringtone" -> R.raw.ringtone
      "Silent" -> null
      else -> R.raw.ringtone
    } ?: return

    mediaPlayer?.release()
    mediaPlayer = MediaPlayer().apply {
      setAudioAttributes(
        AudioAttributes.Builder()
          .setUsage(AudioAttributes.USAGE_ALARM)
          .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
          .build()
      )
      setDataSource(this@AlarmForegroundService, Uri.parse("android.resource://$packageName/$soundRes"))
      isLooping = true
      prepare()
      start()
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
  }

  private fun stopAlarm() {
    mediaPlayer?.stop()
    mediaPlayer?.release()
    mediaPlayer = null
    stopVibration()
    wakeLock?.takeIf { it.isHeld }?.release()
    wakeLock = null
  }
}

