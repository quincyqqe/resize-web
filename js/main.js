import { initTabs } from "./tabs.js";
import { WindowCreator } from "./window-creator.js";

const MAX_OUTPUTS = 8;

const virtualResolutions = {
  "4k": { width: 3840, height: 2160 },
  "2k": { width: 2560, height: 1440 },
};

document.addEventListener("DOMContentLoaded", () => {
  initTabs();

  const windowCreator = new WindowCreator();
  window.windowCreator = windowCreator;

  const resolutionSelect = document.getElementById("virtualSize");
  const rowsInput = document.getElementById("wallRows");
  const colsInput = document.getElementById("wallCols");
  const outputsInfo = document.getElementById("outputsCount");

  function updateCanvasSize(canvas, virtualWidth, virtualHeight) {
    const container = canvas.parentElement;
    const containerStyles = window.getComputedStyle(canvas);
    const paddingLeft = parseInt(containerStyles.paddingLeft) || 0;
    const paddingRight = parseInt(containerStyles.paddingRight) || 0;
    const paddingTop = parseInt(containerStyles.paddingTop) || 0;
    const paddingBottom = parseInt(containerStyles.paddingBottom) || 0;

    const containerWidth = container.clientWidth - paddingLeft - paddingRight;
    const containerHeight = container.clientHeight - paddingTop - paddingBottom;

    const aspectRatio = virtualWidth / virtualHeight;
    const containerRatio = containerWidth / containerHeight;

    let finalWidth, finalHeight;

    if (aspectRatio > containerRatio) {
      finalWidth = containerWidth;
      finalHeight = containerWidth / aspectRatio;
    } else {
      finalHeight = containerHeight;
      finalWidth = containerHeight * aspectRatio;
    }

    canvas.style.width = `${finalWidth}px`;
    canvas.style.height = `${finalHeight}px`;
  }

  function updateWallLayout() {
    const resKey = resolutionSelect.value;
    const resolution = virtualResolutions[resKey];
    const rows = parseInt(rowsInput.value);
    const cols = parseInt(colsInput.value);
    const totalOutputs = rows * cols;

    if (totalOutputs > MAX_OUTPUTS) {
      outputsInfo.textContent = `Too many outputs (${totalOutputs}/8)`;
      outputsInfo.style.color = "red";
      return;
    }

    outputsInfo.textContent = `Outputs: ${totalOutputs}/${MAX_OUTPUTS}`;
    outputsInfo.style.color = "";

    const totalVirtualWidth = cols * resolution.width;
    const totalVirtualHeight = rows * resolution.height;
    windowCreator.setVirtualSize(totalVirtualWidth, totalVirtualHeight);

    updateCanvasSize(
      windowCreator.canvas,
      totalVirtualWidth,
      totalVirtualHeight
    );

    windowCreator.clearAllWindows();

    const canvas = windowCreator.canvas;
    const canvasW = canvas.clientWidth;
    const canvasH = canvas.clientHeight;
    const scaleX = canvasW / totalVirtualWidth;
    const scaleY = canvasH / totalVirtualHeight;

    let outputIndex = 1;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * resolution.width * scaleX;
        const y = row * resolution.height * scaleY;
        const w = resolution.width * scaleX;
        const h = resolution.height * scaleY;

        windowCreator.createOutput(x, y, w, h, outputIndex);
        outputIndex++;
      }
    }
  }

  resolutionSelect.addEventListener("change", updateWallLayout);
  rowsInput.addEventListener("input", updateWallLayout);
  colsInput.addEventListener("input", updateWallLayout);

  updateWallLayout();
});
