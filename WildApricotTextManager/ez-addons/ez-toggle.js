let ez_toggle_addon_version = "1.0";
log(`EZ-Toggle Addon Version ${ez_toggle_addon_version} enabled.`);

let ez_toggle = () => {
  document.querySelectorAll("body *").forEach(function (el) {
    let regex = /\[ez-toggle( title="([^"]*)")?]([^*].*?)\[\/ez-toggle]/gi;
    walkText(el, regex, "icon", function (node, match, offset) {
      let toggleEl = document.createElement("div");
      toggleEl.classList.add("ezaccordion");

      let matches = match.matchAll(regex);
      for (const notice_match of matches) {
        if (notice_match[3]) {
          let toggleItem = document.createElement("a");
          toggleItem.classList.add("eztoggle");
          toggleItem.href = "";
          toggleItem.innerText = notice_match[2];
          let toggleContent = document.createElement("div");
          toggleContent.classList.add("eztogglecontent");
          toggleContent.innerHTML = notice_match[3];

          toggleEl.appendChild(toggleItem);
          toggleEl.appendChild(toggleContent);
        }
      }
      return toggleEl;
    });
  });
  var toggles = document.querySelectorAll(".eztoggle");

  for (i = 0; i < toggles.length; i++) {
    toggles[i].addEventListener("click", toggleAccord);
  }

  function toggleAccord(e) {
    e.preventDefault();

    if (this.parentNode.classList.contains("eztoggle-active")) {
      this.parentNode.classList.remove("eztoggle-active");
    } else {
      for (i = 0; i < toggles.length; i++) {
        toggles[i].parentNode.classList.remove("eztoggle-active");
      }
      this.parentNode.classList.add("eztoggle-active");
    }
  }
};

const eztogglestyles = `
.ezaccordion .eztoggle {
  position: relative;
  display: block;
  padding: 1rem;
  border: solid #ccc;
  border-width: 0 1px 1px;
  background-color: #f4f4f4;
  text-decoration: none;
  text-transform: uppercase;
  color: #a497ab;
}
.ezaccordion .eztoggle:after {
  content: "+";
  display: block;
  position: absolute;
  right: 15px;
  top: 20%;
  height: 20px;
  width: 20px;
  line-height: 20px;
  border: 2px solid #a497ab;
  border-radius: 50%;
  text-align: center;
  color: #a497ab;
}
.ezaccordion .eztogglecontent {
  display: none;
}
.ezaccordion:first-child .eztoggle {
  border-top-width: 1px;
}
.ezaccordion.eztoggle-active .eztoggle {
  background-color: #f0ebef;
}
.ezaccordion.eztoggle-active .eztoggle,
.ezaccordion.eztoggle-active .eztoggle:after {
  color: #906090;
}
.ezaccordion.eztoggle-active .eztoggle:after {
  content: "_";
  line-height: 10px;
  border-color: #906090;
}
.ezaccordion.eztoggle-active .eztogglecontent {
  display: block;
  padding: 0.5rem 1rem;
  border: solid #ccc;
  border-width: 0 1px 1px;
  background-color: #fff;
  color: #a497ab;
}
`;

let ezstyleSheet = document.createElement("style");
ezstyleSheet.innerText = eztogglestyles;
document.head.appendChild(ezstyleSheet);
