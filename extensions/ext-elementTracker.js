/*
 * ext-elementTracker.js
 *
 * Proprietary software
 *
 * Copyright(c) 2014 Nicholas Kyriakides
 *
 *
 * Dependencies:
 * 1) jQuery
 * 2) svgcanvas.js

IMPORTANT NOTE: This extension does not conform at all to the guide for creating extensions for SVG-edit

-This extension is a context-menu addition - it's not  a tool per se. Because Method-Draw has custom input elements(touch draggables called drag-inputs),
 I created this extension which uses custom jQuery appends and the Method-Draw drag-input initializer to add the necessary HTML elements.
-The return option allows you to just set the panel where you want the tool to go, populate the configOptions object and you are good to go. 
-Remember not to remove the drag input append template, the drag-input initializer and the jQuery extension function for positioning.
Alter only the configOptions and the panel where you want to attach your extension's input.

Please use this template for adding context tools in Method-Draw from now on. The return object of this extension can be easily used as a template for any type
of input context tool. If used as template remember to include all necessary functions,variables,templates that are marked in this file with a ''Do not remove''


-----------------------

IMPORTANT NOTE!!: This extension uses a custom-method defined in svgcanvas.js I will add it here and you can paste it below moveSelectedElements method in src/svgcanvas.js

//Addition --MOVE THIS TO SVGCANVAS.JS-- - Used by ext-elementTracker.js to move single elements

this.moveSingleElement = function(elemToMove,dx, dy, undoable) {
    if (dx.constructor != Array) {
        dx /= current_zoom;
        dy /= current_zoom;
    }
    var undoable = undoable || true;
    var batchCmd = new BatchCommand("position");
    var i = selectedElements.length;
    var selected = elemToMove;
        if (selected != null) {
            
            var xform = svgroot.createSVGTransform();
            var tlist = getTransformList(selected);
            

            if (dx.constructor == Array) {

                xform.setTranslate(dx,dy);
            } else {

                xform.setTranslate(dx,dy);
            }

            if(tlist.numberOfItems) {
                tlist.insertItemBefore(xform, 0);
            } else {
                tlist.appendItem(xform);
            }
            
            var cmd = recalculateDimensions(selected);
            if (cmd) {
                batchCmd.addSubCommand(cmd);
            }
            
            selectorManager.requestSelector(selected).resize();
        }
    
    if (!batchCmd.isEmpty()) {
        if (undoable)
            addCommandToHistory(batchCmd);
        call("changed", selectedElements);
        return batchCmd;
    }
};

//End of addition


 */

"use strict";

