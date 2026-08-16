# Capacitor 7 Merge-Readiness Runtime Baseline

- Branch: `upgrade/capacitor-7`
- Commit: `085e60ae1049f6e01445457688ee3eb651178061`
- Remote branch commit: `085e60ae1049f6e01445457688ee3eb651178061`
- Working tree: clean
- Java: OpenJDK 21.0.11 with `javac`
- Android SDK: platform 35, build-tools 35.0.0, platform-tools 37.0.1
- Connected Android devices: none
- Configured Android Virtual Devices: none
- Debug APK SHA-256: `b2faf5232f9219dd47a1e08ef238c548c6c67f0b9c494b213677455a826b5c32`
- Unsigned release APK SHA-256: `c26037d71cdb3c39e492db8fe1767c2ec77ee5c9fd8d88cc318e8e5a226a2c11`

The sandbox has sufficient resources to build, but no connected Android device or configured AVD is available for runtime SQLCipher, Keystore, biometric, backup, or lifecycle validation. These tests remain blocked on a managed device/virtualized-CI runtime.
