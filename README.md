# Documentation (Version 2.0-Alpha)

⚠️ This is an alpha test build, and should not be used in production.
Addresses issues [#1](/../../issues/1), [#2](/../../issues/2), [#7](/../../issues/7), [#21](/../../issues/21), [#28](/../../issues/28), [#31](/../../issues/31), [#34](/../../issues/34), [#38](/../../issues/38), [#36](/../../issues/36)

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

---
# Installation

## Script Setup

1. In Admin View of Web Apricot, browse to Settings -&gt; Site -&gt; Global JavaScript. More details on inserting JavaScript into Wild Apricot are available in [Wild Apricot Documentation](https://gethelp.wildapricot.com/en/articles/212-inserting-and-modifying-html-or-javascript#javascript).
2. Copy and paste the following lines to the Global JavaScript.

NOTE: this code snippet assumes you have uploaded all files into the folder `/resources/Theme/WildApricotTextManager`

   ```html
  <script src="/resources/Theme/WildApricotTextManager/wildapricot-textmanager.js"></script>
  <script>

    /*
      Array of available languages
      Can omit if site is not multilingual
      Only "watm_language_name" is required, "watm_language_className"
      will use "watm_language_name" value if not present, and "watm_language_csv_file"
      will use "watm_language_className"+ ".csv" if not present
    */
    watm_language_name[0] = "English";        // Default language - uses config.csv, watm_language_className[0] will default to "english"
    watm_language_name[1] = "Français";
    watm_language_className[1] = "french";    // watm_language_csv_file[1] will default to french.csv
    watm_language_name[2] = "Español";
    watm_language_className[2] = "spanish";   // watm_language_csv_file[2] will default to spanish.csv
    watm_language_name[3] = "日本語";
    watm_language_className[3] = "japanese";  // watm_language_csv_file[3] will default to japanese.csv

    /* Optional, used to show default language switcher */
    var showLanguageSwitch = true;
    var languageSwitcherId = "language_switch"; // ID of element to replace with switcher

  </script>
   ```

## Files Setup

1. Follow these [instructions to connect to your Wild Apricot file folder](https://gethelp.wildapricot.com/en/articles/198-uploading-and-downloading-files-using-webdav)

3. Modify `config.csv` in the `WildApricotTextManager` folder with your general changes
4. Upload a separate CSV for each additional language you are offering to the `translations` folder

The configuration and translation files must be saved as a CSV file format in UTF-8 format.

---
# Switching Languages

## Using the Language Toggle

EZ Wild Apricot Web Designer provides an easy to install toggle for switching between the various languages on your site. To add it to your site, simply  add a Content Gadget to your page template in the location you would like the toggle to appear. Set the ID of this gadget to `language_switch` (or whatever you may have changed it to in the script setup). This gadget will now be replaced with the language toggle when viewed from the frontend.

### Translating the Language Toggle

To change the `Select language` text in the configuration or translation files, use the `.watm-dropdown-icon` query with the `Replace` function.

**EXAMPLE:**
```text
Default Text: Select language
Function: replace
Replacement Text: Changer le langue
Query: .watm-dropdown-icon
```

## Using the Language Switch Hook

You are not limited to using the EZ Wild Apricot Web Designer Language Toggle. You can create your own buttons, links, or menu items for switching the language. To switch language, you would link to `?watm-<language>` where `<language>` is the class name for the language you wish to use from the script setup. Note, there is no slash in this link - you are linking to the current page, and appending the language hook to it.

**EXAMPLE:**

```html
<a href="?watm-french">Cette page est également disponible en français</a>
```

---

# Element Inspector

The inspector is a tool you can use to view the styling and targeting information of the various elements on your website. This information is necessary when updating your configuration and translation files.

The inspector is only accessible to logged in administrators. When logged in as an administrator, an icon will appear at the bottom-left of your screen - click on this to launch the inspector. While in Inspector mode, you will not be able to follow any links - click the exit button in the inspector bar to return to normal operation. Hovering over an element will outline the element in red. Clicking on the element will display the element ID and Class (if they are available), as well as the CSS path to the element. [The ID](https://www.w3schools.com/htmL/html_id.asp) or CSS path can be used to target that specific element. [The class](https://www.w3schools.com/cssref/sel_class.asp) can be used to target multiple elements of a similar function.

The `Copy Element ID`, `Copy Element Class`, and `Copy CSS Path` buttons will copy the related information to the clipboard.

The `View Properties` button will display the details about that element, such as the text it contains, styling, and any resource links.

# CSV Editor

The CSV Editor allows you to update the configuration and translations files directly in your web browser, without needing to first download the files or own spreadsheet software. To access the editor, click on the button labeled `Switch to Editor` in the inspector bar. 

In the editor you can select the file you wish to update from the dropdown. Selecting the file will automatically load it below. You may also click on the `Launch Editor in New Window` button to open the editor in a separate, larger window. Once you are finished making your changes, you can either download the updated CSV file or save the file back to your website. If you choose to download the file, the changes will not be applied to your website until you manually upload the file. If you choose to save the file to the website you will be prompted to login with an administrator account. This is done directly with the Wild Apricot website, and WATM can not see or access your website credentials. After saving to the site, you may need to refresh your site to see the changes. To do this, exit the inspector/editor and press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd> on PC or <kbd>Option</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd> on Mac. You may need to do this for each language enabled on your site.

---

# EZ Wild Apricot Web Designer Functions

When editing the EZ Wild Apricot Web Designer configuration and translation files, the following functions are available:

## **hide**
> Hides the targeted element(s)

**EXAMPLE:**
```text
Function: hide
Query: #idFooterPoweredByWA
```
## **text**
> Changes the text in targeted element(s)

**EXAMPLE:**
```text
Function: text
Replacement Text: Changer le passe
Query: .loginBoxChangePassword
```
## **replace**
> Finds and replaces specific text in targeted element(s)

**EXAMPLE:**
```text
Default Text: Home
Function: replace
Replacement Text: Accueil
Query: .menuInner, .WaGadgetBreadcrumbs > div > ul > li
```
## **replace_element**
> Replaces the contents targeted element(s)

## **placeholder**
> Changes the placeholder text of targeted form element(s)

**EXAMPLE:**
```text
Replacement Text: Enter your search keywords here
Function: placeholder
Query: .searchBoxField
```
## **button**
> Changes the text on targeted button(s)

**EXAMPLE:**
```text
Default Text: Click here to login
Function: button
Query: .loginButton
```
## **delay**
> Changes the text in targeted element(s) after 1 second - used for dynamically generated elements, such as member directory

**EXAMPLE:**
```text
Replacement Text: Coordonnées
Function: delay
Query: #membersTable > thead > tr > th:nth-child(1)
```
## **attribute**
> Sets/changes attribute of targeted element(s). Enter attribute name in "Default Text" column, and the attribute value in "Replacement Text"

**EXAMPLE:**
```text
Default Text: target
Replacement Text: _blank
Function: attribute
Query: #id_Footer1 a
```
## **@media**
> Sets a @media CSS Rule. Enter rule name in "Replacement  Text" column

**EXAMPLE:**
```text
Replacement Text: screen and (max-width: 900px)
Function: @media
Query: #id_Header2
Stye: display: none;
```
## **link**
> Changes the `href` URL of targeted element(s)

**EXAMPLE:**
```text
Replacement Text: /donate
Function: link
Query: .headerDonateBtn a
```
## **source**
> Changes the `src` URL of targeted element(s)

## **inactive**
> Ignores current line in file

## The style column can be used in conjunction with a function, or on it's own.
**EXAMPLE:**
```text
Query: h3
Style: color: blue;font-style: italic
```

---
# Browser Requirements
EZ Wild Apricot Web Designer is supported on the latest versions of Chrome, Safari, Firefox and Edge. Older browsers like Internet Explorer on Windows are supported "best effort," without formal testing or 100% compatibility.
