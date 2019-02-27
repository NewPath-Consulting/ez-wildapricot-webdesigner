# watm
Wild Apricot Text Manager

This is a jQuery-based library to manage languages, modify hard coded labels and strings and add CSS-styling in Wild Apricot (www.wildapricot.com).

The management is done in a configuration file to make it easy to maintain a large amount of modifications and translations.


## Installation

### Script Setup
1.	In Admin View of Web Apricot, browse to Settings -> Site -> Global JavaScript. More details are available in [Wild Apricot Documentation](https://gethelp.wildapricot.com/en/articles/212-inserting-and-modifying-html-or-javascript#javascript).
2.	Copy and paste the following lines to the top of the script.
```html
<!-- jQuery-CSV Source: https://github.com/evanplaice/jquery-csv -->
<script src="/resources/Theme/WildApricotTextManager/jquery.csv-0.8.9.js"></script>
<script src="/resources/Theme/WildApricotTextManager/wildapricot-textmanager-0.5.js"></script>
<script>
  var textManagerProductionMode = false;
  var textManagerMultilingualMode = true;
  var primaryLanguageButtonName = "English";
  var alterativeLanguageButtonName = "Français";
  var languageButtonHtmlID = "languageButton";
  var alterativeLanguageClassName = ".french";
  var primaryLanguageClassName = ".english";
</script>
```
### Files Setup
1.	In Admin View of Wild Apricot, browse to Website -> Files. 
2.	Create a new folder named WildApricotTextManager under the Theme folder.
3.	Upload jquery.csv-0.8.9-mod.js to the new folder.
4.	Upload wildapricot-textmanager-0.7.js to the new folder.
5.	Upload wildapricot-textmanager-config.csv to the new folder. 
 
 
### Overlay Setup (Optional)
Normally, when the text manager is enabled, the original text is displayed on the page load and then replaced within one second. This swap can be hidden with the additions described below. The text manager script will automatically remove the overlay once the script has been completed. 

Open the default Page Template, add a Custom HTML gadget anywhere, and edit the HTML to include this:
```html
<div id="textmanager_overlay"></div>
```

Add these lines to Website -> CSS:
```
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
Move the Language Button (Optional)
1.	In Admin View, browse to Website -> Page templates -> Standard template.
2.	Click Edit, then Gadgets, then drag and drop Custom HTML gadget to where you would like to place the button.
3.	Click Edit code and delete the default “Insert your HTML code here”. 
4.	Click Settings button for the new gadget. On the left panel, show Advanced and then replace the HTML ID with languageButton then Save the template.
5.	(Optional) Customize the look of the button in Website -> CSS.

### Add the localized content
1.	We have to add content to each page. We’ll start with Contact page. In Admin Mode, browse to Website -> Site pages -> Contact and click Edit.
2.	Click on Gadgets and drag a new Content gadget below the existing Contact us heading. If your second language is French, then type in Contactez nous into this new space. Adjust font sizes and padding to match the original content.
 
3.	Show Advanced on the left panel and add french to the CSS class text box.
 
4.	Click on the original English Contact us heading and add english to the CSS class text box.
 
5.	Repeat for other content blocks you wish to localize and Save page. The result should look similar to below:
 
Important: If Text Manager is enabled, one of the two languages will be hidden, even in Edit mode. Please make sure textManagerProductionMode = false is set in Global JavaScript and then click the button to disable Text Manager to see both sets of languages at once.
 
## Wild Apricot Text Manager Configuration File
Opening the configuration file in Excel
  Choose Delimited. Check My data has headers.  Check Comma.
  Click Finish.
Saving the configuration file
When saving, please Save as CSV UTF-8 (Comma delimited) (*.csv).
 

### Columns
Note: Inserting or moving columns will break the functionality.

**Wild Apricot Reference**: Name of the Wild Apricot System Gadget. For administrative use only.

**Default Text**: The text displayed in the default Wild Apricot gadget or label. 

**English Replacement Text**: If text is placed in this column, a replacement is done. Blank rows are ignored. Optional.

**Alternative Language Text**: Optional.

**Notes**: Any other helpful notes can be added here for reference.

### Function: 
*	text – sets text of the element selected by the Query column.
*	hide – hides the element selected by the Query column.
*	button – sets value of the button selected by the Query column.
*	placeholder – sets placeholder attribute. Only used for search boxes.
*	delay – page will pause one second before replacing text. Used on elements that are written with JavaScript after page load.
*	replace – Searches for Default Text column and replaces this sub-string in any element. If Query column is blank, the entire page is searched. 
*	replace_element – Searches Default Text and replaces the text of the entire element. If Query column is blank, the entire page is searched.
*	replace_delay – Replaces sub-string after one second delay.
*	inactive – disables current configuration row. Can be used to save a setting, but not use it.
#### CSS-only functions:
*	mouseover – Sets CSS inside an event handler when hovering over an element.
*	mouseout – Sets CSS inside an event handler when no longer hovering over element.

**Query**: jQuery syntax for selecting an element. 

**Style**: Set the CSS style for the element. Optional.
 
## Example:
Change the text “Current status” inside the Membership Renewal system gadget:
 
1.	Open wildapricot-textmanager-config.csv 
2.	Search the file for “Current status”. Verify column A matches the name of the gadget we’re looking at.
3.	Type in new text in column C.
4.	(Optional) Type second language text in column D. 
5.	Save as CSV UTF-8 (Comma delimited) (*.csv)
6.	Upload/Update .csv file.
7.	Load the membership renewal page and use the toggle buttons to test.  

 
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
Replace text of any element of any page:
	Default Text: 501\(c\)6 non-profit organization
	English Replacement Text: My Organization Name
	Function: replace_element
	(Note: Use backslash to escape special characters such as commas, parentheses, brackets.)
```
### Set CSS of an element:
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
	Query: .functionalButton
	Style: { "color": “white", " background": "#a80532" }
