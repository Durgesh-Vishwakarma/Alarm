package com.anonymous.SnapWake.alarm

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import com.anonymous.SnapWake.MainActivity

class AlarmActivity : MainActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
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

    routeIntentToAlarmAlert(intent)
    super.onCreate(savedInstanceState)
  }

  override fun onNewIntent(intent: Intent) {
    routeIntentToAlarmAlert(intent)
    super.onNewIntent(intent)
    setIntent(intent)
  }

  private fun routeIntentToAlarmAlert(intent: Intent?) {
    val alarmId = intent?.getStringExtra(EXTRA_ALARM_ID) ?: return
    intent.data = Uri.parse("snapwake://alarm-alert?id=$alarmId")
  }
}
