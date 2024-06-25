let ez_language_addon_version = "1.0";
log(`EZ-Language Addon Version ${ez_language_addon_version} enabled.`);

let ez_language = () => {
  const classesToProcess = ["WaGadgetEvents", "WaGadgetUpcomingEvents"];

  classesToProcess.forEach((className) => {
    const elements = document.querySelectorAll(`.${className}`);

    elements.forEach((element) => {
      let html = element.innerHTML;

      html = html.replace(
        /(<(?!div)[^>]+>)?\[ez ([^\]]+)\]/gi,
        function (match, precedingTag, p1) {
          let spanTag = `<span class="${p1.trim()}"`;
          if (p1.trim() === currentLanguage) {
            spanTag += ">";
          } else {
            spanTag += ' style="display:none;">';
          }
          if (precedingTag) {
            return spanTag + precedingTag;
          }
          return spanTag;
        }
      );

      html = html.replace(
        /(<(?!div)[^>]+>)?\[\/ez\]/gi,
        function (match, precedingTag) {
          if (precedingTag) {
            return `</span>${precedingTag}`;
          }
          return `</span>`;
        }
      );

      element.innerHTML = html;
    });
  });
};
