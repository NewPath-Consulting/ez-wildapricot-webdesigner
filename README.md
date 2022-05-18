# Documentation (Version 2.0-Alpha)

⚠️ This is an alpha test build, and should not be used in production.

## Project Description

Introducing our new [EZ Wild Apricot Web Designer](https://newpathconsulting.com/watm) \(aka WATM\), redesigned from the ground up using ECMAScript 6 to work without jQuery. 

EZ Wild Apricot Web Designer will help any administrator with some knowledge of the [Document Object Model (DOM)](https://www.w3schools.com/js/js_htmldom.asp) manage and replace nearly every piece of hard-coded and configurable text in Wild Apricot.

You can make a variety of single page, whole site, and Wild Apricot widget changes such as:

- search and replace of a particular text string
- modify field labels on forms, button labels
- change hard-coded text, errors, and warnings
- hide text on any user interface items
- allow your site to be offered in an unlimited number of languages

EZ Wild Apricot Web Designer module can be used to make Wild Apricot sites available in two or more languages by dynamically replacing strings with a translated string. A translator will use a comma separated value (CSV)-formatted configuration file that is easily editable, making it easy to maintain hundreds of modifications in a human-readable file. A standard file with over 600 English-to-French Wild Apricot labels and strings is included.

## Installation

### Script Setup

1. In Admin View of Web Apricot, browse to Settings -&gt; Site -&gt; Global JavaScript. More details on inserting JavaScript into Wild Apricot are available in [Wild Apricot Documentation](https://gethelp.wildapricot.com/en/articles/212-inserting-and-modifying-html-or-javascript#javascript).
2. Copy and paste the following lines to the Global JavaScript.

NOTE: this code snippet assumes you have uploaded all files into the folder `/resources/Theme/WildApricotTextManager`

   ```html
<script>
  var watm_language_name = [];
  var watm_language_className = [];
  var watm_language_csv_file = [];

  /*
    Array of available languages
    Can omit is site is not multilingual
    Only "watm_language_name" is required, "watm_language_className"
    and "watm_language_csv_file" will use "watm_language_name" value if not present
  */
  watm_language_name[0] = "English";
  watm_language_className[0] = "english";
  watm_language_name[1] = "Français";
  watm_language_className[1] = "french";
  watm_language_csv_file[1] = "french.csv";
  watm_language_name[2] = "Español";
  watm_language_className[2] = "spanish";
  watm_language_csv_file[2] = "spanish.csv";
  watm_language_name[3] = "日本語";
  watm_language_className[3] = "japanese";
  watm_language_csv_file[3] = "japanese.csv";

  /* Optional, used to show default language switcher */
  var showLanguageSwitch = true;
  var languageSwitcherId = "language_switch"; // ID of element to replace with switcher

</script>

<script src="/resources/Theme/WildApricotTextManager/wildapricot-textmanager.js" type="module"></script>
<link rel="stylesheet" href="resources/Theme/WildApricotTextManager/css/default.css">
   ```

### Files Setup

1. Follow these [instructions to connect to your Wild Apricot file folder](https://gethelp.wildapricot.com/en/articles/198-uploading-and-downloading-files-using-webdav)
2. Upload the `WildApricotTextManager` folder to the Theme folder on your Wild Apricot site.

    The file and folder structure will be as follows:

    ```
    📦WildApricotTextManager
    ┣ 📂css
    ┃ ┗ 📜default.css
    ┣ 📂modules
    ┃ ┗ 📜functions.js
    ┣ 📂translations
    ┃ ┣ 📜french.csv
    ┃ ┣ 📜...
    ┃ ┗ 📜...
    ┣ 📜config.csv
    ┣ 📜csv-parser.js
    ┗ 📜wildapricot-textmanager.js
    ```

3. Modify `config.csv with your general` in the `WildApricotTextManager` folder with your general changes
4. Upload a seperate CSV for each additional language you are offering to the `translations` folder

The configuration and translation files must be saved as a CSV file format in UTF-8 format.