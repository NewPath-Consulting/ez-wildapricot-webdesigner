let draftJSON;
let removeListeners;
let pageCapture;

if (typeof checkCode == "undefined") {
  let checkCode = "8euj9o9frkj3wz2nqm6xmcp4y1mdy5tp";
}
if (typeof license_key == "undefined") {
  let license_key = "";
}

const scopeLanguages = ["english", "french"];

const watmModifyOptions = [
  { type: "text", value: "text", text: "Change Text" },
  { type: "text", value: "replace", text: "Replace Text" },
  { type: "text", value: "regex", text: "Pattern Replace" },
  { type: "menu", value: "replace", text: "Replace Text" },
  { type: "menu", value: "regex", text: "Pattern Replace" },
  { type: "link", value: "innerText", text: "Change Link Text" },
  { type: "link", value: "url", text: "Change Link URL" },
  { type: "button", value: "innerText", text: "Change Button Text" },
  { type: "input", value: "value", text: "Set Value" },
  { type: "button", value: "placeholder", text: "Change Placeholder" },
];

const loadWATM = () => {
  draftJSON = {};
  const watmActionbarLogo = createElementWithAttributes("div", {
    id: "watm_actionbar_logo",
  });
  const logoImage = createElementWithAttributes("img", {
    src: `${watmLocation}/css/logo.png`,
    alt: "WATM",
  });
  watmActionbarLogo.append(logoImage);

  const watmActionbarAppName = createElementWithAttributes("div", {
    id: "watm_actionbar_title",
    innerText: `EZ WildApricot Designer ${watm_version}`,
  });

  const watmActionbarScreen = createElementWithAttributes("div", {
    id: "watm_actionbar_screen",
  });
  const watmActionbarScreenCurrent = createElementWithAttributes("button", {
    id: "watm_currentScreen_button",
    innerText: "Current Page",
    className: "active",
  });
  const watmActionbarScreenMissing = createElementWithAttributes("button", {
    id: "watm_missingScreen_button",
    innerText: "Missing Elements",
  });

  watmActionbarScreen.append(
    watmActionbarScreenCurrent,
    watmActionbarScreenMissing
  );

  const watmActionbarSave = createElementWithAttributes("div", {
    id: "watm_actionbar_save",
  });
  const watmSaveButton = createElementWithAttributes("button", {
    id: "watm_save_button",
    innerText: "Save",
  });
  watmActionbarSave.append(watmSaveButton);

  const watmActionbarExit = createElementWithAttributes("div", {
    id: "watm_actionbar_exit",
  });
  const watmExitButton = createElementWithAttributes("button", {
    id: "watm_exit_button",
    innerText: "Exit Editor",
  });
  watmExitButton.addEventListener("click", exitEditor);
  watmActionbarExit.append(watmExitButton);

  const watmActionbarPalette = createElementWithAttributes("div", {
    id: "watm_actionbar_palette",
  });
  const watmActionbarPaletteButton = createElementWithAttributes("button", {
    id: "watm_palette_button",
    innerText: "Colour Palette",
  });

  const watmActionbarPaletteContent = createElementWithAttributes("div", {
    id: "watm_palette_content",
  });

  const watmActionbarPaletteContentTop = createElementWithAttributes("div", {
    className: "watm_palette_top",
  });

  const watmActionbarPaletteContentInfo = createElementWithAttributes("p", {
    className: "watm_palette_info",
    innerText:
      "Below are the most common colours found on this page. Click on a colour to copy its hex code to the clipboard.",
  });

  watmActionbarPaletteButton.addEventListener("click", function (event) {
    watmActionbarPaletteContent.style.display =
      watmActionbarPaletteContent.style.display === "block" ? "none" : "block";
    event.stopPropagation();
  });

  document.addEventListener("click", function (event) {
    if (
      event.target !== watmActionbarPaletteButton &&
      !watmActionbarPaletteContent.contains(event.target)
    ) {
      watmActionbarPaletteContent.style.display = "none";
    }
  });

  watmActionbarPaletteContent.addEventListener("click", function (event) {
    event.stopPropagation();
  });

  watmActionbarPaletteContent.append(
    watmActionbarPaletteContentTop,
    watmActionbarPaletteContentInfo
  );

  const palette = getColorPalette(pageCapture, 9);

  palette.forEach((colour) => {
    const box = document.createElement("div");
    box.className = "watm_palette_box";
    box.style.backgroundColor = colour.rgb;

    const hexCode = document.createElement("span");
    hexCode.innerText = colour.hex;
    box.appendChild(hexCode);

    box.addEventListener("click", () => {
      navigator.clipboard
        .writeText(colour.hex)
        .then(() => {
          showWATMToast("Colour code copied to clipboard");
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
        });
    });

    watmActionbarPaletteContent.appendChild(box);
  });

  watmActionbarPalette.append(
    watmActionbarPaletteButton,
    watmActionbarPaletteContent
  );

  const watmActionbar = document.getElementById("watm_actionbar");
  watmActionbar.append(
    watmActionbarLogo,
    watmActionbarAppName,
    watmActionbarScreen,
    watmActionbarPalette,
    watmActionbarSave,
    watmActionbarExit
  );

  const watmSelectedElement = createElementWithAttributes("div", {
    id: "watm_selected_element",
  });
  const selectElementText = createElementWithAttributes("div", {
    id: "watm_selected_element_text",
    innerText: "Click an item on the webpage to inspect and modify it.",
  });
  watmSelectedElement.append(selectElementText);

  document.getElementById("watm_sidebar").append(watmSelectedElement);

  document
    .getElementById("watm_sidebar")
    .addEventListener("change", function (event) {
      if (
        event.target.tagName === "INPUT" ||
        event.target.tagName === "SELECT"
      ) {
        saveWATMDraft(event.target.id);
      }
    });

  const debouncedToast = WATMdebounce((WATMtag) => {
    saveWATMDraft(WATMtag);
  }, 1000);

  document
    .getElementById("watm_sidebar")
    .addEventListener("input", function (event) {
      if (event.target.isContentEditable) {
        debouncedToast(event.target.id);
      }
    });

  removeListeners = outlineElements();
  interceptClicks();
};

