const { https } = require('follow-redirects');
const fs = require('fs');
const path = require('path');

const cacheDirectory = '.cache';

const httpsGet = (url, projectName) => new Promise((resolve, reject) => {
  const fileName = url.split('/').pop() || '___root___';
  const cachePath = path.join(cacheDirectory, projectName, fileName);
  const cacheDir = path.dirname(cachePath);
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
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
