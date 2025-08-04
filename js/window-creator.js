export class WindowCreator {
  constructor() {
    this.canvas = document.getElementById("canvas");
    this.selectionBox = document.getElementById("selectionBox");
    this.windowCount = 0;
    this.currentMode = "create";
    this.currentInput = "Input 1";
    this.isSelecting = false;
    this.startX = 0;
    this.startY = 0;
    this.windows = [];
    this.inputs = {
      "Input 1": {
        windowCount: 0,
        color: "#000000",
        windows: [],
      },
      "Input 2": {
        windowCount: 0,
        color: "#e7873a80",
        windows: [],
      },
      "Input 3": {
        windowCount: 0,
        color: "#67aa1480",
        windows: [],
      },
      "Input 4": {
        windowCount: 0,
        color: "#a319d280",
        windows: [],
      },
      "Input 5": {
        windowCount: 0,
        color: "#1a25f180",
        windows: [],
      },
      "Input 6": {
        windowCount: 0,
        color: "#c3848c80",
        windows: [],
      },
      "Input 7": {
        windowCount: 0,
        color: "#2d713880",
        windows: [],
      },
      "Input 8": {
        windowCount: 0,
        color: "#bebd7680",
        windows: [],
      },
    };
    this.virtualResolutions = {
      "4k": { width: 3840, height: 2160 },
      "2k": { width: 2560, height: 1440 },
    };
    this.currentResolution = "4k";
    this.totalVirtualWidth = 3840; // Default 1x 4K
    this.totalVirtualHeight = 2160;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateWindowCount();

    document.querySelectorAll(".input-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.selectInput(btn.dataset.input);
      });
    });

    this.highlightSelectedInput();
  }

  setupEventListeners() {
    document.getElementById("clearAll").addEventListener("click", () => {
      this.clearAllWindows();
      const resolutionSelect = document.getElementById("virtualSize");
      const rowsInput = document.getElementById("wallRows");
      const colsInput = document.getElementById("wallCols");

      resolutionSelect.value = "4k";
      rowsInput.value = "1";
      colsInput.value = "1";

      resolutionSelect.dispatchEvent(new Event("change"));
    });

    document.getElementById("virtualSize").addEventListener("change", (e) => {
      this.changeResolution(e.target.value);
    });

    this.canvas.addEventListener("mousedown", (e) => {
      if (this.currentMode === "create" && e.target === this.canvas) {
        this.startSelection(e);
      }
    });

    this.canvas.addEventListener("mousemove", (e) => {
      if (this.isSelecting) {
        this.updateSelection(e);
      }
    });

    this.canvas.addEventListener("mouseup", (e) => {
      if (this.isSelecting) {
        this.endSelection(e);
      }
    });
  }

  createOutput(x, y, width, height, index) {
    const outputEl = document.createElement("div");
    outputEl.className = "output-block";
    outputEl.style.position = "absolute";
    outputEl.style.left = x + "px";
    outputEl.style.top = y + "px";
    outputEl.style.width = width + "px";
    outputEl.style.height = height + "px";
    outputEl.style.border = "1px solid #333";
    outputEl.style.background = "transparent";
    outputEl.style.display = "flex";
    outputEl.style.flexDirection = "column";
    outputEl.style.color = "#333";
    outputEl.style.fontSize = "18px";
    outputEl.style.userSelect = "none";
    outputEl.style.zIndex = 1;
    outputEl.style.overflow = "hidden";

    //  header
    const header = document.createElement("div");
    header.style.padding = "6px";
    header.style.textAlign = "center";
    header.textContent = `Output ${index}`;
    header.style.zIndex = 2;
    header.style.position = "relative";

    const gridOverlay = document.createElement("div");
    gridOverlay.style.position = "absolute";
    gridOverlay.style.top = "0";
    gridOverlay.style.left = "0";
    gridOverlay.style.width = "100%";
    gridOverlay.style.height = "100%";
    gridOverlay.style.display = "grid";
    gridOverlay.style.gridTemplateColumns = "1fr 1fr";
    gridOverlay.style.gridTemplateRows = "1fr 1fr";
    gridOverlay.style.zIndex = 1;

    for (let i = 0; i < 4; i++) {
      const cell = document.createElement("div");

      const row = Math.floor(i / 2);
      const col = i % 2;

      const borders = [];
      if (col === 0) borders.push("borderRight");
      if (row === 0) borders.push("borderBottom");

      cell.style.border = "none";
      borders.forEach((border) => {
        cell.style[border] = "1px dashed rgba(51, 51, 51, 0.5)";
      });

      gridOverlay.appendChild(cell);
    }

    outputEl.appendChild(header);
    outputEl.appendChild(gridOverlay);
    this.canvas.appendChild(outputEl);

    this.windows.push(outputEl);
    this.windowCount++;
    this.updateWindowCount();
  }

  setVirtualSize(width, height) {
    this.totalVirtualWidth = width;
    this.totalVirtualHeight = height;
  }

  selectInput(inputNumber) {
    this.currentInput = `Input ${inputNumber}`;
    this.highlightSelectedInput();
  }

  highlightSelectedInput() {
    document.querySelectorAll(".input-btn").forEach((btn) => {
      if (`Input ${btn.dataset.input}` === this.currentInput) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  setMode(mode) {
    this.currentMode = mode;

    document.querySelectorAll(".tool-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    if (mode === "create") {
      document.getElementById("createMode").classList.add("active");
      this.canvas.style.cursor = "crosshair";
    } else {
      document.getElementById("selectMode").classList.add("active");
      this.canvas.style.cursor = "default";
    }
  }

  changeResolution(newResolution) {
    this.clearAllWindows();
    this.currentResolution = newResolution;
  }

  startSelection(e) {
    this.isSelecting = true;
    const rect = this.canvas.getBoundingClientRect();
    this.startX = e.clientX - rect.left;
    this.startY = e.clientY - rect.top;

    this.selectionBox.style.left = this.startX + "px";
    this.selectionBox.style.top = this.startY + "px";
    this.selectionBox.style.width = "0px";
    this.selectionBox.style.height = "0px";
    this.selectionBox.style.display = "block";
  }

  updateSelection(e) {
    const rect = this.canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const width = Math.abs(currentX - this.startX);
    const height = Math.abs(currentY - this.startY);
    const left = Math.min(currentX, this.startX);
    const top = Math.min(currentY, this.startY);

    this.selectionBox.style.left = left + "px";
    this.selectionBox.style.top = top + "px";
    this.selectionBox.style.width = width + "px";
    this.selectionBox.style.height = height + "px";
  }

  endSelection(e) {
    this.isSelecting = false;
    this.selectionBox.style.display = "none";

    const rect = this.canvas.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    const width = Math.abs(endX - this.startX);
    const height = Math.abs(endY - this.startY);

    // Создаем окно только если область достаточно большая
    if (width > 50 && height > 50) {
      const left = Math.min(endX, this.startX);
      const top = Math.min(endY, this.startY);
      this.createWindow(left, top, width, height);
    }
  }

  createWindow(x, y, width, height) {
    const windowId = "window_" + Date.now();
    const input = this.currentInput;

    
    this.inputs[input].windowCount++;
    const windowNumber = this.inputs[input].windowCount;

    const baseColor = this.inputs[input].color || "#000000";
    const backgroundColor = this.hexToRgba(baseColor, 0.4);

    const windowEl = document.createElement("div");
    windowEl.className = "window";
    windowEl.id = windowId;
    windowEl.style.left = x + "px";
    windowEl.style.top = y + "px";
    windowEl.style.width = width + "px";
    windowEl.style.height = height + "px";
    windowEl.style.background = backgroundColor;
    windowEl.style.zIndex = 1000;
    windowEl.dataset.input = input;

    
    windowEl.innerHTML = `
  <div class="window-header">
    <span>${input}</span>
    <div class="window-controls">
      <button class="window-maximize" onclick="windowCreator.maximizeWindow('${windowId}')">
        <img src="images/maximize.svg" alt="Maximize" width="16" height="16" />
      </button>
      <button class="window-close" onclick="windowCreator.closeWindow('${windowId}')">
        <img src="images/close.svg" alt="Close" width="16" height="16" />
      </button>
    </div>
  </div>
  <div class="window-info" id="info_${windowId}"></div>
  <div class="resize-handle">${windowNumber}</div>
`;
    this.canvas.appendChild(windowEl);
    this.windows.push(windowId);
    this.windowCount++;

    const windowInfo = {
      id: windowId,
      number: windowNumber,
      position: { x, y },
      size: { width, height },
      virtualPosition: this.calculateVirtualPosition(x, y),
      virtualSize: this.calculateVirtualSize(width, height),
    };

    this.inputs[input].windows.push(windowInfo);

    this.updateWindowCount();
    this.makeDraggable(windowEl);
    this.makeResizable(windowEl);
    this.updateWindowInfo(windowEl);
  }

  calculateVirtualPosition(x, y) {
    const scaleX = this.totalVirtualWidth / this.canvas.clientWidth;
    const scaleY = this.totalVirtualHeight / this.canvas.clientHeight;
    return {
      x: Math.round(x * scaleX),
      y: Math.round(y * scaleY),
    };
  }

  calculateVirtualSize(width, height) {
    const scaleX = this.totalVirtualWidth / this.canvas.clientWidth;
    const scaleY = this.totalVirtualHeight / this.canvas.clientHeight;
    return {
      width: Math.round(width * scaleX),
      height: Math.round(height * scaleY),
    };
  }

  makeDraggable(windowEl) {
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    windowEl.addEventListener("mousedown", (e) => {
      const isCloseBtn = e.target.classList.contains("window-close");
      const isResizeHandle = e.target.classList.contains("resize-handle");
      if (isCloseBtn || isResizeHandle) return;

      isDragging = true;
      const rect = windowEl.getBoundingClientRect();
      const canvasRect = this.canvas.getBoundingClientRect();
      dragOffsetX = e.clientX - rect.left;
      dragOffsetY = e.clientY - rect.top;

      windowEl.style.zIndex = 1000;
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;

      const canvasRect = this.canvas.getBoundingClientRect();
      const newX = e.clientX - canvasRect.left - dragOffsetX;
      const newY = e.clientY - canvasRect.top - dragOffsetY;

      windowEl.style.left =
        Math.max(
          0,
          Math.min(newX, this.canvas.clientWidth - windowEl.offsetWidth)
        ) + "px";
      windowEl.style.top =
        Math.max(
          0,
          Math.min(newY, this.canvas.clientHeight - windowEl.offsetHeight)
        ) + "px";
      this.updateWindowInfo(windowEl);
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        windowEl.style.zIndex = "auto";
      }
    });
  }

  makeResizable(windowEl) {
    const resizeHandle = windowEl.querySelector(".resize-handle");
    let isResizing = false;

    resizeHandle.addEventListener("mousedown", (e) => {
      isResizing = true;
      e.stopPropagation();
    });

    document.addEventListener("mousemove", (e) => {
      if (!isResizing) return;

      const canvasRect = this.canvas.getBoundingClientRect();
      const windowRect = windowEl.getBoundingClientRect();

      const newWidth = e.clientX - windowRect.left;
      const newHeight = e.clientY - windowRect.top;

      const maxWidth =
        this.canvas.clientWidth - Number.parseFloat(windowEl.style.left);
      const maxHeight =
        this.canvas.clientHeight - Number.parseFloat(windowEl.style.top);

      const clampedWidth = Math.min(newWidth, maxWidth);
      const clampedHeight = Math.min(newHeight, maxHeight);

      if (clampedWidth > 150 && clampedHeight > 100) {
        windowEl.style.width = clampedWidth + "px";
        windowEl.style.height = clampedHeight + "px";
        this.updateWindowInfo(windowEl);
      }
    });

    document.addEventListener("mouseup", () => {
      isResizing = false;
    });
  }

  maximizeWindow(windowId) {
    const windowEl = document.getElementById(windowId);
    if (!windowEl) return;

    const windowRect = windowEl.getBoundingClientRect();
    const canvasRect = this.canvas.getBoundingClientRect();

    const outputs = Array.from(document.querySelectorAll(".output-block"));

  
    const intersectedQuadrants = [];

    outputs.forEach((output) => {
      const outputRect = output.getBoundingClientRect();

     
      if (
        windowRect.right < outputRect.left ||
        windowRect.left > outputRect.right ||
        windowRect.bottom < outputRect.top ||
        windowRect.top > outputRect.bottom
      ) {
        return; 
      }

     
      const outputWidth = outputRect.width;
      const outputHeight = outputRect.height;
      const quadrantWidth = outputWidth / 2;
      const quadrantHeight = outputHeight / 2;

  
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 2; col++) {
          const quadrantLeft = outputRect.left + col * quadrantWidth;
          const quadrantTop = outputRect.top + row * quadrantHeight;
          const quadrantRight = quadrantLeft + quadrantWidth;
          const quadrantBottom = quadrantTop + quadrantHeight;

        
          if (
            !(
              windowRect.right < quadrantLeft ||
              windowRect.left > quadrantRight ||
              windowRect.bottom < quadrantTop ||
              windowRect.top > quadrantBottom
            )
          ) {
          
            intersectedQuadrants.push({
              left: quadrantLeft,
              top: quadrantTop,
              right: quadrantRight,
              bottom: quadrantBottom,
            });
          }
        }
      }
    });

    if (intersectedQuadrants.length === 0) return;

  
    const minLeft = Math.min(...intersectedQuadrants.map((q) => q.left));
    const minTop = Math.min(...intersectedQuadrants.map((q) => q.top));
    const maxRight = Math.max(...intersectedQuadrants.map((q) => q.right));
    const maxBottom = Math.max(...intersectedQuadrants.map((q) => q.bottom));

   
    const left = minLeft - canvasRect.left;
    const top = minTop - canvasRect.top;
    const width = maxRight - minLeft;
    const height = maxBottom - minTop;

   
    windowEl.style.left = left + "px";
    windowEl.style.top = top + "px";
    windowEl.style.width = width + "px";
    windowEl.style.height = height + "px";

    this.updateWindowInfo(windowEl);
  }

  closeWindow(windowId) {
    const windowEl = document.getElementById(windowId);
    if (windowEl) {
      const input = windowEl.dataset.input;

      this.inputs[input].windows = this.inputs[input].windows.filter(
        (window) => window.id !== windowId
      );
      this.inputs[input].windowCount = this.inputs[input].windows.length;

      windowEl.remove();
      this.windows = this.windows.filter((id) => id !== windowId);
      this.windowCount--;

      this.updateWindowCount();
    }
  }

  clearAllWindows() {
    this.windows.forEach((el) => {
      if (typeof el === "string") {
        const windowEl = document.getElementById(el);
        if (windowEl) windowEl.remove();
      }
    });

    document.querySelectorAll(".output-block").forEach((el) => el.remove());

    for (const input in this.inputs) {
      this.inputs[input].windowCount = 0;
      this.inputs[input].windows = [];
    }

    this.windows = [];
    this.windowCount = 0;

    this.updateWindowCount();
  }

  updateWindowCount() {
    const windowCountEl = document.getElementById("windowCount");
    if (windowCountEl) {
      windowCountEl.textContent = this.windowCount;
    }
  }

  hexToRgba(hex, alpha = 1) {
    const r = Number.parseInt(hex.slice(1, 3), 16);
    const g = Number.parseInt(hex.slice(3, 5), 16);
    const b = Number.parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  rescaleWindow(windowEl, oldRes, newRes) {
    const oldVirtual = this.virtualResolutions[oldRes];
    const newVirtual = this.virtualResolutions[newRes];

    const scaleX = newVirtual.width / oldVirtual.width;
    const scaleY = newVirtual.height / oldVirtual.height;

    const currentLeft = Number.parseFloat(windowEl.style.left);
    const currentTop = Number.parseFloat(windowEl.style.top);
    const currentWidth = Number.parseFloat(windowEl.style.width);
    const currentHeight = Number.parseFloat(windowEl.style.height);

    windowEl.style.left = currentLeft * scaleX + "px";
    windowEl.style.top = currentTop * scaleY + "px";
    windowEl.style.width = currentWidth * scaleX + "px";
    windowEl.style.height = currentHeight * scaleY + "px";

    this.updateWindowInfo(windowEl);
  }

  updateWindowInfo(windowEl) {
    const infoEl = windowEl.querySelector(".window-info");
    if (!infoEl) return;

    const windowLeft = Number.parseFloat(windowEl.style.left);
    const windowTop = Number.parseFloat(windowEl.style.top);
    const windowWidth = Number.parseFloat(windowEl.style.width);
    const windowHeight = Number.parseFloat(windowEl.style.height);

    const virtualPosition = this.calculateVirtualPosition(
      windowLeft,
      windowTop
    );
    const virtualSize = this.calculateVirtualSize(windowWidth, windowHeight);

 
    const input = windowEl.dataset.input;
    const windowId = windowEl.id;
    const windowInfo = this.inputs[input].windows.find(
      (w) => w.id === windowId
    );
    if (windowInfo) {
      windowInfo.position = { x: windowLeft, y: windowTop };
      windowInfo.size = { width: windowWidth, height: windowHeight };
      windowInfo.virtualPosition = virtualPosition;
      windowInfo.virtualSize = virtualSize;
    }

    infoEl.innerHTML = `
      <div>Pos: ${virtualPosition.x}, ${virtualPosition.y}</div>
      <div>Size: ${virtualSize.width}×${virtualSize.height}</div>
    `;
  }
}
