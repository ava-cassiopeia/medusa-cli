const fs = require("fs");
const mime = require('mime-types');

class File {

    constructor(path, relativeDirectory = __dirname) {
        this.fullPath = relativeDirectory + path;
        this.doesExist = false;
        this.mime = null;
        this.contentCache = null;

        this.setup();
    }

    setup() {
        if(!fs.existsSync(this.fullPath)) {
            this.doesExist = false;
            return;
        }

        this.doesExist = true;

        this.determineMime();
    }

    exists() {
        return this.doesExist;
    }

    determineMime() {
        const mimeType = mime.lookup(this.getExtensionFromPath());

        if(!mimeType) {
            return;
        }

        this.mime = mimeType;
    }

    getExtensionFromPath() {
        const splitPath = this.fullPath.split(".");

        return splitPath[splitPath.length - 1];
    }

    get contents() {
        if(this.contentCache) {
            return this.contentCache;
        }
        
        const fileContents = fs.readFileSync(this.fullPath);

        this.contentCache = fileContents;

        return fileContents;
    }

}

module.exports = File;
