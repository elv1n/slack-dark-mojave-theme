#!/usr/bin/env node

const os = require('os');
const fs = require('fs-extra');
const path = require('path');
const { options } = require('get-args')();
const { red, blue } = require("colorette");
const compareVersions = require('compare-versions');
const spawn = require('cross-spawn');

const { join } = path;
const isDirectory = source => fs.lstatSync(source).isDirectory();

const typesDir = {
  'Windows_NT': () => {
    const source = `${os.homedir()}/AppData/Local/slack/`;
    const APP_KEY = 'app-';
    const latestVersion = fs.readdirSync(source)
      .filter(name => isDirectory(path.join(source, name)))
      .filter(name => name.includes(APP_KEY))
      .map(name => name.replace(APP_KEY, ''))
      .sort((a, b) => compareVersions(b, a))[0];

    return `${source}/${APP_KEY}${latestVersion}`
  },
  'Darwin': () => '/Applications/Slack.app/Contents/',
  'Linux': () => '/usr/lib/slack/'
};

function log(info) {
  console.log(red(`
${info}
Feel free to send an issue https://github.com/elv1n/slack-dark-mojave-theme/issues
`));
  process.exit(0);
}

const systemType = os.type();
const dir = typesDir.hasOwnProperty(systemType) ? typesDir[systemType]() : null;
const RESOURCES = join(dir, 'resources');
const INTEROP_DIR = path.join(RESOURCES, 'resources/app.asar.unpacked/dist');

const APP_TEMP = join(RESOURCES, 'temp.app.asar');
const FILES = {
  APP: join(RESOURCES, 'app.asar'),
  APP_TEMP,
  BUNDLE: join(APP_TEMP, 'dist/ssb-interop.bundle.js'),
  BACKUP: join(APP_TEMP, 'dist/interop_themed_backup.bundle.js')
};

const INJECT_FILE = 'inject-theme.js';
const INJECT_REQ = `require('./${INJECT_FILE}');`;

if (!dir) {
  log(red(`Cannot find directory for your system ${systemType}`))
}

const getTheme = async () => fs.readFile(path.join(__dirname, 'applyTheme.txt'), 'utf-8');

async function injectTheme() {
  const injectPath = join(INTEROP_DIR, INJECT_FILE);

  await fs.ensureFile(injectPath);
  await fs.writeFile(injectPath, await getTheme());
  await fs.appendFile(FILES.BUNDLE, `
require('./${INJECT_FILE}');  
  `);
  console.log(blue(`Theme successfully applied!`));
  console.log(`You are able restore original theme by 'npx install-dark-theme --rollback'`);
}


(async() => {
  try {
    spawn.sync('npx', ['asar', 'extract', FILES.APP, FILES.APP_TEMP]);
    if (!await fs.pathExists(FILES.BUNDLE)) {
      log(`Cannot find a file ${FILES.BUNDLE}.`)
    }
    await fs.access(FILES.BUNDLE, fs.constants.R_OK | fs.constants.W_OK);

    const content = await fs.readFile(FILES.BUNDLE, 'utf-8');
    const isInstalled = content.includes(INJECT_REQ);

    // Restore backup with argument --rollback
    if (options.rollback) {
      if (!isInstalled) {
        console.log(`Cannot find the theme to rollback.
If dark theme still appears then reinstall Slack, please`);
        return;
      }
      await fs.writeFile(FILES.BUNDLE, content.replace(INJECT_REQ, ''));
      console.log('Dark theme successfully removed!')
    }
    // check if theme already installed
    else if (isInstalled) {
      console.log('Theme already installed');
    }
    // inject theme
    else {
      await injectTheme();
    }

    spawn.sync('npx', ['asar', 'pack', FILES.APP_TEMP, FILES.APP]);
    await fs.remove(FILES.APP_TEMP);
  } catch (e) {
    console.log(e);
    log(`Cannot get access to ${FILES.BUNDLE}. Try with sudo or administrator power shell`)
  }
})();


