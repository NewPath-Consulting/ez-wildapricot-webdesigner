// global variable for clipboard
// Initialize global clipboard variable
var clipboardPath;
var clipboardClass;
var clipboardId;
var clickedElement;

// Append link/button to launch inspector
export function appendBtn() {
  const btn = document.createElement("div");
  btn.classList.add("watm-inspector-launch-btn");
  btn.title = "Launch Page Inspector";
  document.body.appendChild(btn);
  btn.addEventListener("click", () => {
    window.location.href = window.location.href + "?dev";
  });
}

export function start() {
  createModal();
  interceptClicks();
  createInspectorBar();
}

// Attach inspector to footer of website
const createInspectorBar = () => {
  // add padding to bottom of page
  document.body.firstElementChild.style.paddingBottom = "150px";

  // create bar
  const inspectorBar = document.createElement("div");
  inspectorBar.id = "watm-inspector-bar";

  // create container for data
  const inspectorBody = document.createElement("div");
  inspectorBody.id = "watm-inspector-body";
  inspectorBody.classList.add("watm-inspector-body");
  inspectorBody.innerHTML = "<h1>Click on an element to begin</h1>";

  // create exit button
  const exitbtn = document.createElement("button");
  exitbtn.classList.add("watm-inspector-btn");
  exitbtn.innerText = "Exit Inspector";
  exitbtn.style.display = "block";

  // create path clipboard button
  const copyPathBtn = document.createElement("button");
  copyPathBtn.id = "watm-inspector-copy-path-btn";
  copyPathBtn.classList.add("watm-inspector-btn");
  copyPathBtn.innerText = "Copy CSS Path";
  copyPathBtn.addEventListener("click", () => {
    copyInspector(copyPathBtn);
  });

  // create id clipboard button
  const copyIdBtn = document.createElement("button");
  copyIdBtn.id = "watm-inspector-copy-id-btn";
  copyIdBtn.classList.add("watm-inspector-btn");
  copyIdBtn.innerText = "Copy Element ID";
  copyIdBtn.addEventListener("click", () => {
    copyInspector(copyIdBtn);
  });

  // create class clipboard button
  const copyClassBtn = document.createElement("button");
  copyClassBtn.id = "watm-inspector-copy-class-btn";
  copyClassBtn.classList.add("watm-inspector-btn");
  copyClassBtn.innerText = "Copy Element Class";
  copyClassBtn.addEventListener("click", () => {
    copyInspector(copyClassBtn);
  });

  // create view properties button
  const viewPropsBtn = document.createElement("button");
  viewPropsBtn.id = "watm-inspector-view-properties-btn";
  viewPropsBtn.classList.add("watm-inspector-btn");
  viewPropsBtn.innerText = "View Properties";
  viewPropsBtn.addEventListener("click", () => {
    viewElementProperties();
  });

  // add buttons to inspector bar
  inspectorBar.appendChild(exitbtn);
  inspectorBar.appendChild(copyClassBtn);
  inspectorBar.appendChild(copyIdBtn);
  inspectorBar.appendChild(copyPathBtn);
  inspectorBar.appendChild(viewPropsBtn);
  inspectorBar.appendChild(inspectorBody);

  // exit inspector
  exitbtn.addEventListener("click", () => {
    window.location.href = window.location.href.replace("?dev", "");
  });

  // attach inspector barr to screen
  document.body.appendChild(inspectorBar);
};

// Get full CSS path
const getPath = (el) => {
  let path = [];
  while (el.nodeType === Node.ELEMENT_NODE) {
    let selector = el.nodeName.toLowerCase();
    if (el.id) {
      selector += "#" + el.id;
    } else {
      let sib = el,
        nth = 1;
      while (
        sib.nodeType === Node.ELEMENT_NODE &&
        (sib = sib.previousSibling) &&
        nth++
      );
      selector += ":nth-child(" + nth + ")";
    }
    path.unshift(selector);
    el = el.parentNode;
  }
  return path.join(" > ");
};

const inspectElement = (element) => {
  // Remove WATM hover class
  element.classList.remove("watm-hover");

  // Store clicked element ID
  let clickedID = element.id;

  // Store clicked element class names
  let clickedClass = element.className;

  // Obtain CSS path of clicked element
  let completePath = getPath(element);

  // Ensure clicked element is not inspector container
  if (completePath.indexOf("#watm-inspector-bar") == -1) {
    // Show element information
    displyPath(completePath, clickedID, clickedClass);
  }

  clickedElement = element;
};

const interceptClicks = () => {
  // Intercept all page clicks
  document.addEventListener(
    "click",
    function (e) {
      let completePath = getPath(e.target);

      if (
        completePath.indexOf("#watm-props") == -1 &&
        !Array.from(e.target.classList).some((c) => c.startsWith("watm-modal"))
      ) {
        e.preventDefault();
        inspectElement(e.target);
      }
    },
    false
  );
  document.addEventListener(
    "mouseover",
    function (e) {
      let completePath = getPath(e.target);

      if (
        completePath.indexOf("#watm-inspector-bar") == -1 &&
        completePath.indexOf("#watm-props") == -1 &&
        !Array.from(e.target.classList).some((c) => c.startsWith("watm-modal"))
      ) {
        e.target.classList.add("watm-hover");
      }
    },
    false
  );
  document.addEventListener(
    "mouseout",
    function (e) {
      e.target.classList.remove("watm-hover");
    },
    false
  );
  return false;
};

