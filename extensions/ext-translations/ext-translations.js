//translations.js
"use strict";


var translations = {};


var translations.de;
translations.de.file = "Datei";
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








for (var property in translations) {
    if (translations.hasOwnProperty(property)) {
        console.log(property)
    }
}