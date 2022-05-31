let searchParams = new URLSearchParams(window.location.search);
let csvFile = searchParams.get("loadCSV");

let watmFunctions = [
  "hide",
  "text",
  "replace",
  "replace_element",
  "placeholder",
  "button",
  "delay",
  "attribute",
  "inactive",
];

document.addEventListener("DOMContentLoaded", function (event) {
  let table = document.createElement("table");
  let tableHead = document.createElement("thead");
  let tableRow = document.createElement("tr");
  let tableHeader = `<th class="watmReference">Wild Apricot Reference</th>
  <th class="defaultText">Default Text</th>
  <th class="replacementText">Replacement Text</th>
  <th class="function">Function</th>
  <th class="query">Query</th>
  <th class="style">Style</th>
  <th class="notes">Notes</th>`;
  let tableBody = document.createElement("tbody");
  tableBody.id = "csv_data";

  table.id = "csvTable";
  table.classList.add("table", "table-striped-columns");

  tableHead.appendChild(tableRow);
  tableRow.innerHTML = tableHeader;
  table.appendChild(tableHead);
  table.appendChild(tableBody);
  document.getElementById("csvTableContainer").appendChild(table);

  Papa.parse(csvFile, {
    download: true,
    header: true,
    skipEmptyLines: "greedy",
    complete: function (results) {
      results.data.forEach((row) => {
        buildTableRows(row);
      });
    },
  });

  document.getElementById("saveCSV").addEventListener("click", () => {
    let csvJSON = generateCSV();
    let csv = Papa.unparse(csvJSON);

    let csvData = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    let filePath = csvFile.substring(0, csvFile.lastIndexOf("/"));
    let filename = csvFile.substring(csvFile.lastIndexOf("/") + 1);

    console.log(filePath, filename);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", filePath, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) console.log(xhr.responseText);
    };
    xhr.onload = function (e) {
      if (xhr.status == 200) {
        console.log("uploaded"); //(correctly uploaded)
        alert(
          "===================================\n" +
            "File has been successfully updated.\n" +
            "===================================\n\n" +
            "To view your changes, please refresh the page.\n\nYou may need to clear your browser cache if you do not see your changes right away."
        );
      } else
        console.log(
          "Error " + e.status + " occurred uploading your file.<br />"
        );
    };

    var formData = new FormData();
    formData.append("localfile", csvData, filename);
    formData.append("filetype", "csv");
    formData.append("source", "SOFT");
    xhr.send(formData);
  });

  document.getElementById("downloadCSV").addEventListener("click", () => {
    downloadCSV();
  });
});

const buildTableRows = (row) => {
  let watmReference = row["Wild Apricot Reference"].trim();
  let defaultText = row["Default Text"].trim();
  let watmFunction = row["Function"].trim();
  let watmQuery = row["Query"].trim();
  let replacementText = row["Replacement Text"].trim();
  let watmStyle = row["Style"].trim();
  let watmNotes = row["Notes"].trim();

  let tableRow = document.createElement("tr");
  let functionHTML = createFunctionDropdown(watmFunction);

  let rowContent = `<td contenteditable class="reference">${watmReference}</td>
  <td contenteditable class="defaultText">${defaultText}</td>
  <td contenteditable class="replacementText">${replacementText}</td>
  <td class="function">${functionHTML}</td>
  <td contenteditable class="query">${watmQuery}</td>
  <td contenteditable class="style">${watmStyle}</td>
  <td contenteditable class="notes">${watmNotes}</td>`;

  tableRow.innerHTML = rowContent;
  document.getElementById("csv_data").appendChild(tableRow);
};

const createFunctionDropdown = (watmFunction) => {
  let functionHTML = '<select class="form-select"><option></option>';
  watmFunctions.forEach((fnName) => {
    functionHTML += `<option value="${fnName}" ${
      fnName == watmFunction ? "selected" : ""
    }>${fnName}</option>`;
  });
  functionHTML += "</select>";

  return functionHTML;
};

const downloadCSV = () => {
  let filename = csvFile.substring(csvFile.lastIndexOf("/") + 1);

  let csvJSON = generateCSV();
  let csv = Papa.unparse(csvJSON);

  let csvData = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  let csvURL = null;
  if (navigator.msSaveBlob) {
    csvURL = navigator.msSaveBlob(csvData, "download.csv");
  } else {
    csvURL = window.URL.createObjectURL(csvData);
  }

  let tempLink = document.createElement("a");
  tempLink.href = csvURL;
  tempLink.setAttribute("download", filename);
  tempLink.click();
  tempLink.remove();
};

const generateCSV = () => {
  let jsonText = "";
  document.querySelectorAll("#csv_data tr").forEach((tableRow) => {
    let watmReference = tableRow.children[0].innerText.trim();
    let defaultText = tableRow.children[1].innerText.trim();
    let replacementText = tableRow.children[2].innerText.trim();
    let watmFunction = tableRow.children[3].querySelector("select").value;
    let watmQuery = tableRow.children[4].innerText.trim();
    let watmStyle = tableRow.children[5].innerText.trim();
    let watmNotes = tableRow.children[6].innerText.trim();

    jsonText += "{";
    jsonText += `"Wild Apricot Reference":"${watmReference}",`;
    jsonText += `"Default Text":"${defaultText}",`;
    jsonText += `"Replacement Text":"${replacementText}",`;
    jsonText += `"Function":"${watmFunction}",`;
    jsonText += `"Query":"${watmQuery}",`;
    jsonText += `"Style":"${watmStyle}",`;
    jsonText += `"Notes":"${watmNotes}"`;
    jsonText += "},";
  });

  jsonText = jsonText.slice(0, -1);
  return JSON.parse(`[${jsonText}]`);
};
