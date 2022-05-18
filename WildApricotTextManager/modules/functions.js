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
function setCookie(key, value) {
  var expires = new Date();
  expires.setTime(expires.getTime() + 1 * 24 * 60 * 60 * 1000);
  document.cookie =
    key + "=" + value + ";path=/;expires=" + expires.toUTCString();
}

// Util function for reading cookies
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