const handleKeydown = (event) => {
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === "E") {
    event.preventDefault();
    if (!document.body.classList.contains("watm_active")) {
      document.body.classList.add("watm_active");
      loadWATM();
    }
  }
};

const exitEditor = () => {
  document.body.classList.remove("watm_active");
  document.getElementById("watm_actionbar").innerHTML = "";
  document.getElementById("watm_sidebar").innerHTML = "";
  document
    .querySelectorAll(".watm_selected, .watm_editable_selected")
    .forEach((element) => {
      element.classList.remove("watm_selected", "watm_editable_selected");
    });
  if (typeof removeListeners === "function") {
    removeListeners();
  }
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
      element.setAttribute("data-watm-id", hash);
    }
    element.childNodes.forEach((child) => processElement(child));
  };
  if (rootElement) processElement(rootElement);
};

const outlineElements = () => {
  let tagBox = null;

  const mouseoverHandler = (event) => {
    const target = event.target;
    if (target.hasAttribute("data-watm-id")) {
      const tagName = target.tagName;
      const hasText = Array.from(target.childNodes).some(
        (node) =>
          node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== ""
      );

      if (hasText) {
        target.classList.add("watm_editable_hover");
      } else if (
        target.tagName.toLowerCase() === "input" ||
        target.tagName.toLowerCase() === "select" ||
        target.tagName.toLowerCase() === "option" ||
        target.tagName.toLowerCase() === "textarea" ||
        target.classList.contains("menuInner")
      ) {
        target.classList.add("watm_hover");
      }

      document.addEventListener("mousemove", mousemoveHandler);
    }
  };

  const mousemoveHandler = (event) => {};

  const mouseoutHandler = (event) => {
    const target = event.target;
    target.classList.remove("watm_hover", "watm_editable_hover");
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
      clickedElement.classList.contains("watm_hover") ||
      clickedElement.classList.contains("watm_editable_hover")
    ) {
      event.preventDefault();
      document
        .querySelectorAll(".watm_selected, .watm_editable_selected")
        .forEach((element) => {
          element.classList.remove("watm_selected", "watm_editable_selected");
        });

      if (clickedElement.classList.contains("watm_hover")) {
        clickedElement.classList.add("watm_selected");
      } else if (clickedElement.classList.contains("watm_editable_hover")) {
        clickedElement.classList.add("watm_editable_selected");
      }
      watmInspect(clickedElement);
    }
  });
};

