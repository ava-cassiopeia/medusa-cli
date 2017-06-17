const SimpleTester = require("./src/SimpleTester.js");

try {
    const configData = require(process.cwd() + "/simple-tester-config.js");

    let tester = new SimpleTester(configData);

    (async function() {
        let results = await tester.run();

        if(results.failures > 0) {
            process.exit(-1);
        } else {
            process.exit(0);
        }
    })();
} catch(e) {
    console.log("Couldn't find config file!");
    console.log(e);

    process.exit(-1);
}
