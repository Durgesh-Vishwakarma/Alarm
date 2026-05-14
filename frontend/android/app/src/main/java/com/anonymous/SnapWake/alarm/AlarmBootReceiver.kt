package com.anonymous.SnapWake.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class AlarmBootReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action != Intent.ACTION_BOOT_COMPLETED) return

    val prefs = context.getSharedPreferences(ALARM_PREFS, Context.MODE_PRIVATE)
    val alarmIds = prefs.getStringSet("alarm_ids", emptySet()).orEmpty()
    val now = System.currentTimeMillis()

    alarmIds.forEach { alarmId ->
      val triggerAt = prefs.getLong("$alarmId:triggerAt", 0L)
      if (triggerAt <= now) return@forEach

      val repeatDays = prefs.getString("$alarmId:repeatDays", "")
        .orEmpty()
        .split(",")
        .filter { it.isNotBlank() }

      AlarmScheduler.scheduleExact(
        context,
        alarmId,
        triggerAt,
        prefs.getString("$alarmId:label", "SnapWake Alarm") ?: "SnapWake Alarm",
        repeatDays,
        prefs.getString("$alarmId:time", "") ?: "",
        prefs.getString("$alarmId:period", "") ?: "",
        prefs.getString("$alarmId:ringtone", "ringtone") ?: "ringtone"
      )
    }
  }
}
