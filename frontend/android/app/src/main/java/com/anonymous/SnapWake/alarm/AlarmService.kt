package com.anonymous.SnapWake.alarm

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.media.MediaPlayer
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import androidx.core.app.NotificationCompat
import com.anonymous.SnapWake.MainActivity

class AlarmService : Service() {
  private var mediaPlayer: MediaPlayer? = null
  private var audioManager: AudioManager? = null
  private var audioFocusRequest: AudioFocusRequest? = null
  private var wakeLock: PowerManager.WakeLock? = null

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    if (intent?.action == ACTION_STOP) {
      AlarmStore.clearActiveAlarm(this)
      stopSelf()
      return START_NOT_STICKY
    }

    val action = intent?.action
    if (action != null && action != ACTION_START) {
      return START_NOT_STICKY
    }

    val alarmId = intent?.getStringExtra(AlarmReceiver.EXTRA_ALARM_ID)
    val label = intent?.getStringExtra(AlarmReceiver.EXTRA_LABEL) ?: "SnapWake Alarm"
    val ringtoneName = intent?.getStringExtra(AlarmReceiver.EXTRA_RINGTONE)
    val time = intent?.getStringExtra(AlarmReceiver.EXTRA_TIME)
    val period = intent?.getStringExtra(AlarmReceiver.EXTRA_PERIOD)
    val repeatDays = intent?.getStringArrayExtra(AlarmReceiver.EXTRA_REPEAT_DAYS)?.toList() ?: emptyList()

    ensureChannel()
    try {
      startForeground(NOTIFICATION_ID, buildNotification(alarmId, label, time, period, repeatDays))
    } catch (_: Exception) {
      startForeground(NOTIFICATION_ID, buildFallbackNotification(label))
    }

    acquireWakeLock()
    startRingtone(ringtoneName)

    if (!alarmId.isNullOrEmpty() && time != null && period != null) {
      val alarm = AlarmInfo(
        alarmId = alarmId,
        triggerAtMs = System.currentTimeMillis(),
        label = label,
        time = time,
        period = period,
        ringtone = ringtoneName ?: "alarm_neon",
        repeatDays = repeatDays,
      )
      AlarmStore.setActiveAlarm(this, alarm)
    }

    rescheduleIfRepeating(intent)