const watmInspect = (element) => {
  const watmSidebar = document.querySelector("#watm_sidebar");
  const watmModifyMenu = watmSidebar.querySelector(".watmModifyMenu");

  if (watmModifyMenu) {
    let nextElement = watmModifyMenu.nextElementSibling;
    while (nextElement) {
      const elementToRemove = nextElement;
      nextElement = nextElement.nextElementSibling;
      watmSidebar.removeChild(elementToRemove);
    }
  }

  const hasText = Array.from(element.childNodes).some(
    (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== ""
  );
  let elType = "Container";
  if (hasText) elType = "Text";
  if (element.tagName === "IMG") elType = "Image";
  if (element.tagName === "A") elType = "Link";
  if (element.tagName === "BUTTON") elType = "Button";
  if (element.tagName === "INPUT")
    elType = element.type === "text" ? "Textbox" : element.type;
  if (element.tagName === "TEXTAREA") elType = "Textarea";
  if (element.tagName === "SELECT") elType = "Select";
  if (element.classList.contains("menuInner")) elType = "Menu";

  const watmSelectedElement = document.getElementById("watm_selected_element");
  watmSelectedElement.innerHTML = "";
  const watmSelectedElementTag = createElementWithAttributes("span", {
    id: "watm_selected_element_tag",
    innerText: `<${element.tagName}>`,
    title: "Type of selected element",
  });
  const watmSelectedElementId = createElementWithAttributes("span", {
    id: "watm_selected_element_id",
    innerText: `@${element.dataset.watmId}`,
    title: "EZ-Tag ID",
  });
  const watmSelectedElementType = createElementWithAttributes("h1", {
    id: `${element.dataset.watmId}_elementname`,
    className: "watm_selected_element_type",
    innerText: draftJSON[element.dataset.watmId]
      ? draftJSON[element.dataset.watmId].elementName
      : elType,
    contenteditable: true,
    title: "Click to rename",
  });
  watmSelectedElement.append(
    watmSelectedElementTag,
    watmSelectedElementId,
    watmSelectedElementType
  );

  createModifyMenu(elType.toLowerCase(), element.dataset.watmId);

  if (draftJSON[element.dataset.watmId]) {
    const modifications = draftJSON[element.dataset.watmId].modifications;
    for (const watm_key in modifications) {
      if (modifications.hasOwnProperty(watm_key)) {
        const modType = modifications[watm_key][0].modType;
        const modText = watmModifyOptions.find((opt) => opt.value === modType);
        addModCard(modType, modText.text, element.dataset.watmId, watm_key);
      }
    }
  }
};

const createModifyMenu = (elType, watmId) => {
  const existingWatmModifyMenu = document.querySelector(".watmModifyMenu");
  if (existingWatmModifyMenu) existingWatmModifyMenu.remove();

  const watmModifyMenuContainer = createElementWithAttributes("div", {
    className: "watmModifyMenu",
  });
  const watmModifyMenuButton = createElementWithAttributes("button", {
    className: "watmModifyMenu_button",
    textContent: "Add a modification",
  });
  watmModifyMenuContainer.append(watmModifyMenuButton);

  const watmModifyMenuContent = createElementWithAttributes("div", {
    className: "watmModifyMenu_content",
    id: "watmModifyMenu_content",
  });
  watmModifyMenuContainer.append(watmModifyMenuContent);

  const filteredOptions = watmModifyOptions.filter(
    (option) => option.type === elType
  );
  filteredOptions.forEach((option) => {
    const a = createElementWithAttributes("a", {
      textContent: option.text,
      dataset: { value: option.value },
    });
    a.addEventListener("click", () =>
      addModCard(option.value, option.text, watmId)
    );
    watmModifyMenuContent.append(a);
  });

  const watmSelectedElement = document.getElementById("watm_selected_element");
  watmSelectedElement.insertAdjacentElement(
    "afterend",
    watmModifyMenuContainer
  );

  watmModifyMenuButton.addEventListener("click", () => {
    watmModifyMenuContainer.classList.toggle("show");
  });

  window.addEventListener("click", (event) => {
    if (!event.target.matches(".watmModifyMenu_button")) {
      document
        .querySelectorAll(".watmModifyMenu.show")
        .forEach((menu) => menu.classList.remove("show"));
    }
  });

  const watmModCardVisibility = createElementWithAttributes("div", {
    className: "watmModCardVisibility",
  });
  const watmModCardVisibilityShow = createElementWithAttributes("div", {
    className: "watmModCardVisibilityToggle",
  });
  const watmModCardVisibilityHide = createElementWithAttributes("div", {
    className: "watmModCardVisibilityToggle",
  });

  const watmModCardVisibilityShowRadio = createElementWithAttributes("input", {
    id: `${watmId}_show_toggle`,
    name: `${watmId}_toggle`,
    type: "radio",
    checked: true,
    value: "show",
  });

  const watmModCardVisibilityHideRadio = createElementWithAttributes("input", {
    id: `${watmId}_hide_toggle`,
    name: `${watmId}_toggle`,
    type: "radio",
    value: "hide",
  });

  const watmModCardVisibilityShowLabel = createElementWithAttributes("label", {
    for: `${watmId}_show_toggle`,
    innerText: "Show",
    title: "Show this element",
  });

  const watmModCardVisibilityHideLabel = createElementWithAttributes("label", {
    for: `${watmId}_hide_toggle`,
    innerText: "Hide",
    title: "Hide this element",
  });

  watmModCardVisibilityShow.append(
    watmModCardVisibilityShowRadio,
    watmModCardVisibilityShowLabel
  );
  watmModCardVisibilityHide.append(
    watmModCardVisibilityHideRadio,
    watmModCardVisibilityHideLabel
  );
  watmModCardVisibility.append(
    watmModCardVisibilityShow,
    watmModCardVisibilityHide
  );

  const watmVisibilityRadios = watmModCardVisibility.querySelectorAll(
    `input[type=radio][name="${watmId}_toggle"]`
  );
  watmVisibilityRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      if (this.value === "show") {
        document
          .querySelectorAll("#watm_sidebar .watmModCard")
          .forEach((card) => {
            card.classList.remove("watm_element_hidden");
          });
      } else {
        document
          .querySelectorAll("#watm_sidebar .watmModCard")
          .forEach((card) => {
            card.classList.add("watm_element_hidden");
          });
      }
    });
  });

  watmModifyMenuContainer.insertAdjacentElement(
    "afterend",
    watmModCardVisibility
  );
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

