const { join } = require('path');
const fs = require('fs-extra');
const { processFiles } = require('uglifycss');
const crypto = require('crypto');

const DIST = './dist';
const COPY = [
  'applyTheme.txt',
  'injectTheme.js',
  'README.md',
  'preview.png'
];

((async () => {
  const ugly = processFiles(['./style.css']);
  const cssFile = crypto.randomBytes(16).toString('hex') + '.css';
  await fs.ensureDir(DIST);
  await fs.emptyDir(DIST);
  await fs.writeFile(join(DIST, cssFile), ugly);
  //Support existing users
  await fs.writeFile(join(DIST, 'theme.css'), ugly);
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
    headers = {Access-Control-Allow-Origin = "*"}
  `)
})());
