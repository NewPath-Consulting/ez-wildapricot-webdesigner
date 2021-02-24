// Wild Apricot Text Manager Library
//
// Licensed under LGPL 3.0
// Contact NewPath Consulting for support at https://www.newpathconsulting.com/watm

var list = [];
var array;
var scss_dict = {};
var data_url = "/resources/Theme/WildApricotTextManager/wildapricot-textmanager-config.csv";
var watm_version = "0.91";

/* Polyfills */
if (!String.prototype.includes) {
  Object.defineProperty(String.prototype, "includes", {
    value: function (search, start) {
      if (typeof start !== "number") {
        start = 0;
      }

      if (start + search.length > this.length) {
        return false;
      } else {
        return this.indexOf(search, start) !== -1;
      }
    },
  });
}

/* App */
$(document).ready(function () {
  // Set Defaults
  textManagerProductionMode = !isInEditMode();
  if (typeof textManagerDataURL !== "undefined") {
    data_url = textManagerDataURL;
  }
  if (typeof textManagerMultilingualMode === "undefined") {
    textManagerMultilingualMode = false;
  }
  if (typeof primaryLanguageButtonName === "undefined") {
    primaryLanguageButtonName = "English";
  }
  if (typeof alterativeLanguageButtonName === "undefined") {
    alterativeLanguageButtonName = "Français";
  }
  if (typeof alterativeLanguageClassName === "undefined") {
    alterativeLanguageClassName = ".french";
  }
  if (typeof primaryLanguageClassName === "undefined") {
    primaryLanguageClassName = ".english";
  }
  if (typeof languageButtonHtmlID === "undefined") {
    languageButtonHtmlID = "languageButton";
  }
  // Used for element inspector
  if (typeof inspectorKeword === "undefined") {
    inspectorKeword = "?dev";
  }
  if (typeof inspectorContainerId === "undefined") {
    inspectorContainerId = "el-details";
  }
  if (typeof inspectorLocation === "undefined") {
    inspectorLocation = "bottom";
  }
  // Start Inspector if keyword present
  if (window.location.href.indexOf(inspectorKeword) > -1) {
    startDev();
  }

  // Multiligual Mode
  if (textManagerMultilingualMode) {
    if ($("#languageButton").length) {
      // Use Content Gadget if exists
      $("#languageButton").append('<div><button type="button" id="languageToggle">Toggle Second Language</button></div>');
    } else {
      // Else show default language toggle
      $("#mLayout").prepend('<div><button type="button" id="languageToggle">Toggle Second Language</button></div>');
    }
  }

  if (textManagerProductionMode) {
    log(`Wild Apricot Text Manager ${watm_version} loaded in production mode`);
  } else {
    log(`Wild Apricot Text Manager ${watm_version} loaded in development mode`);
  }

  // Set Cookie for Second Language Replacement
  $("#languageToggle").click(function () {
    setIsMultilingual(!isMultilingual());
    location.reload();
  });

  if (isMultilingual()) {
    $("#languageToggle").text(primaryLanguageButtonName);
    if (textManagerMultilingualMode) log(`Current Language: ${alterativeLanguageButtonName}`);
  } else {
    $("#languageToggle").text(alterativeLanguageButtonName);
    if (textManagerMultilingualMode) log(`Current Language: ${primaryLanguageButtonName}`);
  }

  // Load only if Formstack isn't detected.
  if (!hasFormstack()) {
    var urlSuffix = textManagerProductionMode ? "" : "/?" + Math.random().toString(16).substring(2);

    // Open file server side
    $.ajax({
      url: data_url + urlSuffix,
      //url: newpath_data_url,
      async: true,
      success: function (csvd) {
        try {
          array = $.csv.toArrays(csvd);
        } catch (err) {
          log(`WATM configuration file is not in correct format`, "error");
          alert(`[watm error] WATM configuration file is not in correct format. ${err.message} Did you Save as .CSV UTF-8?`);
        }
      },
      error: function (xhr, ajaxOptions, thrownError) {
        log(`WATM configuration file not found`, "error");
      },
      dataType: "text",
      complete: function () {
        for (var row in array) {
          var data = {
            container: array[row][0].trim(),
            default_text: array[row][1].trim(),
            english_text: array[row][2].trim(),
            second_language_text: array[row][3].trim(),
            note: array[row][4].trim(),
            function: array[row][5].trim(),
            query: array[row][6].trim(),
            style: array[row][7].trim(),
            row: row.trim(),
          };
          list.push(data);
        }
        if (!isInEditMode()) {
          list.map(replaceText);
        }
      },
    });
  }
});

// Page finished loading
$(window).bind("load", function () {
  $("#textmanager_overlay").css("display", "none"); // Remove the white overlay

  // Trigger Wild Apricot's resizeMenu()
  if (isInternetExplorer()) {
    // IE 11
    var resizeEvent = window.document.createEvent("UIEvents");
    resizeEvent.initUIEvent("resize", true, false, window, 0);
    window.dispatchEvent(resizeEvent);
  } else {
    // All other browsers
    window.dispatchEvent(new Event("resize"));
  }

  if (!isInEditMode()) {
    // Replace text again to rewrite event handlers for the hover in menu
    list.map(replaceText);
  }
});