const addModCard = (modType, modText, watmId, watm_key = Date.now()) => {
  const modId = `${watmId}_${modType}_${watm_key}`;
  const currentModification =
    draftJSON[watmId] && draftJSON[watmId].modifications[watm_key]
      ? draftJSON[watmId].modifications[watm_key][0]
      : {};

  const watmModCard = createElementWithAttributes("div", {
    className: "watmModCard",
    id: modId,
    dataset: { watmModId: modId },
  });

  const watmModCardHeader = createElementWithAttributes("div", {
    className: "watmModCardHeader",
    innerText: modText,
  });

  const watmModCardHelpButton = createElementWithAttributes("button", {
    className: "watmModCardHeaderButton watmModCardHelp",
    innerHTML: '<i class="material-symbols-outlined">help</i>',
    title: "View Documentation",
  });

  const watmModCardDeleteButton = createElementWithAttributes("button", {
    className: "watmModCardHeaderButton watmModCardDelete",
    innerHTML: '<i class="material-symbols-outlined">delete</i>',
    title: "Remove Modification",
  });

  watmModCardDeleteButton.addEventListener("click", () => {
    const divToRemove = document.querySelector(
      `div[data-watm-mod-id="${modId}"]`
    );
    if (divToRemove) {
      const parentContainer = divToRemove.parentElement;
      let found = false;

      parentContainer.querySelectorAll(".watmModCard").forEach((card) => {
        if (card === divToRemove) {
          found = true;
        } else if (found) {
          card.classList.add("watm_slide_up");
        }
      });

      if (draftJSON[watmId] && draftJSON[watmId].modifications[watm_key]) {
        delete draftJSON[watmId].modifications[watm_key];
      }

      divToRemove.classList.add("watm_slide_up_delete");

      setTimeout(() => {
        divToRemove.remove();
        parentContainer.querySelectorAll(".watmModCard").forEach((card) => {
          card.classList.remove("watm_slide_up");
        });
      }, 500);
    }
  });

  const watmModCardEnabled = createElementWithAttributes("label", {
    className: "watmModCardEnabled",
  });

  const watmModCardEnabledToggle = createElementWithAttributes("input", {
    type: "checkbox",
    id: `${modId}_enabled`,
    checked: true,
  });

  const watmModCardEnabledToggleIcon = createElementWithAttributes("i", {
    className: "material-symbols-outlined watm_toggle_on",
    id: `${modId}_enabled_icon`,
    innerText: "toggle_on",
    title: "Set as Active or Inactive",
  });

  watmModCardEnabledToggle.addEventListener("change", () => {
    const watm_card_inputs = watmModCard.querySelectorAll(
      ".modCardRow input, .modCardRow select"
    );
    const isEnabled = watmModCardEnabledToggle.checked;

    watmModCardEnabledToggleIcon.classList.toggle(
      "watm_toggle_off",
      !isEnabled
    );
    watmModCardEnabledToggleIcon.classList.toggle("watm_toggle_on", isEnabled);
    watmModCardEnabledToggleIcon.textContent = isEnabled
      ? "toggle_on"
      : "toggle_off";
    watm_card_inputs.forEach((input) => (input.disabled = !isEnabled));
  });

  watmModCardEnabled.append(
    watmModCardEnabledToggle,
    watmModCardEnabledToggleIcon
  );
  watmModCardHeader.append(
    watmModCardEnabled,
    watmModCardDeleteButton,
    watmModCardHelpButton
  );
  watmModCard.append(watmModCardHeader);

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
      watmModCard.append(div);
    });
  };

  appendLanguageDropdown(modId, watmModCard, currentModification);

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
  }

  document.getElementById("watm_sidebar").append(watmModCard);
};

