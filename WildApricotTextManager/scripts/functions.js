/**
 * The function that checks the license key and sets the license variable accordingly. If the license key is valid and the product is active, the start function is called with the license parameter. If the license key is invalid, the plugin is disabled and an error message is logged. If no license key is provided, the plugin runs in trial mode with limited features.
 * @function
 * @returns {void}
 */
const checkLicense = () => {
  // Declare two variables, `license` and `checkUrl`
  let license;
  let checkUrl = "https://hook.us1.make.com/" + checkCode;

  // If `license_key` is not an empty string, attempt to retrieve the `watmlicense` cookie using the `getCookie` function
  if (license_key !== "") {
    let license = getCookie("watmlicense");
    // If the cookie exists, call the `start` function and pass `license` as an argument
    if (license) {
      start(license);
    } else {
      // Otherwise, make an HTTP GET request to the `checkUrl` URL and include the `license_key` as a query parameter
      fetch(`${checkUrl}/?json=true&key=${license_key}`)
        // Parse the response data as JSON
        .then((response) => response.json())
        .then((data) => {
          // If the response data contains an error or the product is not "watm", set `license` to "invalid" and log an error message
          if (
            data["license-error"] == "no valid key found" ||
            !data.Products.includes("watm")
          ) {
            license = "invalid";
            log(
              "Invalid License Key for EZ Designer - Plugin is now disabled",
              "Error"
            );
          } else {
            // Otherwise, parse the expiration date from the response data and compare it to the current date
            let expiryDate = Date.parse(data["expiration date"]);
            // If the product is "watm", the support level is "support", and the expiration date is in the future, set `license` to "active"
            if (
              data.Products.includes("watm") &&
              data["Support Level"] == "support" &&
              expiryDate >= Date.now()
            ) {
              license = "active";
            }
            // If the product is "watm" and the expiration date is in the past, set `license` to "expired" and log a notice message
            if (data.Products.includes("watm") && expiryDate < Date.now()) {
              license = "expired";
              log(
                "License Key for EZ Designer - Running in trial mode. Please renew your license to unlock all features",
                "Notice"
              );
            }
          }
          // Set the `watmlicense` cookie to the value of `license` and call the `start` function, passing `license` as an argument
          setCookie("watmlicense", license);
          start(license);
        });
    }
  } else {
    // If `license_key` is an empty string, set `license` to "trial" and log a notice message
    license = "trial";
    log(
      "EZ Designer running in trial mode - Please obtain a valid license key to unlock all features",
      "Notice"
    );
    // Set the `watmlicense` cookie to the value of `license` and call the `start` function, passing `license` as an argument
    setCookie("watmlicense", license);
    start(license);
  }
};

/**
 * Creates a language toggle switcher for a webpage.
 * @param {Array} languages - An array of language objects that contain a label and className property.
 * @param {string} currentLanguage - The current language of the webpage. Should match one of the language objects className property.
 * @param {string} elm - The id of the element where the language toggle switcher should be placed.
 */
