const Hephaestus = require("./src/Hephaestus.js");

try {
    const configData = require(process.cwd() + "/hephaestus-config.js");

    let tester = new Hephaestus(configData);

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