const displyPath = (cssPath, elID, elClass) => {
  let elInfo = "";
  document.getElementById("watm-inspector-view-properties-btn").style.display =
    "block";

  if (cssPath.lastIndexOf("#") > -1) {
    // If the path contains an ID, start path from there
    cssPath = cssPath.substring(cssPath.lastIndexOf("#"));
  }
  if (elID) {
    // If clicked element has ID, display it
    elInfo = elInfo + "<p><b>Element ID:</b> #" + elID + "</p>";
    clipboardId = elID;
    document.getElementById("watm-inspector-copy-id-btn").style.display =
      "block";
  } else {
    clipboardId = null;
    document.getElementById("watm-inspector-copy-id-btn").style.display =
      "none";
  }
  if (elClass) {
    // If clicked element has classes, display them
    let elClasses = elClass.split(" ").join(" .");
    elInfo = elInfo + "<p><b>Element Class(es):</b> ." + elClasses + "</p>";
    clipboardClass = "." + elClasses;
    document.getElementById("watm-inspector-copy-class-btn").style.display =
      "block";
  } else {
    clipboardClass = null;
    document.getElementById("watm-inspector-copy-class-btn").style.display =
      "none";
  }
  // Display CSS path
  elInfo = elInfo + "<p><b>CSS Path:</b> " + cssPath + "</p>";

  // Add path to global clipboard variable
  clipboardPath = cssPath;
  document.getElementById("watm-inspector-copy-path-btn").style.display =
    "block";

  // Add to inspector container
  document.getElementById("watm-inspector-body").innerHTML = elInfo;
};

const copyInspector = (elm) => {
  switch (elm.id) {
    case "watm-inspector-copy-path-btn":
      navigator.clipboard.writeText(clipboardPath);
      break;
    case "watm-inspector-copy-class-btn":
      navigator.clipboard.writeText(clipboardClass);
      break;
    case "watm-inspector-copy-id-btn":
      navigator.clipboard.writeText("#" + clipboardId);
      break;
  }
  displayCopiedMessage(elm.id);
};

const displayCopiedMessage = (btnId) => {
  let prevMessage = $("#" + btnId).text();
  $("#" + btnId)
    .text("Copied to clipboard!")
    .attr("disabled", true);
  setTimeout(function () {
    $("#" + btnId)
      .text(prevMessage)
      .attr("disabled", false);
  }, 5000);
};

const createModal = () => {
  let modalDiv = document.createElement("div");
  modalDiv.classList.add("watm-modal");
  modalDiv.id = "watm-props-modal";

  let close = document.createElement("span");
  close.className = "watm-modal-close";
  close.innerHTML = "x";
  close.addEventListener("click", function () {
    modaloff();
  });

  let modalDivHolder = document.createElement("div");
  modalDivHolder.classList.add("watm-modal-body-holder");
  modalDivHolder.id = "watm-props-modal-body-holder";

  let modalDivBody = document.createElement("div");
  modalDivBody.classList.add("watm-modal-body");
  modalDivBody.id = "watm-props-modal-body";

  modalDivHolder.appendChild(modalDivBody);
  modalDiv.appendChild(modalDivHolder);
  modalDiv.appendChild(close);

  document.body.appendChild(modalDiv);
};

const show_watm_modal = () => {
  let overlayDiv = document.createElement("div");
  overlayDiv.classList.add("watm-modal-overlay");

  document.body.appendChild(overlayDiv);

  let el = document.querySelector("#watm-props-modal");

  el.classList.add("watm-modal-on");

  overlayDiv.addEventListener("click", function () {
    modaloff();
  });
};

const modaloff = () => {
  let el = document.querySelector("#watm-props-modal");
  let overlayDiv = document.querySelector(".watm-modal-overlay");

  el.classList.remove("watm-modal-on");
  document.body.removeChild(overlayDiv);
};

const viewElementProperties = () => {
  let compStyles = window.getComputedStyle(clickedElement);
  let tableHTML = "<h3>Element Properties</h3><table>";

  let propArray = [
    "position",
    "top",
    "left",
    "right",
    "bottom",
    "height",
    "width",
    "background",
    "border",
    "border-radius",
    "box-shadow",
    "box-sizing",
    "display",
    "color",
    "content",
    "font",
    "font-weight",
    "text-align",
    "text-decoration",
    "margin",
    "padding",
  ];

  if (clickedElement.innerText)
    tableHTML +=
      "<tr><th>innerText</th><td>" + clickedElement.innerText + "</td></tr>";
  if (clickedElement.value)
    tableHTML += "<tr><th>value</th><td>" + clickedElement.value + "</td></tr>";
  if (clickedElement.getAttribute("href"))
    tableHTML +=
      "<tr><th>link</th><td>" +
      clickedElement.getAttribute("href") +
      "</td></tr>";
  if (clickedElement.getAttribute("src"))
    tableHTML +=
      "<tr><th>source</th><td>" +
      clickedElement.getAttribute("src") +
      "</td></tr>";

  propArray.forEach((val) => {
    tableHTML +=
      "<tr><th>" +
      val +
      "</th><td>" +
      compStyles.getPropertyValue(val) +
      "</td></tr>";
  });

  tableHTML += "</html>";

  document.getElementById("watm-props-modal-body").innerHTML = tableHTML;

  show_watm_modal();
};
