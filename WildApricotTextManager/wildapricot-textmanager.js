/**
 * The current script element.
 * @type {HTMLScriptElement}
 */
const currentScript = document.currentScript;
/**
 * The path of the current script.
 * Extracts the base URL of the script source.
 * @type {string}
 */
const watmLocation = currentScript.src.substring(
  0,
  currentScript.src.lastIndexOf("/")
);

document.addEventListener("DOMContentLoaded", () => {
  (() => {
    /**
     * The head element of the document.
     * @type {HTMLHeadElement}
     */

    const head = document.head;

    /**
     * Create and append the CSS link element to the head.
     * @type {HTMLLinkElement}
     */

    const linkCSS = document.createElement("link");
    linkCSS.type = "text/css";
    linkCSS.rel = "stylesheet";
    linkCSS.href = `${watmLocation}/css/app.css`;
    head.appendChild(linkCSS);

    /**
     * Create and append the script element to the head.
     * @type {HTMLScriptElement}
     */

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = `${watmLocation}/scripts/functions.js`;
    head.appendChild(script);

    /**
     * Initialize the WATM application.
     * Calls `processElements` function.
     * Creates and appends the sidebar and action bar elements to the body.
     * Adds a keydown event listener.
     */

    const startWATM = () => {
      processElements(document.querySelector("body > div:first-of-type"));

      /**
       * The sidebar element.
       * @type {HTMLDivElement}
       */

      const watmSidebar = createElementWithAttributes("div", {
        id: "watm_sidebar",
        className: "watm_sidebar",
      });

      /**
       * The action bar element.
       * @type {HTMLDivElement}
       */

      const watmActionbar = createElementWithAttributes("div", {
        id: "watm_actionbar",
        className: "watm_actionbar",
      });

      document.body.append(watmSidebar, watmActionbar);

      document.addEventListener("keydown", handleKeydown);
    };

    /**
     * Event handler for the script element's readystatechange event.
     * Calls startWATM if the script's readyState is complete.
     */

    script.onreadystatechange = () => {
      if (script.readyState === "complete") startWATM();
    };

    /**
     * Event handler for the script element's load event.
     * Calls startWATM when the script has loaded.
     */

    script.onload = startWATM;
  })();
});
