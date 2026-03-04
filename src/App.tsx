import React from "react";

type ClassValue = string | false | null | undefined;

type DownloadItem = {
  href: string;
  os: string;
  file: string;
  borderColor: string;
  icon: React.ReactNode;
};

type FeatureRow = {
  title: string;
  summary: string;
  bullets: string[];
  mockups: {
    src: string;
    alt: string;
    aspect: string;
    useWebp?: boolean;
  }[];
};

type RoadmapItem = {
  year: string;
  detail: string;
};

type RoadmapLane = {
  title: string;
  status: "completed" | "upcoming";
  items: RoadmapItem[];
};

type ReleaseInfo = {
  tag_name?: string;
  name?: string;
  published_at?: string;
};

type ReleaseCacheRecord = {
  version: string;
  publishedAt: string;
  fetchedAt: number;
};

type ServiceHealth = "online" | "offline";
type ServiceIndicatorState = ServiceHealth | "unknown";
type LogoTone = "light" | "dark";

const downloads = {
  android: "https://github.com/axichat/axichat/releases/latest/download/app-production-release.apk",
  windows: "https://github.com/axichat/axichat/releases/latest/download/axichat-windows.zip",
  linux: "https://github.com/axichat/axichat/releases/latest/download/axichat-linux.tar.gz",
};

const heroHeadline = "Goodbye, Email";
const heroSubhead = "The best of instant messaging, email, and calendar all in one.";
const heroNote = "Verify checksums and signatures in GitHub release notes.";
const heroVideoSrc = "/videos/hero.mp4";

const featureRows: FeatureRow[] = [
  {
    title: "Breeze through email like you're texting",
    summary:
      "Move through conversations without context switching. Axichat keeps instant messages and email in one flow.",
    bullets: [
      "Unified inbox for chat + email side by side",
      "Group chats and per-conversation settings",
      "Easy forwarding and replying",
      "Emoji reactions",
      "Delivery and read receipts with typing indicators",
      "Stream management with automatic reconnect to stop messages dropping",
      "Message drafts, starred items, and pinned messages",
      "Rich attachments and inline previews",
      "Fast search across chats, mail, and calendar",
      "1st-party push notifications and offline sync",
    ],
    mockups: [
      {
        src: "/images/screenshots/mobile/01.png",
        alt: "Axichat mobile screenshot 1 showing unified inbox flow",
        aspect: "aspect-[9/16]",
      },
      {
        src: "/images/screenshots/mobile/02.png",
        alt: "Axichat mobile screenshot 2 showing unified inbox flow",
        aspect: "aspect-[9/16]",
      },
    ],
  },
  {
    title: "Schedule your weeks in minutes",
    summary:
      "Forget less, focus more, and keep events tied to the conversations where work actually happens.",
    bullets: [
      "Drag-and-drop event editing",
      "Create tasks and events using natural language (no AI)",
      "Collaborative calendars",
      "One-tap add-to-calendar from simple text messages",
      "Tasks, reminders, and calendar in one view",
      "Calendar export/import for backups and migrations",
      "Critical paths and agenda focus to surface what's next",
    ],
    mockups: [
      {
        src: "/images/screenshots/mobile/05.png",
        alt: "Axichat mobile screenshot 5 showing calendar workflow",
        aspect: "aspect-[9/16]",
      },
      {
        src: "/images/screenshots/mobile/04.png",
        alt: "Axichat mobile screenshot 4 showing calendar workflow",
        aspect: "aspect-[9/16]",
      },
    ],
  },
  {
    title: "Reach anyone, even if they dont use Axichat",
    summary:
      "Use Axichat just like you would a normal email client.",
    bullets: [
      "Built on open, federated protocols",
      "Accessibility-friendly modals and flows (keyboard/touch/reader aware)",
      "Translated UI (English, Spanish, German, French, Chinese)",
      "Sync across all your devices (Android, Linux, Windows)",
      "Desktop + mobile parity with keyboard shortcuts and touch affordances",
      "Works without Google/Firebase; pure XMPP + SMTP/IMAP core",
    ],
    mockups: [
      {
        src: "/images/screenshots/mobile/06.png",
        alt: "Axichat mobile screenshot 6 showing mobile parity experience",
        aspect: "aspect-[9/16]",
      },
      {
        src: "/images/screenshots/mobile/03.png",
        alt: "Axichat mobile screenshot 3 showing mobile parity experience",
        aspect: "aspect-[9/16]",
      },
    ],
  },
];

