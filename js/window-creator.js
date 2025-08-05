import { VIRTUAL_RESOLUTIONS, INPUT_COLORS } from "./constants.js"
import { calculateVirtualPosition, calculateVirtualSize, getOutputAtPosition } from "./utils.js"

export class WindowCreator {
  constructor() {
    this.canvas = document.getElementById("canvas")
    this.selectionBox = document.getElementById("selectionBox")
    this.windows = [] // Stores all window info objects
    this.currentMode = "create"
    this.currentInput = "Input 1"
    this.isSelecting = false
    this.startX = 0
    this.startY = 0
    this.isDragging = false
    this.inputs = Object.keys(INPUT_COLORS).reduce((acc, key) => {
      acc[key] = { color: INPUT_COLORS[key].color, windows: [] }
      return acc
    }, {})

    this.totalVirtualWidth = VIRTUAL_RESOLUTIONS["4k"].width
    this.totalVirtualHeight = VIRTUAL_RESOLUTIONS["4k"].height
    this.wallRows = 1
    this.wallCols = 1
    this.outputVirtualWidth = VIRTUAL_RESOLUTIONS["4k"].width
    this.outputVirtualHeight = VIRTUAL_RESOLUTIONS["4k"].height

    this.init()
  }

  init() {
    this.setupEventListeners()
    this.updateGlobalWindowNumbers()

    document.querySelectorAll(".input-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.selectInput(btn.dataset.input)
      })
    })

    this.highlightSelectedInput()
    this.setupDragAndDrop()
  }

  setupDragAndDrop() {
    document.querySelectorAll(".input-btn").forEach((btn) => {
      btn.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", btn.dataset.input)
        e.dataTransfer.effectAllowed = "copyLink"
        btn.style.opacity = "0.5"
        this.isDragging = true
      })

      btn.addEventListener("dragend", () => {
        btn.style.opacity = "1"
        this.isDragging = false
        document.querySelectorAll(".output-block").forEach((output) => {
          output.classList.remove("drag-over")
        })
      })
    })

    this.canvas.addEventListener("dragover", (e) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = "copy"
      if (this.isDragging) {
        const rect = this.canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const targetOutput = getOutputAtPosition(x, y, this.canvas)
        document.querySelectorAll(".output-block").forEach((output) => {
          output.classList.remove("drag-over")
        })
        if (targetOutput) {
          targetOutput.classList.add("drag-over")
        }
      }
    })

    this.canvas.addEventListener("drop", (e) => {
      e.preventDefault()
      const inputNumber = e.dataTransfer.getData("text/plain")
      const targetWindowEl = e.target.closest(".window")

      if (targetWindowEl) {
        // Dropped on an existing window
        this.handleWindowDrop(targetWindowEl, inputNumber)
      } else {
        // Dropped on canvas or output block (create new window)
        const rect = this.canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const targetOutput = getOutputAtPosition(x, y, this.canvas)
        if (targetOutput) {
          this.createWindowOnOutput(targetOutput, inputNumber, e)
        }
      }
      document.querySelectorAll(".output-block").forEach((output) => {
        output.classList.remove("drag-over")
      })
    })
  }

   createWindowOnOutput(outputEl, inputNumber) {
    const input = `Input ${inputNumber}`;

    const outputRect = outputEl.getBoundingClientRect();
    const canvasRect = this.canvas.getBoundingClientRect();

    const x = outputRect.left - canvasRect.left;
    const y = outputRect.top - canvasRect.top;
    const width = outputRect.width;
    const height = outputRect.height;

    this.currentInput = input;
    this.createWindow(x, y, width, height);

    this.highlightSelectedInput();
  }



  handleWindowDrop(targetWindowEl, inputNumber) {
    const oldInput = targetWindowEl.dataset.input
    const newInput = `Input ${inputNumber}`

    if (oldInput === newInput) {
      return // No change needed if dropping the same input
    }

    const windowId = targetWindowEl.id
    let windowInfoToMove = null

    // Find and remove windowInfo from old input's array
    this.inputs[oldInput].windows = this.inputs[oldInput].windows.filter((win) => {
      if (win.id === windowId) {
        windowInfoToMove = win
        return false
      }
      return true
    })

    if (!windowInfoToMove) {
      console.error("Window info not found for ID:", windowId)
      return
    }

    // Update window element properties
    targetWindowEl.dataset.input = newInput
    targetWindowEl.style.background = this.inputs[newInput].color
    targetWindowEl.querySelector(".window-header span").textContent = newInput

    // Update the windowInfo's input property
    windowInfoToMove.input = newInput

    // Add windowInfo to new input's array
    this.inputs[newInput].windows.push(windowInfoToMove)

    this.updateWindowInfo(targetWindowEl)
    this.updateGlobalWindowNumbers() // Re-number all windows
  }

  setupEventListeners() {
    this.canvas.addEventListener("mousedown", (e) => {
      if (this.currentMode === "create" && e.target === this.canvas && !this.isDragging) {
        this.startSelection(e)
      }
    })

    this.canvas.addEventListener("mousemove", (e) => {
      if (this.isSelecting) {
        this.updateSelection(e)
      }
    })

    this.canvas.addEventListener("mouseup", (e) => {
      if (this.isSelecting) {
        this.endSelection(e)
      }
    })
  }

  setVirtualSize(width, height) {
    this.totalVirtualWidth = width
    this.totalVirtualHeight = height
  }

  setWallConfig(rows, cols, outputW, outputH) {
    this.wallRows = rows
    this.wallCols = cols
    this.outputVirtualWidth = outputW
    this.outputVirtualHeight = outputH
  }

  redrawWallOutputs() {
    document.querySelectorAll(".output-block").forEach((el) => el.remove())

    const canvasW = this.canvas.clientWidth
    const canvasH = this.canvas.clientHeight

    if (canvasW === 0 || canvasH === 0) {
      return
    }

    const scaleX = canvasW / this.totalVirtualWidth
    const scaleY = canvasH / this.totalVirtualHeight

    let outputIndex = 1
    for (let row = 0; row < this.wallRows; row++) {
      for (let col = 0; col < this.wallCols; col++) {
        const x = col * this.outputVirtualWidth * scaleX
        const y = row * this.outputVirtualHeight * scaleY
        const w = this.outputVirtualWidth * scaleX
        const h = this.outputVirtualHeight * scaleY
        this.createOutputElement(x, y, w, h, outputIndex)
        outputIndex++
      }
    }
  }

  createOutputElement(x, y, width, height, index) {
    const outputEl = document.createElement("div")
    outputEl.className = "output-block"
    outputEl.style.position = "absolute"
    outputEl.style.left = x + "px"
    outputEl.style.top = y + "px"
    outputEl.style.width = width + "px"
    outputEl.style.height = height + "px"
    outputEl.style.border = "1px solid #333"
    outputEl.style.background = "transparent"
    outputEl.style.display = "flex"
    outputEl.style.flexDirection = "column"
    outputEl.style.color = "#333"
    outputEl.style.fontSize = "18px"
    outputEl.style.userSelect = "none"
    outputEl.style.zIndex = 1
    outputEl.style.overflow = "hidden"

    const header = document.createElement("div")
    header.style.padding = "6px"
    header.style.textAlign = "center"
    header.textContent = `Output ${index}`
    header.style.zIndex = 2
    header.style.position = "relative"

    const gridOverlay = document.createElement("div")
    gridOverlay.style.position = "absolute"
    gridOverlay.style.top = "0"
    gridOverlay.style.left = "0"
    gridOverlay.style.width = "100%"
    gridOverlay.style.height = "100%"
    gridOverlay.style.display = "grid"
    gridOverlay.style.gridTemplateColumns = "1fr 1fr"
    gridOverlay.style.gridTemplateRows = "1fr 1fr"
    gridOverlay.style.zIndex = 1

    for (let i = 0; i < 4; i++) {
      const cell = document.createElement("div")
      const row = Math.floor(i / 2)
      const col = i % 2
      const borders = []
      if (col === 0) borders.push("borderRight")
      if (row === 0) borders.push("borderBottom")
      cell.style.border = "none"
      borders.forEach((border) => {
        cell.style[border] = "1px dashed rgba(51, 51, 51, 0.5)"
      })
      gridOverlay.appendChild(cell)
    }

    outputEl.appendChild(header)
    outputEl.appendChild(gridOverlay)
    this.canvas.appendChild(outputEl)
  }

  redrawWindows() {
    const canvasW = this.canvas.clientWidth
    const canvasH = this.canvas.clientHeight

    if (canvasW === 0 || canvasH === 0) {
      return
    }

    const scaleX = canvasW / this.totalVirtualWidth
    const scaleY = canvasH / this.totalVirtualHeight

    this.windows.forEach((windowInfo) => {
      const windowEl = document.getElementById(windowInfo.id)
      if (windowEl) {
        const newLeft = windowInfo.virtualPosition.x * scaleX
        const newTop = windowInfo.virtualPosition.y * scaleY
        const newWidth = windowInfo.virtualSize.width * scaleX
        const newHeight = windowInfo.virtualSize.height * scaleY

        windowEl.style.left = newLeft + "px"
        windowEl.style.top = newTop + "px"
        windowEl.style.width = newWidth + "px"
        windowEl.style.height = newHeight + "px"

        this.updateWindowInfo(windowEl)
      }
    })
  }

  selectInput(inputNumber) {
    this.currentInput = `Input ${inputNumber}`
    this.highlightSelectedInput()
  }

  highlightSelectedInput() {
    document.querySelectorAll(".input-btn").forEach((btn) => {
      if (`Input ${btn.dataset.input}` === this.currentInput) {
        btn.classList.add("active")
      } else {
        btn.classList.remove("active")
      }
    })
  }

  setMode(mode) {
    this.currentMode = mode
    document.querySelectorAll(".tool-btn").forEach((btn) => {
      btn.classList.remove("active")
    })
    if (mode === "create") {
      document.getElementById("createMode").classList.add("active")
      this.canvas.style.cursor = "crosshair"
    } else {
      document.getElementById("selectMode").classList.add("active")
      this.canvas.style.cursor = "default"
    }
  }

  changeResolution(newResolution) {
    this.clearAllWindows()
    this.currentResolution = newResolution
  }

  startSelection(e) {
    this.isSelecting = true
    const rect = this.canvas.getBoundingClientRect()
    this.startX = e.clientX - rect.left
    this.startY = e.clientY - rect.top

    this.selectionBox.style.left = this.startX + "px"
    this.selectionBox.style.top = this.startY + "px"
    this.selectionBox.style.width = "0px"
    this.selectionBox.style.height = "0px"
    this.selectionBox.style.display = "block"
  }

  updateSelection(e) {
    const rect = this.canvas.getBoundingClientRect()
    const currentX = e.clientX - rect.left
    const currentY = e.clientY - rect.top

    const width = Math.abs(currentX - this.startX)
    const height = Math.abs(currentY - this.startY)
    const left = Math.min(currentX, this.startX)
    const top = Math.min(currentY, this.startY)

    this.selectionBox.style.left = left + "px"
    this.selectionBox.style.top = top + "px"
    this.selectionBox.style.width = width + "px"
    this.selectionBox.style.height = height + "px"
  }

  endSelection(e) {
    this.isSelecting = false
    this.selectionBox.style.display = "none"

    const rect = this.canvas.getBoundingClientRect()
    const endX = e.clientX - rect.left
    const endY = e.clientY - rect.top

    const width = Math.abs(endX - this.startX)
    const height = Math.abs(endY - this.startY)

    if (width > 50 && height > 50) {
      const left = Math.min(endX, this.startX)
      const top = Math.min(endY, this.startY)
      this.createWindow(left, top, width, height)
    }
  }

  createWindow(x, y, width, height) {
    const windowId = "window_" + Date.now()
    const input = this.currentInput

    const backgroundColor = this.inputs[input].color

    const windowEl = document.createElement("div")
    windowEl.className = "window"
    windowEl.id = windowId
    windowEl.style.left = x + "px"
    windowEl.style.top = y + "px"
    windowEl.style.width = width + "px"
    windowEl.style.height = height + "px"
    windowEl.style.background = backgroundColor
    windowEl.style.zIndex = 1000
    windowEl.dataset.input = input

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
      <div class="resize-handle"></div>
    `
    this.canvas.appendChild(windowEl)

    const windowInfo = {
      id: windowId,
      input: input,
      position: { x, y },
      size: { width, height },
      virtualPosition: calculateVirtualPosition(x, y, this.canvas, this.totalVirtualWidth, this.totalVirtualHeight),
      virtualSize: calculateVirtualSize(width, height, this.canvas, this.totalVirtualWidth, this.totalVirtualHeight),
    }

    this.windows.push(windowInfo)
    this.inputs[input].windows.push(windowInfo)

    this.updateGlobalWindowNumbers()
    this.makeDraggable(windowEl)
    this.makeResizable(windowEl)
    this.updateWindowInfo(windowEl)

    // No need for separate dragover/drop on windowEl, as canvas drop handles it now
  }

  makeDraggable(windowEl) {
    let isDragging = false
    let dragOffsetX = 0
    let dragOffsetY = 0

    windowEl.addEventListener("mousedown", (e) => {
      const isControlBtn = e.target.closest(".window-controls") || e.target.classList.contains("resize-handle")
      if (isControlBtn) return

      isDragging = true
      const rect = windowEl.getBoundingClientRect()
      dragOffsetX = e.clientX - rect.left
      dragOffsetY = e.clientY - rect.top

      windowEl.style.zIndex = 1000
    })

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return

      const canvasRect = this.canvas.getBoundingClientRect()
      const newX = e.clientX - canvasRect.left - dragOffsetX
      const newY = e.clientY - canvasRect.top - dragOffsetY

      windowEl.style.left = Math.max(0, Math.min(newX, this.canvas.clientWidth - windowEl.offsetWidth)) + "px"
      windowEl.style.top = Math.max(0, Math.min(newY, this.canvas.clientHeight - windowEl.offsetHeight)) + "px"
      this.updateWindowInfo(windowEl)
    })

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false
        windowEl.style.zIndex = "auto"
      }
    })
  }

  makeResizable(windowEl) {
    const resizeHandle = windowEl.querySelector(".resize-handle")
    let isResizing = false

    resizeHandle.addEventListener("mousedown", (e) => {
      isResizing = true
      e.stopPropagation()
    })

    document.addEventListener("mousemove", (e) => {
      if (!isResizing) return

      const windowRect = windowEl.getBoundingClientRect()

      const newWidth = e.clientX - windowRect.left
      const newHeight = e.clientY - windowRect.top

      const maxWidth = this.canvas.clientWidth - Number.parseFloat(windowEl.style.left)
      const maxHeight = this.canvas.clientHeight - Number.parseFloat(windowEl.style.top)

      const clampedWidth = Math.min(newWidth, maxWidth)
      const clampedHeight = Math.min(newHeight, maxHeight)

      if (clampedWidth > 150 && clampedHeight > 100) {
        windowEl.style.width = clampedWidth + "px"
        windowEl.style.height = clampedHeight + "px"
        this.updateWindowInfo(windowEl)
      }
    })

    document.addEventListener("mouseup", () => {
      isResizing = false
    })
  }

  maximizeWindow(windowId) {
    const windowEl = document.getElementById(windowId)
    if (!windowEl) return

    const windowRect = windowEl.getBoundingClientRect()
    const canvasRect = this.canvas.getBoundingClientRect()

    const outputs = Array.from(document.querySelectorAll(".output-block"))

    const intersectedQuadrants = []

    outputs.forEach((output) => {
      const outputRect = output.getBoundingClientRect()

      if (
        windowRect.right < outputRect.left ||
        windowRect.left > outputRect.right ||
        windowRect.bottom < outputRect.top ||
        windowRect.top > outputRect.bottom
      ) {
        return
      }

      const outputWidth = outputRect.width
      const outputHeight = outputRect.height
      const quadrantWidth = outputWidth / 2
      const quadrantHeight = outputHeight / 2

      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 2; col++) {
          const quadrantLeft = outputRect.left + col * quadrantWidth
          const quadrantTop = outputRect.top + row * quadrantHeight
          const quadrantRight = quadrantLeft + quadrantWidth
          const quadrantBottom = quadrantTop + quadrantHeight

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
            })
          }
        }
      }
    })

    if (intersectedQuadrants.length === 0) return

    const minLeft = Math.min(...intersectedQuadrants.map((q) => q.left))
    const minTop = Math.min(...intersectedQuadrants.map((q) => q.top))
    const maxRight = Math.max(...intersectedQuadrants.map((q) => q.right))
    const maxBottom = Math.max(...intersectedQuadrants.map((q) => q.bottom))

    const left = minLeft - canvasRect.left
    const top = minTop - canvasRect.top
    const width = maxRight - minLeft
    const height = maxBottom - minTop

    windowEl.style.left = left + "px"
    windowEl.style.top = top + "px"
    windowEl.style.width = width + "px"
    windowEl.style.height = height + "px"

    this.updateWindowInfo(windowEl)
  }

  closeWindow(windowId) {
    const windowEl = document.getElementById(windowId)
    if (windowEl) {
      const windowInfo = this.windows.find((w) => w.id === windowId)
      if (windowInfo) {
        // Remove from global windows array
        this.windows = this.windows.filter((w) => w.id !== windowId)

        // Remove from specific input's windows array
        this.inputs[windowInfo.input].windows = this.inputs[windowInfo.input].windows.filter((w) => w.id !== windowId)
      }

      windowEl.remove()
      this.updateGlobalWindowNumbers()
    }
  }

  clearAllWindows() {
    this.windows.forEach((windowInfo) => {
      const windowEl = document.getElementById(windowInfo.id)
      if (windowEl) windowEl.remove()
    })
    this.windows = []

    document.querySelectorAll(".output-block").forEach((el) => el.remove())

    for (const input in this.inputs) {
      this.inputs[input].windows = []
    }

    this.updateGlobalWindowNumbers()
  }

  updateGlobalWindowNumbers() {
    this.windows.forEach((windowInfo, index) => {
      windowInfo.number = index + 1
      const windowEl = document.getElementById(windowInfo.id)
      if (windowEl) {
        windowEl.querySelector(".resize-handle").textContent = windowInfo.number
      }
    })
  }

  rescaleWindow(windowEl, oldRes, newRes) {
    const oldVirtual = VIRTUAL_RESOLUTIONS[oldRes]
    const newVirtual = VIRTUAL_RESOLUTIONS[newRes]

    const scaleX = newVirtual.width / oldVirtual.width
    const scaleY = newVirtual.height / oldVirtual.height

    const currentLeft = Number.parseFloat(windowEl.style.left)
    const currentTop = Number.parseFloat(windowEl.style.top)
    const currentWidth = Number.parseFloat(windowEl.style.width)
    const currentHeight = Number.parseFloat(windowEl.style.height)

    windowEl.style.left = currentLeft * scaleX + "px"
    windowEl.style.top = currentTop * scaleY + "px"
    windowEl.style.width = currentWidth * scaleX + "px"
    windowEl.style.height = currentHeight * scaleY + "px"

    this.updateWindowInfo(windowEl)
  }

  updateWindowInfo(windowEl) {
    const infoEl = windowEl.querySelector(".window-info")
    if (!infoEl) return

    const windowLeft = Number.parseFloat(windowEl.style.left)
    const windowTop = Number.parseFloat(windowEl.style.top)
    const windowWidth = Number.parseFloat(windowEl.style.width)
    const windowHeight = Number.parseFloat(windowEl.style.height)

    const virtualPosition = calculateVirtualPosition(
      windowLeft,
      windowTop,
      this.canvas,
      this.totalVirtualWidth,
      this.totalVirtualHeight,
    )
    const virtualSize = calculateVirtualSize(
      windowWidth,
      windowHeight,
      this.canvas,
      this.totalVirtualWidth,
      this.totalVirtualHeight,
    )

    const windowId = windowEl.id
    const windowInfo = this.windows.find((w) => w.id === windowId)
    if (windowInfo) {
      windowInfo.position = { x: windowLeft, y: windowTop }
      windowInfo.size = { width: windowWidth, height: windowHeight }
      windowInfo.virtualPosition = virtualPosition
      windowInfo.virtualSize = virtualSize
    }

    infoEl.innerHTML = `
      <div>Pos: ${virtualPosition.x}, ${virtualPosition.y}</div>
      <div>Size: ${virtualSize.width}×${virtualSize.height}</div>
    `
  }
}
