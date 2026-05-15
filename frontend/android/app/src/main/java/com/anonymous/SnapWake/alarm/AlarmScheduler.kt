package com.anonymous.SnapWake.alarm

import android.app.AlarmManager
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import kotlin.math.abs

class AlarmScheduler(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "AlarmScheduler"

  @ReactMethod
  fun scheduleAlarm(
    alarmId: String,
    triggerAtMillis: Double,
    label: String,
    repeatDays: ReadableArray,
    time: String,
    period: String,
    ringtone: String,
    promise: Promise
  ) {
    try {
      val triggerAt = triggerAtMillis.toLong()
      val repeatList = mutableListOf<String>()
      for (i in 0 until repeatDays.size()) {
        repeatDays.getString(i)?.let { repeatList.add(it) }
      }

      scheduleFromValues(alarmId, triggerAt, label, repeatList, time, period, ringtone)
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("SCHEDULE_ALARM_FAILED", error)
    }
  }

  @ReactMethod
  fun scheduleNativeAlarm(payload: ReadableMap, promise: Promise) {
    try {
      val alarmId = payload.getString("id") ?: throw IllegalArgumentException("Alarm id is required")
      val triggerAt = payload.getDouble("nextTriggerAt").toLong()
      val label = payload.getString("label")
        ?: payload.getString("challengeTitle")
        ?: "Snapwake Alarm"
      val time = payload.getString("time") ?: ""
      val period = payload.getString("period") ?: ""
      val ringtone = payload.getString("ringtone") ?: "ringtone"
      val repeatList = mutableListOf<String>()
      val repeatDays = payload.getArray("repeatDays")

      if (repeatDays != null) {
        for (i in 0 until repeatDays.size()) {
          repeatDays.getString(i)?.let { repeatList.add(it) }
        }
      }

      scheduleFromValues(alarmId, triggerAt, label, repeatList, time, period, ringtone)
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("SCHEDULE_NATIVE_ALARM_FAILED", error)
    }
  }

  @ReactMethod
  fun cancelAlarm(alarmId: String, promise: Promise) {
    try {
      cancelScheduled(reactContext, alarmId)
      removePersistedAlarm(alarmId)
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("CANCEL_ALARM_FAILED", error)
    }
  }

  @ReactMethod
  fun cancelNativeAlarm(alarmId: String, promise: Promise) {
    cancelAlarm(alarmId, promise)
  }

  @ReactMethod
  fun stopAlarmService(promise: Promise) {
    try {
      val intent = Intent(reactContext, AlarmForegroundService::class.java).apply {
        action = ACTION_STOP_ALARM
      }
      reactContext.startService(intent)
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("STOP_ALARM_FAILED", error)
    }
  }

  @ReactMethod
  fun canScheduleExactAlarms(promise: Promise) {
    val alarmManager = reactContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    val allowed = Build.VERSION.SDK_INT < Build.VERSION_CODES.S || alarmManager.canScheduleExactAlarms()
    promise.resolve(allowed)
  }

  @ReactMethod
  fun getAlarmPermissionStatus(promise: Promise) {
    try {
      val alarmManager = reactContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager
      val powerManager = reactContext.getSystemService(Context.POWER_SERVICE) as PowerManager
      val notificationManager =
        reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
      val status = Arguments.createMap()
      val exactAllowed =
        Build.VERSION.SDK_INT < Build.VERSION_CODES.S || alarmManager.canScheduleExactAlarms()
      val fullScreenAllowed =
        Build.VERSION.SDK_INT < 34 || notificationManager.canUseFullScreenIntent()
      val notificationAllowed =
        Build.VERSION.SDK_INT < 33 ||
          reactContext.checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) ==
          PackageManager.PERMISSION_GRANTED

      status.putBoolean("canScheduleExactAlarms", exactAllowed)
      status.putBoolean("fullScreenIntentAllowed", fullScreenAllowed)
      status.putBoolean("overlayAllowed", Settings.canDrawOverlays(reactContext))
      status.putBoolean(
        "ignoringBatteryOptimizations",
        powerManager.isIgnoringBatteryOptimizations(reactContext.packageName)
      )
      status.putBoolean("notificationsAllowed", notificationAllowed)
      status.putBoolean("backgroundExecutionSupported", true)
      promise.resolve(status)
    } catch (error: Exception) {
      promise.reject("ALARM_PERMISSION_STATUS_FAILED", error)
    }
  }

  @ReactMethod
  fun requestExactAlarmPermission(promise: Promise) {
    openExactAlarmSettings(promise)
  }

  @ReactMethod
  fun openExactAlarmSettings(promise: Promise) {
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        val intent = Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM).apply {
          data = Uri.parse("package:${reactContext.packageName}")
          flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        reactContext.startActivity(intent)
      }
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("EXACT_ALARM_SETTINGS_FAILED", error)
    }
  }

  @ReactMethod
  fun openFullScreenAlarmSettings(promise: Promise) {
    try {
      if (Build.VERSION.SDK_INT >= 34) {
        val intent = Intent("android.settings.MANAGE_APP_USE_FULL_SCREEN_INTENT").apply {
          data = Uri.parse("package:${reactContext.packageName}")
          flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        reactContext.startActivity(intent)
      } else {
        openAppSettings(promise)
        return
      }
      promise.resolve(true)
    } catch (error: Exception) {
      openAppSettings(promise)
    }
  }

  @ReactMethod
  fun openOverlaySettings(promise: Promise) {
    try {
      val intent = Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION).apply {
        data = Uri.parse("package:${reactContext.packageName}")
        flags = Intent.FLAG_ACTIVITY_NEW_TASK
      }
      reactContext.startActivity(intent)
      promise.resolve(true)
    } catch (error: Exception) {
      openAppSettings(promise)
    }
  }

  @ReactMethod
  fun openAppSettings(promise: Promise) {
    try {
      val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
        data = Uri.parse("package:${reactContext.packageName}")
        flags = Intent.FLAG_ACTIVITY_NEW_TASK
      }
      reactContext.startActivity(intent)
      promise.resolve(true)
    } catch (error: Exception) {
      promise.reject("APP_SETTINGS_FAILED", error)
    }
  }

  @ReactMethod
  fun isIgnoringBatteryOptimizations(promise: Promise) {
    val powerManager = reactContext.getSystemService(Context.POWER_SERVICE) as PowerManager
    promise.resolve(powerManager.isIgnoringBatteryOptimizations(reactContext.packageName))
  }

  @ReactMethod
  fun openIgnoreBatteryOptimizations(promise: Promise) {
    try {
      val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
        data = Uri.parse("package:${reactContext.packageName}")
        flags = Intent.FLAG_ACTIVITY_NEW_TASK
      }
      reactContext.startActivity(intent)
      promise.resolve(true)
    } catch (error: Exception) {
      // Fallback to general settings if the direct request is blocked or fails
      try {
        val fallbackIntent = Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS).apply {
          flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        reactContext.startActivity(fallbackIntent)
        promise.resolve(true)
      } catch (fallbackError: Exception) {
        promise.reject("BATTERY_OPTIMIZATION_SETTINGS_FAILED", fallbackError)
      }
    }
  }

  @ReactMethod
  fun requestIgnoreBatteryOptimizations(promise: Promise) {
    openIgnoreBatteryOptimizations(promise)
  }

  @ReactMethod
  fun getActiveAlarmId(promise: Promise) {
    promise.resolve(
      reactContext.getSharedPreferences(ALARM_PREFS, Context.MODE_PRIVATE)
        .getString(ACTIVE_ALARM_ID, null)
    )
  }

  @ReactMethod
  fun clearActiveAlarm(promise: Promise) {
    reactContext.getSharedPreferences(ALARM_PREFS, Context.MODE_PRIVATE)
      .edit()
      .remove(ACTIVE_ALARM_ID)
      .apply()
    promise.resolve(true)
  }

  private fun persistAlarm(
    alarmId: String,
    triggerAt: Long,
    label: String,
    repeatDays: List<String>,
    time: String,
    period: String,
    ringtone: String
  ) {
    reactContext.getSharedPreferences(ALARM_PREFS, Context.MODE_PRIVATE)
      .edit()
      .putStringSet("alarm_ids", getPersistedIds().plus(alarmId))
      .putLong("$alarmId:triggerAt", triggerAt)
      .putString("$alarmId:label", label)
      .putString("$alarmId:repeatDays", repeatDays.joinToString(","))
      .putString("$alarmId:time", time)
      .putString("$alarmId:period", period)
      .putString("$alarmId:ringtone", ringtone)
      .apply()
  }

  private fun scheduleFromValues(
    alarmId: String,
    triggerAt: Long,
    label: String,
    repeatDays: List<String>,
    time: String,
    period: String,
    ringtone: String
  ) {
    persistAlarm(alarmId, triggerAt, label, repeatDays, time, period, ringtone)
    scheduleExact(reactContext, alarmId, triggerAt, label, repeatDays, time, period, ringtone)
  }

  private fun removePersistedAlarm(alarmId: String) {
    val ids = getPersistedIds().minus(alarmId)
    reactContext.getSharedPreferences(ALARM_PREFS, Context.MODE_PRIVATE)
      .edit()
      .putStringSet("alarm_ids", ids)
      .remove("$alarmId:triggerAt")
      .remove("$alarmId:label")
      .remove("$alarmId:repeatDays")
      .remove("$alarmId:time")
      .remove("$alarmId:period")
      .remove("$alarmId:ringtone")
      .apply()
  }

  private fun getPersistedIds(): Set<String> {
    return reactContext.getSharedPreferences(ALARM_PREFS, Context.MODE_PRIVATE)
      .getStringSet("alarm_ids", emptySet())
      .orEmpty()
  }

  companion object {
    fun scheduleExact(
      context: Context,
      alarmId: String,
      triggerAtMillis: Long,
      label: String,
      repeatDays: List<String>,
      time: String,
      period: String,
      ringtone: String
    ) {
      val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
      val pendingIntent = buildPendingIntent(context, alarmId, label, repeatDays, time, period, ringtone)

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        alarmManager.setExactAndAllowWhileIdle(
          AlarmManager.RTC_WAKEUP,
          triggerAtMillis,
          pendingIntent
        )
      } else {
        alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent)
      }
    }

    fun cancelScheduled(context: Context, alarmId: String) {
      val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
      alarmManager.cancel(buildPendingIntent(context, alarmId))
    }

    private fun buildPendingIntent(
      context: Context,
      alarmId: String,
      label: String = "",
      repeatDays: List<String> = emptyList(),
      time: String = "",
      period: String = "",
      ringtone: String = "ringtone"
    ): PendingIntent {
      val intent = Intent(context, AlarmReceiver::class.java).apply {
        action = ACTION_FIRE_ALARM
        putExtra(EXTRA_ALARM_ID, alarmId)
        putExtra(EXTRA_ALARM_LABEL, label)
        putExtra(EXTRA_ALARM_REPEAT_DAYS, repeatDays.joinToString(","))
        putExtra(EXTRA_ALARM_TIME, time)
        putExtra(EXTRA_ALARM_PERIOD, period)
        putExtra(EXTRA_ALARM_RINGTONE, ringtone)
      }

      return PendingIntent.getBroadcast(
        context,
        abs(alarmId.hashCode()),
        intent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      )
    }
  }
}
