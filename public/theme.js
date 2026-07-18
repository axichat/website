(function () {
  "use strict";

  var storageKey = "axichat-theme";
  var root = document.documentElement;
  var supportsSelectors = typeof document.querySelector === "function" && typeof document.querySelectorAll === "function";
  var darkStyles = supportsSelectors ? document.querySelector("link[data-dark-styles]") : null;

  function readStoredTheme() {
    try {
      var value = window.localStorage.getItem(storageKey);
      return value === "light" || value === "dark" ? value : null;
    } catch (error) {
      return null;
    }
  }

  function writeStoredTheme(theme) {
    try {
      window.localStorage.setItem(storageKey, theme);
    } catch (error) {
      // The active theme still applies when storage is unavailable.
    }
  }

  function updateControls(theme, reveal) {
    var controls = supportsSelectors ? document.querySelectorAll("[data-theme-toggle]") : [];
    var nextTheme = theme === "dark" ? "light" : "dark";
    var index;

    for (index = 0; index < controls.length; index += 1) {
      var control = controls[index];
      control.setAttribute("aria-label", "Dark mode");
      control.setAttribute("aria-checked", theme === "dark" ? "true" : "false");
      control.setAttribute("title", "Switch to " + nextTheme + " mode");
      var label = typeof control.querySelector === "function" ? control.querySelector("[data-theme-toggle-label]") : null;
      if (label) {
        if ("textContent" in label) {
          label.textContent = "Dark mode";
        } else {
          label.innerText = "Dark mode";
        }
      }
      if (reveal) {
        control.removeAttribute("hidden");
      }
    }
  }

  function applyTheme(theme, revealControls) {
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme;
    if (darkStyles) {
      darkStyles.setAttribute("media", theme === "dark" ? "all" : "not all");
    }
    var themeColors = supportsSelectors ? document.querySelectorAll("meta[data-theme-color]") : [];
    var index;
    for (index = 0; index < themeColors.length; index += 1) {
      var themeColor = themeColors[index];
      themeColor.setAttribute("media", themeColor.getAttribute("data-theme-color") === theme ? "all" : "not all");
    }
    updateControls(theme, revealControls);
  }

  function toggleTheme() {
    var nextTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    writeStoredTheme(nextTheme);
    applyTheme(nextTheme, true);
  }

  function bindControls() {
    var controls = supportsSelectors ? document.querySelectorAll("[data-theme-toggle]") : [];
    var index;
    updateControls(root.getAttribute("data-theme"), true);
    for (index = 0; index < controls.length; index += 1) {
      if (typeof controls[index].addEventListener === "function") {
        controls[index].addEventListener("click", toggleTheme);
      } else if (typeof controls[index].attachEvent === "function") {
        controls[index].attachEvent("onclick", toggleTheme);
      }
    }
  }

  function handleStorage(event) {
    if (event.key === storageKey) {
      applyTheme(readStoredTheme() || "light", true);
    }
  }

  applyTheme(readStoredTheme() || "light", false);

  if (document.readyState === "loading") {
    if (typeof document.addEventListener === "function") {
      document.addEventListener("DOMContentLoaded", bindControls);
    } else if (typeof window.attachEvent === "function") {
      window.attachEvent("onload", bindControls);
    }
  } else {
    bindControls();
  }

  if (typeof window.addEventListener === "function") {
    window.addEventListener("storage", handleStorage);
  } else if (typeof window.attachEvent === "function") {
    window.attachEvent("onstorage", handleStorage);
  }

})();
