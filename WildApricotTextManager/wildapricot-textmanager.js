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
const ezFile = `${ezLocation}/css/ezdesigner.json`;
let languageSwitcherId = "language_switch";

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

document.addEventListener("DOMContentLoaded", () => {
  initializeez();
});

const initializeez = () => {
  loadCSS(`${ezLocation}/css/app.css`);
  loadScript(`${ezLocation}/scripts/functions.js`, () => {
    loadScript(
      "https://cdn.jsdelivr.net/npm/html2canvas-pro@1.5.0/dist/html2canvas-pro.min.js",
      startez
    );
  });
};

const loadCSS = (href) => {
  const link = document.createElement("link");
  link.type = "text/css";
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
};

const loadScript = (src, callback) => {
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src = src;
  script.onload = callback;
  script.onreadystatechange = () => {
    if (script.readyState === "complete") callback();
  };
  document.head.appendChild(script);
};

const startez = async () => {
  if (urlParams.get("language")) {
    setLanguage(urlParams.get("language"));
    urlParams.delete("language");
    window.history.replaceState({}, "", `${currentUrl.pathname}?${urlParams}`);
  }

  currentLanguage = getCurrentLanguage();

  createToggle(currentLanguage);

  processElements(document.querySelector("body > div:first-of-type"));

  try {
    const response = await fetch(ezFile, {
      method: "GET",
    });

    if (response.ok) {
      savedJSON = await response.json();
      console.log("EZ JSON loaded successfully");
    } else if (response.status === 404) {
      console.log("EZ JSON does not exist.");
    } else {
      console.log("Failed to load EZ JSON: " + response.statusText);
    }
  } catch (error) {
    console.log("EZ Error: " + error.message);
  }

  html2canvas(document.querySelector("body > div:first-of-type"))
    .then((canvas) => {
      const ctx = canvas.getContext("2d");
      pageCapture = ctx.getImageData(0, 0, canvas.width, canvas.height);
    })
    .catch((error) => {
      console.error("Error capturing the webpage:", error);
    });

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
  });

  ezIcon.addEventListener("click", toggleez);

  const ezInspect = createAdminLink("EZ Designer");

  ezAdminLink.forEach((entry, index) => {
    createAdminLink(entry[0], (URL = entry[1]));
  });

  ezInspect.querySelector("a").addEventListener("click", toggleez);

  document.body.append(ezToaster, ezSidebar, ezActionbar, ezIcon);

  document.addEventListener("keydown", handleKeydown);
};

const toggleez = () => {
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
      // If no .ez_admin_link elements, insert at the beginning
      const firstChild = parentElement.firstChild;
      parentElement.insertBefore(linkContainer, firstChild);
    }
    // Update the width of the parent element to accommodate the new linkContainer
    parentElement.style.width =
      parentElement.offsetWidth + linkContainer.offsetWidth + "px";
  }
  return linkContainer;
};
