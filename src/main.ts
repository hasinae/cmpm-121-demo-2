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
const lines: Array<Array<{ x: number; y: number }>> = [];

// Step 3: Display list and observer
canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  lines.push([{ x: e.offsetX, y: e.offsetY }]);
});

canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) 
{
    const currentLine = lines[lines.length - 1];
    currentLine.push({ x: e.offsetX, y: e.offsetY });
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
  }
});

canvas.addEventListener("mouseup", () => {
  isDrawing = false;
});

canvas.addEventListener("mouseout", () => {
  isDrawing = false;
});

canvas.addEventListener("drawing-changed", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  lines.forEach((line) => {
    ctx.beginPath();
    line.forEach((point, index) => {
      if (index === 0) 
        {
        ctx.moveTo(point.x, point.y);
      } 
      else 
      {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();
  });
});


clearButton.addEventListener("click", () => {
  lines.length = 0;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});
