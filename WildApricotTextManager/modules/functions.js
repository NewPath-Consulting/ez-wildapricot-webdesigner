export function createToggle(languages, elm) {
  // Target location for language switcher
  const toggleElementID = document.getElementById(elm);

  // Build switcher
  const languageToggle = document.createElement("div");
  languageToggle.classList.add("watm-dropdown", "watm-dropdown-closed");
  const languageToggleIcon = document.createElement("h2");
  languageToggleIcon.classList.add("watm-dropdown-icon");
  languageToggleIcon.innerHTML = "Select language <span>∆</span>";
  const languageToggleMenu = document.createElement("ul");
  languageToggleMenu.classList.add("watm-dropdown-menu");

  // Add languages
  languages.forEach((language) => {
    let lang_link = document.createElement("a");
    lang_link.setAttribute("href", `?watm-${language.className}`);
    lang_link.textContent = language.label;
    let lang_li = document.createElement("li");
    lang_li.appendChild(lang_link);
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
}

export function setLanguage(language) {
  // Set cookie for selected language
  setCookie("currentLanguage", language);
  // Reload page without language keyword
  window.location.href = window.location.href.replace(`?watm-${language}`, "");
}

export function getCurrentLanguage() {
  // Read selected language from cookie
  let currentLanguage = getCookie("currentLanguage");
  if (!currentLanguage) currentLanguage == "Default";

  return currentLanguage;
}

export function process(row) {
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
    case "placeholder":
      document.querySelectorAll(watmQuery).forEach(function (el) {
        el.setAttribute("placeholder", replacementText);
      });
      break;
    case "delay":
      setInterval(function () {
        document.querySelectorAll(watmQuery).forEach(function (el) {
          el.innerText = replacementText;
        });
      }, 1000);
      break;
    case "replace":
    case "replace_element":
      if (watmQuery == null || watmQuery == "") watmQuery = "body";
      document.querySelectorAll(watmQuery).forEach(function (el) {
        let regex = new RegExp("\\b" + defaultText + "\\b", "gi");
        walkText(el, regex, replacementText, watmFunction);
      });
      break;
    case "attribute":
      document
        .querySelectorAll(`[${watmQuery}="${defaultText}"]`)
        .forEach(function (el) {
          el.setAttribute(watmQuery, replacementText);
        });
      break;
  }
  if (watmFunction !== "inactive" && watmStyle !== null && watmStyle !== "")
    processCSS(watmQuery, watmStyle);
}

export function isInEditMode() {
  // Check if in admin view
  const bodyTag = document.querySelector("body");
  return bodyTag.classList.contains("adminContentView");
}

export function log(text, logType = "") {
  // Function for logging actions to console
  if (logType) logType = " " + logType;
  console.log(`[watm${logType}]`, text);
}

// Util function for setting cookies
const setCookie = (key, value) => {
  var expires = new Date();
  expires.setTime(expires.getTime() + 1 * 24 * 60 * 60 * 1000);
  document.cookie =
    key + "=" + value + ";path=/;expires=" + expires.toUTCString();
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

const walkText = (node, regex, replacementText, watmFunction) => {
  if (node.nodeType == 3) {
    if (watmFunction === "replace_element") {
      node.data = replacementText;
    } else if (watmFunction === "replace") {
      node.data = node.data.replace(regex, replacementText);
    }
  }
  if (node.nodeType == 1 && node.nodeName != "SCRIPT") {
    for (let i = 0; i < node.childNodes.length; i++) {
      walkText(node.childNodes[i], regex, replacementText, watmFunction);
    }
  }
};

const processCSS = (watmQuery, watmStyle) => {
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
  cssNode.innerHTML = `${watmQuery} { ${watmStyle} }`;
  document.head.appendChild(cssNode);
};
