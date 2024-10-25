import "./style.css";

const APP_NAME = "hiiii";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

const titleElement = document.createElement("h1");
titleElement.textContent = APP_NAME;
app.appendChild(titleElement);

const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
canvas.id = "myCanvas";
app.appendChild(canvas);

const thinButton = document.createElement("button");
thinButton.textContent = "Thin Marker";
const thickButton = document.createElement("button");
thickButton.textContent = "Thick Marker";
app.appendChild(thinButton);
app.appendChild(thickButton);

const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
app.appendChild(clearButton);

const ctx = canvas.getContext("2d")!;
let isDrawing = false;
const lines: Array<MarkerLine> = [];
let currentThickness = 1;

class MarkerLine {
  points: Array<{ x: number; y: number }>;
  thickness: number;

  constructor(x: number, y: number, thickness: number) {
    this.points = [{ x, y }];
    this.thickness = thickness;
  }

  drag(x: number, y: number) {
    this.points.push({ x, y });
  }

  display(ctx: CanvasRenderingContext2D) {
    if (this.points.length === 0) return;
    ctx.lineWidth = this.thickness;
    ctx.beginPath();
    this.points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();
  }
}

thinButton.addEventListener("click", () => {
  currentThickness = 1;
  thinButton.classList.add("selectedTool");
  thickButton.classList.remove("selectedTool");
});

thickButton.addEventListener("click", () => {
  currentThickness = 5;
  thickButton.classList.add("selectedTool");
  thinButton.classList.remove("selectedTool");
});

canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  const line = new MarkerLine(e.offsetX, e.offsetY, currentThickness);
  lines.push(line);
});

canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    const currentLine = lines[lines.length - 1];
    currentLine.drag(e.offsetX, e.offsetY);
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
    line.display(ctx);
  });
});

clearButton.addEventListener("click", () => {
  lines.length = 0;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});
