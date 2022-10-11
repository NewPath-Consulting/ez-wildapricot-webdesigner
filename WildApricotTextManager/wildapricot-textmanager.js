let watm_location = document.currentScript.src.substring(
  0,
  document.currentScript.src.lastIndexOf("/")
);

let watm_version = "2.04";
let watm_styles = "default";
let watm_info_url = "https://newpathconsulting.com/watm";

window.addEventListener("error", function (e) {
  document.body.style.visibility = "visible";
  return false;
});

window.addEventListener("unhandledrejection", function (e) {
  document.body.style.visibility = "visible";
});

let watm_language_name = [],
  watm_language_className = [],
  watm_language_csv_file = [],
  languages = [],
  currentCSV = "",
  currentLanguage = "",
  license_key = "",
  hideWATMIcon = false,
  show_watm_overlay = true,
  enable_public_editor = false,
  do_not_cache = false,
  checkCode = "8euj9o9frkj3wz2nqm6xmcp4y1mdy5tp",
  toggleShowLangName = true;

let loadedScripts = 0;
let requiredScripts = [
  "jspreadsheet.js",
  "jsuites.js",
  "functions.js",
  "inspector.js",
  "csv-parser.js",
  "https://cdnjs.cloudflare.com/ajax/libs/color-thief/2.3.0/color-thief.umd.js",
  "https://unpkg.com/@popperjs/core@2",
  "https://unpkg.com/tippy.js@6",
];

let requiredStyles = [
  `${watm_location}/css/${watm_styles}.css`,
  `${watm_location}/css/jspreadsheet.css`,
  `${watm_location}/css/jsuites.css`,
];

document.addEventListener("DOMContentLoaded", function (event) {
  loadScripts();
});

function loadScripts() {
  let callback;
  callback =
    loadedScripts < requiredScripts.length - 1 ? loadScripts : checkLicense;
  var head = document.head;
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = `${
    requiredScripts[loadedScripts].includes("http")
      ? ""
      : watm_location + "/scripts/"
  }${requiredScripts[loadedScripts]}`;
  script.onreadystatechange = callback;
  script.onload = callback;
  loadedScripts++;
  head.appendChild(script);
}

