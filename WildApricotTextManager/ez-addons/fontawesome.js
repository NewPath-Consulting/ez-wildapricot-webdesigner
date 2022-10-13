let fa_addon_version = "1.1";
log(`FontAwesome EZ-Addon Version ${fa_addon_version} enabled.`);


let fontawesome = () => {
  document.querySelectorAll("body *").forEach(function (el) {
    let regex = /\[ez-fa( style="([a-z0-9].*?)")?]([a-z0-9].*?)\[\/ez-fa]/gi;
    walkText(el, regex, "icon", function (node, match, offset) {
      let iconEl = document.createElement("i");
      let matches = match.matchAll(regex);
      for (const famatch of matches) {
        if (famatch[3]) {
          iconEl.classList.add(`fa-${famatch[2] ? famatch[2] : "solid"}`);
          iconEl.classList.add(`fa-${famatch[3]}`);
        }
      }

      return iconEl;
    });
  });
};
