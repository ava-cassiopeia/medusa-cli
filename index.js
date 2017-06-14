const SimpleTester = require("./src/SimpleTester.js");

try {
    const configData = require(process.cwd() + "/simple-tester-config.js");

    let tester = new SimpleTester(configData);

    tester.run();
} catch(e) {
    console.log("Couldn't find config file!");
    console.log(e);

    process.exit(-1);
}
