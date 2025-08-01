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

    // Добавляем слушатели на кнопки input-btn
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
    outputEl.style.justifyContent = "center";
    outputEl.style.alignItems = "center";
    outputEl.style.color = "#333";
    outputEl.style.fontSize = "18px";
    outputEl.style.userSelect = "none";
    outputEl.textContent = `Output ${index}`;
    outputEl.style.zIndex = 1;

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

    const backgroundColor = this.hexToRgba("#000000", 0.4);

    const windowEl = document.createElement("div");
    windowEl.className = "window";
    windowEl.id = windowId;
    windowEl.style.left = x + "px";
    windowEl.style.top = y + "px";
    windowEl.style.width = width + "px";
    windowEl.style.height = height + "px";
    windowEl.style.background = backgroundColor;
    windowEl.style.zIndex = 1000;

    // Добавляем data-атрибут с выбранным Input
    windowEl.dataset.input = this.currentInput;

    windowEl.innerHTML = `
      <div class="window-header">
        <span>${this.currentInput} - Window ${this.windowCount + 1}</span>
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
      <div class="resize-handle"></div>
    `;

    this.canvas.appendChild(windowEl);
    this.windows.push(windowId);
    this.windowCount++;
    this.updateWindowCount();

    this.makeDraggable(windowEl);
    this.makeResizable(windowEl);
    this.updateWindowInfo(windowEl);
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

    const canvasWidth = this.canvas.clientWidth;
    const canvasHeight = this.canvas.clientHeight;

    windowEl.style.left = "0px";
    windowEl.style.top = "0px";
    windowEl.style.width = canvasWidth + "px";
    windowEl.style.height = canvasHeight + "px";

    this.updateWindowInfo(windowEl);
  }

  closeWindow(windowId) {
    const windowEl = document.getElementById(windowId);
    if (windowEl) {
      windowEl.remove();
      this.windows = this.windows.filter((id) => id !== windowId);
      this.windowCount--;
      this.updateWindowCount();
    }
  }

  clearAllWindows() {
    this.windows.forEach((el) => {
      if (el instanceof HTMLElement) {
        el.remove();
      } else if (typeof el === "string") {
        // старые окна по id
        const windowEl = document.getElementById(el);
        if (windowEl) windowEl.remove();
      }
    });
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

    const canvasWidth = this.canvas.clientWidth;
    const canvasHeight = this.canvas.clientHeight;

    const scaleX = this.totalVirtualWidth / canvasWidth;
    const scaleY = this.totalVirtualHeight / canvasHeight;

    const windowLeft = Number.parseFloat(windowEl.style.left);
    const windowTop = Number.parseFloat(windowEl.style.top);
    const windowWidth = Number.parseFloat(windowEl.style.width);
    const windowHeight = Number.parseFloat(windowEl.style.height);

    const virtualX = Math.round(windowLeft * scaleX);
    const virtualY = Math.round(windowTop * scaleY);
    const virtualWidth = Math.round(windowWidth * scaleX);
    const virtualHeight = Math.round(windowHeight * scaleY);

    infoEl.innerHTML = `
    <div>Pos: ${virtualX}, ${virtualY}</div>
    <div>Size: ${virtualWidth}×${virtualHeight}</div>
  `;
  }
}
