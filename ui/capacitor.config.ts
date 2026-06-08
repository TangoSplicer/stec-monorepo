import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.stec.daemon',
  appName: 'STEC',
  webDir: 'dist',
  bundledWebRuntime: false,
  android: {
    path: '../android'
  }
};

export default config;
