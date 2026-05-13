package com.anonymous.SnapWake.alarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import java.util.Calendar

// Shared scheduling utilities used by the module, boot receiver, and service.
object AlarmSchedulerHelper {
  fun scheduleAlarm(context: Context, alarm: AlarmInfo, triggerAtMs: Long? = null) {
    val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    val intent = Intent(context, AlarmReceiver::class.java).apply {
      action = AlarmReceiver.ACTION_TRIGGER
      putExtra(AlarmReceiver.EXTRA_ALARM_ID, alarm.alarmId)
      putExtra(AlarmReceiver.EXTRA_LABEL, alarm.label)
      putExtra(AlarmReceiver.EXTRA_TIME, alarm.time)
      putExtra(AlarmReceiver.EXTRA_PERIOD, alarm.period)
      putExtra(AlarmReceiver.EXTRA_RINGTONE, alarm.ringtone)
      putExtra(AlarmReceiver.EXTRA_REPEAT_DAYS, alarm.repeatDays.toTypedArray())
    }

    val pendingIntent = PendingIntent.getBroadcast(
      context,
      alarm.alarmId.hashCode(),
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )

    val fireAt = triggerAtMs ?: alarm.triggerAtMs
    val alarmClockInfo = AlarmManager.AlarmClockInfo(fireAt, pendingIntent)
    alarmManager.setAlarmClock(alarmClockInfo, pendingIntent)
  }

  fun cancelAlarm(context: Context, alarmId: String) {
    val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    val intent = Intent(context, AlarmReceiver::class.java).apply {
      action = AlarmReceiver.ACTION_TRIGGER
      putExtra(AlarmReceiver.EXTRA_ALARM_ID, alarmId)
    }

    val pendingIntent = PendingIntent.getBroadcast(
      context,
      alarmId.hashCode(),
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )

    alarmManager.cancel(pendingIntent)
    pendingIntent.cancel()
  }

  fun nextTriggerMillis(time: String, period: String, repeatDays: List<String>): Long {
    val parts = time.split(":")
    val hourText = parts.getOrNull(0) ?: "6"
    val minuteText = parts.getOrNull(1) ?: "0"

    var hour = hourText.toIntOrNull() ?: 6
    val minute = minuteText.toIntOrNull() ?: 0

    if (period == "PM" && hour != 12) hour += 12
    if (period == "AM" && hour == 12) hour = 0

    val now = System.currentTimeMillis()

    for (offset in 0..8) {
      val candidate = Calendar.getInstance().apply {
        add(Calendar.DATE, offset)
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
        Calendar.SATURDAY -> "Sat"
        else -> ""
      }

      if (repeatDays.contains(day) && candidate.timeInMillis > now) {
        return candidate.timeInMillis
      }
    }

    return now + 24 * 60 * 60 * 1000L
  }
}
