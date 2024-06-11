let draftJSON = {};
let saveJSONString;
let removeListeners = [];
let pageCapture;
let editorLoaded = false;
let debugVisible = false;
let missingTags = [];
let changesMade = false;

if (typeof checkCode == "undefined") {
  let checkCode = "8euj9o9frkj3wz2nqm6xmcp4y1mdy5tp";
}
if (typeof license_key == "undefined") {
  let license_key = "";
}

const scopeLanguages = ez_languages;

const ezModifyOptions = [
  { type: "text", value: "text", text: "Change Text" },
  { type: "link", value: "linkText", text: "Change Link Text" },
  { type: "link", value: "url", text: "Change Link URL" },
  { type: "button", value: "buttonValue", text: "Change Button Text" },
  { type: "textbox", value: "placeholder", text: "Change Placeholder Text" },
  { type: "dropdown", value: "dropdown", text: "Change Dropdown Value" },
];

const loadEZ = () => {
  if (editorLoaded) return;
  setCookie("inInspector", true);

  //draftJSON = savedJSON;

  const ezActionbarLogo = createElementWithAttributes("div", {
    id: "ez_actionbar_logo",
  });
  const logoImage = createElementWithAttributes("img", {
    src: `${ezLocation}/css/logo.png`,
    alt: "ez",
  });
  ezActionbarLogo.append(logoImage);

  const ezActionbarAppName = createElementWithAttributes("div", {
    id: "ez_actionbar_title",
    innerText: `EZ WildApricot Designer ${ez_version}`,
  });

  const ezActionbarScreen = createElementWithAttributes("div", {
    id: "ez_actionbar_screen",
  });

  const ezActionbarExportPage = createElementWithAttributes("button", {
    id: "ez_exportPage_button",
    innerText: "Export Current Page",
    onclick: () => {
      exportFilename = `EZ-Designer - ${document.title} (${Date.now()}).csv`;
      ezExport(draftJSON, exportFilename, true, true);
    },
  });

  const ezActionbarExportAll = createElementWithAttributes("button", {
    id: "ez_exportAll_button",
    innerText: "Export All Site Mods",
    onclick: () => {
      exportFilename = `EZ-Designer - All Modifications (${Date.now()}).csv`;
      ezExport(savedJSON, exportFilename, false, false);
    },
  });

  const ezActionbarExportMissing = createElementWithAttributes("button", {
    id: "ez_exportMissing_button",
    innerText: "Export Missing Mods",
    onclick: () => {
      exportFilename = `EZ-Designer - Missing Elements From ${
        document.title
      } (${Date.now()}).csv`;
      ezExportMissing(exportFilename);
    },
  });

  const ezActionbarImportMods = createElementWithAttributes("button", {
    id: "ez_importMods_button",
    innerText: "Import Mods",
  });

  ezActionbarScreen.append(
    ezActionbarExportPage,
    ezActionbarExportMissing,
    ezActionbarExportAll,
    ezActionbarImportMods
  );

  const ezActionbarSave = createElementWithAttributes("div", {
    id: "ez_actionbar_save",
  });
  const ezSaveButton = createElementWithAttributes("button", {
    id: "ez_save_button",
    innerText: "Save",
  });
  ezSaveButton.addEventListener("click", ezSavePage);

  ezActionbarSave.append(ezSaveButton);

  const ezActionbarExit = createElementWithAttributes("div", {
    id: "ez_actionbar_exit",
  });
  const ezExitButton = createElementWithAttributes("button", {
    id: "ez_exit_button",
    innerText: "Exit Editor",
  });
  ezExitButton.addEventListener("click", exitEditor);
  ezActionbarExit.append(ezExitButton);

  const ezActionbarPalette = createElementWithAttributes("div", {
    id: "ez_actionbar_palette",
  });
  const ezActionbarPaletteButton = createElementWithAttributes("button", {
    id: "ez_palette_button",
    innerText: "Colour Palette",
  });

  const ezActionbarPaletteContent = createElementWithAttributes("div", {
    id: "ez_palette_content",
  });

  const ezActionbarPaletteContentTop = createElementWithAttributes("div", {
    className: "ez_palette_top",
  });

  const ezActionbarPaletteContentInfo = createElementWithAttributes("p", {
    className: "ez_palette_info",
    innerText:
      "Below are the most common colours found on this page. Click on a colour to copy its hex code to the clipboard.",
  });

  ezActionbarPaletteButton.addEventListener("click", function (event) {
    ezActionbarPaletteContent.style.display =
      ezActionbarPaletteContent.style.display === "block" ? "none" : "block";
    event.stopPropagation();
  });

  const documentClickHandler = function (event) {
    if (
      event.target !== ezActionbarPaletteButton &&
      !ezActionbarPaletteContent.contains(event.target)
    ) {
      ezActionbarPaletteContent.style.display = "none";
    }
  };

  document.addEventListener("click", documentClickHandler);
  removeListeners.push(() =>
    document.removeEventListener("click", documentClickHandler)
  );

  ezActionbarPaletteContent.addEventListener("click", function (event) {
    event.stopPropagation();
  });

  ezActionbarPaletteContent.append(
    ezActionbarPaletteContentTop,
    ezActionbarPaletteContentInfo
  );

  const palette = getColorPalette(pageCapture, 9);

  palette.forEach((colour) => {
    const box = document.createElement("div");
    box.className = "ez_palette_box";
    box.style.backgroundColor = colour.rgb;

    const hexCode = document.createElement("span");
    hexCode.innerText = colour.hex;
    box.appendChild(hexCode);

    box.addEventListener("click", () => {
      navigator.clipboard
        .writeText(colour.hex)
        .then(() => {
          showezToast("Colour code copied to clipboard");
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
        });
    });

    ezActionbarPaletteContent.appendChild(box);
  });

  ezActionbarPalette.append(
    ezActionbarPaletteButton,
    ezActionbarPaletteContent
  );

  const ezActionbar = document.getElementById("ez_actionbar");
  ezActionbar.append(
    ezActionbarLogo,
    ezActionbarAppName,
    ezActionbarScreen,
    ezActionbarPalette,
    ezActionbarSave,
    ezActionbarExit
  );

  const ezSelectedElement = createElementWithAttributes("div", {
    id: "ez_selected_element",
  });
  const selectElementText = createElementWithAttributes("div", {
    id: "ez_selected_element_text",
    innerText: "Click an item on the webpage to inspect and modify it.",
  });
  ezSelectedElement.append(selectElementText);

  document.getElementById("ez_sidebar").append(ezSelectedElement);

  const ezSidebarChangeHandler = function (event) {
    if (event.target.tagName === "INPUT" || event.target.tagName === "SELECT") {
      saveEzDraft(event.target.id);
    }
  };

  document
    .getElementById("ez_sidebar")
    .addEventListener("change", ezSidebarChangeHandler);
  removeListeners.push(() =>
    document
      .getElementById("ez_sidebar")
      .removeEventListener("change", ezSidebarChangeHandler)
  );

  const debouncedToast = ezdebounce((eztag) => {
    saveEzDraft(eztag);
  }, 1000);

  const ezSidebarInputHandler = function (event) {
    if (event.target.isContentEditable) {
      debouncedToast(event.target.id);
    }
  };

  document
    .getElementById("ez_sidebar")
    .addEventListener("input", ezSidebarInputHandler);
  removeListeners.push(() =>
    document
      .getElementById("ez_sidebar")
      .removeEventListener("input", ezSidebarInputHandler)
  );

  const outlineRemoveListeners = outlineElements();
  removeListeners.push(outlineRemoveListeners);

  interceptClicks();

  editorLoaded = true;
};

