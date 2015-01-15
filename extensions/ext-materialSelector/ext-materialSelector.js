/*
 * ext-materialSelector.js
 *
 * Proprietary software
 *
 * Copyright(c) 2014 Nicholas Kyriakides
 *
 *
 * Dependencies:
 * 1) jQuery
 * 2) Bootstrap
 * 3) svgcanvas.js
 * 4) This extension's CSS file

IMPORTANT NOTE: This extension does not conform at all to the guide for creating extensions for SVG-edit

-This extension is split in 5 sections

1) Defining extesion and jQuery helper function
2) Define global variables
3) Define static HTML elements needed for extension
4) Define functions needed for extension
5) Return object with ability to use svg-edit events


-----------------------
*/
"use strict";

// Section 1) Define extension --------------------------------------------------------------------------------------------------------------------------------------

methodDraw.addExtension("materialSelector", function(S) {
    var svgcontent = S.svgcontent,
        svgns = "http://www.w3.org/2000/svg",
        svgdoc = S.svgroot.parentNode.ownerDocument,
        svgCanvas = methodDraw.canvas,
        ChangeElementCommand = svgedit.history.ChangeElementCommand,
        addToHistory = function(cmd) {
            svgCanvas.undoMgr.addCommandToHistory(cmd);
        };
        $.fn.attachToPanelAfter = function(i) {
        if(i===0){i=1};
        i=i-1; 
        var elems = this.find('> *');
        if (elems.length > i) return elems.eq(i);
        else return this;}

// Section 2) Global variables --------------------------------------------------------------------------------------------------------------------------------------


var selMaterialColor;
//materials JSON holds the materials. 
var materialList = {
        "001": {    "category":"Plastics",
                    "colorName":"Weib",
                    "materialTxtrImg": "textures/weib.png",
                    "htmlColor": "#C5AC76"
        },
        "002": {
                    "category":"Plastics",
                    "colorName":"gelb",
                    "materialTxtrImg": "textures/gelb.png",
                    "htmlColor": "#584904"
        },
        "003": {    
                    "category":"Plastics",
                    "colorName":"grun",
                    "materialTxtrImg": "textures/grun.png",
                    "htmlColor": "#2ca32c"
        },
        "004": {    
                    "category":"Plastics",
                    "colorName":"rot",
                    "materialTxtrImg": "textures/rot.png",
                    "htmlColor": "#E0380B"
        },
        "005": {

                    "category":"Plastics",
                    "colorName":"schwarz",
                    "materialTxtrImg": "textures/schwarz.png",
                    "htmlColor": "#120E0B"
        },
        "006": {
                    "category":"Plastics",
                    "colorName":"pink",
                    "materialTxtrImg": "textures/pink.png",
                    "htmlColor": "#D95388"
        },
        "007": {
                    "category":"Plastics",
                    "colorName":"blau",
                    "materialTxtrImg": "textures/blau.png",
                    "htmlColor": "#0150C6"
        },
        "008": {    

                    "category":"Plastics",
                    "colorName":"gold",
                    "materialTxtrImg": "textures/gold.png",
                    "htmlColor": "#845B00"
        },
        "009": {

                    "category":"natur",
                    "colorName":"Weib",
                    "materialTxtrImg": "textures/natur.png",
                    "htmlColor": "#C7AC7D"
        }
}



// Section 3) Append necessary HTML elements (if it's a left-toolbar button define it according to svg-edit extension docs in return object.)------------------------

$('body').append("<div class='modal fade' id='materialModal' tabindex='-1' role='dialog' aria-labelledby='myModalLabel' aria-hidden='true'><div class='modal-dialog'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-dismiss='modal'><span aria-hidden='true'>&times;</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='myModalLabel'>Pallette</h4></div><div class='modal-body'><div class='materialContainer'></div></div><div class='modal-footer'><button type='button' class='btn btn-default' data-dismiss='modal'>Close</button><button type='button' class='btn btn-primary'>Switch Material</button></div></div></div></div>");
$('#tools_bottom').append("<div class='btn-group dropup '> <button type='button' class='btn btn-default dropdown-toggle materialInfoBtn' data-toggle='dropdown' aria-expanded='false'> Material <span class='caret'></span> </button> <ul class='dropdown-menu' role='menu'> <li><a href='#'>Acrylic Plastic</a></li><li><a href='#'>500x550mm</a></li><li><a href='#'>3mm thick</a></li><li class='divider'></li><li><a href='#'><button type='button' class='btn btn-info materialChangeBtn'>Switch Material</button></a></li></ul></div>");









//Section 4) Functions for extension-------------------------------------------------------------------------------------------------------------------------------



//Show the materials modal on page load
setTimeout(function() {
    $('#materialModal').modal('show');
}, 100);

$('.materialChangeBtn').click(function() { 

    $('#materialModal').modal('show');

});




//fill materials modal with JSON materials.
$.each(materialList, function(key, value) {
    selMaterialColor = value.colorName; //used for mailDesign.js - send the chosen color name to manufacturer - default is last color loaded
    var txtrImg = value.materialTxtrImg;
    var htmlColor = value.htmlColor;
    var materialName = value.colorName;
    var materialId = key.toString();
    $('.materialContainer').prepend("<div class='materialRect' style='background-image: url(extensions/ext-materialSelector/" + txtrImg + ")' data-materialId='" + materialId + "' data-html-color='" + htmlColor + "'><div class='materialInfo'>" + materialName + "</div></div>");
});

$('.materialRect').click(function() {
    var selMaterialId = $(this).attr('data-materialId');
    var htmlColor, materialCategory, materialColor;
    svgCanvas = methodDraw.canvas; //this might not be needed when this code gets formed as an extension.


    $.each(materialList, function(key, value) {

        if (key.toString() === selMaterialId) {

            materialColor = value.colorName;
            materialCategory = value.category;
            htmlColor = value.htmlColor;
            selMaterialColor = value.colorName;

        }

    });


    svgCanvas.setColor('fill', htmlColor, true);

    try { //Using try/catch statement because there might be no elements on the canvas, in which case selectAllInCurrentLayer will fail. I can't figure out a better way for this.
        svgCanvas.selectAllInCurrentLayer();
        svgCanvas.changeSelectedAttributeNoUndo('fill', htmlColor);

        setTimeout(function() {

            svgCanvas.clearSelection();

        }, 1); //clearSelection needs timeout for some reason to work properly otherwise the last element will be left selected.

    } catch (err) {
        console.log("No elements on canvas")
    }


    $('#materialBoxCategory').html(materialCategory);
    $('#materialBoxColor').html(materialColor);

    $('#materialModal').modal('hide');


});




// Section 5) Extension Return object----------------------------------------------------------------------------------------------------------------------------------
    return {
        name: "materialSelector",
        svgicons: "extensions/vectorText-icon.xml", //this is not needed since we don't need an icon but the extension throws error without it.

        /* Events are not needed in this extension

            zoomChanged: function(multiselected) {

                console.log("firing up a sample event, in this case zoomChanged.")

                return;
            }
        */
    }

});