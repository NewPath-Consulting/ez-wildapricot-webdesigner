let searchParams = new URLSearchParams(window.location.search);
let watm_location = searchParams.get("watm_location");
let languagesJSON = searchParams.get("languages");
let languages = JSON.parse(languagesJSON);

let csvSelector = "";

document.addEventListener("DOMContentLoaded", function (event) {
  languages.forEach(function (language, index) {
    csvSelector += `<option value="${watm_location}/${
      index == 0 ? "config.csv" : "translations/" + language.filename
    }">${index == 0 ? "config.csv" : language.filename}</option>`;
  });

  let selectElement = document.getElementById("watm-csv-toggle");
  selectElement.innerHTML = csvSelector;

  selectElement.addEventListener("change", (event) => {
    loadCSV(event.target.value, watm_location);
  });

  loadCSV(`${watm_location}/config.csv`, watm_location);
});

const loadCSV = (csvFile, watm_location) => {
  document.getElementById(
    "watm-editor-iframe"
  ).src = `${watm_location}/watm-editor/editor.html?loadCSV=${csvFile}`;
};
