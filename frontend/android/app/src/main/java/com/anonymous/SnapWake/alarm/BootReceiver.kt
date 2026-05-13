package com.anonymous.SnapWake.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class BootReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    when (intent.action) {
      Intent.ACTION_BOOT_COMPLETED,
      Intent.ACTION_MY_PACKAGE_REPLACED,
      Intent.ACTION_TIME_CHANGED,
      Intent.ACTION_TIMEZONE_CHANGED,
      Intent.ACTION_DATE_CHANGED -> rescheduleAlarms(context)
    }
  }

  private fun rescheduleAlarms(context: Context) {
    val alarms = AlarmStore.load(context)
    val now = System.currentTimeMillis()

    alarms.forEach { alarm ->
      if (alarm.repeatDays.isEmpty()) {
        if (alarm.triggerAtMs > now) {
          AlarmSchedulerHelper.scheduleAlarm(context, alarm, alarm.triggerAtMs)
        }
      } else {
        val nextTrigger = AlarmSchedulerHelper.nextTriggerMillis(
          alarm.time,
          alarm.period,
          alarm.repeatDays,
        )
        AlarmSchedulerHelper.scheduleAlarm(context, alarm, nextTrigger)
      }
    }
  }
}
