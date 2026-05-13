package com.anonymous.SnapWake.alarm

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

// Minimal persistence for alarms so boot events can reschedule them.
object AlarmStore {
  private const val PREFS_NAME = "snapwake_alarms"
  private const val KEY_ALARMS = "alarms"
  private const val KEY_ACTIVE_ALARM_ID = "active_alarm_id"
  private const val KEY_ACTIVE_ALARM = "active_alarm"

  fun save(context: Context, alarm: AlarmInfo) {
    val list = load(context).toMutableList()
    val filtered = list.filterNot { it.alarmId == alarm.alarmId }.toMutableList()
    filtered.add(alarm)
    persist(context, filtered)
  }

  fun remove(context: Context, alarmId: String) {
    val filtered = load(context).filterNot { it.alarmId == alarmId }
    persist(context, filtered)
  }

  fun load(context: Context): List<AlarmInfo> {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val raw = prefs.getString(KEY_ALARMS, "[]") ?: "[]"
    val array = JSONArray(raw)
    val result = mutableListOf<AlarmInfo>()

    for (i in 0 until array.length()) {
      val item = array.optJSONObject(i) ?: continue
      result.add(fromJson(item))
    }

    return result
  }

  fun setActiveAlarmId(context: Context, alarmId: String) {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    prefs.edit().putString(KEY_ACTIVE_ALARM_ID, alarmId).apply()
  }

  fun setActiveAlarm(context: Context, alarm: AlarmInfo) {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    prefs.edit()
      .putString(KEY_ACTIVE_ALARM_ID, alarm.alarmId)
      .putString(KEY_ACTIVE_ALARM, toJson(alarm).toString())
      .apply()
  }

  fun getActiveAlarmId(context: Context): String? {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    return prefs.getString(KEY_ACTIVE_ALARM_ID, null)
  }

  fun getActiveAlarm(context: Context): AlarmInfo? {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val raw = prefs.getString(KEY_ACTIVE_ALARM, null) ?: return null
    return try {
      fromJson(JSONObject(raw))
    } catch (_: Exception) {
      null
    }
  }

  fun clearActiveAlarm(context: Context) {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    prefs.edit()
      .remove(KEY_ACTIVE_ALARM_ID)
      .remove(KEY_ACTIVE_ALARM)
      .apply()
  }

  private fun persist(context: Context, alarms: List<AlarmInfo>) {
    val array = JSONArray()
    alarms.forEach { array.put(toJson(it)) }

    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    prefs.edit().putString(KEY_ALARMS, array.toString()).apply()
  }

  private fun toJson(alarm: AlarmInfo): JSONObject {
    return JSONObject().apply {
      put("alarmId", alarm.alarmId)
      put("triggerAtMs", alarm.triggerAtMs)
      put("label", alarm.label)
      put("time", alarm.time)
      put("period", alarm.period)
      put("ringtone", alarm.ringtone)

      val repeats = JSONArray()
      alarm.repeatDays.forEach { repeats.put(it) }
      put("repeatDays", repeats)
    }
  }

  private fun fromJson(json: JSONObject): AlarmInfo {
    val repeats = json.optJSONArray("repeatDays") ?: JSONArray()
    val days = mutableListOf<String>()
    for (i in 0 until repeats.length()) {
      days.add(repeats.optString(i))
    }

    return AlarmInfo(
      alarmId = json.optString("alarmId"),
      triggerAtMs = json.optLong("triggerAtMs"),
      label = json.optString("label"),
      time = json.optString("time"),
      period = json.optString("period"),
      ringtone = json.optString("ringtone"),
      repeatDays = days,
    )
  }
}

data class AlarmInfo(
  val alarmId: String,
  val triggerAtMs: Long,
  val label: String,
  val time: String,
  val period: String,
  val ringtone: String,
  val repeatDays: List<String>,
)
