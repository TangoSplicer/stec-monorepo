# Capacitor 7 upgrade baseline

Commit: 4a33f3a75e2fceb96ef447fcf0d09b8f6681ab4c
Branch: upgrade/capacitor-7
Date: 2026-08-13T17:38:20Z

## UI dependency versions
crimegraph@1.0.0 /home/ubuntu/capacitor7-upgrade/ui
├── UNMET DEPENDENCY @aparajita/capacitor-biometric-auth@^8.0.2
├── UNMET DEPENDENCY @capacitor-community/sqlite@^6.0.0
├── UNMET DEPENDENCY @capacitor/android@^6.0.0
├── UNMET DEPENDENCY @capacitor/app@^6.0.0
├── UNMET DEPENDENCY @capacitor/camera@^6.0.0
├── UNMET DEPENDENCY @capacitor/cli@^6.2.1
├── UNMET DEPENDENCY @capacitor/core@^6.0.0
├── UNMET DEPENDENCY @capacitor/filesystem@^6.0.4
├── UNMET DEPENDENCY @capacitor/haptics@^6.0.0
├── UNMET DEPENDENCY @capacitor/ios@^6.0.0
├── UNMET DEPENDENCY @capacitor/preferences@^6.0.0
├── UNMET DEPENDENCY @capacitor/share@^6.0.0
├── UNMET DEPENDENCY @capacitor/status-bar@^6.0.0
├── UNMET DEPENDENCY @types/react-dom@^18.2.22
├── UNMET DEPENDENCY @types/react@^18.2.66
├── UNMET DEPENDENCY @types/sql.js@^1.4.11
├── UNMET DEPENDENCY @vitejs/plugin-react@^5.2.0
├── UNMET DEPENDENCY @vitest/coverage-v8@^4.1.10
├── UNMET DEPENDENCY autoprefixer@^10.4.0
├── UNMET DEPENDENCY capacitor-native-biometric@^4.2.2
├── UNMET DEPENDENCY cordova-plugin-bluetoothle@^6.7.4
├── UNMET DEPENDENCY cytoscape@^3.28.0
├── UNMET DEPENDENCY fake-indexeddb@^6.2.2
├── UNMET DEPENDENCY postcss@^8.4.0
├── UNMET DEPENDENCY react-dom@^18.3.0
├── UNMET DEPENDENCY react-router-dom@^7.18.2
├── UNMET DEPENDENCY react@^18.3.0
├── UNMET DEPENDENCY sql.js@^1.14.1
├── UNMET DEPENDENCY tailwindcss@^3.4.0
├── UNMET DEPENDENCY typescript@^5.2.2
├── UNMET DEPENDENCY vis-timeline@^7.7.0
├── UNMET DEPENDENCY vite@^8.2.1
├── UNMET DEPENDENCY vitest@^4.1.10
└── UNMET DEPENDENCY zustand@^4.5.0


## Native project versions
ext {
    minSdkVersion = 23
    compileSdkVersion = 35
    targetSdkVersion = 35
    androidxActivityVersion = '1.8.0'
    androidxAppCompatVersion = '1.6.1'
    androidxCoordinatorLayoutVersion = '1.2.0'
    androidxCoreVersion = '1.12.0'
    androidxFragmentVersion = '1.6.2'
    coreSplashScreenVersion = '1.0.1'
    androidxWebkitVersion = '1.9.0'
    junitVersion = '4.13.2'
    androidxJunitVersion = '1.1.5'
    androidxEspressoCoreVersion = '3.5.1'
    cordovaAndroidVersion = '10.1.1'

    // Required by the Capacitor Community SQLite plugin for encrypted native databases.
    capacitorCommunitySqliteIncludeSqlcipher = true
}
// Top-level build file where you can add configuration options common to all sub-projects/modules.

buildscript {

    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.6.1'
        classpath 'com.google.gms:google-services:4.4.0'

        // NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files
    }
}

apply from: "variables.gradle"

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-8.7-all.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists

## Capacitor config
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.stec.daemon',
  appName: 'STEC',
  webDir: 'dist',
  android: {
    path: '../android',
  },
  plugins: {
    CapacitorSQLite: {
      androidIsEncryption: true,
      androidBiometric: {
        biometricAuth: false,
        biometricTitle: 'Unlock local evidence store',
        biometricSubTitle: 'Authenticate to access encrypted case data',
      },
    },
  },
};

export default config;

## Baseline gates

Captured after clean runs on the upgrade branch. See the terminal evidence for individual exit codes.
