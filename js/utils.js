export function calculateVirtualPosition(x, y, canvas, totalVirtualWidth, totalVirtualHeight) {
  const scaleX = totalVirtualWidth / canvas.clientWidth
  const scaleY = totalVirtualHeight / canvas.clientHeight
  return {
    x: Math.round(x * scaleX),
    y: Math.round(y * scaleY),
  }
}

export function calculateVirtualSize(width, height, canvas, totalVirtualWidth, totalVirtualHeight) {
  const scaleX = totalVirtualWidth / canvas.clientWidth
  const scaleY = totalVirtualHeight / canvas.clientHeight
  return {
    width: Math.round(width * scaleX),
    height: Math.round(height * scaleY),
  }
}

export function getOutputAtPosition(x, y, canvas) {
  const outputs = document.querySelectorAll(".output-block")
  for (const output of outputs) {
    const outputRect = output.getBoundingClientRect()
    const canvasRect = canvas.getBoundingClientRect()

    const outputX = outputRect.left - canvasRect.left
    const outputY = outputRect.top - canvasRect.top
    const outputWidth = outputRect.width
    const outputHeight = outputRect.height

    if (x >= outputX && x <= outputX + outputWidth && y >= outputY && y <= outputY + outputHeight) {
      return output
    }
  }
  return null
}

export function loadConfig(key) {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : null
  } catch (e) {
    console.error("Error loading config from localStorage", e)
    return null
  }
}

export function saveConfig(key, config) {
  try {
    localStorage.setItem(key, JSON.stringify(config))
  } catch (e) {
    console.error("Error saving config to localStorage", e)
  }
}
