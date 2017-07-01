#! /usr/bin/env node

const Medusa = require("./src/Medusa.js");
const ArgsManager = require("./src/ArgsManager.js");
const chalk = require("chalk");

/**
 * Automatically sorts and catalogs all args from when the command was run.
 */
const args = new ArgsManager();

/**
 * If they specified the version flag, we'll print out the version and then
 * quit.
 */
if(args.hasFlag("version")) {
    const packageData = require("./package.json");
    const version = packageData.version;

    console.log(`v${version}`);
    process.exit(0);
}

/**
 * Now to actually start Medusa. The try-catch block is to handle situations in
 * which the Medusa configuration file is not present.
 */
let configData = null;

try {
    configData = require(process.cwd() + "/medusa-config.js");
} catch(e) {
    console.log(chalk.red("Couldn't find medusa-config.js file!"));

    if(args.hasFlag("verbose")) {
        console.log(e);
    }

    process.exit(-1);
}

/**
 * Assuming we got the config information alright, let's move forward and
 * get Medusa rolling.
 */
if(args.hasFlag("webserver")) {
    configData.webserverOnly = true;
}

let tester = new Medusa(configData);

(async function() {
    let results = await tester.run();

    if(!results) {
        return;
    }

    if(results.failures > 0) {
        process.exit(-1);
    } else {
        process.exit(0);
    }
})();
