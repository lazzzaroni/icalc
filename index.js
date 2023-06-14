const data = document.querySelector(".data");
const error = document.querySelector(".error");
const buttons = document.querySelector(".buttons");
const operations = document.getElementsByClassName("operation");

const INIT = " 0";
const NUM_AFTER_DOT = 8;

data.innerText = INIT;

let buffer = INIT;
let runningTotal = 0;
let previousOperator = null;
let isEqualPressed = false;

function buttonClick(value) {
  if (isNaN(parseInt(value)) && value != ".") {
    handleSymbol(value);
  } else {
    handleNumber(value);
  }
  rerender();
}

function handleNumber(input) {
  if (isEqualPressed) {
    isEqualPressed = false;
    buffer = INIT;
  }

  if (input == "." && buffer.includes(input)) return;
  if ((input == "00" && buffer == INIT) || (input == "00" && buffer == "-0"))
    return;

  if (buffer == INIT) {
    if (input == ".") {
      buffer = INIT + ".";
      return;
    }
    buffer = " " + input;
  } else if (input == "." && buffer == "-0") {
    buffer += input;
  } else if (buffer == "-0") {
    buffer = "-" + input;
  } else {
    if (buffer.includes(".")) {
      if (buffer.length - buffer.indexOf(".") > NUM_AFTER_DOT) {
        handleError("No more than 8 characters after dot");
        return;
      }
    }

    buffer += input;
  }
}

function clearActiveOperation() {
  for (operation of operations) {
    if (operation.classList.contains("active"))
      operation.classList.remove("active");
  }
}

function activeOperation(symbol) {
  clearActiveOperation();

  for (operation of operations) {
    if (operation.textContent == symbol) {
      operation.classList.add("active");
    }
  }
}

function handleSymbol(symbol) {
  switch (symbol) {
    case "c":
      clearActiveOperation();
      handleClear();
      break;
    case "±":
      handlePlusMinus();
      break;
    case "←":
      handleBackspace();
      break;
    case "÷":
    case "×":
    case "−":
    case "+":
      activeOperation(symbol);
      handleMath(symbol);
      break;
    case "＝":
      clearActiveOperation();
      handleEqual();
      break;
    default:
      break;
  }
}

function handleClear() {
  buffer = INIT;
  runningTotal = 0;
}

function handlePlusMinus() {
  let newBuffer = [...buffer];

  if (newBuffer.at(-1) == ".") {
    handleError("Fill number after dot");
    return;
  }

  if (newBuffer[0] != "-") {
    newBuffer[0] = "-";
  } else {
    newBuffer[0] = " ";
  }

  buffer = newBuffer.join("");
}

function handleBackspace() {
  if (buffer.length == INIT.length) {
    buffer = INIT;
  } else {
    buffer = buffer.substring(0, buffer.length - 1);
  }
}

function handleMath(value) {
  if (buffer == INIT) {
    previousOperator = value;
    return;
  }

  if (buffer.at(-1) == ".") {
    handleError("Fill number after dot");
    return;
  }

  const intBuffer = parseFloat(buffer);

  if (runningTotal == 0) {
    runningTotal = intBuffer;
  } else {
    flushOperation(intBuffer);
  }

  previousOperator = value;
  buffer = INIT;
}

function handleEqual() {
  if (previousOperator == null) return;

  flushOperation(parseFloat(buffer));

  buffer = formatResult(runningTotal);
  previousOperator = null;
  runningTotal = 0;
  isEqualPressed = true;
}

function flushOperation(intBuffer) {
  switch (previousOperator) {
    case "÷":
      if (handleZeroCases(runningTotal, intBuffer)) break;
      runningTotal /= intBuffer;
      break;
    case "×":
      runningTotal *= intBuffer;
      break;
    case "−":
      runningTotal -= intBuffer;
      break;
    case "+":
      runningTotal += intBuffer;
      break;
    default:
      break;
  }
}

function handleZeroCases(runningTotal, intBuffer) {
  if (
    (Object.is(runningTotal, 0) && Object.is(intBuffer, 0)) ||
    (Object.is(runningTotal, 0) && Object.is(intBuffer, -0)) ||
    (Object.is(runningTotal, -0) && Object.is(intBuffer, 0)) ||
    (Object.is(runningTotal, -0) && Object.is(intBuffer, -0))
  ) {
    buffer = INIT;
    handleError("Not valid operation");
    return true;
  }
  if (Object.is(runningTotal, 0) || Object.is(runningTotal, -0)) {
    buffer = INIT;
    return true;
  }
  if (Object.is(intBuffer, 0) || Object.is(intBuffer, -0)) {
    buffer = INIT;
    handleError("Can't divide by 0 or -0");
    return true;
  }
}

function formatResult(total) {
  let result = [...total.toString()];

  // check if result have "-" character
  if (result[0] == "-") {
    // do nothing
  } else {
    result.unshift(" ");
  }

  // trim result to max length
  if (result.length >= 18) {
    result = result.slice(0, 17);
  }

  result = result.join("");

  // trim numbers after dot
  if (result.includes(".")) {
    if (result.length - result.indexOf(".") > NUM_AFTER_DOT) {
      const dot = result.indexOf(".") + 1;
      const int = result.substring(0, dot);
      const float = result.substring(dot, dot + NUM_AFTER_DOT);
      result = int + float;
    }
  }

  // if trimmed number longer than expected
  if (result.length >= 17) {
    handleError("Number is too big, result is trimmed to 16 characters");
  }

  return result;
}

function rerender() {
  if (buffer.length >= 18) {
    handleError("Input limit - 16 characters");
    buffer = buffer.substring(0, 17); // don't count " " or "-" symbols
  }

  data.innerText = buffer;

  if (data.children[0]) {
    alert(
      "Something went wrong...\nPage will be refreshed after closing this alert window."
    );
    document.location.reload();
  }
}

function handleError(text) {
  error.innerText = text;
  setTimeout(() => {
    error.innerText = "";
  }, 2000);
}

function init() {
  buttons.addEventListener("click", (e) => {
    buttonClick(e.target.innerText);
  });
}

init();
