const IS_USER = process.env.EXPO_PUBLIC_APP_VARIANT === 'user';
const appJson = require('./app.json');

module.exports = {
  expo: {
    ...appJson.expo,
    name: IS_USER ? 'CEP APP' : 'Admin CEP',
    slug: 'mobile',
    icon: IS_USER ? './assets/cep_logo.png' : './assets/icon_admin.png',
    ios: {
      ...appJson.expo.ios,
      bundleIdentifier: IS_USER ? 'com.cephuye.app' : 'com.cephuye.admin',
    },
    android: {
      ...appJson.expo.android,
      package: IS_USER ? 'com.cephuye.app' : 'com.cephuye.admin',
      adaptiveIcon: {
        ...appJson.expo.android.adaptiveIcon,
        foregroundImage: IS_USER ? './assets/cep_logo.png' : './assets/icon_admin.png',
      },
    },
    scheme: IS_USER ? 'cepapp' : 'admincep',
    extra: {
      ...appJson.expo.extra,
      eas: {
        projectId: '6bd2326b-2e44-40a7-a2db-f9e5483c1ab4',
      },
    },
  },
};