const createToggle = (languages, currentLanguage, elm) => {
  /**
   * If no element is found with the given id, log a warning message and return false.
   * @returns {boolean} - false if no element with the given id is found.
   */
  if (!document.getElementById(elm)) {
    log(
      'No language switcher content gadget found. Add a content gadget with class "language_switcher" to all of your page templates or disable the language switcher',
      "Warning"
    );
    return false;
  }
  let toggleText = "Select language";
  if (currentLanguage !== "") {
    /**
     * Sets the toggleText to the label of the currentLanguage object if it matches the className property of a language object.
     */
    languages.forEach((language, index) => {
      if (language.className == currentLanguage) {
        toggleText = language.label;
      }
    });
  }

  const toggleElementID = document.getElementById(elm);

  // Build switcher
  const languageToggle = document.createElement("div");
  languageToggle.classList.add("watm-dropdown", "watm-dropdown-closed");
  const languageToggleIcon = document.createElement("h2");
  languageToggleIcon.classList.add("watm-dropdown-icon");
  languageToggleIcon.innerHTML = `${toggleText} <span>∆</span>`;
  const languageToggleMenu = document.createElement("ul");
  languageToggleMenu.classList.add("watm-dropdown-menu");

  // Add languages
  /**
   * Creates a list item for each language in the languages array and attaches a click event listener that sets the URL to include the language className.
   */
  languages.forEach((language) => {
    let lang_li = document.createElement("li");
    lang_li.textContent = language.label;
    lang_li.addEventListener("click", (e) => {
      location.href = `?watm-${language.className}`;
    });
    languageToggleMenu.appendChild(lang_li);
  });

  // Add languages to switcher
  languageToggle.appendChild(languageToggleIcon);
  languageToggle.appendChild(languageToggleMenu);

  // Attach switcher to page
  toggleElementID.parentNode.replaceChild(languageToggle, toggleElementID);

  // Toggle dropdown on click
  /**
   * Toggles the watm-dropdown-closed class on the languageToggle element when clicked.
   */
  languageToggle.addEventListener("click", (e) => {
    if (languageToggle.classList.contains("watm-dropdown-closed")) {
      languageToggle.classList.remove("watm-dropdown-closed");
    } else {
      languageToggle.classList.add("watm-dropdown-closed");
    }
  });
};

/**
 * Sets a cookie for the selected language and reloads the page without the language keyword.
 * @param {string} language - The language to be set.
 */
const setLanguage = (language) => {
  // Set cookie for selected language
  setCookie("currentLanguage", language);
  // Reload page without language keyword
  window.location.href = window.location.href.replace(`?watm-${language}`, "");
};

/**
 * Reads the selected language from a cookie. If no language is found, sets the currentLanguage to "Default".
 * @param {Array} languages - An array of language objects that contain a label and className property.
 * @returns {string} - The current language of the webpage.
 */
const getCurrentLanguage = (languages) => {
  // Read selected language from cookie
  let currentLanguage = getCookie("currentLanguage");
  if (!currentLanguage) {
    const browserLanguage = getBrowserLanguage(navigator.language);
    if (
      languages.some((language) => {
        return language.className.includes(browserLanguage);
      })
    ) {
      currentLanguage = browserLanguage;
    } else {
      currentLanguage = "Default";
    }
  }
  return currentLanguage;
};

/**
 * Processes a row of data and executes the specified function on selected webpage elements.
 * @param {Object} row - An object representing a row of data, with properties "Default Text", "Function", "Query", "Replacement Text", and "Style".
 */