const handleKeydown = (event) => {
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === "E") {
    event.preventDefault();
    if (!document.body.classList.contains("ez_active")) {
      document.body.classList.add("ez_active");
      loadEZ();
    }
  }
  if (
    debugMode &&
    editorLoaded &&
    !debugVisible &&
    (event.ctrlKey || event.metaKey) &&
    event.shiftKey &&
    event.key === "Z"
  ) {
    debugVisible = true;
    var webpageContentContainer = document.querySelector(
      "body > div:first-of-type"
    );

    const ezDebugWindow = createElementWithAttributes("div", {
      id: "ezDebugWindow",
    });

    webpageContentContainer.appendChild(ezDebugWindow);
    setTimeout(function () {
      document.getElementById("ezDebugWindow").classList.add("show");
    }, 100);

    debugClose = createElementWithAttributes("button", {
      innerText: "Close",
      onclick: () => {
        ezDebugWindow.remove();
        debugVisible = false;
      },
    });

    debugExport = createElementWithAttributes("button", {
      innerText: "Export Page",
      onclick: () => {
        exportFilename = `EZ-Designer - ${document.title} (${Date.now()}).csv`;
        ezExport(draftJSON, exportFilename, true, true);
      },
    });

    ezDebugWindow.append(
      createElementWithAttributes("h1", {
        innerText: "Debug Window: Draft JSON",
      }),
      document.createElement("hr"),
      debugClose,
      debugExport,
      createElementWithAttributes("pre", {
        innerText: JSON.stringify(draftJSON, null, 2),
      })
    );
  }
};

const exitEditor = () => {
  if (changesMade) {
    if (
      !confirm(
        "You have unsaved changes. Are you sure you want to exit without saving?"
      )
    ) {
      return;
    }
    setCookie("inInspector", false);
    location.reload();
  }
  document.body.classList.remove("ez_active");
  document.getElementById("ez_actionbar").innerHTML = "";
  document.getElementById("ez_sidebar").innerHTML = "";
  document
    .querySelectorAll(".ez_selected, .ez_editable_selected")
    .forEach((element) => {
      element.classList.remove("ez_selected", "ez_editable_selected");
    });

  removeListeners.forEach((removeListener) => removeListener());
  removeListeners = [];

  editorLoaded = false;
  setCookie("inInspector", false);
};

const getCssPath = (element) => {
  if (element.tagName === "HTML") return "HTML";
  const path = [];
  while (element && element.nodeType === Node.ELEMENT_NODE) {
    let selector = element.nodeName.toLowerCase();
    if (element.id) {
      selector += `#${element.id}`;
      path.unshift(selector);
      break;
    } else {
      let sibling = element,
        siblingIndex = 1;
      while (sibling.previousElementSibling) {
        sibling = sibling.previousElementSibling;
        siblingIndex++;
      }
      selector += `:nth-of-type(${siblingIndex})`;
    }
    path.unshift(selector);
    element = element.parentNode;
  }
  return path.join(" > ");
};

const sha1 = (str) => {
  const rotate_left = (n, s) => (n << s) | (n >>> (32 - s));
  const cvt_hex = (val) => {
    let str = "";
    for (let i = 7; i >= 0; i--) {
      let v = (val >>> (i * 4)) & 0x0f;
      str += v.toString(16);
    }
    return str;
  };

  let blockstart;
  let i, j;
  const W = new Array(80);
  let H0 = 0x67452301;
  let H1 = 0xefcdab89;
  let H2 = 0x98badcfe;
  let H3 = 0x10325476;
  let H4 = 0xc3d2e1f0;
  let A, B, C, D, E;
  let temp;

  str = unescape(encodeURIComponent(str));
  const str_len = str.length;

  const word_array = [];
  for (i = 0; i < str_len - 3; i += 4) {
    j =
      (str.charCodeAt(i) << 24) |
      (str.charCodeAt(i + 1) << 16) |
      (str.charCodeAt(i + 2) << 8) |
      str.charCodeAt(i + 3);
    word_array.push(j);
  }

  switch (str_len % 4) {
    case 0:
      i = 0x080000000;
      break;
    case 1:
      i = (str.charCodeAt(str_len - 1) << 24) | 0x0800000;
      break;
    case 2:
      i =
        (str.charCodeAt(str_len - 1) << 16) |
        (str.charCodeAt(str_len - 2) << 24) |
        0x08000;
      break;
    case 3:
      i =
        (str.charCodeAt(str_len - 1) << 8) |
        (str.charCodeAt(str_len - 2) << 16) |
        (str.charCodeAt(str_len - 3) << 24) |
        0x80;
      break;
  }

  word_array.push(i);
  while (word_array.length % 16 !== 14) word_array.push(0);

  word_array.push(str_len >>> 29);
  word_array.push((str_len << 3) & 0x0ffffffff);

  for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {
    for (i = 0; i < 16; i++) W[i] = word_array[blockstart + i];
    for (i = 16; i <= 79; i++) {
      W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
    }

    A = H0;
    B = H1;
    C = H2;
    D = H3;
    E = H4;

    for (i = 0; i <= 19; i++) {
      temp =
        (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5a827999) &
        0x0ffffffff;
      E = D;
      D = C;
      C = rotate_left(B, 30);
      B = A;
      A = temp;
    }

    for (i = 20; i <= 39; i++) {
      temp =
        (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ed9eba1) & 0x0ffffffff;
      E = D;
      D = C;
      C = rotate_left(B, 30);
      B = A;
      A = temp;
    }

    for (i = 40; i <= 59; i++) {
      temp =
        (rotate_left(A, 5) +
          ((B & C) | (B & D) | (C & D)) +
          E +
          W[i] +
          0x8f1bbcdc) &
        0x0ffffffff;
      E = D;
      D = C;
      C = rotate_left(B, 30);
      B = A;
      A = temp;
    }

    for (i = 60; i <= 79; i++) {
      temp =
        (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xca62c1d6) & 0x0ffffffff;
      E = D;
      D = C;
      C = rotate_left(B, 30);
      B = A;
      A = temp;
    }

    H0 = (H0 + A) & 0x0ffffffff;
    H1 = (H1 + B) & 0x0ffffffff;
    H2 = (H2 + C) & 0x0ffffffff;
    H3 = (H3 + D) & 0x0ffffffff;
    H4 = (H4 + E) & 0x0ffffffff;
  }

  const hash =
    cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
  return hash.slice(0, 6);
};

const processElements = (rootElement) => {
  const processElement = (element) => {
    if (element.nodeType === Node.ELEMENT_NODE) {
      const cssPath = getCssPath(element);
      const hash = sha1(cssPath);
      element.setAttribute("data-ez-id", hash);
    }
    element.childNodes.forEach((child) => processElement(child));
  };
  if (rootElement) processElement(rootElement);
};

