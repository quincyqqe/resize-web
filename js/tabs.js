import { SYSTEM_SETTINGS_PASSWORD } from "./constants.js"

let isSystemSettingsUnlocked = false

export function initTabs() {
  const tabs = document.querySelectorAll(".tab")
  const contents = document.querySelectorAll(".tab-content")

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetTab = tab.dataset.tab

      if (targetTab === "system-settings" && !isSystemSettingsUnlocked) {
        const password = prompt("Enter password to access System Settings:")
        if (password === null) {
          return
        }
        if (password !== SYSTEM_SETTINGS_PASSWORD) {
          alert("Incorrect password!")
          return
        }
        isSystemSettingsUnlocked = true
      }

      tabs.forEach((t) => t.classList.remove("active"))
      contents.forEach((c) => c.classList.remove("active"))

      tab.classList.add("active")
      const activeTabContent = document.getElementById(targetTab)
      activeTabContent.classList.add("active")

      document.dispatchEvent(new CustomEvent("tabActivated", { detail: targetTab }))
    })
  })
}
