# Hephaestus

A simple library for running tests in a Chrome headless environment. No other
tools, webservers, etc., needed.

---

  - [Who is Hephaestus For?](#who-is-hephaestus-for)
  - [Installation](#installation)
  - [Setup Project Config](#setup-project-config)
  - [Creating a Test Harness](#creating-a-test-harness)
  - [Running Tests](#running-tests)
  - [hephaestus-config.js](#hephaestus-configjs)

## Who is Hephaestus For?

Hephaestus was primarily built for developers working on front-end modules or
web components. It provides a simple webserver and testing system using the
Chrome headless API and Mocha to test your front-end code.

Hephaestus is *not* intended to help perform tests in environments where a
custom webserver is needed/employed, as it was only meant to test front-end
code.

## Installation

Installing Hephaestus is as simple as installing it globally with NPM:

```CLI
npm i -g hephaestus
```

And then, per project, installing Hephaestus in your project as a dev
dependency:

```CLI
npm i --save-dev hephaestus
```

Once Hephaestus is installed, you need to provide a simple config file in your
project, and then you can start running tests. See
[Setup Project Config](#setup-project-config) for more information.

## Setup Project Config

In order for Hephaestus to function properly, you'll need to create the
`hephaestus-config.js` file in your project root. In that file, you'll need to
specify the webserver root, and what files to test.

Specific configuration documentation is provided [below](#hephaestus-configjs).

Here's an example config setup:

```Javascript
module.exports = {
    webserverBase: __dirname,
    testFiles: [
        "/html/test.html"
    ]
};
```

Let's break it down; the `webserverBase` property sets the base folder for the
Hephaestus webserver to run from. `__dirname` in this case is an alias provided
by Node, which points to the current directory. In other words, this sets the
webserver root to project root.

Next, the `testFiles` array is a list of URLs (from your webserver base) for
Hephaestus to load and use as test harnesses.

For more information on test harnesses, see the
[Creating a Test Harness](#creating-a-test-harness) documentation.

## Creating a Test Harness

In order to run tests, you will need to make a "Test Harness", which is a fancy
term for a HTML file that contains your code, a basic page, and Mocha Javascript
tests to test your code in that page's environment.

You can create the HTML file anywhere in your project, and name it whatever you
want, you will just need to add it to the `testFiles` array in your Hephaestus
config file.

First, create a basic HTML file, with the basic HTML boilerplate, something like
below:

```HTML
<!DOCTYPE html>

<html lang="en">
    <head>
        <title>Test HTML</title>
    </head>
    <body>
    </body>
</html>
```

Then we'll add in the Mocha and Hephaestus resources, and your tests. This is
extremely similar to the standard Mocha setup for browser testing, just with a
little bit of help from the Hephaestus reporter.

```HTML
<!DOCTYPE html>

<html lang="en">
    <head>
        <title>Test HTML</title>

        <!-- Mocha resources -->
        <script type="text/javascript" src="/node_modules/mocha/mocha.js"></script>

        <link rel="stylesheet" type="text/css" href="/node_modules/mocha/mocha.css" />

        <!-- Hephaestus helper script -->
        <script type="text/javascript" src="/node_modules/hephaestus/src/SimpleHelper/SimpleHelper.js"></script>
    </head>
    <body>
        <!-- This is where you'll put your own HTML for testing -->

        <!-- Hephaestus Setup + Mocha Start -->
        <script type="text/javascript">
            const simpleHelper = new SimpleHelper();

            mocha.setup({
                ui: "bdd",
                reporter: simpleHelper.reporter()
            });
        </script>
        <script type="text/javascript" src="/node_modules/browser-assert/lib/assert.js"></script>
        <!-- Your Testing Code -->
        <script type="text/javascript" src="/tests/test.js"></script>
        <script type="text/javascript">
            mocha.checkLeaks();
            mocha.run();
        </script>
    </body>
</html>
```

At this point, you're ready to run tests in your `/tests/test.js` file. Just
add in what HTML and/or JS you need in the page to run your tests, and you
should be ready to start running tests!

## Running Tests

Assuming you've installed Hephaestus *and* you've setup your test harnesses and
Hephaestus config properly, you're ready to start running tests.

Tests can simply be run with the following command:

```CLI
hephaestus
```

And you will see a visual representation of your tests, including pass/fails.

*Note:* For those of you using CI servers, the `hephaestus` CLI tool *does*
return a non-zero exit code when you don't have 100% passing tests, so it is
useable on tools like Travis.CI

## hephaestus-config.js

This is the configuration file created per-project to control how Hephaestus
functions. It has a number of options, documented below. All the options should
be exported using Node's `module.exports`.

| Name | Key | Value | Required? | Description |
| ---- | --- | ----- | --------- | ----------- |
| Webserver Base | `webserverBase` | String | Yes | Path to the folder that will be used as the webserver root when testing. |
| Test Files | `testFiles` | Array<String> | Yes | A list of URLs (from the webserver base) that lead to test harness HTML files |
| Webserver Only | `webserverOnly` | Boolean | No | Defaults to false. If true, will just run the webserver without running tests. Useful for testing/debugging test harnesses |
