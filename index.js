#! /usr/bin/env node

const Medusa = require("./src/Medusa.js");
const ArgsManager = require("./src/ArgsManager.js");
const chalk = require("chalk");

const args = new ArgsManager();

try {
    const configData = require(process.cwd() + "/medusa-config.js");

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
} catch(e) {
    console.log(chalk.red("Couldn't find medusa-config.js file!"));

    if(args.hasFlag("verbose")) {
        console.log(e);
    }

    process.exit(-1);
}
