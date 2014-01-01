// Function to build a namespace
var Namespace = (function() {
    var buildGraph = function (parent, splitKey) {
        var key = splitKey.shift();
        if (parent[key] === undefined) eval("parent." + key + "={}");
        if (splitKey.length > 0) buildGraph(parent[key], splitKey);
    };

    return function(name, context) {
        context = context || window;
        buildGraph(context, name.split("."));
    }
})();

Namespace("org.thegecko.utilities");

org.thegecko.utilities = {

    // Fires of multiple asynchronous calls and executes
    // a function once they have all completed
    // e.g.
    //   var wait = new org.thegecko.utilities.AsyncWait(finishFn);
    //   functionA(wait.addCallback());
    //   functionB(wait.addCallback());
    //   wait.finish();
    AsyncWait: function(finishFn, errorFn) {
        var count = 0;
        var callbackAdded = false;
        this.addCallback = function(fn) {
            count++;
            callbackAdded = true;
            return function() {
                if (fn) {
                    fn.apply(null, arguments);
                }
                if (--count == 0 && finishFn) {
                    finishFn();
                }
            }
        };
        this.error = function() {
            if (errorFn) {
                errorFn.apply(null, arguments);
            }
            if (--count == 0 && finishFn) {
                finishFn();
            }
        };
        this.finish = function() {
            if (!callbackAdded && finishFn) {
                finishFn();
            }
        };
    },

    // Creates a queue of functions to be batch executed
    // once another function completes with specified arguments
    // e.g.
    //   var queue = new org.thegecko.utilities.AsyncQueue();
    //   queue.add(successFn1, failureFn1);
    //   queue.add(successFn2, failureFn2);
    //   // On success
    //   queue.success(args); // Calls successFn1 and successFn2 with args
    //   // On failure
    //   queue.failure(args); // Calls failureFn1 and failureFn2 with args
    AsyncQueue: function() {
        this._successMethods = [];
        this._failureMethods = [];
        this._response = null;
        this._flushed = false;
        this._success = false;
        this._failure = false;

        // adds callbacks to your queue
        this.add = function(successFN, failureFN) {
            if (this._flushed) {
                if (this._success) {
                    successFN.apply(null, this._response);
                }
                if (this._failure) {
                    failureFN.apply(null, this._response);
                }
            } else {
                this._successMethods.push(successFN);
                this._failureMethods.push(failureFN);
            }
        };

        // note: flush only ever happens once
        this.success = function() {
            if (this._flushed) {
                return;
            }
            this._response = arguments;
            this._flushed = true;
            this._success = true;
            while (this._successMethods[0]) {
                this._successMethods.shift().apply(null, arguments);
            }
        };

        this.failure = function() {
            if (this._flushed) {
                return;
            }
            this._response = arguments;
            this._flushed = true;
            this._failure = true;
            while (this._failureMethods[0]) {
                this._failureMethods.shift().apply(null, arguments);
            }
        };
    },

    // Strip all script from a block of html
    stripScript: function(html) {
        // script blocks
        html = html.replace(/<[^>]*script[^>]*>/gi, "");
        // node events
        html = html.replace(/<[^>]*[\s]on[^>]*>/gi, "");
        // other horrid things
        html = html.replace(/<[^>]*object[^>]*>/gi, "");
        html = html.replace(/<[^>]*embed[^>]*>/gi, "");
        html = html.replace(/<[^>]*iframe[^>]*>/gi, "");
        return html;
    }
};