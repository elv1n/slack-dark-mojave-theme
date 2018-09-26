
  
    
# Slack Dark Mojave Theme    
 A dark theme for slack inspired by Telegram desktop Dark Mojave theme.    
Tested on 3.3.1 version    
    
Project based on  [slack-black-theme](https://github.com/widget-/slack-black-theme). Thanks to [widget-](https://github.com/widget-) and contributors.  
# Preview    
![Screenshot](https://raw.githubusercontent.com/elv1n/slack-dark-mojave-theme/master/preview.png)
    
# Installing into Slack    
 **NB:** You'll have to do this every time Slack updates.    
    
### Option 1    
 Find your Slack's application directory.    
    
* Windows: `%homepath%\AppData\Local\slack\` * Mac: `/Applications/Slack.app/Contents/` * Linux: `/usr/lib/slack/` (Debian-based)    
    
For versions after and including `3.0.0` the same code must be added to the following file    
`resources/app.asar.unpacked/src/static/ssb-interop.js`    
 At the very bottom, add one    
    
```js    
// First make sure the wrapper app is loaded    
document.addEventListener("DOMContentLoaded", function() {    
    // Then get its webviews    
    const webviews = document.querySelectorAll(".TeamView webview");    
      
    // Fetch our CSS in parallel ahead of time    
    const cssPath = 'https://raw.githubusercontent.com/elv1n/slack-dark-mojave-theme/master/style.css';    
    const cssPromise = fetch(cssPath).then(response => response.text());    
    
    // Insert a style tag into the wrapper view  
    cssPromise.then(css => {  
      let s = document.createElement('style');  
      s.type = 'text/css';  
      s.innerHTML = css;  
      document.head.appendChild(s);  
    });  
    
    // Wait for each webview to load    
    webviews.forEach(webview => {    
      webview.addEventListener('ipc-message', message => {    
         if (message.channel == 'didFinishLoading')    
            // Finally add the CSS into the webview    
            cssPromise.then(css => {    
               const script = `    
                     let s = document.createElement('style');    
                     s.type = 'text/css';    
                     s.id = 'slack-dark-mojave-css';    
                     s.innerHTML = \`${css}\`;    
                     document.head.appendChild(s);    
                     `    
               webview.executeJavaScript(script);    
            })    
      });    
    });    
});    
```    
    
### Option 2    
 For local installation clone project    
`git clone https://github.com/elv1n/slack-dark-mojave-theme.git`    
 Change `filePath` to your folder    
    
```js    
document.addEventListener('DOMContentLoaded',  function  ()  {    
   const fs  =  require('fs');    
   const filePath  =  '<YOUR_PATH>/slack-dark-mojave-theme/style.css';    
   fs.readFile(filePath, { encoding: 'utf-8' }, function (err, data) {    
      if (err) return null;    
      const css  = document.createElement('style')    
      css.innerText  =  data;    
      document.head(css);    
   })    
});    
```    
    
That's it! Restart Slack and see how well it works.    
    
# TODO    
    
- [ ] Development manual    
 - [ ] npx script to execute theme into slack (if it's legal)    
    
# License    
 MIT