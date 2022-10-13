let ez_tabs_addon_version = "1.0";
log(`EZ-Tabs Addon Version ${ez_tabs_addon_version} enabled.`);

let ez_tabs = () => {
  document.querySelectorAll("body *").forEach(function (el) {
    let regex = /\[ez-tabs( title="([^"]*)")?]([^*].*?)\[\/ez-tabs]/gi;
    walkText(el, regex, "tabs", function (node, match, offset) {
      let tabsContainer = document.getElementById("ezTabsContainer");
      let tabsButtons = document.getElementById("ezTabsButtons");
      if (tabsContainer == null) {
        tabsContainer = document.createElement("div");
        tabsContainer.id = "ezTabsContainer";
      }
      if (tabsButtons == null) {
        tabsButtons = document.createElement("ul");
        tabsButtons.id = "ezTabsButtons";
        tabsContainer.appendChild(tabsButtons);
      }

      let matches = match.matchAll(regex);
      for (const notice_match of matches) {
        if (notice_match[3]) {
          let tabTitle = document.createElement("li");
          tabTitle.innerText = notice_match[2];
          let tabContent = document.createElement("div");
          tabContent.innerHTML = notice_match[3];

          tabsButtons.appendChild(tabTitle);
          tabsContainer.appendChild(tabContent);
        }
      }
      return tabsContainer;
    });
  });

  eztabify("ezTabsContainer");

  function eztabify(target) {
    let wrapper = document.getElementById(target),
      header = document.querySelector(`#${target} > ul`),
      headtabs = document.querySelectorAll(`#${target} > ul > li`),
      bodytabs = document.querySelectorAll(`#${target} > div`);

    if (wrapper) {
      wrapper.classList.add("tabWrap");
      header.classList.add("tabHead");
      for (let i = 0; i < headtabs.length; i++) {
        bodytabs[i].classList.add("tabBody");
        headtabs[i].onclick = () => {
          for (let j = 0; j < headtabs.length; j++) {
            if (i == j) {
              headtabs[j].classList.add("open");
              bodytabs[j].classList.add("open");
            } else {
              headtabs[j].classList.remove("open");
              bodytabs[j].classList.remove("open");
            }
          }
        };
      }

      if (wrapper.querySelector(".open") == null) {
        headtabs[0].classList.add("open");
        bodytabs[0].classList.add("open");
      }
    }
  }
};

const eztabsstyles = `
.tabWrap, .tabWrap * {
  box-sizing: border-box;
}
.tabWrap {
  max-width: 600px;
  margin: 10px auto;
  margin-bottom: 20px;
  box-shadow: 5px 5px 10px -1px rgba(0,0,0,0.28);
}
 
.tabHead {
  display: flex;
  background: #efefef;
  padding: 0!important;
  margin: 0!important;
  list-style: none!important;
}
.tabHead li {
  padding: 10px 20px!important;
  cursor: pointer;
}
.tabHead li.open {
  color: #fff;
  background: #2a87d7;
}

.tabBody {
  padding: 20px;
  display: none;
}
.tabBody.open { display: block; }
`;

let eztabsstyleSheet = document.createElement("style");
eztabsstyleSheet.innerText = eztabsstyles;
document.head.appendChild(eztabsstyleSheet);
