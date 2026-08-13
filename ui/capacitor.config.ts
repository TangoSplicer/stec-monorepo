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
