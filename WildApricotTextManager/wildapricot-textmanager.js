import * as watm_fn from "./modules/functions.js";
import * as inspector from "./modules/inspector.js";
import * as profile from "./modules/profile-field.js";

let languages = [];
let currentCSV;
let watm_version = "2.0";
let watm_continue = false;
let currentLanguage;

document.addEventListener("DOMContentLoaded", function (event) {
  let textManagerProductionMode = !watm_fn.isInEditMode();

  if (textManagerProductionMode) {
    watm_fn.log(
      `Wild Apricot Text Manager ${watm_version} loaded in production mode`
    );
  } else {
    watm_fn.log(
      `Wild Apricot Text Manager ${watm_version} loaded in development mode`
    );
  }

  const overlay = document.createElement("div");
  overlay.id = "watm-overlay";
  document.body.appendChild(overlay);

  // set watm folder location
  if (
    typeof watm_location === "undefined" ||
    watm_location === null ||
    watm_location === ""
  ) {
    var watm_location = "/resources/Theme/WildApricotTextManager";
  }

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
        ? elmId // Use provided element ID if provided
        : "language_switch"; // Default ID to use if one not provided

    // Show language toggle if not disabled
    if (
      (typeof showLanguageSwitch === "undefined" ||
        showLanguageSwitch !== false) &&
      textManagerProductionMode
    )
      watm_fn.createToggle(languages, elmId);
  } else var isMultilingual = false; // Site is not multilingual

  // Load default config file

  Papa.parse(`${watm_location}/config.csv`, {
    download: true,
    header: true,
    skipEmptyLines: "greedy",
    complete: function (results) {
      results.data.forEach((row) => {
        watm_fn.process(row);
      });
      languageCallback();
    },
  });

  // Routines for multilanguage site
  if (isMultilingual && textManagerProductionMode) {
    // Check for language toggle keyword in URL
    if (window.location.href.indexOf("?watm-") > -1) {
      languages.forEach((language, index) => {
        if (window.location.href.indexOf(`?watm-${language.className}`) > -1) {
          // Set language cookie
          watm_fn.setLanguage(language.className);
        }
      });
    }

    if (include_watm_modules.includes("profile_field")) {
      if (!profile.checked()) {
        profile
          .getLanguage(watm_account_id, watm_client_id, watm_language_field)
          .then((profileLanguage) => {
            if (profileLanguage !== "") {
              let lang = languages.find((l) => l.label === profileLanguage);
              if (lang)
                window.location.href =
                  window.location.href + `?watm-${lang.className}`;
              else watm_continue = true;
            } else watm_continue = true;
          });
      } else watm_continue = true;
    } else watm_continue = true;

    if (watm_continue) {
      currentLanguage = watm_fn.getCurrentLanguage();
      currentLanguage =
        currentLanguage == "Default" ||
        currentLanguage == null ||
        currentLanguage == ""
          ? languages[0].className
          : currentLanguage;
    }

    watm_fn.log(`Currently using ${currentLanguage} translation`);

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
      Papa.parse(`${watm_location}/translations/${currentCSV}`, {
        download: true,
        header: true,
        skipEmptyLines: "greedy",
        complete: function (results) {
          results.data.forEach((row) => {
            watm_fn.process(row);
          });
        },
      });
    }
  };

  // If inspector is enabled
  if (include_watm_modules.includes("inspector")) {
    // show Inspector if keyword present
    if (window.location.href.indexOf("?dev") > -1) {
      // If editor is enabled
      let isEditorEnabled;
      if (include_watm_modules.includes("editor")) isEditorEnabled = true;
      else isEditorEnabled = false;
      // start inspector
      inspector.start(isEditorEnabled, languages, watm_location);
    }
    // Attach inspector button
    else if (showInspectorButton) inspector.appendBtn();
  }

  document.getElementById("watm-overlay").style.display = "none"; // Remove the white overlay
});