function start(license) {
  let googlePreconnect1 = document.createElement("link");
  let googlePreconnect2 = document.createElement("link");
  googlePreconnect1.href = "https://fonts.googleapis.com";
  googlePreconnect2.href = "https://fonts.gstatic.com";
  googlePreconnect1.setAttribute("rel", "preconnect");
  googlePreconnect2.setAttribute("rel", "preconnect");
  googlePreconnect2.setAttribute("crossorigin", "true");
  document.head.appendChild(googlePreconnect1);
  document.head.appendChild(googlePreconnect2);

  loadCSS(requiredStyles);
  let textManagerProductionMode = !isInEditMode();

  if (textManagerProductionMode) {
    log(`Wild Apricot Text Manager ${watm_version} loaded in production mode`);
  } else {
    log(`Wild Apricot Text Manager ${watm_version} loaded in development mode`);
  }

  if (license !== "invalid") {
    if (
      // Check if watm_language_name array exists/is populated
      typeof watm_language_name !== "undefined" &&
      watm_language_name.length > 0
    ) {
      // Set site as multilingual
      var isMultilingual = true;

      watm_language_name.forEach(function (value, index) {
        // Set current language label
        let label = value;

        // Set current language class name
        let className = watm_language_className[index]
          ? watm_language_className[index] // Use provided class name if provided
          : value.toLowerCase(); // Default to label name if not provided

        // Set current language csv name
        let filename = watm_language_csv_file[index]
          ? watm_language_csv_file[index] // Use provided filename if provided
          : className + ".csv"; // Default to class name if not provided

        // Push values to language object
        languages.push({ label, className, filename });
      });

      currentLanguage = getCurrentLanguage();
      currentLanguage =
        currentLanguage == "Default" ||
        currentLanguage == null ||
        currentLanguage == ""
          ? languages[0].className
          : currentLanguage;

      // Create language toggle
      let elmId =
        typeof languageSwitcherId !== "undefined"
          ? languageSwitcherId // Use provided element ID if provided
          : "language_switch"; // Default ID to use if one not provided

      // Show language toggle if not disabled
      if (
        (typeof showLanguageSwitch === "undefined" ||
          showLanguageSwitch !== false) &&
        textManagerProductionMode
      )
        createToggle(
          languages,
          toggleShowLangName ? currentLanguage : "",
          elmId
        );
    } else var isMultilingual = false; // Site is not multilingual

    // Load default config file

    do_not_cache = false;
    Papa.parse(
      `${watm_location}/config.csv${
        do_not_cache === true ? "?time=" + Math.round(Date.now() / 1000) : ""
      }`,
      {
        download: true,
        header: true,
        skipEmptyLines: "greedy",
        complete: function (results) {
          let lineCount = 0;
          try {
            results.data.forEach((row) => {
              process(row);
              lineCount++;
              if (license == "trial" && lineCount > 10) throw "Trial Mode";
            });
          } catch (e) {
            if (e == "Trial Mode") {
              log(
                `Trial only permits loading first 10 lines of ${currentCSV}`,
                "Trial Mode"
              );
            } else {
              log(e, "Error");
            }
          }
          languageCallback();
        },
      }
    );

    // Routines for multilanguage site
    if (isMultilingual && textManagerProductionMode) {
      // Check for language toggle keyword in URL
      if (window.location.href.indexOf("?watm-") > -1) {
        languages.forEach((language, index) => {
          if (
            window.location.href.indexOf(`?watm-${language.className}`) > -1
          ) {
            // Set language cookie
            setLanguage(language.className);
          }
        });
      }

      document.body.classList.add(`${currentLanguage}-lang`);

      log(`Currently using ${currentLanguage} translation`);

      // Hide classes for unselected language
      languages.forEach((language, index) => {
        if (language.className !== currentLanguage) {
          document
            .querySelectorAll(`.${language.className}`)
            .forEach(function (el) {
              el.style.display = "none";
            });
        } else {
          // set language csv
          currentCSV = language.filename;
        }
      });
    }

    const languageCallback = () => {
      // Load selected language CSV
      if (currentCSV) {
        Papa.parse(
          `${watm_location}/translations/${currentCSV}${
            do_not_cache === true
              ? "?time=" + Math.round(Date.now() / 1000)
              : ""
          }`,
          {
            download: true,
            header: true,
            skipEmptyLines: "greedy",
            complete: function (results) {
              let lineCount = 0;
              try {
                results.data.forEach((row) => {
                  process(row);
                  lineCount++;
                  if (license == "trial" && lineCount > 10) throw "Trial Mode";
                });
              } catch (e) {
                if (e == "Trial Mode") {
                  log(
                    `Trial only permits loading first 10 lines of ${currentCSV}`,
                    "Trial Mode"
                  );
                } else {
                  log(e, "Error");
                }
              }
              // FontAwesome
              document.querySelectorAll("body *").forEach(function (el) {
                let regex = /\[ez-fa]{1,}(.*?)\[\/ez-fa]{1,}/gi;
                let faRegex = /(?<=\[ez-fa])([a-z0-9].*?)(?=\[\/ez-fa])/gi;
                walkText(el, regex, "icon", function (node, match, offset) {
                  let iconEl = document.createElement("i");
                  iconEl.classList.add("fa-solid");
                  while ((faIcon = faRegex.exec(match)) !== null) {
                    if (faIcon !== undefined)
                      iconEl.classList.add(`fa-${faIcon[0]}`);
                  }
                  return iconEl;
                });
              });
            },
            error: () => {
              log(`"${currentCSV}" not found`, "Error");
            },
          }
        );
      }
    };
  }

  const showWATMIcon = (license) => {
    if (window.location.href.indexOf("?dev") == -1)
      appendWATMBtn(
        license,
        !!document.getElementById("idWaAdminSwitcher") ||
          (enable_public_editor && !isInEditMode())
      );
  };

  if (!hideWATMIcon) showWATMIcon(license);

  if (window.location.href.indexOf("?watm-") == -1)
    document.body.style.visibility = "visible";

  if (
    window.location.href.indexOf("?dev") > -1 &&
    (!!document.getElementById("idWaAdminSwitcher") ||
      (enable_public_editor && !isInEditMode())) &&
    license !== "invalid"
  ) {
    launchInspector(languages, watm_location);
  }
}
