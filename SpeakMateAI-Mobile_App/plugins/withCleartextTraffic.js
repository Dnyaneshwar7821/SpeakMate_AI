const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withCleartextTraffic(config) {
  console.log('[withCleartextTraffic] Config plugin loaded!');
  return withAndroidManifest(config, async (config) => {
    console.log('[withCleartextTraffic] Modifying AndroidManifest...');
    let androidManifest = config.modResults;
    let mainApplication = androidManifest.manifest.application[0];
    mainApplication.$['android:usesCleartextTraffic'] = 'true';
    console.log('[withCleartextTraffic] Modified application tag attributes:', JSON.stringify(mainApplication.$));
    return config;
  });
};