    return START_STICKY
  }

  override fun onDestroy() {
    super.onDestroy()
    stopRingtone()
    releaseWakeLock()
    AlarmStore.clearActiveAlarm(this)
  }

  private fun buildNotification(
    alarmId: String?,
    label: String,
    time: String?,
    period: String?,
    repeatDays: List<String>,
  ): Notification {
    val contentIntent = PendingIntent.getActivity(
      this,
      (alarmId ?: "alarm").hashCode(),
      buildWakeIntent(alarmId),
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )

    return NotificationCompat.Builder(this, CHANNEL_ID)
      .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
      .setContentTitle(label)
      .setContentText("Time to wake up")
      .setPriority(NotificationCompat.PRIORITY_MAX)
      .setCategory(NotificationCompat.CATEGORY_ALARM)
      .setOngoing(true)
      .setAutoCancel(false)
      .setOnlyAlertOnce(true)
      .setFullScreenIntent(contentIntent, true)
      .setContentIntent(contentIntent)
      .build()
  }

  private fun buildFallbackNotification(label: String): Notification {
    val fallbackIntent = packageManager.getLaunchIntentForPackage(packageName)
    val contentIntent = PendingIntent.getActivity(
      this,
      0,
      fallbackIntent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )

    return NotificationCompat.Builder(this, CHANNEL_ID)
      .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
      .setContentTitle(label)
      .setContentText("Time to wake up")
      .setPriority(NotificationCompat.PRIORITY_MAX)
      .setCategory(NotificationCompat.CATEGORY_ALARM)
      .setOngoing(true)
      .setAutoCancel(false)
      .setContentIntent(contentIntent)
      .build()
  }

  private fun buildWakeIntent(alarmId: String?): Intent {
    val uri = Uri.parse("snapwake://alarm-alert?alarmId=${alarmId ?: ""}&ringing=true")
    return Intent(Intent.ACTION_VIEW).apply {
      data = uri
      setClass(this@AlarmService, MainActivity::class.java)
      flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
    }
  }

  private fun ensureChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return

    val channel = NotificationChannel(
      CHANNEL_ID,
      "SnapWake Alarm",
      NotificationManager.IMPORTANCE_HIGH,
    ).apply {
      description = "Critical alarm notifications"
      lockscreenVisibility = Notification.VISIBILITY_PUBLIC
    }

    val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    manager.createNotificationChannel(channel)
  }

  private fun startRingtone(ringtoneName: String?) {
    if (mediaPlayer != null) return
    if (ringtoneName == null || ringtoneName.equals("Silent", true)) return

    val resourceName = ringtoneName
      .lowercase()
      .replace(".mp3", "")

    val resourceId = resources.getIdentifier(resourceName, "raw", packageName)
    val uri = if (resourceId != 0) {
      Uri.parse("android.resource://$packageName/raw/$resourceName")
    } else {
      RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
        ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
    }

    val attrs = AudioAttributes.Builder()
      .setUsage(AudioAttributes.USAGE_ALARM)
      .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
      .build()

    audioManager = getSystemService(Context.AUDIO_SERVICE) as AudioManager
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      audioFocusRequest = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_EXCLUSIVE)
        .setAudioAttributes(attrs)
        .build()
      audioManager?.requestAudioFocus(audioFocusRequest!!)
    } else {
      @Suppress("DEPRECATION")
      audioManager?.requestAudioFocus(null, AudioManager.STREAM_ALARM, AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)
    }

    mediaPlayer = MediaPlayer().apply {
      setAudioAttributes(attrs)
      isLooping = true
      setDataSource(this@AlarmService, uri)
      setOnPreparedListener { it.start() }
      setOnErrorListener { player, _, _ ->
        player.release()
        mediaPlayer = null
        true
      }
      prepareAsync()
    }
  }

  private fun stopRingtone() {
    mediaPlayer?.let {
      it.stop()
      it.release()
    }
    mediaPlayer = null

    audioManager?.let { manager ->
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        audioFocusRequest?.let { manager.abandonAudioFocusRequest(it) }
      } else {
        @Suppress("DEPRECATION")
        manager.abandonAudioFocus(null)
      }
    }
    audioFocusRequest = null
    audioManager = null
  }

  private fun acquireWakeLock() {
    val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
    wakeLock = powerManager.newWakeLock(
      PowerManager.PARTIAL_WAKE_LOCK,
      "SnapWake:AlarmWakeLock",
    ).apply {
      setReferenceCounted(false)
      acquire(5 * 60 * 1000L)
    }
  }

  private fun releaseWakeLock() {
    wakeLock?.let {
      if (it.isHeld) it.release()
    }
    wakeLock = null
  }

  private fun rescheduleIfRepeating(intent: Intent?) {
    val alarmId = intent?.getStringExtra(AlarmReceiver.EXTRA_ALARM_ID) ?: return
    val time = intent.getStringExtra(AlarmReceiver.EXTRA_TIME) ?: return
    val period = intent.getStringExtra(AlarmReceiver.EXTRA_PERIOD) ?: return
    val repeatDays = intent.getStringArrayExtra(AlarmReceiver.EXTRA_REPEAT_DAYS) ?: return

    if (repeatDays.isEmpty()) return

    val nextTrigger = AlarmSchedulerHelper.nextTriggerMillis(
      time,
      period,
      repeatDays.toList(),
    )

    val alarm = AlarmInfo(
      alarmId = alarmId,
      triggerAtMs = nextTrigger,
      label = intent.getStringExtra(AlarmReceiver.EXTRA_LABEL) ?: "SnapWake Alarm",
      time = time,
      period = period,
      ringtone = intent.getStringExtra(AlarmReceiver.EXTRA_RINGTONE) ?: "alarm_neon",
      repeatDays = repeatDays.toList(),
    )

    AlarmSchedulerHelper.scheduleAlarm(this, alarm, nextTrigger)
    AlarmStore.save(this, alarm)
  }

  companion object {
    const val ACTION_START = "com.anonymous.SnapWake.ALARM_START"
    const val ACTION_STOP = "com.anonymous.SnapWake.ALARM_STOP"

    const val CHANNEL_ID = "snapwake_alarm_channel"
    const val NOTIFICATION_ID = 9101
  }
}