const faqItems: { question: string; answer: React.ReactNode }[] = [
  {
    question: "Can I use my Axichat address just like a normal email address?",
    answer: (
      <p>
        Yes, when you create an account we will give you a "@axi.im" email address which you can give to other people
        just like a normal email address. You can even use it to sign up for other accounts online like you normally
        would.
      </p>
    ),
  },
  {
    question: "Do I need an existing email address to sign up?",
    answer: <p>No. Signing up for Axichat is frictionless; you just enter a username and, optionally, a password.</p>,
  },
  {
    question: "Can I still receive email from my previous address?",
    answer: (
      <p>
        Yes, simply set up forwarding to your new "@axi.im" address from your existing provider. If you use Gmail or
        Outlook, here are some quick links:{" "}
        <a
          href="https://support.google.com/mail/answer/10957"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4"
        >
          Gmail
        </a>
        ,{" "}
        <a
          href="https://support.microsoft.com/en-us/office/turn-on-automatic-forwarding-in-outlook-7f2670a1-7fff-4475-8a3c-5822d63b0c8e"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4"
        >
          Outlook
        </a>
        .
      </p>
    ),
  },
  {
    question: "Is it FOSS?",
    answer: (
      <p>
        Yes, Axichat is free and open source. Check out our{" "}
        <a
          href="https://github.com/axichat/axichat"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4"
        >
          GitHub
        </a>{" "}
        and{" "}
        <a
          href="https://gitlab.com/axichat"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4"
        >
          GitLab
        </a>
        .
      </p>
    ),
  },
  {
    question: "If Axichat uses XMPP, is it federated?",
    answer: (
      <p>
        Axichat uses SMTP for Axichat-to-External emails. That part is necessarily federated. For Axichat-to-Axichat
        messages, we switch to XMPP for more speed and features, and Axichat can send XMPP messages to most other XMPP
        servers. However, you cannot log in to Axichat using accounts from other XMPP servers. Axichat is built to
        work with the latest, most secure versions of ejabberd and requires SASL2 and SCRAM-SHA-512 for
        authentication. Some XMPP servers run outdated software and therefore do not work with Axichat. We are still
        working on adhering to the various XMPP Compliance Suites.
      </p>
    ),
  },
  {
    question: "How does Axichat compare to Spike?",
    answer: (
      <>
        <p>Both Spike and Axichat are tremendous improvements over traditional email clients. However,</p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            Spike is targeted more toward business teams. Axichat works well for teams too, but is also great for
            personal email and day-to-day individual use.
          </li>
          <li>
            Spike still limits itself to the email protocol (SMTP). Axichat leverages both SMTP and XMPP, which is a
            protocol designed for instant messaging and enables us to provide a significantly richer IM experience,
            especially when you are talking to another Axichat user.
          </li>
          <li>
            Spike is closed source, so you have no idea what software you're actually using or what it's really doing
            behind the scenes. Axichat is open source, so you can see for yourself exactly what you're running and know
            that nothing suspicious is going on.
          </li>
          <li>
            Axichat is completely free to use with the only limit being server-side storage. Spike has free tiers, but
            charges for most of their plans.
          </li>
          <li>
            Axichat was made with Dart + Flutter and Spike was not. This allows us to implement a much more
            aesthetically pleasing interface with attention to detail and performance that can't be matched without
            Flutter.
          </li>
        </ul>
      </>
    ),
  },
  {
    question: "What if I don't like Axichat?",
    answer: (
      <>
        <p>First, do no harm.</p>
        <p className="mt-3">
          You can easily export all your emails, chats and contacts out of Axichat and delete your account through
          the app.
        </p>
      </>
    ),
  },
];

const roadmapLanes: RoadmapLane[] = [
  {
    title: "Completed",
    status: "completed",
    items: [
      { year: "2024", detail: "Core XMPP messenger foundation (presence, chat, open-protocol architecture)" },
      { year: "2024", detail: "First-party notifications and offline-friendly messaging baseline" },
      { year: "2025", detail: "Cross-platform desktop/mobile support (Android, Linux, Windows)" },
      {
        year: "2025",
        detail: "Calendar + task system foundation (natural-language scheduling and drag/drop planning)",
      },
      { year: "2025", detail: "Unified email integration via DeltaChat Core Rust" },
      {
        year: "2025",
        detail: "Group chats (MUC) and richer conversation UX (receipts/reactions/reply flows)",
      },
      { year: "2025", detail: "File attachments and media sharing in chat/email flows" },
      { year: "2025", detail: "Shared availability and collaborative calendar workflows" },
    ],
  },
  {
    title: "Upcoming",
    status: "upcoming",
    items: [
      { year: "2026", detail: "Voice and video calling" },
      { year: "2026", detail: "End-to-end encryption" },
      { year: "2026", detail: "3rd-party email OAuth" },
    ],
  },
];

const footerLinks = {
  sections: [
    { label: "Top", href: "#top" },
    { label: "Features", href: "#features" },
    { label: "About", href: "#about" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "#contact" },
  ],
  legal: [
    { label: "Terms", href: "/axichat_terms.pdf" },
    { label: "Privacy", href: "/axichat_privacy.pdf" },
    { label: "License", href: "/LICENSE.txt" },
  ],
  links: [
    { label: "GitHub", href: "https://github.com/axichat/axichat" },
    { label: "Latest release", href: "https://github.com/axichat/axichat/releases/latest" },
  ],
};

const containerClassName = "mx-auto w-full max-w-[96rem] px-6";
const pngExtension = ".png";
const webpExtension = ".webp";
const brandLogoBlack = "/images/brand/axichat_logo_black.png";
const brandLogoWhite = "/images/brand/axichat_logo_white.png";
const releaseCacheStorageKey = "axichat.latest-release.v1";
const releaseCacheTtlMs = 5 * 60 * 1000;
let inFlightLatestReleaseLookup: Promise<ReleaseCacheRecord> | null = null;

function cn(...classes: ClassValue[]) {
  return classes.filter(Boolean).join(" ");
}

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

