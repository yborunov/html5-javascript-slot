/*jslint browser: true, nomen: true, unparam: true */
/*global Image: false */
(function () {
    'use strict';

    var // methods
        checkCanvas,
        initImages,
        getRandomElement,
        generateRandomElements,
        preRenderLine,
        drawSlots,
        reDrawLine,
        addTopElement,

        // variables and objects
        slotMachine = {},
        elements = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        elementsLoaded = [],
        elementsVisual = [],
        lineTimers = [],
        slotWidth = 73,
        slotHeight = 73,
        canvasContext = null,
        lineCmd = [],
        renderedLines = [];

    checkCanvas = function () {

        return !!document.createElement("canvas").getContext;
    };

    initImages = function (callback) {

        var countLoaded = 0,
            countLoaded2 = 0,
            i,
            elMax,
            loadImage;

        loadImage = function (type, imgIndex) {

            var image = new Image();

            image.src = "img" + ((type === 1) ? "" : "_blur") + "/" + elements[imgIndex].toString() + ".png";

            image.onload = (function () {

                elementsLoaded[imgIndex] = !elementsLoaded[imgIndex] ? [] : elementsLoaded[imgIndex];
                elementsLoaded[imgIndex][type - 1] = image;

                if (type === 1) {

                    countLoaded += 1;

                } else if (type === 2) {

                    countLoaded2 += 1;
                }

                if (countLoaded === countLoaded2 && countLoaded2 === elements.length) {

                    callback();
                }
            }());
        };

        for (i = 0, elMax = elements.length - 1; i <= elMax; i = i + 1) {

            loadImage(1, i); // type 1 = simple
            loadImage(2, i); // type 2 = blur
        }
    };

    getRandomElement = function () {

        var rndIndex = Math.floor(Math.random() * (elementsLoaded.length - 1));

        return elementsLoaded[rndIndex];
    };

    generateRandomElements = function () {

        var i, j, placeHolder;

        for (i = 1; i <= 5; i = i + 1) {

            placeHolder = [];

            for (j = 1; j <= 4; j = j + 1) {

                placeHolder.push(getRandomElement());
            }

            elementsVisual.push(placeHolder);
        }
    };

    preRenderLine = function (line, type) {

        var lineCanvas = document.createElement("canvas"),
            lineCanvasContext = lineCanvas.getContext("2d"),
            i,
            image;

        lineCanvas.width = slotWidth;
        lineCanvas.height = slotHeight * 4;

        for (i = 0; i <= 3; i += 1) {

            image = elementsVisual[line][i][type];

            lineCanvasContext.drawImage(image, 0, (i * slotHeight) + i);
        }

        renderedLines[line] = lineCanvas;
    };

    drawSlots = function (param) {

        var type = param ? 1 : 0,
            i;

        for (i = 0; i <= 4; i += 1) {

            preRenderLine(i, type);

            canvasContext.drawImage(renderedLines[i], (i * slotWidth), 0);
        }
    };

    reDrawLine = function (line, top) {

        var //end = (top >= slotHeight) ? 2 : 3,
            yAdd = top - slotHeight;

        canvasContext.drawImage(renderedLines[line], (line * slotWidth) + line, yAdd);
    };

    addTopElement = function (line) {

        elementsVisual[line].splice(elementsVisual[line].length - 1, 1);
        elementsVisual[line] = [].concat([getRandomElement()], elementsVisual[line]);
        preRenderLine(line, 1);
    };


    slotMachine.init = function () {

        canvasContext = document.getElementById("gameCanvas").getContext("2d");

        initImages(function () {

            var i,
                slowlyStopSlots;

            generateRandomElements();
            drawSlots(true);

            for (i = 0; i <= 4; i = i + 1) {

                slotMachine.startAnimateLine(i);
            }

            slowlyStopSlots = function (line) {

                return function () {
                    slotMachine.stopAnimateLine(line);
                };
            };

            for (i = 0; i <= 4; i = i + 1) {

                setTimeout(slowlyStopSlots(i), (5000 + i * 2000));
            }
        });
    };

    slotMachine.startAnimateLine = function (myLine) {

        var topCount = 0;

        lineTimers[myLine] = setInterval(function () {

            if (lineCmd[myLine] && lineCmd[myLine] === "stop") {

                topCount = 0;
                preRenderLine(myLine, 0);
                reDrawLine(myLine, topCount);

                clearInterval(lineTimers[myLine]);

                return true;
            }

            topCount += 10;

            if (topCount >= slotHeight) {

                addTopElement(myLine);
                topCount = 0;
            }

            reDrawLine(myLine, topCount);

        }, 20);
    };

    slotMachine.stopAnimateLine = function (line) {

        lineCmd[line] = "stop";

        if (lineCmd.length === 5) {

            document.getElementById("butAgain").style.display = "inline";
        }
    };

    slotMachine.reStart = function () {

        lineCmd = [];

        slotMachine.init();

        document.getElementById("butAgain").style.display = "none";
    };

    window.onload = function () {

        document.getElementById("notification").innerHTML = !checkCanvas() ? "Sorry! Your browser doesn't support canvas element!" : "";

        slotMachine.init();

        document.getElementById("butAgain").onclick = function () {

            slotMachine.reStart();
        };
    };
}());