const process = (row) => {
  let defaultText = row["Default Text"].trim();
  let watmFunction = row["Function"].trim();
  let watmQuery = row["Query"].trim();
  let replacementText = row["Replacement Text"].trim();
  let watmStyle = row["Style"].trim();

  switch (watmFunction) {
    case "hide":
      document.querySelectorAll(watmQuery).forEach(function (el) {
        el.style.display = "none";
      });
      break;
    case "text":
      document.querySelectorAll(watmQuery).forEach(function (el) {
        el.innerText = replacementText;
      });
      break;
    case "button":
      document.querySelectorAll(watmQuery).forEach(function (el) {
        el.value = replacementText;
      });
      break;
    case "buttondelay":
      setTimeout(function () {
        document.querySelectorAll(watmQuery).forEach(function (el) {
          el.value = replacementText;
        });
      }, 1000);
      break;
    case "placeholder":
      document.querySelectorAll(watmQuery).forEach(function (el) {
        el.setAttribute("placeholder", replacementText);
      });
      break;
    case "delay":
      setTimeout(function () {
        if (defaultText.length <= 0) {
          document.querySelectorAll(watmQuery).forEach(function (el) {
            el.innerText = replacementText;
          });
        } else
          replace_link_delay(
            watmQuery,
            "replace",
            defaultText,
            replacementText
          );
      }, 1000);
    case "shortdelay":
      setTimeout(function () {
        if (defaultText.length <= 0) {
          document.querySelectorAll(watmQuery).forEach(function (el) {
            el.innerText = replacementText;
          });
        } else
          replace_link_delay(
            watmQuery,
            "replace",
            defaultText,
            replacementText
          );
      }, short_delay * 1000);
      break;
    case "longdelay":
      setTimeout(function () {
        if (defaultText.length <= 0) {
          document.querySelectorAll(watmQuery).forEach(function (el) {
            el.innerText = replacementText;
          });
        } else
          replace_link_delay(
            watmQuery,
            "replace",
            defaultText,
            replacementText
          );
      }, long_delay * 1000);
      break;
    case "replace":
    case "replace_element":
    case "createlink":
      replace_link_delay(watmQuery, watmFunction, defaultText, replacementText);
      break;
    case "attribute":
      document.querySelectorAll(watmQuery).forEach(function (el) {
        el.setAttribute(defaultText, replacementText);
      });
      break;
    case "googlefont":
      let fontUrl = `https://fonts.googleapis.com/css2?family=${replacementText.trim()}:wght@200;300;400;600;700;800;900&display=swap`;
      let fontLink = document.createElement("link");
      fontLink.href = fontUrl;
      fontLink.setAttribute("rel", "stylesheet");
      document.head.appendChild(fontLink);
      break;
    case "link":
      document.querySelectorAll(watmQuery).forEach(function (el) {
        if (el.hasAttribute("href")) el.setAttribute("href", replacementText);
      });
      break;
    case "source":
      document.querySelectorAll(watmQuery).forEach(function (el) {
        if (el.hasAttribute("src")) el.setAttribute("src", replacementText);
      });
      break;
    case "tooltip":
      document.querySelectorAll(watmQuery).forEach(function (el) {
        tippy(el, {
          content: replacementText,
        });
      });
      break;
  }
  if (watmFunction !== "inactive" && watmStyle !== null && watmStyle !== "") {
    let mediaQuery = "";
    if (watmFunction == "@media") mediaQuery = replacementText;
    processCSS(watmQuery, watmStyle, mediaQuery);
  }
};

/**
 * Replace text / create link with delay
 * @param {string} watmQuery - The CSS selector for the target element(s) to be modified. Default is "body".
 * @param {string} watmFunction - The function to be performed. Must be either "replace" or "createlink".
 * @param {string} defaultText - The default text to be replaced. Can be a plain string or a regex.
 * @param {string} replacementText - The text or URL to replace the defaultText with.
 * @returns {undefined} - This function does not return anything.
 */
const replace_link_delay = (
  watmQuery,
  watmFunction,
  defaultText,
  replacementText
) => {
  if (watmQuery == null || watmQuery == "") watmQuery = "body";
  let regex = new RegExp(
    (defaultText.includes("-") ||
    defaultText.includes(".") ||
    defaultText.includes("!") ||
    defaultText.includes("?") ||
    defaultText.includes(":")
      ? ""
      : "\\b") +
      escapeRegExp(defaultText) +
      (defaultText.includes("-") ||
      defaultText.includes(".") ||
      defaultText.includes("!") ||
      defaultText.includes("?") ||
      defaultText.includes(":")
        ? ""
        : "\\b"),
    "gi"
  );
  document.querySelectorAll(watmQuery).forEach(function (el) {
    if (watmFunction === "replace") {
      walkText(el, regex, watmFunction, function (node, match, offset) {
        let newText = document.createTextNode(replacementText);
        return newText;
      });
    }
    if (watmFunction === "replace_element") {
      regex = new RegExp(defaultText, "gi");
      walkText(el, regex, watmFunction, function (node, match, offset) {
        return replacementText;
      });
      if (watmFunction === "createlink") {
        walkText(el, regex, watmFunction, function (node, match, offset) {
          let alink = document.createElement("a");
          alink.href = replacementText;
          alink.textContent = match;
          return alink;
        });
      }
    }
  });
};

/**
 * Checks whether the current page is in edit mode.
 *
 * @returns {boolean} Whether the current page is in edit mode.
 */
