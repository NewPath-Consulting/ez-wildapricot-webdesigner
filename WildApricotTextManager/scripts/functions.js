const checkLicense = () => {
  let license;
  let checkUrl = "https://hook.us1.make.com/" + checkCode;
  if (license_key !== "") {
    fetch(`${checkUrl}/?json=true&key=${license_key}`)
      .then((response) => response.json())
      .then((data) => {
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
          let expiryDate = Date.parse(data["expiration date"]);
          if (
            data.Products.includes("watm") &&
            data["Support Level"] == "support" &&
            expiryDate >= Date.now()
          ) {
            license = "active";
          }
          if (data.Products.includes("watm") && expiryDate < Date.now()) {
            license = "expired";
            log(
              "License Key for EZ Designer - Running in trial mode. Please renew your license to unlock all features",
              "Notice"
            );
          }
        }
        start(license);
      });
  } else {
    license = "trial";
    log(
      "EZ Designer running in trial mode - Please obtain a valid license key to unlock all features",
      "Notice"
    );
    start(license);
  }
};

const createToggle = (languages, currentLanguage, elm) => {
  // Target location for language switcher
  if (!document.getElementById(elm)) {
    log(
      'No language switcher content gadget found. Add a content gadget with class "language_switcher" to all of your page templates or disable the language switcher',
      "Warning"
    );
    return false;
  }
  let toggleText = "Select language";
  if (currentLanguage !== "") {
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
  languageToggle.addEventListener("click", (e) => {
    if (languageToggle.classList.contains("watm-dropdown-closed")) {
      languageToggle.classList.remove("watm-dropdown-closed");
    } else {
      languageToggle.classList.add("watm-dropdown-closed");
    }
  });
};

const setLanguage = (language) => {
  // Set cookie for selected language
  setCookie("currentLanguage", language);
  // Reload page without language keyword
  window.location.href = window.location.href.replace(`?watm-${language}`, "");
};

const getCurrentLanguage = () => {
  // Read selected language from cookie
  let currentLanguage = getCookie("currentLanguage");
  if (!currentLanguage) currentLanguage == "Default";

  return currentLanguage;
};

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
      break;
    case "replace":
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
    if (watmFunction === "createlink") {
      walkText(el, regex, watmFunction, function (node, match, offset) {
        let alink = document.createElement("a");
        alink.href = replacementText;
        alink.textContent = match;
        return alink;
      });
    }
  });
};

const isInEditMode = () => {
  // Check if in admin view
  const bodyTag = document.querySelector("body");
  return bodyTag.classList.contains("adminContentView");
};

const log = (text, logType = "") => {
  // Function for logging actions to console
  if (logType) logType = " " + logType;
  console.log(`[watm${logType}]`, text);
};

// Util function for setting cookies
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

// Util function for reading cookies
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
      if (excludeElements.indexOf(node.tagName.toLowerCase()) > -1) break;
      for (let i = 0; i < node.childNodes.length; i++) {
        walkText(node.childNodes[i], regex, watmFunction, callback);
      }
      break;
    case 3:
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
      regex.lastIndex = 0;
      break;
  }

  return node;
};

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

const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&");
};
