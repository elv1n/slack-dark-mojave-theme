const { join } = require('path');
const fs = require('fs-extra');
const { processFiles } = require('uglifycss');
const crypto = require('crypto');

const DIST = './dist';
const COPY = [
  'scripts',
  'static',
  'README.md',
  'preview.png'
];

((async () => {
  const ugly = processFiles(['./style.css']);
  const cssFile = crypto.randomBytes(16).toString('hex') + '.css';
  await fs.ensureDir(DIST);
  await fs.emptyDir(DIST);
  await fs.writeFile(join(DIST, cssFile), ugly);
  const pkg = await fs.readJSON('./package.json');
  await fs.writeJson(
    join(DIST, 'package.json'),
    {
      ...pkg,
      scripts: {},
      main: cssFile
    },
    {
      spaces: 2
    }
  );
  const copyMapper = async name => fs.copy(name, join(DIST, name));
  await Promise.all(COPY.map(copyMapper));
  await fs.writeFile('./netlify.toml', `
[[redirects]]
  from = "/"
  to = "/${cssFile}"
  status = 302
  force = true

[[headers]]
  for = "/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "/"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Cache-Control = "no-cache"
    Cache-Tag = "redirect, index-redirect"
    Last-Modified = "${(new Date()).toUTCString()}"
`)
})());
