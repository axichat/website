const releaseApiUrl = "https://api.github.com/repos/axichat/axichat/releases/latest";
const releaseCacheStorageKey = "axichat.latest-release.v2";
const releaseCacheTtlMs = 5 * 60 * 1000;
const repositoryApiUrl = "https://api.github.com/repos/axichat/axichat";
const githubStarCacheStorageKey = "axichat.github-stars.v1";
const githubStarCacheTtlMs = 6 * 60 * 60 * 1000;
const appStoreBundleId = "im.axi.axichat";
const appStoreLookupUrl = `https://itunes.apple.com/lookup?bundleId=${encodeURIComponent(appStoreBundleId)}&country=us`;
const appStoreLookupTimeoutMs = 8000;
const serverStatusUrl = "https://axi.im:8443/status";
const serverStatusRefreshMs = 30000;
const serverStatusTimeoutMs = 10000;
const serverStatusClientToken = "axichatpublictoken";

type ServiceIndicatorState = "online" | "offline" | "unknown";

type ReleaseAsset = {
  name: string;
  browser_download_url?: string;
};

type ReleaseCacheRecord = {
  version: string;
  publishedAt: string;
  fetchedAt: number;
  assets: ReleaseAsset[];
};

type GitHubStarCacheRecord = {
  count: number;
  fetchedAt: number;
};

type AppStoreLookupResult = {
  bundleId?: string;
  trackViewUrl?: string;
  wrapperType?: string;
  kind?: string;
};

type AppStoreLookupResponse = {
  resultCount?: number;
  results?: AppStoreLookupResult[];
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
    Number.isFinite(entry.fetchedAt) &&
    Array.isArray(entry.assets)
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

function findReleaseAsset(assets: ReleaseAsset[], names: string[]) {
  const wantedNames = new Set(names.map((name) => name.toLowerCase()));
  return assets.find((asset) => wantedNames.has(asset.name.toLowerCase()) && asset.browser_download_url);
}

function updateHeroWindowsDownload(assets: ReleaseAsset[]) {
  const button = document.getElementById("hero-windows-download") as HTMLAnchorElement | null;
  const format = document.getElementById("hero-windows-download-format");
  if (!button || !format) {
    return;
  }

  const installer = findReleaseAsset(assets, ["axichat-windows-setup.exe"]);
  const zip = findReleaseAsset(assets, ["axichat-windows.zip"]);
  const asset = installer ?? zip;
  if (!asset?.browser_download_url) {
    return;
  }

  button.href = asset.browser_download_url;
  format.textContent = installer ? "EXE" : "ZIP";
}

async function loadLatestRelease() {
  const cached = readReleaseCache();
  if (cached) {
    showRelease(cached.version, cached.publishedAt);
    updateHeroWindowsDownload(cached.assets);
    if (Date.now() - cached.fetchedAt <= releaseCacheTtlMs) {
      return;
    }
  }
  try {
    const response = await fetch(releaseApiUrl, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) {
      throw new Error(`release_lookup_${response.status}`);
    }
    const payload = (await response.json()) as {
      tag_name?: string;
      name?: string;
      published_at?: string;
      assets?: ReleaseAsset[];
    };
    const entry: ReleaseCacheRecord = {
      version: (payload.tag_name ?? payload.name ?? "").trim() || "unavailable",
      publishedAt: payload.published_at ?? "",
      assets: Array.isArray(payload.assets) ? payload.assets : [],
      fetchedAt: Date.now(),
    };
    writeReleaseCache(entry);
    showRelease(entry.version, entry.publishedAt);
    updateHeroWindowsDownload(entry.assets);
  } catch {
    if (!cached) {
      showRelease("unavailable", "");
    }
  }
}

function findAppStoreUrl(payload: AppStoreLookupResponse) {
  if (!payload.results?.length || payload.resultCount === 0) {
    return "";
  }
  const result = payload.results.find((entry) => {
    const isExpectedBundle = entry.bundleId === appStoreBundleId;
    const isSoftware = entry.wrapperType === "software" || entry.kind === "software";
    return isExpectedBundle && isSoftware && typeof entry.trackViewUrl === "string";
  });
  return result?.trackViewUrl ?? "";
}

function showAppStoreBadges(url: string) {
  document.querySelectorAll<HTMLAnchorElement>("[data-app-store-badge]").forEach((badge) => {
    badge.href = url;
    badge.hidden = false;
  });
}

function loadAppStoreBadge() {
  const callbackName = `__axichatAppStoreLookup_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const script = document.createElement("script");
  let settled = false;

  const cleanup = () => {
    if (settled) {
      return;
    }
    settled = true;
    window.clearTimeout(timeoutId);
    script.remove();
    delete (window as unknown as Record<string, unknown>)[callbackName];
  };

  const timeoutId = window.setTimeout(cleanup, appStoreLookupTimeoutMs);
  (window as unknown as Record<string, (payload: AppStoreLookupResponse) => void>)[callbackName] = (payload) => {
    const appStoreUrl = findAppStoreUrl(payload);
    cleanup();
    if (appStoreUrl) {
      showAppStoreBadges(appStoreUrl);
    }
  };
  script.onerror = cleanup;
  script.src = `${appStoreLookupUrl}&callback=${encodeURIComponent(callbackName)}`;
  document.head.appendChild(script);
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

void loadLatestRelease();
void loadGitHubStarCount();
loadAppStoreBadge();
setUpMobileNavigation();
setUpHeroVideo();
setUpServerStatus();
setFooterYear();
