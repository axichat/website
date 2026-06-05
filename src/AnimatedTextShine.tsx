import React from "react";

export type AnimatedTextShineProps = {
  children: React.ReactNode;
  className?: string;
  duration?: number | string;
  pauseDuration?: number | string;
  baseColor?: string;
  shineColors?: string[];
};

type ShineStyle = React.CSSProperties & Record<`--shine-${string}`, string>;

const defaultDurationMs = 3500;
const defaultPauseDurationMs = 5000;
const defaultShineColors = ["#7dd3fc", "#c084fc", "#f0abfc"];

function durationToMs(value: number | string | undefined, fallbackMs: number) {
  if (typeof value === "number") {
    return Number.isFinite(value) && value >= 0 ? value : fallbackMs;
  }
  if (!value) {
    return fallbackMs;
  }

  const match = value.trim().match(/^(\d+(?:\.\d+)?)(ms|s)$/i);
  if (!match) {
    return fallbackMs;
  }

  const amount = Number.parseFloat(match[1]);
  return match[2].toLowerCase() === "s" ? amount * 1000 : amount;
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function easeOutCubic(value: number) {
  const t = clamp01(value);
  return 1 - Math.pow(1 - t, 3);
}

function easeOutQuart(value: number) {
  const t = clamp01(value);
  return 1 - Math.pow(1 - t, 4);
}

function shineMotion(value: number) {
  const centerTime = 0.42;
  const t = clamp01(value);

  if (t < centerTime) {
    const local = t / centerTime;
    return 0.5 * (0.74 * easeOutCubic(local) + 0.26 * local);
  }

  const local = (t - centerTime) / (1 - centerTime);
  return 0.5 + 0.5 * easeOutQuart(local);
}

function smoothstep(value: number) {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

function pct(value: number) {
  return `${value.toFixed(3)}%`;
}

export function AnimatedTextShine({
  children,
  className,
  duration = defaultDurationMs,
  pauseDuration = defaultPauseDurationMs,
  baseColor = "currentColor",
  shineColors = defaultShineColors,
}: AnimatedTextShineProps) {
  const durationMs = durationToMs(duration, defaultDurationMs);
  const pauseDurationMs = durationToMs(pauseDuration, defaultPauseDurationMs);
  const rootRef = React.useRef<HTMLSpanElement | null>(null);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return undefined;
    }

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = 0;
    let pauseTimer = 0;
    let cancelled = false;

    const setOpacity = (opacity: number) => {
      root.style.setProperty("--shine-mix", `${(opacity * 100).toFixed(1)}%`);
    };

    const setFrame = (progress: number) => {
      const eased = shineMotion(progress);
      const center = -30 + 160 * eased;
      const distanceFromMidpoint = Math.min(1, Math.abs(center - 50) / 80);
      const proximityToMidpoint = 1 - distanceFromMidpoint;
      const spread = 0.9 + 3.6 * smoothstep(proximityToMidpoint);
      const offsets = [-8, -4, 0, 4, 8];
      const edgeOffset = 12;
      const fadeIn = smoothstep(progress / 0.1);
      const fadeOut = 1 - smoothstep((progress - 0.9) / 0.1);

      root.style.setProperty("--shine-start", pct(center - edgeOffset * spread));
      root.style.setProperty("--shine-p1", pct(center + offsets[0] * spread));
      root.style.setProperty("--shine-p2", pct(center + offsets[1] * spread));
      root.style.setProperty("--shine-p3", pct(center + offsets[2] * spread));
      root.style.setProperty("--shine-p4", pct(center + offsets[3] * spread));
      root.style.setProperty("--shine-p5", pct(center + offsets[4] * spread));
      root.style.setProperty("--shine-end", pct(center + edgeOffset * spread));
      setOpacity(Math.min(fadeIn, fadeOut));
    };

    const start = () => {
      if (cancelled || reducedMotionQuery.matches) {
        return;
      }
      const startTime = performance.now();

      const tick = (now: number) => {
        if (cancelled || reducedMotionQuery.matches) {
          setOpacity(0);
          return;
        }
        const progress = clamp01((now - startTime) / durationMs);
        setFrame(progress);

        if (progress < 1) {
          animationFrame = window.requestAnimationFrame(tick);
        } else {
          setOpacity(0);
          pauseTimer = window.setTimeout(start, pauseDurationMs);
        }
      };

      animationFrame = window.requestAnimationFrame(tick);
    };

    const handleMotionPreferenceChange = () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(pauseTimer);
      setOpacity(0);
      start();
    };

    const addMotionPreferenceListener = () => {
      if (typeof reducedMotionQuery.addEventListener === "function") {
        reducedMotionQuery.addEventListener("change", handleMotionPreferenceChange);
        return () => reducedMotionQuery.removeEventListener("change", handleMotionPreferenceChange);
      }

      reducedMotionQuery.addListener(handleMotionPreferenceChange);
      return () => reducedMotionQuery.removeListener(handleMotionPreferenceChange);
    };

    const removeMotionPreferenceListener = addMotionPreferenceListener();
    setOpacity(0);
    if (!reducedMotionQuery.matches) {
      start();
    }

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(pauseTimer);
      removeMotionPreferenceListener();
    };
  }, [durationMs, pauseDurationMs]);

  const colors = shineColors.length > 0 ? shineColors : defaultShineColors;
  const style = {
    "--shine-base": baseColor,
    "--shine-color-1": colors[0] ?? defaultShineColors[0],
    "--shine-color-2": colors[1] ?? colors[0] ?? defaultShineColors[1],
    "--shine-color-3": colors[2] ?? colors[1] ?? defaultShineColors[2],
    "--shine-color-4": colors[3] ?? colors[2] ?? colors[1] ?? defaultShineColors[2],
    "--shine-color-5": colors[4] ?? colors[3] ?? colors[2] ?? defaultShineColors[2],
  } as ShineStyle;

  return (
    <span
      ref={rootRef}
      className={["animatedTextShine", className].filter(Boolean).join(" ")}
      style={style}
    >
      {children}
    </span>
  );
}
