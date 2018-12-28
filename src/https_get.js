const https = require('https');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

const httpsGet = (url, projectName) => new Promise((resolve, reject) => {
  const fileName = url.split('/').pop() || '___root___';
  const cachePath = path.join('.cache', projectName, fileName);
  const cacheDir = path.join(...cachePath.split('/').slice(0, -1));
  if (!fs.existsSync(cacheDir)) {
    mkdirp.sync(cacheDir);
  }
  // Find request in cache, if exists
  try {
    const cachedResponse = fs.readFileSync(cachePath, 'utf8');
    resolve(cachedResponse);
  } catch (err) {
    const urlObject = new URL(url);
    const options = {
      hostname: urlObject.hostname,
      path: urlObject.pathname,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
      },
    };

    https.get(options, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Request failed. Status code: ${res.statusCode}`));
        return;
      }

      res.setEncoding('utf8');
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        fs.writeFileSync(cachePath, body);
        resolve(body);
      });
    }).on('error', reject);
  }
});

module.exports = httpsGet;
