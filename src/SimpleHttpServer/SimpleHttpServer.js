const http = require("http");
const File = require("./File.js");

class SimpleHttpServer {

    constructor(config = {}) {
        this.hostname = '127.0.0.1';
        this.port = 3000;
        this.baseDirectory = __dirname;
        this.verbose = typeof config.verbose !== 'undefined' ? config.verbose : false;

        this.server = null;
    }

    start(dirname = null) {
        if(dirname) {
            this.baseDirectory = dirname;
        }

        this.server = http.createServer((req, res) => {
            this.requestRecieved(req, res);
        });

        this.server.listen(this.port, this.hostname, () => {
            // do something on server boot here
        });
    }

    stop(callback) {
        this.server.close(callback);
    }

    requestRecieved(req, res) {
        this.log(`Requested: ${req.url}`);

        const file = this.loadFile(req.url);

        if(!file.exists()) {
            res.statusCode = 400;
            res.end('');

            this.log(`\tStatus: 400`);
            return;
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', file.mime);
        res.end(file.contents);

        this.log(`\tStatus: 200`);
    }

    loadFile(path) {
        const file = new File(path, this.baseDirectory);

        return file;
    }

    log(message) {
        if(this.verbose) {
            console.log(message);
        }
    }

}

module.exports = SimpleHttpServer;
