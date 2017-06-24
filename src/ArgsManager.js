class ArgsManager {

    constructor() {
        this.argsArray = process.argv;
        this.flags = {};
        this.parameters = {};

        this.sort();
    }

    /**
     * Sorts the raw args into flags and arguments.
     */
    sort() {
        for(let x = 0; x < this.argsArray.length; x++) {
            const arg = this.argsArray[x];

            if(this.isFlag(arg)) {
                this.handleFlag(arg);
            } else if(this.isParameter(arg)) {
                this.handleParameter(arg, x);

                // It is assumed that the argument value follows the argument
                // itself, so we skip it.
                x += 1;
            }
        }
    }

    /**
     * Returns true if a flag with the specified name is present. A flag is an
     * argument with "--" in the front of it.
     *
     * @param {String} name the name of the flag, without the "--" at the front
     *
     * @returns {Boolean} true if the flag is present, or false otherwise
     */
    hasFlag(name) {
        return typeof this.flags[name] !== 'undefined' && this.flags[name];
    }

    /**
     * Returns true if a parameter with the specified name is present. A
     * parameter is an argument that has "-" in front of it, and is preceded by
     * a value.
     *
     * @param {String} name the name of the parameter, without the "-" at the
     * front
     *
     * @returns {Boolean} true if the parameter is present ,or false otherwise
     */
    hasParameter(name) {
        return typeof this.parameters[name] !== 'undefined'
            && this.parameters[name] != null;
    }

    /**
     * Gets the value of the specified parameter, assuming the parameter exists.
     *
     * @param {String} name the name of the parameter, without the "-" at the
     * front
     *
     * @returns {String|null} will return null if the parameter does not exist,
     * otherwise returns the string value of the parameter as specified in the
     * args.
     */
    getParameter(name) {
        if(!this.hasParameter(name)) {
            return null;
        }

        return this.parameters[name];
    }

    /**
     * Takes the raw flag string and performs the nessesary steps to add it to
     * the managed list of flags, including checking for duplicate flags.
     *
     * @param {String} arg the raw string argument that is considered a flag.
     * Does not check the validity of the flag.
     */
    handleFlag(arg) {
        const name = arg.replace(/^--/, "");

        if(this.flags[name]) {
            throw new Error(`The flag ${name} has already been specified.`);
        }

        this.flags[name] = true;
    }

    /**
     * Takes the raw argument string and performs the nessesary steps to add it
     * to the arguments list, including checking for duplicates and gathering
     * a value.
     *
     * @param {String} arg the raw string argument that is considered a
     * Parameter. Will not check the validity of the Parameter
     *
     * @param {Integer} index the index in the arguments array that the arg
     * param is located at; used to look forward for the value
     */
    handleParameter(arg, index) {
        const name = arg.replace(/^-/, "");
        const value = this.argsArray[index + 1];

        if(!value) {
            throw new Error(`The argument ${name} has no value.`);
        }

        if(this.parameters[name]) {
            throw new Error(`The argument ${name} has already been specified.`);
        }

        this.parameters[name] = value;
    }

    /**
     * Determines whether the specified string is a Parameter.
     *
     * @param {String} arg the argument to be checked
     *
     * @returns {Boolean} true if the arg is a Parameter, false otherwise
     */
    isParameter(arg) {
        return !!arg.match(/^-[a-z]*$/g);
    }

    /**
     * Determines whether the specified string is a Flag.
     *
     * @param {String} arg the argument to be checked
     *
     * @param {Boolean} true if the arg is a Flag, false otherwise
     */
    isFlag(arg) {
        return !!arg.match(/^--[(a-z)|-]*$/g);
    }

}

module.exports = ArgsManager;
