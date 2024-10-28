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

const addStickerButton = document.createElement("button");
addStickerButton.textContent = "Add Custom Sticker";
app.appendChild(addStickerButton);

let stickerData = ["😊", "🎉", "❤️"];
const stickerButtons: HTMLButtonElement[] = [];

function createStickerButtons() {
  stickerButtons.forEach(button => app.removeChild(button));
  stickerButtons.length = 0;
  stickerData.forEach((emoji) => {
    const button = document.createElement("button");
    button.textContent = emoji;
    app.appendChild(button);
    stickerButtons.push(button);
    button.addEventListener("click", () => {
      currentSticker = new Sticker(emoji, 0, 0);
      canvas.dispatchEvent(new CustomEvent("tool-moved"));
    });
  });
}

createStickerButtons();

const ctx = canvas.getContext("2d")!;
let isDrawing = false;
const lines: MarkerLine[] = [];
const stickers: Sticker[] = [];
let currentThickness = 1;
let toolPreview: ToolPreview | null = null;
let currentSticker: Sticker | null = null;

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

class ToolPreview {
  x: number;
  y: number;
  thickness: number;

  constructor(x: number, y: number, thickness: number) {
    this.x = x;
    this.y = y;
    this.thickness = thickness;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.lineWidth = this.thickness;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.thickness / 2, 0, Math.PI * 2);
    ctx.stroke();
  }
}

class Sticker {
  emoji: string;
  x: number;
  y: number;

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
    ctx.font = "32px Arial";
    ctx.fillText(this.emoji, this.x, this.y);
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
  if (currentSticker) {
    currentSticker.x = e.offsetX;
    currentSticker.y = e.offsetY;
  } else {
    const line = new MarkerLine(e.offsetX, e.offsetY, currentThickness);
    lines.push(line);
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    if (currentSticker) {
      currentSticker.drag(e.offsetX, e.offsetY);
    } else {
      const currentLine = lines[lines.length - 1];
      currentLine.drag(e.offsetX, e.offsetY);
      canvas.dispatchEvent(new CustomEvent("drawing-changed"));
    }
  } else if (currentSticker) {
    currentSticker.drag(e.offsetX, e.offsetY);
    canvas.dispatchEvent(new CustomEvent("tool-moved"));
  } else {
    toolPreview = new ToolPreview(e.offsetX, e.offsetY, currentThickness);
    canvas.dispatchEvent(new CustomEvent("tool-moved"));
  }
});

canvas.addEventListener("mouseup", () => {
  isDrawing = false;
  if (currentSticker) {
    stickers.push(currentSticker);
    currentSticker = null;
  }
});

canvas.addEventListener("mouseout", () => {
  isDrawing = false;
});

canvas.addEventListener("drawing-changed", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  lines.forEach((line) => {
    line.display(ctx);
  });
  if (toolPreview) {
    toolPreview.draw(ctx);
  }
});

canvas.addEventListener("tool-moved", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  lines.forEach((line) => {
    line.display(ctx);
  });
  if (toolPreview) {
    toolPreview.draw(ctx);
  }
  stickers.forEach((sticker) => {
    sticker.draw(ctx);
  });
  if (currentSticker) {
    currentSticker.draw(ctx);
  }
});

clearButton.addEventListener("click", () => {
  lines.length = 0;
  stickers.length = 0;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

addStickerButton.addEventListener("click", () => {
  const newSticker = prompt("Enter a new sticker emoji:", "⭐");
  if (newSticker) {
    stickerData.push(newSticker);
    createStickerButtons();
  }
});
