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

(async function() {

    const chrome = await launchChrome();
    const protocol = await CDP({port: chrome.port});

    // Extract the DevTools protocol domains we need and enable them.
    // See API docs: https://chromedevtools.github.io/devtools-protocol/
    const {Page, Runtime} = protocol;
    await Promise.all([Page.enable(), Runtime.enable()]);

    console.log("Here we go...");

    Page.navigate({url: 'http://127.0.0.1:3000/html/index.html'});

    // Wait for window.onload before doing stuff.
    Page.loadEventFired(async () => {
        const js = "window.simpleHelper.test()";
        // Evaluate the JS expression in the page.
        const result = await Runtime.evaluate({expression: js, awaitPromise: true});

        console.log("Result:");
        console.log(result.result.value);

        protocol.close();
        chrome.kill(); // Kill Chrome.
    });
})();
