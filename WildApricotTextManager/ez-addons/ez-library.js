let ez_library_addon_version = "1.0";
log(`EZ-Library Addon Version ${ez_library_addon_version} enabled.`);

let ez_library = () => {
  document.querySelectorAll("body *").forEach(function (el) {
    let regex =
      /\[ez-library( folder="([^"]*)")?( sort="([^"]*)")?( view="([^"]*)")?]([\s\S]*)\[\/ez-library]/gi;
    let documentRegex =
      /\[document( date="([^"]*)")? filename="([^"]*)"]([^*].*?)\[\/document]/gi;

    walkText(el, regex, "library", function (node, match, offset) {
      var documents = [];
      let libraryContainer = document.getElementById("ezLibraryContainer");
      if (libraryContainer == null) {
        libraryContainer = document.createElement("div");
        libraryContainer.id = "ezLibraryContainer";
      }

      let matches = match.matchAll(regex);
      for (const library_match of matches) {
        if (library_match[7]) {
          var documentFolder = library_match[2];
          var documentSort = library_match[4];
          var documentView = library_match[6];
          var documentCollection = library_match[7];

          let document_matches = documentCollection.matchAll(documentRegex);
          for (const document_match of document_matches) {
            if (document_match[4]) {
              let documentName = document_match[4];
              let documentDate = document_match[2];
              let documentFilename = document_match[3];

              let docObj = {
                name: documentName,
                date: Date.parse(documentDate),
                filename: documentFilename,
                type: documentFilename.split(".").pop(),
              };

              documents.push(docObj);
            }
          }
        }
      }

      if (documentSort == "name")
        documents.sort((a, b) =>
          a.name > b.name ? 1 : b.name > a.name ? -1 : 0
        );
      if (documentSort == "date") documents.sort((a, b) => b.date - a.date);

      if (documentView.toLowerCase() == "list") {
        var libraryTable = document.getElementById("libraryTable");
        let libraryTableHeader = document.getElementById("libraryTableHeader");
        if (libraryTable == null) {
          libraryTable = document.createElement("table");
          libraryTable.id = "libraryTable";
        }
        if (libraryTableHeader == null) {
          libraryTableHeader = document.createElement("thead");
          libraryTableHeader.id = "libraryTableHeader";
          libraryTable.appendChild(libraryTableHeader);

          var temptr = document.createElement("tr");
          var tempth = document.createElement("th");
          temptr.appendChild(tempth);
          tempth = document.createElement("th");
          tempth.innerText = "Document";
          temptr.appendChild(tempth);
          tempth = document.createElement("th");
          tempth.innerText = "Date";
          temptr.appendChild(tempth);

          libraryTableHeader.appendChild(temptr);
        }

        let libraryBody = document.getElementById("libraryTableBody");
        if (libraryBody == null) {
          libraryBody = document.createElement("tbody");
          libraryBody.id = "libraryTableBody";
          libraryTable.appendChild(libraryBody);
        }

        for (let doc of documents) {
          var temptr = document.createElement("tr");
          var temptd = document.createElement("td");
          temptd.appendChild(getLibraryIcon(doc.type));
          temptr.appendChild(temptd);
          temptd = document.createElement("td");
          tempLibLink = document.createElement("a");
          tempLibLink.innerText = doc.name;
          tempLibLink.href = `/resources/${documentFolder}/${doc.filename}`;
          tempLibLink.setAttribute("target", "_blank");
          tempLibLink.setAttribute("download", "download");
          temptd.appendChild(tempLibLink);
          temptr.appendChild(temptd);
          temptd = document.createElement("td");
          temptd.innerText = new Date(doc.date).toLocaleDateString("en-US");
          temptr.appendChild(temptd);

          libraryBody.appendChild(temptr);
        }
      }

      libraryContainer.appendChild(libraryTable);

      return libraryContainer;
    });
  });
};

const getLibraryIcon = (fileType) => {
  let iconImage = document.createElement("img");
  iconImage.setAttribute("alt", fileType.toUpperCase() + " file");
  iconImage.setAttribute("title", fileType.toUpperCase() + " file");
  switch (fileType) {
    case "zip":
    case "rar":
      iconImage.src = libraryIcons.archive;
      break;
    case "wav":
    case "mp3":
      iconImage.src = libraryIcons.audio;
      break;
    case "doc":
    case "docx":
      iconImage.src = libraryIcons.document;
      break;
    case "jpg":
    case "jpeg":
    case "png":
    case "bmp":
    case "gif":
      iconImage.src = libraryIcons.image;
      break;
    case "pdf":
      iconImage.src = libraryIcons.pdf;
      break;
    case "ppt":
    case "pptx":
      iconImage.src = libraryIcons.ppt;
      break;
    case "mov":
    case "mpg":
    case "mpeg":
    case "avi":
    case "mp4":
    case "wmv":
      iconImage.src = libraryIcons.video;
      break;
    case "csv":
    case "xls":
    case "xlsx":
    case "numbers":
      iconImage.src = libraryIcons.spreadsheet;
      break;
    default:
      iconImage.src = libraryIcons.file;
      break;
  }

  return iconImage;
};

const libraryIcons = {
  archive:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABmJLR0QA/wD/AP+gvaeTAAAByUlEQVRYhe2YsWsTYRiHn6uiaa69aC+kDS0kabtYTMRBUuwWiOnk4ujs7p/i7uDkKIKgpGYqUmilUE1CotY0pQjpINcmdwYUcp+LdIk9Ku9pKnzP+B758fDAcRDQyDBOe/D68ar6lyJ3HpR/63Ix6EfFe/fPNL6x9oK+5wKwcC3H/FL2j+Qqz56e+ixQ8KyslO4CsP+xwW59h1azSnRi8uQuIRRBacEgdEEpuqAUXVCKLihFF5SiC0rRBaWMhTGysHSDS5EoAK1mlfWXzzn8chDGtLygP/D58G6bm8WHxOJpALpf99mpPCKRnGPsgqyBuKDbc4iYV0/kAGLxNJfNK3i9I+m8XLDnOFjx1NDdslP0jhzpfAiCxw6TU5mhu2VnzofgN9fDslMopejsbdHZ2wIUlp3Ccz2xoPgl6btdzNg0h+231N88+XU1iM9ep+92pfPygsr3GQy+D939wQ+U8qXz8oJTiSSdz5uksyXAwDBgJnOLdq2MPTM7esHFbI7t9QoAycVlUNCulTloVMgXSqMXNCcs8oUin6rvaVdfAWAn58gXSkTGo6MXBIiMm+Tyt8OYGiKUb/HfRAtK0YJSAt/ioH8+Nf8LPwG5Fu7IbU7BrwAAAABJRU5ErkJggg==",
  audio:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABmJLR0QA/wD/AP+gvaeTAAAB3klEQVRYhe2XwUobURRAzxuTmaRGjCilhSFCjMQSEqkoNiQg/QGxfoILEdqlLvoFLruzSBf9AxfuuivU6KKoIBFpTexCXZQuioKLpEbdlC6UhJm5b8a2zNle7p3z5t17mYEQGapdYHFl41rXQ6KRru3l+eK4l9yOgtOzJe9Wv1lfqzDQG78+u2h+Xp4vTrrNN8QGDnj1Iq+SCXPi9erWttvcQAS741FezuRVssd86lYyEEHwLhmYIHiTDFQQ3EsGLgjuJO9FEJxLRoKQWXpb6RRWwFi7oO+CTpb9+lr7A9zbFTslFJSivQffrHzAikZIJGIMpR8yNjpIPGZ6rqf9DbYuW+QLBR49TnF8esG79x9F9XyZ4p2dXRLdD0j29dH8dSmq5Yvgwtxzvv84p3pwimG0/eR0hC+ClhUlZfeTsvspPRsW1fJ9int74qL8/3vNtK6u+LT5lf2DE5RS5EZsXV5/EAluVA75dvyTQn4UgHq9hmHovRRRtf0vJ2TSGUzLxLRM0kMZULKpvY32HoxZeheDSDCXtanXazQaTRqNJkdHNXJP9Pah6Ljl0jCoQ6rVPQByIzblomzv3UYk2GUYTJWzTJWzunzu8NfvwVBQSigoJRSU0nEPdvqhDvlXuAESS3O9cgcFlwAAAABJRU5ErkJggg==",
  document:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABmJLR0QA/wD/AP+gvaeTAAAA5klEQVRYhe2UsQ6CMBCG/6okBiLvotHH4AEYjYtuDg64sDg4YGLYa3T2TRx4JXFwcaFwvVoY7luvtF/57woIPFRTISt07eqQIBhXp/166Wo/AF9BF2SFrgv9fOfl42XjMXJ6qwZ2aaLiKFzl13tF/daLYBROsU0TFc+iOVXSiyBgL+lNELCT9CoI0CW9CwI0yV4Ege6SEx8yx8vNVFYAFk3FvwueD5vWNaYL9BZxV0SQC7kHWxq+lS49+QtZkHoAF4mY+8clYi4yxVwkYpnivpEp5jL4iEWQiwhyEUEuxneQ+ygLQ+ADy0eLtemTZcYAAAAASUVORK5CYII=",
  file: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABmJLR0QA/wD/AP+gvaeTAAAA00lEQVRYhe3YMQ6CMBiG4a8qiYHIXTR6DA7AaFx0c3DAhcXBARPjjtHZmzhwJXFwptD+tWjyvetP4Wk6FYDJUk2DrChrVx8JgmF12C7nrt4H4AN0UVaUdVE+Xvnl/rRxDJzuqqFNmqg4Chf5+VaZrvUCjMIx1mmi4kk0NUV6AQL2SG9AwA7pFQiYI70DATNkL0CgO3LkA7M/XXVjBWDWNPw68LhbtT6j20BvR9w1AqURKI1AaQRKI1AagdIIlEagNAKlESiNQGk/D9Re3Fv+CLC/6A3KGXXLCSNUiQAAAABJRU5ErkJggg==",
  image:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABmJLR0QA/wD/AP+gvaeTAAABwElEQVRYhe3YzysEYRzH8fdYa3/FQStFCimnTUTK0VHtH+AoF24ODuvi4uCwSu4rzo7kIAdyozZam7BJcRO7XOz4scZh8zOzPM+z86DmU9vszDPfeV7zPDPP1oIbtRh2DbF4wipXJ16vJzk1NtRdrusBRWA5EosnrHhi6WlybnFbxlFR1ruyyehg1KgJBXsmZxeSorVagKGgn5HBqFFTHeoURWoBgjxSGxDkkFqBII7UDgQx5K8A4efISh2YiZn5Us0G0GXX6Dhwenz423NK3cCvTfFP8+eBjk/xxS2kLwEDImGoC4jVOz6C6SswC2A+wv6leP2fn2LHgZEw+CuLn0hYvN7xZ7AuAP1N8vXKI5jJwVFW9Sr2URrBTA4y12/77bVv33fPHqgwoKPJq9KFPPAz7uSmuG2vhZ3Te5b38mCB+RCgt7VKL/Az7j3yPFtgI5V/Pbayl6fwZNHX5pMCCj+DdriX3Hs8NDf4X/ctYDVlsnl4J+OTAJbAvaSx3vcBCbB+YLKWNkW7c24d/Aq5dSw+io4u1F8hReP4L4kqUvgtHmiR6KXFB2h6i3XHBarGBarGBaqm5Dr4zT8Cbv5FngFVTsI04FIf1wAAAABJRU5ErkJggg==",
  pdf: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABmJLR0QA/wD/AP+gvaeTAAACcUlEQVRYhe2XvUtbURiHn5vEK9HEqFwjDmJrG9ELDi0tqbglMWAcDYizmygimAz+A4IOGZ3ErOIfkMVBBBMrpHbxA0wlrcWCkEhjTFsr3g5FW2hjc5OT2NI863vu7zzvOed+QZXSkPIVYm63JmoSgyzHnZHIM1F5wHdBEcTcbu31yMj19tDQy6KaE9pVHtRgUJKt1ufbg4NxvddWRLDGYkENBCTZZnuiV7IiglC8ZMUEoTjJigqCfsmKC4I+yXsRhMIlTZWQ2Rofv6ssAU/zFcsu+GJt7Y9jtjyevLV72+JCESb4ZmGBV6OjfEomRUUCggSvMhnOolEUl4v05qaIyFvEbbGmIRnEnxghiaaGBgxmM2exGOaODhGRtwhr2aqq5JJJrKoqKhIQKNjU34+sKNQ0N4uKBAQKXhwecplK/Z13MZpGan0du8/Hu6UlIZE3CBFMR6PIisLDyUlyySSZnR0RsYAgwQ+rq7T5/UgmE51TUyTm5/maTouILv1dfL67y2UqRVNfH9n9fb6cnmI0m9mdnqa2tRUAY10d9Q4HysAAtXa7rvySVvAqk+Ht4iLXuRxxv5+jUIjzvT0UjwdLTw/ZgwManU4Ul4urbJb9YFD3HEWt4OeTE96Hw6Q2NjC3t9M5M4O1txeTxfJjkKZxGolwHA4jKwqS0UiNzVZ+wY/xOIm5ORqdTgyyzKNAgPqurl8HShJ2n48Wr5eLRAI0jXqHo/yCR6EQ7WNjnKys8GBi4vdyP3uaTFi6u3WL3aD7DFpVlePlZdqGh2nxeoueuFB0r+Dj2dlyeOTl//miLhdVwVKpCpbKnY+Zu36oq/wrfAOfKvl9KztG+gAAAABJRU5ErkJggg==",
  ppt: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABmJLR0QA/wD/AP+gvaeTAAAB6UlEQVRYhe2XS0sbURiGn4wzsS7EG0oLbrvQhWCxsRvBS7X0D3RTumvBv+D/EPSXVKSg0IomRjFeGhTTJkJKUtvGiRq8FeLiUzS1CXPm6MSWeeAww/vxzXk4Zy4M+OgRKFdYeDtUvK1JDDO43Ds51eOmt6Lgs8EX7q0uCM9MU9f6qHhq56Khife9qv2GtoEDOsfGA8HG5qeLoy+XVXs9EbTqG0SyqaVbVdITQXAv6ZkguJP0VBDUJT0XBDXJqgiCc0nTC5nwu+eVygHgSbninQs6edmHZ6bL1qq2xU7xBXX5jwVrrDL57T536lfrCEFXHxgGnBxBPAKbUck6QxAw4LgA6/Ng78Lw69L+RAyiHxxPp76CpiVya58g/wu6+6GpDUxT5FZmoXAAPUOymvEI7OekdzMKmZTSdO63OJOCrSU5b2y7yr99ge0VkbVqYfUj5H9IbW0O0tseCQI0P5RjwS7NWy7yw7zW5UHnSzLwCoK1smK7aWh/LPnIG8lTcbkHqyaY3IBMUsZ1EjH4vgPZHU01wb1gKg657M386zoc7GkolXLvX9TqK3hoy/adnZTm+3uS/z672WP/BOsBFNV/tdUFk59l/EkiJuNvbMwrT3PJvd9iX1AXX1AXX1AXX1CXil+SSj/UPv8K5zBWltUpDpCbAAAAAElFTkSuQmCC",
  video:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABmJLR0QA/wD/AP+gvaeTAAABrklEQVRYhe3YvUsCYRwH8O/jeZ7vi7VFr0QELUoRQSD9Af4BjhFEbQ0Ntrg0NBhEa1hJo0F/QEOQ4BBhQyBRQyARBOWkpt6p11BL4Kl3z/OcGfddn7vffZ577n73AlihC9EaiCWSKquDiKKQ291anWdVD8A3kEViiaSaSKZb8cPUjRGHjemsNLIZjRC/x70QPzjN6d3XFKDH7cRGNEL8Pk9QL9IUIGAcaRoQMIY0FQjoR5oOBPQh+wIEekfazcDs7B93GiYAQlqD3IF722tdt+k0gb4tca/5/0Clyeydom2ogUfXJdwV6lA5OamBVVnF1UMNqWwJz+8NFqZfYXYNFsstXOQqOL+t4KPcZFWW/U1SKDZwli3jMl/Fp0y/7lz6YEsF7l9kPL4pWJyQEBqXYDd4Kri2mbqiIvNUw0mmhPyrbKjGn++DXB91kkiol5gL0EaAuREHlqedcDs0Pxx7CnPgWMCOlVknhrwCk3rMgAGvDeEZFyaH2c6ZuprLQbA0JSE4KoHQrWbbUAPXwz6IAgfZT6jbDE8cMAB90ALSxgLSxgLSpmOj7vJHwMpA5AuX6rb+QNbetwAAAABJRU5ErkJggg==",
  spreadsheet:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABmJLR0QA/wD/AP+gvaeTAAACDElEQVRYhe3YTUgUYRzH8e+s5ia9gCcxWHwBpULIxDW6By3dck0kyLA1CEfsEiuuK7VqiQdBbVf2sLpG4sW1k0aiYNcOVpvo1qmmU9BFAo+6HnpBoVl3n+dxLJjf9T/P//nMPDzzBnbkopkVWmL+tKpJ8vPyVidbB+tU9QN+AlWkJeZP6zOhHd9U4I2Iw6H0rEzicddrxwuc7jvxwGquYy0BOo8V4HHXa4VO58VckZYAQRxpGRDEkJYCIXek5UDIDXkkQMgemW8FZnp5MVNZA2rNiocOfOYbOvCY2xNdprUjW+JsYwNlYwMBkkaKtmi30NhDB659/cTAXIQOzy2h8VLAtmg3r9fNX/OSRorQ7BhBr05N2XmhOaSAgevtTK7MMrIQZ3tne1/t95ULenUulJ4TnkMKWFHsIuIL8W3zO/7pITa3fvzB9SWe0tPQLnzllAABThWe4MnNB5w9U0FnvI/5tyvSy7o3Sh51Ds3B3SvNVJaUE12aobexQ2pZ9/VW0uVXik6eVtkOUAhMGin6E2EaLl2lPxEmaaSU9FUC3Ltjmy5f41HTfQbmIrz/siHdWxr4tx1b7ari4Y1OHr8Yl0ZKATPdiKtdVQS9OuFXz6WApjnoz8IH42O6cVhPv/u8ruTvg5lD+DYz+nJK+imRTYSBsXuDKh2msd8HZWMDZfPPAzPu4kwf1Hb+l+wC8eZJegOQHqMAAAAASUVORK5CYII=",
};

const ezlibrarystyles = `
#libraryTable tr th {
  width: auto;
}
#libraryTable tr th:nth-child(2) {
  text-align: left;
}
#libraryTable tr td:nth-child(1),
#libraryTable tr td:nth-child(3) {
  width: 1%;
  text-align: center;
}
#libraryTable tr:nth-child(even) {
  background-color: whitesmoke;
}
#libraryTable tbody tr {
  border: solid 1px #d8d8d8;
  border-left: 0;
  border-right: 0;
}
#libraryTable th, #libraryTable td {
  padding: 10px 15px;
}
#libraryTable tbody tr:hover {
  background-color: #8f8f8f;
}
#libraryTable tbody tr:hover td,
#libraryTable tbody tr:hover a {
  color: #fff!important;
}
#libraryTable {
  border-collapse: collapse;
}
#libraryTable thead tr {
  background-color: #2f2f2f;
}
#libraryTable thead tr th {
  color: #ccc;
}
#libraryTable a {
  text-decoration: none;
  color: #2f2f2f;
}
`;

let ezlibrarystyleSheet = document.createElement("style");
ezlibrarystyleSheet.innerText = ezlibrarystyles;
document.head.appendChild(ezlibrarystyleSheet);
