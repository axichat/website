import { setUpDownloadGrid } from "./downloads";

const repositoryApiUrl = "https://api.github.com/repos/axichat/axichat";
const githubStarCacheStorageKey = "axichat.github-stars.v1";
const githubStarCacheTtlMs = 6 * 60 * 60 * 1000;
const serverStatusUrl = "https://axi.im:8443/status";
const serverStatusRefreshMs = 30000;
const serverStatusTimeoutMs = 10000;
const serverStatusClientToken = "axichatpublictoken";

type ServiceIndicatorState = "online" | "offline" | "unknown";

type GitHubStarCacheRecord = {
  count: number;
  fetchedAt: number;
};

function isGitHubStarCacheRecord(value: unknown): value is GitHubStarCacheRecord {
  if (!value || typeof value !== "object") {
    return false;
  }
  const entry = value as Partial<GitHubStarCacheRecord>;
  return (
    typeof entry.count === "number" &&
    Number.isInteger(entry.count) &&
    entry.count >= 0 &&
    typeof entry.fetchedAt === "number" &&
    Number.isFinite(entry.fetchedAt)
  );
}

function readGitHubStarCache(): GitHubStarCacheRecord | null {
  try {
    const rawValue = window.localStorage.getItem(githubStarCacheStorageKey);
    if (!rawValue) {
      return null;
    }
    const parsed = JSON.parse(rawValue) as unknown;
    return isGitHubStarCacheRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeGitHubStarCache(entry: GitHubStarCacheRecord) {
  try {
    window.localStorage.setItem(githubStarCacheStorageKey, JSON.stringify(entry));
  } catch {
    return;
  }
}

function formatGitHubStarCount(count: number) {
  try {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(count);
  } catch {
    return count.toLocaleString("en-US");
  }
}

function showGitHubStarCount(count: number) {
  const link = document.getElementById("github-link");
  const container = document.getElementById("github-star-count");
  const value = document.getElementById("github-star-count-value");
  if (!link || !container || !value) {
    return;
  }
  value.textContent = formatGitHubStarCount(count);
  container.setAttribute("data-visible", "true");
  link.setAttribute("aria-label", `Open Axichat on GitHub, ${count.toLocaleString("en-US")} stars`);
}

async function loadGitHubStarCount() {
  const cached = readGitHubStarCache();
  if (cached) {
    showGitHubStarCount(cached.count);
    if (Date.now() - cached.fetchedAt <= githubStarCacheTtlMs) {
      return;
    }
  }
  try {
    const response = await fetch(repositoryApiUrl, {
      cache: "no-store",
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) {
      return;
    }
    const payload = (await response.json()) as { stargazers_count?: unknown };
    if (typeof payload.stargazers_count !== "number" || !Number.isInteger(payload.stargazers_count)) {
      return;
    }
    const entry = { count: payload.stargazers_count, fetchedAt: Date.now() };
    writeGitHubStarCache(entry);
    showGitHubStarCount(entry.count);
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
  const parts = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).formatToParts(releasedAt);
  const day = parts.find((part) => part.type === "day")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const year = parts.find((part) => part.type === "year")?.value;
  return day && month && year ? `${day} ${month} ${year}` : "";
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

function setUpHeroVideo() {
  const video = document.getElementById("hero-video") as HTMLVideoElement | null;
  const playButton = document.getElementById("hero-video-play");
  if (!video || !playButton) {
    return;
  }
  const tryPlay = () => {
    if (!video.paused) {
      video.controls = false;
      playButton.hidden = true;
      return;
    }
    let playResult: Promise<void> | undefined;
    try {
      playResult = video.play();
    } catch {
      video.controls = true;
      playButton.hidden = false;
      return;
    }
    if (!playResult || typeof playResult.then !== "function") {
      return;
    }
    playResult.then(
      () => {
        video.controls = false;
        playButton.hidden = true;
      },
      (error: unknown) => {
        const errorName = typeof error === "object" && error && "name" in error ? String((error as { name?: unknown }).name) : "";
        if (errorName === "NotAllowedError") {
          video.controls = true;
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

function setUpMobileNavigation() {
  const navigation = document.getElementById("mobile-navigation") as HTMLDetailsElement | null;
  if (!navigation) {
    return;
  }
  document.addEventListener("click", (event) => {
    if (navigation.open && event.target instanceof Node && !navigation.contains(event.target)) {
      navigation.open = false;
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      navigation.open = false;
    }
  });
  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navigation.open = false;
    });
  });
}

function toIndicatorState(value: unknown): ServiceIndicatorState {
  return value === "online" || value === "offline" ? value : "unknown";
}

function showServerStatus(service: "email" | "chat", status: ServiceIndicatorState) {
  const dot = document.getElementById(`${service}-status-dot`);
  const label = document.getElementById(`${service}-status-label`);
  if (!dot || !label) {
    return;
  }
  dot.classList.remove("bg-emerald-500", "bg-rose-500", "bg-amber-400");
  dot.classList.add(status === "online" ? "bg-emerald-500" : status === "offline" ? "bg-rose-500" : "bg-amber-400");
  label.textContent = status === "online" ? "Online" : status === "offline" ? "Offline" : "Unknown";
}

function setUpServerStatus() {
  let controller: AbortController | null = null;
  let timeoutId = 0;

  const load = async () => {
    controller?.abort();
    controller = typeof AbortController === "function" ? new AbortController() : null;
    if (controller) {
      timeoutId = window.setTimeout(() => controller?.abort(), serverStatusTimeoutMs);
    }
    try {
      const response = await fetch(serverStatusUrl, {
        headers: {
          Accept: "application/json",
          "X-Client-Token": serverStatusClientToken,
        },
        signal: controller?.signal,
      });
      if (response.status !== 200 && response.status !== 503) {
        throw new Error(`status_lookup_${response.status}`);
      }
      const payload = (await response.json()) as { stalwart?: unknown; ejabberd?: unknown };
      showServerStatus("email", toIndicatorState(payload.stalwart));
      showServerStatus("chat", toIndicatorState(payload.ejabberd));
    } catch {
      showServerStatus("email", "unknown");
      showServerStatus("chat", "unknown");
    } finally {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
        timeoutId = 0;
      }
    }
  };

  void load();
  window.setInterval(() => void load(), serverStatusRefreshMs);
}

function setFooterYear() {
  const yearEl = document.getElementById("footer-year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
}

setUpDownloadGrid(document, {
  onRelease: (release) => showRelease(release.version, release.publishedAt),
  onReleaseUnavailable: () => showRelease("unavailable", ""),
});
void loadGitHubStarCount();
setUpMobileNavigation();
setUpHeroVideo();
setUpServerStatus();
setFooterYear();
