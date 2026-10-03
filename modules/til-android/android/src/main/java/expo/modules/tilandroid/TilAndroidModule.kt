package expo.modules.tilandroid

import android.app.AppOpsManager
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Process
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.Calendar

class TilAndroidModule : Module() {

    override fun definition() = ModuleDefinition {

        Name("TilAndroid")

        // =========================================================
        // App blocking
        // =========================================================

        Function("setLockedApps") {
                lockedApps: List<String> ->

            LockRegistry.update(lockedApps)

            Unit
        }

        Function("isAccessibilityServiceEnabled") {
            val context = appContext.reactContext
                ?: return@Function false

            isAccessibilityServiceEnabled(context)
        }

        Function("openAccessibilitySettings") {
            val context = appContext.reactContext

            if (context != null) {
                runCatching {
                    context.startActivity(
                        Intent(
                            Settings.ACTION_ACCESSIBILITY_SETTINGS
                        ).apply {
                            addFlags(
                                Intent.FLAG_ACTIVITY_NEW_TASK
                            )
                        }
                    )
                }

                Unit
            }
        }

        // =========================================================
        // Usage Access
        // =========================================================

        Function("isUsageAccessGranted") {
            val context = appContext.reactContext
                ?: return@Function false

            isUsageAccessGranted(context)
        }

        Function("openUsageAccessSettings") {
            val context = appContext.reactContext

            if (context != null) {
                val intent = Intent(
                    Settings.ACTION_USAGE_ACCESS_SETTINGS
                ).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }

                context.startActivity(intent)
            }

            Unit
        }

        // =========================================================
        // Overlay Permission
        // =========================================================

