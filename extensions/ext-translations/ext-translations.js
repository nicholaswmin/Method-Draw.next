//translations.js
"use strict";



/*
 * ext-translations.js
 *
 * Proprietary software
 *
 * Copyright(c) 2014 Nicholas Kyriakides
 *
 *
 * Dependencies:
 * 1) jQuery



IMPORTANT NOTE: This extension does not conform at all to the guide for creating extensions for SVG-edit

-This extension is split in 5 sections

1) Defining extesion and jQuery helper function
2) Define global variables
3) Define static HTML elements needed for extension
4) Define functions needed for extension
5) Return object with ability to use svg-edit events

 */
"use strict";


// Section 1) Define extension --------------------------------------------------------------------------------------------------------------------------------------

methodDraw.addExtension("translations", function(S) {
    var svgcontent = S.svgcontent,
        svgns = "http://www.w3.org/2000/svg",
        svgdoc = S.svgroot.parentNode.ownerDocument,
        svgCanvas = methodDraw.canvas,
        ChangeElementCommand = svgedit.history.ChangeElementCommand,
        addToHistory = function(cmd) {
            svgCanvas.undoMgr.addCommandToHistory(cmd);
        };
        $.fn.attachToPanelPosition = function(i) {
        if(i===0){i=1};
        i=i-1; 
        var elems = this.find('> *');
        if (elems.length > i) return elems.eq(i);
        else return this;
        }

// Section 2) Global variables --------------------------------------------------------------------------------------------------------------------------------------

window.onload = function(){
var translations = {de:{}};


translations.de.file_menu_btn = "Datei";
translations.de.edit_menu_btn = "Edit";
translations.de.object_menu_btn = "Objekt";
translations.de.view_menu_btn = "Ansicht";
translations.de.tool_export = "Export als PNG";
translations.de.tool_clone = "Duplizieren";
translations.de.tool_delete = "Löschen";

translations.de.tool_select = "Selektieren";
translations.de.tool_rect = "Rechteck";
translations.de.tool_ellipse = "Ellipse";
translations.de.tools_shapelib_show = "Symbole";
translations.de.tool_zoom = "Lupe";
translations.de.tool_vectorText = "Text";

translations.de.tool_posleft = "linksbündig";
translations.de.tool_poscenter ="zentrieren";
translations.de.tool_posright = "oben";
translations.de.tool_postop = "unten";
translations.de.tool_posmiddle = "rechtsbündig";
translations.de.tool_posbottom = "zentrieren";



translations.de.fontSelectorInstructions = "Wähle eine Schriftart und den gewünschten Text."
translations.de.placeFontBtn = "Text einfügen";
translations.de.cancelFontBtn = "abbrechen";

translations.de.mailOrderBtn = "Anfrage abschicken";
translations.de.mailOrderName = "Name";
translations.de.mailOrderEmail = "Email";
translations.de.mailOrderHowMany = "Stückzahl";
translations.de.mailOrderAddress = "Adresse";
translations.de.closeFormBtn = "Adresse";
translations.de.formSubmitBtn = "Anfrage abschicken";





// Section 3) Append necessary HTML elements (if it's a left-toolbar button define it according to svg-edit extension docs in return object.)------------------------






//Section 4) Functions for extension-------------------------------------------------------------------------------------------------------------------------------


for (var prop in translations["de"]) {
  var propertyName = prop;
  console.log(propertyName)

if($("#"+propertyName).attr('placeholder')){
$("#"+propertyName).attr('placeholder',translations["de"][propertyName]);

}

else if($("#"+propertyName).attr('title')){
$("#"+propertyName).attr('title',translations["de"][propertyName]);

}
else{
 $("#"+propertyName).html(translations["de"][propertyName]);
  // do something with your new propertyName
}
}

};










//Section 5) Extension Return object-----------------------------------------------------------------------------------------------------------------------------------

    return {
        name: "mailDesign",
        svgicons: "extensions/vectorText-icon.xml", //this is not needed since we don't need an icon but the extension throws error without it.

        /* //We dont need any events here so this is commented out.
        
         selectedChanged: function(multiselected) {
        console.log("firing up a sample event, in this case selectedChangeed")
             return;
         }

         */

    }

});