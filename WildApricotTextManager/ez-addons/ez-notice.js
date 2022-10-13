let ez_notice_addon_version = "1.0";
log(`EZ-Notice Addon Version ${ez_notice_addon_version} enabled.`);

let ez_notice = () => {
  document.querySelectorAll("body *").forEach(function (el) {
    let regex = /\[ez-notice( color="([^"]*)")?]([^*].*?)\[\/ez-notice]/gi;
    walkText(el, regex, "notice", function (node, match, offset) {
      let noticeEl = document.createElement("div");
      noticeEl.style.padding = "15px 20px";
      noticeEl.style.borderWidth = "1px";
      noticeEl.style.borderStyle = "solid";
      noticeEl.style.margin = "10px 5px";
      noticeEl.style.borderRadius = "10px";
      let matches = match.matchAll(regex);
      for (const notice_match of matches) {
        if (notice_match[3]) {
          let ez_notice_content = notice_match[3];
          let ez_notice_text_color = notice_match[2]
            ? ez_notice_get_color(notice_match[2])
            : "#856404";
          let ez_notice_border_color = lightenColor(ez_notice_text_color, 80);
          let ez_notice_background_color = lightenColor(
            ez_notice_text_color,
            200
          );

          noticeEl.innerText = ez_notice_content;
          noticeEl.style.borderColor = ez_notice_border_color;
          noticeEl.style.backgroundColor = ez_notice_background_color;
          noticeEl.style.color = ez_notice_text_color;
        }
      }
      return noticeEl;
    });
  });
};

function ez_notice_get_color(str) {
  var ctx = document.createElement("canvas").getContext("2d");
  ctx.fillStyle = str;
  return ctx.fillStyle;
}

function lightenColor(col, amt) {
  col = col.slice(1);
  var num = parseInt(col, 16);
  var r = (num >> 16) + amt;
  if (r > 255) r = 255;
  else if (r < 0) r = 0;
  var b = ((num >> 8) & 0x00ff) + amt;
  if (b > 255) b = 255;
  else if (b < 0) b = 0;
  var g = (num & 0x0000ff) + amt;
  if (g > 255) g = 255;
  else if (g < 0) g = 0;
  var colorCode = (g | (b << 8) | (r << 16)).toString(16);
  if (colorCode.length == 5) colorCode = colorCode + "0";
  return "#" + colorCode;
}
