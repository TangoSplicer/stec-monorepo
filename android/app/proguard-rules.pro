# Capacitor registers plugins dynamically through reflection.
-keep class com.getcapacitor.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }
-keepclassmembers class * {
    @com.getcapacitor.PluginMethod <methods>;
}

# Preserve the SQLCipher and Capacitor Community SQLite interfaces used through native bridges.
-keep class com.getcapacitor.community.database.sqlite.** { *; }
-keep class net.sqlcipher.** { *; }
-dontwarn net.sqlcipher.**

# Preserve Cordova plugin entry points discovered at runtime.
-keep class org.apache.cordova.** { *; }
-keep class com.randdusing.bluetoothle.** { *; }

# These annotations are compile-time metadata referenced by the encrypted-preferences dependency.
-dontwarn javax.annotation.Nullable
-dontwarn javax.annotation.concurrent.GuardedBy
