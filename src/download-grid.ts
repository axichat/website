export const downloadGridTemplate = `
  <div
    id="hero-downloads"
    class="mx-auto mt-3 inline-grid grid-cols-1 items-center justify-items-center gap-3 sm:grid-cols-2 lg:grid-cols-3"
    role="group"
    aria-label="Download Axichat"
  >
    <a
      href="https://play.google.com/store/apps/details?id=im.axi.axichat"
      target="_blank"
      rel="noreferrer"
      class="order-2 inline-block max-w-full transition focus:outline-none focus:ring-2 focus:ring-black/25"
      style="width: 209px"
    >
      <img src="%BASE_URL%images/platforms/google-play-badge.svg" alt="Get it on Google Play" class="block h-auto w-full max-w-full" />
    </a>

    <a
      id="hero-app-store-badge"
      data-app-store-badge
      href="https://apps.apple.com/"
      target="_blank"
      rel="noreferrer"
      class="order-1 inline-block max-w-full transition focus:outline-none focus:ring-2 focus:ring-black/25"
      style="width: 186px; height: 62px"
      hidden
    >
      <img
        src="https://toolbox.marketingtools.apple.com/api/v2/badges/download-on-the-app-store/black/en-us?releaseDate=1601424000&amp;kind=iossoftware&amp;bubble=ios_apps"
        alt="Download on the App Store"
        class="block h-auto w-full max-w-full"
      />
    </a>

    <button
      type="button"
      class="coming-soon-download order-7"
      style="width: 209px"
      data-app-store-placeholder
      disabled
    >
      <span class="coming-soon-download__kicker">Coming soon</span>
      <span class="coming-soon-download__platform">iOS</span>
    </button>

    <a
      href="https://f-droid.org/packages/im.axi.axichat/"
      target="_blank"
      rel="noreferrer"
      class="relative order-3 inline-block h-[62px] max-w-full overflow-visible transition focus:outline-none focus:ring-2 focus:ring-black/25 sm:order-4 lg:order-3"
      style="width: 209px"
    >
      <img
        src="https://fdroid.gitlab.io/artwork/badge/get-it-on.png"
        alt="Get it on F-Droid"
        class="absolute left-0 top-0 block h-auto max-w-none"
        style="width: 242px; transform: translate(-17px, -16px)"
      />
    </a>

    <a
      id="hero-windows-download"
      href="https://github.com/axichat/axichat/releases/latest/download/axichat-windows-setup.exe"
      class="hero-custom-download order-5 block max-w-full self-center rounded-[9px] transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-black/25"
      style="width: 209px; height: 62px"
    >
      <img
        id="hero-windows-download-image"
        src="%BASE_URL%images/download-buttons/download-windows-exe.svg"
        data-exe-src="%BASE_URL%images/download-buttons/download-windows-exe.svg"
        data-zip-src="%BASE_URL%images/download-buttons/download-windows-zip.svg"
        alt="Download the Windows EXE"
        class="block h-auto w-full max-w-full"
      />
    </a>

    <a
      href="https://github.com/axichat/axichat/releases/latest/download/axichat-macos.dmg"
      target="_blank"
      rel="noreferrer"
      class="hero-custom-download order-4 block max-w-full self-center rounded-[9px] transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-black/25 sm:order-3 lg:order-4"
      style="width: 209px; height: 62px"
    >
      <img
        src="%BASE_URL%images/download-buttons/download-macos-dmg.svg"
        alt="Download the macOS DMG"
        class="block h-auto w-full max-w-full"
      />
    </a>

    <button
      type="button"
      class="coming-soon-download order-6"
      style="width: 209px"
      disabled
    >
      <span class="coming-soon-download__kicker">Coming soon</span>
      <span class="coming-soon-download__platform">Linux</span>
    </button>
  </div>

  <div class="mt-3 text-xs text-black/55">You can verify checksums on GitHub Releases.</div>
`;

export function renderDownloadGridHtml(baseUrl: string) {
  return downloadGridTemplate.split("%BASE_URL%").join(baseUrl);
}
