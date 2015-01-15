/*
 * ext-mailDesign.js
 *
 * Proprietary software
 *
 * Copyright(c) 2014 Nicholas Kyriakides
 *
 *
 * Dependencies:
 * 1) jQuery
 * 2) JQuery UI
 * 3) canvg.js
 * 4) Mandrill Email provider - https://mandrillapp.com/docs/
 * 5) This extensions CSS file/s


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

methodDraw.addExtension("mailDesign", function(S) {
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
        else return this;
        }



// Section 2) Global variables --------------------------------------------------------------------------------------------------------------------------------------


    var mailDesignMaterialColor; //temp workaround - see ext-materialSelector.js - this var 'couples' that extension with this one. see this : https://github.com/nicholaswmin/Method-Draw.next/issues/5#issuecomment-64967450

    var manufacturerMailAddress = "frauschneize@googlemail.com"; //Manufacturer's mail.
    var mandrillApiKey = 'gpo5bJ5TVOIKa4p3F1CsEA';

    var mailHtml = "<p>Your order has been placed</p><p><strong>Material Name/Color: </strong>" + mailDesignMaterialColor + "</p>";
    var mailText = "Thank you for your order! You can find attached here an image of your ordered file!";
    var mailSubject = "Order placed from Laser Cut Studio, Dresden";
    var mailFromAddress = "lasercut-noreply@laser-noreply.com" //usually the same as manufacturerMailAddress above.
    var mailFromName = "Laser Cut Studio, Dresden"

    var noNameErrMsg = "Seems you forgot to type your name..";
    var noEmailErrMsg = "Seems you forgot to type your email address..";
    var wrongEmailErrMsg = "Make sure you are typing your email correctly.."
    var noHowManyErrMsg = "Seems you forgot to type your many pieces you need";
    var noAddressErrMsg = "Seems you forgot to type your address..";

    var sendingErrMsg = "We cannot send your message at this moment";

    var thanksMsg = "Thank you for your order!"
    var thanksMsg2 = "A nice and polite human will be contacting you soon about this design..Until then feel free to play around more"




// Section 3) Append necessary HTML elements (if it's a left-toolbar button define it according to svg-edit extension docs in return object.)------------------------


    //Template for adding a button - do not remove or modify this.
    $('#tools_top').append("<div id='placeOrderBtnWrapper' ><div class='orderBtn' id='mailOrderBtn'>Place Order</div></div>");

    //Appending a form as well. Specific to this extension only.
    $('body').append("<div id='form-main'><div id='form-div'><form class='form' id='form1'><p class='name'><input name='name' type='text' class='validate[required,custom[onlyLetter],length[0,100]] feedback-input' placeholder='Name' id='mailOrderName'/></p><p class='email'><input name='email' type='text' class='validate[required,custom[email]] feedback-input' id='mailOrderEmail' placeholder='Email'/></p><p class='howMany'><input name='howMany' type='text' class='validate[required,custom[email]] feedback-input' id='mailOrderHowMany' placeholder='How Many' value='1' disabled></p><p class='text'><textarea name='address' class='validate[required,length[6,300]] feedback-input' id='mailOrderAddress' placeholder='Address'></textarea></p><div id='mailOrderFormErrMsg' class='formErrMsg'></div><div class='submit'><div id='formSubmitBtn'>Send Order</div><div class='ease'></div></div></form><div id='thanksDiv'><div id='thanksMsg' class='thanksMsg'>" + thanksMsg + "</div><p id='thanksMsg2' class='thanksMsg2'>" + thanksMsg2 + "</p><div class='submit'><div id='thanksCloseBtn'>Continue</div><div class='ease'></div></div></div></div>");
    var spinner = $( "#mailOrderHowMany" ).spinner({min:1,max:200});//How many should be a spinner - using jQuery-UI
    //Appending a hidden canvas element as well - used by canvg for exporting a PNG - defined in extensions css file as display:none
    $('body').append("<canvas id='myCanvas' width='400px' height='200px' style='display:none'></canvas>");

    $( "#form-main" ).dialog({
      autoOpen: false,
      resizable: false,
      modal:true,
      width: "40%",
      minHeight:"550",
      show: {
        effect: "fade",
        duration: 500
      },
      hide: {
        effect: "fade",
        duration: 500
      }
    });




         






//Section 4) Functions for extension-------------------------------------------------------------------------------------------------------------------------------
    

    $('#mailOrderBtn').click(function() {
        $( "#form-main" ).dialog( "open" );
        resetForm();
    });


    $("#formSubmitBtn").click(function() {
        validate();
    });
    $("#thanksCloseBtn").click(function() {
        $( "#form-main" ).dialog( "close" );
    });









    //Check for empty fields. Validation util function
    function validateEmpty(str) {
        if ((/\S+/.test(str))) {
            return false;
        } else {
            return true;
        }
    }

    //Check for correct email format. Validation util function

    function validateEmail(emailAddress) {
        var sQtext = '[^\\x0d\\x22\\x5c\\x80-\\xff]';
        var sDtext = '[^\\x0d\\x5b-\\x5d\\x80-\\xff]';
        var sAtom = '[^\\x00-\\x20\\x22\\x28\\x29\\x2c\\x2e\\x3a-\\x3c\\x3e\\x40\\x5b-\\x5d\\x7f-\\xff]+';
        var sQuotedPair = '\\x5c[\\x00-\\x7f]';
        var sDomainLiteral = '\\x5b(' + sDtext + '|' + sQuotedPair + ')*\\x5d';
        var sQuotedString = '\\x22(' + sQtext + '|' + sQuotedPair + ')*\\x22';
        var sDomain_ref = sAtom;
        var sSubDomain = '(' + sDomain_ref + '|' + sDomainLiteral + ')';
        var sWord = '(' + sAtom + '|' + sQuotedString + ')';
        var sDomain = sSubDomain + '(\\x2e' + sSubDomain + ')*';
        var sLocalPart = sWord + '(\\x2e' + sWord + ')*';
        var sAddrSpec = sLocalPart + '\\x40' + sDomain; // complete RFC822 email address spec
        var sValidEmail = '^' + sAddrSpec + '$'; // as whole string

        var reValidEmail = new RegExp(sValidEmail);

        if (reValidEmail.test(emailAddress)) {
            return true;
        }

        return false;
    }

    //Call on Send order - validates and if OK call prepare order which prepares the order files and call the 2 Ajax emails calls
    function validate() {

        $("#popupFormErrMsg").html("");

        //Define Validation vars here and an IF below. That's it.

        var clientName = $('#mailOrderName').val();
        var clientMailAddress = $('#mailOrderEmail').val();
        var clientHowMany = $('#mailOrderHowMany').val();
        var clientAddress = $('#mailOrderAddress').val();

        if (validateEmpty(clientName)) {
            $("#mailOrderFormErrMsg").html(noNameErrMsg)
            return false;
        } else if (validateEmpty(clientMailAddress)) {
            $("#mailOrderFormErrMsg").html(noEmailErrMsg)
            return false;
        } else if (!validateEmail(clientMailAddress)) {
            $("#mailOrderFormErrMsg").html(wrongEmailErrMsg)
            return false;
        } else if (validateEmpty(clientHowMany)) {
            $("#mailOrderFormErrMsg").html(noHowManyErrMsg)
            return false;
        } else if (validateEmpty(clientAddress)) {
            $("#mailOrderFormErrMsg").html(noAddressErrMsg)
            return false;
        }

        prepareOrder(clientName, clientMailAddress, clientHowMany, clientAddress);
    }

    //Create PNG and SVG base64 files, create HTML to include in emails and call 2 different AJAX to email to both customer/manufacturer.
    function prepareOrder(clientName, clientMailAddress, clientHowMany, clientAddress) {
        var manufacturerMailHtml = "<p><strong>Customer Name:</strong> " + clientName + "</p><p><strong>Customer Email</strong>: " + clientMailAddress + "</p><p><strong>Number of copies:</strong> " + clientHowMany + "</p><p><strong>Customer Address: </strong>" + clientAddress + "</p><p><strong>Material Name/Color: </strong>" + mailDesignMaterialColor + "</p>";

        var exportedSVG = svgCanvas.svgCanvasToString();
        window.exportedSVG = exportedSVG;
        var svg = exportedSVG;
        var canvas = document.getElementById('myCanvas');
        canvg(canvas, svg, {
                renderCallback: function() {
                    var exportedPNG = canvas.toDataURL("image/png");
                    window.exportedPNG = exportedPNG;
                }
            })
            //Use utility function to encode string to B64.
        exportedSVG = window.btoa(exportedSVG);
        console.log(exportedSVG);

        //Trim off the first 22 characters which are the Base64 template ''words''. http://stackoverflow.com/questions/24068198/sending-images-in-mandrill
        exportedPNG = exportedPNG.replace(new RegExp("^.{0," + 22 + "}(.*)"), "$1");

        sendMailToManufacturer(exportedPNG, exportedSVG, manufacturerMailHtml);
        sendMailToClient(exportedPNG, clientMailAddress);

    }

    function sendMailToManufacturer(exportedPNG, exportedSVG, manufacturerMailHtml) {
        $.ajax({
                type: "POST",
                url: "https://mandrillapp.com/api/1.0/messages/send.json",
                data: {
                    'key': mandrillApiKey,
                    'message': {
                        "html": manufacturerMailHtml,
                        "text": mailText,
                        "subject": mailSubject,
                        "from_email": manufacturerMailAddress,
                        "from_name": mailFromName,
                        "to": [{
                            "email": manufacturerMailAddress,
                            "name": "Method-Draw.next Incoming Order",
                            "type": "to"
                        }],
                        "attachments": [{
                            "type": "image/svg+xml",
                            "name": "orderedPart.svg",
                            "content": exportedSVG
                        }],

                        "images": [{
                            "type": "image/png",
                            "name": "orderedPart.png",
                            "content": exportedPNG
                        }]
                    }
                }
            })
            .done(function(response) {
                successFailNotice('OK') // show success message

            })
            .fail(function(response) {
                successFailNotice("FAIL")
            });
        return false; // prevent page refresh
    };

    function sendMailToClient(exportedPNG, clientMailAddress) {
        $.ajax({
                type: "POST",
                url: "https://mandrillapp.com/api/1.0/messages/send.json",
                data: {
                    'key': mandrillApiKey,
                    'message': {
                        "html": mailHtml,
                        "text": mailText,
                        "subject": mailSubject,
                        "from_email": mailFromAddress,
                        "from_name": mailFromName,
                        "to": [{
                            "email": clientMailAddress,
                            "name": "Nikolas Kyriakides",
                            "type": "to"
                        }],

                        "images": [{
                            "type": "image/png",
                            "name": "orderedPart.png",
                            "content": exportedPNG
                        }]
                    }
                }
            })
            .done(function(response) {
                console.log('Send mail to client OK')

            })
            .fail(function(response) {
                alert('Error sending message.');
            });
        return false; // prevent page refresh
    };

    function successFailNotice(flag) {

        if (flag === "OK") {

            $("#form1").fadeOut();
            $("#thanksDiv").fadeIn();

        } else {

            $("#mailOrderFormErrMsg").html(sendingErrMsg);

        }

    }

    //Reset form util function.
    function resetForm() {
        $("#thanksDiv").fadeOut();
        $("#form1").fadeIn();
        $("#form1").find("input").val("");
        $("#mailOrderFormErrMsg").html("");
    }



//Section 5) Extension Return object----------------------------------------------------------------------------------------------------------------------------------

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