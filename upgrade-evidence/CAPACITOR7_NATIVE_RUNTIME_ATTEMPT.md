# Capacitor 7 Native Runtime Attempt

An API 35 Google APIs x86_64 AVD named `cap7-api35-google` was provisioned and launched with software rendering and `-no-accel`. The emulator reached an initial ADB-visible state but repeatedly dropped offline and never reported `sys.boot_completed=1` during a four-minute wait.

The emulator log records TCG CPU feature limitations and a shutdown after the incomplete startup. No APK was installed, and no native runtime result is claimed from this attempt.

Consequently, the following remain blocked on a managed physical device or properly provisioned virtualized CI runtime: SQLCipher open and upgrade-in-place, wrong-key failure, Android Keystore security level, biometric prompt/cancellation, process death and background lock, backup/data-extraction behavior, and native Bluetooth/plugin lifecycle behavior.

This does not invalidate the completed build evidence: Capacitor Android sync passed, the debug and unsigned release APKs built successfully with a full JDK and constrained Gradle resources, and SQLCipher libraries were packaged for all four configured ABIs.
