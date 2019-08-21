const fs = require('fs-extra');
const { join } = require('path');
const { pack, prepareToInject, injectTheme } = require('./_helpers');


(async() => {
  await prepareToInject();

  const root = join(__dirname, '..');

  const devTheme = join(root, 'static/devTheme.txt');

  await injectTheme((await fs.readFile(devTheme, 'utf-8')).replace('%CURRENT_DIR%', root));

  await pack();
})();