const outlineElements = () => {
  const mouseoverHandler = (event) => {
    const target = event.target;
    if (target.hasAttribute("data-ez-id")) {
      const tagName = target.tagName;
      const hasText = Array.from(target.childNodes).some(
        (node) =>
          node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== ""
      );

      if (hasText) {
        target.classList.add("ez_editable_hover");
      } else if (target.tagName.toLowerCase() === "input") {
        target.classList.add("ez_hover");
      } else if (target.tagName.toLowerCase() === "select") {
        target.classList.add("ez_hover");
      } else {
        target.classList.add("ez_uneditable");
      }

      document.addEventListener("mousemove", mousemoveHandler);
    }
  };

  const mousemoveHandler = (event) => {};

  const mouseoutHandler = (event) => {
    const target = event.target;
    target.classList.remove("ez_hover", "ez_editable_hover");
    document.removeEventListener("mousemove", mousemoveHandler);
  };

  document.addEventListener("mouseover", mouseoverHandler);
  document.addEventListener("mouseout", mouseoutHandler);

  const removeEventListeners = () => {
    document.removeEventListener("mouseover", mouseoverHandler);
    document.removeEventListener("mouseout", mouseoutHandler);
    document.removeEventListener("mousemove", mousemoveHandler);
  };

  return removeEventListeners;
};

const interceptClicks = () => {
  document.addEventListener("click", (event) => {
    const clickedElement = event.target;
    if (
      clickedElement.classList.contains("ez_hover") ||
      clickedElement.classList.contains("ez_editable_hover")
    ) {
      event.preventDefault();
      document
        .querySelectorAll(".ez_selected, .ez_editable_selected")
        .forEach((element) => {
          element.classList.remove("ez_selected", "ez_editable_selected");
        });

      if (clickedElement.classList.contains("ez_hover")) {
        clickedElement.classList.add("ez_selected");
      } else if (clickedElement.classList.contains("ez_editable_hover")) {
        clickedElement.classList.add("ez_editable_selected");
      }
      ezInspect(clickedElement);
    }
    if (clickedElement.classList.contains("ez_uneditable")) {
      event.preventDefault();
    }
  });
};

const ezInspect = (element) => {
  const ezSidebar = document.querySelector("#ez_sidebar");
  const ezModifyMenu = ezSidebar.querySelector(".ezModifyMenu");

  if (ezModifyMenu) {
    let nextElement = ezModifyMenu.nextElementSibling;
    while (nextElement) {
      const elementToRemove = nextElement;
      nextElement = nextElement.nextElementSibling;
      ezSidebar.removeChild(elementToRemove);
    }
  }

  const hasText = Array.from(element.childNodes).some(
    (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== ""
  );
  let elType = "Container";
  if (hasText) elType = "Text";
  if (element.tagName === "IMG") elType = "Image";
  if (element.tagName === "A") elType = "Link";
  if (element.tagName === "SELECT") elType = "Dropdown";
  if (element.tagName === "INPUT") {
    elType =
      element.type === "submit" || element.type === "button"
        ? "Button"
        : element.type === "text"
        ? "Textbox"
        : element.type;
  }
  if (element.classList.contains("menuInner")) elType = "Menu";

  const ezSelectedElement = document.getElementById("ez_selected_element");
  ezSelectedElement.innerHTML = "";
  const ezSelectedElementTag = createElementWithAttributes("span", {
    id: "ez_selected_element_tag",
    innerText: `<${element.tagName}>`,
    title: "Type of selected element",
  });
  const ezSelectedElementId = createElementWithAttributes("span", {
    id: "ez_selected_element_id",
    innerText: `@${element.dataset.ezId}`,
    title: "EZ-Tag ID",
  });

  customLabel = draftJSON[element.dataset.ezId]
    ? draftJSON[element.dataset.ezId].originalContent
    : document.querySelector(`[data-ez-id="${element.dataset.ezId}"]`)
        .tagName === "SELECT"
    ? (() => {
        const labelElement = document.querySelector(
          `#${document
            .querySelector(`[data-ez-id="${element.dataset.ezId}"]`)
            .id.substring(
              0,
              document
                .querySelector(`[data-ez-id="${element.dataset.ezId}"]`)
                .id.lastIndexOf("_")
            )}_titleLabel`
        );
        return labelElement ? labelElement.innerText + " Dropdown" : "Dropdown";
      })()
    : document.querySelector(`[data-ez-id="${element.dataset.ezId}"]`).type ===
        "submit" ||
      document.querySelector(`[data-ez-id="${element.dataset.ezId}"]`).type ===
        "button"
    ? document.querySelector(`[data-ez-id="${element.dataset.ezId}"]`).value +
      " Button"
    : document.querySelector(`[data-ez-id="${element.dataset.ezId}"]`).type ===
      "text"
    ? (() => {
        const labelElement = document.querySelector(
          `#${document
            .querySelector(`[data-ez-id="${element.dataset.ezId}"]`)
            .id.substring(
              0,
              document
                .querySelector(`[data-ez-id="${element.dataset.ezId}"]`)
                .id.lastIndexOf("_")
            )}_titleLabel`
        );
        return labelElement ? labelElement.innerText + " Textbox" : "Textbox";
      })()
    : document.querySelector(`[data-ez-id="${element.dataset.ezId}"]`).innerText
        .length > 20
    ? document
        .querySelector(`[data-ez-id="${element.dataset.ezId}"]`)
        .innerText.slice(0, 20) + "..."
    : document.querySelector(`[data-ez-id="${element.dataset.ezId}"]`)
        .innerText;

  const ezSelectedCustomLabel = createElementWithAttributes("h1", {
    id: `${element.dataset.ezId}_customLabel`,
    className: "ez_selected_element_type",
    innerText: draftJSON[element.dataset.ezId]
      ? draftJSON[element.dataset.ezId].customLabel
      : customLabel,
    contenteditable: true,
    title: "Click to rename",
  });
  ezSelectedElement.append(
    ezSelectedElementTag,
    ezSelectedElementId,
    ezSelectedCustomLabel
  );

  createModifyMenu(elType.toLowerCase(), element.dataset.ezId);

  if (draftJSON[element.dataset.ezId]) {
    const modifications = draftJSON[element.dataset.ezId].modifications;
    for (const ez_key in modifications) {
      if (modifications.hasOwnProperty(ez_key)) {
        const modType = modifications[ez_key][0].modType;
        const modText = ezModifyOptions.find((opt) => opt.value === modType);
        addModCard(modType, modText.text, element.dataset.ezId, ez_key);
      }
    }
  }
};

const createModifyMenu = (elType, ezId) => {
  const existingezModifyMenu = document.querySelector(".ezModifyMenu");
  if (existingezModifyMenu) existingezModifyMenu.remove();

  const ezModifyMenuContainer = createElementWithAttributes("div", {
    className: "ezModifyMenu",
  });
  const ezModifyMenuButton = createElementWithAttributes("button", {
    className: "ezModifyMenu_button",
    textContent: "Add a modification",
  });
  ezModifyMenuContainer.append(ezModifyMenuButton);

  const ezModifyMenuContent = createElementWithAttributes("div", {
    className: "ezModifyMenu_content",
    id: "ezModifyMenu_content",
  });
  ezModifyMenuContainer.append(ezModifyMenuContent);

  const filteredOptions = ezModifyOptions.filter(
    (option) => option.type === elType
  );
  filteredOptions.forEach((option) => {
    const a = createElementWithAttributes("a", {
      textContent: option.text,
      dataset: { value: option.value },
    });
    a.addEventListener("click", () =>
      addModCard(option.value, option.text, ezId)
    );
    ezModifyMenuContent.append(a);
  });

  const ezSelectedElement = document.getElementById("ez_selected_element");
  ezSelectedElement.insertAdjacentElement("afterend", ezModifyMenuContainer);

  ezModifyMenuButton.addEventListener("click", () => {
    ezModifyMenuContainer.classList.toggle("show");
  });

  window.addEventListener("click", (event) => {
    if (!event.target.matches(".ezModifyMenu_button")) {
      document
        .querySelectorAll(".ezModifyMenu.show")
        .forEach((menu) => menu.classList.remove("show"));
    }
  });

  const ezModCardVisibility = createElementWithAttributes("div", {
    className: "ezModCardVisibility",
  });
  const ezModCardVisibilityShow = createElementWithAttributes("div", {
    className: "ezModCardVisibilityToggle",
  });
  const ezModCardVisibilityHide = createElementWithAttributes("div", {
    className: "ezModCardVisibilityToggle",
  });

  const ezModCardVisibilityShowRadio = createElementWithAttributes("input", {
    id: `${ezId}_show_toggle`,
    name: `${ezId}_toggle`,
    type: "radio",
    checked: true,
    value: "show",
  });

  const ezModCardVisibilityHideRadio = createElementWithAttributes("input", {
    id: `${ezId}_hide_toggle`,
    name: `${ezId}_toggle`,
    type: "radio",
    value: "hide",
  });

  const ezModCardVisibilityShowLabel = createElementWithAttributes("label", {
    for: `${ezId}_show_toggle`,
    innerText: "Show",
    title: "Show this element",
  });

  const ezModCardVisibilityHideLabel = createElementWithAttributes("label", {
    for: `${ezId}_hide_toggle`,
    innerText: "Hide",
    title: "Hide this element",
  });

  ezModCardVisibilityShow.append(
    ezModCardVisibilityShowRadio,
    ezModCardVisibilityShowLabel
  );
  ezModCardVisibilityHide.append(
    ezModCardVisibilityHideRadio,
    ezModCardVisibilityHideLabel
  );
  ezModCardVisibility.append(ezModCardVisibilityShow, ezModCardVisibilityHide);

  const ezVisibilityRadios = ezModCardVisibility.querySelectorAll(
    `input[type=radio][name="${ezId}_toggle"]`
  );
  ezVisibilityRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      if (this.value === "show") {
        document.querySelectorAll("#ez_sidebar .ezModCard").forEach((card) => {
          card.classList.remove("ez_element_hidden");
        });
      } else {
        document.querySelectorAll("#ez_sidebar .ezModCard").forEach((card) => {
          card.classList.add("ez_element_hidden");
        });
      }
    });
  });

  ezModifyMenuContainer.insertAdjacentElement("afterend", ezModCardVisibility);
};