const appendLanguageDropdown = (
  watmModCard,
  watmModCardEl,
  currentModification = {}
) => {
  const scopeDiv = createElementWithAttributes("div", {
    className: "modCardRow",
  });

  const scopeLabel = createElementWithAttributes("label", {
    innerText: "Language:",
    htmlFor: `${watmModCard}_language`,
  });
  const scopeDropdown = createElementWithAttributes("select", {
    id: `${watmModCard}_language`,
  });

  const allOption = createElementWithAttributes("option", {
    value: "all",
    innerText: "All",
  });
  scopeDropdown.append(allOption);

  scopeLanguages.forEach((optionText) => {
    const option = createElementWithAttributes("option", {
      value: optionText.toLowerCase().replace(/\s+/g, ""),
      innerText: optionText,
    });
    scopeDropdown.append(option);
  });

  // Set the dropdown value based on currentModification
  if (currentModification.language) {
    scopeDropdown.value = currentModification.language;
  }

  scopeDiv.append(scopeLabel, scopeDropdown);
  watmModCardEl.append(scopeDiv);
};

const appendInputField = (watmModCard, labelText, inputId) => {
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
  watmModCard.append(inputDiv);
};

const getColorPalette = (imageData, numColours = 6) => {
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
  const palette = sortedColours.slice(0, numColours).map((rgb) => {
    const [r, g, b] = rgb.split(",").map(Number);
    return { rgb: `rgb(${r},${g},${b})`, hex: rgbToHex(r, g, b) };
  });

  return palette;
};

const rgbToHex = (r, g, b) => {
  return (
    "#" +
    ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
  );
};

