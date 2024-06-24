let ez_language_addon_version = "1.0";
log(`EZ-Language Addon Version ${ez_language_addon_version} enabled.`);

let ez_language = () => {
  const classesToProcess = ["WaGadgetEvents", "WaGadgetUpcomingEvents"];

  classesToProcess.forEach((className) => {
    const elements = document.querySelectorAll(`.${className}`);

    elements.forEach((element) => {
      const html = element.innerHTML;

      const newHtml = html.replace(
        /\[ez ([^\]]+)\]([\s\S]*?)\[\/ez\]/g,
        function (match, p1, p2) {
          if (p1 !== currentLanguage) {
            return `<span class="${p1}" style="display:none;">${p2}</span>`;
          }
          return `<span class="${p1}">${p2}</span>`;
        }
      );

      element.innerHTML = newHtml;
    });
  });
};