        Function("isOverlayPermissionGranted") {
            val context = appContext.reactContext
                ?: return@Function false

            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
                true
            } else {
                Settings.canDrawOverlays(context)
            }
        }

        Function("openOverlaySettings") {
            val context = appContext.reactContext

            if (context != null) {
                val packageName = context.packageName

                val intent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    Intent(
                        Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                        Uri.parse("package:$packageName")
                    )
                } else {
                    Intent(Settings.ACTION_SETTINGS)
                }

                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)

                context.startActivity(intent)
            }

            Unit
        }

        // =========================================================
        // Installed Apps
        // =========================================================

        Function("getInstalledApps") {
            val context = appContext.reactContext
                ?: return@Function emptyList<Map<String, Any?>>()

            getInstalledApps(context)
        }

        // =========================================================
        // Package Existence
        // =========================================================

        Function("isPackageInstalled") { packageName: String ->
            val context = appContext.reactContext
                ?: return@Function false

            isPackageInstalled(
                context,
                packageName
            )
        }

        // =========================================================
        // TODAY'S USAGE FOR ONE APP
        // =========================================================

        Function("getTodayUsage") { packageName: String ->

            val context = appContext.reactContext
                ?: return@Function emptyMap<String, Any?>()

            getTodayUsage(
                context,
                packageName
            )
        }

        // =========================================================
        // TODAY'S USAGE FOR MULTIPLE APPS
        // =========================================================

        Function("getTodayUsageForPackages") {
            packageNames: List<String> ->

            val context = appContext.reactContext
                ?: return@Function emptyMap<String, Any?>()

            getTodayUsageForPackages(
                context,
                packageNames
            )
        }
    }

    // =============================================================
    // ACCESSIBILITY SERVICE (APP BLOCKING)
    // =============================================================

    private fun isAccessibilityServiceEnabled(
        context: Context
    ): Boolean {

        val expected =
            "${context.packageName}/" +
            TilAccessibilityService::class.java.name

        val enabled = Settings.Secure.getString(
            context.contentResolver,
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        ) ?: return false

        val splitter = enabled.split(':')

        for (entry in splitter) {
            if (
                entry.trim().equals(
                    expected,
                    ignoreCase = true
                )
            ) {
                return true
            }
        }

        return false
    }

    // =============================================================
    // USAGE ACCESS
    // =============================================================

    private fun isUsageAccessGranted(
        context: Context
    ): Boolean {

        val appOpsManager =
            context.getSystemService(
                Context.APP_OPS_SERVICE
            ) as AppOpsManager

        val mode =
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {

                appOpsManager.unsafeCheckOpNoThrow(
                    AppOpsManager.OPSTR_GET_USAGE_STATS,
                    Process.myUid(),
                    context.packageName
                )

            } else {

                @Suppress("DEPRECATION")
                appOpsManager.checkOpNoThrow(
                    AppOpsManager.OPSTR_GET_USAGE_STATS,
                    Process.myUid(),
                    context.packageName
                )
            }

        return mode == AppOpsManager.MODE_ALLOWED
    }

    // =============================================================
    // TODAY USAGE - SINGLE APP
    // =============================================================

    private fun getTodayUsage(
        context: Context,
        packageName: String
    ): Map<String, Any?> {

        if (!isUsageAccessGranted(context)) {
            return mapOf(
                "packageName" to packageName,
                "usageSeconds" to 0,
                "hasUsageAccess" to false,
                "startTimeMillis" to 0L,
                "endTimeMillis" to 0L,
                "queriedAtMillis" to System.currentTimeMillis()
            )
        }

        val usageStatsManager =
            context.getSystemService(
                Context.USAGE_STATS_SERVICE
            ) as UsageStatsManager

        val now = System.currentTimeMillis()

        val startOfDay = getStartOfTodayMillis()

        val usageStats = usageStatsManager.queryAndAggregateUsageStats(
            startOfDay,
            now
        )

        val stats = usageStats[packageName]

        val foregroundTimeMillis =
            stats?.totalTimeInForeground ?: 0L

        val usageSeconds =
            foregroundTimeMillis / 1000L

        return mapOf(
            "packageName" to packageName,
            "usageSeconds" to usageSeconds,
            "hasUsageAccess" to true,
            "startTimeMillis" to startOfDay,
            "endTimeMillis" to now,
            "queriedAtMillis" to now
        )
    }

    // =============================================================
    // TODAY USAGE - MULTIPLE APPS
    // =============================================================

    private fun getTodayUsageForPackages(
        context: Context,
        packageNames: List<String>
    ): Map<String, Any?> {

        if (!isUsageAccessGranted(context)) {
            return mapOf(
                "hasUsageAccess" to false,
                "startTimeMillis" to 0L,
                "endTimeMillis" to 0L,
                "queriedAtMillis" to System.currentTimeMillis(),
                "apps" to emptyList<Map<String, Any?>>()
            )
        }

        val usageStatsManager =
            context.getSystemService(
                Context.USAGE_STATS_SERVICE
            ) as UsageStatsManager

        val now = System.currentTimeMillis()

        val startOfDay = getStartOfTodayMillis()

        val usageStats =
            usageStatsManager.queryAndAggregateUsageStats(
                startOfDay,
                now
            )

        val apps = packageNames.map { packageName ->

            val stats = usageStats[packageName]

            val foregroundTimeMillis =
                stats?.totalTimeInForeground ?: 0L

            val usageSeconds =
                foregroundTimeMillis / 1000L

            mapOf<String, Any?>(
                "packageName" to packageName,
                "usageSeconds" to usageSeconds
            )
        }

        return mapOf(
            "hasUsageAccess" to true,
            "startTimeMillis" to startOfDay,
            "endTimeMillis" to now,
            "queriedAtMillis" to now,
            "apps" to apps
        )
    }

    // =============================================================
    // LOCAL DAY START
    // =============================================================

    private fun getStartOfTodayMillis(): Long {

        val calendar = Calendar.getInstance()

        calendar.set(
            Calendar.HOUR_OF_DAY,
            0
        )

        calendar.set(
            Calendar.MINUTE,
            0
        )

        calendar.set(
            Calendar.SECOND,
            0
        )

        calendar.set(
            Calendar.MILLISECOND,
            0
        )

        return calendar.timeInMillis
    }

    // =============================================================
    // INSTALLED APPS
    // =============================================================

    private fun getInstalledApps(
        context: Context
    ): List<Map<String, Any?>> {

        val packageManager =
            context.packageManager

        val intent =
            Intent(Intent.ACTION_MAIN).apply {
                addCategory(Intent.CATEGORY_LAUNCHER)
            }

        val resolveInfos =
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {

                packageManager.queryIntentActivities(
                    intent,
                    PackageManager.ResolveInfoFlags.of(0)
                )

            } else {

                @Suppress("DEPRECATION")
                packageManager.queryIntentActivities(
                    intent,
                    0
                )
            }

        return resolveInfos
            .mapNotNull { resolveInfo ->

                val applicationInfo =
                    resolveInfo.activityInfo?.applicationInfo
                        ?: return@mapNotNull null

                val packageName =
                    applicationInfo.packageName

                // Don't show TIL itself.
                if (packageName == context.packageName) {
                    return@mapNotNull null
                }

                val appName =
                    applicationInfo
                        .loadLabel(packageManager)
                        .toString()
                        .trim()

                if (appName.isBlank()) {
                    return@mapNotNull null
                }

                mapOf<String, Any?>(
                    "packageName" to packageName,
                    "appName" to appName,
                    "iconResourceId" to applicationInfo.icon
                )
            }
            .distinctBy {
                it["packageName"] as String
            }
            .sortedBy {
                (it["appName"] as String).lowercase()
            }
    }

    // =============================================================
    // PACKAGE EXISTENCE
    // =============================================================

    private fun isPackageInstalled(
        context: Context,
        packageName: String
    ): Boolean {

        return try {

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {

                context.packageManager.getApplicationInfo(
                    packageName,
                    PackageManager.ApplicationInfoFlags.of(0)
                )

            } else {

                @Suppress("DEPRECATION")
                context.packageManager.getApplicationInfo(
                    packageName,
                    0
                )
            }

            true

        } catch (
            _: PackageManager.NameNotFoundException
        ) {

            false
        }
    }
}