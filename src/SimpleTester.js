const CDP = require("chrome-remote-interface");
const chromeLauncher = require('lighthouse/chrome-launcher/chrome-launcher');
const SimpleHttpServer = require("./SimpleHttpServer/SimpleHttpServer.js");
const chalk = require("chalk");

class SimpleTester {

    constructor(config) {
        this.webserverBase = config.webserverBase || __dirname;
        this.testFiles = config.testFiles || []; // must be relative to the webserverBase
        this.webserverOnly = config.webserverOnly;
        this.activeServer = null;
    }

    async run() {
        let server = new SimpleHttpServer();
        server.start(__dirname + "/..");

        console.log(`Test server running at http://${server.hostname}:${server.port}/`);

        this.activeServer = server;

        if(!this.webserverOnly) {
            let results = await this.runTests();

            console.log("Stopping test server...");
            this.activeServer.stop(function() {
                console.log("...test server stopped!");
            });

            return results;
        }
    }

    /**
     * Launches a debugging instance of Chrome.
     * @param {boolean=} headless True (default) launches Chrome in headless mode.
     *     False launches a full version of Chrome.
     * @return {Promise<ChromeLauncher>}
     */
    async launchChrome(headless = true) {
        return await chromeLauncher.launch({
        // port: 9222, // Uncomment to force a specific port of your choice.
            chromeFlags: [
                '--window-size=412,732',
                '--disable-gpu',
                headless ? '--headless' : ''
            ]
        });
    }

    async runTests() {
        let x, testFile, summary = {
            successes: 0,
            failures: 0
        };

        for(x = 0; x < this.testFiles.length; x++) {
            testFile = this.testFiles[x];

            let results = await this.runTest(testFile);

            summary.successes += results.passes;
            summary.failures += results.failures;
        }

        return summary;
    }

    runTest(testFilePath) {
        return new Promise(async (resolve, reject) => {
            const chrome = await this.launchChrome();
            const protocol = await CDP({port: chrome.port});

            // Extract the DevTools protocol domains we need and enable them.
            // See API docs: https://chromedevtools.github.io/devtools-protocol/
            const {Page, Runtime} = protocol;
            await Promise.all([Page.enable(), Runtime.enable()]);

            console.log(`\tRunning tests for ${testFilePath}`);
            const targetUrl = `http://${this.activeServer.hostname}:${this.activeServer.port}${this.testFiles[0]}`;

            Page.navigate({url: targetUrl});

            // Wait for window.onload before doing stuff.
            Page.loadEventFired(async () => {
                const js = "window.simpleHelper.test()";
                // Evaluate the JS expression in the page.
                const results = await Runtime.evaluate({expression: js, awaitPromise: true});
                const resultJSON = results.result.value;
                const result = JSON.parse(resultJSON);

                this.printTestResults(result);

                protocol.close();
                chrome.kill(); // Kill Chrome.

                resolve(result);
            });
        });
    }

    printTestResults(results) {
        let x, test;

        for(x = 0; x < results.tests.length; x++) {
            test = results.tests[x];

            let output = "";

            console.log(chalk.red(`\t\t${test.parent.name}: ${test.title} - ${test.success ? 'Success' : 'Failed'}`));
        }
    }

}

module.exports = SimpleTester;
