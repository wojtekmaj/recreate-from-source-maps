const recreateFromSourceMaps = require('./src');

(async () => {
  await recreateFromSourceMaps('ocado-2020-03-22', 'https://www.ocado.com/browse');

  await recreateFromSourceMaps('myview-2019-08-19', 'https://myview.motorolasolutions.com');
})();