const createElementWithAttributes = (tag, attributes) => {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(attributes)) {
    if (key === "dataset") {
      Object.assign(element.dataset, value);
    } else if (key in element) {
      element[key] = value;
    } else {
      element.setAttribute(key, value);
    }
  }
  return element;
};

const addModCard = (modType, modText, ezId, ez_key = Date.now()) => {
  const modId = `${ezId}_${modType}_${ez_key}`;
  const currentModification =
    draftJSON[ezId] && draftJSON[ezId].modifications[ez_key]
      ? draftJSON[ezId].modifications[ez_key][0]
      : {};

  const ezModCard = createElementWithAttributes("div", {
    className: "ezModCard",
    id: modId,
    dataset: { ezModId: modId },
  });

  const ezModCardHeader = createElementWithAttributes("div", {
    className: "ezModCardHeader",
    innerText: modText,
  });

  const ezModCardHelpButton = createElementWithAttributes("button", {
    className: "ezModCardHeaderButton ezModCardHelp",
    innerHTML: '<i class="material-symbols-outlined">help</i>',
    title: "View Documentation",
  });

  const ezModCardDeleteButton = createElementWithAttributes("button", {
    className: "ezModCardHeaderButton ezModCardDelete",
    innerHTML: '<i class="material-symbols-outlined">delete</i>',
    title: "Remove Modification",
  });

  ezModCardDeleteButton.addEventListener("click", () => {
    const divToRemove = document.querySelector(
      `div[data-ez-mod-id="${modId}"]`
    );
    if (divToRemove) {
      const parentContainer = divToRemove.parentElement;
      let found = false;

      parentContainer.querySelectorAll(".ezModCard").forEach((card) => {
        if (card === divToRemove) {
          found = true;
        } else if (found) {
          card.classList.add("ez_slide_up");
        }
      });

      if (draftJSON[ezId] && draftJSON[ezId].modifications[ez_key]) {
        delete draftJSON[ezId].modifications[ez_key];
      }

      divToRemove.classList.add("ez_slide_up_delete");

      setTimeout(() => {
        divToRemove.remove();
        parentContainer.querySelectorAll(".ezModCard").forEach((card) => {
          card.classList.remove("ez_slide_up");
        });
      }, 500);
      changesMade = true;
    }
  });

  const ezModCardEnabled = createElementWithAttributes("label", {
    className: "ezModCardEnabled",
  });

  const ezModCardEnabledToggle = createElementWithAttributes("input", {
    type: "checkbox",
    id: `${modId}_enabled`,
    checked: true,
  });

  const ezModCardEnabledToggleIcon = createElementWithAttributes("i", {
    className: "material-symbols-outlined ez_toggle_on",
    id: `${modId}_enabled_icon`,
    innerText: "toggle_on",
    title: "Set as Active or Inactive",
  });

  ezModCardEnabledToggle.addEventListener("change", () => {
    const ez_card_inputs = ezModCard.querySelectorAll(
      ".modCardRow input, .modCardRow select"
    );
    const isEnabled = ezModCardEnabledToggle.checked;

    ezModCardEnabledToggleIcon.classList.toggle("ez_toggle_off", !isEnabled);
    ezModCardEnabledToggleIcon.classList.toggle("ez_toggle_on", isEnabled);
    ezModCardEnabledToggleIcon.textContent = isEnabled
      ? "toggle_on"
      : "toggle_off";
    ez_card_inputs.forEach((input) => (input.disabled = !isEnabled));
  });

  ezModCardEnabled.append(ezModCardEnabledToggle, ezModCardEnabledToggleIcon);
  ezModCardHeader.append(
    ezModCardEnabled,
    ezModCardDeleteButton,
    ezModCardHelpButton
  );
  ezModCard.append(ezModCardHeader);

  const appendInputFields = (fields, values = {}) => {
    fields.forEach(({ label, type, idSuffix, json_key }) => {
      const div = createElementWithAttributes("div", {
        className: "modCardRow",
      });
      const labelElem = createElementWithAttributes("label", {
        innerText: label,
        htmlFor: `${modId}_${idSuffix}`,
      });
      const input = createElementWithAttributes("input", {
        type,
        id: `${modId}_${idSuffix}`,
        value: values[json_key] || "",
      });
      div.append(labelElem, input);
      ezModCard.append(div);
    });
  };

  appendLanguageDropdown(modId, ezModCard, currentModification);

  const modValues = currentModification;
  switch (modType) {
    case "replace":
      appendInputFields(
        [
          {
            label: "Original Text:",
            type: "text",
            idSuffix: "OriginalText",
            json_key: "originalText",
          },
          {
            label: "Replacement Text:",
            type: "text",
            idSuffix: "ReplacementText",
            json_key: "replacementText",
          },
        ],
        modValues
      );
      break;
    case "text":
      appendInputFields(
        [
          {
            label: "Replacement Text:",
            type: "text",
            idSuffix: "ReplacementText",
            json_key: "replacementText",
          },
        ],
        modValues
      );
      break;
    case "regex":
      appendInputFields(
        [
          {
            label: "Regex Pattern:",
            type: "text",
            idSuffix: "Pattern",
            json_key: "pattern",
          },
          {
            label: "Replacement Text:",
            type: "text",
            idSuffix: "ReplacementText",
            json_key: "replacementText",
          },
        ],
        modValues
      );
      break;
    case "linkText":
      appendInputFields(
        [
          {
            label: "Replacement Text:",
            type: "text",
            idSuffix: "linkText",
            json_key: "linkText",
          },
        ],
        modValues
      );
      break;
    case "url":
      appendInputFields(
        [
          {
            label: "New URL:",
            type: "text",
            idSuffix: "linkUrl",
            json_key: "linkUrl",
          },
        ],
        modValues
      );
      break;
    case "buttonValue":
      appendInputFields(
        [
          {
            label: "Button Text:",
            type: "text",
            idSuffix: "buttonValue",
            json_key: "buttonValue",
          },
        ],
        modValues
      );
      break;
    case "placeholder":
      appendInputFields(
        [
          {
            label: "Placeholder Text:",
            type: "text",
            idSuffix: "placeholder",
            json_key: "placeholder",
          },
        ],
        modValues
      );
      break;
    case "dropdown":
      appendInputFields(
        [
          {
            label: "Original Option:",
            type: "text",
            idSuffix: "optionOriginal",
            json_key: "optionOriginal",
          },
          {
            label: "Replacement Option:",
            type: "text",
            idSuffix: "optionReplacement",
            json_key: "optionReplacement",
          },
        ],
        modValues
      );
      break;
  }

  document.getElementById("ez_sidebar").append(ezModCard);
};

