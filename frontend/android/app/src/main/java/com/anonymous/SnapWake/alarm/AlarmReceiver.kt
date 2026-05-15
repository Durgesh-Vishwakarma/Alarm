package com.anonymous.SnapWake.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import java.util.Calendar

class AlarmReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    scheduleNextRepeat(context, intent)

    val serviceIntent = Intent(context, AlarmForegroundService::class.java).apply {
      action = ACTION_FIRE_ALARM
      putExtras(intent.extras ?: android.os.Bundle())
    }

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      context.startForegroundService(serviceIntent)
    } else {
      context.startService(serviceIntent)
    }
  }

  private fun scheduleNextRepeat(context: Context, intent: Intent) {
    val repeatDays = intent.getStringExtra(EXTRA_ALARM_REPEAT_DAYS)
      .orEmpty()
      .split(",")
      .filter { it.isNotBlank() }
    if (repeatDays.isEmpty()) return

    val alarmId = intent.getStringExtra(EXTRA_ALARM_ID) ?: return
    val time = intent.getStringExtra(EXTRA_ALARM_TIME).orEmpty()
    val period = intent.getStringExtra(EXTRA_ALARM_PERIOD).orEmpty()
    val vibrationEnabled = intent.getBooleanExtra(EXTRA_ALARM_VIBRATION, true)
    val nextTrigger = nextTriggerMillis(time, period, repeatDays)

    AlarmScheduler.scheduleExact(
      context,
      alarmId,
      nextTrigger,
      intent.getStringExtra(EXTRA_ALARM_LABEL) ?: "SnapWake Alarm",
      repeatDays,
      time,
      period,
      intent.getStringExtra(EXTRA_ALARM_RINGTONE) ?: "ringtone",
      vibrationEnabled
    )

    context.getSharedPreferences(ALARM_PREFS, Context.MODE_PRIVATE)
      .edit()
      .putLong("$alarmId:triggerAt", nextTrigger)
      .putBoolean("$alarmId:vibration", vibrationEnabled)
      .apply()
  }

  private fun nextTriggerMillis(time: String, period: String, repeatDays: List<String>): Long {
    val parts = time.split(":")
    var hour = parts.getOrNull(0)?.toIntOrNull() ?: 6
    val minute = parts.getOrNull(1)?.toIntOrNull() ?: 0
    if (period == "PM" && hour != 12) hour += 12
    if (period == "AM" && hour == 12) hour = 0

    val now = Calendar.getInstance()
    for (offset in 0..8) {
      val candidate = Calendar.getInstance().apply {
        timeInMillis = now.timeInMillis
        add(Calendar.DAY_OF_YEAR, offset)
        set(Calendar.HOUR_OF_DAY, hour)
        set(Calendar.MINUTE, minute)
        set(Calendar.SECOND, 0)
        set(Calendar.MILLISECOND, 0)
      }

      val day = when (candidate.get(Calendar.DAY_OF_WEEK)) {
        Calendar.SUNDAY -> "Sun"
        Calendar.MONDAY -> "Mon"
        Calendar.TUESDAY -> "Tue"
        Calendar.WEDNESDAY -> "Wed"
        Calendar.THURSDAY -> "Thu"
        Calendar.FRIDAY -> "Fri"
        else -> "Sat"
      }

      if (repeatDays.contains(day) && candidate.timeInMillis > now.timeInMillis) {
        return candidate.timeInMillis
      }
    }

    return now.timeInMillis + 24 * 60 * 60 * 1000L
  }
}