const isInEditMode = () => {
  // Check if in admin view
  const bodyTag = document.querySelector("body");
  return bodyTag.classList.contains("adminContentView");
};

/**
 * Logs a message to the console.
 *
 * @param {string} text - The text to log.
 * @param {string} [logType=''] - An optional log type to prepend to the message.
 */
const log = (text, logType = "") => {
  // Function for logging actions to console
  if (logType) logType = " " + logType;
  console.log(`[watm${logType}]`, text);
};

/**
 * Sets a cookie with the given key and value.
 *
 * @param {string} key - The key of the cookie.
 * @param {string} value - The value to set the cookie to.
 */
const setCookie = (key, value) => {
  var expires = new Date();
  expires.setTime(expires.getTime() + 1 * 24 * 60 * 60 * 1000);
  document.cookie =
    key +
    "=" +
    value +
    ";path=/;expires=" +
    expires.toUTCString() +
    "; SameSite=None; Secure";
};

/**
 * Gets the value of the cookie with the given key.
 *
 * @param {string} key - The key of the cookie to retrieve.
 * @returns {(string|number|boolean|null)} The value of the cookie, or null if it does not exist.
 */
const getCookie = (key) => {
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
};

/**
 * Walks through the DOM tree and replaces the text node content based on a regex pattern match with a replacement string.
 * @param {Node} node - The current node being processed.
 * @param {RegExp} regex - The regular expression pattern used to match text.
 * @param {string} watmFunction - The watmFunction type.
 * @param {Function} callback - The callback function that replaces text with new text or HTML element.
 * @returns {Node} - Returns the updated node.
 */
const walkText = function (node, regex, watmFunction, callback) {
  const excludeElements = [
    "script",
    "style",
    "iframe",
    "canvas",
    "script",
    watmFunction === "createlink" ? "a" : "",
  ];

  switch (node.nodeType) {
    case 1:
      // If node is an element and not in the list of excluded tags, call walkText on its children nodes.
      if (excludeElements.indexOf(node.tagName.toLowerCase()) > -1) break;
      for (let i = 0; i < node.childNodes.length; i++) {
        walkText(node.childNodes[i], regex, watmFunction, callback);
      }
      break;
    case 3:
      // If node is a text node, replace the matched text content with the returned callback value.
      if (watmFunction === "replace_element" && regex.test(node.data)) {
        node.parentNode.innerText = callback(node);
        regex.lastIndex = 0;
      } else {
        var bk = 0;
        node.data.replace(regex, function (all) {
          var args = [].slice.call(arguments),
            offset = args[args.length - 2],
            newTextNode = node.splitText(offset + bk),
            tag;
          bk -= node.data.length + all.length;

          newTextNode.data = newTextNode.data.substr(all.length);
          tag = callback.apply(window, [node].concat(args));
          node.parentNode.insertBefore(tag, newTextNode);
          node = newTextNode;
        });
      }
      regex.lastIndex = 0;
      break;
  }

  return node;
};

/**
 * Processes CSS styles and creates a new style node in the head of the document.
 * @param {string} watmQuery - CSS selector for the element(s) to apply styles to.
 * @param {string} watmStyle - CSS styles to apply to the selected element(s).
 * @param {string} mediaQuery - CSS media query to apply the styles to.
 */
const processCSS = (watmQuery, watmStyle, mediaQuery) => {
  // SCSS
  if (watmStyle.includes("$")) {
    let regex = /\$[a-zA-Z0-9_-]+/g;
    let keys = watmStyle.match(regex);
    for (c = 0; c < keys.length; c++) {
      let key = keys[c];
      let value = scss_dict[key];
      watmStyle = watmStyle.replace(key, value);
    }
  }

  let cssNode = document.createElement("style");
  cssNode.innerHTML = `${
    mediaQuery !== "" ? "@media " + mediaQuery + " { " : ""
  }${watmQuery} { ${watmStyle} }${mediaQuery !== "" ? " }" : ""}`;
  document.head.appendChild(cssNode);
};

