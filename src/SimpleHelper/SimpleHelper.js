class SimpleHelper {

    constructor() {
        this.testState = {
            passes: 0,
            failures: 0,
            finished: false
        };

        // fix for Node modules in the browser
        if(!window.module) {
            window.module = {};
        }
    }

    reporter() {
        var self = this;

        return function(runner) {
            var helper = self;

            runner.on('pass', function(test) {
                helper.testState.passes += 1;
                console.log('pass: %s', test.fullTitle());
            });

            runner.on('fail', function(test, err) {
                helper.testState.failures += 1;
                console.log('fail: %s -- error: %s', test.fullTitle(), err.message);
            });

            runner.on('end', function() {
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
                resolve(JSON.stringify(this.testState));
            }

            // ...otherwise, let's keep track of that "resolve" function so we
            // can call it when the tests DO finish
            this.promiseResolver = resolve;
        });
    }

}
