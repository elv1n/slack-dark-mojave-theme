#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { options } = require('get-args')();
const { red, blue } = require("colorette");
const { paths, system } = require('./_constants');
const { log, pack, prepareToInject, injectTheme, cleanTheme } = require('./_helpers');

if (!system.dir) {
  log(red(`Cannot find directory for your system ${system.type}`))
}

const getTheme = async () => fs.readFile(path.join(__dirname, '..', 'static/applyTheme.txt'), 'utf-8');


(async() => {
  await prepareToInject();

  const content = await fs.readFile(paths.BUNDLE, 'utf-8');
  const isInstalled = content.includes(paths.INJECT_REQ);

  // Restore backup with argument --rollback
  if (options.rollback) {
    if (!isInstalled) {
      console.log(`Cannot find the theme to rollback.
  If dark theme still appears then reinstall Slack, please`);
      return;
    }
    await cleanTheme();
    console.log('Dark theme successfully removed!')
  }
  // check if theme already installed
  else if (isInstalled && !options.force) {
    console.log('Theme already installed');
  }
  // inject theme
  else {
    await injectTheme(await getTheme());
    console.log(blue(`Theme successfully applied!`));
    console.log(`You are able restore original theme by 'npx install-dark-theme --rollback'`);
  }

  await pack();
})();


