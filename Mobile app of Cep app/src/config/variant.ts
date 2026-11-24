// 'admin' APK -> admin portal only. 'user' APK -> member app only.
// Set via EXPO_PUBLIC_APP_VARIANT at build time (see eas.json profiles).
export const APP_VARIANT: 'admin' | 'user' =
  (process.env.EXPO_PUBLIC_APP_VARIANT || 'admin').toLowerCase() === 'user' ? 'user' : 'admin';
