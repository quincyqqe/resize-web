let isSystemSettingsUnlocked = false;

export function initTabs() {
  const tabs = document.querySelectorAll(".tab");
  const contents = document.querySelectorAll(".tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetTab = tab.dataset.tab;

      if (targetTab === "system-settings" && !isSystemSettingsUnlocked) {
        const password = prompt("Enter password to access System Settings:");

        if (password === null) {
          return;
        }

        // Set here your custom password
        if (password !== "admin") {
          alert("Incorrect password!");
          return;
        }

        isSystemSettingsUnlocked = true;
      }

      tabs.forEach((t) => t.classList.remove("active"));
      contents.forEach((c) => c.classList.remove("active"));

      tab.classList.add("active");
      const activeTabContent = document.getElementById(targetTab);
      activeTabContent.classList.add("active");

      document.dispatchEvent(
        new CustomEvent("tabActivated", { detail: targetTab })
      );
    });
  });
}
