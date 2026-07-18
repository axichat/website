const releaseApiUrl = "https://api.github.com/repos/axichat/axichat/releases/latest";
const releaseCacheStorageKey = "axichat.latest-release.v2";
const releaseCacheTtlMs = 5 * 60 * 1000;
const appStoreBundleId = "im.axi.axichat";
const appStoreLookupUrl = `https://itunes.apple.com/lookup?bundleId=${encodeURIComponent(appStoreBundleId)}&country=us`;
const appStoreLookupTimeoutMs = 8000;

type ReleaseAsset = {
  name: string;
  browser_download_url?: string;
};

export type ReleaseInfo = {
  version: string;
  publishedAt: string;
  fetchedAt: number;
  assets: ReleaseAsset[];
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

type DownloadGridOptions = {
  onRelease?: (release: ReleaseInfo) => void;
  onReleaseUnavailable?: () => void;
};

function isReleaseInfo(value: unknown): value is ReleaseInfo {
  if (!value || typeof value !== "object") {
    return false;
  }
  const entry = value as Partial<ReleaseInfo>;
  return (
    typeof entry.version === "string" &&
    typeof entry.publishedAt === "string" &&
    typeof entry.fetchedAt === "number" &&
    Number.isFinite(entry.fetchedAt) &&
    Array.isArray(entry.assets)
  );
}

function readReleaseCache(): ReleaseInfo | null {
  try {
    const rawValue = window.localStorage.getItem(releaseCacheStorageKey);
    if (!rawValue) {
      return null;
    }
    const parsed = JSON.parse(rawValue) as unknown;
    return isReleaseInfo(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeReleaseCache(entry: ReleaseInfo) {
  try {
    window.localStorage.setItem(releaseCacheStorageKey, JSON.stringify(entry));
  } catch {
    return;
  }
}

function findReleaseAsset(assets: ReleaseAsset[], names: string[]) {
  const wantedNames = new Set(names.map((name) => name.toLowerCase()));
  return assets.find((asset) => wantedNames.has(asset.name.toLowerCase()) && asset.browser_download_url);
}

function updateWindowsDownload(root: ParentNode, assets: ReleaseAsset[]) {
  const button = root.querySelector<HTMLAnchorElement>("#hero-windows-download");
  const image = root.querySelector<HTMLImageElement>("#hero-windows-download-image");
  if (!button || !image) {
    return;
  }

  const installer = findReleaseAsset(assets, ["axichat-windows-setup.exe"]);
  const zip = findReleaseAsset(assets, ["axichat-windows.zip"]);
  const asset = installer ?? zip;
  if (!asset?.browser_download_url) {
    return;
  }

  button.href = asset.browser_download_url;
  const format = installer ? "EXE" : "ZIP";
  const imageSource = installer ? image.dataset.exeSrc : image.dataset.zipSrc;
  if (imageSource) {
    image.src = imageSource;
  }
  image.alt = `Download the Windows ${format}`;
}

function applyRelease(root: ParentNode, options: DownloadGridOptions, release: ReleaseInfo) {
  updateWindowsDownload(root, release.assets);
  options.onRelease?.(release);
}

async function loadLatestRelease(root: ParentNode, options: DownloadGridOptions) {
  const cached = readReleaseCache();
  if (cached) {
    applyRelease(root, options, cached);
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
    const entry: ReleaseInfo = {
      version: (payload.tag_name ?? payload.name ?? "").trim() || "unavailable",
      publishedAt: payload.published_at ?? "",
      assets: Array.isArray(payload.assets) ? payload.assets : [],
      fetchedAt: Date.now(),
    };
    writeReleaseCache(entry);
    applyRelease(root, options, entry);
  } catch {
    if (!cached) {
      options.onReleaseUnavailable?.();
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

function showAppStoreBadges(root: ParentNode, url: string) {
  root.querySelectorAll<HTMLAnchorElement>("[data-app-store-badge]").forEach((badge) => {
    badge.href = url;
    badge.hidden = false;
  });
  root.querySelectorAll<HTMLElement>("[data-app-store-placeholder]").forEach((placeholder) => {
    placeholder.hidden = true;
  });
}

function loadAppStoreBadge(root: ParentNode) {
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
      showAppStoreBadges(root, appStoreUrl);
    }
  };
  script.onerror = cleanup;
  script.src = `${appStoreLookupUrl}&callback=${encodeURIComponent(callbackName)}`;
  document.head.appendChild(script);
}

export function setUpDownloadGrid(root: ParentNode, options: DownloadGridOptions = {}) {
  void loadLatestRelease(root, options);
  loadAppStoreBadge(root);
}