/* Utilities */
function setCookie(key, value) {
  var expires = new Date();
  expires.setTime(expires.getTime() + 1 * 24 * 60 * 60 * 1000);
  document.cookie = key + "=" + value + ";path=/;expires=" + expires.toUTCString();
}

function getCookie(key) {
  var keyValue = document.cookie.match("(^|;) ?" + key + "=([^;]*)(;|$)");
  if (keyValue && keyValue.length > 0) {
    keyValue = keyValue[2];

    if (!isNaN(keyValue)) {
      keyValue = Number(keyValue);
    } else if (keyValue.toLowerCase() == "true") {
      keyValue = true;
    } else if (keyValue.toLowerCase() == "false") {
      keyValue = false;
    }
  }
  return keyValue;
}

function isInEditMode() {
  return top !== self; // detect if we're in an iframe
}

function isMultilingual() {
  return getCookie("SecondLanguage");
}

function setIsMultilingual(isMultilingual) {
  if (typeof isMultilingual === "undefined") {
    isMultilingual = true;
  }
  setCookie("SecondLanguage", isMultilingual);
}

function hasFormstack() {
  return !!$("form.fsForm")[0];
}

function log(text, logType = "") {
  if (logType) logType = " " + logType;
  console.log(`[watm${logType}]`, text);
}

function replaceText(data) {
  // Language Show/Hide Custom Content Block
  if (isMultilingual()) {
    var replacement_text = data.second_language_text;
    $(alterativeLanguageClassName).show();
    $(primaryLanguageClassName).hide();
  } else {
    var replacement_text = data.english_text;
    $(alterativeLanguageClassName).hide();
    $(primaryLanguageClassName).show();
  }

  if (data.function === "hide") {
    $(data.query).hide();
  }

  // SCSS
  if (data.function.toLowerCase() === "scss") {
    var key, value;
    key = data.query.split("=")[0]; // String before =
    value = data.query.split("=")[1]; // String after =
    scss_dict[key] = value;
    log(`SCSS Variable Added: ${key} = ${value}`, "notice");
  }

  // Check to see if any replacement text in the column
  if (replacement_text.length > 0) {
    // Delay these replacements by 1 second, and keep polling every second
    if (data.function === "delay") {
      setInterval(function () {
        $(data.query).text(replacement_text);
      }, 1000);
    }

    // Replace text on buttons
    if (data.function === "button") {
      $(data.query).val(replacement_text);
    }

    // Replace text in search boxes
    if (data.function === "placeholder") {
      $(data.query).attr("placeholder", replacement_text);
    }

    // Replace text in attributes
    if (data.function === "attribute") $("[" + data.query + "='" + data.default_text + "']").attr(data.query, replacement_text);

    // Special function to replace substring after 1s delay
    // Used for shopping cart "Member price"
    if (data.function.indexOf("replace_delay") != -1) {
      var splitTime = 1000;
      if (data.function.split("-")[1]) splitTime = data.function.split("-")[1] * 1000;
      setTimeout(function () {
        $(data.query).each(function () {
          if (this) {
            this.innerText = this.innerText.replace(RegExp(`(${data.default_text})`, "i"), replacement_text);
          }
        });
      }, splitTime);
    }

    // Search and replace
    if (data.function === "replace" || data.function === "replace_element") {
      var begin_node = document.body;
      // Walk a subset of the DOM based on Query
      if (data.query.length > 0) {
        var query_array = data.query.split(" ");
        // Multiple Query
        if (query_array.length > 0)
          for (query in query_array) {
            $(data.query).each(function () {
              begin_node = this;
              if (begin_node) {
                walkText(begin_node, data, replacement_text);
              }
            });
          }
        // Single Query
        else {
          $(data.query).each(function () {
            begin_node = this;
            if (begin_node) {
              walkText(begin_node, data, replacement_text);
            }
          });
        }
      }
      // Empty Query so walk the whole page
      else {
        walkText(begin_node, data, replacement_text);
      }
    }

    // Replace text on all other elements
    if (data.function === "text") {
      $(data.query).text(replacement_text);
    }
  }

  // CSS
  if (data.function != "inactive" && data.style.length > 0 && data.style[0] === "{") {
    try {
      // SCSS
      if (data.style.includes("$")) {
        var regex = /\$[a-zA-Z0-9_-]+/g;
        var keys = data.style.match(regex);
        for (c = 0; c < keys.length; c++) {
          var key = keys[c];
          var value = scss_dict[key];
          data.style = data.style.replace(key, value);
        }
      }

      if (data.query.includes(":before") || data.query.includes(":after"))
        // Pseudoelements
        $("head").append("<style>" + data.query + data.style + "</style>");
      else if (data.function === "mouseover") {
        // Hover
        $(data.query).each(function () {
          $(this).mouseover(function () {
            $(this).css(JSON.parse(data.style));
          });
        });
      } else if (data.function === "mouseout") {
        // End hover
        $(data.query).each(function () {
          $(this).mouseout(function () {
            $(this).css(JSON.parse(data.style));
          });
        });
      } else {
        $(data.query).css(JSON.parse(data.style));
      }
    } catch (err) {
      log(`Error in configuration file - row #${data.row}: ${err.message}`, "error");
    }
  }
}

