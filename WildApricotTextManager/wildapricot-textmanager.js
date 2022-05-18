//import {loadConfig} from "./modules/required-modules.js";
import * as watm_fn from "./modules/functions.js";

let languages = [];
let watm_version = "2.0";

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
        : value.toLowerCase() + ".csv"; // Default to label name if not provided

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

  // TODO: Load default config file

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

    let currentLanguage = watm_fn.getCurrentLanguage();
    currentLanguage =
      currentLanguage == "Default" ? languages[0].className : currentLanguage;

    console.log(currentLanguage);

    //if (currentLanguage !== languages[0].className) {
    // Hide classes for unselected language
    languages.forEach((language) => {
      if (language.className !== currentLanguage) {
        document
          .querySelectorAll(`.${language.className}`)
          .forEach(function (el) {
            el.style.display = "none";
          });
      }
    });
    // TODO: Load selected language CSV
    //}
  }

  // TODO: Create element inspector
});
