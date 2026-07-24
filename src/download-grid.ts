export const downloadGridTemplate = `
  <div
    id="hero-downloads"
    class="mx-auto mt-3 inline-grid items-center justify-items-center gap-3"
    role="group"
    aria-label="Download Axichat"
  >
    <a
      href="https://play.google.com/store/apps/details?id=im.axi.axichat"
      target="_blank"
      rel="noreferrer"
      class="relative order-2 inline-block h-[62px] max-w-full overflow-visible transition focus:outline-none focus:ring-2 focus:ring-black/25"
      style="width: 209px"
    >
      <img
        src="%BASE_URL%images/platforms/google-play-badge.png"
        alt="Get it on Google Play"
        width="646"
        height="250"
        class="absolute left-0 top-0 block h-auto max-w-none"
        style="width: 242px; transform: translate(-17px, -16px)"
      />
    </a>

    <div class="order-1 flex w-[209px] max-w-full justify-center sm:w-[186px]">
      <a
        href="https://apps.apple.com/us/app/axichat/id6785619773"
        target="_blank"
        rel="noreferrer"
        class="app-store-download inline-block w-[209px] max-w-full transition focus:outline-none focus:ring-2 focus:ring-black/25 sm:w-[186px]"
      >
        <img
          src="%BASE_URL%images/platforms/app-store-badge.svg"
          alt="Download on the App Store"
          class="block h-auto w-full max-w-full"
        />
      </a>
    </div>

    <a
      href="https://f-droid.org/packages/im.axi.axichat/"
      target="_blank"
      rel="noreferrer"
      class="relative order-3 inline-block h-[62px] max-w-full overflow-visible transition focus:outline-none focus:ring-2 focus:ring-black/25 sm:order-4 lg:order-3"
      style="width: 209px"
    >
      <img
        src="%BASE_URL%images/platforms/fdroid-badge.png"
        alt="Get it on F-Droid"
        width="646"
        height="250"
        class="absolute left-0 top-0 block h-auto max-w-none"
        style="width: 242px; transform: translate(-17px, -16px)"
      />
    </a>

    <a
      id="hero-windows-download"
      href="https://github.com/axichat/axichat/releases/latest/download/axichat-windows-setup.exe"
      class="hero-custom-download platform-download hero-windows-download order-5 self-center transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-black/25"
    >
      <span class="platform-download__meta">
        <span>Download the</span>
        <span id="hero-windows-download-format" class="platform-download__format">EXE</span>
      </span>
      <span class="platform-download__platform">Windows</span>
      <svg class="platform-download__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 4.5v9.75M8.75 11.5 12 14.75l3.25-3.25M5.5 18.5h13" />
      </svg>
    </a>

    <a
      href="https://github.com/axichat/axichat/releases/latest/download/axichat-macos.dmg"
      target="_blank"
      rel="noreferrer"
      class="hero-custom-download platform-download hero-macos-download order-4 self-center transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-black/25 sm:order-3 lg:order-4"
    >
      <span class="platform-download__meta">
        <span>Download the</span>
        <span class="platform-download__format">DMG</span>
      </span>
      <span class="platform-download__platform">macOS</span>
      <svg class="platform-download__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 4.5v9.75M8.75 11.5 12 14.75l3.25-3.25M5.5 18.5h13" />
      </svg>
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