const appendLanguageDropdown = (
  ezModCard,
  ezModCardEl,
  currentModification = {}
) => {
  const scopeDiv = createElementWithAttributes("div", {
    className: "modCardRow",
  });

  const scopeLabel = createElementWithAttributes("label", {
    innerText: "Language:",
    htmlFor: `${ezModCard}_language`,
  });
  const scopeDropdown = createElementWithAttributes("select", {
    id: `${ezModCard}_language`,
  });

  const allOption = createElementWithAttributes("option", {
    value: "all",
    innerText: "All",
  });
  scopeDropdown.append(allOption);

  scopeLanguages.forEach((optionText) => {
    const option = createElementWithAttributes("option", {
      value: optionText[1].toLowerCase().replace(/\s+/g, ""),
      innerText: optionText[0],
    });
    scopeDropdown.append(option);
  });

  if (currentModification.language) {
    scopeDropdown.value = currentModification.language;
  }

  scopeDiv.append(scopeLabel, scopeDropdown);
  ezModCardEl.append(scopeDiv);
};

const appendInputField = (ezModCard, labelText, inputId) => {
  const inputDiv = createElementWithAttributes("div", {
    className: "modCardRow",
  });
  const inputLabel = createElementWithAttributes("label", {
    innerText: labelText,
    htmlFor: inputId,
  });
  const inputField = createElementWithAttributes("input", {
    type: "text",
    id: inputId,
  });
  inputDiv.append(inputLabel, inputField);
  ezModCard.append(inputDiv);
};

const getColorPalette = (
  imageData,
  numColours = 6,
  similarityThreshold = 30
) => {
  const colourMap = {};
  const totalPixels = imageData.data.length / 4;

  for (let i = 0; i < totalPixels; i++) {
    const r = imageData.data[i * 4];
    const g = imageData.data[i * 4 + 1];
    const b = imageData.data[i * 4 + 2];
    const a = imageData.data[i * 4 + 3];

    if (a < 255) continue;

    if (
      (r === 255 && g === 255 && b === 255) ||
      (r === 0 && g === 0 && b === 0)
    )
      continue;

    const rgb = `${r},${g},${b}`;

    if (!colourMap[rgb]) {
      colourMap[rgb] = 0;
    }

    colourMap[rgb]++;
  }

  const sortedColours = Object.keys(colourMap).sort(
    (a, b) => colourMap[b] - colourMap[a]
  );

  const palette = [];

  for (const rgb of sortedColours) {
    if (palette.length >= numColours) break;

    const [r, g, b] = rgb.split(",").map(Number);
    const isTooSimilar = palette.some((colour) => {
      const [pr, pg, pb] = colour.rgb.slice(4, -1).split(",").map(Number);
      const distance = Math.sqrt(
        Math.pow(r - pr, 2) + Math.pow(g - pg, 2) + Math.pow(b - pb, 2)
      );
      return distance < similarityThreshold;
    });

    if (!isTooSimilar) {
      palette.push({ rgb: `rgb(${r},${g},${b})`, hex: rgbToHex(r, g, b) });
    }
  }

  return palette;
};

const rgbToHex = (r, g, b) => {
  return (
    "#" +
    ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
  );
};

function showezToast(message) {
  const toasterContainer = document.getElementById("ez_toaster_container");

  const toast = document.createElement("div");
  toast.className = "ez_toaster";
  toast.textContent = message;

  toasterContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("show");
    toast.addEventListener("transitionend", () => {
      toast.remove();
    });
  }, 3000);
}

function ezdebounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

function initializeDraftID(
  ez_id,
  elementType,
  customLabel,
  isVisible,
  originalContent = null
) {
  if (!draftJSON[ez_id]) {
    if (!originalContent) {
      originalContent = document.querySelector(
        `[data-ez-id="${ez_id}"]`
      ).innerText;
    }

    draftJSON[ez_id] = {
      type: elementType,
      customLabel: customLabel,
      isVisible: isVisible,
      originalContent: originalContent,
      modifications: {},
    };
  } else {
    draftJSON[ez_id].isVisible = isVisible;
    draftJSON[ez_id].customLabel = customLabel;
  }
}

