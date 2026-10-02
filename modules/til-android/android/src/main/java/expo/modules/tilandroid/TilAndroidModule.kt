package expo.modules.tilandroid

import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Process
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class TilAndroidModule : Module() {

    override fun definition() = ModuleDefinition {

        Name("TilAndroid")

        // ---------------------------------------------------------
        // Usage Access
        // ---------------------------------------------------------

        Function("isUsageAccessGranted") {
            val context = appContext.reactContext
                ?: return@Function false

            isUsageAccessGranted(context)
        }

        Function("openUsageAccessSettings") {
            val context = appContext.reactContext
                ?: return@Function

            val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }

            context.startActivity(intent)
        }

        // ---------------------------------------------------------
        // Display Over Other Apps
        // ---------------------------------------------------------

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
                ?: return@Function

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

        // ---------------------------------------------------------
        // Installed Apps
        // ---------------------------------------------------------

        Function("getInstalledApps") {
            val context = appContext.reactContext
                ?: return@Function emptyList<Map<String, Any?>>()

            getInstalledApps(context)
        }

        // ---------------------------------------------------------
        // Package existence
        // ---------------------------------------------------------

        Function("isPackageInstalled") { packageName: String ->
            val context = appContext.reactContext
                ?: return@Function false

            isPackageInstalled(context, packageName)
        }
    }

    private fun isUsageAccessGranted(context: Context): Boolean {
        val appOpsManager =
            context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager

        val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
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

    private fun getInstalledApps(
        context: Context
    ): List<Map<String, Any?>> {

        val packageManager = context.packageManager

        val intent = Intent(Intent.ACTION_MAIN).apply {
            addCategory(Intent.CATEGORY_LAUNCHER)
        }

        val resolveInfos = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            packageManager.queryIntentActivities(
                intent,
                PackageManager.ResolveInfoFlags.of(0)
            )
        } else {
            @Suppress("DEPRECATION")
            packageManager.queryIntentActivities(intent, 0)
        }

        return resolveInfos
            .mapNotNull { resolveInfo ->

                val applicationInfo = resolveInfo.activityInfo?.applicationInfo
                    ?: return@mapNotNull null

                val packageName = applicationInfo.packageName

                if (packageName == context.packageName) {
                    return@mapNotNull null
                }

                val appName = applicationInfo
                    .loadLabel(packageManager)
                    .toString()
                    .trim()

                if (appName.isBlank()) {
                    return@mapNotNull null
                }

                val iconResourceId = applicationInfo.icon

                mapOf<String, Any?>(
                    "packageName" to packageName,
                    "appName" to appName,
                    "iconResourceId" to iconResourceId
                )
            }
            .distinctBy { it["packageName"] as String }
            .sortedBy {
                (it["appName"] as String).lowercase()
            }
    }

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
        } catch (_: PackageManager.NameNotFoundException) {
            false
        }
    }
}