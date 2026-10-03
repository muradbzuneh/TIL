package expo.modules.tilandroid

import android.accessibilityservice.AccessibilityService
import android.content.Intent

/**
 * Watches which app is in the foreground and blocks
 * the ones that reached their daily limit.
 *
 * Blocking is done by starting [LockActivity]; when
 * that is dismissed the blocked app returns to the
 * foreground and this service blocks it again.
 */
class TilAccessibilityService :
  AccessibilityService() {

  override fun onServiceConnected() {
    super.onServiceConnected()
  }

  override fun onAccessibilityEvent(
    event: android.view.accessibility.AccessibilityEvent?
  ) {
    val eventType = event?.eventType

    if (
      eventType !=
      android.view.accessibility.AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED
    ) {
      return
    }

    val foreground =
      event?.packageName?.toString() ?: return

    // Never block TIL itself or the system UI.
    if (foreground == packageName) {
      return
    }

    if (
      foreground.startsWith("com.android.systemui") ||
      foreground == "android"
    ) {
      return
    }

    if (LockRegistry.isLocked(foreground)) {
      LockRegistry.markBlocked(foreground)

      val intent = Intent(
        this,
        LockActivity::class.java
      ).apply {
        addFlags(
          Intent.FLAG_ACTIVITY_NEW_TASK or
            Intent.FLAG_ACTIVITY_CLEAR_TASK or
            Intent.FLAG_ACTIVITY_NO_ANIMATION
        )

        putExtra(
          LockActivity.EXTRA_PACKAGE,
          foreground
        )

        putExtra(
          LockActivity.EXTRA_LABEL,
          LockRegistry.labelFor(foreground)
        )
      }

      startActivity(intent)
    }
  }

  override fun onInterrupt() {
  }
}
