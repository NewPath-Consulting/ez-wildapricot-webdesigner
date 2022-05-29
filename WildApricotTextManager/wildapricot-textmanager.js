// Wild Apricot Text Manager Library
//
// Licensed under LGPL 3.0
// Contact NewPath Consulting for support at https://talk.newpathconsulting.com

var list = [];
var array;
var scss_dict = {};
var data_url = "/resources/Theme/WildApricotTextManager/wildapricot-textmanager-config.csv";
var watm_version = "0.96";

// Initialize global clipboard variable
var clipboardPath;
var clipboardClass;
var clipboardId;

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
  if (typeof inspectorKeyword === "undefined") {
    inspectorKeyword = "?dev";
  }
  if (typeof inspectorContainerId === "undefined") {
    inspectorContainerId = "el-details";
  }
  if (typeof inspectorLocation === "undefined") {
    inspectorLocation = "bottom";
  }
  if (typeof showInspectorLink === "undefined") {
    showInspectorLink = true;
  }

  if (typeof showInspectorHover === "undefined") {
    showInspectorHover = true;
  }

  if (typeof inspectorHoverColor === "undefined") {
    inspectorHoverColor = "#f00";
  }

  // Hide language toggle button if page loaded as a widget
  if (window.location.href.indexOf("/widget/") > -1) {
    hideToggle = true;
  } else {
    hideToggle = false;
  }

  // Create CSS rule for inspector hover
  var style = $(`<style>.watm-hover { border: 2px solid ${inspectorHoverColor}!important; box-sizing: border-box!important; }</style>`)
  $('html > head').append(style);

  // Start Inspector if keyword present
  if (window.location.href.indexOf(inspectorKeyword) > -1) {
    startDev();
  }

  // Multiligual Mode
  if (textManagerMultilingualMode & !hideToggle) {
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

    // Set language if keyword in URL
    if (window.location.href.indexOf("?secondLanguage") > -1) {
      setIsMultilingual(true);
      window.location.href = window.location.href.replace("?secondLanguage", "");
    } if (window.location.href.indexOf("?primaryLanguage") > -1) {
      setIsMultilingual(false);
      window.location.href = window.location.href.replace("?primaryLanguage", "");
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

          // Show Inspector link in footer, with a 1 second timeout
          if(showInspectorLink){
            setTimeout(
              function () {
                $("#idFooterPoweredByWA").prepend( $( "<span><a href='?dev'>Show Inspector</a> | </span>" ) )
              },showInspectorLinkDelay);
          }
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
  // detect if we are in admin
  return $("body").hasClass("adminContentView");
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
            this.innerText = this.innerText.replace(data.default_text, replacement_text);
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
    if (node.nodeType === 3) {
      if (node.data.search(data.default_text) > -1) {
        if (data.function === "replace_element") {
          node.data = text;
        } else if (data.function === "replace") {
          node.data = node.data.replace(data.default_text, text);
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
  $("body").prepend($("<div>").attr("id", inspectorContainerId).html("<div id='inspectorBody'><h1>Inspector - Click on any page element</h1></div>"));

  inspectorExitbtn = $("<button>").addClass("inspectorBtn").text("Exit Inspector").css('margin','5px');
  copyPathInspectorBtn = $("<button>").addClass("inspectorBtn").text("Copy CSS Path").css('margin','5px').hide();
  copyIdInspectorBtn = $("<button>").addClass("inspectorBtn").text("Copy Element ID").css('margin','5px').hide();
  copyClassInspectorBtn = $("<button>").addClass("inspectorBtn").text("Copy Classes").css('margin','5px').hide();
  

  // Add CSS to created container
  setCSS();

  // Cancel all onclicks
  setTimeout(function () {
    $("*").attr("onclick", "").unbind("click");
    $("tr").attr("onclick", "").unbind("click");
  }, 1000);

  // Intercept all page clicks
  setTimeout(function () {
    log(`[watm] Element Inspector Active`, "notice");
    $("body").on("click", "*", function (event) {
      // Remove WATM hover class
      $(this).removeClass("watm-hover");
      // Store clicked element ID
      let clickedID = $(this).attr("id");
      // Store clicked element class names
      let clickedClass = $(this).attr("class");

      // Obtain CSS path of clicked element
      completePath = getPath(this);

      // Obtain contents of clicked element
      if ( $(this).is("input") || $(this).is("textarea") || $(this).is("select") ) {
      
      clickedContents = $(this).val();
    } else
    
    {
      clickedContents = $(this).text();
    }

      // Ensure clicked element is not inspector container
      if (completePath.indexOf("#" + inspectorContainerId) == -1) {
        // Cancel default action for clicked element
        event.preventDefault();
        // Show element information
        displayPath(completePath, clickedID, clickedClass, clickedContents);
      }

      // This prevents the function from firing multiple times for nested elements
      return false;
    });

    // Append Inspector buttons
    $("#"+inspectorContainerId).prepend($(copyPathInspectorBtn).attr("onclick", "copyInspector(this)").attr("id","copyPathInspector"));
    $("#"+inspectorContainerId).prepend($(copyClassInspectorBtn).attr("onclick", "copyInspector(this)").attr("id","copyClassInspector"));
    $("#"+inspectorContainerId).prepend($(copyIdInspectorBtn).attr("onclick", "copyInspector(this)").attr("id","copyIdInspector"));
    $("#"+inspectorContainerId).prepend($(inspectorExitbtn).attr("onclick", "closeInspector()"));
  }, 1500);

  // Add/remove hover outline
  if (showInspectorHover) {
    $('*').mouseover(function(e){
      addHover(e.target)
    }).mouseout(function(e){
      $(e.target).removeClass("watm-hover")
    })
  }
}

// Only add hover outline if not in inspector
function addHover (elm){
    completePath = getPath(elm);
    if (completePath.indexOf("#" + inspectorContainerId) == -1) {
      $(elm).addClass("watm-hover");
    }
}


// Exit inspector
function closeInspector() {
  window.location.href = window.location.href.replace(inspectorKeyword, "");
}

// Copy to clipboard
function copyInspector(elm) {
  switch(elm.id) {
    case "copyPathInspector":
      navigator.clipboard.writeText(clipboardPath);
      break;
    case "copyClassInspector":
      navigator.clipboard.writeText("." + clipboardClass);
      break;
    case "copyIdInspector":
      navigator.clipboard.writeText("#" + clipboardId);
      break;
  }
  displayCopiedMessage(elm.id);
}

function displayCopiedMessage(btnId) {
  prevMessage = $("#"+btnId).text();
  $("#"+btnId).text("Copied to clipboard!").attr("disabled",true);
  setTimeout(function () {
    $("#"+btnId).text(prevMessage).attr("disabled",false);
  }, 5000);
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

function displayPath(cssPath, elID, elClass, elContents) {
  elInfo = "";
  if (cssPath.lastIndexOf("#") > -1) {
    // If the path contains an ID, start path from there
    cssPath = cssPath.substring(cssPath.lastIndexOf("#"));
  }
  if (elID) {
    // If clicked element has ID, display it
    elInfo = elInfo + "<p><b>Element ID:</b> #" + elID + "</p>";
    clipboardId = elID;
    $("#copyIdInspector").show();
  } else {
    clipboardId = null;
    $("#copyIdInspector").hide();
  }

  if (elClass) {
    // If clicked element has classes, display them
    elClasses = elClass.split(" ").join(" .")
    elInfo = elInfo + "<p><b>Element Class(es):</b> ." + elClasses + "</p>";
    clipboardClass = elClasses;
    $("#copyClassInspector").show();
  } else {
    clipboardClass = null;
    $("#copyClassInspector").hide();
  }
  
  if (elContents) {
    // If clicked element has contents, display them
    elInfo = elInfo + "<p><b>Element Contents:</b> " + elContents + "</p>";
    clipboardClass = elContents;
    $("#copyClassInspector").show();
  } else {
    clipboardClass = null;
    alert("Contents are empty...")
    $("#copyClassInspector").hide();
  }
  

  // Display CSS path
  elInfo = elInfo + "<p><b>CSS Path:</b> " + cssPath + "</p>";
  
  // Add path to global clipboard variable
  clipboardPath = cssPath;
  $("#copyPathInspector").show();


  // Add to inspector container
  $("#inspectorBody").html(elInfo);
  $(".inspectorBtn").prop('disabled', false);
}

// Set inspector container styling
function setCSS() {
  $("#" + inspectorContainerId).css({
    border: "5px solid #000",
    width: "95%",
    background: "#fff",
    color: "#000",
    position: "fixed",
    padding: "20px",
    "z-index": 999,
  });

  // Show inspector container at top or bottom of viewport based on activation keyword
  if (inspectorLocation == "top") {
    $("#" + inspectorContainerId).css({ top: 0 });
    $("#idCustomJsContainer").css({ "padding-top": "150px" });
    $("body").css({"margin-top": "250px"});
  } else {
    $("#" + inspectorContainerId).css({ bottom: 0 });
    $("#idCustomJsContainer").css({ "padding-bottom": "150px" });
  }
}
