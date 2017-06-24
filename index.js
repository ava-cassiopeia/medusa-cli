#! /usr/bin/env node

const Medusa = require("./src/Medusa.js");
const chalk = require("chalk");

try {
    const configData = require(process.cwd() + "/medusa-config.js");

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

    process.exit(-1);
}