function showWATMToast(message) {
  const toasterContainer = document.getElementById("watm_toaster_container");

  const toast = document.createElement("div");
  toast.className = "watm_toaster";
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

function WATMdebounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

function initializeDraftID(watm_id, elementType, elementName, isVisible) {
  if (!draftJSON[watm_id]) {
    draftJSON[watm_id] = {
      type: elementType,
      elementName: elementName,
      isVisible: isVisible,
      modifications: {},
    };
  } else {
    draftJSON[watm_id].isVisible = isVisible;
    draftJSON[watm_id].elementName = elementName;
  }
}

function buildWATMDraft(
  watm_id,
  watm_key,
  modType,
  enabled,
  language,
  originalText = "",
  replacementText = "",
  pattern = ""
) {
  const modification = {
    modType: modType,
    language: language,
    enabled: enabled,
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
    case "button":
      break;
    case "input":
      break;
    case "menu":
      break;
  }

  draftJSON[watm_id].modifications[watm_key] = [];

  draftJSON[watm_id].modifications[watm_key].push(modification);
}

const saveWATMDraft = (WATMtag) => {
  let watm_id = WATMtag.split("_")[0];
  let watm_name = document.getElementById(`${watm_id}_elementname`).innerText;
  let elementType = document.getElementById(`${watm_id}_elementname`).tagName;
  let isVisibleRadio = document.querySelector(
    `input[name="${watm_id}_toggle"]:checked`
  );
  let isVisible = isVisibleRadio.value === "show";

  initializeDraftID(watm_id, elementType, watm_name, isVisible);

  let sidebar = document.getElementById("watm_sidebar");
  sidebar.querySelectorAll(".watmModCard").forEach((mod) => {
    let watm_type = mod.id.split("_")[1];
    let watm_key = mod.id.split("_")[2];
    let language, originalText, replacementText, pattern;
    switch (watm_type) {
      case "text":
        language = document.getElementById(`${mod.id}_language`).value;
        replacementText = document.getElementById(
          `${mod.id}_ReplacementText`
        ).value;
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
      case "button":
        break;
      case "input":
        break;
      case "menu":
        break;
    }

    enabled = document.getElementById(`${mod.id}_enabled`).checked;

    buildWATMDraft(
      watm_id,
      watm_key,
      watm_type,
      enabled,
      language,
      originalText,
      replacementText,
      pattern
    );
  });
  console.log(draftJSON);
  showWATMToast("Draft changes saved");
};

const checkLicense = async () => {
  let license;

  const checkUrl = `https://hook.us1.make.com/${checkCode}`;

  if (license_key !== "") {
    license = getCookie("watmlicense");
    if (license) {
      if (license == "trial") {
        showWATMToast("EZ Designer running in trial mode");
        console.log("EZ Designer running in trial mode");
        loadWATM(license);
      } else if (license == "invalid") {
        showWATMToast("Invalid License Key for EZ Designer");
        console.log("Invalid License Key for EZ Designer");
        exitEditor();
      } else {
        console.log("EZ Designer is running");
        loadWATM(license);
      }
    } else {
      try {
        const response = await Promise.race([
          fetch(`${checkUrl}/?json=true&key=${license_key}`),
          watmTimeout(3000),
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
          showWATMToast("Invalid License Key for EZ Designer");
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
            showWATMToast("License Key for EZ Designer expired");
            exitEditor();
          }
        }

        setCookie("watmlicense", license);
        console.log("EZ Designer is running");
        loadWATM(license);
      } catch (error) {
        if (error.message === "Request timed out") {
          showWATMToast(
            "EZ Web Designer License Server took too long to respond"
          );
          console.log(
            "EZ Web Designer License Server took too long to respond - loading in Trial mode."
          );
          license = "trial";
          showWATMToast("EZ Designer running in trial mode");
          console.log("EZ Designer running in trial mode");
          loadWATM(license);
        } else {
          showWATMToast(
            "Could not verify license - Please check CORS settings"
          );
          console.log(`EZ Web Designer License Fetch request error: ${error}`);
          exitEditor();
        }
      }
    }
  } else {
    license = "trial";
    showWATMToast("EZ Designer running in trial mode");
    console.log("EZ Designer running in trial mode");
    setCookie("watmlicense", license);
    loadWATM(license);
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

function watmTimeout(delay) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Request timed out")), delay)
  );
}
