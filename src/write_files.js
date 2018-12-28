const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

module.exports = (files, projectName) => new Promise((resolve) => {
  Object.entries(files).forEach(([fileName, data]) => {
    const filePath = path.join('results', projectName, fileName);
    const fileDir = path.join(...filePath.split('/').slice(0, -1));
    if (!fs.existsSync(fileDir)) {
      mkdirp.sync(fileDir);
    }

    fs.writeFileSync(filePath, data);
  });

  resolve();
});
