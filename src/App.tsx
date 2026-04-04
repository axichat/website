import React from "react";

type ClassValue = string | false | null | undefined;

type DownloadItem = {
  href?: string;
  disabled?: boolean;
  os: string;
  file: string;
  backgroundColor: string;
  borderColor: string;
  textColor?: string;
  fileColor?: string;
  iconBackgroundColor?: string;
  iconBorderColor?: string;
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

type UseCaseCard = {
  title: string;
  audience: string;
  summary: string;
  bullets: string[];
  highlight: string;
};

type FaqItem = {
  id?: string;
  question: string;
  answer: React.ReactNode;
};

type BlogPost = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  publishedAt: string;
  readingTime: string;
  body: React.ReactNode;
};

type AppRoute =
  | { kind: "home" }
  | { kind: "use-cases" }
  | { kind: "blog" }
  | { kind: "blog-post"; post: BlogPost }
  | { kind: "donate" };

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

function withBasePath(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
}

const downloads = {
  android: "https://github.com/axichat/axichat/releases/latest/download/app-production-release.apk",
  windows: "https://github.com/axichat/axichat/releases/latest/download/axichat-windows-setup.exe",
  linux: "https://github.com/axichat/axichat/releases/latest/download/axichat-x86_64.AppImage",
};
const downloadsPageHref = withBasePath("downloads/index.html");

const heroHeadline = "Replace your email, messenger, and calendar apps with Axichat";
const heroNote = "You can verify checksums on GitHub Releases.";
const heroVideoSrc = withBasePath("videos/hero.mp4");
const fdroidDownloadHref = "https://f-droid.org/packages/im.axi.axichat";
const fdroidBadgeSrc = "https://f-droid.org/badge/get-it-on.png";
const heroStoreBadgeHeightPx = 80;
const showPublicFdroidButton = false;
const showEditorialLinks = false;
const unregisterFaqId = "unregister";
const unregisterFaqHash = `#${unregisterFaqId}`;

const featureRows: FeatureRow[] = [
  {
    title: "Breeze through email like you're texting",
    summary:
      "Conversational email turns your traditional email threads into easy chats.",
    bullets: [
      "Unified inbox for chat + email side by side",
      "Group chats and per-conversation settings",
      "Easy forwarding and replying",
      "Emoji reactions",
      "Delivery and read receipts with typing indicators",
      "Stream management with automatic reconnect to keep messages from dropping",
      "Message drafts, starred items, and pinned messages",
      "Rich attachments and inline previews",
      "Fast search across chats, mail, and calendar",
      "First-party push notifications and offline sync",
    ],
    mockups: [
      {
        src: withBasePath("images/screenshots/mobile/01.png"),
        alt: "Axichat mobile screenshot 1 showing unified inbox flow",
        aspect: "aspect-[9/16]",
      },
      {
        src: withBasePath("images/screenshots/mobile/02.png"),
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
      "Create tasks and events using natural language (without AI)",
      "Collaborative calendars",
      "One-tap add-to-calendar from simple text messages",
      "Tasks, reminders, and calendar in one view",
      "Calendar export/import for backups and migrations",
      "Critical paths and agenda focus to surface what's next",
    ],
    mockups: [
      {
        src: withBasePath("images/screenshots/mobile/05.png"),
        alt: "Axichat mobile screenshot 5 showing calendar workflow",
        aspect: "aspect-[9/16]",
      },
      {
        src: withBasePath("images/screenshots/mobile/04.png"),
        alt: "Axichat mobile screenshot 4 showing calendar workflow",
        aspect: "aspect-[9/16]",
      },
    ],
  },
  {
    title: "Reach anyone, even before they switch to Axichat",
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
        src: withBasePath("images/screenshots/mobile/06.png"),
        alt: "Axichat mobile screenshot 6 showing mobile parity experience",
        aspect: "aspect-[9/16]",
      },
      {
        src: withBasePath("images/screenshots/mobile/03.png"),
        alt: "Axichat mobile screenshot 3 showing mobile parity experience",
        aspect: "aspect-[9/16]",
      },
    ],
  },
];

