/**
 * Offset for tagbox positioning.
 * @constant {number}
 */

const cursorOffset = -20;

/**
 * Variable to store the function for removing event listeners.
 * @type {Function|undefined}
 */

let removeListeners;

/**
 * Array of modification options for different element types
 * @type {Array<{type: string, value: string, text: string}>}
 */

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
  { type: "button", value: "placeholder", text: "Change Change Placeholder" },
];

/**
 * Initializes and loads the editor/inspector
 * This function sets up the action bar with a logo, save button, and exit button,
 * and adds an instruction message to the sidebar. It also sets up event listeners
 * for element outlining and click interception on the webpage.
 */

const loadWATM = () => {
  /**
   * Creates a logo element and appends it to the action bar.
   */

  const watmActionbarLogo = createElementWithAttributes("div", {
    id: "watm_actionbar_logo",
  });
  const logoImage = createElementWithAttributes("img", {
    src: `${watmLocation}/css/logo.png`,
    alt: "WATM",
  });
  watmActionbarLogo.appendChild(logoImage);

  /**
   * Creates screen buttons appends them to the action bar.
   */

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

  watmActionbarScreen.appendChild(watmActionbarScreenCurrent);
  watmActionbarScreen.appendChild(watmActionbarScreenMissing);

  /**
   * Creates a save button element and appends it to the action bar.
   */

  const watmActionbarSave = createElementWithAttributes("div", {
    id: "watm_actionbar_save",
  });
  const watmSaveButton = createElementWithAttributes("button", {
    id: "watm_save_button",
    innerText: "Save",
  });
  watmActionbarSave.appendChild(watmSaveButton);

  /**
   * Creates an exit button element and appends it to the action bar.
   */

  const watmActionbarExit = createElementWithAttributes("div", {
    id: "watm_actionbar_exit",
  });
  const watmExitButton = createElementWithAttributes("button", {
    id: "watm_exit_button",
    innerText: "Exit Editor",
  });
  watmExitButton.addEventListener("click", exitEditor);
  watmActionbarExit.appendChild(watmExitButton);

  /**
   * Creates a colour palette button element and appends it to the action bar.
   */

  const watmActionbarPalette = createElementWithAttributes("div", {
    id: "watm_actionbar_exit",
  });
  const watmActionbarPaletteButton = createElementWithAttributes("button", {
    id: "watm_palette_button",
    innerText: "Color Palette",
  });
  watmActionbarPalette.appendChild(watmActionbarPaletteButton);

  /**
   * Appends the logo, save button, and exit button to the main action bar.
   */

  const watmActionbar = document.getElementById("watm_actionbar");
  watmActionbar.append(
    watmActionbarLogo,
    watmActionbarScreen,
    watmActionbarPalette,
    watmActionbarSave,
    watmActionbarExit
  );

  /**
   * Creates an instruction element and appends it to the sidebar.
   */

  const watmSelectedElement = createElementWithAttributes("div", {
    id: "watm_selected_element",
  });
  const selectElementText = createElementWithAttributes("div", {
    id: "watm_selected_element_text",
    innerText: "Click an item on the webpage to inspect and modify it.",
  });
  watmSelectedElement.appendChild(selectElementText);

  document.getElementById("watm_sidebar").appendChild(watmSelectedElement);

  /**
   * Sets up element outlining and click interception on the webpage.
   */

  removeListeners = outlineElements();
  interceptClicks();
};

/**
 * Handles the 'keydown' event to activate the WATM editor when Ctrl+Shift+E or Cmd+Shift+E is pressed.
 * @param {KeyboardEvent} event - The keyboard event object.
 */

const handleKeydown = (event) => {
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === "E") {
    event.preventDefault();
    if (!document.body.classList.contains("watm_active")) {
      document.body.classList.add("watm_active");
      loadWATM();
    }
  }
};

/**
 * Exits the WATM editor mode, removing the 'watm_active' class and clearing related elements.
 */

const exitEditor = () => {
  document.body.classList.remove("watm_active");
  document.getElementById("watm_actionbar").innerHTML = "";
  document.getElementById("watm_sidebar").innerHTML = "";
  document
    .querySelectorAll(".watm_selected, .watm_editable_selected")
    .forEach((element) => {
      element.classList.remove("watm_selected", "watm_editable_selected");
    });
  removeListeners();
};

/**
 * Generates a CSS selector path for a given HTML element.
 * @param {Element} element - The HTML element for which to generate the CSS path.
 * @returns {string} The CSS path of the element.
 */

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

/**
 * Computes the SHA-1 hash of a given string and returns the first 6 characters of the hash.
 *
 * @param {string} str - The input string to hash.
 * @returns {string} The first 6 characters of the SHA-1 hash of the input string.
 */

