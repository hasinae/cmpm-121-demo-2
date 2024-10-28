import "./style.css";

const APP_NAME = "Charm Canvas";
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

const thinBrushButton = document.createElement("button");
thinBrushButton.textContent = "Thin Brush";
const thickBrushButton = document.createElement("button");
thickBrushButton.textContent = "Thick Brush";
app.appendChild(thinBrushButton);
app.appendChild(thickBrushButton);

const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
app.appendChild(clearButton);

const addCharmButton = document.createElement("button");
addCharmButton.textContent = "Add Custom Charm";
app.appendChild(addCharmButton);

const exportButton = document.createElement("button");
exportButton.textContent = "Export";
app.appendChild(exportButton);

let charmData = ["🌟", "🌈", "💫"];
const charmButtons: HTMLButtonElement[] = [];

function createCharmButtons() {
  charmButtons.forEach(button => app.removeChild(button));
  charmButtons.length = 0;
  charmData.forEach((emoji) => {
    const button = document.createElement("button");
    button.textContent = emoji;
    app.appendChild(button);
    charmButtons.push(button);
    button.addEventListener("click", () => {
      currentCharm = new Charm(emoji, 0, 0);
      canvas.dispatchEvent(new CustomEvent("tool-moved"));
    });
  });
}

createCharmButtons();

const ctx = canvas.getContext("2d")!;
let isDrawing = false;
const lines: BrushLine[] = [];
const charms: Charm[] = [];
let currentThickness = 2;
let toolPreview: ToolPreview | null = null;
let currentCharm: Charm | null = null;
let currentColor = getRandomColor();

class BrushLine {
  points: Array<{ x: number; y: number }>;
  thickness: number;
  color: string;

  constructor(x: number, y: number, thickness: number, color: string) {
    this.points = [{ x, y }];
    this.thickness = thickness;
    this.color = color;
  }

  drag(x: number, y: number) {
    this.points.push({ x, y });
  }

  display(ctx: CanvasRenderingContext2D) {
    if (this.points.length === 0) return;
    ctx.strokeStyle = this.color;
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

class Charm {
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
    ctx.font = "40px Arial";
    ctx.fillText(this.emoji, this.x, this.y);
  }
}

// Helper function to generate a random color
function getRandomColor() {
  return `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`;
}

thinBrushButton.addEventListener("click", () => {
  currentThickness = 2;
  currentColor = getRandomColor();
  thinBrushButton.classList.add("selectedTool");
  thickBrushButton.classList.remove("selectedTool");
});

thickBrushButton.addEventListener("click", () => {
  currentThickness = 8;
  currentColor = getRandomColor();
  thickBrushButton.classList.add("selectedTool");
  thinBrushButton.classList.remove("selectedTool");
});

canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  if (currentCharm) {
    currentCharm.x = e.offsetX;
    currentCharm.y = e.offsetY;
  } else {
    const line = new BrushLine(e.offsetX, e.offsetY, currentThickness, currentColor);
    lines.push(line);
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    if (currentCharm) {
      currentCharm.drag(e.offsetX, e.offsetY);
    } else {
      const currentLine = lines[lines.length - 1];
      currentLine.drag(e.offsetX, e.offsetY);
      canvas.dispatchEvent(new CustomEvent("drawing-changed"));
    }
  } else if (currentCharm) {
    currentCharm.drag(e.offsetX, e.offsetY);
    canvas.dispatchEvent(new CustomEvent("tool-moved"));
  } else {
    toolPreview = new ToolPreview(e.offsetX, e.offsetY, currentThickness, currentColor);
    canvas.dispatchEvent(new CustomEvent("tool-moved"));
  }
});

canvas.addEventListener("mouseup", () => {
  isDrawing = false;
  if (currentCharm) {
    charms.push(currentCharm);
    currentCharm = null;
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
  charms.forEach((charm) => {
    charm.draw(ctx);
  });
  if (currentCharm) {
    currentCharm.draw(ctx);
  }
});

clearButton.addEventListener("click", () => {
  lines.length = 0;
  charms.length = 0;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

addCharmButton.addEventListener("click", () => {
  const newCharm = prompt("Enter a new charm emoji:", "✨");
  if (newCharm) {
    charmData.push(newCharm);
    createCharmButtons();
  }
});

exportButton.addEventListener("click", () => {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = 1024;
  exportCanvas.height = 1024;
  const exportCtx = exportCanvas.getContext("2d")!;
  exportCtx.scale(4, 4);

  lines.forEach((line) => {
    line.display(exportCtx);
  });
  charms.forEach((charm) => {
    charm.draw(exportCtx);
  });

  exportCanvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "charm-canvas.png";
      a.click();
      URL.revokeObjectURL(url);
    }
  });
});
