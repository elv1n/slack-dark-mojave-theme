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

function blueLog(info) {
  console.log(blue(`
${info}
`));
}

const systemType = os.type();
const dir = typesDir.hasOwnProperty(systemType) ? typesDir[systemType]() : null;
const RESOURCES = join(dir, 'resources');
const INTEROP_DIR = path.join(RESOURCES, 'resources/app.asar.unpacked/dist');
const REGEX_THEME = /document.addEventListener(([\S\s]*))/gmi;

const APP_TEMP = join(RESOURCES, 'temp.app.asar');
const FILES = {
  APP: join(RESOURCES, 'app.asar'),
  APP_TEMP,
  BUNDLE: join(APP_TEMP, 'dist/ssb-interop.bundle.js'),
  BACKUP: join(APP_TEMP, 'dist/interop_themed_backup.bundle.js')
};

const filePath = path.join(dir, INTEROP_DIR, 'ssb-interop.bundle.js');
const backupPath = path.join(dir, INTEROP_DIR, 'interop_themed_backup.js');

if (!dir) {
  log(red(`Cannot find directory for your system ${systemType}`))
}

function writeInterop(content) {
  try {
    fs.writeFileSync(filePath, content);
  }catch (e) {
    log(`Cannot write file ${filePath}`);
  }
}

function restoreBackUp() {
  if (fs.pathExistsSync(backupPath)) {
    fs.writeFileSync(filePath, fs.readFileSync(backupPath, 'utf-8'));
    console.log(blue(`Theme restored from backup`));
  } else {
    log(`Backup not found`)
  }
}

async function injectTheme() {
  if (! await fs.pathExists(FILES.BUNDLE)) {
    await fs.writeFile(FILES.BACKUP, fs.readFileSync(FILES.BUNDLE, 'utf-8'));
  }
  console.log(`
Backup saved and you will be able restore original theme with 'npx install-dark-theme --rollback'
`);
  const applyTheme = await fs.readFile(path.join(__dirname, 'applyTheme.txt'), 'utf-8');
  await fs.appendFile(FILES.BUNDLE, applyTheme);
  console.log(blue(`Theme successfully applied!`));
}

function rewriteContent(content) {
  try {
    fs.accessSync(backupPath, fs.constants.R_OK | fs.constants.W_OK);
    writeInterop(
      fs.readFileSync(backupPath, 'utf-8')
    );
    return injectTheme();
  } catch (e) {
    const match = content.match(REGEX_THEME);
    if (match.length) {
      const clearContent = content.replace(match[0], '');
      writeInterop(clearContent);
      return injectTheme();
    }
    if (options.force) {
      return injectTheme();
    }

    return log(`Previous theme content not found, but file contains DOMContentLoaded event.
You can add theme manually or run 'npx-install-dark-theme --force
    `)
  }
}

(async() => {
  spawn.sync('npx', ['asar', 'extract', FILES.APP, FILES.APP_TEMP]);
  if (!await fs.pathExists(FILES.BUNDLE)) {
    log(`Cannot find a file ${FILES.BUNDLE}.`)
  }

  try {
    await fs.access(FILES.BUNDLE, fs.constants.R_OK | fs.constants.W_OK);

    //// Restore backup with argument --rollback
    //if (options.rollback) {
    //  return restoreBackUp();
    //}

    //const content = await fs.readFile(FILES.BUNDLE, 'utf-8');
    // Check if anything runs on DOMContentLoaded
    // the same event will be used for applying theme
    //if(content.includes('DOMContentLoaded')) {
    //  rewriteContent(content);
    //} else {
    //  injectTheme();
    //}

    await injectTheme();
    spawn.sync('npx', ['asar', 'pack', FILES.APP_TEMP, FILES.APP]);
  } catch (e) {
    console.log(e);
    log(`Cannot get access to ${filePath}. Try with sudo or administrator power shell`)
  }
})();


