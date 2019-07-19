const fs = require('fs-extra');
const { join } = require('path');
const spawn = require('cross-spawn');
const { paths } = require('./_constants');

exports.extract = async () => {
  spawn.sync('npx', ['asar', 'extract', paths.APP, paths.APP_TEMP]);
};

exports.pack = async () => {
  spawn.sync('npx', ['asar', 'pack', paths.APP_TEMP, paths.APP]);
  //await fs.remove(paths.APP_TEMP);
};

const cleanTheme = async () => {
  const bundleContent = await fs.readFile(paths.BUNDLE, 'utf-8');
  await fs.writeFile(paths.BUNDLE, bundleContent.replace(paths.INJECT_REQ, ''));
};

exports.cleanTheme = cleanTheme;

exports.injectTheme = async (content) => {
  const bundleContent = await fs.readFile(paths.BUNDLE, 'utf-8');
  const isInstalled = bundleContent.includes(paths.INJECT_REQ);

  const injectPath = join(paths.APP_TEMP, 'dist', paths.INJECT_FILE);

  await fs.ensureFile(injectPath);
  await fs.writeFile(injectPath, content);
  if (!isInstalled) {
    await fs.appendFile(paths.BUNDLE, `
${paths.INJECT_REQ}  
  `);
  }
};
