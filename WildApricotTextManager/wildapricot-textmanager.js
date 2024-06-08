const watm_version = 3.0;

let ezAdminLink = [];
let watm_languages = [];
let debugMode = false;
const currentScript = document.currentScript;
const watmLocation = currentScript.src.substring(
  0,
  currentScript.src.lastIndexOf("/")
);

document.addEventListener("DOMContentLoaded", () => {
  initializeWATM();
});

const initializeWATM = () => {
  loadCSS(`${watmLocation}/css/app.css`);
  loadScript(`${watmLocation}/scripts/functions.js`, () => {
    loadScript(
      "https://cdn.jsdelivr.net/npm/html2canvas-pro@1.5.0/dist/html2canvas-pro.min.js",
      startWATM
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

const startWATM = () => {
  processElements(document.querySelector("body > div:first-of-type"));

  html2canvas(document.querySelector("body > div:first-of-type"))
    .then((canvas) => {
      const ctx = canvas.getContext("2d");
      pageCapture = ctx.getImageData(0, 0, canvas.width, canvas.height);
    })
    .catch((error) => {
      console.error("Error capturing the webpage:", error);
    });

  const watmToaster = createElementWithAttributes("div", {
    id: "watm_toaster_container",
    className: "watm_toaster_container",
  });

  const watmSidebar = createElementWithAttributes("div", {
    id: "watm_sidebar",
    className: "watm_sidebar",
  });
  const watmActionbar = createElementWithAttributes("div", {
    id: "watm_actionbar",
    className: "watm_actionbar",
  });
  const watmIcon = createElementWithAttributes("div", {
    id: "watmIcon",
    className: "watmIcon",
    title: `Launch EZ WildApricot Designer ${watm_version}`,
  });

  watmIcon.addEventListener("click", toggleWATM);

  const watmInspect = createAdminLink("EZ Designer");

  ezAdminLink.forEach((entry, index) => {
    createAdminLink(entry[0], (URL = entry[1]));
  });

  watmInspect.querySelector("a").addEventListener("click", toggleWATM);

  document.body.append(watmToaster, watmSidebar, watmActionbar, watmIcon);

  document.addEventListener("keydown", handleKeydown);
};

const toggleWATM = () => {
  if (!document.body.classList.contains("watm_active")) {
    document.body.classList.add("watm_active");
    checkLicense();
  }
};

const createAdminLink = (innerText, href) => {
  const container = document.createElement("div");
  container.className =
    "-wa-admin-switcher_admin-view-link-container watm_admin_link";

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
    const adminLinks = parentElement.querySelectorAll(".watm_admin_link");
    if (adminLinks.length > 0) {
      const lastAdminLink = adminLinks[adminLinks.length - 1];
      if (lastAdminLink.nextSibling) {
        parentElement.insertBefore(linkContainer, lastAdminLink.nextSibling);
      } else {
        parentElement.appendChild(linkContainer);
      }
    } else {
      // If no .watm_admin_link elements, insert at the beginning
      const firstChild = parentElement.firstChild;
      parentElement.insertBefore(linkContainer, firstChild);
    }
    // Update the width of the parent element to accommodate the new linkContainer
    parentElement.style.width =
      parentElement.offsetWidth + linkContainer.offsetWidth + "px";
  }
  return linkContainer;
};
