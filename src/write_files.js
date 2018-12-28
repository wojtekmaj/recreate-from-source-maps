const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

module.exports = files => new Promise((resolve) => {
  Object.entries(files).forEach(([fileName, data]) => {
    const filePath = path.join('results', fileName);
    const fileDir = path.join(...filePath.split('/').slice(0, -1));
    if (!fs.existsSync(fileDir)) {
      mkdirp.sync(fileDir);
    }

    fs.writeFileSync(filePath, data);
  });

  resolve();
});
