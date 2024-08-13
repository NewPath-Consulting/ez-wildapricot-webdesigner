# [EZ WildApricot Web Designer 3](https://newpathconsulting.com/watm)

EZ WildApricot Web Designer v3 is a tool to simplify the customization of text on WildApricot websites. This plugin allows for customizing system labels that are otherwise uncustomizable as well as all providing a means for a multilingual website, with no limit on the number of translations available.

## Features

- **Multilingual Websites**: Easily create multilingual websites by adding translations to existing pages, and displaying only the selected language.
- **Dynamic Language Handling**: Automatically selects the website language based on user's browser settings.
- **Sleek User Interface**: An easy to use graphical interface for updating and managing texts. Preview edits without needing to refresh teh page.
- **Export and Import Capabilities**: Export modifications to CSV and import them back for easy mass edits

# Quick Start

## Installation

1. Follow these [instructions to connect to your WildApricot file folder](https://gethelp.wildapricot.com/en/articles/198-uploading-and-downloading-files-using-webdav) or go to the Website -> Files manager.
2. Unzip the downloaded zip file and upload the contents of folder `WildApricotTextManager` into /Theme/WildApricotTextManager. Depending on your browser, you may be able to drag the folder into the File Manager - if not you will need to make the necessary subfolders manually in the Files manager
3. If you are setting up a multilingual site, add a Content Gadget to your page template in the location you would like the language toggle to appear. Set the ID of this gadget to `language_switch`

## Javascript whitelisting

WildApricot has implemented a [Content Security Policy (CSP)](https://en.wikipedia.org/wiki/Content_Security_Policy) to provide additional protection against data theft, site defacement, malware, and more. CSP works by detecting if custom code is being called from an external URL and then comparing those URLs against a whitelist of verified and approved websites. If the external URL being used is not on the whitelist, the code is then blocked from running. EZ WildApricot Web Designer requires access to certain external URLs in order to function correctly, so these URLs will need to be added to the whitelist. To view and manage your whitelist, navigate to the "Settings" screen from the Website section of the WildApricot backend.

![domain whitelist menu](https://github.com/NewPath-Consulting/ez-wildapricot-webdesigner/blob/master/readme-images/domain-whitelist-menu.jpg?raw=true)

**Adding EZ WildApricot Web Designer URLs to the JavaScript whitelist**

Under the Wild Apricot Website settings section "JavaScript whitelist", you must add manually URLs used by EZ WildApricot Webs Designer. This is what the custom domain whitelist will look like once you add all core and add-on required domains.

![domain whitelist custom domains](https://github.com/NewPath-Consulting/ez-wildapricot-webdesigner/blob/master/readme-images/domain-whitelist-custom-domains.jpg?raw=true)

The following is a list of all the external URLs currently being implemented by EZ WildApricot Web Designer and can be added manually:

**Core Plugin**

- hook.us1.make.com

## Adding the install script

1. In WildApricot Admin, navigate to Settings -&gt; Site -&gt; Global JavaScript. More details on inserting JavaScript into WildApricot are available in the [WildApricot Documentation](https://gethelp.wildapricot.com/en/articles/212-inserting-and-modifying-html-or-javascript#javascript).
2. Copy and paste the following lines to the Global JavaScript.

NOTE: this code snippet assumes you have uploaded all files into the folder `/resources/Theme/WildApricotTextManager`

```html
<script src="/resources/Theme/WildApricotTextManager/wildapricot-textmanager.js"></script>
<script>
  license_key = "XXXXX-XXXX-XXXX-XXXXX"; // Enter your license key here.
</script>
```

3.  Replace `XXXXX-XXXX-XXXX-XXXXX` with your license key. You can obtain a license key here: https://newpathconsulting.com/watm

### Multilingual Script Setup

If you want to configure multi-lingual support, include the following as well:

```html
<script>
  ez_languages.push(
    ["English", "english"],
    ["Français", "french"],
    ["Español", "spanish"],
    ["日本語", "japanese"]
  );
</script>
```

Update the languages with the languages you want for your site, in the order you want them to appear in the language toggle. You default language should go first.

Within `ez_languages.push();` in one language per line, followed by a comma. In the square braces, you will have the label for the language, followed by the custom class name.

### Recommended Language Class Names

This is the list of recommended class names for each language. If you use these class names in the watm_language_className assignments in the script above, the browser's default language will automatically switch the website into the language selected by the user.

```
arabic
bengali
bulgarian
chinese
croatian
czech
danish
dutch
english
estonian
filipino
finnish
french
german
hebrew
hindi
hungarian
indonesian
italian
japanese
korean
latvian
lithuanian
macedonian
malay
norwegian
persian
polish
portuguese
romanian
russian
serbian
slovak
slovenian
spanish
swedish
thai
turkish
ukrainian
vietnamese
```

# Switching and Maintaining Languages

## Using the Language Toggle

EZ WildApricot Web Designer provides an easy to install toggle for switching between the various languages on your site. To add it to your site, simply add a Content Gadget to your page template in the location you would like the toggle to appear. Set the ID of this gadget to `language_switch`. This gadget will now be replaced with the language toggle when viewed from the frontend.

## Adding translations to content gadgets

There are 2 categories of text that can be translated in WildApricot:

- text and images placed on pages or page templates using WildApricot's Content Gadget
- hard coded text that appears in other WildApricot dynamic gadgets such as the name of pages in a menu bar, membership applications and membership directories.

EZ WildApricot Web Designer can translate both types of content.

To translate a content gadget you simple must add the language class name (eg "english" or "french") to the class settings of the gadget. The assigned class(es) are found in the "Advanced" settings on every content gadget added to a page or page template.

![setting class name for for content gadgets](https://github.com/NewPath-Consulting/ez-wildapricot-webdesigner/blob/master/readme-images/advanced-setting-content-gadget.png?raw=true)

Translating the hard coded text in WildApricot dynamic gadgets requires identifying the CSS ID or CSS Path and targeting each element with an appropriate translation. There are hundreds of pieces of hard coded text throughout a WildApricot site. Thankfully NewPath has identified the hard coded elements and offers a translation file for hard coded elements in multiple languages with [WildApricot Translation Support Service & Training](https://newpathconsulting.com/wild-apricot-translation-support/).

## Using the Language Switch Hook

You are not limited to using the EZ WildApricot Web Designer Language Toggle. You can create your own buttons, links, or menu items for switching the language. To switch language, you would link to `?language=<language>` where `<language>` is the class name for the language you wish to use from the script setup. Note, there is no slash in this link - you are linking to the current page, and appending the language hook to it.

**EXAMPLE:**

```html
<a href="?language=french">Cette page est également disponible en français</a>
```

---

# EZ WildApricot Inspector

Using the Inspector, you can use to view the targeting information of the various elements on your website, as well as make modifications to your EZ WildApricot Web Designer configuration files. This information is necessary when updating your configuration and translation files.

To launch the EZ WildApricot inspector click on the icon shown at the botto left of the screen. While in Inspector mode, most links are disabled, the Inpector Icon and the language toggle are hidden, and all languages on the page ar displayd.

When you hover over an element an outline will appear around the element ready for inspection. Click on the element to view existing modifications or add new ones.

When the inspector is launched, you will see two main panels: The Action Bar across the top, and the Properties Panel to the right.

Click the `Exit Editor` button in the Action Bar inspector to return to normal browsing. The Inspector will warn you if you have unsaved changes.

# The Action Bar

The Action bar is where you fill find the following functionality:

- The version number of EZ WildAPricot Designer that you have installed
- The Export Button
- The Impot Button
- The Undo Button
- The Colour Pallette
- The Save Button
- The Exit Button

## Export CSV Button

### Export Current Page

### Export Missing Mods

### ExportALl Site Mods

## Export CSV Button

### Export Current Page

### Export Missing Mods

### ExportALl Site Mods

## Import CSV Button

### Update/Append Modifications

### Replace All Modifications

## Undo Last Save

## Colour Pallete

## Save

## Exit Editor

# The Properties Panel

# Browser Requirements

EZ WildApricot Web Designer is supported on the latest versions of Chrome, Safari, Firefox and Edge. Older browsers like Internet Explorer on Windows are supported "best effort," without formal testing or 100% compatibility.

---

# External Libraries

https://jscolor.com/
https://lokeshdhakar.com/projects/color-thief
