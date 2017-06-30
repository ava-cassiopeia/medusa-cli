class SimpleHelper {

    constructor() {
        this.testState = {
            passes: 0,
            failures: 0,
            finished: false,
            tests: [],
            suites: null
        };

        // fix for Node modules in the browser
        if(!window.module) {
            window.module = {};
        }
    }

    serializeTest(test, wasSuccess, error) {
        if(wasSuccess) {
            this.testState.passes += 1;
        } else {
            this.testState.failures += 1;
        }

        this.testState.tests.push({
            success: true,
            title: test.title,
            state: test.state,
            duration: test.duration,
            type: test.type,
            parent: {
                name: test.parent.title,
                root: test.parent.root
            },
            error: error
        });

        if(wasSuccess) {
            console.log('pass: %s', test.fullTitle());
        } else {
            console.log('fail: %s -- error: %s', test.fullTitle(), error.message);
        }
    }

    reporter() {
        var self = this;

        return function(runner) {
            var helper = self;

            runner.on('pass', function(test) {
                helper.serializeTest(test, true, null);
            });

            runner.on('fail', function(test, err) {
                helper.serializeTest(test, false, err);

                test.actualError = {
                    name: err.name,
                    message: err.message
                };
            });

            runner.on('end', function() {
                helper.testState.suites = mocha.suite.suites;

                helper.testState.finished = true;
                console.log('end: %d/%d', helper.testState.passes, helper.testState.passes + helper.testState.failures);

                helper.notifyListener();
            });
        };
    }

    notifyListener() {
        if(this.promiseResolver) {
            this.promiseResolver(JSON.stringify(this.testState));
        }
    }

    test() {
        return new Promise((resolve, reject) => {
            // if the tests have already finished, just send them over immediately...
            if(this.testState.finished) {
                resolve(JSON.stringify(this.testState, function(key, value) {
                    // prevents circular references
                    if(key !== 'parent' && key !== 'ctx') {
                        return value;
                    } else {
                        return null;
                    }
                }));
            }

            // ...otherwise, let's keep track of that "resolve" function so we
            // can call it when the tests DO finish
            this.promiseResolver = resolve;
        });
    }

}