methodDraw.addExtension("elementTracker", function(S) {
    var svgcontent = S.svgcontent,
        svgns = "http://www.w3.org/2000/svg",
        svgdoc = S.svgroot.parentNode.ownerDocument,
        svgCanvas = methodDraw.canvas,
        ChangeElementCommand = svgedit.history.ChangeElementCommand,
        addToHistory = function(cmd) {
            svgCanvas.undoMgr.addCommandToHistory(cmd);
        };

        


    var selectedElems = [];//This gets filled with selected elements on selectedChanged at the end of this file.




    //Debouncer utility function.
    function debouncer(func, timeout) {

        var timeoutID, slice = Array.prototype.slice,
            timeout = timeout || 500;
        return function() {
            var scope = this,
                args = arguments;
            clearTimeout(timeoutID);
            timeoutID = setTimeout(function() {
                func.apply(scope, slice.call(args));
            }, timeout);
        }

    }


    //Debounced firing from #tracking HTML input element.

    function debouncer_func(e) {
        trackElements();
    }


    //Returns average distance between multiselected elements. Used for displaying current tracking.

    function calcCurrentTrack() {
        var selItemsDimArray = [];
        for (var i = selectedElems.length - 1; i >= 0; i--) {

            //use function getStrokedBBox from svg_canvas.js to get positions and dimensions. 
            //TODO: the stroked bbox seems to be wrong. Font tracking=0 produces correct positioning but wrong rendered bboxes?

            var bb = svgCanvas.getStrokedBBox([selectedElems[i]]);

            selItemsDimArray.push({
                'examinedElem': selectedElems[i],
                'x': bb.x,
                'y': bb.y,
                'x2': (bb.x + bb.width),
                'y2': (bb.y + bb.height),
                'height': bb.height,
                'width': bb.width
            });
        };

        //Sort array starting from most left(use smallest x position)
        selItemsDimArray.sort(function(a, b) {
            return a.x - b.x;
        });

        return Math.round(selItemsDimArray[1].x) - Math.round(selItemsDimArray[0].x2);

    }


    //Return array of multiselected elements with calculated x,y,x2,y2,width,height properties. Most left item is first item in returned array.

    function calcTrackProperties() {


        //Define new empty array. We will copy here the multiselected elements but with some additional properties we need such as x2,y2
        var selItemsDimArray = [];

        //Push selected paths and their dimensions/positions from selectedElems
        for (var i = selectedElems.length - 1; i >= 0; i--) {

            //use function getStrokedBBox from svg_canvas.js to get positions and dimensions. 
            //TODO: the stroked bbox seems to be wrong. Font tracking=0 produces correct positioning but wrong rendered b-boxes?

            var bb = svgCanvas.getStrokedBBox([selectedElems[i]]);

            selItemsDimArray.push({
                'examinedElem': selectedElems[i],
                'x': bb.x,
                'y': bb.y,
                'x2': (bb.x + bb.width),
                'y2': (bb.y + bb.height),
                'height': bb.height,
                'width': bb.width
            });

        };

        //Sort array starting from most left(smallest x position)
        selItemsDimArray.sort(function(a, b) {
            return a.x - b.x;
        });

        return selItemsDimArray;
    }

    function trackElements() {

        //Finite-precision calculations. Precision is determined by the trackTolerance var. 
        var trackTolerance = 0.01;
        var compPrecision = 2; // Max 12, min 0. Highest values = high precision but slow performance.

        //Check if grouped and selected in which case use Ungroup from svg-canvas.js. DOES NOT WORK IN IE11

        try {
            for (var i = 0; i < selectedElems.length; i++) {
              if (selectedElems[i].parentElement.id !== "") {
                 svgCanvas.ungroupSelectedElement();
              }
         }
        }

        catch(err) {
            alert("Sorry, this tracking algorithm does not support IE yet. Ungroup your elements and try again!")
            console.log("Exception:Testing for grouped elements on IE does not work.")
            return;

        }

        //Get value from input element 
        var trackingAmount = parseInt($("#tracking").val());

        var elemsToTrack = calcTrackProperties();
        //Most left item does not move so define now a calc distance of 0

        elemsToTrack[0]['calcDistance'] = 0;

        //Calculate and push diff - diff is the distance of an element from the previous(next smallest x position)
        for (var i = 1; i < elemsToTrack.length; i++) {
            var current = elemsToTrack[i];
            var previous = elemsToTrack[i - 1];
            var diff = current.x - previous.x2;

            elemsToTrack[i]['diff'] = diff;

            //Handle negative diffs (e.g letter has negative spacing from previous)

            if (diff < 0) {

                elemsToTrack[i]['calcDistance'] = (trackingAmount + (-diff)) + elemsToTrack[i - 1].calcDistance
            } else {
                elemsToTrack[i]['calcDistance'] = (trackingAmount - diff) + elemsToTrack[i - 1].calcDistance
            };

        };

        //Check if element needs to actually move or not. If yes, move it - Use "calcDistance" calculated and pushed into each object earlier

        for (var i = 1; i < elemsToTrack.length; i++) {
            var aboutCompare = elemsToTrack[i].diff.toFixed(compPrecision);
            if (aboutCompare != trackingAmount) {

                //new function to move elements, defined in svg_canvas.js
                svgCanvas.moveSingleElement(elemsToTrack[i].examinedElem, elemsToTrack[i].calcDistance, 0, true);
            }
        }

        //Did the elements really reached their final position? If not - recalculate
        var average = 0;
        for (var i = 0; i < elemsToTrack.length; i++) {
            if (typeof elemsToTrack[i].diff !== 'undefined') {
                average = average + elemsToTrack[i].diff;
            };
        };
        average = average / (elemsToTrack.length - 1);

        //average is negative if tracking is negative. Handle it mofo.

        if (Math.abs(average - trackingAmount) > trackTolerance) {
            trackElements();
        }
    }




    return {
        name: "elementTracker",
        svgicons: "extensions/vectorText-icon.xml", //this is not needed since we don't need an icon but the extension throws error without it.
        callback: function(extElementPosition) {

              //jQuery extension function for positioning HTML elements in context menu - Do not remove/modify this if using this extension as template for new extensions
              $.fn.nthorfirst = function (path, i) {
              var elems = this.find(path);
              if (elems.length > i) return elems.eq(i);
              else return this;
              }

            //HTML element config options.
            var attachToPanel = 'selected_panel'; //Do not remove this if using this extension as template for new extensions. Just modify it accordingly
            var extElementConfig={extElementPosition :1,extElementId:'tracking',extElementTitle:'Tracking', extElementMin:-15, 
            extElementMax:15,extElementStep:1,callback:debouncer(debouncer_func, 250),extElementCursor:true}; //Config options for element. //Do not remove this if using this as template for new extensions. Just modify it accordingly

            //HTML append template for adding a drag-input type html elem. Do not remove/modify this if using this extension as template for new extensions with HTML elements of input type
            $('#'+attachToPanel).nthorfirst('> *',extElementConfig.extElementPosition).before("<label><input id='tracking'><span>"+extElementConfig.extElementTitle+"</span></label>");
            $('#'+extElementConfig.extElementId).dragInput({ //Initialize using MethodDraw drag input - position of tool in panel depends on extension loading order in index.html
                min: extElementConfig.extElementMin,
                max: extElementConfig.extElementMax,
                step: extElementConfig.extElementStep,
                callback: extElementConfig.callback,
                cursor: extElementConfig.extElementCursor
            }); //init a Method-draw drag input template. Do not remove/modify this if using this extension as template for new extensions
            
        },




        selectedChanged: function(multiselected) {


            if (multiselected.elems.length < 2) {
                $('#tracking').parent().css('display','none');
                return; //If only 1 item is selected do nothing. We only track 2 items or more.
            } else {

                $('#tracking').parent().css('display','block');

                selectedElems = multiselected.elems; // copy selected elements to selectedElems. When ''tracking'' input element changes fire the tracking.
            }


            return;
        }

    }

});