package com.anonymous.SnapWake.alarm

import android.app.AlarmManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import android.net.Uri
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray

class AlarmSchedulerModule(private val context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
  override fun getName(): String = "AlarmScheduler"

  @ReactMethod
  fun scheduleAlarm(
    alarmId: String,
    triggerAtMs: Double,
    label: String,
    repeatDays: ReadableArray?,
    time: String?,
    period: String?,
    ringtone: String?,
    promise: Promise,
  ) {
    try {
      val days = if (repeatDays != null) {
        List(repeatDays.size()) { index -> repeatDays.getString(index) ?: "" }
      } else {
        emptyList()
      }

      val alarm = AlarmInfo(
        alarmId = alarmId,
        triggerAtMs = triggerAtMs.toLong(),
        label = label,
        time = time ?: "06:00",
        period = period ?: "AM",
        ringtone = ringtone ?: "alarm_neon",
        repeatDays = days,
      )

      AlarmStore.save(context, alarm)
      AlarmSchedulerHelper.scheduleAlarm(context, alarm, alarm.triggerAtMs)

      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("SCHEDULE_FAILED", error)
    }
  }

  @ReactMethod
  fun cancelAlarm(alarmId: String, promise: Promise) {
    try {
      AlarmSchedulerHelper.cancelAlarm(context, alarmId)
      AlarmStore.remove(context, alarmId)
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("CANCEL_FAILED", error)
    }
  }

  @ReactMethod
  fun canScheduleExactAlarms(promise: Promise) {
    try {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
        promise.resolve(true)
        return
      }
      val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
      promise.resolve(alarmManager.canScheduleExactAlarms())
    } catch (error: Exception) {
      promise.reject("CHECK_FAILED", error)
    }
  }

  @ReactMethod
  fun openExactAlarmSettings(promise: Promise) {
    try {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
        promise.resolve(false)
        return
      }
      val intent = Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM).apply {
        flags = Intent.FLAG_ACTIVITY_NEW_TASK
      }
      context.startActivity(intent)
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("OPEN_FAILED", error)
    }
  }

  @ReactMethod
  fun getActiveAlarmId(promise: Promise) {
    try {
      promise.resolve(AlarmStore.getActiveAlarmId(context))
    } catch (error: Exception) {
      promise.reject("GET_ACTIVE_ALARM_FAILED", error)
    }
  }

  @ReactMethod
  fun clearActiveAlarm(promise: Promise) {
    try {
      AlarmStore.clearActiveAlarm(context)
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("CLEAR_ACTIVE_ALARM_FAILED", error)
    }
  }

  @ReactMethod
  fun isIgnoringBatteryOptimizations(promise: Promise) {
    try {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
        promise.resolve(true)
        return
      }

      val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
      promise.resolve(powerManager.isIgnoringBatteryOptimizations(context.packageName))
    } catch (error: Exception) {
      promise.reject("CHECK_BATTERY_OPT_FAILED", error)
    }
  }

  @ReactMethod
  fun openIgnoreBatteryOptimizations(promise: Promise) {
    try {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
        promise.resolve(false)
        return
      }

      val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
        data = Uri.parse("package:${context.packageName}")
        flags = Intent.FLAG_ACTIVITY_NEW_TASK
      }

      context.startActivity(intent)
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("OPEN_BATTERY_OPT_FAILED", error)
    }
  }

  @ReactMethod
  fun stopAlarmService(promise: Promise) {
    try {
      val intent = Intent(context, AlarmService::class.java).apply {
        action = AlarmService.ACTION_STOP
      }
      context.startService(intent)
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("STOP_FAILED", error)
    }
  }
}
