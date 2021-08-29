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

    // Check for language slug
    if (window.location.href.indexOf("/" + alterativeLanguageSlug + "/") > -1) {
        toggleWidgetLanguage();
    }
});

// Modify iframe src URL
function toggleWidgetLanguage() {
    $(waWidgetClass).each(function () {
        widgetURL = $(this).attr('src');
        $(this).attr('src', widgetURL + "?secondLanguage");
    });
}