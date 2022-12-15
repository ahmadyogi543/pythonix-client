const codeEditor = ace.edit("code-editor");
const codeInput = document.getElementById("code-input");
const codeOutput = document.getElementById("code-output");
const btnRun = document.getElementById("btn-run");
const btnSave = document.getElementById("btn-save");
const btnClear = document.getElementById("btn-clear");
const selectedFile = document.getElementById("selected-file");

let isAlreadyRun = false;

/* setup ace editor */
codeEditor.setTheme("ace/theme/xcode");
codeEditor.getSession().setMode("ace/mode/python");
codeEditor.setOptions({
  fontFamily: "Roboto Mono",
  fontSize: "14px",
  enableBasicAutocompletion: true,
  enableLiveAutocompletion: false,
  useWorker: false,
  showPrintMargin: false,
  tabSize: 2,
});
codeEditor.setValue("# Your code goes here...\n\n", 1);

/* functions */
function setLoadingToOutput() {
  codeOutput.classList.toggle("center");
  codeOutput.innerHTML = `<div class="lds-dual-ring"></div>`;
}

function clearOutput() {
  if (!isAlreadyRun) {
    codeOutput.classList.remove("center");
    codeOutput.innerHTML = `
      <ul id="code-output-list">
        <li>
          <pre>The output goes here...</pre>
        </li>
      </ul>
    `;
  }
}

function changeBtnState(isLoading = false) {
  if (isLoading) {
    btnRun.innerHTML = `
      <box-icon name="loader-circle" color="#fff" class="rotate"></box-icon>
      LOADING...
    `;
    btnRun.style.backgroundColor = "#767676";
    btnRun.style.cursor = "progress";
  } else {
    btnRun.innerHTML = `
      <box-icon name="play-circle" color="#fff"></box-icon>
      RUN
    `;
    btnRun.style.backgroundColor = "#1b1b1b";
    btnRun.style.cursor = "pointer";
  }
}

async function executeCode(url = "", data = {}) {
  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

function saveFileAs() {
  if ((promptFilename = prompt("Save file as", ""))) {
    const textBlob = new Blob([codeEditor.getValue()], { type: "text/plain" });
    const downloadLink = document.createElement("a");
    downloadLink.download = promptFilename;
    downloadLink.href = window.URL.createObjectURL(textBlob);
    downloadLink.click();
    delete downloadLink;
    delete textBlob;
  }
}

/* add listeners */
btnRun.addEventListener("click", () => {
  if (!isAlreadyRun) {
    isAlreadyRun = true;

    setLoadingToOutput();
    changeBtnState(true);

    const data = {
      code: codeEditor.getValue(),
      input: codeInput.value,
      language: "py",
    };
    executeCode("https://go-exec.up.railway.app/api/v1/compiler/execute", data)
      .then((resp) => {
        codeOutput.classList.toggle("center");
        codeOutput.innerHTML = `
        <ul id="code-output-list">
          <li>
            <pre style="color: #1b1b1b;">${resp.output}</pre>
          </li>
        </ul>
      `;
        isAlreadyRun = false;
        changeBtnState();
      })
      .catch(() => {
        isAlreadyRun = false;
        alert("Something is wrong with the system...");
        clearOutput();
        changeBtnState();
        console.log("lol");
      });
  }
});

btnClear.addEventListener("click", () => {
  clearOutput();
});

btnSave.addEventListener("click", saveFileAs);

selectedFile.addEventListener("change", (ev) => {
  const file = ev.target.files[0];
  const reader = new FileReader();

  reader.addEventListener(
    "load",
    () => {
      codeEditor.setValue(reader.result, -1);
    },
    false
  );

  if (file) {
    reader.readAsText(file);
  }
});
