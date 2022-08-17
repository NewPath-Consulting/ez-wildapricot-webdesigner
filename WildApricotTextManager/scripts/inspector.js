// global variable for clipboard
// Initialize global clipboard variable
var clipboardPath;
var clipboardClass;
var clipboardId;
var clickedElement;

var csvTable;

let watmFunctions = [
  "",
  "text",
  "replace",
  "delay",
  "button",
  "inactive",
  "hide",
  "placeholder",
  "attribute",
  "@media",
  "link",
  "createlink",
  "source",
  "tooltip",
  "googlefont",
];

const urlParams = new URLSearchParams(window.location.search);

let currentDateTime = new Date().toLocaleString();

let tableColumns = [
  { title: "Wild Apricot Reference", type: "text" },
  { title: "Default Text", type: "text" },
  { title: "Replacement Text", type: "text" },
  { title: "Function", type: "dropdown", source: watmFunctions },
  { title: "Query", type: "text" },
  { title: "Style", type: "text" },
  { title: "Notes", type: "text" },
];

const fileSelecter = document.createElement("div");

const launchInspector = (languages, watm_location) => {
  createModal();
  interceptClicks();
  createInspectorBar();
  setupEditor(languages, watm_location);
};

// Attach inspector to footer of website
const createInspectorBar = () => {
  // add padding to bottom of page
  //document.body.firstElementChild.style.paddingBottom = "50vh";

  // create bar
  const inspectorBar = document.createElement("div");
  inspectorBar.id = "watm-inspector-bar";

  // create container for data
  const inspectorBody = document.createElement("div");
  inspectorBody.id = "watm-inspector-body";
  inspectorBody.classList.add("watm-inspector-body");
  inspectorBody.innerHTML =
    "<p><strong>Hover and click on a web page element to view its properties</strong></p>";

  // create container for editor
  const editorBody = document.createElement("div");
  editorBody.id = "watm-editor-body";
  editorBody.classList.add("watm-editor-body");

  // create exit button
  const exitbtn = document.createElement("button");
  exitbtn.classList.add("watm-inspector-btn");
  exitbtn.innerText = "Exit Editor";
  exitbtn.style.display = "block";

  // create path clipboard button
  const copyPathBtn = document.createElement("button");
  copyPathBtn.id = "watm-inspector-copy-path-btn";
  copyPathBtn.classList.add("watm-inspector-btn");
  copyPathBtn.innerText = "Copy CSS Path";
  copyPathBtn.addEventListener("click", () => {
    copyInspector(copyPathBtn);
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
  inspectorBar.appendChild(copyPathBtn);
  inspectorBar.appendChild(viewPropsBtn);
  inspectorBar.appendChild(inspectorBody);
  inspectorBar.appendChild(editorBody);

  // exit inspector
  exitbtn.addEventListener("click", () => {
    window.location.href =
      window.location.href.split("?")[0] + "?t=" + Date.now();
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
        completePath.indexOf("#watm-inspector-bar") == -1 &&
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

  if (clickedElement.innerText) {
    // Do not include text of child elements
    let childElement = clickedElement.firstChild;
    let clickedTexts = [];
    while (childElement) {
      if (childElement.nodeType == 3) {
        clickedTexts.push(childElement.data);
      }
      childElement = childElement.nextSibling;
    }
    let clickedText = clickedTexts.join(" ").trim();
    if (clickedText)
      tableHTML += "<tr><th>innerText</th><td>" + clickedText + "</td></tr>";
  }

  if (clickedElement.value)
    tableHTML += "<tr><th>value</th><td>" + clickedElement.value + "</td></tr>";
  if (clickedElement.getAttribute("href"))
    tableHTML +=
      "<tr><th>link</th><td>" +
      clickedElement.getAttribute("href") +
      "</td></tr>";
  if (clickedElement.getAttribute("src")) {
    tableHTML +=
      "<tr><th>source</th><td>" +
      clickedElement.getAttribute("src") +
      "</td></tr>";

    const colorThief = new ColorThief();

    let dominantColor = colorThief.getColor(clickedElement);
    let paletteColors = colorThief.getPalette(clickedElement, 3);

    let dominantColorHex = rgbToHex(
      dominantColor[0],
      dominantColor[1],
      dominantColor[2]
    );

    tableHTML +=
      "<tr><th>Primary Color</th><td>" +
      `<div class="colorInfo"><div class="swatch" style="background-color: ${dominantColorHex}"></div><div class="hex">${dominantColorHex}</div></div>` +
      "</td></tr>";

    tableHTML += "<tr><th>Palette Colors</th><td>";

    paletteColors.forEach((paletteColor) => {
      let paletteColorHex = rgbToHex(
        paletteColor[0],
        paletteColor[1],
        paletteColor[2]
      );
      tableHTML += `<div class="colorInfo"><div class="swatch" style="background-color: ${paletteColorHex}"></div><div class="hex">${paletteColorHex}</div></div>`;
    });

    tableHTML += "</td></tr>";
  }

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

const setupEditor = (languages, watm_location) => {
  let csvSelector = document.createElement("select");
  csvSelector.id = "watm-csv-toggle";
  let opt = document.createElement("option");
  opt.value = `${watm_location}/config.csv`;
  opt.text = "[ Global Configuration ]";
  csvSelector.appendChild(opt);
  languages.forEach(function (language, index) {
    let opt = document.createElement("option");
    opt.value = `${watm_location}/translations/${language.filename}`;
    opt.text = `${language.label} (${language.className}) Translations`;
    if (urlParams.get("f") == language.filename) opt.selected = true;
    csvSelector.appendChild(opt);
  });

  // create save button
  const saveBtn = document.createElement("button");
  saveBtn.id = "watm-save-btn";
  saveBtn.classList.add("watm-save-btn");
  saveBtn.innerText = "Save changes to Site";
  saveBtn.addEventListener("click", () => {
    let filePath = csvTable.options.csv.substring(
      0,
      csvTable.options.csv.lastIndexOf("/")
    );
    let filename = csvTable.options.csv.substring(
      csvTable.options.csv.lastIndexOf("/") + 1
    );

    let csv = csvTable.copy(
      false,
      csvTable.options.csvDelimiter,
      true,
      true,
      true
    );

    let csvData = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    var xhr = new XMLHttpRequest();
    xhr.open("POST", filePath, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) console.log(xhr.responseText);
      window.location.href =
        window.location.href.split("?")[0] +
        "?dev&f=" +
        filename +
        "&t=" +
        Date.now();
    };
    xhr.onload = function (e) {
      if (xhr.status == 200) {
        console.log("uploaded"); //(correctly uploaded)
      } else
        console.log(
          "Error " + e.status + " occurred uploading your file.<br />"
        );
    };

    var formData = new FormData();
    formData.append("localfile", csvData, filename);
    formData.append("filetype", "csv");
    formData.append("source", "SOFT");
    xhr.send(formData);
  });

  const fileSelecterSpan = document.createElement("span");

  const fileSelecterSpan2 = document.createElement("span");
  fileSelecterSpan.innerText = "Select the file you wish to edit: ";
  fileSelecterSpan2.appendChild(csvSelector);
  fileSelecter.appendChild(fileSelecterSpan);
  fileSelecter.appendChild(fileSelecterSpan2);
  fileSelecter.appendChild(saveBtn);

  fileSelecter.classList.add("fileSelecter");

  const csvTableContainer = document.createElement("div");
  csvTableContainer.id = "csvTableContainer";

  document.getElementById("watm-editor-body").appendChild(fileSelecter);

  document.getElementById("watm-editor-body").appendChild(csvTableContainer);

  csvSelector.addEventListener("change", (event) => {
    loadCSV(event.target.value);
  });

  loadCSV(document.getElementById("watm-csv-toggle").value);

  document.body.firstElementChild.style.paddingBottom =
    document.getElementById("watm-inspector-bar").offsetHeight + 300 + "px";
};

const setUpdateDate = (instance, cell, x, y, value) => {
  if (x == "6") return false;
  csvTable.setValueFromCoords(6, y, "Last updated: " + currentDateTime);
};

let loadCSV = (csvFile) => {
  jexcel.destroy(document.getElementById("csvTableContainer"), false);

  csvTable = jspreadsheet(document.getElementById("csvTableContainer"), {
    csv: csvFile,
    csvHeaders: true,
    tableOverflow: true,
    minDimensions: [7, 10],
    columns: tableColumns,
    tableWidth: "100%",
    tableHeight: "20vh",
    search: true,
    parseFormulas: false,
    allowInsertColumn: false,
    allowManualInsertColumn: false,
    allowDeleteColumn: false,
    allowRenameColumn: false,
    allowComments: false,
    allowExport: true,
    csvFileName: csvFile.substring(csvFile.lastIndexOf("/") + 1).split(".")[0],
    onchange: setUpdateDate,
    contextMenu: function (obj, x, y, e) {
      var items = [];

      if (y == null) {
        // Sorting
        if (obj.options.columnSorting == true) {
          // Line
          items.push({ type: "line" });

          items.push({
            title: obj.options.text.orderAscending,
            onclick: function () {
              obj.orderBy(x, 0);
            },
          });
          items.push({
            title: obj.options.text.orderDescending,
            onclick: function () {
              obj.orderBy(x, 1);
            },
          });
        }
      } else {
        // Insert new row
        if (obj.options.allowInsertRow == true) {
          items.push({
            title: obj.options.text.insertANewRowBefore,
            onclick: function () {
              obj.insertRow(1, parseInt(y), 1);
            },
          });

          items.push({
            title: obj.options.text.insertANewRowAfter,
            onclick: function () {
              obj.insertRow(1, parseInt(y));
            },
          });
        }

        items.push({ type: "line" });

        // Copy
        items.push({
          title: "Copy",
          onclick: function () {
            obj.copy(obj.selectedCell[0], obj.selectedCell[1]);
          },
        });

        // Paste
        if (navigator && navigator.clipboard && navigator.clipboard.readText) {
          items.push({
            title: "Paste",
            onclick: function () {
              if (obj.selectedCell) {
                navigator.clipboard.readText().then(function (text) {
                  if (text) {
                    obj.paste(obj.selectedCell[0], obj.selectedCell[1], text);
                  }
                });
              }
            },
          });
        }

        items.push({ type: "line" });

        if (obj.options.allowDeleteRow == true) {
          items.push({
            title: obj.options.text.deleteSelectedRows,
            onclick: function () {
              obj.deleteRow(
                obj.getSelectedRows().length ? undefined : parseInt(y)
              );
            },
          });
        }
      }

      // Line
      items.push({ type: "line" });

      // Save
      if (obj.options.allowExport) {
        items.push({
          title: "Download Configuration File (CSV)",
          onclick: function () {
            obj.download(true);
          },
        });
      }

      // Line
      items.push({ type: "line" });

      // Help
      if (obj.options.about) {
        items.push({
          title: "Support Forum",
          onclick: function () {
            window.open(
              "https://talk.newpathconsulting.com/c/wa-discuss/watm/7"
            );
          },
        });
      }
      // Help
      if (obj.options.about) {
        items.push({
          title: "I need a WildApricot Hero!",
          onclick: function () {
            window.open("https://newpathconsulting.com/wildapricot-hero");
          },
        });
      }

      return items;
    },
  });
};

const rgbToHex = (r, g, b) =>
  "#" +
  [r, g, b]
    .map((x) => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    })
    .join("");
