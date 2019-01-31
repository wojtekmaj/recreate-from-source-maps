const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

module.exports = (files, projectName) => new Promise((resolve) => {
  Object.entries(files).forEach(([fileName, data]) => {
    let safeFileName = fileName;
    while (safeFileName.startsWith('../')) {
      safeFileName = safeFileName.slice(3);
    }
    const filePath = path.join('results', projectName, safeFileName);
    const fileDir = path.dirname(filePath);
    if (!fs.existsSync(fileDir)) {
      mkdirp.sync(fileDir);
    }

    fs.writeFileSync(filePath, data);
  });

  resolve();
});
