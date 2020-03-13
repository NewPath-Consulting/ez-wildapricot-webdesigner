# Documentation

![WATM Logo](docs/images/wild-apricot-text-manager-logo.png)

## Project Description
The [Wild Apricot Text Manager](https://www.newpathconsulting.com/watm) (aka WATM) is a JavaScript library that uses the [jQuery](https://www.jquery.org) library included with every [Wild Apricot](https://wildapricot.com) website. WATM will help any administrator manage and replace nearly every piece of text in Wild Apricot. You can make a variety of changes such as global search and replace of text, modifying form labels and buttons, changing properties on any Cascading Style Sheets (CSS) class or ID including hiding text, labels or buttons. You can also use WATM to change specific styles of your Wild Apricot theme. WATM uses a CSV-formatted configuration file to store all the changes in a well documented, easy to maintain way.

WATM can be also be used to enable 2 languages for Wild Apricot websites. WATM does *not* require you to create any additional site pages or page templates. Translations can be applied for any Wild Apricot module without the need to create multiple versions of a page, event, donation form etc. Several examples are included in an example WATM CSV configuration file which can be edited in Microsoft Excel or another text editor. 

[Using Copy Selector and Copy Styles to quickly find a CSS Selector](https://vimeo.com/368823350)

[Learning more about about Cascading Style Sheets (CSS)](https://developer.mozilla.org/en-US/docs/Web/CSS)

How to use Chrome Developer Tools

[![How to use Chrome Developer Tools to find CSS classes or IDs](https://i.vimeocdn.com/video/680677141_640.webp)](https://vimeo.com/253714058 "Watch Making CSS Edits - How to Invoke Developer Tools")

## Change History
0.1 - Initial Release 11/19/18

0.2 - Added support for many more system flags, added French translation into CSV configuration file, changed testing button toggle label 11/27/18

0.3 - Added support for adding a style, added several more system labels, added support for limiting the language toggle display "flicker" 12/5/18

0.4 - Added support for effective primary menu design changes, added support to override any CSS class or ID 12/13/18

0.5 - Added support for mouseover, mouseout (hover) and :before and :after pseudo-elements 1/15/19

0.6 - Added support for SCSS-style variables 1/24/19

0.7 - Now managed in GitHub, fixed issues related to Internet Explorer 11 support in the CSV parser and in the WATM library 2/23/19

0.71 - The Wild Apricot Text  Manger config file is not cached while in testing mode 2/6/20 

## Installation

### Script Setup
1.	In Admin View of Web Apricot, browse to Settings -> Site -> Global JavaScript. More details on inserting JavaScript into Wild Apricot are available in [Wild Apricot Documentation](https://gethelp.wildapricot.com/en/articles/212-inserting-and-modifying-html-or-javascript#javascript).
2.	Copy and paste the following lines to the Global JavaScript.
```javascript
<!-- jQuery-CSV Source: https://github.com/evanplaice/jquery-csv -->
<script src="/resources/Theme/WildApricotTextManager/jquery.csv-0.8.9-mod.js"></script>
<script src="/resources/Theme/WildApricotTextManager/wildapricot-textmanager.js"></script>
<script>
  var textManagerProductionMode = false;
  var textManagerMultilingualMode = true;
  var primaryLanguageButtonName = "English";
  var alterativeLanguageButtonName = "Français";
  var languageButtonHtmlID = "languageButton";
  var alterativeLanguageClassName = ".french";
  var primaryLanguageClassName = ".english";
  
  $(window).bind("load", function() {$('#textmanager_overlay').css('display', 'none'); });  // Fail-safe to remove white overlay
</script>
```


### Files Setup
If you are using the "automatic update" approach of loading WATM you can disregard steps 3-4. Just make sure you upload the WATM configuration file to your Wild Apricot site.

1.	In Admin view of Wild Apricot, browse to [Website -> Files](https://gethelp.wildapricot.com/en/articles/177#uploading). 
2.	Create a new folder named `WildApricotTextManager` under the Theme folder.
![File Manager in Wild Apricot](docs/images/files-make-new-folder.png)
3.	Upload [jquery.csv-0.8.9-mod.js](https://raw.githubusercontent.com/asirota/watm/master/WildApricotTextManager/jquery.csv-0.8.9-mod.js) to the new folder.
4.	Upload [wildapricot-textmanager.js](https://raw.githubusercontent.com/asirota/watm/master/WildApricotTextManager/wildapricot-textmanager.js) to the new folder.
5.	Upload [wildapricot-textmanager-config.csv](https://raw.githubusercontent.com/asirota/watm/master/WildApricotTextManager/wildapricot-textmanager-config-sample.csv) to the new folder. 


### Overlay Setup (Optional)
Normally, when the text manager is enabled, the original text is displayed on the page load and then replaced within one second. This "flicker" can be hidden with the HTML and CSS below. The WATM will automatically remove the overlay once the script has been completed, reducing the flicker.

Open the each Wild Apricot Page Template in use, add a [Custom HTML](https://gethelp.wildapricot.com/en/articles/408) gadget anywhere in the template. Edit the code of the Custom HTML gadget and include this HTML snippet:
```html
<div id="textmanager_overlay"></div>
```

You must also ddd these lines to the Wild Apricot global CSS in the [Website -> CSS](https://gethelp.wildapricot.com/en/articles/438#entering) menu:
```css
#textmanager_overlay {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: white;
    z-index: 2;
}
```

### Multilingual Setup (Optional)
To move the Language button from the default location:
1.	In Admin View, browse to each page template in use.
2.	Click Edit, then Gadgets, then drag and drop Custom HTML gadget to where you would like to place the button.
3.	Click Edit code and delete the default “Insert your HTML code here”. 
4.	Click Settings button for the new gadget. On the left panel, show Advanced and then replace the HTML ID with `languageButton` then Save the template.
5.  Repeat this for each page template.
5.	(Optional) Customize the look of the button by applying custom CSS class to the `#languageButton ID` in the WATM configuration file.

### Add the translated content
The below is an example of adding translated content to a Wild Apricot "Contact" page.

1.	Start with your Contact page. In Admin Mode, browse to Website -> Site pages -> Contact and click Edit. You may have a different page on your site, and you can start with any page.
2.	Click on Gadgets and drag a new Content gadget below the existing Contact us heading. If your second language is French, then type in `Contactez nous` into this new space. Adjust font sizes and padding to match the original content.
![Advanced Settings in CSS](docs/images/contact-us-heading.png)
3.	Show [Advanced settings section](https://gethelp.wildapricot.com/en/articles/187#settings) on the left settings panel and add `french` to the CSS class text box.
4.	Click on the original English Contact us heading and add `english` to the CSS class text box.

![Advanced Settings in CSS](docs/images/advanced-english-class.png)

5.	Repeat for other content blocks you wish to localize and Save page. The result should look similar to below:

![Advanced Settings in CSS for Contact Us Widgets](docs/images/contact-us-widgets.png)


Note that if WATM is enabled, one of the two languages will be hidden based on the state of the language, even in the Edit mode. Please make sure `textManagerProductionMode = false` is set in Global JavaScript and then click the button to disable WATM to see both sets of languages at once.

## Wild Apricot Text Manager Configuration File
To maintain all the WATM text changes, translations and styling changes, you must edit and maintain the CSV configuration file `wildapricot-textmanager-config.csv` using Excel or another commas seperated file (CSV) editor.

### Instructions for editing the file in Excel

 1. Open the `wildapricot-textmanager-config.csv` file Choose Delimited, check My data has headers and click Next
 
![Excel CSV Import Step 1](docs/images/excel-csv-import1.png)  

 2.   Check Comma for the Delimiters option, Click Finish
 
![Excel CSV Import Step 1](docs/images/excel-csv-import2.png)  

### Saving the configuration file
When saving the file, use the CSV UTF-8 (Comma delimited) (*.csv). **Other formats will break WATM!**

Note that the configuration file will be cached in the web browser between changes while in production mode.  If you don't see your configuration file changes reflected on the website, you will need to [force-refresh your browser](https://www.wikihow.com/Force-Refresh-in-Your-Internet-Browser) to reload the latest configuration file.

### Columns in the WATM Configuration File

####Note: Inserting or moving columns will break WATM!

`Wild Apricot Reference`: Name of the Wild Apricot System Gadget. For administrative use only, can be used to group configuration lines together

`Default Text`: The text to search for in a Wild Apricot gadget or label. 

`English Replacement Text`: If text is placed in this column, a replacement is done. Blank rows are ignored. Optional.

`Alternative Language Text`: Optional

`Notes`: Any other helpful notes can be added here for reference.

### Function: 
For the following functions the `Default Text` column is ignored:
*	`text` – sets text of the element selected by the `Query` column.
*	`hide` – hides the element selected by the `Query` column.
*	`button` – sets value of the button selected by the `Query` column.
*	`placeholder` – sets placeholder attribute. Only used for search boxes.
*	`delay` – page will pause one second before replacing text. Used on elements that are written with JavaScript after page load.

For the following functions the `Default Text` column is required:
*	`replace` – Searches for `Default Text` column and replaces this sub-string in any element. If `Query` column is blank, the entire page is searched. 
*	`replace_element` – Searches text in `Default Text` column and replaces the text of the entire element. If `Query` column is blank, the entire page is searched.
*	`replace_delay` – Replaces string after one second delay.

The following function can be used on any line in the configuration file:
*	`inactive` – disables current configuration row. This function can be used to save a configuration, but not activate it.

**Note:** You can leave Function column empty if you wish to apply CSS to any CSS class or ID set in the `Query` column.

#### CSS-only functions:
*	`mouseover` – Sets CSS inside an event handler when hovering over an element.
*	`mouseout` – Sets CSS inside an event handler when no longer hovering over element.

`Query`: The CSS selector to target for the change. A selector can include HTML elements, classes and IDs as well as a CSS path (eg `div.class > td > #myID`).
[Using Copy Selector and Copy Styles to quickly find a CSS Selector](https://vimeo.com/368823350)

`Style`: The CSS ruleset (properties & values) to apply to selector in the `Query` column. Optional.

The syntax in WATM surrounds each property and value with a double quote (") (eg "font-color":"red";)

![Anatomy of a CSS ruleset](https://mdn.mozillademos.org/files/9461/css-declaration-small.png "Anatomy of a CSS ruleset")

## Example:
### Change the label “Current status” on Membership Renewal system gadget:

Here is what the standard Membership Renewal system gadget looks like:

![Standard Membership Renewal Gadget](docs/images/membership-renewal-old-text.png)  

- [ ]	Open wildapricot-textmanager-config.csv in your text editor or Excel.

- [ ]	Search the file for “Current status”. Verify **Wild Apricot Reference** column matches the name of the gadget we’re looking at.

- [ ] Type in new text `My New Text!` in **English Replacement Text** column.

![Update English Replacement Text in CSV File](docs/images/updating-csv-text.png)  

- [ ] (Optional) Type translated language text in **Alternative Language Text**. 

- [ ] Save as `CSV UTF-8 (Comma delimited) (*.csv)`

![Save Updated CSV File in UTF8](docs/images/saving-as-csv-utf8.png)  

- [ ] Upload/Update .csv file

![Upload Updated CSV configuration into Wild Apricot File Manager](docs/images/updating-watm-csv.png)

- [ ] Load the membership renewal page and use the toggle buttons to test.  

Here is what the new Membership Renewal system gadget should look like:

![Updated Membership Renewal Gadget](docs/images/membership-renewal-new-text.png)  

## System Requirements

WATM must be used with a free or paid Wild Apricot account. WATM is supported on the latest versions of Chrome, Safari, Firefox and Edge. Older browsers like Internet Explorer on Windows are supported "best effort," without formal testing or 100% compatibility.

## Further Examples

### Hide an element:
```
Default Text: Type the 6 characters you see in the picture
Function: hide
Query: .captchaGuiding
```
### Replace title of page on all menus:	
```
Default Text: Directory
English Replacement Text: Members Directory
Function: replace
Query: title .WaGadgetMenuHorizontal .WaGadgetMenuVertical .WaGadgetSiteMap
 .WaGadgetNavigationLinks .WaGadgetBreadcrumbs
```
### Replace title of page on only main menu:	
```
Default Text: Directory
English Replacement Text: Members Directory
Function: replace
Query: .WaGadgetMenuHorizontal 
```
### Replace text of any element of any page:
```
Default Text: 501\(c\)6 non-profit organization
English Replacement Text: My Organization Name
Function: replace_element
(Note: Use backslash to escape special characters such as commas, parentheses, brackets.)
```
### Set CSS of the H2 CSS selector:
```
Query: h2
Style: { "color" : "red", "font-style" : " italic" }	
```
### Set CSS of :before or :after (Note the use of standard CSS formatting):
```  
Query: .WaGadgetCustomMenu.menuStyleNone .orientationVertical li:before
Style: { content: "|"; color: #5e5e5e }
```
### Set CSS :hover of a button (Note, :hover is not needed in Query):
```
Query: .functionalButton
Style: { "color": “white", " background": "#a80532" }
```
