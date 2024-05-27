const watm_version = 3.0;

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
      "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
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

  const watmHero = createAdminLink(
    "Hero Call",
    "https://newpathconsulting.com/wildapricot-hero/"
  );
  const watmInspect = createAdminLink("EZ Designer");

  watmInspect.querySelector("a").addEventListener("click", toggleWATM);

  document.body.append(watmToaster, watmSidebar, watmActionbar, watmIcon);
  insertAdminLink(watmHero);
  insertAdminLink(watmInspect);

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
  container.className = "-wa-admin-switcher_admin-view-link-container";

  const link = document.createElement("a");
  link.target = "_blank";
  if (href) {
    link.href = href;
  }
  link.innerText = innerText;
  link.className = "-wa-admin-switcher_link";

  container.appendChild(link);
  return container;
};

const insertAdminLink = (linkContainer) => {
  const parentElement = document.getElementById("idWaAdminSwitcher");
  if (parentElement) {
    const firstChild = parentElement.firstChild;
    parentElement.insertBefore(linkContainer, firstChild);
  }
};
