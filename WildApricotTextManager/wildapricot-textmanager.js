let watm_location = document.currentScript.src.substring(
  0,
  document.currentScript.src.lastIndexOf("/")
);

let watm_version = "2.0";
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
  enable_public_inspector = false,
  do_not_cache = false;

let loadedScripts = 0;
let requiredScripts = [
  "csv-parser.js",
  "functions.js",
  "inspector.js",
  "https://cdnjs.cloudflare.com/ajax/libs/color-thief/2.3.0/color-thief.umd.js",
  "https://unpkg.com/@popperjs/core@2",
  "https://unpkg.com/tippy.js@6",
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
  loadCSS(`${watm_location}/css/${watm_styles}.css`);
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

        // Set current language csv csv name
        let filename = watm_language_csv_file[index]
          ? watm_language_csv_file[index] // Use provided filename if provided
          : className + ".csv"; // Default to class name if not provided

        // Push values to language object
        languages.push({ label, className, filename });
      });

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
        createToggle(languages, elmId);
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
          let BreakException = {};
          try {
            results.data.forEach((row) => {
              process(row);
              lineCount++;
              if (license == "trial" && lineCount <= 10) throw BreakException;
            });
          } catch (e) {
            log(
              "Trial only permits loading first 10 lines of config.csv",
              "Trial Mode"
            );
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

      currentLanguage = getCurrentLanguage();
      currentLanguage =
        currentLanguage == "Default" ||
        currentLanguage == null ||
        currentLanguage == ""
          ? languages[0].className
          : currentLanguage;

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
          if (index !== 0) {
            currentCSV = language.filename;
          }
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
              let BreakException = {};
              try {
                results.data.forEach((row) => {
                  process(row);
                  lineCount++;
                  if (license == "trial" && lineCount <= 10)
                    throw BreakException;
                });
              } catch (e) {
                log(
                  `Trial only permits loading first 10 lines of ${currentCSV}`,
                  "Trial Mode"
                );
              }
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
          (enable_public_inspector && !isInEditMode())
      );
  };

  if (!hideWATMIcon) showWATMIcon(license);

  if (window.location.href.indexOf("?watm-") == -1)
    document.body.style.visibility = "visible";

  if (
    window.location.href.indexOf("?dev") > -1 &&
    (!!document.getElementById("idWaAdminSwitcher") ||
      (enable_public_inspector && !isInEditMode())) &&
    license !== "invalid"
  ) {
    launchInspector(languages, watm_location);
  }
}
