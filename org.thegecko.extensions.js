// From http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
// Returns a more descriptive type for any object
Object.prototype.getType = function() {
    return ({}).toString.call(this).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
};

// Build chains of functions
// e.g.
//   a.extend(b);
//   a(); // calls a and then calls b after a returns
Function.prototype.extend = function(fn) {
    var self = this;
    return function() {
        self.apply(null, arguments);
        if (typeof(fn) === "function") {
            fn.apply(null, arguments);
        }
    }
};

// Builds embedded functions following a 'success function' callback pattern
// e.g.
//   a = a.decorate(b);
//   a = a.decorate(c);
//   a(); // calls c passing b, when b is executed it will pass a
Function.prototype.decorate = function(fn) {
    var self = this;
    return function() {
        fn(self);
    }
};

// Check if an array contains a specific element
Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) if (this[i] === obj) return true;
    return false;
};

// Returns true if a string starts with a particular character sequence
String.prototype.startsWith = function(str) {
    return (this.match("^" + str) == str);
};

// Returns true if a string ends with a particular character sequence
String.prototype.endsWith = function(str) {
    return (this.match(str + "$") == str);
};

// Strip trailing whitespace
String.prototype.trim = function(len) {
    var s = this.substring(0, len);
    return s.replace(/\s+$/, '');
};

// Returns shortened string with ellipses in middle
// Set end == true to have ellipses at end
// e.g.
//   "hello world".shorten(20) // = "hello world"
//   "hello world".shorten(9) // = "hello ..."
//   "hello world".shorten(9, true) // = "hel...rld"
String.prototype.shorten = function(len, end, ellipses) {
    if (this.length <= len) {
        return this;
    }
    end = end || false;
    ellipses = ellipses || "...";
    len -= ellipses.length;

    if (end) {
        return this.substr(0, len) + ellipses;
    } else {
        len /= 2;
        var begin = this.substr(0, len);
        var end = this.substr(this.length - len);
        return begin + ellipses + end;
    }
};

// Format a string
// e.g.
//   // Outputs "string: foo, float: 12.35, number: 23"
//   "string: {0}, float: {1:f}, number: {2:n}".format("foo", 12.345, 23.456);
String.prototype.format = function(){
    var regex = /\{([^\}]+)\}/g;
    var separator = ":";
    var args = arguments;
    // Support array of values passed in
    if (args[0].getType() == "array") {
        args = args[0];
    }
    return this.replace(regex, function(m, k) {
        var formatter = k.split(separator);
        var key = formatter.shift();
        if (typeof(args[key]) == "undefined") {
            return m;
        }
        var value = args[key];
        if (formatter[0]) {
            formatter = formatter.join(separator);
            if (formatter == "n" || formatter == "f" ) {
                value = value.toFixed((formatter == "f") ? 2 : 0);
            }
            // Extra formats to go here? Dates for example
        }
        return value;
    });
};

// Disable the right-click menu
Window.prototype.disableContextMenu = function() {
    this.oncontextmenu = function(event) {
        return false;
    };
};

// Disable scrolling
Window.prototype.disableScrolling = function() {
    this.onscroll = function(event) {
        this.scroll(0, 0);
    };
};

// Returns a JSON object of the query string
window.location.search.parse = function() {
    var result = {};
    this.toString().replace(/(?:\?|&)([^&=]*)=?([^&]*)/g, function($0, $1, $2) {
        if ($1) {
            result[$1] = $2 || true;
        }
    });
    return result;
};

// Returns a JSON object of the cookie
document.cookie.parse = function() {
    var result = {};
    this.replace(' ', '').replace(/(?:^|;)([^;=]*)=?([^;]*)/g, function($0, $1, $2) {
        if ($1) {
            result[$1] = $2 || true;
        }
    });
    return result;
};

// Makes an image greyScale
HTMLImageElement.prototype.greyScale = function() {
    var img = this;

    var ready = function() {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;        
        ctx.drawImage(img, 0, 0);
        
        var pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for(var y = 0; y < pixels.height; y++) {
            for(var x = 0; x < pixels.width; x++) {
                var i = (y * 4) * pixels.width + x * 4;
                var average = (pixels.data[i] + pixels.data[i + 1] + pixels.data[i + 2]) / 3;
                pixels.data[i] = average;
                pixels.data[i + 1] = average;
                pixels.data[i + 2] = average;
            }
        }

        ctx.putImageData(pixels, 0, 0);
        img.onload = null;
        img.src = canvas.toDataURL();
    };

    if (img.complete) ready();
    else img.onload = ready;
};