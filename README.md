# Documentation (Version 2.0-Beta)


## Project Description

Introducing our new [EZ Wild Apricot Web Designer](https://newpathconsulting.com/watm) \(aka WATM\), redesigned from the ground up. The product has been rewritten in ECMAScript 6. 

EZ Wild Apricot Web Designer will help any administrator with some knowledge of the [Document Object Model (DOM)](https://www.w3schools.com/js/js_htmldom.asp) manage and replace nearly every piece of hard-coded and configurable text in Wild Apricot.

You can make a variety of single page, whole site, and Wild Apricot widget changes such as:

- search and replace of a particular text string
- modify field labels on forms, button labels
- change hard-coded text, errors, and warnings
- hide text on any user interface items
- allow your site to be offered in an unlimited number of languages

EZ Wild Apricot Web Designer module can be used to make Wild Apricot sites available in two or more languages by dynamically replacing strings with a translated string. A translator will use a comma separated value (CSV) configuration file that is easily editable, making it easy to maintain hundreds of modifications in a human-readable file. A standard file with over 600 English-to-French Wild Apricot labels and strings is included.

---
# Installation

## Script Setup

1. In Admin View of Web Apricot, browse to Settings -&gt; Site -&gt; Global JavaScript. More details on inserting JavaScript into Wild Apricot are available in [Wild Apricot Documentation](https://gethelp.wildapricot.com/en/articles/212-inserting-and-modifying-html-or-javascript#javascript).
2. Copy and paste the following lines to the Global JavaScript.

NOTE: this code snippet assumes you have uploaded all files into the folder `/resources/Theme/WildApricotTextManager`

   ```html
  <style>body{visibility: hidden;}</style>
  <script src="/resources/Theme/WildApricotTextManager/wildapricot-textmanager.js"></script>
  <script>

    // Enter your license key if you have one - omit to use a trial that uses the first 10 lines of a config file
    license_key = "";

    /*
      Array of available languages
      Can omit if site is not multilingual
      Use "watm_language_name" to assign the language name displayed to the user
      Use "watm_language_className" to assign the language slug used on your site
    */
    watm_language_name[0] = "English";        // Default language
    watm_language_className[0] = "english";   // watm_language_csv_file[0] will default to english.csv
    watm_language_name[1] = "Français";
    watm_language_className[1] = "french";    // watm_language_csv_file[1] will default to french.csv
    watm_language_name[2] = "Español";
    watm_language_className[2] = "spanish";   // watm_language_csv_file[2] will default to spanish.csv
    watm_language_name[3] = "日本語";
    watm_language_className[3] = "japanese";  // watm_language_csv_file[3] will default to japanese.csv

  </script>
   ```
   
   3. Enter your license key in the quotes `""` to apply your license.

## Files Setup

1. Follow these [instructions to connect to your Wild Apricot file folder](https://gethelp.wildapricot.com/en/articles/198-uploading-and-downloading-files-using-webdav)
2. Modify `config.csv` in the `WildApricotTextManager` folder with your general changes
3. If you are setting up a multilingual site:
  * Add a Content Gadget to your page template in the location you would like the language toggle to appear. Set the ID of this gadget to `language_switch`
  * Upload a separate CSV for each language you are offering to the `translations` folder.

The configuration and translation files must be saved as a CSV file format in UTF-8 format.

---
# Switching Languages

## Using the Language Toggle

EZ Wild Apricot Web Designer provides an easy to install toggle for switching between the various languages on your site. To add it to your site, simply  add a Content Gadget to your page template in the location you would like the toggle to appear. Set the ID of this gadget to `language_switch`. This gadget will now be replaced with the language toggle when viewed from the frontend.

## Using the Language Switch Hook

You are not limited to using the EZ Wild Apricot Web Designer Language Toggle. You can create your own buttons, links, or menu items for switching the language. To switch language, you would link to `?watm-<language>` where `<language>` is the class name for the language you wish to use from the script setup. Note, there is no slash in this link - you are linking to the current page, and appending the language hook to it.

**EXAMPLE:**

```html
<a href="?watm-french">Cette page est également disponible en français</a>
```

---

# EZ Wild Apricot Inspector & Editor

Using the Inspector & Editor, you can use to view the styling and targeting information of the various elements on your website, as well as make modifications to your EZ Wild Apricot Web Designer configuration files. This information is necessary when updating your configuration and translation files.

The Inspector & Editor are only accessible to logged in administrators by default, but you can enable it in public view using `enable_public_editor = true;`. When logged in as an administrator, an icon will appear at the bottom-left of your screen - click on this to launch the editor. While in Editor mode, you will not be able to follow any links - click the exit button in the inspector bar to return to normal operation. Hovering over an element will outline the element in red.

# Page Inspector

The top half of the panel that appears is the page Inspector. Clicking on the element will display the element's CSS Class (if a class has been set), as well as the CSS path to the element.

The `Copy Element Class`, and `Copy CSS Path` buttons will copy the related information to the clipboard. You can use either one for the Query part of the configuration. CSS Path is always more specific and usually the best Query to use. The CSS Element Class can have unintended consequences on other elements that share the same CSS Class, but sometimes using a CSS Class is a good fallback if the CSS Path is not working to change the site.

The `View Properties` button will display the details about that element, such as the text it contains, styling, and any resource links.

---

# CSV Editor

The bottom half of the panel displays the CSV Editor. In the editor you can select the file you wish to update from the dropdown. Selecting the file will automatically load the configuration file editor. You can resize the columns as needed by dragging on the divider on the right hand side of the panel. You can also drag the rows to rearrange them. Right clicking on a row will give you the options to create and delete rows, and download the currently saved configuration file

Once you are finished making your changes, save the file back to your website by clicking on `Save changes to site`. You will need to authenticate once with your administrative WildApricot account.

If you choose to download the file and edit it outside of the Inspector, the changes will be applied only when you manually upload the configuration file.

When you use the Inspector to save the configuration file, the current page will automatically refresh, and your changes should be immediately visible.  If you don't see your changes, you may need to do a hard refresh of your site to see the changes. To do this, exit the inspector/editor and press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd> on PC or <kbd>Option</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd> on Mac. You may need to do this for each language enabled on your site.

---

# EZ Wild Apricot Web Designer Functions

When editing the EZ Wild Apricot Web Designer configuration and translation files, the following functions are available: Ech function operates in a specific way to modify, hide or translate parts of your website.


## **text**
> Changes the text in targeted element(s), note that any links are eliminated in the targeted element(s). Note that the Default Text is empty (and ignored if filled) when using the text function.

**EXAMPLE:**
```text
Function: text
Replacement Text: Change my password!
Query: .loginBoxChangePassword
```
## **replace**
> Finds and replaces specific text in targeted element(s). Note that the Default Text must match the text that is being replaced.

**EXAMPLE:**
```text
Default Text: Home
Function: replace
Replacement Text: Home Page
Query: .menuInner, .WaGadgetBreadcrumbs > div > ul > li
```


## **delay**
> Changes the text in targeted element(s) after 1 second - used for dynamically generated elements, such as a member directory. Note that the Default Text must match the text that is being replaced.

**EXAMPLE:**
```text
Replacement Text: Coordonnées
Function: delay
Query: #membersTable > thead > tr > th:nth-child(1)
```

## **button**
> Changes the text on targeted button(s)

**EXAMPLE:**
```text
Default Text: Click here to login
Function: button
Query: .loginButton
```

## **inactive**
> Ignores the configuration row. This is useful when troubleshooting an item or you wish to save details in the configuration file, but not activate it.

## The style column can be used in conjunction with a function, or on it's own.
**EXAMPLE:**
```text
Query: h3
Style: color: blue;font-style: italic
```

## **hide**
> Hides the targeted element(s). This is useful when you wish to hide an element altogether. Neither Default Text or Replacement Text fields are necessary or used.

**EXAMPLE:**
```text
Function: hide
Query: #idFooterPoweredByWA
```

## **placeholder**
> Changes the placeholder text of targeted form element(s)

**EXAMPLE:**
```text
Replacement Text: Enter your search keywords here
Function: placeholder
Query: .searchBoxField
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
> Changes the target link of an existing link. Specifically it changes the  `href` URL of targeted element(s). Note that almost always the query must contain the `a` target after the CSS Element Class or CSS Element Path.

**EXAMPLES:**
```text
Replacement Text: /donate
Function: link
Query: .headerDonateBtn a
```

```text
Replacement Text: https://newpathconsulting.com/watm
Function: link
Query: #idFooterPoweredByWA a
```

## **source**
> Changes the `src` URL of targeted element(s). This is useful when changing the iframe src or img src URL to load an alternative image or iframe.

## **tooltip**
> Creates a text popup when mouse is hovered over element

**EXAMPLE:**
```text
Replacement Text: View/Edit Your Profile
Function: tooltip
Query: .loginBoxProfileLink
```

---
# Browser Requirements
EZ Wild Apricot Web Designer is supported on the latest versions of Chrome, Safari, Firefox and Edge. Older browsers like Internet Explorer on Windows are supported "best effort," without formal testing or 100% compatibility.
