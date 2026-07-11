import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kropk.shoutos',
  appName: 'KRO ShootOS',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