function buildEzDraft(
  ez_id,
  ez_key,
  modType,
  modEnabled,
  language,
  originalText = "",
  replacementText = "",
  pattern = "",
  linkText = "",
  linkUrl = "",
  buttonValue = "",
  placeholder = "",
  optionOriginal = "",
  optionReplacement = ""
) {
  const modification = {
    modType: modType,
    language: language,
    enabled: modEnabled,
  };

  switch (modType) {
    case "text":
      if (replacementText) {
        modification.replacementText = replacementText;
      } else {
        return;
      }
      break;
    case "replace":
      if (originalText) {
        modification.originalText = originalText;
        modification.replacementText = replacementText;
      } else {
        return;
      }

      break;
    case "regex":
      if (pattern) {
        modification.pattern = pattern;
        modification.replacementText = replacementText;
      } else {
        return;
      }
      break;
    case "linkText":
      if (linkText) {
        modification.linkText = linkText;
      } else {
        return;
      }
      break;
    case "url":
      if (linkUrl) {
        modification.linkUrl = linkUrl;
      } else {
        return;
      }
      break;
    case "buttonValue":
      if (buttonValue) {
        modification.buttonValue = buttonValue;
      } else {
        return;
      }
      break;
    case "placeholder":
      if (placeholder) {
        modification.placeholder = placeholder;
      } else {
        return;
      }
      break;
    case "dropdown":
      if (optionOriginal && optionReplacement) {
        modification.optionOriginal = optionOriginal;
        modification.optionReplacement = optionReplacement;
      } else {
        return;
      }
      break;
  }

  draftJSON[ez_id].modifications[ez_key] = [];

  draftJSON[ez_id].modifications[ez_key].push(modification);
}

const saveEzDraft = (eztag) => {
  let ez_id = eztag.split("_")[0];
  let ez_name = document.getElementById(`${ez_id}_customLabel`).innerText;
  let elementType = document.querySelector(`[data-ez-id="${ez_id}"]`).tagName;
  let isVisible =
    document.querySelector(`input[name="${ez_id}_toggle"]:checked`)?.value ||
    "show";
  initializeDraftID(ez_id, elementType, ez_name, isVisible);

  let sidebar = document.getElementById("ez_sidebar");
  sidebar.querySelectorAll(".ezModCard").forEach((mod) => {
    let ez_type = mod.id.split("_")[1];
    let ez_key = mod.id.split("_")[2];
    let language,
      originalText,
      replacementText,
      modEnabled,
      pattern,
      linkText,
      linkUrl,
      buttonValue,
      placeholder,
      optionOriginal,
      optionReplacement;
    switch (ez_type) {
      case "text":
        language = document.getElementById(`${mod.id}_language`).value;
        replacementText = document.getElementById(
          `${mod.id}_ReplacementText`
        ).value;
        if (replacementText)
          document.querySelector(`[data-ez-id="${ez_id}"]`).innerText =
            replacementText;
        break;
      case "replace":
        language = document.getElementById(`${mod.id}_language`).value;
        originalText = document.getElementById(`${mod.id}_OriginalText`).value;
        replacementText = document.getElementById(
          `${mod.id}_ReplacementText`
        ).value;
        break;
      case "regex":
        language = document.getElementById(`${mod.id}_language`).value;
        pattern = document.getElementById(`${mod.id}_Pattern`).value;
        replacementText = document.getElementById(
          `${mod.id}_ReplacementText`
        ).value;
        break;
      case "linkText":
        language = document.getElementById(`${mod.id}_language`).value;
        linkText = document.getElementById(`${mod.id}_linkText`).value;
        if (linkText)
          document.querySelector(`[data-ez-id="${ez_id}"]`).innerText =
            linkText;
        break;
      case "url":
        language = document.getElementById(`${mod.id}_language`).value;
        linkUrl = document.getElementById(`${mod.id}_linkUrl`).value;
        if (linkUrl)
          document.querySelector(`[data-ez-id="${ez_id}"]`).href = linkUrl;
        break;
      case "buttonValue":
        language = document.getElementById(`${mod.id}_language`).value;
        buttonValue = document.getElementById(`${mod.id}_buttonValue`).value;
        if (buttonValue)
          document.querySelector(`[data-ez-id="${ez_id}"]`).value = buttonValue;
        break;
      case "placeholder":
        language = document.getElementById(`${mod.id}_language`).value;
        placeholder = document.getElementById(`${mod.id}_placeholder`).value;
        if (placeholder)
          document.querySelector(`[data-ez-id="${ez_id}"]`).placeholder =
            placeholder;
        break;
      case "dropdown":
        language = document.getElementById(`${mod.id}_language`).value;
        optionOriginal = document.getElementById(
          `${mod.id}_optionOriginal`
        ).value;
        optionReplacement = document.getElementById(
          `${mod.id}_optionReplacement`
        ).value;
        if (optionOriginal && optionReplacement) {
          document
            .querySelectorAll(`[data-ez-id="${ez_id}"] option`)
            .forEach((option) => {
              if (option.text === optionOriginal) {
                option.text = optionReplacement;
              }
            });
        }
        break;
    }
    modEnabled = document.getElementById(`${mod.id}_enabled`).checked;

    buildEzDraft(
      ez_id,
      ez_key,
      ez_type,
      modEnabled,
      language,
      originalText,
      replacementText,
      pattern,
      linkText,
      linkUrl,
      buttonValue,
      placeholder,
      optionOriginal,
      optionReplacement
    );
  });

  changesMade = true;
  showezToast("Draft changes saved");
};

const checkLicense = async () => {
  let license;

  const checkUrl = `https://hook.us1.make.com/${checkCode}`;

  if (license_key !== "") {
    license = getCookie("ezlicense");
    if (license) {
      if (license == "trial") {
        showezToast("EZ Designer running in trial mode");
        console.log("EZ Designer running in trial mode");
        loadEZ(license);
      } else if (license == "invalid") {
        showezToast("Invalid License Key for EZ Designer");
        console.log("Invalid License Key for EZ Designer");
        exitEditor();
      } else {
        console.log("EZ Designer is running");
        loadEZ(license);
      }
    } else {
      try {
        const response = await Promise.race([
          fetch(`${checkUrl}/?json=true&key=${license_key}`),
          ezTimeout(3000),
        ]);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (
          data["license-error"] === "no valid key found" ||
          !data.Products.includes("watm")
        ) {
          license = "invalid";
          showezToast("Invalid License Key for EZ Designer");
          exitEditor();
        } else {
          const expiryDate = Date.parse(data["expiration date"]);

          if (
            data.Products.includes("watm") &&
            data["Support Level"] === "support" &&
            expiryDate >= Date.now()
          ) {
            license = "active";
          }

          if (data.Products.includes("watm") && expiryDate < Date.now()) {
            license = "expired";
            showezToast("License Key for EZ Designer expired");
            exitEditor();
          }
        }

        setCookie("ezlicense", license);
        console.log("EZ Designer is running");
        loadEZ(license);
      } catch (error) {
        if (error.message === "Request timed out") {
          showezToast(
            "EZ Web Designer License Server took too long to respond"
          );
          console.log(
            "EZ Web Designer License Server took too long to respond - loading in Trial mode."
          );
          license = "trial";
          showezToast("EZ Designer running in trial mode");
          console.log("EZ Designer running in trial mode");
          loadEZ(license);
        } else {
          showezToast("Could not verify license - Please check CORS settings");
          console.log(`EZ Web Designer License Fetch request error: ${error}`);
          exitEditor();
        }
      }
    }
  } else {
    license = "trial";
    showezToast("EZ Designer running in trial mode");
    console.log("EZ Designer running in trial mode");
    setCookie("ezlicense", license);
    loadEZ(license);
  }
};

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

function ezTimeout(delay) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Request timed out")), delay)
  );
}

