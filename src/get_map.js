const fs = require('fs');
const path = require('path');
const httpsGet = require('./https_get');

const getMap = url => new Promise((resolve) => {
  const mapFileName = url.split('/').pop();
  const mapPath = path.join('.tmp', mapFileName);
  httpsGet(url).then(data => fs.writeFileSync(mapPath, data));
  resolve(mapPath);
});

module.exports = getMap;
