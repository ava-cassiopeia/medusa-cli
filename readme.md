# Medusa CLI

A simple library for running tests in a Chrome headless environment. No other
tools, webservers, etc., needed.

---

  - [Who is Medusa For?](#who-is-medusa-for)
  - [Installation](#installation)
  - [Setup Project Config](#setup-project-config)
  - [Creating a Test Harness](#creating-a-test-harness)
  - [Running Tests](#running-tests)
  - [CI Servers](#ci-servers)
   - [Travis CI](#travis-ci)
  - [medusa-config.js](#medusa-configjs)
    - [Output Styles](#output-styles)
  - [Modes and Options](#modes-and-options)
    - [Webserver Only Mode](#webserver-only-mode)
    - [Verbose Mode](#verbose-mode)

## Who is Medusa CLI For?

Medusa was primarily built for developers working on front-end modules or
web components. It provides a simple webserver and testing system using the
Chrome headless API and Mocha to test your front-end code.

Medusa is *not* intended to help perform tests in environments where a
custom webserver is needed/employed, as it was only meant to test front-end
code.

## Installation

Installing Medusa is as simple as installing it globally with NPM:

```CLI
npm i -g medusa-cli
```

And then, per project, installing Medusa in your project as a dev
dependency:

```CLI
npm i --save-dev medusa-cli
```

Once Medusa is installed, you need to provide a simple config file in your
project, and then you can start running tests. See
[Setup Project Config](#setup-project-config) for more information.

## Setup Project Config

In order for Medusa to function properly, you'll need to create the
`medusa-config.js` file in your project root. In that file, you'll need to
specify the webserver root, and what files to test.

Specific configuration documentation is provided [below](#medusa-configjs).

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
Medusa webserver to run from. `__dirname` in this case is an alias provided
by Node, which points to the current directory. In other words, this sets the
webserver root to project root.

Next, the `testFiles` array is a list of URLs (from your webserver base) for
Medusa to load and use as test harnesses.

For more information on test harnesses, see the
[Creating a Test Harness](#creating-a-test-harness) documentation.

## Creating a Test Harness

In order to run tests, you will need to make a "Test Harness", which is a fancy
term for a HTML file that contains your code, a basic page, and Mocha Javascript
tests to test your code in that page's environment.

You can create the HTML file anywhere in your project, and name it whatever you
want, you will just need to add it to the `testFiles` array in your Medusa
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

Then we'll add in the Mocha and Medusa resources, and your tests. This is
extremely similar to the standard Mocha setup for browser testing, just with a
little bit of help from the Medusa reporter.

```HTML
<!DOCTYPE html>

<html lang="en">
    <head>
        <title>Test HTML</title>

        <!-- Mocha resources -->
        <script type="text/javascript" src="/node_modules/mocha/mocha.js"></script>

        <link rel="stylesheet" type="text/css" href="/node_modules/mocha/mocha.css" />

        <!-- Medusa helper script -->
        <script type="text/javascript" src="/node_modules/medusa-cli/src/SimpleHelper/SimpleHelper.js"></script>
    </head>
    <body>
        <!-- This is where you'll put your own HTML for testing -->

        <!-- Medusa Setup + Mocha Start -->
        <script type="text/javascript">
            var simpleHelper = new SimpleHelper();

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

Assuming you've installed Medusa *and* you've setup your test harnesses and
Medusa config properly, you're ready to start running tests.

Tests can simply be run with the following command:

```CLI
medusa
```

And you will see a visual representation of your tests, including pass/fails.

## CI Servers

Medusa is built to work well with your existing CI server. It proper returns a
non-zero exit code when it quits and there are failing tests. See below for
specific setup guides for certain services.

### Travis CI

To get Medusa working on Travis CI, you'll need to start with the basic Node
config, then add the following configuration options:

```YML
dist: trusty # needs Ubuntu Trusty for Chrome compatibility reasons
addons:
  chrome: stable # needs Chrome for headless simulation
before_script:
  - npm i -g medusa-cli # need to install Medusa globally
```

In addition to globally installing Medusa, you'll need to use Ubunty Trusty
Tahr, as that works properly with the Lighthouse Chrome Launcher used by Medusa,
and of course, Chrome itself also needs to be installed.

As a quick reminder, remember that, by default, Travis CI runs `npm test`, so
make sure to have Medusa executing in that NPM command.

## medusa-config.js

This is the configuration file created per-project to control how Medusa
functions. It has a number of options, documented below. All the options should
be exported using Node's `module.exports`.

| Name | Key | Value | Required? | Description |
| ---- | --- | ----- | --------- | ----------- |
| Webserver Base | `webserverBase` | String | Yes | Path to the folder that will be used as the webserver root when testing. |
| Test Files | `testFiles` | Array<String> | Yes | A list of URLs (from the webserver base) that lead to test harness HTML files |
| Webserver Only | `webserverOnly` | Boolean | No | Defaults to false. If true, will just run the webserver without running tests. Useful for testing/debugging test harnesses |
| Symbols | `symbols` | Object | No | See [Output Styles](#output-styles) for more information |

### Output Styles

![Medusa Default Output Styles](https://user-images.githubusercontent.com/6314286/27716226-19a1b202-5cfa-11e7-8474-72b016dc95cf.png)<br />
*Pictured: Medusa default output styles*

In addition to the above configuration, the output style of Medusa's CLI
interface can also be somewhat modified to fit your needs. All of these
configuration options are optional, and available in the config under the
`symbols` property.

**Example:**

```Javascript
module.exports = {
    webserverBase: __dirname,
    testFiles: [
        "/html/index.html"
    ],
    symbols: {
        success: "👍",
        failure: "👎",
        tab: "  " // use 2-space tabs instead of the default 4-space tabs
    }
};
```

| Name | Key | Default Value | Description |
| ---- | --- | ------------- | ----------- |
| Success Icon | `success` | `✔` | The icon that appears next to successful tests |
| Failure Icon | `failure` | `✗` | The icon that appears next to failed tests |
| Tab String | `tab` | `[four spaces]` | The string used to represent one 'tab', used for indenting output. Defaults to 4 space characters |

## Modes and Options

The `medusa` CLI command has a few optional arguments/modes that can be
activated if needed, see below for more details.

### Webserver Only Mode

```CLI
medusa --webserver
```

If you just want to run the webserver portion of the Medusa CLI (for example,
for testing your Mocha tests), you can use the webserver flag to disable the
testing portion of medusa. Of course, press `[ctrl]-[c]` to stop the webserver
once you are finished.

### Verbose Mode

```CLI
medusa --verbose
```

Causes Medusa to print out more information about errors and what it's up to.

### Get Version

```CLI
medusa --version
```

Prints out the current version of the Medusa CLI.