function ezJsonToCsv(
  json,
  includeOriginalContent = true,
  processElements = true
) {
  const baseHeaders = ["ez_id", "type", "customLabel", "isVisible"];

  if (includeOriginalContent) {
    baseHeaders.push("originalContent");
  }

  const modificationHeaders = new Set();
  const rows = [];

  for (const id in json) {
    const baseData = json[id];
    for (const modId in baseData.modifications) {
      baseData.modifications[modId].forEach((mod) => {
        Object.keys(mod).forEach((key) => {
          if (!baseHeaders.includes(key)) {
            modificationHeaders.add(key);
          }
        });
      });
    }
  }

  const allHeaders = [
    ...baseHeaders,
    "modificationId",
    ...Array.from(modificationHeaders),
  ];

  function getRowValues(obj, prefix = "") {
    const row = {};
    for (const key in obj) {
      const prefixedKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
        Object.assign(row, getRowValues(obj[key], prefixedKey));
      } else {
        row[prefixedKey] = obj[key];
      }
    }
    return row;
  }

  if (processElements) {
    const container = document.querySelector("body > div:first-of-type");
    const elements = container.querySelectorAll("[data-ez-id]");
    elements.forEach((element) => {
      if (["SCRIPT", "STYLE", "NOSCRIPT"].includes(element.tagName)) {
        return;
      }

      const id = element.getAttribute("data-ez-id");
      const containsDirectText = Array.from(element.childNodes).some(
        (node) =>
          node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== ""
      );
      const isSubmitButton =
        (element.tagName === "INPUT" && element.type === "submit") ||
        (element.tagName === "INPUT" && element.type === "button");

      if (containsDirectText || isSubmitButton) {
        const originalContent = isSubmitButton
          ? element.value
          : element.textContent.trim();
        let customLabel =
          originalContent.length > 20
            ? originalContent.substring(0, 20)
            : originalContent;
        const baseRow = { ez_id: id, customLabel, type: element.tagName };

        if (includeOriginalContent) {
          baseRow.originalContent = originalContent;
        }

        if (json[id]) {
          const jsonData = json[id];
          if (jsonData.customLabel) {
            baseRow.customLabel = jsonData.customLabel;
          }
          if (includeOriginalContent) {
            baseRow.originalContent =
              jsonData.originalContent || baseRow.originalContent;
          }
          baseRow.isVisible =
            jsonData.isVisible !== undefined
              ? jsonData.isVisible
              : baseRow.isVisible;

          const modifications = jsonData.modifications;
          if (Object.keys(modifications).length === 0) {
            rows.push(baseRow);
          } else {
            for (const modId in modifications) {
              modifications[modId].forEach((mod) => {
                const modRow = getRowValues(mod);
                const combinedRow = {
                  ...baseRow,
                  modificationId: modId,
                  ...modRow,
                };
                rows.push(combinedRow);
              });
            }
          }
        } else {
          rows.push(baseRow);
        }
      }
    });
  } else {
    for (const id in json) {
      const jsonData = json[id];
      let baseRow = { ez_id: id, customLabel: "", type: "", isVisible: true };

      if (includeOriginalContent && jsonData.originalContent) {
        baseRow.originalContent = jsonData.originalContent;
      }

      if (jsonData.customLabel) {
        baseRow.customLabel = jsonData.customLabel;
      }

      if (jsonData.type) {
        baseRow.type = jsonData.type;
      }

      if (jsonData.isVisible !== undefined) {
        baseRow.isVisible = jsonData.isVisible;
      }

      const modifications = jsonData.modifications;
      if (Object.keys(modifications).length === 0) {
        rows.push(baseRow);
      } else {
        for (const modId in modifications) {
          modifications[modId].forEach((mod) => {
            const modRow = getRowValues(mod);
            const combinedRow = {
              ...baseRow,
              modificationId: modId,
              ...modRow,
            };
            rows.push(combinedRow);
          });
        }
      }
    }
  }

  const csvContent = [
    allHeaders.join(","),
    ...rows.map((row) =>
      allHeaders
        .map((header) => {
          const value = row[header] !== undefined ? row[header] : "";
          if (typeof value === "number") {
            return value;
          } else if (typeof value === "boolean") {
            return value ? "true" : "false";
          } else {
            return JSON.stringify(value);
          }
        })
        .join(",")
    ),
  ].join("\n");

  // Add BOM for UTF-8
  const bom = "\uFEFF";
  return bom + csvContent;
}

function ezExport(
  jsonToExport,
  filename = "output.csv",
  includeOriginalContent = true,
  processElements = true
) {
  const csvData = ezJsonToCsv(
    jsonToExport,
    includeOriginalContent,
    processElements
  );
  const csvDataURI =
    "data:text/csv;charset=utf-8," + encodeURIComponent(csvData);

  const link = document.createElement("a");
  link.href = csvDataURI;
  link.download = filename;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);
}

function ezExportMissing(filename = "output.csv") {
  const csvData = ezMissingToCsv();
  const csvDataURI =
    "data:text/csv;charset=utf-8," + encodeURIComponent(csvData);

  const link = document.createElement("a");
  link.href = csvDataURI;
  link.download = filename;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);
}

const ezSavePage = async () => {
  saveJSONString = JSON.stringify(draftJSON);

  try {
    const response = await fetch(ezFile, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: saveJSONString,
    });

    if (response.ok) {
      alert("Modifications saved successfully.");
      location.reload();
    } else {
      alert("Failed to save EZ JSON: " + response.statusText);
    }
  } catch (error) {
    alert("EZ Error: " + error.message);
  }
};

const setLanguage = (language) => {
  setCookie("currentLanguage", language);
};

const getCurrentLanguage = () => {
  let currentLanguage = getCookie("currentLanguage");

  if (!currentLanguage) {
    const browserLanguage = getBrowserLanguage(
      navigator.language
    ).toLowerCase();
    const matchedLanguage = scopeLanguages.find(
      (language) => language[1].toLowerCase() === browserLanguage
    );

    if (matchedLanguage) {
      currentLanguage = matchedLanguage[1];
    } else {
      currentLanguage = scopeLanguages[0][1] ? scopeLanguages[0][1] : "english";
    }
    setLanguage(currentLanguage);
  }

  return currentLanguage;
};

const createToggle = (currentLanguage) => {
  if (!document.getElementById(languageSwitcherId)) {
    console.log("No language switcher content gadget found.");
    return false;
  }
  if (document.body.classList.contains("adminContentView")) {
    console.log("Language Toggle not available in Admin View");
    return false;
  }
  let toggleText = "Select language";
  if (currentLanguage !== "") {
    scopeLanguages.forEach((language, index) => {
      if (language[1] == currentLanguage) {
        toggleText = language[0];
      }
    });
  }

  const toggleElementID = document.getElementById(languageSwitcherId);

  const languageToggle = document.createElement("div");
  languageToggle.classList.add("ez-dropdown", "ez-dropdown-closed");
  const languageToggleIcon = document.createElement("h2");
  languageToggleIcon.classList.add("ez-dropdown-icon");
  languageToggleIcon.innerHTML = `${toggleText} <span>∆</span>`;
  const languageToggleMenu = document.createElement("ul");
  languageToggleMenu.classList.add("ez-dropdown-menu");

  scopeLanguages.forEach((language) => {
    let lang_li = document.createElement("li");
    lang_li.textContent = language[0];
    lang_li.addEventListener("click", (e) => {
      urlParams.set("language", language[1]);
      location.href = `${currentUrl.pathname}?${urlParams}`;
    });
    languageToggleMenu.appendChild(lang_li);
  });

  languageToggle.append(languageToggleIcon, languageToggleMenu);

  toggleElementID.parentNode.replaceChild(languageToggle, toggleElementID);

  languageToggle.addEventListener("click", (e) => {
    if (languageToggle.classList.contains("ez-dropdown-closed")) {
      languageToggle.classList.remove("ez-dropdown-closed");
    } else {
      languageToggle.classList.add("ez-dropdown-closed");
    }
  });
};

