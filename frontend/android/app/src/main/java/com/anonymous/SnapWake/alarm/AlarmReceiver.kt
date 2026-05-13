package com.anonymous.SnapWake.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.core.content.ContextCompat
import com.anonymous.SnapWake.MainActivity

class AlarmReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action != ACTION_TRIGGER) return

    val extras = intent.extras ?: Bundle()

    val serviceIntent = Intent(context, AlarmService::class.java).apply {
      action = AlarmService.ACTION_START
      putExtras(extras)
    }

    val alarmId = extras.getString(EXTRA_ALARM_ID) ?: ""
    val activityIntent = Intent(Intent.ACTION_VIEW).apply {
      data = Uri.parse("snapwake://alarm-alert?alarmId=$alarmId&ringing=true")
      setClass(context, MainActivity::class.java)
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
    }

    ContextCompat.startForegroundService(context, serviceIntent)
    context.startActivity(activityIntent)
  }

  companion object {
    const val ACTION_TRIGGER = "com.anonymous.SnapWake.ALARM_TRIGGER"

    const val EXTRA_ALARM_ID = "alarmId"
    const val EXTRA_LABEL = "label"
    const val EXTRA_REPEAT_DAYS = "repeatDays"
    const val EXTRA_TIME = "time"
    const val EXTRA_PERIOD = "period"
    const val EXTRA_RINGTONE = "ringtone"
  }
}
