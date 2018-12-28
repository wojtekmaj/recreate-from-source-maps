const fs = require('fs');
const _ = require('lodash');

const warnAboutSourceMapsWithoutSourcesContent = _.once(() => {
  console.warn('Source maps without sourcesContent are not supported');
});

module.exports = mapPath => new Promise((resolve) => {
  const textContent = fs.readFileSync(mapPath, 'utf8');
  const json = JSON.parse(textContent);

  // Extract all files
  const files = {};
  json.sources.forEach((rawSource, sourceIndex) => {
    if (!json.sourcesContent) {
      warnAboutSourceMapsWithoutSourcesContent();
      return;
    }

    const fileName = rawSource.split('///').pop();
    const data = json.sourcesContent[sourceIndex];

    files[fileName] = data;
  });

  resolve(files);
});