const getBrowserLanguage = (languageCode) => {
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
  let browserLanguage = languageNames[languageCode.split("-")[0]] || "";

  return browserLanguage.toLowerCase();
};

const applyModification = (element, mod, modification) => {
  switch (mod.modType) {
    case "text":
      if (mod.replacementText) {
        if (
          mod.enabled &&
          (mod.language === currentLanguage || mod.language === "all")
        )
          element.innerText = mod.replacementText;
        modification.replacementText = mod.replacementText;
      }
      break;

    case "replace":
      if (mod.originalText) {
        if (
          mod.enabled &&
          (mod.language === currentLanguage || mod.language === "all")
        )
          modification.originalText = mod.originalText;
        modification.replacementText = mod.replacementText;
      }
      break;

    case "regex":
      if (mod.pattern) {
        if (
          mod.enabled &&
          (mod.language === currentLanguage || mod.language === "all")
        )
          modification.pattern = mod.pattern;
        modification.replacementText = mod.replacementText;
      }
      break;

    case "linkText":
      if (mod.linkText) {
        if (
          mod.enabled &&
          (mod.language === currentLanguage || mod.language === "all")
        )
          element.innerText = mod.linkText;
        modification.linkText = mod.linkText;
      }
      break;

    case "url":
      if (mod.linkUrl) {
        if (
          mod.enabled &&
          (mod.language === currentLanguage || mod.language === "all")
        )
          element.href = mod.linkUrl;
        modification.linkUrl = mod.linkUrl;
      }
      break;

    case "buttonValue":
      if (mod.buttonValue) {
        if (
          mod.enabled &&
          (mod.language === currentLanguage || mod.language === "all")
        )
          element.value = mod.buttonValue;
        modification.buttonValue = mod.buttonValue;
      }
      break;

    case "placeholder":
      if (mod.placeholder) {
        if (
          mod.enabled &&
          (mod.language === currentLanguage || mod.language === "all")
        )
          element.placeholder = mod.placeholder;
        modification.placeholder = mod.placeholder;
      }
      break;

    case "dropdown":
      if (mod.optionOriginal && mod.optionReplacement) {
        if (
          mod.enabled &&
          (mod.language === currentLanguage || mod.language === "all")
        ) {
          element.querySelectorAll("option").forEach((option) => {
            if (option.text === mod.optionOriginal) {
              option.text = mod.optionReplacement;
            }
          });
        }
        modification.optionOriginal = mod.optionOriginal;
        modification.optionReplacement = mod.optionReplacement;
      }
      break;
  }
};

const initializeAndModify = (ezId, modKey, mod, element, JSONinit) => {
  if (!JSONinit) {
    initializeDraftID(
      ezId,
      savedJSON[ezId].type,
      savedJSON[ezId].customLabel,
      savedJSON[ezId].isVisible,
      savedJSON[ezId].originalContent
    );
    JSONinit = true;
  }

  const modification = {
    modType: mod.modType,
    language: mod.language,
    enabled: mod.enabled,
  };

  applyModification(element, mod, modification);

  if (!draftJSON[ezId].modifications[modKey]) {
    draftJSON[ezId].modifications[modKey] = [];
  }

  draftJSON[ezId].modifications[modKey].push(modification);

  return JSONinit;
};

const processJSON = () => {
  for (let ezId in savedJSON) {
    let JSONinit = false;
    const element = document.querySelector(`[data-ez-id="${ezId}"]`);

    if (!element) {
      missingTags.push(ezId);
      continue;
    }

    if (savedJSON[ezId].isVisible === "hide") {
      element.classList.add("ezhide");
      initializeDraftID(
        ezId,
        savedJSON[ezId].type,
        savedJSON[ezId].customLabel,
        savedJSON[ezId].isVisible,
        savedJSON[ezId].originalContent
      );
      JSONinit = true;
    }

    for (let modKey in savedJSON[ezId].modifications) {
      savedJSON[ezId].modifications[modKey].forEach((mod) => {
        JSONinit = initializeAndModify(ezId, modKey, mod, element, JSONinit);
      });
    }
  }
};

function ezMissingToCsv() {
  const baseHeaders = [
    "ez_id",
    "type",
    "customLabel",
    "isVisible",
    "originalContent",
  ];
  const modificationHeaders = new Set();
  const rows = [];

  missingTags.forEach((id) => {
    const baseData = savedJSON[id];
    if (baseData) {
      for (const modId in baseData.modifications) {
        baseData.modifications[modId].forEach((mod) => {
          Object.keys(mod).forEach((key) => {
            if (!baseHeaders.includes(key)) {
              modificationHeaders.add(key);
            }
          });
        });
      }
    }
  });

  const allHeaders = [
    ...baseHeaders,
    "modificationId",
    ...Array.from(modificationHeaders),
  ];

  function getRowValues(obj, prefix = "") {
    const row = {};
    for (const key in obj) {
      const prefixedKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
        Object.assign(row, getRowValues(obj[key], prefixedKey));
      } else {
        row[prefixedKey] = obj[key];
      }
    }
    return row;
  }

  missingTags.forEach((id) => {
    const jsonData = savedJSON[id];
    if (jsonData) {
      let baseRow = {
        ez_id: id,
        customLabel: "",
        type: "",
        isVisible: true,
        originalContent: "",
      };

      if (jsonData.originalContent) {
        baseRow.originalContent = jsonData.originalContent;
      }

      if (jsonData.customLabel) {
        baseRow.customLabel = jsonData.customLabel;
      }

      if (jsonData.type) {
        baseRow.type = jsonData.type;
      }

      if (jsonData.isVisible !== undefined) {
        baseRow.isVisible = jsonData.isVisible;
      }

      const modifications = jsonData.modifications;
      if (Object.keys(modifications).length === 0) {
        rows.push(baseRow);
      } else {
        for (const modId in modifications) {
          modifications[modId].forEach((mod) => {
            const modRow = getRowValues(mod);
            const combinedRow = {
              ...baseRow,
              modificationId: modId,
              ...modRow,
            };
            rows.push(combinedRow);
          });
        }
      }
    }
  });

  const csvContent = [
    allHeaders.join(","),
    ...rows.map((row) =>
      allHeaders
        .map((header) => {
          const value = row[header] !== undefined ? row[header] : "";
          if (typeof value === "number") {
            return value;
          } else if (typeof value === "boolean") {
            return value ? "true" : "false";
          } else {
            return JSON.stringify(value);
          }
        })
        .join(",")
    ),
  ].join("\n");

  // Add BOM for UTF-8
  const bom = "\uFEFF";
  return bom + csvContent;
}
