const CDP = require("chrome-remote-interface");
const chromeLauncher = require('lighthouse/chrome-launcher/chrome-launcher');
const SimpleHttpServer = require("./SimpleHttpServer/SimpleHttpServer.js");
const chalk = require("chalk");

class Medusa {

    constructor(config) {
        this.webserverBase = config.webserverBase || __dirname;
        this.testFiles = config.testFiles || []; // must be relative to the webserverBase
        this.symbols = config.symbols || {};
        this.webserverOnly = config.webserverOnly;
        this.activeServer = null;
    }

    async run() {
        let server = new SimpleHttpServer();
        server.start(this.webserverBase);

        console.log(`Test server running at http://${server.hostname}:${server.port}/`);

        this.activeServer = server;

        if(!this.webserverOnly) {
            let results = null;

            try {
                results = await this.runTests();
            } catch(e) {
                console.log(e);
            }

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

            console.log(`${this.TAB_STRING}Running tests for ${testFilePath}`);
            const targetUrl = `http://${this.activeServer.hostname}:${this.activeServer.port}${this.testFiles[0]}`;

            Page.navigate({url: targetUrl});

            // Wait for window.onload before doing stuff.
            Page.loadEventFired(async () => {
                const js = "window.simpleHelper.test()";
                // Evaluate the JS expression in the page.
                const results = await Runtime.evaluate({expression: js, awaitPromise: true});

                if(results && results.result && results.result.subtype && results.result.subtype === 'error') {
                    reject(results.result);
                }

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
        for(let x = 0; x < results.suites.length; x++) {
            const suite = results.suites[x];

            this.printSuite(suite, 1);
        }
    }

    printSuite(suite, tabLevel = 0) {
        console.log("");
        console.log(chalk.bold(this.TAB_STRING.repeat(tabLevel) + suite.title));

        // print tests
        for(let t = 0; t < suite.tests.length; t++) {
            const test = suite.tests[t];

            this.printTest(test, tabLevel + 1);
        }

        // print sub-suites
        for(let s = 0; s < suite.suites.length; s++) {
            const subSuite = suite.suites[s];

            this.printSuite(subSuite, tabLevel + 1);
        }
    }

    printTest(test, tabLevel = 1) {
        const successful = test.state === 'passed';
        const error = test.actualError;

        let output = this.TAB_STRING.repeat(tabLevel);

        output += successful ? this.SUCCESS_SYMBOL : this.FAILURE_SYMBOL;

        output += ` ${test.title}`;

        if(!successful) {
            output += this.renderError(error, tabLevel + 1);
        }

        if(successful) {
            output = chalk.green(output);
        } else {
            output = chalk.red(output);
        }

        console.log(output);
    }

    renderError(error, tabLevel = 2) {
        const tabs = this.TAB_STRING.repeat(tabLevel);

        return chalk.italic(`\n${tabs}${error.name}: ${error.message}`);
    }

    get SUCCESS_SYMBOL() {
        return this.symbols.success || "✔";
    }

    get FAILURE_SYMBOL() {
        return this.symbols.failure || "✗";
    }

    get TAB_STRING() {
        return this.symbols.tab || "    ";
    }

}

module.exports = Medusa;
