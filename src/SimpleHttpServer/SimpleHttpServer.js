const http = require("http");
const fs = require("fs");
const mime = require('mime-types')

class SimpleHttpServer {

    constructor() {
        this.hostname = '127.0.0.1';
        this.port = 3000;
        this.baseDirectory = __dirname;

        this.server = null;
    }

    start(dirname = null) {
        if(dirname) {
            this.baseDirectory = dirname;
        }

        console.log(this.baseDirectory);

        this.server = http.createServer((req, res) => {
            this.requestRecieved(req, res);
        });

        this.server.listen(this.port, this.hostname, () => {
            console.log(`Server running at http://${this.hostname}:${this.port}/`);
        });
    }

    requestRecieved(req, res) {
        //res.statusCode = 200;
        //res.setHeader('Content-Type', 'text/plain');
        //res.end('Hello World\n');

        console.log(`url: ${req.url}`);

        const fileContents = this.loadFile(req.url);

        if(!fileContents) {
            res.statusCode = 400;
            res.end('');
            return;
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', fileContents.mime);
        res.end(fileContents.contents);
    }

    loadFile(path) {
        const finalPath = this.baseDirectory + path;

        if(!fs.existsSync(finalPath)) {
            return false;
        }

        const extension = this.getExtensionFromPath(finalPath);
        const mimeType = mime.lookup(extension);
        const fileContents = fs.readFileSync(finalPath).toString();

        return {
            contents: fileContents,
            mime: mimeType
        };
    }

    getExtensionFromPath(path) {
        const splitPath = path.split(".");

        return splitPath[splitPath.length - 1];
    }

}

module.exports = SimpleHttpServer;