function walkText(node, data, text) {
  try {

    if (node.nodeType === 1) {
      if (node.innerText.search(RegExp(`(${data.default_text})`, "i")) > -1) {
        if (data.function === "replace_element") {
          node.innerText = text;
        } else if (data.function === "replace") {
          node.innerText = node.innerText.replace(RegExp(`(${data.default_text})`, "i"), text);
        }
      }
    } else if (node.nodeType === 1 && node.nodeName != "SCRIPT") {
      for (var i = 0; i < node.childNodes.length; i++) {
        walkText(node.childNodes[i], data, text);
      }
    }
  } catch (err) {
    log(`Error in configuration file - row #${data.row}: ${err.message}`, "error");
  }
}

function isInternetExplorer() {
  var ua = window.navigator.userAgent;
  var msie = ua.indexOf("MSIE ");
  if (msie > 0) {
    // IE 10 or older => return version number
    return parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)), 10);
  }

  var trident = ua.indexOf("Trident/");
  if (trident > 0) {
    // IE 11 => return version number
    var rv = ua.indexOf("rv:");
    return parseInt(ua.substring(rv + 3, ua.indexOf(".", rv)), 10);
  }

  // other browser
  return false;
}

function startDev() {
  // Create inspector container
  $("body").prepend($("<div>").attr("id", inspectorContainerId).html("<h1>Click on an element to begin</h1>"));
  // Add CSS to created container
  setCSS();

  // Cancel all onclicks
  setTimeout(function () {
    $("*").attr("onclick", "").unbind("click");
    $("tr").attr("onclick", "").unbind("click");
  }, 1000);

  // Intercept all page clicks
  setTimeout(function () {
    log(`Element Inspector Active`, "notice");
    $("body").on("click", "*", function (event) {
      // Store clicked element ID
      let clickedID = $(this).attr("id");
      // Store clicked element class names
      let clickedClass = $(this).attr("class");

      // Obtain CSS path of clicked element
      completePath = getPath(this);

      // Ensure clicked element is not inspector container
      if (completePath.indexOf("#" + inspectorContainerId) == -1) {
        // Cancel default action for clicked element
        event.preventDefault();
        // Show element information
        displyPath(completePath, clickedID, clickedClass);
      }

      // This prevents the function from firing multiple times for nested elements
      return false;
    });
  }, 1500);
}

// Get full CSS path
function getPath(el) {
  let path = [];
  while (el.nodeType === Node.ELEMENT_NODE) {
    let selector = el.nodeName.toLowerCase();
    if (el.id) {
      selector += "#" + el.id;
    } else {
      let sib = el,
        nth = 1;
      while (sib.nodeType === Node.ELEMENT_NODE && (sib = sib.previousSibling) && nth++);
      selector += ":nth-child(" + nth + ")";
    }
    path.unshift(selector);
    el = el.parentNode;
  }
  return path.join(" > ");
}

function displyPath(cssPath, elID, elClass) {
  elInfo = "";
  if (cssPath.lastIndexOf("#") > -1) {
    // If the path contains an ID, start path from there
    cssPath = cssPath.substring(cssPath.lastIndexOf("#"));
  }
  if (elID) {
    // If clicked element has ID, display it
    elInfo = elInfo + "<p><b>Element ID:</b> #" + elID + "</p>";
  }
  if (elClass) {
    // If clicked element has classes, display them
    elInfo = elInfo + "<p><b>Element Class(es):</b> ." + elClass.split(" ").join(" .") + "</p>";
  }
  // Display CSS path
  elInfo = elInfo + "<p><b>CSS Path:</b> " + cssPath + "</p>";
  // Add to inspector container
  $("#" + inspectorContainerId).html(elInfo);
}

// Set inspector container styling
function setCSS() {
  $("#" + inspectorContainerId).css({
    border: "5px solid #000",
    width: "100%",
    background: "#fff",
    color: "#000",
    position: "fixed",
    padding: "20px",
    "z-index": 999,
  });

  // Show inspector container at top or bottom of viewport based on activation keyword
  if (inspectorLocation == "top") {
    $("#" + inspectorContainerId).css({ top: 0 });
    $("body").css({ "padding-top": "150px" });
  } else {
    $("#" + inspectorContainerId).css({ bottom: 0 });
    $("body").css({ "padding-bottom": "150px" });
  }
}
