#! /usr/bin/env node

const Hephaestus = require("./src/Hephaestus.js");
const chalk = require("chalk");

try {
    const configData = require(process.cwd() + "/hephaestus-config.js");

    let tester = new Hephaestus(configData);

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
    console.log(chalk.red("Couldn't find hephaestus-config.js file!"));

    process.exit(-1);
}
