package com.anonymous.SnapWake.alarm

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.WindowManager
import com.anonymous.SnapWake.MainActivity

class AlarmActivity : Activity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    prepareLockScreenWindow()
    routeToMainActivity(intent)
    finish()
    overridePendingTransition(0, 0)
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    routeToMainActivity(intent)
    finish()
    overridePendingTransition(0, 0)
  }

  private fun prepareLockScreenWindow() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      setShowWhenLocked(true)
      setTurnScreenOn(true)
    } else {
      @Suppress("DEPRECATION")
      window.addFlags(
        WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
          WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
      )
    }

    window.addFlags(
      WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
        WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
    )
  }

  private fun routeToMainActivity(sourceIntent: Intent?) {
    val alarmId = sourceIntent?.getStringExtra(EXTRA_ALARM_ID) ?: return
    Log.i("SnapWakeAlarm", "activity.route alarmId=$alarmId")
    val intent = Intent(this, MainActivity::class.java).apply {
      action = Intent.ACTION_VIEW
      data = Uri.parse("snapwake://alarm-alert?id=$alarmId")
      flags = Intent.FLAG_ACTIVITY_NEW_TASK or
        Intent.FLAG_ACTIVITY_CLEAR_TOP or
        Intent.FLAG_ACTIVITY_SINGLE_TOP
    }
    startActivity(intent)
  }
}
