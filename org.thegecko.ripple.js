// Adds a ripple effect to a canvas with an image
//
// Usage:
// new org.thegecko.ripple(<id of canvas>, <path to image>);

// From org.thegecko.utilities.js
Namespace("org.thegecko");

org.thegecko.ripple = (function() {

    var options = {
        dropRadius: 3,
        dropDepth: 1024,
        frameInterval: 20,
        damping: 5
    };

    var ctx;
    var width;
    var height;

    var imageData;
    var texture;

    var rippleBuffers = new Array(2);
    var rippleIndex = 0;

    var interval = 0;

    function init(canvasElement, imagePath, opts) {

        // Merge options
        if (opts) {
            for (var item in opts) {
                if (options[item]) {
                    options[item] = opts[item];
                }
            }
        }

        var img = new Image();

        img.onload = function() {
            width = img.width;
            height = img.height;

            var canvas = document.getElementById(canvasElement);
            canvas.width = width;
            canvas.height = height;

            ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
        
            rippleBuffers[0] = new Float32Array(width * height);
            rippleBuffers[1] = new Float32Array(width * height);

            texture = ctx.getImageData(0, 0, width, height);
            imageData = ctx.getImageData(0, 0, width, height);
            
            canvas.onmousemove = function(event) {
                addDrop(event.offsetX || event.layerX, event.offsetY || event.layerY);
            }
        }

        img.src = imagePath;
    }

    function addDrop(x, y) {
        for (var i = (y - options.dropRadius); i < (y + options.dropRadius); i++) {
            for (var j = (x - options.dropRadius); j < (x + options.dropRadius); j++) {
                if (j < 0 ||
                    i < 0 ||
                    j > (width-1) ||
                    i > (height-1)) continue;
                
                rippleBuffers[rippleIndex][(i * width) + j] += options.dropDepth;
            }
        }

        if (interval == 0) interval = setInterval(drawFrame, options.frameInterval);
    }

    function drawFrame() {
        var ripplesFound = createFrame();
        ctx.putImageData(imageData, 0, 0);

        if (interval && !ripplesFound) {
            clearInterval(interval);
            interval = 0;
        }
    }
        
    function createFrame() {
        var ripplesFound = false;
        var index;
        var data;

        var previousIndex = rippleIndex;
        rippleIndex = (rippleIndex + 1) % 2;

        var previousBuffer = rippleBuffers[previousIndex];
        var rippleBuffer = rippleBuffers[rippleIndex];

        for (var i=0; i < height; i++) {
            index = width*i;
            for (var j=1; j < width; j++) {
                index ++;

                // Voodoo :)
                data = (
                    previousBuffer[index-width] + 
                    previousBuffer[index-1] + 
                    previousBuffer[index+1] + 
                    previousBuffer[index+width]
                ) >> 1;

                // Subract value from 2 frames ago
                data -= rippleBuffer[index];
        
                // Damp effect so it disappears
                data -= data >> options.damping;

                // Did we find ripple data this time?
                if (data != 0) ripplesFound = true;
        
                // Only update if it has changed
                if (rippleBuffer[index] != data) {
                    rippleBuffer[index] = data;

                    // Render
                    refractPixel(i, j, data);
                }
            }
        }

        return ripplesFound;
    }

    function refractPixel(i, j, data) {
        data = (options.dropDepth*2) - data;

        var a = (((j - width) * data / (options.dropDepth*2)) << 0) + width;
        var b = (((i - height) * data / (options.dropDepth*2)) << 0) + height;

        // Set indexes
        var newPixel = (a + (b * width)) * 4;
        var curPixel = (j+(i*width)) * 4;

       // Apply values
        imageData.data[curPixel]     = texture.data[newPixel];
        imageData.data[curPixel + 1] = texture.data[newPixel + 1];
        imageData.data[curPixel + 2] = texture.data[newPixel + 2];
    }

    return init;
})();