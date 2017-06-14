const CDP = require("chrome-remote-interface");
const chromeLauncher = require('lighthouse/chrome-launcher/chrome-launcher');
const SimpleHttpServer = require("./SimpleHttpServer/SimpleHttpServer.js");

let server = new SimpleHttpServer();

server.start(__dirname + "/..");

/**
 * Launches a debugging instance of Chrome.
 * @param {boolean=} headless True (default) launches Chrome in headless mode.
 *     False launches a full version of Chrome.
 * @return {Promise<ChromeLauncher>}
 */
async function launchChrome(headless = true) {
    return await chromeLauncher.launch({
    // port: 9222, // Uncomment to force a specific port of your choice.
        chromeFlags: [
            '--window-size=412,732',
            '--disable-gpu',
            headless ? '--headless' : ''
        ]
    });
}

/*launchChrome().then(async chrome => {
    const version = await CDP.Version({port: chrome.port});
    console.log(version['User-Agent']);

    chrome.kill();
});*/