function formatReleaseDate(value: string) {
  if (!value) {
    return "";
  }
  const releasedAt = new Date(value);
  if (Number.isNaN(releasedAt.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(releasedAt);
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
    // Ignore storage errors (private mode, quota, disabled storage).
  }
}

function isReleaseCacheFresh(entry: ReleaseCacheRecord) {
  return Date.now() - entry.fetchedAt <= releaseCacheTtlMs;
}

async function fetchLatestRelease(): Promise<ReleaseCacheRecord> {
  if (inFlightLatestReleaseLookup) {
    return inFlightLatestReleaseLookup;
  }

  inFlightLatestReleaseLookup = (async () => {
    const response = await fetch("https://api.github.com/repos/axichat/axichat/releases/latest", {
      headers: {
        Accept: "application/vnd.github+json",
      },
    });
    if (!response.ok) {
      throw new Error(`release_lookup_${response.status}`);
    }
    const payload = (await response.json()) as ReleaseInfo;
    const version = (payload.tag_name ?? payload.name ?? "").trim() || "unavailable";
    const publishedAt = payload.published_at ?? "";
    const entry: ReleaseCacheRecord = {
      version,
      publishedAt,
      fetchedAt: Date.now(),
    };
    writeReleaseCache(entry);
    return entry;
  })();

  try {
    return await inFlightLatestReleaseLookup;
  } finally {
    inFlightLatestReleaseLookup = null;
  }
}

function toIndicatorState(value: unknown): ServiceIndicatorState {
  if (value === "online" || value === "offline") {
    return value;
  }
  return "unknown";
}

function statusDotClass(status: ServiceIndicatorState) {
  if (status === "online") {
    return "bg-emerald-500";
  }
  if (status === "offline") {
    return "bg-rose-500";
  }
  return "bg-amber-400";
}

function statusLabel(status: ServiceIndicatorState) {
  if (status === "online") {
    return "Online";
  }
  if (status === "offline") {
    return "Offline";
  }
  return "Unknown";
}

function parseRgbColor(input: string): [number, number, number] | null {
  const trimmed = input.trim();
  const rgbMatch = trimmed.match(/^rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*([0-9.]+)\s*)?\)$/i);
  if (rgbMatch) {
    const r = Number(rgbMatch[1]);
    const g = Number(rgbMatch[2]);
    const b = Number(rgbMatch[3]);
    const alpha = rgbMatch[4] !== undefined ? Number(rgbMatch[4]) : 1;
    if (Number.isFinite(alpha) && alpha <= 0.05) {
      return null;
    }
    if ([r, g, b].every((value) => Number.isFinite(value))) {
      return [Math.max(0, Math.min(255, r)), Math.max(0, Math.min(255, g)), Math.max(0, Math.min(255, b))];
    }
  }

  const hexMatch = trimmed.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch) {
    const value = hexMatch[1];
    if (value.length === 3) {
      return value.split("").map((part) => parseInt(part + part, 16)) as [number, number, number];
    }
    return [
      parseInt(value.slice(0, 2), 16),
      parseInt(value.slice(2, 4), 16),
      parseInt(value.slice(4, 6), 16),
    ];
  }

  return null;
}

function luminanceFromRgb([r, g, b]: [number, number, number]) {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function pickLogoToneFromPageSurface(prefersDark: boolean): LogoTone {
  const surfaceColor = parseRgbColor(getComputedStyle(document.documentElement).getPropertyValue("--surface"));
  const bodyColor = parseRgbColor(getComputedStyle(document.body).backgroundColor);
  const baseColor = surfaceColor ?? bodyColor;
  if (!baseColor) {
    return prefersDark ? "light" : "dark";
  }
  return luminanceFromRgb(baseColor) < 0.52 ? "light" : "dark";
}

function toWebpPath(path: string) {
  return path.endsWith(pngExtension) ? path.replace(pngExtension, webpExtension) : path;
}

function BrandIcon({ className, alt, src }: { className?: string; alt: string; src: string }) {
  return <img src={src} alt={alt} className={cn("brand-logo", className)} />;
}

function AndroidIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M8.2 6.2 6.6 4.6M15.8 6.2l1.6-1.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M7 9.2c0-2.8 2.2-5 5-5s5 2.2 5 5v7.2a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V9.2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9 11v.2M15 11v.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6.5 10.5v5.5M17.5 10.5v5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function WindowsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M3 5.5 10.5 4.4v7.1H3V5.5Zm0 13 7.5 1.1v-7.1H3v6Zm10.5-14.3L21 3v8.5h-7.5V4.2Zm0 15.6L21 21v-8.5h-7.5v7.3Z"
        fill="currentColor"
      />
    </svg>
  );
}

function TuxIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 3.2c-2.6 0-4.4 2.2-4.4 5 0 1.1.2 1.9.6 2.8-.5.7-1.2 1.9-1.2 3.6 0 3.2 2.2 6 5 6s5-2.8 5-6c0-1.7-.7-2.9-1.2-3.6.4-.9.6-1.7.6-2.8 0-2.8-1.8-5-4.4-5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M10 9.6h.01M14 9.6h.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path
        d="M9.2 15.8c.8 1 1.7 1.5 2.8 1.5s2-.5 2.8-1.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M8 18.5c-1.4 0-2.6-.9-3.2-2.3M16 18.5c1.4 0 2.6-.9 3.2-2.3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m13 5 7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function RoadmapLaneCard({ lane }: { lane: RoadmapLane }) {
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const itemRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const [connectors, setConnectors] = React.useState<
    Array<{
      side: "left" | "right";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      railX: number;
    }>
  >([]);

  React.useLayoutEffect(() => {
    const rebuildPaths = () => {
      const track = trackRef.current;
      if (!track) {
        setConnectors([]);
        return;
      }
      const trackRect = track.getBoundingClientRect();
      const gutter = 28;
      const nextConnectors: Array<{
        side: "left" | "right";
        startX: number;
        startY: number;
        endX: number;
        endY: number;
        railX: number;
      }> = [];

      for (let index = 0; index < lane.items.length - 1; index += 1) {
        const current = itemRefs.current[index];
        const next = itemRefs.current[index + 1];
        if (!current || !next) {
          continue;
        }
        const currentRect = current.getBoundingClientRect();
        const nextRect = next.getBoundingClientRect();
        const side = index % 2 === 0 ? "left" : "right";

        const startX = (side === "left" ? currentRect.left : currentRect.right) - trackRect.left;
        const startY = currentRect.top + currentRect.height / 2 - trackRect.top;
        const endX = (side === "left" ? nextRect.left : nextRect.right) - trackRect.left;
        const endY = nextRect.top + nextRect.height / 2 - trackRect.top;
        const railX = side === "left" ? Math.min(startX, endX) - gutter : Math.max(startX, endX) + gutter;

        nextConnectors.push({
          side,
          startX,
          startY,
          endX,
          endY,
          railX,
        });
      }

      setConnectors(nextConnectors);
    };

    rebuildPaths();

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => {
        rebuildPaths();
      });
      if (trackRef.current) {
        observer.observe(trackRef.current);
      }
      itemRefs.current.forEach((item) => {
        if (item) {
          observer?.observe(item);
        }
      });
    }

    window.addEventListener("resize", rebuildPaths);
    return () => {
      window.removeEventListener("resize", rebuildPaths);
      observer?.disconnect();
    };
  }, [lane.items]);

  return (
    <article
      className={cn(
        "rounded-3xl border bg-white p-5 sm:p-6",
        lane.status === "completed"
          ? "border-emerald-300/60 shadow-[0_16px_42px_rgba(15,157,88,0.10)]"
          : "border-amber-400/50 shadow-[0_16px_42px_rgba(217,119,6,0.10)]"
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-display font-semibold text-black">{lane.title}</h3>
        <span
          className={cn(
            "rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
            lane.status === "completed"
              ? "border-emerald-600/30 bg-emerald-50 text-emerald-900"
              : "border-amber-600/30 bg-amber-50 text-amber-900"
          )}
        >
          {lane.status === "completed" ? "Shipped" : "In Progress"}
        </span>
      </div>

      <div ref={trackRef} className="relative px-9 sm:px-10">
        <svg className={cn("pointer-events-none absolute inset-0 h-full w-full", lane.status === "completed" ? "text-emerald-900/75" : "text-amber-900/75")} aria-hidden>
          {connectors.map((connector, index) => {
            const cornerRadius = 10;
            const horizontalInset = connector.side === "left" ? connector.railX + cornerRadius : connector.railX - cornerRadius;
            const bodyPath =
              connector.side === "left"
                ? `M ${connector.startX} ${connector.startY} H ${horizontalInset} Q ${connector.railX} ${connector.startY} ${connector.railX} ${connector.startY + cornerRadius} V ${connector.endY - cornerRadius} Q ${connector.railX} ${connector.endY} ${horizontalInset} ${connector.endY} H ${connector.endX}`
                : `M ${connector.startX} ${connector.startY} H ${horizontalInset} Q ${connector.railX} ${connector.startY} ${connector.railX} ${connector.startY + cornerRadius} V ${connector.endY - cornerRadius} Q ${connector.railX} ${connector.endY} ${horizontalInset} ${connector.endY} H ${connector.endX}`;
            const headSize = 8;
            const headSpan = 6;
            const headPath =
              connector.side === "left"
                ? `M ${connector.endX} ${connector.endY} L ${connector.endX - headSize} ${connector.endY - headSpan} L ${connector.endX - headSize} ${connector.endY + headSpan} Z`
                : `M ${connector.endX} ${connector.endY} L ${connector.endX + headSize} ${connector.endY - headSpan} L ${connector.endX + headSize} ${connector.endY + headSpan} Z`;

            return (
              <g key={`${lane.title}-connector-${index}`}>
                <path d={bodyPath} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d={headPath} fill="currentColor" />
              </g>
            );
          })}
        </svg>

        <div className="space-y-3">
          {lane.items.map((item, index) => (
            <div
              key={`${lane.title}-${item.year}-${item.detail}`}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              className="relative rounded-2xl border border-black/10 bg-white p-3"
            >
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-black/50">{item.year}</div>
              <p className="text-sm leading-relaxed text-black/75">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.207 11.387.6.113.793-.262.793-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.089-.745.083-.73.083-.73 1.205.085 1.84 1.236 1.84 1.236 1.07 1.835 2.807 1.305 3.492.998.108-.775.418-1.305.762-1.605-2.665-.303-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.235-3.22-.123-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 0 1 3.004-.404c1.02.005 2.047.138 3.004.404 2.29-1.552 3.296-1.23 3.296-1.23.653 1.653.241 2.873.118 3.176.77.84 1.234 1.91 1.234 3.22 0 4.61-2.807 5.625-5.479 5.922.43.37.823 1.096.823 2.21 0 1.594-.015 2.88-.015 3.273 0 .318.19.694.8.576C20.565 21.796 24 17.298 24 12 24 5.37 18.63 0 12 0z"
        fill="currentColor"
      />
    </svg>
  );
}

function GitLabIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M23.955 13.257 20.732 2.66a.6.6 0 0 0-1.145 0l-2.81 8.64H7.223l-2.81-8.64a.6.6 0 0 0-1.145 0L.045 13.257a.6.6 0 0 0 .223.678L12 22.485l11.732-8.55a.6.6 0 0 0 .223-.678Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Container({ children }: { children: React.ReactNode }) {
  return <div className={containerClassName}>{children}</div>;
}

function SectionHeader({
  kicker,
  title,
  subtitle,
}: {
  kicker?: string;
  title: string;
  subtitle?: React.ReactNode;
}) {
  return (
    <div className="mb-10">
      {kicker ? <div className="text-xs font-semibold uppercase tracking-[0.24em] text-black/55">{kicker}</div> : null}
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-black sm:text-4xl font-display">{title}</h2>
      {subtitle ? <p className="mt-3 max-w-2xl text-sm leading-relaxed text-black/70">{subtitle}</p> : null}
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="text-sm text-black/70 transition hover:text-black">
      {children}
    </a>
  );
}

function DownloadButton({ href, os, file, borderColor, icon }: DownloadItem) {
  return (
    <a
      href={href}
      className={cn(
        "group relative flex min-h-14 w-full items-center justify-between gap-4 rounded-2xl border bg-white px-5",
        "transition hover:bg-black/[0.02]",
        "focus:outline-none focus:ring-2 focus:ring-black/25"
      )}
      style={{ borderColor }}
    >
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl border border-black/15 bg-white text-black">{icon}</div>
        <div className="leading-tight">
          <div className="whitespace-nowrap text-sm font-semibold text-black">Download {os}</div>
          <div className="whitespace-nowrap text-xs text-black/60">{file}</div>
        </div>
      </div>
      <ArrowRight className="h-5 w-5 text-black/60 transition-transform group-hover:translate-x-0.5" />
    </a>
  );
}

function UsernameCta({ href, className }: { href: string; className?: string }) {
  return (
    <a
      href={href}
      className={cn(
        "inline-flex flex-wrap items-center justify-center gap-x-1 rounded-xl px-4 py-2 font-semibold transition",
        "focus:outline-none focus:ring-2 focus:ring-black/25",
        className
      )}
      aria-label="Get your username at axi.im now"
    >
      <span>Get your</span>
      <span className="username-shimmer">username@axi.im</span>
      <span>now</span>
    </a>
  );
}

function MockupFrame({
  src,
  alt,
  aspect,
  useWebp = false,
}: {
  src: string;
  alt: string;
  aspect: string;
  useWebp?: boolean;
}) {
  return (
    <div className={cn("w-full", aspect)}>
      <picture>
        {useWebp ? <source srcSet={toWebpPath(src)} type="image/webp" /> : null}
        <img src={src} alt={alt} className="h-full w-full object-contain" loading="lazy" />
      </picture>
    </div>
  );
}

export default function App() {
  const heroVideoRef = React.useRef<HTMLVideoElement | null>(null);
  const [autoplayBlocked, setAutoplayBlocked] = React.useState(false);
  const [heroPoster, setHeroPoster] = React.useState<string>("");
  const [logoTone, setLogoTone] = React.useState<LogoTone>("dark");
  const [latestVersion, setLatestVersion] = React.useState<string>("loading...");
  const [latestReleaseDate, setLatestReleaseDate] = React.useState<string>("");
  const [serverStatus, setServerStatus] = React.useState<{ email: ServiceIndicatorState; chat: ServiceIndicatorState }>(
    {
      email: "unknown",
      chat: "unknown",
    }
  );

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const evaluateTone = () => {
      setLogoTone(pickLogoToneFromPageSurface(mediaQuery.matches));
    };

    evaluateTone();
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", evaluateTone);
    } else {
      mediaQuery.addListener(evaluateTone);
    }
    window.addEventListener("resize", evaluateTone);

    return () => {
      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", evaluateTone);
      } else {
        mediaQuery.removeListener(evaluateTone);
      }
      window.removeEventListener("resize", evaluateTone);
    };
  }, []);

  const brandLogoSrc = logoTone === "light" ? brandLogoWhite : brandLogoBlack;

  React.useEffect(() => {
    let cancelled = false;

    const fetchLatestVersion = async () => {
      const cachedRelease = readReleaseCache();
      if (cachedRelease && !cancelled) {
        setLatestVersion(cachedRelease.version || "unavailable");
        setLatestReleaseDate(formatReleaseDate(cachedRelease.publishedAt));
      }

      if (cachedRelease && isReleaseCacheFresh(cachedRelease)) {
        return;
      }

      try {
        const latestRelease = await fetchLatestRelease();
        if (!cancelled) {
          setLatestVersion(latestRelease.version || "unavailable");
          setLatestReleaseDate(formatReleaseDate(latestRelease.publishedAt));
        }
      } catch {
        if (!cancelled) {
          if (cachedRelease) {
            setLatestVersion(cachedRelease.version || "unavailable");
            setLatestReleaseDate(formatReleaseDate(cachedRelease.publishedAt));
          } else {
            setLatestVersion("unavailable");
            setLatestReleaseDate("");
          }
        }
      }
    };

    void fetchLatestVersion();

    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    const fetchServerStatus = async () => {
      try {
        const response = await fetch("https://axi.im:8443/status", {
          method: "GET",
          headers: {
            Accept: "application/json",
            "X-Client-Token": "axichatpublictoken",
          },
        });
        if (response.status !== 200 && response.status !== 503) {
          throw new Error(`status_lookup_${response.status}`);
        }
        const payload = (await response.json()) as { stalwart?: string; ejabberd?: string };
        if (!cancelled) {
          setServerStatus({
            email: toIndicatorState(payload.stalwart),
            chat: toIndicatorState(payload.ejabberd),
          });
        }
      } catch {
        if (!cancelled) {
          setServerStatus({
            email: "unknown",
            chat: "unknown",
          });
        }
      }
    };

    void fetchServerStatus();
    const interval = window.setInterval(() => {
      void fetchServerStatus();
    }, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  React.useEffect(() => {
    let disposed = false;
    const probeVideo = document.createElement("video");
    probeVideo.src = heroVideoSrc;
    probeVideo.preload = "auto";
    probeVideo.muted = true;
    probeVideo.defaultMuted = true;
    probeVideo.playsInline = true;

    const captureFrame = () => {
      if (disposed || !probeVideo.videoWidth || !probeVideo.videoHeight) {
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = probeVideo.videoWidth;
      canvas.height = probeVideo.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return;
      }
      ctx.drawImage(probeVideo, 0, 0, canvas.width, canvas.height);
      setHeroPoster(canvas.toDataURL("image/jpeg", 0.85));
    };

    const handleLoadedMetadata = () => {
      const targetTime = probeVideo.duration && Number.isFinite(probeVideo.duration) ? Math.min(0.2, probeVideo.duration / 2) : 0;
      try {
        probeVideo.currentTime = targetTime;
      } catch {
        captureFrame();
      }
    };

    probeVideo.addEventListener("loadedmetadata", handleLoadedMetadata);
    probeVideo.addEventListener("seeked", captureFrame);
    probeVideo.addEventListener("loadeddata", captureFrame);
    probeVideo.load();

    return () => {
      disposed = true;
      probeVideo.removeEventListener("loadedmetadata", handleLoadedMetadata);
      probeVideo.removeEventListener("seeked", captureFrame);
      probeVideo.removeEventListener("loadeddata", captureFrame);
      probeVideo.pause();
      probeVideo.removeAttribute("src");
      probeVideo.load();
    };
  }, []);

  React.useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) {
      return;
    }

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.loop = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    let retryAttempts = 0;

    const tryPlay = () => {
      if (!video.paused) {
        setAutoplayBlocked(false);
        return;
      }
      void video
        .play()
        .then(() => {
          setAutoplayBlocked(false);
        })
        .catch((error: unknown) => {
          const errorName =
            typeof error === "object" && error && "name" in error ? String((error as { name?: unknown }).name) : "";
          // AbortError often happens while media is still loading; retry instead of showing the button too early.
          if (errorName === "NotAllowedError") {
            setAutoplayBlocked(true);
          }
        });
    };

    tryPlay();
    video.addEventListener("loadedmetadata", tryPlay);
    video.addEventListener("loadeddata", tryPlay);
    video.addEventListener("canplay", tryPlay);
    const handlePlaying = () => {
      setAutoplayBlocked(false);
    };
    video.addEventListener("play", handlePlaying);
    video.addEventListener("playing", handlePlaying);
    const retryTimer = window.setInterval(() => {
      retryAttempts += 1;
      if (!video.paused || retryAttempts >= 14) {
        window.clearInterval(retryTimer);
        if (video.paused && retryAttempts >= 14) {
          setAutoplayBlocked(true);
        }
        return;
      }
      tryPlay();
    }, 700);
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        tryPlay();
      }
    };
    const handleWindowFocus = () => {
      tryPlay();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      window.clearInterval(retryTimer);
      video.removeEventListener("loadedmetadata", tryPlay);
      video.removeEventListener("loadeddata", tryPlay);
      video.removeEventListener("canplay", tryPlay);
      video.removeEventListener("play", handlePlaying);
      video.removeEventListener("playing", handlePlaying);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);

  const downloadButtons: DownloadItem[] = [
    {
      href: downloads.android,
      os: "Android",
      file: ".apk",
      borderColor: "#0f9d58",
      icon: <AndroidIcon className="h-5 w-5 text-black" />,
    },
    {
      href: downloads.windows,
      os: "Windows",
      file: ".zip (Axichat.exe)",
      borderColor: "#0078d4",
      icon: <WindowsIcon className="h-5 w-5 text-black" />,
    },
    {
      href: downloads.linux,
      os: "Linux",
      file: ".tar.gz",
      borderColor: "#111111",
      icon: <TuxIcon className="h-5 w-5 text-black" />,
    },
  ];

  return (
    <div className="relative min-h-screen bg-white text-black font-body">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 surface-grid opacity-60" />
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-black/5 blur-3xl animate-floatSlow" />
        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-black/[0.03] blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/90 backdrop-blur">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <a href="#top" className="flex items-center gap-3">
              <BrandIcon alt="Axichat" src={brandLogoSrc} className="h-14 w-14" />
              <div
                className="text-2xl leading-none tracking-[0.015em]"
                style={{ fontFamily: "Gabarito, ui-sans-serif, system-ui", fontWeight: 500 }}
              >
                Axichat
              </div>
            </a>

            <nav className="hidden items-center gap-6 md:flex">
              <NavLink href="#features">Features</NavLink>
              <NavLink href="#about">About</NavLink>
              <NavLink href="#faq">FAQ</NavLink>
              <NavLink href="#contact">Contact</NavLink>
            </nav>

            <UsernameCta
              href={downloads.android}
              className="shrink-0 border border-black bg-black text-[10px] text-white hover:bg-black/85 sm:text-xs"
            />
          </div>
        </Container>
      </header>

      <main id="top">
        <section className="border-b border-black/10 py-20 sm:py-24">
          <Container>
            <div className="grid items-center gap-[1.05rem] lg:gap-[1.4rem] lg:grid-cols-[0.95fr_1.05fr]">
              <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
                <div className="mx-auto mb-6 inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border border-black/15 bg-white px-4 py-2.5 text-black/65 lg:mx-0">
                  <span className="inline-flex h-2 w-2 rounded-full bg-black" />
                  <span className="text-xs font-medium tracking-[0.02em]">Latest version</span>
                  <span className="font-mono text-base font-semibold text-black sm:text-lg">{latestVersion}</span>
                  {latestReleaseDate ? <span className="text-xs text-black/55">Released {latestReleaseDate}</span> : null}
                </div>

                <h1 className="text-balance text-5xl font-semibold tracking-tight sm:text-7xl font-display">{heroHeadline}</h1>
                <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-black/70 sm:text-lg lg:mx-0">{heroSubhead}</p>

                <div className="mx-auto mt-10 grid gap-3 sm:max-w-md lg:mx-0">
                  {downloadButtons.map((item) => (
                    <DownloadButton key={item.os} {...item} />
                  ))}
                </div>

                <div className="mt-4 text-xs text-black/55 lg:text-left">{heroNote}</div>
              </div>

              <div className="w-full lg:w-[110%] lg:-ml-[5%]">
                <div className="relative w-full overflow-hidden rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.14)]">
                  <video
                    ref={heroVideoRef}
                    className="block h-auto w-full"
                    autoPlay
                    loop
                    muted
                    defaultMuted
                    playsInline
                    preload="auto"
                    poster={heroPoster || undefined}
                  >
                    <source src={heroVideoSrc} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  {autoplayBlocked ? (
                    <button
                      type="button"
                      onClick={() => {
                        const video = heroVideoRef.current;
                        if (!video) {
                          return;
                        }
                        void video
                          .play()
                          .then(() => {
                            setAutoplayBlocked(false);
                          })
                          .catch(() => {
                            setAutoplayBlocked(true);
                          });
                      }}
                      className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black bg-white px-6 py-3 text-sm font-semibold text-black"
                    >
                      Play Video
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section id="features" className="py-16 sm:py-20">
          <Container>
            <div className="space-y-14">
              {featureRows.map((feature, index) => {
                const textBlock = (
                  <div>
                    <h3 className="text-3xl sm:text-4xl font-display font-semibold tracking-tight text-black">{feature.title}</h3>
                    <p className="mt-4 text-sm leading-relaxed text-black/70">{feature.summary}</p>

                    <ul className="mt-5 list-disc space-y-2 pl-5 text-sm text-black/75 marker:text-black/70">
                      {feature.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                );

                if (feature.mockups.length === 2) {
                  const rightSideMockup =
                    feature.mockups.find((mockup) => mockup.src.endsWith("/01.png")) ??
                    feature.mockups[1];
                  const leftSideMockup = feature.mockups.find((mockup) => mockup.src !== rightSideMockup.src) ?? feature.mockups[0];
                  const leftOffsetClass = index % 2 === 0 ? "lg:-translate-y-2" : "lg:translate-y-2";
                  const rightOffsetClass = index % 2 === 0 ? "lg:translate-y-3" : "lg:-translate-y-1";
                  return (
                    <article
                      key={feature.title}
                      className="grid items-start gap-8 border-b border-black/10 pb-14 last:border-b-0 last:pb-0 lg:gap-6 xl:gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)_minmax(0,20rem)] xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)_minmax(0,24rem)] 2xl:grid-cols-[minmax(0,28rem)_minmax(0,1fr)_minmax(0,28rem)] lg:items-center"
                    >
                      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:hidden">
                        <MockupFrame
                          src={leftSideMockup.src}
                          alt={leftSideMockup.alt}
                          aspect={leftSideMockup.aspect}
                          useWebp={leftSideMockup.useWebp}
                        />
                        <MockupFrame
                          src={rightSideMockup.src}
                          alt={rightSideMockup.alt}
                          aspect={rightSideMockup.aspect}
                          useWebp={rightSideMockup.useWebp}
                        />
                      </div>

                      <div
                        className={cn(
                          "hidden lg:block w-full max-w-full justify-self-start transition-transform duration-300 lg:-translate-x-2 xl:-translate-x-8 2xl:-translate-x-12",
                          leftOffsetClass
                        )}
                      >
                        <MockupFrame
                          src={leftSideMockup.src}
                          alt={leftSideMockup.alt}
                          aspect={leftSideMockup.aspect}
                          useWebp={leftSideMockup.useWebp}
                        />
                      </div>

                      {textBlock}

                      <div
                        className={cn(
                          "hidden lg:block w-full max-w-full justify-self-end transition-transform duration-300 lg:translate-x-2 xl:translate-x-8 2xl:translate-x-12",
                          rightOffsetClass
                        )}
                      >
                        <MockupFrame
                          src={rightSideMockup.src}
                          alt={rightSideMockup.alt}
                          aspect={rightSideMockup.aspect}
                          useWebp={rightSideMockup.useWebp}
                        />
                      </div>
                    </article>
                  );
                }

                return (
                  <article
                    key={feature.title}
                    className="grid items-start gap-8 border-b border-black/10 pb-14 last:border-b-0 last:pb-0 lg:gap-6 xl:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] xl:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] 2xl:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:items-center"
                  >
                    <div
                      className={cn(
                        "mx-auto w-full max-w-full transition-transform duration-300 lg:order-2 lg:justify-self-end lg:translate-x-2 xl:translate-x-8 2xl:translate-x-12",
                        index % 2 === 0 ? "lg:translate-y-2" : "lg:-translate-y-1"
                      )}
                    >
                      <MockupFrame
                        src={feature.mockups[0].src}
                        alt={feature.mockups[0].alt}
                        aspect={feature.mockups[0].aspect}
                        useWebp={feature.mockups[0].useWebp}
                      />
                    </div>
                    <div className="lg:order-1">{textBlock}</div>
                  </article>
                );
              })}
            </div>
          </Container>
        </section>

        <section id="faq" className="border-y border-black/10 py-16 sm:py-20">
          <Container>
            <SectionHeader title="FAQ" />
            <div className="flex flex-col gap-4">
              {faqItems.map((item) => (
                <div key={item.question} className="rounded-2xl border border-black/10 bg-white px-5 py-4">
                  <div className="text-sm font-semibold text-black">{item.question}</div>
                  <div className="mt-3 text-sm leading-relaxed text-black/70">{item.answer}</div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section id="about" className="py-16 sm:py-20">
          <Container>
            <SectionHeader
              title="About"
              subtitle="Built in New Zealand for people who want control over communication, scheduling, and time."
            />

            <div className="grid gap-4 md:grid-cols-2">
              {roadmapLanes.map((lane) => (
                <RoadmapLaneCard key={lane.title} lane={lane} />
              ))}
            </div>
          </Container>
        </section>

        <section id="contact" className="border-t border-black/10 py-16 sm:py-20">
          <Container>
            <SectionHeader
              title="Contact"
              subtitle={
                <>
                  <span>For help and inquiries, email </span>
                  <a href="mailto:support@axichat.com" className="underline underline-offset-4">
                    support@axichat.com
                  </a>
                  <span>. For bugs and feature requests, use </span>
                  <a
                    href="https://github.com/axichat/axichat/issues"
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-4"
                  >
                    GitHub Issues
                  </a>
                  <span>.</span>
                </>
              }
            />

            <div className="inline-flex items-center gap-2 text-sm text-black/70">
              <GitLabIcon className="h-4 w-4" />
              <a
                href="https://gitlab.com/axichat/axichat"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4"
              >
                https://gitlab.com/axichat/axichat
              </a>
            </div>
          </Container>
        </section>

        <section className="border-t border-black/10 py-12 sm:py-16">
          <Container>
            <div className="rounded-3xl border border-black/10 bg-black/[0.03] px-6 py-10 text-center">
              <UsernameCta
                href={downloads.android}
                className="border border-black bg-black px-6 py-3 text-sm text-white hover:bg-black/85 sm:text-base"
              />
            </div>
          </Container>
        </section>

        <footer className="border-t border-black/10 py-10">
          <Container>
            <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
              <div className="grid max-w-sm grid-cols-[3.5rem_1fr] gap-x-3 gap-y-2">
                <BrandIcon alt="Axichat" src={brandLogoSrc} className="h-14 w-14 self-start -ml-[7px]" />
                <div
                  className="self-center text-2xl leading-none tracking-[0.015em]"
                  style={{ fontFamily: "Gabarito, ui-sans-serif, system-ui", fontWeight: 500 }}
                >
                  Axichat
                </div>
                <div className="col-span-2 flex flex-col gap-2">
                  <div className="text-xs text-black/60">© {new Date().getFullYear()} Axichat LLC</div>
                  <a href="/LICENSE.txt" className="text-xs text-black/60 transition hover:text-black">
                    AGPL-3.0
                  </a>
                  <div className="mt-2 rounded-xl border border-black/10 bg-white px-3 py-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/55">Server Status</div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-black/70">
                      <span className="inline-flex items-center gap-2">
                        <span className={cn("h-2 w-2 rounded-full", statusDotClass(serverStatus.email))} />
                        <span>Email</span>
                        <span className="font-semibold text-black">{statusLabel(serverStatus.email)}</span>
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <span className={cn("h-2 w-2 rounded-full", statusDotClass(serverStatus.chat))} />
                        <span>Chat</span>
                        <span className="font-semibold text-black">{statusLabel(serverStatus.chat)}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
                <div className="space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-black/60">Sections</div>
                  <div className="flex flex-col gap-2">
                    {footerLinks.sections.map((link) => (
                      <NavLink key={link.href} href={link.href}>
                        {link.label}
                      </NavLink>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-black/60">Legal</div>
                  <div className="flex flex-col gap-2">
                    {footerLinks.legal.map((link) => (
                      <a key={link.href} href={link.href} className="text-sm text-black/70 transition hover:text-black">
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-black/60">Links</div>
                  <div className="flex flex-col gap-2">
                    {footerLinks.links.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-black/70 transition hover:text-black"
                      >
                        {link.label === "GitHub" ? <GitHubIcon className="h-4 w-4" /> : null}
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </footer>
      </main>
    </div>
  );
}
