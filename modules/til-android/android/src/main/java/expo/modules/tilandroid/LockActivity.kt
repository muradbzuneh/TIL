package expo.modules.tilandroid

import android.app.Activity
import android.graphics.Color
import android.os.Bundle
import android.util.TypedValue
import android.view.Gravity
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView

/**
 * Full screen shown when a locked app is opened.
 *
 * The UI is built in code so the native module stays
 * free of layout resources.
 */
class LockActivity : Activity() {

  override fun onCreate(
    savedInstanceState: Bundle?
  ) {
    super.onCreate(savedInstanceState)

    val packageName =
      intent?.getStringExtra(EXTRA_PACKAGE) ?: ""

    val label =
      intent?.getStringExtra(EXTRA_LABEL)
        ?: packageName

    val root = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL

      gravity = Gravity.CENTER

      setPadding(dp(28), dp(28), dp(28), dp(28))

      setBackgroundColor(
        Color.parseColor("#EEF3FB")
      )
    }

    val icon = TextView(this).apply {
      text = "\uD83D\uDD12"

      setTextSize(
        TypedValue.COMPLEX_UNIT_SP,
        44f
      )

      gravity = Gravity.CENTER
    }

    val title = TextView(this).apply {
      text = "Daily limit reached"

      setTextSize(
        TypedValue.COMPLEX_UNIT_SP,
        26f
      )

      setTextColor(
        Color.parseColor("#0F172A")
      )

      gravity = Gravity.CENTER
    }

    val body = TextView(this).apply {
      text =
        "$label is locked until your " +
        "usage resets at midnight."

      setTextSize(
        TypedValue.COMPLEX_UNIT_SP,
        16f
      )

      setTextColor(
        Color.parseColor("#475569")
      )

      gravity = Gravity.CENTER
    }

    val button = Button(this).apply {
      text = "Go back"

      setTextColor(
        Color.parseColor("#FFFFFF")
      )

      setBackgroundColor(
        Color.parseColor("#2F6BFF")
      )

      setOnClickListener {
        dismiss()
      }
    }

    root.addView(
      icon,
      LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.WRAP_CONTENT
      )
    )

    root.addView(
      title,
      LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.WRAP_CONTENT
      ).apply {
        topMargin = dp(18)
      }
    )

    root.addView(
      body,
      LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.WRAP_CONTENT
      ).apply {
        topMargin = dp(10)
      }
    )

    root.addView(
      button,
      LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        dp(56)
      ).apply {
        topMargin = dp(28)
      }
    )

    setContentView(root)
  }

  private fun dismiss() {
    val packageName =
      intent?.getStringExtra(EXTRA_PACKAGE)

    finishAndRemoveTask()

    // Bounce straight back home so the blocked app
    // does not resume behind this screen.
    if (packageName != null) {
      val home = android.content.Intent(
        android.content.Intent.ACTION_MAIN
      ).apply {
        addCategory(
          android.content.Intent.CATEGORY_HOME
        )

        addFlags(
          android.content.Intent.FLAG_ACTIVITY_NEW_TASK
        )
      }

      startActivity(home)
    }
  }

  private fun dp(value: Int): Int {
    return TypedValue.applyDimension(
      TypedValue.COMPLEX_UNIT_DIP,
      value.toFloat(),
      resources.displayMetrics
    ).toInt()
  }

  companion object {
    const val EXTRA_PACKAGE = "til_package"
    const val EXTRA_LABEL = "til_label"
  }
}
