const codeEditor = ace.edit("code-editor");
const codeInput = document.getElementById("code-input");
const codeOutput = document.getElementById("code-output");
const btnRun = document.getElementById("btn-run");
const btnClear = document.getElementById("btn-clear");

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
codeEditor.setValue("# Your code goes here...\n\n");

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
    btnRun.innerHTML = "LOADING...";
    btnRun.style.backgroundColor = "#767676";
    btnRun.style.cursor = "progress";
  } else {
    btnRun.innerHTML = "RUN";
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

/* add listeners */
btnRun.addEventListener("click", () => {
  if (!isAlreadyRun) {
    isAlreadyRun = true;

    setLoadingToOutput();
    changeBtnState(true);

    const data = {
      id: 1,
      code: codeEditor.getValue(),
      input: codeInput.value,
    };
    executeCode("https://pythonix-compiler.herokuapp.com/execute", data)
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