package expo.modules.tilandroid

import java.util.concurrent.ConcurrentHashMap

/**
 * Lock state pushed from JavaScript.
 *
 * The accessibility service cannot read the SQLite
 * database, so TIL sends the locked package names
 * whenever the dashboard is rebuilt.
 */
object LockRegistry {

  private val packages: MutableSet<String> =
    ConcurrentHashMap.newKeySet()

  private val labels: MutableMap<String, String> =
    ConcurrentHashMap()

  @Volatile
  private var lastBlockedPackage: String? = null

  fun update(lockedPackages: List<String>) {
    packages.clear()
    labels.clear()

    lockedPackages.forEach { entry ->
      val parts = entry.split("|")

      if (parts.size >= 2) {
        packages.add(parts[0])
        labels[parts[0]] = parts[1]
      } else {
        packages.add(entry)
      }
    }
  }

  fun isLocked(packageName: String): Boolean =
    packages.contains(packageName)

  fun labelFor(packageName: String): String =
    labels[packageName] ?: packageName

  fun lastBlocked(): String? = lastBlockedPackage

  fun markBlocked(packageName: String) {
    lastBlockedPackage = packageName
  }

  fun clear() {
    packages.clear()
    labels.clear()
    lastBlockedPackage = null
  }
}
