package com.anonymous.SnapWake.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class AlarmBootReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action != Intent.ACTION_BOOT_COMPLETED) return
    Log.i("SnapWakeAlarm", "boot.received")

    val prefs = context.getSharedPreferences(ALARM_PREFS, Context.MODE_PRIVATE)
    val alarmIds = prefs.getStringSet("alarm_ids", emptySet()).orEmpty()
    val now = System.currentTimeMillis()
    Log.i("SnapWakeAlarm", "boot.restore.count count=${alarmIds.size}")

    alarmIds.forEach { alarmId ->
      val triggerAt = prefs.getLong("$alarmId:triggerAt", 0L)
      if (triggerAt <= now) {
        Log.w("SnapWakeAlarm", "boot.restore.skipped_past alarmId=$alarmId triggerAt=$triggerAt now=$now")
        return@forEach
      }

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
        prefs.getString("$alarmId:ringtone", "ringtone") ?: "ringtone",
        prefs.getBoolean("$alarmId:vibration", true)
      )
      Log.i("SnapWakeAlarm", "boot.restore.scheduled alarmId=$alarmId triggerAt=$triggerAt")
    }
  }
}
