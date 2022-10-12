let addon_version = "1.0";
log(`FontAwesome EZ-Addon Version ${addon_version} enabled.`);

let fontawesome = () => {
  document.querySelectorAll("body *").forEach(function (el) {
    let regex = /\[ez-fa]{1,}(.*?)\[\/ez-fa]{1,}/gi;
    let faRegex = /(?<=\[ez-fa])([a-z0-9].*?)(?=\[\/ez-fa])/gi;
    walkText(el, regex, "icon", function (node, match, offset) {
      let iconEl = document.createElement("i");
      iconEl.classList.add("fa-solid");
      while ((faIcon = faRegex.exec(match)) !== null) {
        if (faIcon !== undefined) iconEl.classList.add(`fa-${faIcon[0]}`);
      }
      return iconEl;
    });
  });
};
