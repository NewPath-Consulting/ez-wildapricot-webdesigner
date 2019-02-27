// Wild Apricot Text Manager Library
// v0.7

/* Change Log:
  v0.7 Add IE11 support
  v0.6 Add support for SCSS-style variables, fix bug in cookies
  v0.5 Add support for :after and :before pseudo-elements in CSS
  v0.4 Add support for dynamic menu CSS
  v0.3 Added CSS management and overlay to hide script behavior
  v0.2 Added alert for incorrect saved CSV file
  v0.1 Initial Release
*/

var list = [];
var array;
var scss_dict = {};
var data_url = "/resources/Theme/WildApricotTextManager/wildapricot-textmanager-config.csv";

$(document).ready(function () {

  console.log("[watm] Wild Apricot Text Manager loaded");

  // Set Defaults
  if (typeof textManagerDataURL != 'undefined')
    data_url = textManagerDataURL;
  if (typeof textManagerProductionMode == 'undefined')
    textManagerProductionMode = false;
  if (typeof textManagerMultilingualMode == 'undefined')
    textManagerMultilingualMode = false;
  if (typeof primaryLanguageButtonName == 'undefined')
    primaryLanguageButtonName = "English";
  if (typeof alterativeLanguageButtonName == 'undefined')
    alterativeLanguageButtonName = "Français";
  if (typeof alterativeLanguageClassName == 'undefined')
    alterativeLanguageClassName = ".french";
  if (typeof primaryLanguageClassName == 'undefined')
    primaryLanguageClassName = ".english";
  if (typeof languageButtonHtmlID == 'undefined')
    languageButtonHtmlID = "languageButton";
  
  // Multiligual Mode
  if (textManagerMultilingualMode)
    // Use Content Gadget if exists
    if ($('#languageButton').length)
      $('#languageButton').append('<div><button type="button" id="languageToggle">Toggle Second Language</button></div>');
    // Else show default language toggle
    else
      $('#mLayout').prepend('<div><button type="button" id="languageToggle">Toggle Second Language</button></div>');


  // Production Mode
  if (textManagerProductionMode) 
    setCookie('ReplaceText','True');
  // Development Mode
  else
    $('#mLayout').prepend('<div><button type="button" id="textToggle">Toggle Replacement Text</button></div>');

  // Set Cookie for English Text Replacement
  $('#textToggle').click(function() {
    if (getCookie('ReplaceText') == "True")
      setCookie('ReplaceText','False');
    else
      setCookie('ReplaceText','True');
    location.reload();
  });

  // Set Development Button Name
  if (getCookie('ReplaceText') == "True")
    $('#textToggle').text("Text Manager Disable");
  else
    $('#textToggle').text("Text Manager Enable");


  // Set Cookie for Second Language Replacement
  $('#languageToggle').click(function() {
    if (getCookie('SecondLanguage') == "True")
      setCookie('SecondLanguage','False');
    else
      setCookie('SecondLanguage','True');
    location.reload();
  });



  if (getCookie('SecondLanguage') == "True")
    $('#languageToggle').text(primaryLanguageButtonName); // "Second Language On"
  else
    $('#languageToggle').text(alterativeLanguageButtonName); // "Second Language Off"
 



  
// Load only if Formstack isn't detected.
if(!$('form.fsForm')[ 0 ])
{
  // Open file server side
  $.ajax({
    url: data_url,
    //url: newpath_data_url,
    async: true,
    success: function (csvd) {
      try {
        array = $.csv.toArrays(csvd);
      }
      catch (err) {
        alert(err.message + " Did you Save as .CSV UTF-8?");
      }
    },
    dataType: "text",
    complete: function () {
      arrayToStruct(array);
        if (getCookie('ReplaceText') == "True")
          list.map(replaceText);
    }

  });

}


});


// Page finished loading
$(window).bind("load", function() {
  $('#textmanager_overlay').css('display', 'none'); // Remove the white overlay
  
  // Trigger Wild Apricot's resizeMenu()
  if (detectIE()) { // IE 11
    var resizeEvent = window.document.createEvent('UIEvents'); 
    resizeEvent .initUIEvent('resize', true, false, window, 0); 
    window.dispatchEvent(resizeEvent);
  }
  else // All other browsers
    window.dispatchEvent(new Event('resize')); 

  if (getCookie('ReplaceText') == "True") 
    list.map(replaceText);    // Replace text again to rewrite event handlers for the hover in menu
  
});

function setCookie(key, value) {
  var expires = new Date();
  expires.setTime(expires.getTime() + (1 * 24 * 60 * 60 * 1000));
  document.cookie = key + '=' + value + ';path=/;expires=' + expires.toUTCString();
}

function getCookie(key) {
  var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
  return keyValue ? keyValue[2] : null;
}



