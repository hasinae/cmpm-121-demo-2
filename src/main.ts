import "./style.css";

// Constants and Initialization
const APP_NAME = "Charm Canvas";
const app = document.querySelector<HTMLDivElement>("#app")!;
document.title = APP_NAME;

// App Layout
const titleElement = document.createElement("h1");
titleElement.textContent = APP_NAME;
app.appendChild(titleElement);

const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
canvas.id = "myCanvas";
app.appendChild(canvas);

const ctx = canvas.getContext("2d")!;

// Buttons
const thinBrushButton = document.createElement("button");
thinBrushButton.textContent = "Thin Brush";

const thickBrushButton = document.createElement("button");
thickBrushButton.textContent = "Thick Brush";

const clearButton = document.createElement("button");
clearButton.textContent = "Clear";

const addCharmButton = document.createElement("button");
addCharmButton.textContent = "Add Custom Charm";

const exportButton = document.createElement("button");
exportButton.textContent = "Export";

const colorPicker = document.createElement("input");
colorPicker.type = "color";
colorPicker.value = "#ff0000";

app.append(thinBrushButton, thickBrushButton, clearButton, addCharmButton, exportButton, colorPicker);

// Data Models
interface Point {
  x: number;
  y: number;
}

interface Drawable {
  draw(ctx: CanvasRenderingContext2D): void;
}

class BrushLine implements Drawable {
  points: Point[] = [];
  thickness: number;
  color: string;

  constructor(x: number, y: number, thickness: number, color: string) {
    this.points.push({ x, y });
    this.thickness = thickness;
    this.color = color;
  }

  drag(x: number, y: number) {
    this.points.push({ x, y });
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.points.length < 2) return;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.thickness;
    ctx.beginPath();
    this.points.forEach((point, index) =>
      index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y)
    );
    ctx.stroke();
  }
}

class Charm implements Drawable {
  emoji: string;
  x: number;
  y: number;
  isDragging: boolean = false;

  constructor(emoji: string, x: number, y: number) {
    this.emoji = emoji;
    this.x = x;
    this.y = y;
  }

  drag(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.font = "40px Arial";
    ctx.fillText(this.emoji, this.x, this.y);
  }
}

class ToolPreview implements Drawable {
  x: number;
  y: number;
  thickness: number;
  color: string;

  constructor(x: number, y: number, thickness: number, color: string) {
    this.x = x;
    this.y = y;
    this.thickness = thickness;
    this.color = color;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.thickness;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.thickness / 2, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// Application State
let currentThickness = 2;
let currentColor = colorPicker.value;
let lines: BrushLine[] = [];
let charms: Charm[] = [];
let currentCharm: Charm | null = null;
let isDrawing = false;

// Helper Functions
function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  lines.forEach((line) => line.draw(ctx));
  charms.forEach((charm) => charm.draw(ctx));
}

// Event Listeners
canvas.addEventListener("mousedown", (e) => {
  if (currentCharm) {
    currentCharm.isDragging = true;
    currentCharm.drag(e.offsetX, e.offsetY);
  } else {
    const line = new BrushLine(e.offsetX, e.offsetY, currentThickness, currentColor);
    lines.push(line);
    isDrawing = true;
  }
  redraw();
});

canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    const currentLine = lines[lines.length - 1];
    currentLine.drag(e.offsetX, e.offsetY);
  } else if (currentCharm?.isDragging) {
    currentCharm.drag(e.offsetX, e.offsetY);
  }
  redraw();
});

canvas.addEventListener("mouseup", () => {
  isDrawing = false;
  if (currentCharm) currentCharm.isDragging = false;
});

thinBrushButton.addEventListener("click", () => {
  currentThickness = 2;
});

thickBrushButton.addEventListener("click", () => {
  currentThickness = 8;
});

clearButton.addEventListener("click", () => {
  lines = [];
  charms = [];
  redraw();
});

addCharmButton.addEventListener("click", () => {
  const emoji = prompt("Enter a new charm emoji:", "✨");
  if (emoji) {
    charms.push(new Charm(emoji, 0, 0));
    redraw();
  }
});

exportButton.addEventListener("click", () => {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = 1024;
  exportCanvas.height = 1024;
  const exportCtx = exportCanvas.getContext("2d")!;
  exportCtx.scale(4, 4);

  lines.forEach((line) => line.draw(exportCtx));
  charms.forEach((charm) => charm.draw(exportCtx));

  exportCanvas.toBlob((blob) => {
    if (blob) {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "charm-canvas.png";
      a.click();
      URL.revokeObjectURL(a.href);
    }
  });
});

colorPicker.addEventListener("change", () => {
  currentColor = colorPicker.value;
});