const faqItems: FaqItem[] = [
  {
    question: "Does Axichat provide real email addresses @axi.im?",
    answer: (
      <p>
        Yes, use it as you would any other email address, including to sign up for other online accounts. Your chat
        address (JID) and email address are exactly the same.
      </p>
    ),
  },
  {
    question: "Do I need an existing email address to sign up?",
    answer: <p>No. You just enter a username and, optionally, a password if you don't want one generated for you.</p>,
  },
  {
    question: "Can I still receive email from my previous address?",
    answer: (
      <p>
        Yes, you can forward emails from your existing provider to your new "@axi.im" address. If you use Gmail or
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
        Yes, Axichat is free and open source as you can see on{" "}
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
    question: "Can I self-host?",
    answer: (
      <p>
        Yes, read the{" "}
        <a
          href="https://github.com/axichat/selfhost"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4"
        >
          guide
        </a>
        {" "}on using your own server with the Axichat client.
      </p>
    ),
  },
  {
    question: "If Axichat uses XMPP, is it federated?",
    answer: (
      <p>
        Axichat uses SMTP for sending messages to other email providers. XMPP is used for messaging other Axichat
        users and anyone with a valid JID.
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
            Axichat provides a richer IM experience by using a combination of chat (XMPP) and email (SMTP) protocols.
            Spike limits itself to SMTP.
          </li>
          <li>
            Spike is more targeted to business teams, whereas Axichat works just as well for individual, family, and
            business use cases.
          </li>
          <li>
            Axichat is open source; Spike is closed source, so you have no idea what software you're actually using or
            what it's really doing behind the scenes.
          </li>
          <li>
            Axichat was made with Flutter, which lets us provide significantly better UI and performance on all
            platforms.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: unregisterFaqId,
    question: "What if I don't like Axichat?",
    answer: (
      <>
        <p>
          <a
            href="https://github.com/axichat/axichat/issues"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4"
          >
            Request the features you want
          </a>{" "}
          or you can export all your emails, chats, and contacts out of Axichat and delete your account through the
          app.
        </p>
        <p className="mt-3">
          If you want to unregister entirely, open your profile page in the app and go to <strong>Account</strong>
          {" > "}
          <strong>Unregister</strong>.
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
      { year: "Jul 2024", detail: "Basic chat: send messages, see who is online, and stay in touch" },
      { year: "Sep 2024", detail: "Notifications and better message history when you come back online" },
      { year: "Oct 2025", detail: "Axichat apps for Android, Linux, and Windows" },
      {
        year: "Nov 2025",
        detail: "A built-in calendar and to-do list, with easy scheduling and planning",
      },
      { year: "Dec 2025", detail: "Email built into Axichat" },
      {
        year: "Jan 2026",
        detail: "Group chats, reactions, read receipts, and replies",
      },
      { year: "Feb 2026", detail: "Sending photos, files, and other attachments in chats and email" },
    ],
  },
  {
    title: "Upcoming",
    status: "upcoming",
    items: [
      { year: "2026", detail: "Voice and video calls" },
      { year: "2026", detail: "Use Axichat with your existing Gmail or Outlook account" },
    ],
  },
];

const useCases: UseCaseCard[] = [
  {
    title: "Replace the overloaded personal inbox",
    audience: "For people juggling newsletters, friend groups, and real tasks in the same mailbox",
    summary:
      "Axichat works best when your email inbox is doing too many jobs at once and you want the important conversations to feel immediate again.",
    bullets: [
      "Keep quick back-and-forth conversations out of slow email threads",
      "Reply, forward, and search from one place instead of bouncing across apps",
      "Turn messages into reminders or calendar events before they get buried",
    ],
    highlight: "Best fit when you already live in email but wish the good parts behaved like chat.",
  },
  {
    title: "Run a small team without another bloated workspace",
    audience: "For small teams that coordinate in side threads, calendar invites, and last-minute follow-ups",
    summary:
      "Axichat gives teams a lighter operational layer than a full corporate suite while still handling the real work of conversation, scheduling, and follow-through.",
    bullets: [
      "Use group chat for fast coordination and email for everyone else",
      "Share calendars and availability without switching products",
      "Keep the same workflow on desktop and mobile when people are moving around",
    ],
    highlight: "Strong fit for founder-led teams and tight groups that do not want another heavyweight collaboration stack.",
  },
  {
    title: "Self-host a calmer communications stack",
    audience: "For privacy-conscious organizations and technical communities that want control",
    summary:
      "Axichat is built on open protocols, so it fits teams that care about transparency, portability, and avoiding closed infrastructure lock-in.",
    bullets: [
      "Use open standards instead of proprietary sync layers",
      "Keep the option to self-host the surrounding services",
      "Audit the client because the project is open source",
    ],
    highlight: "Best when sovereignty matters more than flashy vendor integrations.",
  },
  {
    title: "Keep planning attached to the conversation",
    audience: "For people who move from message to meeting to task in minutes",
    summary:
      "Axichat shines when the work is not just talking, but deciding what happens next and putting it on the calendar before context disappears.",
    bullets: [
      "Create events and tasks from natural-language text",
      "Track reminders next to the message that created them",
      "Use one timeline for chat, email, and scheduling context",
    ],
    highlight: "Useful when planning is part of the message flow, not a separate admin task.",
  },
];

const blogPosts: BlogPost[] = [
  {
    slug: "why-axichat-starts-with-open-protocols",
    title: "Why Axichat starts with open protocols",
    category: "Product",
    summary:
      "The short version: open protocols keep the product honest, portable, and easier to trust.",
    publishedAt: "2026-02-18",
    readingTime: "4 min read",
    body: (
      <>
        <p>
          Axichat is built on SMTP and XMPP because communication software should not trap people inside a private
          protocol just to make the interface feel modern.
        </p>
        <p className="mt-4">
          Open protocols force a certain discipline. They make interoperability, export, and migration part of the
          product surface instead of a vague promise buried in marketing copy.
        </p>
        <p className="mt-4">
          That tradeoff is not always the easiest engineering path, but it is the right one if the goal is long-term
          user control rather than short-term lock-in.
        </p>
      </>
    ),
  },
  {
    slug: "email-should-not-feel-this-slow",
    title: "Email should not feel this slow",
    category: "UX",
    summary:
      "Most people do not hate written communication. They hate the latency, clutter, and context loss in old email clients.",
    publishedAt: "2026-01-22",
    readingTime: "3 min read",
    body: (
      <>
        <p>
          Traditional inboxes make fast conversations feel heavier than they really are. Replies hide under thread
          chrome, scheduling context lives somewhere else, and the message you need is rarely where you last saw it.
        </p>
        <p className="mt-4">
          Axichat approaches the problem from the opposite direction. Preserve the universality of email, but present
          the flow more like a conversation product people actually want to use every day.
        </p>
        <p className="mt-4">
          The goal is not to turn everything into chat. The goal is to remove unnecessary slowness from communication
          that is already conversational.
        </p>
      </>
    ),
  },
  {
    slug: "what-will-live-in-this-blog",
    title: "What will live in this blog",
    category: "Meta",
    summary:
      "This blog is for release context, protocol decisions, UX notes, and the occasional argument for building calmer tools.",
    publishedAt: "2025-12-10",
    readingTime: "2 min read",
    body: (
      <>
        <p>
          The point of the blog is not content marketing. It is to explain decisions that matter to users and
          contributors: what shipped, what changed, and why certain architectural choices are non-negotiable.
        </p>
        <p className="mt-4">
          Expect release notes with real context, deeper writeups on product direction, and practical posts for people
          deciding whether Axichat fits their workflow.
        </p>
      </>
    ),
  },
];

const footerLinks = {
  legal: [
    { label: "Donate", href: withBasePath("donate/") },
    { label: "Terms", href: withBasePath("terms/") },
    { label: "Privacy", href: withBasePath("privacy/") },
    { label: "License", href: withBasePath("LICENSE.txt") },
  ],
  links: [
    { label: "GitHub", href: "https://github.com/axichat/axichat", external: true },
    { label: "GitLab", href: "https://gitlab.com/axichat/axichat", external: true },
    { label: "Mastodon", href: "https://mastodon.social/@axichat", external: true },
  ],
};

const containerClassName = "mx-auto w-full max-w-[84rem] px-6";
const pngExtension = ".png";
const webpExtension = ".webp";
const brandLogoBlack = withBasePath("images/brand/axichat_logo_black.png");
const brandLogoWhite = withBasePath("images/brand/axichat_logo_white.png");
const mastodonLogoPurple = withBasePath("images/brand/mastodon_logo_purple.svg");
const releaseCacheStorageKey = "axichat.latest-release.v1";
const releaseCacheTtlMs = 5 * 60 * 1000;
let inFlightLatestReleaseLookup: Promise<ReleaseCacheRecord> | null = null;

function cn(...classes: ClassValue[]) {
  return classes.filter(Boolean).join(" ");
}

function normalizeAppPath(pathname: string) {
  const basePath = import.meta.env.BASE_URL;
  const normalizedBase = basePath.endsWith("/") && basePath.length > 1 ? basePath.slice(0, -1) : basePath;
  if (normalizedBase && normalizedBase !== "/" && pathname.startsWith(normalizedBase)) {
    const trimmedPath = pathname.slice(normalizedBase.length);
    return trimmedPath.startsWith("/") ? trimmedPath : `/${trimmedPath}`;
  }
  return pathname;
}

function isRootRoutePath(pathname: string) {
  return pathname === "/" || pathname === "" || pathname === "/index.html";
}

function resolveRoute(pathname: string): AppRoute {
  const normalizedPathname = normalizeAppPath(pathname);

  if (isDonateRoutePath(normalizedPathname)) {
    return { kind: "donate" };
  }

  const blogPostMatch = normalizedPathname.match(/^\/blog\/([^/]+)(?:\/index\.html)?\/?$/);
  if (blogPostMatch) {
    const post = blogPosts.find((entry) => entry.slug === blogPostMatch[1]);
    if (post) {
      return { kind: "blog-post", post };
    }
  }

  if (/^\/blog(?:\/index\.html)?\/?$/.test(normalizedPathname)) {
    return { kind: "blog" };
  }

  if (/^\/use-cases(?:\/index\.html)?\/?$/.test(normalizedPathname)) {
    return { kind: "use-cases" };
  }

  if (isRootRoutePath(normalizedPathname)) {
    return { kind: "home" };
  }

  return { kind: "home" };
}

function formatBlogDate(value: string) {
  const publishedAt = new Date(value);
  if (Number.isNaN(publishedAt.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(publishedAt);
}

function toHomeSectionHref(hash: string, isHomeRoute: boolean) {
  return isHomeRoute ? hash : `${withBasePath("")}${hash}`;
}

function pageTitleForRoute(route: AppRoute) {
  if (route.kind === "use-cases") {
    return "Axichat - Use Cases";
  }
  if (route.kind === "blog") {
    return "Axichat - Blog";
  }
  if (route.kind === "blog-post") {
    return `${route.post.title} - Axichat Blog`;
  }
  if (route.kind === "donate") {
    return "Support Axichat";
  }
  return `Axichat - ${heroHeadline}`;
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

function PlatformMark({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return <img src={src} alt={alt} className={cn("block object-contain", className)} />;
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 4.5v9.75" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m8.75 11.5 3.25 3.25 3.25-3.25" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5.5 18.5h13" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
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
        const side = index % 2 === 0 ? "right" : "left";

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
      <div className="mb-4">
        <h3 className="text-lg font-display font-semibold text-black">{lane.title}</h3>
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

      {lane.status === "upcoming" ? (
        <div className="mt-5">
          <a
            href="https://github.com/axichat/axichat/issues"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-black/70 underline underline-offset-4 transition hover:text-black"
          >
            Feature requests
          </a>
        </div>
      ) : null}
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

function MastodonIcon({ className }: { className?: string }) {
  return <img src={mastodonLogoPurple} alt="" className={className} aria-hidden />;
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

function DownloadButton({
  href,
  disabled,
  os,
  file,
  backgroundColor,
  borderColor,
  textColor,
  fileColor,
  iconBackgroundColor,
  iconBorderColor,
  icon,
  widthPx,
}: DownloadItem & { widthPx: number }) {
  const primaryTextColor = textColor ?? "#ffffff";
  const secondaryTextColor = fileColor ?? "rgba(255,255,255,0.75)";
  const iconBackground =
    iconBackgroundColor ?? (disabled || !href ? "rgba(255,255,255,0.42)" : "rgba(255,255,255,0.15)");
  const iconBorder = iconBorderColor ?? (disabled || !href ? "rgba(17,17,17,0.12)" : "rgba(255,255,255,0.2)");

  const content = (
    <>
      <div className="flex min-w-0 items-center gap-2 text-left">
        <div
          className="grid h-8 w-8 place-items-center rounded-md border"
          style={{ borderColor: iconBorder, backgroundColor: iconBackground }}
        >
          {icon}
        </div>
        <div className="leading-tight text-left">
          <div className="whitespace-nowrap text-xs font-semibold" style={{ color: primaryTextColor }}>
            {os}
          </div>
          <div className="whitespace-nowrap text-[10px]" style={{ color: secondaryTextColor }}>
            {file}
          </div>
        </div>
      </div>
      {!disabled && href ? <DownloadIcon className="h-3.5 w-3.5 shrink-0 opacity-90 transition group-hover:opacity-100" /> : null}
    </>
  );

  const commonClassName = cn(
    "group relative flex h-14 max-w-full self-center items-center justify-between gap-2 rounded-lg border px-3.5",
    disabled ? "cursor-default" : "transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-black/25"
  );
  const commonStyle = { backgroundColor, borderColor, width: `${widthPx}px` };

  if (disabled || !href) {
    return (
      <div className={commonClassName} style={commonStyle} aria-disabled="true">
        {content}
      </div>
    );
  }

  return (
    <a href={href} className={commonClassName} style={commonStyle}>
      {content}
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
      aria-label="Get your.name at axi.im now"
    >
      <span>Get</span>
      <span className="inline-flex items-baseline gap-0">
        <span>your.name</span>
        <span className="username-shimmer">@axi.im</span>
      </span>
      <span>now</span>
    </a>
  );
}

function UsernameTagline({ className }: { className?: string }) {
  return (
    <p
      className={cn("text-balance text-2xl font-display font-semibold tracking-tight text-black sm:text-3xl", className)}
      aria-label="Get your.name at axi.im now"
    >
      <span className="text-black/80">Get </span>
      <span className="inline-flex items-baseline gap-0">
        <span className="text-black/80">your.name</span>
        <span className="username-shimmer-hero">@axi.im</span>
      </span>
      <span className="text-black/80"> now</span>
    </p>
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

function MenuIcon({ className, open }: { className?: string; open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d={open ? "M6 6 18 18" : "M4.5 7.25h15"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d={open ? "M18 6 6 18" : "M4.5 12h15"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {!open ? <path d="M4.5 16.75h15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /> : null}
    </svg>
  );
}

function PageIntro({
  kicker,
  title,
  subtitle,
  actions,
}: {
  kicker?: string;
  title: string;
  subtitle: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="border-b border-black/10 py-16 sm:py-24">
      <Container>
        <div className="max-w-3xl">
          {kicker ? <div className="text-xs font-semibold uppercase tracking-[0.24em] text-black/55">{kicker}</div> : null}
          <h1 className="mt-3 text-balance font-display text-4xl font-semibold tracking-tight text-black sm:text-6xl">
            {title}
          </h1>
          <div className="mt-4 text-base leading-relaxed text-black/72 sm:text-lg">{subtitle}</div>
          {actions ? <div className="mt-8 flex flex-wrap items-center gap-3">{actions}</div> : null}
        </div>
      </Container>
    </section>
  );
}

function SiteHeader({
  brandLogoSrc,
  isHomeRoute,
  mobileMenuOpen,
  onToggleMobileMenu,
  onCloseMobileMenu,
}: {
  brandLogoSrc: string;
  isHomeRoute: boolean;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onCloseMobileMenu: () => void;
}) {
  const primaryNavItems = [
    { label: "Downloads", href: downloadsPageHref },
    { label: "Features", href: toHomeSectionHref("#features", isHomeRoute) },
    ...(showEditorialLinks
      ? [
          { label: "Use Cases", href: withBasePath("use-cases/") },
          { label: "Blog", href: withBasePath("blog/") },
        ]
      : []),
    { label: "FAQ", href: toHomeSectionHref("#faq", isHomeRoute) },
    { label: "Roadmap", href: toHomeSectionHref("#about", isHomeRoute) },
    { label: "Contact", href: toHomeSectionHref("#contact", isHomeRoute) },
  ];

  const mobileMenuItems = primaryNavItems;
  const homeHref = toHomeSectionHref("#top", isHomeRoute);

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/90 backdrop-blur">
      <Container>
        <div className="flex h-16 items-center justify-between gap-3">
          <a href={homeHref} className="flex min-w-0 items-center gap-3">
            <BrandIcon alt="Axichat" src={brandLogoSrc} className="h-14 w-14 shrink-0" />
            <div
              className="truncate text-2xl leading-none tracking-[0.015em]"
              style={{ fontFamily: "Gabarito, ui-sans-serif, system-ui", fontWeight: 500 }}
            >
              Axichat
            </div>
          </a>

          <nav className="hidden items-center gap-5 lg:flex">
            {primaryNavItems.map((item) => (
              <NavLink key={item.label} href={item.href}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com/axichat/axichat"
              target="_blank"
              rel="noreferrer"
              aria-label="Open Axichat on GitHub"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-black/15 bg-white text-black transition hover:bg-black/[0.03] focus:outline-none focus:ring-2 focus:ring-black/25"
            >
              <GitHubIcon className="h-5 w-5" />
            </a>

            <UsernameCta
              href={downloadsPageHref}
              className="hidden shrink-0 border border-black bg-black text-[10px] text-white hover:bg-black/85 lg:inline-flex lg:text-xs"
            />

            <button
              type="button"
              onClick={onToggleMobileMenu}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              className="inline-flex items-center gap-2 rounded-xl border border-black/15 bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-black/[0.03] focus:outline-none focus:ring-2 focus:ring-black/25 lg:hidden"
            >
              <span>Menu</span>
              <MenuIcon className="h-4 w-4" open={mobileMenuOpen} />
            </button>
          </div>
        </div>

        <div
          className={cn(
            "overflow-hidden transition-[max-height,opacity,padding] duration-200 lg:hidden",
            mobileMenuOpen ? "max-h-[32rem] border-t border-black/10 py-4 opacity-100" : "max-h-0 py-0 opacity-0"
          )}
        >
          <nav className="flex flex-col gap-1">
            {mobileMenuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={onCloseMobileMenu}
                className="rounded-xl px-3 py-2 text-sm text-black/75 transition hover:bg-black/[0.03] hover:text-black"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </Container>
    </header>
  );
}

function HomePage({
  autoplayBlocked,
  downloadButtons,
  heroDownloadWidthPx,
  heroPoster,
  heroVideoRef,
  highlightUnregisterFaq,
  latestReleaseDate,
  latestVersion,
  onFdroidBadgeLoad,
  onPlayVideo,
}: {
  autoplayBlocked: boolean;
  downloadButtons: DownloadItem[];
  heroDownloadWidthPx: number;
  heroPoster: string;
  heroVideoRef: React.RefObject<HTMLVideoElement>;
  highlightUnregisterFaq: boolean;
  latestReleaseDate: string;
  latestVersion: string;
  onFdroidBadgeLoad: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  onPlayVideo: () => void;
}) {
  return (
    <>
      <section className="border-b border-black/10 py-12 sm:py-20 lg:py-40">
        <Container>
          <div className="grid items-start gap-y-7 gap-x-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center lg:gap-y-10 lg:gap-x-[clamp(0.55rem,1.9vw,1.9rem)] xl:gap-x-[clamp(0.9rem,2.3vw,2.5rem)]">
            <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
              <div className="mx-auto mb-5 inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border border-black/15 bg-white px-4 py-2.5 text-black/65 lg:mx-0">
                <span className="font-mono text-base font-semibold text-black sm:text-lg">{latestVersion}</span>
                {latestReleaseDate ? <span className="text-xs text-black/55">Released {latestReleaseDate}</span> : null}
              </div>

              <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl font-display">{heroHeadline}</h1>

              <UsernameTagline className="mx-auto mt-10 max-w-xl sm:mt-12 lg:mx-0" />

              <div
                id="hero-downloads"
                className="mx-auto mt-4 inline-grid grid-cols-1 items-center justify-items-center gap-3 sm:grid-cols-2 lg:mx-0 lg:justify-items-start"
              >
                {showPublicFdroidButton ? (
                  <a
                    href={fdroidDownloadHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block max-w-full transition focus:outline-none focus:ring-2 focus:ring-black/25"
                    style={{ width: `${heroDownloadWidthPx}px` }}
                  >
                    <img
                      src={fdroidBadgeSrc}
                      alt="Get it on F-Droid"
                      className="block w-auto"
                      style={{ height: `${heroStoreBadgeHeightPx}px` }}
                      onLoad={onFdroidBadgeLoad}
                    />
                  </a>
                ) : null}
                {downloadButtons.map((item) => (
                  <DownloadButton key={item.os} widthPx={heroDownloadWidthPx} {...item} />
                ))}
              </div>

              <div className="mt-3 text-xs text-black/55 lg:text-left">{heroNote}</div>
            </div>

            <div className="mx-auto w-full max-w-[44rem] lg:mx-0 lg:max-w-none">
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
                    onClick={onPlayVideo}
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

      <section id="features" className="py-28 sm:py-40">
        <Container>
          <div className="space-y-28">
            {featureRows.map((feature, index) => {
              const textBlock = (
                <div>
                  <h3 className="text-4xl sm:text-5xl font-display font-semibold tracking-tight text-black">{feature.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-black/70">{feature.summary}</p>

                  <ul className="mt-5 list-disc space-y-2 pl-5 text-sm text-black/75 marker:text-black/70">
                    {feature.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              );

              if (feature.mockups.length === 2) {
                const rightSideMockup = feature.mockups.find((mockup) => mockup.src.endsWith("/01.png")) ?? feature.mockups[1];
                const leftSideMockup =
                  feature.mockups.find((mockup) => mockup.src !== rightSideMockup.src) ?? feature.mockups[0];
                const leftOffsetClass = index % 2 === 0 ? "lg:-translate-y-2" : "lg:translate-y-2";
                const rightOffsetClass = index % 2 === 0 ? "lg:translate-y-3" : "lg:-translate-y-1";

                return (
                  <article
                    key={feature.title}
                    className="grid items-start gap-12 pb-28 last:pb-0 lg:gap-8 xl:gap-10 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)_minmax(0,18rem)] xl:grid-cols-[minmax(0,21rem)_minmax(0,1fr)_minmax(0,21rem)] 2xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)_minmax(0,24rem)] lg:items-center"
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
                        "hidden w-full max-w-full justify-self-start transition-transform duration-300 lg:block lg:-translate-x-2 xl:-translate-x-8 2xl:-translate-x-12",
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
                        "hidden w-full max-w-full justify-self-end transition-transform duration-300 lg:block lg:translate-x-2 xl:translate-x-8 2xl:translate-x-12",
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
                  className="grid items-start gap-12 pb-28 last:pb-0 lg:gap-8 xl:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] xl:grid-cols-[minmax(0,1fr)_minmax(0,21rem)] 2xl:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-center"
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

      <section id="faq" className="border-y border-black/10 py-28 sm:py-40">
        <Container>
          <SectionHeader title="FAQ" />
          <div className="flex flex-col gap-4">
            {faqItems.map((item) => (
              <div
                key={item.question}
                id={item.id}
                className={cn(
                  "scroll-mt-24 rounded-2xl border border-black/10 bg-white px-5 py-4 transition-shadow",
                  item.id === unregisterFaqId && highlightUnregisterFaq ? "animate-[faq-unregister-highlight_1.8s_ease-out]" : ""
                )}
              >
                <div className="text-sm font-semibold text-black">{item.question}</div>
                <div className="mt-3 text-sm leading-relaxed text-black/70">{item.answer}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section id="about" className="py-28 sm:py-40">
        <Container>
          <SectionHeader title="Roadmap" />

          <div className="grid gap-4 md:grid-cols-2">
            {roadmapLanes.map((lane) => (
              <RoadmapLaneCard key={lane.title} lane={lane} />
            ))}
          </div>
        </Container>
      </section>

      <section id="contact" className="border-t border-black/10 py-28 sm:py-40">
        <Container>
          <SectionHeader
            title="Contact"
            subtitle={
              <>
                <span>Email: </span>
                <a href="mailto:support@axi.chat" className="underline underline-offset-4">
                  support@axi.chat
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

    </>
  );
}

function UseCasesPage() {
  return (
    <>
      <PageIntro
        kicker="Use Cases"
        title="Where Axichat fits best"
        subtitle="Axichat is strongest where chat, email, and calendar are constantly leaking into each other. These are the workflows it is designed to simplify."
        actions={
          <>
            {showEditorialLinks ? (
              <a
                href={withBasePath("blog/")}
                className="inline-flex items-center rounded-xl border border-black/15 bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-black/[0.03]"
              >
                Read the blog
              </a>
            ) : null}
            <a
              href={downloadsPageHref}
              className="inline-flex items-center rounded-xl border border-black bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-black/85"
            >
              Download Axichat
            </a>
          </>
        }
      />

      <section className="py-16 sm:py-24">
        <Container>
          <div className="grid gap-6 xl:grid-cols-2">
            {useCases.map((useCase) => (
              <article
                key={useCase.title}
                className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.05)] sm:p-7"
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">{useCase.audience}</div>
                <h2 className="mt-4 text-3xl font-display font-semibold tracking-tight text-black">{useCase.title}</h2>
                <p className="mt-4 text-sm leading-relaxed text-black/72">{useCase.summary}</p>
                <ul className="mt-5 list-disc space-y-2 pl-5 text-sm text-black/75 marker:text-black/70">
                  {useCase.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
                <div className="mt-6 rounded-2xl border border-black/10 bg-black/[0.03] px-4 py-3 text-sm font-medium text-black/80">
                  {useCase.highlight}
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-black/10 py-16 sm:py-24">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-black/55">Best When</div>
              <h2 className="mt-3 text-3xl font-display font-semibold tracking-tight text-black sm:text-4xl">
                You want fewer tools in the loop
              </h2>
            </div>
            <div className="grid gap-3">
              {[
                "Your current workflow depends on jumping between chat, inbox, and calendar just to finish one task.",
                "You care about open protocols, self-hosting options, or being able to explain what the software is actually doing.",
                "You want communication software that feels fast without forcing everyone into another closed SaaS workspace.",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-black/10 bg-white px-5 py-4 text-sm leading-relaxed text-black/75">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

function BlogIndexPage() {
  return (
    <>
      <PageIntro
        kicker="Blog"
        title="Notes on product direction, releases, and protocol choices"
        subtitle="This is where Axichat can explain what changed and why it matters, without reducing everything to release bullet points."
        actions={
          showEditorialLinks ? (
            <a
              href={withBasePath("use-cases/")}
              className="inline-flex items-center rounded-xl border border-black/15 bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-black/[0.03]"
            >
              Explore use cases
            </a>
          ) : undefined
        }
      />

      <section className="py-16 sm:py-24">
        <Container>
          <div className="grid gap-5">
            {blogPosts.map((post) => (
              <article
                key={post.slug}
                className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.05)] sm:p-7"
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-black/55">
                  <span className="rounded-full border border-black/10 bg-black/[0.03] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-black/65">
                    {post.category}
                  </span>
                  <span>{formatBlogDate(post.publishedAt)}</span>
                  <span>{post.readingTime}</span>
                </div>
                <h2 className="mt-4 text-3xl font-display font-semibold tracking-tight text-black">{post.title}</h2>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-black/72">{post.summary}</p>
                <a
                  href={withBasePath(`blog/${post.slug}/`)}
                  className="mt-6 inline-flex items-center rounded-xl border border-black bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-black/85"
                >
                  Read article
                </a>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}

function BlogPostPage({ post }: { post: BlogPost }) {
  return (
    <>
      <section className="border-b border-black/10 py-16 sm:py-24">
        <Container>
          <div className="max-w-3xl">
            {showEditorialLinks ? (
              <a
                href={withBasePath("blog/")}
                className="inline-flex items-center text-sm font-medium text-black/60 transition hover:text-black"
              >
                Back to blog
              </a>
            ) : null}
            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-black/55">
              <span className="rounded-full border border-black/10 bg-black/[0.03] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-black/65">
                {post.category}
              </span>
              <span>{formatBlogDate(post.publishedAt)}</span>
              <span>{post.readingTime}</span>
            </div>
            <h1 className="mt-4 text-balance font-display text-4xl font-semibold tracking-tight text-black sm:text-6xl">
              {post.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-black/72 sm:text-lg">{post.summary}</p>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-24">
        <Container>
          <article className="max-w-3xl rounded-[2rem] border border-black/10 bg-white px-6 py-8 text-base leading-8 text-black/80 shadow-[0_20px_60px_rgba(0,0,0,0.05)] sm:px-8">
            {post.body}
          </article>
        </Container>
      </section>

      {showEditorialLinks ? (
        <section className="border-t border-black/10 py-16 sm:py-24">
          <Container>
            <div className="rounded-[2rem] border border-black/10 bg-black/[0.03] px-6 py-8">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-black/55">Next</div>
              <h2 className="mt-3 text-3xl font-display font-semibold tracking-tight text-black">Keep exploring</h2>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href={withBasePath("blog/")}
                  className="inline-flex items-center rounded-xl border border-black/15 bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-black/[0.03]"
                >
                  More posts
                </a>
                <a
                  href={withBasePath("use-cases/")}
                  className="inline-flex items-center rounded-xl border border-black bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-black/85"
                >
                  Use cases
                </a>
              </div>
            </div>
          </Container>
        </section>
      ) : null}
    </>
  );
}

function SiteFooter({
  serverStatus,
}: {
  serverStatus: { email: ServiceIndicatorState; chat: ServiceIndicatorState };
}) {
  return (
    <footer className="border-t border-black/10 py-12">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex max-w-sm flex-col gap-2">
            <div className="rounded-xl border border-black/10 bg-white px-3 py-2">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/55">Status</div>
              <div className="mt-2 flex flex-col gap-2 text-xs text-black/70">
                <span className="grid grid-cols-[3.5rem_auto_1fr] items-center gap-x-2">
                  <span>Email:</span>
                  <span className={cn("h-2 w-2 rounded-full", statusDotClass(serverStatus.email))} />
                  <span className="font-semibold text-black">{statusLabel(serverStatus.email)}</span>
                </span>
                <span className="grid grid-cols-[3.5rem_auto_1fr] items-center gap-x-2">
                  <span>Chat:</span>
                  <span className={cn("h-2 w-2 rounded-full", statusDotClass(serverStatus.chat))} />
                  <span className="font-semibold text-black">{statusLabel(serverStatus.chat)}</span>
                </span>
              </div>
            </div>
            <div className="mt-2 text-xs text-black/60">© {new Date().getFullYear()} Axichat LLC</div>
            <a href={withBasePath("LICENSE.txt")} className="text-xs text-black/60 transition hover:text-black">
              AGPL-3.0
            </a>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            <div className="space-y-3">
              <div className="flex flex-col gap-2">
                {footerLinks.legal.map((link) => (
                  <a key={link.href} href={link.href} className="text-sm text-black/70 transition hover:text-black">
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col gap-2">
                {footerLinks.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noreferrer" : undefined}
                    className="inline-flex items-center gap-2 text-sm text-black/70 transition hover:text-black"
                  >
                    {link.label === "GitHub" ? <GitHubIcon className="h-4 w-4" /> : null}
                    {link.label === "GitLab" ? <GitLabIcon className="h-4 w-4" /> : null}
                    {link.label === "Mastodon" ? <MastodonIcon className="h-4 w-4" /> : null}
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <UsernameCta
                href={downloadsPageHref}
                className="w-fit border border-black bg-black px-4 py-2 text-[11px] text-white hover:bg-black/85 sm:text-xs"
              />
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}

function isDonateRoutePath(pathname: string) {
  return /\/donate(?:\/index\.html)?\/?$/.test(pathname);
}

function DonatePage() {
  return (
    <div className="grid min-h-screen place-items-center bg-white px-6 text-black">
      <main className="w-full max-w-2xl text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">I'm glad you like Axichat!</h1>
        <p className="mt-4 text-black/80">
          Your support helps me maintain the app and servers. No pressure... even if you don't donate I'll probably
          maintain it anyway.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a href="https://www.buymeacoffee.com/axichat" target="_blank" rel="noreferrer">
            <img
              src="https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=axichat&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff"
              alt="Buy me a coffee"
              style={{ border: 0, height: 48 }}
              loading="eager"
              decoding="async"
            />
          </a>
          <a
            href="https://ko-fi.com/S6S01VF1Z1"
            target="_blank"
            rel="noreferrer"
            className="inline-block transition hover:brightness-95"
          >
            <img
              src="https://storage.ko-fi.com/cdn/kofi6.png?v=6"
              alt="Buy Me a Coffee at ko-fi.com"
              style={{ border: 0, height: 48 }}
              loading="lazy"
              decoding="async"
            />
          </a>
        </div>
        <a className="mt-6 inline-block border-b border-black/35 text-black/85 transition hover:border-black/65 hover:text-black" href={withBasePath("")}>
          Back to main site
        </a>
      </main>
    </div>
  );
}

export default function App() {
  const route = resolveRoute(typeof window !== "undefined" ? window.location.pathname : "/");

  if (route.kind === "donate") {
    return <DonatePage />;
  }

  const isHomeRoute = route.kind === "home";
  const routeKey = route.kind === "blog-post" ? route.post.slug : route.kind;
  const heroVideoRef = React.useRef<HTMLVideoElement | null>(null);
  const [autoplayBlocked, setAutoplayBlocked] = React.useState(false);
  const [heroPoster, setHeroPoster] = React.useState<string>("");
  const [logoTone, setLogoTone] = React.useState<LogoTone>("dark");
  const [latestVersion, setLatestVersion] = React.useState<string>("loading...");
  const [latestReleaseDate, setLatestReleaseDate] = React.useState<string>("");
  const [heroDownloadWidthPx, setHeroDownloadWidthPx] = React.useState(206);
  const [activeHash, setActiveHash] = React.useState<string>(typeof window !== "undefined" ? window.location.hash : "");
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [serverStatus, setServerStatus] = React.useState<{ email: ServiceIndicatorState; chat: ServiceIndicatorState }>(
    {
      email: "unknown",
      chat: "unknown",
    }
  );

  React.useEffect(() => {
    document.title = pageTitleForRoute(route);
  }, [route, routeKey]);

  React.useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }
    const handleHashChange = () => {
      setMobileMenuOpen(false);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [mobileMenuOpen]);

  React.useEffect(() => {
    const syncHash = () => {
      setActiveHash(window.location.hash);
    };

    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => {
      window.removeEventListener("hashchange", syncHash);
    };
  }, []);

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
    if (!isHomeRoute) {
      return;
    }

    if (activeHash !== unregisterFaqHash) {
      return;
    }

    let frameId = 0;
    let timeoutId = 0;
    const scrollToFaq = () => {
      const target = document.getElementById(unregisterFaqId);
      if (!target) {
        return;
      }
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    frameId = window.requestAnimationFrame(() => {
      timeoutId = window.setTimeout(scrollToFaq, 80);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, [activeHash, isHomeRoute, routeKey]);

  React.useEffect(() => {
    if (typeof window === "undefined" || window.location.hash === activeHash) {
      return;
    }
    setActiveHash(window.location.hash);
  }, [activeHash, routeKey]);

  React.useEffect(() => {
    if (!isHomeRoute) {
      return;
    }

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
  }, [isHomeRoute]);

  React.useEffect(() => {
    if (!isHomeRoute) {
      return;
    }

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
  }, [isHomeRoute]);

  const downloadButtons: DownloadItem[] = [
    {
      href: downloads.android,
      os: "Android",
      file: ".apk",
      backgroundColor: "#34A853",
      borderColor: "#34A853",
      iconBackgroundColor: "rgba(255,255,255,0.94)",
      iconBorderColor: "rgba(255,255,255,0.58)",
      icon: <PlatformMark src="/images/platforms/android.svg" alt="" className="h-[26px] w-[26px]" />,
    },
    {
      href: downloads.windows,
      os: "Windows",
      file: "Installer .exe",
      backgroundColor: "#2563EB",
      borderColor: "#2563EB",
      iconBackgroundColor: "rgba(255,255,255,0.96)",
      iconBorderColor: "rgba(255,255,255,0.64)",
      icon: <PlatformMark src="/images/platforms/windows.svg" alt="" className="h-[26px] w-[26px]" />,
    },
    {
      href: downloads.linux,
      os: "Linux",
      file: "AppImage",
      backgroundColor: "#DC143C",
      borderColor: "#DC143C",
      iconBackgroundColor: "rgba(255,255,255,0.96)",
      iconBorderColor: "rgba(255,255,255,0.58)",
      icon: <PlatformMark src="/images/platforms/linux.svg" alt="" className="h-[26px] w-[26px]" />,
    },
    {
      disabled: true,
      os: "iOS/macOS",
      file: "Coming soon",
      backgroundColor: "#C0C0C0",
      borderColor: "#C0C0C0",
      textColor: "#111111",
      fileColor: "rgba(17,17,17,0.72)",
      iconBackgroundColor: "rgba(255,255,255,0.92)",
      iconBorderColor: "rgba(17,17,17,0.14)",
      icon: <PlatformMark src="/images/platforms/apple.svg" alt="" className="h-[26px] w-[26px]" />,
    },
  ];

  const handleFdroidBadgeLoad = React.useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    if (!naturalWidth || !naturalHeight) {
      return;
    }
    const measuredWidth = Math.round((naturalWidth / naturalHeight) * heroStoreBadgeHeightPx);
    const boundedWidth = Math.max(160, Math.min(320, measuredWidth));
    setHeroDownloadWidthPx((current) => (current === boundedWidth ? current : boundedWidth));
  }, []);

  const handlePlayVideo = React.useCallback(() => {
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
  }, []);

  let pageContent: React.ReactNode;
  if (route.kind === "use-cases") {
    pageContent = <UseCasesPage />;
  } else if (route.kind === "blog") {
    pageContent = <BlogIndexPage />;
  } else if (route.kind === "blog-post") {
    pageContent = <BlogPostPage post={route.post} />;
  } else {
    pageContent = (
      <HomePage
        autoplayBlocked={autoplayBlocked}
        downloadButtons={downloadButtons}
        heroDownloadWidthPx={heroDownloadWidthPx}
        heroPoster={heroPoster}
        heroVideoRef={heroVideoRef}
        highlightUnregisterFaq={isHomeRoute && activeHash === unregisterFaqHash}
        latestReleaseDate={latestReleaseDate}
        latestVersion={latestVersion}
        onFdroidBadgeLoad={handleFdroidBadgeLoad}
        onPlayVideo={handlePlayVideo}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-white text-black font-body">
      <style>{`
        @keyframes faq-unregister-highlight {
          0% {
            background-color: rgba(255, 243, 199, 0);
            box-shadow: 0 0 0 0 rgba(196, 138, 10, 0);
          }
          18% {
            background-color: rgba(255, 243, 199, 0.95);
            box-shadow: 0 0 0 10px rgba(196, 138, 10, 0.16);
          }
          100% {
            background-color: rgba(255, 243, 199, 0);
            box-shadow: 0 0 0 0 rgba(196, 138, 10, 0);
          }
        }
      `}</style>
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 surface-grid opacity-60" />
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-black/5 blur-3xl animate-floatSlow" />
        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-black/[0.03] blur-3xl" />
      </div>

      <SiteHeader
        brandLogoSrc={brandLogoSrc}
        isHomeRoute={isHomeRoute}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => {
          setMobileMenuOpen((current) => !current);
        }}
        onCloseMobileMenu={() => {
          setMobileMenuOpen(false);
        }}
      />

      <main id="top">{pageContent}</main>

      <SiteFooter serverStatus={serverStatus} />
    </div>
  );
}