/**
 * Appends a WATM button to the document.
 * @param {string} license - The WATM license type to use for the button.
 * @param {boolean} isAdmin - Whether the current user is an admin or not.
 */
const appendWATMBtn = (license = "default", isAdmin) => {
  const btn = document.createElement("div");
  btn.classList.add("watm-icon", "watm-icon-left", `watm-${license}`);

  if (isAdmin && license !== "invalid") {
    btn.addEventListener("click", () => {
      window.location.href = window.location.href + "?dev";
    });
    btn.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      if (btn.classList.contains("watm-icon-left")) {
        btn.classList.remove("watm-icon-left");
        btn.classList.add("watm-icon-right");
      } else {
        btn.classList.remove("watm-icon-right");
        btn.classList.add("watm-icon-left");
      }
      return false;
    });
  }

  /**
   * Creates and displays a tooltip using the Tippy.js library, containing information about the WATM extension.
   *
   * @param {HTMLElement} btn - The button element to attach the tooltip to.
   * @param {string} watm_info_url - The URL to the WATM information page.
   * @param {string} watm_version - The version of the WATM extension.
   * @param {string} license - The license type of the WATM extension.
   * @param {boolean} isAdmin - Flag indicating if the user is an admin or not.
   */
  tippy(btn, {
    content:
      `<strong><a href="${watm_info_url}" target="_blank">EZ WildApricot Web Designer</a></strong><br/>` +
      `Version: ${watm_version} | License: <span class="${license}">${license.toUpperCase()}</span>` +
      `${
        isAdmin && license !== "invalid"
          ? "<br/><br/>Click icon to launch inspector"
          : ""
      }`,
    interactiveBorder: 30,
    interactiveDebounce: 75,
    placement: "right",
    interactive: true,
    allowHTML: true,
  });

  document.body.appendChild(btn);
};

/**
 * Loads the specified CSS files into the document head.
 *
 * @param {Array} cssFiles - An array of CSS file paths to load.
 */
const loadCSS = (cssFiles) => {
  let head = document.head;
  cssFiles.forEach((cssFile) => {
    let link = document.createElement("link");

    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = cssFile;

    head.appendChild(link);
  });
};

/**
 * Escapes any special regular expression characters in the given string.
 *
 * @param {string} string - The string to escape.
 * @returns {string} - The escaped string.
 */
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&");
};

/**
 * Returns the full English name of a language given its language code.
 *
 * @param {string} languageCode - The language code, in the format "xx"
 * @returns {string} The full English name of the language, or "Unknown" if the language code is not recognized.
 */
const getBrowserLanguage = (languageCode) => {
  // An object that maps language codes to their full English names
  const languageNames = {
    en: "English",
    es: "Spanish",
    fr: "French",
    de: "German",
    it: "Italian",
    pt: "Portuguese",
    ru: "Russian",
    zh: "Chinese",
    ja: "Japanese",
    ko: "Korean",
    ar: "Arabic",
    hi: "Hindi",
    bn: "Bengali",
    id: "Indonesian",
    ms: "Malay",
    fil: "Filipino",
    th: "Thai",
    vi: "Vietnamese",
    tr: "Turkish",
    pl: "Polish",
    uk: "Ukrainian",
    ro: "Romanian",
    nl: "Dutch",
    sv: "Swedish",
    no: "Norwegian",
    fi: "Finnish",
    da: "Danish",
    he: "Hebrew",
    fa: "Persian",
    cs: "Czech",
    sk: "Slovak",
    hu: "Hungarian",
    hr: "Croatian",
    sr: "Serbian",
    sl: "Slovenian",
    bg: "Bulgarian",
    mk: "Macedonian",
    et: "Estonian",
    lv: "Latvian",
    lt: "Lithuanian",
  };
  // Look up the full English name of the language based on its language code
  let browserLanguage = languageNames[languageCode.split("-")[0]] || "";

  // Return the full English name of the language
  return browserLanguage.toLowerCase();
};