function replaceText(data) {

  // Language Show/Hide Custom Content Block
  if (getCookie('SecondLanguage') == "True") {
    var replacement_text = data.second_language_text;
    $(alterativeLanguageClassName).show();
    $(primaryLanguageClassName).hide();
  }
  else {
    var replacement_text = data.english_text;
    $(alterativeLanguageClassName).hide();
    $(primaryLanguageClassName).show();
  }

  if (data.function == "hide")
    $(data.query).hide();
  
  // SCSS
  if (data.function.toLowerCase() == "scss") {
    var key, value;
    key = data.query.split('=')[0];   // String before =
    value = data.query.split('=')[1]; // String after =
    scss_dict[key] = value;
    console.log("[watm] SCSS Variable Added: " + key + "=" + value);
  }

  // Check to see if any replacement text in the column  
  if (replacement_text.length > 0) {

    // Delay these replacements by 1 second, and keep polling every second
    if (data.function == "delay") {
        //setTimeout(function(){ $(data.query).text(replacement_text);}, 1000);
        //delay_list.push(data);
        setInterval(function(){ $(data.query).text(replacement_text);}, 1000);
    }

    // Replace text on buttons
    if (data.function == "button")
      $(data.query).val(replacement_text);  

    // Replace text in search boxes
    if (data.function == "placeholder")
      $(data.query).attr("placeholder", replacement_text);  

    // Special function to replace substring after 1s delay
    // Used for shopping cart "Member price"
    if (data.function == "replace_delay") {
      setTimeout(function(){
        node = $(data.query)[ 0 ];
        if (node)
          node.innerText = node.innerText.replace(data.default_text, replacement_text);
      }, 1000);
    }

    // Search and replace
    if (data.function == "replace" || data.function == "replace_element")  {
      var begin_node = document.body;
      // Walk a subset of the DOM based on Query
      if (data.query.length > 0) {
          var query_array = data.query.split(" ");
          // Multiple Query
          if (query_array.length > 0) 
            for (query in query_array) {
              begin_node = $(query_array[query])[ 0 ]; // Get first DOM element
              if (begin_node)
                walkText(begin_node, data, replacement_text); 
            }
          // Single Query
          else  {
            begin_node = $(data.query)[ 0 ]; // Get first DOM element
            if (begin_node)
              walkText(begin_node, data, replacement_text); 
          }
      }
      // Empty Query so walk the whole page
      else
        walkText(begin_node, data, replacement_text); 
    }

    // Replace text on all other elements
    if (data.function == "text")
      $(data.query).text(replacement_text);

  }

  // CSS
  if (data.function != "inactive" && data.style.length > 0 && data.style[0] == '{') {
    try {
        
        // SCSS
        if (data.style.includes('$')) {
            var regex = /\$[a-zA-Z0-9_-]+/g;
            var keys = data.style.match(regex);
            for (c = 0; c < keys.length; c++) {
                var key = keys[c];
                var value = scss_dict[key];
                console.log("[watm] SCSS Debug " + c + " Key:" + key + " Value:" + value);
                data.style = data.style.replace(key, value);    
            }
          }
        
        
      if (data.query.includes(":before") || data.query.includes(":after")) // Pseudoelements 
        $('head').append("<style>" + data.query + data.style + "</style>");
      else if (data.function == "mouseover") // Hover
          $(data.query).each(function(){ $(this).mouseover(function(){ $(this).css(JSON.parse(data.style)); }); });
      else if (data.function == "mouseout") // End hover
          $(data.query).each(function(){ $(this).mouseout(function(){ $(this).css(JSON.parse(data.style)); }); });
      else
        $(data.query).css(JSON.parse(data.style));
    }
    catch(err) {
      console.log("[watm] Error Row " + data.row + " -- " + data.style);
      console.error(err);
    }
  }
}

  function walkText(node, data, text) {
    try {
      if (node.nodeType == 3) {
        if (node.data.search(data.default_text) > -1)
          if (data.function == "replace_element")
            node.data = text;
          else if (data.function == "replace")  
            node.data = node.data.replace(data.default_text, text);
      }
      if (node.nodeType == 1 && node.nodeName != "SCRIPT")
        for (var i = 0; i < node.childNodes.length; i++) 
          walkText(node.childNodes[i], data, text);
    }
    catch(err) {
        console.log("[watm] Error Row " + data.row + " -- " + data.default_text);
        console.error(err);
    }
}

function arrayToStruct(array) {
  for(var row in array) {
    var data = {
        container : array[row][0],
        default_text : array[row][1],
        english_text : array[row][2],
        second_language_text : array[row][3],
        note : array[row][4],
        function : array[row][5],
        query : array[row][6],
        style : array[row][7],
        row : row
      }
      list.push(data);
  }
}

// Adds IE 11 Support
if (!String.prototype.includes) {
  Object.defineProperty(String.prototype, 'includes', {
    value: function(search, start) {
      if (typeof start !== 'number') {
        start = 0
      }
      
      if (start + search.length > this.length) {
        return false
      } else {
        return this.indexOf(search, start) !== -1
      }
    }
  })
}

function detectIE() {
  var ua = window.navigator.userAgent;
  var msie = ua.indexOf('MSIE ');
  if (msie > 0) {
    // IE 10 or older => return version number
    return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
  }

  var trident = ua.indexOf('Trident/');
  if (trident > 0) {
    // IE 11 => return version number
    var rv = ua.indexOf('rv:');
    return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
  }
  
  // other browser
  return false;
}
