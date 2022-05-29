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

### Browser Based CSS Inspector

If enabled, you will see an icon at the bottom-left of the screen to launch the inspector.

There are 3 potential values that will show up when you click on any element on a page:
- the [Element ID](https://www.w3schools.com/htmL/html_id.asp)
- the CSS Path
- the [Element Class(es)](https://www.w3schools.com/cssref/sel_class.asp).

#### Element ID
An Element ID is unique per web page and identifies a particlar object on a web page. IDs always have a `#` at the beginning of the name and appear in the optional `id` attribute of an element. The `id` attribute is used to point to a specific style declaration in a style sheet. An example ID is `#mytable`. Using the Element ID is the most specific and usually the most accurate way to target a particular element on a page. Unfortunately not all elements in a WildApricot page have an `id` but many do.

#### CSS Path
The CSS Path also can define a particular element using a "chain" of HTML elements. A CSS Path describes an elememt in relation to other elements that contain the specific element so it can be composed of a combination of several tags. A CSS path is precise definition of an element that may be nested within multiple elements. Note that a CSS Path can change if the order of elements on a page are added or removed. As a result a CSS Path can "mutate" due to the configuration of a Wild Apricot database for example. If an Element ID is not available a CSS path can be be used instead.

#### Element Class
An Element class describes one or more CSS classes applied to the element. A class can be used by multiple HTML elements, so as a result it is the least specific of all targets. Use he element class when you wish to apply your changes to all elements that share this class. 

**NOTE: The effects of using an Element class can have unintended consequences. When applying changes to an element class be aware that the changes can be applied wherever the class is applied. A change to an Element class change can cascade into multiple places on a page or even across the website. Using an Element ID or CSS Path is always unique to a specific web page.**

---

Click on the `View Properties` button to view the properties of the clicked item.