const sha1 = (str) => {
  /**
   * Rotates a 32-bit number to the left by a given number of bits.
   *
   * @param {number} n - The 32-bit number to rotate.
   * @param {number} s - The number of bits to rotate.
   * @returns {number} The rotated number.
   */

  const rotate_left = (n, s) => (n << s) | (n >>> (32 - s));

  /**
   * Converts a 32-bit number to a hexadecimal string.
   *
   * @param {number} val - The 32-bit number to convert.
   * @returns {string} The hexadecimal string representation of the number.
   */

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
  return hash.slice(0, 6); // Take the first 6 characters to keep it short
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

      // if (!tagBox) {
      //   tagBox = document.createElement("div");
      //   tagBox.classList.add("watm_tag_box");
      //   document.body.appendChild(tagBox);
      // }

      // tagBox.textContent = tagName;
      // tagBox.className = "watm_tag_box";

      const hasText = Array.from(target.childNodes).some(
        (node) =>
          node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== ""
      );

      if (hasText) {
        //tagBox.classList.add("watm_editable_tag_box");
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

  const mousemoveHandler = (event) => {
    // if (tagBox) {
    //   const left = event.clientX - cursorOffset;
    //   const top = event.clientY - cursorOffset;
    //   tagBox.style.left = `${left}px`;
    //   tagBox.style.top = `${top}px`;
    // }
  };

  const mouseoutHandler = (event) => {
    const target = event.target;
    // if (tagBox) {
    //   tagBox.remove();
    //   tagBox = null;
    // }
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
  });
  const watmSelectedElementId = createElementWithAttributes("span", {
    id: "watm_selected_element_id",
    innerText: `@${element.dataset.watmId}`,
  });
  const watmSelectedElementType = createElementWithAttributes("h1", {
    id: "watm_selected_element_type",
    innerText: elType,
  });
  watmSelectedElement.append(
    watmSelectedElementTag,
    watmSelectedElementId,
    watmSelectedElementType
  );

  createModifyMenu(elType.toLowerCase(), element.dataset.watmId);
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
  watmModifyMenuContainer.appendChild(watmModifyMenuButton);

  const watmModifyMenuContent = createElementWithAttributes("div", {
    className: "watmModifyMenu_content",
    id: "watmModifyMenu_content",
  });
  watmModifyMenuContainer.appendChild(watmModifyMenuContent);

  const filteredOptions = watmModifyOptions.filter(
    (option) => option.type === elType
  );
  filteredOptions.forEach((option) => {
    const a = createElementWithAttributes("a", {
      href: "#",
      textContent: option.text,
      dataset: { value: option.value },
    });
    a.addEventListener("click", (event) => {
      addModCard(option.value, option.text, watmId);
    });
    watmModifyMenuContent.appendChild(a);
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

const addModCard = (modType, modText, watmId) => {
  let currTime = Date.now();
  const watmModCard = createElementWithAttributes("div", {
    className: "watmModCard",
    "data-watm-mod-id": `${watmId}_${modType}_${currTime}`,
  });
  const watmModCardHeader = createElementWithAttributes("div", {
    className: "watmModCardHeader",
    innerText: `${modText}`,
  });

  const scopeLanguages = ["english", "french"];

  watmModCard.appendChild(watmModCardHeader);

  switch (modType) {
    case "replace":
      // Create label and dropdown div
      const scopeDiv = createElementWithAttributes("div", {
        className: "modCardRow",
      });
      const scopeLabel = createElementWithAttributes("label", {
        innerText: "Language:",
        htmlFor: `${watmId}_${modType}_${currTime}_language`,
      });
      const scopeDropdown = createElementWithAttributes("select", {
        id: `${watmId}_${modType}_${currTime}_language`,
      });

      // Add "All" option separately
      const allOption = createElementWithAttributes("option", {
        value: "all",
        innerText: "All",
      });
      scopeDropdown.appendChild(allOption);

      // Populate dropdown with options from array
      scopeLanguages.forEach((optionText) => {
        const option = createElementWithAttributes("option", {
          value: optionText.toLowerCase().replace(/\s+/g, ""),
          innerText: optionText,
        });
        scopeDropdown.appendChild(option);
      });

      scopeDiv.appendChild(scopeLabel);
      scopeDiv.appendChild(scopeDropdown);

      // Create first label and textbox div
      const originalTextDiv = createElementWithAttributes("div", {
        className: "modCardRow",
      });
      const originalTextLabel = createElementWithAttributes("label", {
        innerText: "Original Text:",
        htmlFor: `${watmId}_${modType}_${currTime}_OriginalText`,
      });
      const originalText = createElementWithAttributes("input", {
        type: "text",
        id: `${watmId}_${modType}_${currTime}_OriginalText`,
      });

      originalTextDiv.appendChild(originalTextLabel);
      originalTextDiv.appendChild(originalText);

      // Create second label and textbox div
      const replacementTextDiv = createElementWithAttributes("div", {
        className: "modCardRow",
      });
      const replacementTextLabel = createElementWithAttributes("label", {
        innerText: "Replacement Text:",
        htmlFor: `${watmId}_${modType}_${currTime}_ReplacementText`,
      });
      const replacementText = createElementWithAttributes("input", {
        type: "text",
        id: `${watmId}_${modType}_${currTime}_ReplacementText`,
      });

      replacementTextDiv.appendChild(replacementTextLabel);
      replacementTextDiv.appendChild(replacementText);

      // Append all divs to watmModCard
      watmModCard.appendChild(scopeDiv);
      watmModCard.appendChild(originalTextDiv);
      watmModCard.appendChild(replacementTextDiv);

      break;
  }

  document.getElementById("watm_sidebar").appendChild(watmModCard);
};
