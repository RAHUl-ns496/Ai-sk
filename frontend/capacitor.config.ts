import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.skinai.app',
  appName: 'Skin AI',
  webDir: 'dist',
  server: {
    androidScheme: "http",   // ***** REQUIRED *****
    cleartext: true,
    allowNavigation: ['*']
  }
};

export default config;
