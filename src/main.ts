// import "./style.css";

// const APP_NAME = "hiiii";
// const app = document.querySelector<HTMLDivElement>("#app")!;

// document.title = APP_NAME;

// // Step 1: Initial non-interactive UI layout
// const titleElement = document.createElement("h1");
// titleElement.textContent = APP_NAME;
// app.appendChild(titleElement);

// const canvas = document.createElement("canvas");
// canvas.width = 256;
// canvas.height = 256;
// canvas.id = "myCanvas";
// app.appendChild(canvas);


import "./style.css";

const APP_NAME = "hiiii";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

// Step 1: Initial non-interactive UI layout
const titleElement = document.createElement("h1");
titleElement.textContent = APP_NAME;
app.appendChild(titleElement);

const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
canvas.id = "myCanvas";
app.appendChild(canvas);


// Step 2: Simple marker drawing
const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
app.appendChild(clearButton);

const ctx = canvas.getContext("2d")!;
let isDrawing = false;

canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  }
});

canvas.addEventListener("mouseup", () => {
  isDrawing = false;
});

canvas.addEventListener("mouseout", () => {
  isDrawing = false;
});

clearButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});
