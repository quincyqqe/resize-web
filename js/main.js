import { initTabs } from "./tabs.js"
import { WindowCreator } from "./window-creator.js"
import { MAX_OUTPUTS, VIRTUAL_RESOLUTIONS } from "./constants.js"
import { loadConfig, saveConfig } from "./utils.js"

document.addEventListener("DOMContentLoaded", () => {
  initTabs()

  const windowCreator = new WindowCreator()
  window.windowCreator = windowCreator

  const resolutionSelect = document.getElementById("virtualSize")
  const rowsInput = document.getElementById("wallRows")
  const colsInput = document.getElementById("wallCols")

  const openModalBtn = document.getElementById("openVideoWallModal")
  const modal = document.getElementById("videoWallModal")
  const closeModalBtn = document.getElementById("closeVideoWallModal")
  const applyBtn = document.getElementById("applySettings")

  let lastValidRows = 1
  let lastValidCols = 1
  let lastValidResolutionKey = "4k"

  openModalBtn.addEventListener("click", () => {
    modal.classList.remove("hidden")
  })

  closeModalBtn.addEventListener("click", () => {
    modal.classList.add("hidden")
  })

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden")
    }
  })

  applyBtn.addEventListener("click", () => {
    const isValid = updateWallConfiguration()
    if (!isValid) {
      alert(`Too many outputs. Max allowed is ${MAX_OUTPUTS}.`)
      return
    }

    saveConfig("videoWallConfig", {
      resolution: resolutionSelect.value,
      rows: rowsInput.value,
      cols: colsInput.value,
    })

    updateCanvasDisplaySize()
    modal.classList.add("hidden")

    if (document.querySelector(".tab.active").dataset.tab === "video-wall") {
      windowCreator.redrawWallOutputs()
      windowCreator.redrawWindows()
    }
  })

  function updateCanvasDisplaySize() {
    const resKey = lastValidResolutionKey
    const resolution = VIRTUAL_RESOLUTIONS[resKey]
    const rows = lastValidRows
    const cols = lastValidCols

    const totalVirtualWidth = cols * resolution.width
    const totalVirtualHeight = rows * resolution.height

    const canvas = windowCreator.canvas
    const container = canvas.parentElement
    const containerStyles = window.getComputedStyle(canvas)
    const paddingLeft = Number.parseInt(containerStyles.paddingLeft) || 0
    const paddingRight = Number.parseInt(containerStyles.paddingRight) || 0
    const paddingTop = Number.parseInt(containerStyles.paddingTop) || 0
    const paddingBottom = Number.parseInt(containerStyles.paddingBottom) || 0

    const containerWidth = container.clientWidth - paddingLeft - paddingRight
    const containerHeight = container.clientHeight - paddingTop - paddingBottom

    const aspectRatio = totalVirtualWidth / totalVirtualHeight
    const containerRatio = containerWidth / containerHeight

    let finalWidth, finalHeight

    if (aspectRatio > containerRatio) {
      finalWidth = containerWidth
      finalHeight = containerWidth / aspectRatio
    } else {
      finalHeight = containerHeight
      finalWidth = containerHeight * aspectRatio
    }

    canvas.style.width = `${finalWidth}px`
    canvas.style.height = `${finalHeight}px`
  }

  function updateWallConfiguration() {
    const resKey = resolutionSelect.value
    const resolution = VIRTUAL_RESOLUTIONS[resKey]
    const rows = Number.parseInt(rowsInput.value)
    const cols = Number.parseInt(colsInput.value)
    const totalOutputs = rows * cols

    if (totalOutputs > MAX_OUTPUTS) {
      return false
    }

    const totalVirtualWidth = cols * resolution.width
    const totalVirtualHeight = rows * resolution.height

    windowCreator.setVirtualSize(totalVirtualWidth, totalVirtualHeight)
    windowCreator.setWallConfig(rows, cols, resolution.width, resolution.height)

    lastValidRows = rows
    lastValidCols = cols
    lastValidResolutionKey = resKey

    return true
  }

  function loadSavedWallConfig() {
    const saved = loadConfig("videoWallConfig")
    if (!saved) return

    resolutionSelect.value = saved.resolution || "4k"
    rowsInput.value = saved.rows || "1"
    colsInput.value = saved.cols || "1"
  }

  loadSavedWallConfig()
  updateWallConfiguration()

  document.addEventListener("tabActivated", (e) => {
    if (e.detail === "video-wall") {
      updateCanvasDisplaySize()
      windowCreator.redrawWallOutputs()
      windowCreator.redrawWindows()
    } else if (e.detail === "system-settings") {
      updateWallConfiguration()
    }
  })

  document.dispatchEvent(new CustomEvent("tabActivated", { detail: "video-wall" }))

  document.getElementById("clearAll").addEventListener("click", () => {
    windowCreator.clearAllWindows()
    if (document.querySelector(".tab.active").dataset.tab === "video-wall") {
      windowCreator.redrawWallOutputs()
      windowCreator.redrawWindows()
    }
  })
})
