const ez_version = 3.0;

let ezAdminLink = [];
let ez_languages = [];
let debugMode = false;
let currentLanguage;
const currentUrl = new URL(window.location.href);
const currentScript = document.currentScript;
const ezLocation = currentScript.src.substring(
  0,
  currentScript.src.lastIndexOf("/")
);
let savedJSON = {};
const ezFile = `${ezLocation}/ezdesigner.json`;
let languageSwitcherId = "language_switch";

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadResources([
      { type: "css", href: `${ezLocation}/css/app.css` },
      { type: "script", src: `${ezLocation}/scripts/functions.js` },
      {
        type: "script",
        src: "https://cdn.jsdelivr.net/npm/html2canvas-pro@1.5.0/dist/html2canvas-pro.min.js",
      },
    ]);
    startEZ();
  } catch (error) {
    console.error("Error loading resources:", error);
  }
});

const loadResources = (resources) => {
  return Promise.all(
    resources.map((resource) => {
      return new Promise((resolve, reject) => {
        let element;
        if (resource.type === "css") {
          element = document.createElement("link");
          element.type = "text/css";
          element.rel = "stylesheet";
          element.href = resource.href;
        } else if (resource.type === "script") {
          element = document.createElement("script");
          element.type = "text/javascript";
          element.src = resource.src;
        }

        element.onload = resolve;
        element.onerror = reject;

        if (resource.type === "script") {
          element.onreadystatechange = () => {
            if (element.readyState === "complete") resolve();
          };
        }

        document.head.appendChild(element);
      });
    })
  );
};

const startEZ = async () => {
  try {
    handleLanguageSettings();
    const currentLanguage = getCurrentLanguage();
    initializePage(currentLanguage);
    await loadEZJSON();
    captureWebPage();
    initializeUIElements();
    addEventListeners();
    checkInspectorStatus();
  } catch (error) {
    console.error("Error during initialization:", error);
  }
};

const handleLanguageSettings = () => {
  const language = urlParams.get("language");
  if (language) {
    setLanguage(language);
    urlParams.delete("language");
    window.history.replaceState({}, "", `${currentUrl.pathname}?${urlParams}`);
  }
};

const initializePage = (currentLanguage) => {
  processElements(document.querySelector("body > div:first-of-type"));
  createToggle(currentLanguage);
  hideOtherLanguages(currentLanguage);
};

const hideOtherLanguages = (currentLanguage) => {
  scopeLanguages.forEach(([_, langClass]) => {
    if (langClass !== currentLanguage) {
      document.querySelectorAll(`.${langClass}`).forEach((el) => {
        el.classList.add("ez_hidden_language");
      });
    }
  });
};

const loadEZJSON = async () => {
  try {
    const response = await fetch(ezFile, { method: "GET" });
    if (response.ok) {
      savedJSON = await response.json();
      console.log("EZ JSON loaded successfully");
      processJSON();
    } else {
      console.warn(
        "EZ JSON not loaded. Status:",
        response.status,
        response.statusText
      );
    }
  } catch (error) {
    console.error("Error loading EZ JSON:", error);
  }
};

const captureWebPage = () => {
  html2canvas(document.querySelector("body > div:first-of-type"))
    .then((canvas) => {
      const ctx = canvas.getContext("2d");
      pageCapture = ctx.getImageData(0, 0, canvas.width, canvas.height);
    })
    .catch((error) => {
      console.error("Error capturing the webpage:", error);
    });
};

const initializeUIElements = () => {
  const ezToaster = createElementWithAttributes("div", {
    id: "ez_toaster_container",
    className: "ez_toaster_container",
  });
  const ezSidebar = createElementWithAttributes("div", {
    id: "ez_sidebar",
    className: "ez_sidebar",
  });
  const ezActionbar = createElementWithAttributes("div", {
    id: "ez_actionbar",
    className: "ez_actionbar",
  });
  const ezIcon = createElementWithAttributes("div", {
    id: "ezIcon",
    className: "ezIcon",
    title: `Launch EZ WildApricot Designer ${ez_version}`,
    onclick: () => {
      toggleEz();
    },
  });

  const ezInspect = createAdminLink("EZ Designer");

  ezAdminLink.forEach((entry, index) => {
    createAdminLink(entry[0], (URL = entry[1]));
  });

  ezInspect.querySelector("a").addEventListener("click", toggleEz);

  document.body.append(ezToaster, ezSidebar, ezActionbar, ezIcon);
};

const addEventListeners = () => {
  document.addEventListener("keydown", handleKeydown);
};

const checkInspectorStatus = () => {
  if (getCookie("inInspector")) {
    setTimeout(toggleEz, 500);
  }
};

const toggleEz = () => {
  if (!document.body.classList.contains("ez_active")) {
    document.body.classList.add("ez_active");
    checkLicense();
  }
};

const createAdminLink = (innerText, href) => {
  const container = document.createElement("div");
  container.className =
    "-wa-admin-switcher_admin-view-link-container ez_admin_link";

  const link = document.createElement("a");
  link.target = "_blank";
  if (href) {
    link.href = href;
  }
  link.innerText = innerText;
  link.className = "-wa-admin-switcher_link";

  container.appendChild(link);
  return insertAdminLink(container);
};

const insertAdminLink = (linkContainer) => {
  const parentElement = document.getElementById("idWaAdminSwitcher");
  if (parentElement) {
    const adminLinks = parentElement.querySelectorAll(".ez_admin_link");
    if (adminLinks.length > 0) {
      const lastAdminLink = adminLinks[adminLinks.length - 1];
      if (lastAdminLink.nextSibling) {
        parentElement.insertBefore(linkContainer, lastAdminLink.nextSibling);
      } else {
        parentElement.appendChild(linkContainer);
      }
    } else {
      const firstChild = parentElement.firstChild;
      parentElement.insertBefore(linkContainer, firstChild);
    }
    parentElement.style.width =
      parentElement.offsetWidth + linkContainer.offsetWidth + "px";
  }
  return linkContainer;
};
