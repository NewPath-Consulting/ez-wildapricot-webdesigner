// Wild Apricot Text Manager Library
//
// Licensed under LGPL 3.0
// Contact NewPath Consulting for support at https://www.newpathconsulting.com/watm

/* App */
$(document).ready(function () {
    // Set Defaults
    if (typeof alterativeLanguageSlug === "undefined") {
        alterativeLanguageSlug = "fr";
    }
    if (typeof primaryLanguageSlug === "undefined") {
        primaryLanguageSlug = "en";
    }
    if (typeof defaultLanguage === "undefined") {
        defaultLanguage = "en";
    }
    if (typeof waWidgetClass === "undefined") {
        waWidgetClass = ".waFrame";
    } else {
        waWidgetClass = waWidgetClass;
    }

    // Check for slug
    if (window.location.href.indexOf("/" + alterativeLanguageSlug + "/") > -1) {
        // Modify iframe src URL to use second language
        $(waWidgetClass).each(function () {
            widgetURL = $(this).attr('src');
            $(this).attr('src', widgetURL + "?secondLanguage");
        });
    } else {
        // Modify iframe src URL to use primary language
        $(waWidgetClass).each(function () {
            widgetURL = $(this).attr('src');
            $(this).attr('src', widgetURL + "?primaryLanguage");
        });
    }
});