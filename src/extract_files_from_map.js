const fs = require('fs');

module.exports = mapPath => new Promise((resolve) => {
  const textContent = fs.readFileSync(mapPath, 'utf8');
  const json = JSON.parse(textContent);

  // Extract all files
  const files = {};
  json.sources.forEach((rawSource, sourceIndex) => {
    if (!json.sourcesContent) {
      console.warn('Source maps without sourcesContent are not supported');
      return;
    }

    const fileName = rawSource.split('///').pop();
    const data = json.sourcesContent[sourceIndex];

    files[fileName] = data;
  });

  resolve(files);
});
