import "./index.css";

const releaseCacheStorageKey = "axichat.latest-release.v1";
const releaseCacheTtlMs = 5 * 60 * 1000;

type ReleaseCacheRecord = {
  version: string;
  publishedAt: string;
  fetchedAt: number;
};

function isReleaseCacheRecord(value: unknown): value is ReleaseCacheRecord {
  if (!value || typeof value !== "object") {
    return false;
  }
  const entry = value as Partial<ReleaseCacheRecord>;
  return (
    typeof entry.version === "string" &&
    typeof entry.publishedAt === "string" &&
    typeof entry.fetchedAt === "number" &&
    Number.isFinite(entry.fetchedAt)
  );
}

function readReleaseCache(): ReleaseCacheRecord | null {
  try {
    const rawValue = window.localStorage.getItem(releaseCacheStorageKey);
    if (!rawValue) {
      return null;
    }
    const parsed = JSON.parse(rawValue) as unknown;
    return isReleaseCacheRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeReleaseCache(entry: ReleaseCacheRecord) {
  try {
    window.localStorage.setItem(releaseCacheStorageKey, JSON.stringify(entry));
  } catch {
    return;
  }
}

function formatReleaseDate(value: string) {
  if (!value) {
    return "";
  }
  const releasedAt = new Date(value);
  if (Number.isNaN(releasedAt.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(releasedAt);
}

function showRelease(version: string, publishedAt: string) {
  const versionEl = document.getElementById("latest-version");
  const dateEl = document.getElementById("latest-release-date");
  if (versionEl) {
    versionEl.textContent = version || "unavailable";
  }
  const formatted = formatReleaseDate(publishedAt);
  if (dateEl) {
    dateEl.textContent = formatted ? `Released ${formatted}` : "";
    dateEl.hidden = !formatted;
  }
}

async function loadLatestRelease() {
  const cached = readReleaseCache();
  if (cached) {
    showRelease(cached.version, cached.publishedAt);
    if (Date.now() - cached.fetchedAt <= releaseCacheTtlMs) {
      return;
    }
  }
  try {
    const response = await fetch("https://api.github.com/repos/axichat/axichat/releases/latest", {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) {
      throw new Error(`release_lookup_${response.status}`);
    }
    const payload = (await response.json()) as { tag_name?: string; name?: string; published_at?: string };
    const entry: ReleaseCacheRecord = {
      version: (payload.tag_name ?? payload.name ?? "").trim() || "unavailable",
      publishedAt: payload.published_at ?? "",
      fetchedAt: Date.now(),
    };
    writeReleaseCache(entry);
    showRelease(entry.version, entry.publishedAt);
  } catch {
    if (!cached) {
      showRelease("unavailable", "");
    }
  }
}

function setUpMobileMenu() {
  const toggle = document.getElementById("menu-toggle");
  const panel = document.getElementById("mobile-menu");
  const openIcon = document.getElementById("menu-icon-open");
  const closedIcon = document.getElementById("menu-icon-closed");
  if (!toggle || !panel || !openIcon || !closedIcon) {
    return;
  }
  const openClasses = ["max-h-[32rem]", "border-t", "border-black/10", "py-4", "opacity-100"];
  const closedClasses = ["max-h-0", "py-0", "opacity-0"];
  const setOpen = (open: boolean) => {
    panel.classList.remove(...(open ? closedClasses : openClasses));
    panel.classList.add(...(open ? openClasses : closedClasses));
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    openIcon.classList.toggle("hidden", !open);
    closedIcon.classList.toggle("hidden", open);
  };
  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });
  panel.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });
  window.addEventListener("hashchange", () => setOpen(false));
}

function setUpHeroVideo() {
  const video = document.getElementById("hero-video") as HTMLVideoElement | null;
  const playButton = document.getElementById("hero-video-play");
  if (!video || !playButton) {
    return;
  }
  const tryPlay = () => {
    if (!video.paused) {
      playButton.hidden = true;
      return;
    }
    video.play().then(
      () => {
        playButton.hidden = true;
      },
      (error: unknown) => {
        const errorName = typeof error === "object" && error && "name" in error ? String((error as { name?: unknown }).name) : "";
        if (errorName === "NotAllowedError") {
          playButton.hidden = false;
        }
      }
    );
  };
  video.addEventListener("canplay", tryPlay);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      tryPlay();
    }
  });
  playButton.addEventListener("click", tryPlay);
  tryPlay();
}

function setFooterYear() {
  const yearEl = document.getElementById("footer-year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
}

void loadLatestRelease();
setUpMobileMenu();
setUpHeroVideo();
setFooterYear();
