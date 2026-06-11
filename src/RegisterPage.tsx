import React from "react";
import { createQrSvg } from "./qr";

type PublicAxiConfig = {
  backendBaseUrl: string;
  accountDomain: string;
  turnstileSiteKey: string;
};

type ConfigState = {
  config: PublicAxiConfig;
  error: string | null;
};

type ApiSuccess<T> = {
  ok: true;
  status: number;
  payload: T;
};

type ApiFailure = {
  ok: false;
  status?: number;
  error: string;
  network?: boolean;
  timeout?: boolean;
  payload?: unknown;
};

type ApiResult<T> = ApiSuccess<T> | ApiFailure;

type SignupSuccess = {
  email: string;
  username: string;
  ok?: boolean;
  recovery_setup_token: string;
  recovery_setup_expires_in_seconds: number;
};

type SignupSession = {
  email: string;
  username: string;
  password: string;
  recoverySetupToken: string;
  recoverySetupExpiresAt: number;
};

type SignupAttempt = {
  key: string;
  localpart: string;
  password: string;
  captchaVerified: boolean;
  turnstileToken: string;
};

type RecoveryCapabilities = {
  email?: boolean;
  totp?: boolean;
  phone?: boolean;
  login_2fa?: boolean;
};

type RecoveryEmailStart = {
  ok?: boolean;
  challenge_id: string;
  expires_in_seconds?: number;
  email_masked?: string;
};

type RecoveryEmailConfirm = {
  ok?: boolean;
  email_enabled?: boolean;
  email_masked?: string;
};

type TotpStart = {
  ok?: boolean;
  challenge_id: string;
  secret: string;
  otpauth_uri: string;
  expires_in_seconds?: number;
};

type TotpConfirm = {
  ok?: boolean;
  totp_enabled?: boolean;
};

type CompletedAccount = {
  email: string;
  username: string;
  recoveryMethods: string[];
};

type SignupFieldName = "localpart" | "password" | "passwordConfirmation" | "turnstile";
type SignupFieldErrors = Partial<Record<SignupFieldName, string>>;
type RecoveryEmailFieldName = "recoveryEmail" | "code";
type RecoveryEmailFieldErrors = Partial<Record<RecoveryEmailFieldName, string>>;
type TotpFieldErrors = Partial<Record<"code", string>>;

const localpartPattern = /^[a-z][a-z0-9._-]{3,19}$/;
const otpCodeLength = 6;
const passwordMaxLength = 64;
const weakEntropyBits = 50;
const strongerEntropyBits = 80;
const maxEntropyBits = 120;
const signupTemporaryErrors = new Set([
  "signup_service_unavailable",
  "mail_service_unavailable",
  "xmpp_service_unavailable",
]);
const captchaErrors = new Set(["captcha_required", "captcha_invalid", "captcha_failed", "captcha_unavailable"]);
const axiBackendDevProxyPath = "/__axi_backend";

function withBasePath(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function hasFieldErrors(errors: Record<string, string | undefined>) {
  return Object.values(errors).some(Boolean);
}

function passwordEntropyBits(password: string) {
  if (!password) {
    return 0;
  }
  let pool = 0;
  if (/[0-9]/.test(password)) {
    pool += 10;
  }
  if (/[a-z]/.test(password)) {
    pool += 26;
  }
  if (/[A-Z]/.test(password)) {
    pool += 26;
  }
  if (/[^0-9a-zA-Z]/.test(password)) {
    pool += 33;
  }
  return password.length * Math.log2(Math.max(pool, 1));
}

function passwordStrengthLevel(password: string) {
  if (!password) {
    return { label: "None", textClass: "text-rose-600", barClass: "bg-rose-600" };
  }
  const bits = passwordEntropyBits(password);
  if (bits < weakEntropyBits) {
    return { label: "Weak", textClass: "text-rose-600", barClass: "bg-rose-600" };
  }
  if (bits < strongerEntropyBits) {
    return { label: "Medium", textClass: "text-[#FD7E14]", barClass: "bg-[#FD7E14]" };
  }
  return { label: "Stronger", textClass: "text-[#00C853]", barClass: "bg-[#00C853]" };
}

async function sha1HexUpper(text: string) {
  const digest = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

async function isPasswordPwned(password: string): Promise<boolean> {
  try {
    const hash = await sha1HexUpper(password);
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      return false;
    }
    const body = await response.text();
    return body.split(/\r?\n/).some((line) => line.split(":")[0]?.trim().toUpperCase() === suffix);
  } catch {
    return false;
  }
}

function isPlaceholder(value: string) {
  const trimmed = value.trim();
  return trimmed === "" || /^<[^>]+>$/.test(trimmed) || trimmed.includes("example.com");
}

function readConfig(): ConfigState {
  const fallback: PublicAxiConfig = {
    backendBaseUrl: "",
    accountDomain: "axi.im",
    turnstileSiteKey: "",
  };
  const config = typeof window !== "undefined" && window.AXI_CONFIG ? window.AXI_CONFIG : fallback;
  const normalized = {
    backendBaseUrl: String(config.backendBaseUrl ?? "").replace(/\/+$/, ""),
    accountDomain: String(config.accountDomain ?? "axi.im").trim() || "axi.im",
    turnstileSiteKey: String(config.turnstileSiteKey ?? "").trim(),
  };

  if (isPlaceholder(normalized.backendBaseUrl) || isPlaceholder(normalized.accountDomain)) {
    return {
      config: normalized,
      error: "Registration is not configured yet. Set backendBaseUrl in /config.js.",
    };
  }

  if (normalized.turnstileSiteKey !== "" && isPlaceholder(normalized.turnstileSiteKey)) {
    return {
      config: normalized,
      error: "Turnstile site key is invalid. Set a real site key in /config.js or leave it empty to disable verification.",
    };
  }

  try {
    const url = new URL(normalized.backendBaseUrl);
    const localHttp = url.protocol === "http:" && /^(localhost|127\.0\.0\.1|\[::1\])$/.test(url.hostname);
    if (url.protocol !== "https:" && !localHttp) {
      return { config: normalized, error: "Registration backend must use HTTPS." };
    }
  } catch {
    return { config: normalized, error: "Registration backend URL is invalid." };
  }

  return { config: normalized, error: null };
}

function createIdempotencyKey() {
  if (typeof crypto === "undefined") {
    throw new Error("crypto_unavailable");
  }
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  if (typeof crypto.getRandomValues !== "function") {
    throw new Error("crypto_unavailable");
  }

  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function apiBaseUrl(config: PublicAxiConfig) {
  if (import.meta.env.DEV && config.backendBaseUrl === "https://axi.im") {
    return axiBackendDevProxyPath;
  }
  return config.backendBaseUrl;
}

async function apiRequest<T>(
  config: PublicAxiConfig,
  path: string,
  options: {
    method: "GET" | "POST";
    body?: unknown;
    idempotencyKey?: string;
    recoverySetupToken?: string;
    timeoutMs?: number;
  }
): Promise<ApiResult<T>> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => {
    controller.abort();
  }, options.timeoutMs ?? 30000);

  const headers = new Headers();
  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (options.idempotencyKey) {
    headers.set("Idempotency-Key", options.idempotencyKey);
  }
  if (options.recoverySetupToken) {
    headers.set("X-Recovery-Setup-Token", options.recoverySetupToken);
  }

  try {
    const response = await fetch(`${apiBaseUrl(config)}${path}`, {
      method: options.method,
      credentials: "omit",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: controller.signal,
    });
    const text = await response.text();
    let payload: unknown = {};
    let jsonParseFailed = false;
    if (text.trim() !== "") {
      try {
        payload = JSON.parse(text) as unknown;
      } catch {
        jsonParseFailed = true;
        payload = { error: "bad_json" };
      }
    }

    if (jsonParseFailed) {
      return {
        ok: false,
        status: response.status,
        error: "bad_json",
        payload,
      };
    }

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: typeof payload === "object" && payload && "error" in payload ? String(payload.error) : `http_${response.status}`,
        payload,
      };
    }

    return { ok: true, status: response.status, payload: payload as T };
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === "AbortError";
    return {
      ok: false,
      error: timedOut ? "request_timeout" : "network_error",
      network: true,
      timeout: timedOut,
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function signupErrorMessage(code: string) {
  switch (code) {
    case "idempotency_key_required":
    case "invalid_idempotency_key":
      return "Registration could not start because the browser generated an invalid request. Try again.";
    case "idempotency_conflict":
      return "This signup retry no longer matches the original request. Submit again to start a fresh attempt.";
    case "localpart_and_password_required":
      return "Enter a username and password.";
    case "invalid_localpart":
      return "Use only letters, numbers, periods, underscores, and hyphens.";
    case "password_too_short":
      return "Use at least 8 characters for the password.";
    case "captcha_required":
      return "Complete the verification before creating the account.";
    case "captcha_invalid":
    case "captcha_failed":
      return "Verification failed. Try the challenge again.";
    case "captcha_unavailable":
      return "Verification is temporarily unavailable. Try again in a moment.";
    case "localpart_restricted":
      return "Usernames shorter than 4 characters are not available through website registration.";
    case "localpart_reserved":
      return "That username is temporarily reserved by another attempt. Wait a moment or choose another.";
    case "account_exists":
      return "That username is unavailable.";
    case "rate_limited":
      return "Too many signup attempts. Wait before trying again.";
    case "signup_service_unavailable":
    case "mail_service_unavailable":
    case "xmpp_service_unavailable":
      return "Account creation is temporarily unavailable. Retry with the same username and password.";
    case "repair_required":
      return "The account service needs operator attention. Contact support if this continues.";
    case "internal_error":
      return "The registration service hit an internal error. Try again later.";
    case "request_timeout":
      return "The request timed out. Retry with the same username and password.";
    case "network_error":
      return "Could not reach the registration service. Check your connection and retry.";
    case "crypto_unavailable":
      return "This browser cannot generate secure signup identifiers.";
    default:
      return "Registration failed. Try again.";
  }
}

function disabledTurnstileSignupErrorMessage(code: string) {
  if (captchaErrors.has(code)) {
    return "Registration verification is disabled on this page, but the backend still requires Turnstile.";
  }
  return signupErrorMessage(code);
}

function validateSignupFields({
  canonicalLocalpart,
  password,
  passwordConfirmation,
  turnstileAccepted,
}: {
  canonicalLocalpart: string;
  password: string;
  passwordConfirmation: string;
  turnstileAccepted: boolean;
}): SignupFieldErrors {
  const errors: SignupFieldErrors = {};
  if (!canonicalLocalpart) {
    errors.localpart = "Enter a username.";
  } else if (!localpartPattern.test(canonicalLocalpart)) {
    errors.localpart = "4-20 characters, starting with a letter; letters, numbers, '.', '_', '-'.";
  }

  if (!password) {
    errors.password = "Enter a password.";
  } else if (password.length < 8) {
    errors.password = "Use at least 8 characters.";
  } else if (password.length > passwordMaxLength) {
    errors.password = "Must be 64 characters or fewer.";
  }

  if (!passwordConfirmation) {
    errors.passwordConfirmation = "Confirm your password.";
  } else if (password !== passwordConfirmation) {
    errors.passwordConfirmation = "Passwords do not match.";
  }

  if (!turnstileAccepted) {
    errors.turnstile = "Complete the verification before creating the account.";
  }

  return errors;
}

function signupServerFieldErrors(code: string, turnstileEnabled: boolean): SignupFieldErrors {
  switch (code) {
    case "localpart_and_password_required":
      return { localpart: "Enter a username.", password: "Enter a password." };
    case "invalid_localpart":
    case "localpart_restricted":
    case "localpart_reserved":
    case "account_exists":
      return { localpart: signupErrorMessage(code) };
    case "password_too_short":
      return { password: signupErrorMessage(code) };
    case "captcha_required":
    case "captcha_invalid":
    case "captcha_failed":
    case "captcha_unavailable":
      return turnstileEnabled ? { turnstile: signupErrorMessage(code) } : {};
    default:
      return {};
  }
}

function validateRecoveryEmail(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "Enter a recovery email.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return "Enter a valid email address.";
  }
  return "";
}

function validateRecoveryCode(value: string): string {
  if (value.trim().length < otpCodeLength) {
    return "Enter the 6-digit code.";
  }
  return "";
}

function validateTotpCode(value: string): string {
  if (value.trim().length < otpCodeLength) {
    return "Enter the 6-digit code.";
  }
  return "";
}

function recoveryErrorMessage(code: string) {
  switch (code) {
    case "recovery_setup_unauthorized":
      return "The recovery setup window expired or is no longer valid. Use the app for account recovery settings.";
    case "auth_failed":
      return "The password was not accepted. Try again while this setup window is open.";
    case "invalid_recovery_email":
      return "Enter a valid recovery email address.";
    case "recovery_email_unavailable":
      return "The recovery email could not be sent. Try again.";
    case "invalid_code":
      return "That code was not accepted.";
    case "challenge_expired":
      return "That challenge expired. Start this recovery method again.";
    case "challenge_failed":
      return "Too many wrong attempts. Start this recovery method again.";
    case "rate_limited":
      return "Too many attempts. Wait before trying again.";
    case "recovery_not_configured":
      return "This recovery method is not available right now.";
    case "recovery_service_unavailable":
    case "mail_service_unavailable":
      return "Recovery setup is temporarily unavailable. Try again.";
    case "request_timeout":
      return "The request timed out. Try again.";
    case "network_error":
      return "Could not reach the registration service. Check your connection and try again.";
    default:
      return "Recovery setup failed. Try again.";
  }
}

function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function TurnstileWidget({
  siteKey,
  disabled,
  resetNonce,
  onToken,
  onError,
}: {
  siteKey: string;
  disabled: boolean;
  resetNonce: number;
  onToken: (token: string) => void;
  onError: (message: string) => void;
}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const widgetIdRef = React.useRef<string | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (disabled) {
      return;
    }
    if (window.turnstile) {
      setReady(true);
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-axi-turnstile="true"]');
    if (existing) {
      const handleLoad = () => setReady(true);
      existing.addEventListener("load", handleLoad);
      return () => {
        existing.removeEventListener("load", handleLoad);
      };
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.dataset.axiTurnstile = "true";
    script.addEventListener("load", () => setReady(true));
    script.addEventListener("error", () => onError("Verification could not load. Check your connection and try again."));
    document.head.appendChild(script);
  }, [disabled, onError]);

  React.useEffect(() => {
    if (disabled || !ready || !window.turnstile || !containerRef.current || widgetIdRef.current) {
      return;
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      action: "signup",
      callback: (token: string) => onToken(token),
      "expired-callback": () => onToken(""),
      "error-callback": () => {
        onToken("");
        onError("Verification failed. Try the challenge again.");
      },
    });

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, [disabled, onError, onToken, ready, siteKey]);

  React.useEffect(() => {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
      onToken("");
    }
  }, [onToken, resetNonce]);

  return <div ref={containerRef} className="min-h-[65px]" aria-label="Verification challenge" />;
}

function PasswordStrengthMeter({ password }: { password: string }) {
  const strength = passwordStrengthLevel(password);
  const fillPercent = Math.min(100, (passwordEntropyBits(password) / maxEntropyBits) * 100);
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-black/55">Password strength</span>
        <span className={cx("font-semibold", strength.textClass)}>{strength.label}</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-black/[0.06]">
        <div
          className={cx("h-full rounded-full transition-[width,background-color] duration-300", strength.barClass)}
          style={{ width: `${fillPercent}%` }}
        />
      </div>
    </div>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 7.25v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="4.75" r="0.9" fill="currentColor" />
    </svg>
  );
}

function InsecurePasswordNotice({
  breached,
  riskAccepted,
  riskError,
  disabled,
  onChange,
}: {
  breached: boolean;
  riskAccepted: boolean;
  riskError: string;
  disabled: boolean;
  onChange: (accepted: boolean) => void;
}) {
  const [privacyOpen, setPrivacyOpen] = React.useState(false);
  return (
    <div className="mt-4 rounded-xl border border-black/10 bg-black/[0.02] px-4 py-3">
      {breached ? (
        <div className="mb-3">
          <p className="text-sm text-rose-700">
            This password has been found in a hacked database.{" "}
            <button
              type="button"
              onClick={() => setPrivacyOpen((current) => !current)}
              aria-expanded={privacyOpen}
              aria-controls="breach-privacy-note"
              aria-label="How this check protects your password"
              className="inline-flex h-4 w-4 translate-y-[2.5px] text-black/45 transition hover:text-black focus:outline-none focus:ring-2 focus:ring-black/25"
            >
              <InfoIcon className="h-4 w-4" />
            </button>
          </p>
          {privacyOpen ? (
            <p id="breach-privacy-note" className="mt-2 text-xs leading-relaxed text-black/65">
              Your password never leaves this page. The check sends only the first 5 characters of its scrambled
              fingerprint (hash) to Have I Been Pwned, which is not enough to reveal the password itself.{" "}
              <a
                href="https://www.troyhunt.com/understanding-have-i-been-pwneds-use-of-sha-1-and-k-anonymity/"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4"
              >
                How it works
              </a>
            </p>
          ) : null}
        </div>
      ) : null}
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={riskAccepted}
          onChange={(event) => onChange(event.target.checked)}
          disabled={disabled}
          aria-invalid={Boolean(riskError)}
          aria-describedby={riskError ? "signup-risk-error" : undefined}
          className="mt-0.5 h-4 w-4 shrink-0 accent-black"
        />
        <span>
          <span className="block text-sm font-semibold text-black">I understand the risk</span>
          <span className="mt-0.5 block text-sm leading-relaxed text-black/65">
            {breached
              ? "Allow this password even though it appeared in a breach."
              : "Allow this password even though it is considered weak."}
          </span>
        </span>
      </label>
      <FieldError id="signup-risk-error">{riskError}</FieldError>
    </div>
  );
}

function ButtonSpinner() {
  return (
    <span
      aria-hidden="true"
      className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
    />
  );
}

function FieldError({ children, id }: { children?: React.ReactNode; id?: string }) {
  if (!children) {
    return null;
  }
  return (
    <p id={id} className="mt-2 text-sm text-rose-700">
      {children}
    </p>
  );
}

function OtpCodeInput({
  id,
  value,
  onChange,
  onBlur,
  disabled,
  hasError,
  describedBy,
  label,
  length = otpCodeLength,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  hasError?: boolean;
  describedBy?: string;
  label: string;
  length?: number;
}) {
  const inputsRef = React.useRef<Array<HTMLInputElement | null>>([]);
  const normalizedValue = value.replace(/\D/g, "").slice(0, length);
  const digits = Array.from({ length }, (_, index) => normalizedValue[index] ?? "");

  const focusDigit = (index: number) => {
    window.requestAnimationFrame(() => {
      inputsRef.current[Math.max(0, Math.min(length - 1, index))]?.focus();
    });
  };

  const replaceDigits = (startIndex: number, rawValue: string) => {
    const incoming = rawValue.replace(/\D/g, "");
    if (!incoming) {
      return;
    }
    const nextDigits = digits.slice();
    incoming
      .slice(0, length - startIndex)
      .split("")
      .forEach((digit, offset) => {
        nextDigits[startIndex + offset] = digit;
      });
    onChange(nextDigits.join(""));
    focusDigit(Math.min(startIndex + incoming.length, length - 1));
  };

  const clearDigit = (index: number) => {
    const nextDigits = digits.slice();
    nextDigits[index] = "";
    onChange(nextDigits.join(""));
  };

  return (
    <div className="mt-2 grid grid-cols-6 gap-2" role="group" aria-label={label}>
      {digits.map((digit, index) => (
        <input
          key={index}
          id={index === 0 ? id : undefined}
          ref={(element) => {
            inputsRef.current[index] = element;
          }}
          type="text"
          value={digit}
          onChange={(event) => {
            const incoming = event.currentTarget.value;
            if (incoming === "") {
              clearDigit(index);
              return;
            }
            replaceDigits(index, incoming);
          }}
          onFocus={(event) => event.currentTarget.select()}
          onBlur={onBlur}
          onPaste={(event) => {
            event.preventDefault();
            replaceDigits(index, event.clipboardData.getData("text"));
          }}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !digits[index] && index > 0) {
              event.preventDefault();
              clearDigit(index - 1);
              focusDigit(index - 1);
            } else if (event.key === "ArrowLeft" && index > 0) {
              event.preventDefault();
              focusDigit(index - 1);
            } else if (event.key === "ArrowRight" && index < length - 1) {
              event.preventDefault();
              focusDigit(index + 1);
            } else if (event.key === "Delete") {
              clearDigit(index);
            }
          }}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          disabled={disabled}
          aria-label={`${label} digit ${index + 1}`}
          aria-invalid={Boolean(hasError)}
          aria-describedby={index === 0 ? describedBy : undefined}
          className={cx(
            "h-10 min-w-0 squircle-control-sm border bg-white text-center font-mono text-lg font-semibold text-black outline-none transition focus:border-black focus:ring-2 focus:ring-black/15 disabled:bg-black/[0.03]",
            hasError ? "border-rose-500" : "border-black/15"
          )}
        />
      ))}
    </div>
  );
}

function RegisterPageShell({
  title,
  description,
  wide = false,
  children,
}: {
  title?: string;
  description?: React.ReactNode;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen bg-white px-4 pb-10 pt-2 text-black sm:pb-14 sm:pt-3">
      <div className={cx("mx-auto w-full", wide ? "max-w-2xl" : "max-w-md")}>
        <a
          href={withBasePath("")}
          aria-label="Axichat home"
          className="mx-auto mb-16 flex w-fit items-center justify-center gap-3 px-4 py-3 text-black no-underline transition hover:text-black/75 sm:mb-20"
        >
          <img src={withBasePath("images/brand/axichat_logo_black.png")} alt="" className="h-11 w-11" />
          <span className="text-xl font-semibold tracking-[0.01em]">Axichat</span>
        </a>
        {title ? <h1 className="font-display text-3xl font-semibold tracking-tight text-black">{title}</h1> : null}
        {description ? <div className="mt-2 text-sm leading-relaxed text-black/65">{description}</div> : null}
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}

function RecoveryEmailPanel({
  config,
  session,
  disabled,
  onCompleted,
  onUnauthorized,
}: {
  config: PublicAxiConfig;
  session: SignupSession;
  disabled: boolean;
  onCompleted: (label: string) => void;
  onUnauthorized: () => void;
}) {
  const [recoveryEmail, setRecoveryEmail] = React.useState("");
  const [challengeId, setChallengeId] = React.useState("");
  const [code, setCode] = React.useState("");
  const [emailMasked, setEmailMasked] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [fieldTouched, setFieldTouched] = React.useState<Partial<Record<RecoveryEmailFieldName, boolean>>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<RecoveryEmailFieldErrors>({});
  const [completed, setCompleted] = React.useState(false);

  const handleFailure = (result: ApiFailure) => {
    if (result.error === "recovery_setup_unauthorized") {
      onUnauthorized();
      return;
    }
    if (result.error === "invalid_recovery_email") {
      setFieldErrors({ recoveryEmail: recoveryErrorMessage(result.error) });
      setError("");
      return;
    }
    if (result.error === "invalid_code") {
      setFieldErrors({ code: recoveryErrorMessage(result.error) });
      setError("");
      return;
    }
    if (result.error === "challenge_expired" || result.error === "challenge_failed") {
      setChallengeId("");
      setCode("");
    }
    setError(recoveryErrorMessage(result.error));
  };

  const start = async (event: React.FormEvent) => {
    event.preventDefault();
    if (disabled || busy || completed) {
      return;
    }
    setSubmitted(true);
    setFieldTouched((current) => ({ ...current, recoveryEmail: true }));
    setFieldErrors({});
    const validationError = validateRecoveryEmail(recoveryEmail);
    if (validationError) {
      setError("");
      return;
    }
    setBusy(true);
    setError("");
    const result = await apiRequest<RecoveryEmailStart>(config, "/api/recovery/email/start", {
      method: "POST",
      recoverySetupToken: session.recoverySetupToken,
      body: {
        username: session.username,
        password: session.password,
        recovery_email: recoveryEmail.trim(),
      },
    });
    setBusy(false);
    if (!result.ok) {
      handleFailure(result);
      return;
    }
    if (!result.payload.challenge_id) {
      setError(recoveryErrorMessage("internal_error"));
      return;
    }
    setChallengeId(result.payload.challenge_id);
    setEmailMasked(result.payload.email_masked ?? recoveryEmail.trim());
    setSubmitted(false);
    setFieldTouched({});
    setFieldErrors({});
  };

  const confirm = async (event: React.FormEvent) => {
    event.preventDefault();
    if (disabled || busy || completed) {
      return;
    }
    setSubmitted(true);
    setFieldTouched((current) => ({ ...current, code: true }));
    setFieldErrors({});
    const validationError = validateRecoveryCode(code);
    if (validationError) {
      setError("");
      return;
    }
    setBusy(true);
    setError("");
    const result = await apiRequest<RecoveryEmailConfirm>(config, "/api/recovery/email/confirm", {
      method: "POST",
      recoverySetupToken: session.recoverySetupToken,
      body: {
        username: session.username,
        password: session.password,
        challenge_id: challengeId,
        code: code.trim(),
      },
    });
    setBusy(false);
    if (!result.ok) {
      handleFailure(result);
      return;
    }
    setCompleted(true);
    setEmailMasked(result.payload.email_masked ?? emailMasked);
    setChallengeId("");
    setCode("");
    setSubmitted(false);
    setFieldTouched({});
    setFieldErrors({});
    onCompleted("Recovery email");
  };

  const recoveryEmailError =
    fieldErrors.recoveryEmail || (fieldTouched.recoveryEmail || submitted ? validateRecoveryEmail(recoveryEmail) : "");
  const codeError = fieldErrors.code || (fieldTouched.code || submitted ? validateRecoveryCode(code) : "");

  return (
    <article className="rounded-2xl border border-black/10 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-black">Recovery email</h2>
          <p className="mt-1 text-sm leading-relaxed text-black/65">Use an outside email address for recovery codes.</p>
        </div>
        {completed ? <span className="rounded-[0.8rem] bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">Done</span> : null}
      </div>

      {!challengeId ? (
        <form onSubmit={start} className="mt-5">
          <label className="block text-sm font-semibold text-black" htmlFor="recovery-email">
            Recovery email
          </label>
          <input
            id="recovery-email"
            type="email"
            value={recoveryEmail}
            onChange={(event) => {
              setRecoveryEmail(event.target.value);
              setFieldErrors((current) => ({ ...current, recoveryEmail: "" }));
              setError("");
            }}
            onBlur={() => setFieldTouched((current) => ({ ...current, recoveryEmail: true }))}
            disabled={disabled || busy || completed}
            required
            aria-invalid={Boolean(recoveryEmailError)}
            aria-describedby={recoveryEmailError ? "recovery-email-error" : undefined}
            className={cx(
              "mt-2 w-full squircle-control border bg-white px-3 py-2.5 text-sm text-black outline-none transition focus:border-black focus:ring-2 focus:ring-black/15 disabled:bg-black/[0.03]",
              recoveryEmailError ? "border-rose-500" : "border-black/15"
            )}
          />
          <FieldError id="recovery-email-error">{recoveryEmailError}</FieldError>
          <button
            type="submit"
            disabled={disabled || busy || completed}
            className="mt-4 inline-flex items-center gap-2 squircle-control border border-black bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:border-black/20 disabled:bg-black/20"
          >
            {busy ? (
              <>
                <ButtonSpinner />
                Sending...
              </>
            ) : (
              "Send code"
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={confirm} className="mt-5" noValidate>
          <p className="text-sm text-black/65">Enter the code sent to {emailMasked || "your recovery email"}.</p>
          <label className="mt-4 block text-sm font-semibold text-black" htmlFor="recovery-email-code">
            6-digit code
          </label>
          <OtpCodeInput
            id="recovery-email-code"
            value={code}
            onChange={(nextCode) => {
              setCode(nextCode);
              setFieldErrors((current) => ({ ...current, code: "" }));
              setError("");
            }}
            onBlur={() => setFieldTouched((current) => ({ ...current, code: true }))}
            disabled={disabled || busy || completed}
            hasError={Boolean(codeError)}
            describedBy={codeError ? "recovery-email-code-error" : undefined}
            label="Recovery email confirmation code"
          />
          <FieldError id="recovery-email-code-error">{codeError}</FieldError>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={disabled || busy || completed}
              className="inline-flex items-center gap-2 squircle-control border border-black bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:border-black/20 disabled:bg-black/20"
            >
              {busy ? (
                <>
                  <ButtonSpinner />
                  Confirming...
                </>
              ) : (
                "Confirm email"
              )}
            </button>
            {!completed ? (
              <button
                type="button"
                disabled={disabled || busy}
                onClick={() => {
                  setChallengeId("");
                  setCode("");
                  setError("");
                }}
                className="inline-flex squircle-control border border-black/15 bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      )}

      <FieldError>{error}</FieldError>
    </article>
  );
}

function TotpPanel({
  config,
  session,
  disabled,
  onCompleted,
  onUnauthorized,
}: {
  config: PublicAxiConfig;
  session: SignupSession;
  disabled: boolean;
  onCompleted: (label: string) => void;
  onUnauthorized: () => void;
}) {
  const [challengeId, setChallengeId] = React.useState("");
  const [secret, setSecret] = React.useState("");
  const [qrSvg, setQrSvg] = React.useState("");
  const [code, setCode] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [fieldTouched, setFieldTouched] = React.useState<Partial<Record<"code", boolean>>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<TotpFieldErrors>({});
  const [completed, setCompleted] = React.useState(false);

  const handleFailure = (result: ApiFailure) => {
    if (result.error === "recovery_setup_unauthorized") {
      onUnauthorized();
      return;
    }
    if (result.error === "invalid_code") {
      setFieldErrors({ code: recoveryErrorMessage(result.error) });
      setError("");
      return;
    }
    if (result.error === "challenge_expired" || result.error === "challenge_failed") {
      setChallengeId("");
      setSecret("");
      setQrSvg("");
      setCode("");
    }
    setError(recoveryErrorMessage(result.error));
  };

  const start = async () => {
    if (disabled || busy || completed) {
      return;
    }
    setSubmitted(false);
    setFieldTouched({});
    setFieldErrors({});
    setBusy(true);
    setError("");
    const result = await apiRequest<TotpStart>(config, "/api/recovery/totp/start", {
      method: "POST",
      recoverySetupToken: session.recoverySetupToken,
      body: {
        username: session.username,
        password: session.password,
      },
    });
    setBusy(false);
    if (!result.ok) {
      handleFailure(result);
      return;
    }
    if (!result.payload.challenge_id || !result.payload.secret || !result.payload.otpauth_uri) {
      setError(recoveryErrorMessage("internal_error"));
      return;
    }
    setChallengeId(result.payload.challenge_id);
    setSecret(result.payload.secret);
    try {
      setQrSvg(createQrSvg(result.payload.otpauth_uri));
    } catch {
      setQrSvg("");
      setError("The QR code could not be generated for this setup URI. Use the manual key below.");
    }
  };

  const confirm = async (event: React.FormEvent) => {
    event.preventDefault();
    if (disabled || busy || completed) {
      return;
    }
    setSubmitted(true);
    setFieldTouched((current) => ({ ...current, code: true }));
    setFieldErrors({});
    const validationError = validateTotpCode(code);
    if (validationError) {
      setError("");
      return;
    }
    setBusy(true);
    setError("");
    const result = await apiRequest<TotpConfirm>(config, "/api/recovery/totp/confirm", {
      method: "POST",
      recoverySetupToken: session.recoverySetupToken,
      body: {
        username: session.username,
        password: session.password,
        challenge_id: challengeId,
        code: code.trim(),
      },
    });
    setBusy(false);
    if (!result.ok) {
      handleFailure(result);
      return;
    }
    setCompleted(true);
    setChallengeId("");
    setCode("");
    setSecret("");
    setQrSvg("");
    setSubmitted(false);
    setFieldTouched({});
    setFieldErrors({});
    onCompleted("Authenticator app");
  };

  const codeError = fieldErrors.code || (fieldTouched.code || submitted ? validateTotpCode(code) : "");

  return (
    <article className="rounded-2xl border border-black/10 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-black">Authenticator app</h2>
          <p className="mt-1 text-sm leading-relaxed text-black/65">Add a time-based code from your authenticator.</p>
        </div>
        {completed ? <span className="rounded-[0.8rem] bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">Done</span> : null}
      </div>

      {!challengeId ? (
        <button
          type="button"
          onClick={start}
          disabled={disabled || busy || completed}
          className="mt-5 inline-flex items-center gap-2 squircle-control border border-black bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:border-black/20 disabled:bg-black/20"
        >
          {busy ? (
            <>
              <ButtonSpinner />
              Starting...
            </>
          ) : (
            "Set up authenticator"
          )}
        </button>
      ) : (
        <form onSubmit={confirm} className="mt-5" noValidate>
          {qrSvg ? (
            <div
              className="w-full max-w-[14rem] overflow-hidden rounded-xl border border-black/10 bg-white p-3"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
          ) : null}
          {secret ? (
            <div className="mt-4 rounded-xl border border-black/10 bg-black/[0.03] px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-black/50">Manual key</div>
              <div className="mt-2 break-all font-mono text-sm text-black">{secret}</div>
            </div>
          ) : null}
          <label className="mt-4 block text-sm font-semibold text-black" htmlFor="totp-code">
            6-digit code
          </label>
          <OtpCodeInput
            id="totp-code"
            value={code}
            onChange={(nextCode) => {
              setCode(nextCode);
              setFieldErrors((current) => ({ ...current, code: "" }));
              setError("");
            }}
            onBlur={() => setFieldTouched((current) => ({ ...current, code: true }))}
            disabled={disabled || busy || completed}
            hasError={Boolean(codeError)}
            describedBy={codeError ? "totp-code-error" : undefined}
            label="Authenticator code"
          />
          <FieldError id="totp-code-error">{codeError}</FieldError>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={disabled || busy || completed}
              className="inline-flex items-center gap-2 squircle-control border border-black bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:border-black/20 disabled:bg-black/20"
            >
              {busy ? (
                <>
                  <ButtonSpinner />
                  Confirming...
                </>
              ) : (
                "Confirm authenticator"
              )}
            </button>
            {!completed ? (
              <button
                type="button"
                disabled={disabled || busy}
                onClick={() => {
                  setChallengeId("");
                  setSecret("");
                  setQrSvg("");
                  setCode("");
                  setError("");
                }}
                className="inline-flex squircle-control border border-black/15 bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      )}

      <FieldError>{error}</FieldError>
    </article>
  );
}

export default function RegisterPage({ downloadsHref }: { downloadsHref: string }) {
  const [{ config, error: configError }] = React.useState(readConfig);
  const [localpart, setLocalpart] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [passwordConfirmation, setPasswordConfirmation] = React.useState("");
  const [turnstileToken, setTurnstileToken] = React.useState("");
  const [turnstileError, setTurnstileError] = React.useState("");
  const [turnstileResetNonce, setTurnstileResetNonce] = React.useState(0);
  const [signupError, setSignupError] = React.useState("");
  const [signupTouched, setSignupTouched] = React.useState<Partial<Record<SignupFieldName, boolean>>>({});
  const [signupSubmitted, setSignupSubmitted] = React.useState(false);
  const [signupServerErrors, setSignupServerErrors] = React.useState<SignupFieldErrors>({});
  const [busy, setBusy] = React.useState(false);
  const [attempt, setAttempt] = React.useState<SignupAttempt | null>(null);
  const [session, setSession] = React.useState<SignupSession | null>(null);
  const [capabilities, setCapabilities] = React.useState<RecoveryCapabilities | null>(null);
  const [capabilitiesError, setCapabilitiesError] = React.useState("");
  const [now, setNow] = React.useState(Date.now());
  const [completedMethods, setCompletedMethods] = React.useState<string[]>([]);
  const [completedAccount, setCompletedAccount] = React.useState<CompletedAccount | null>(null);
  const [expired, setExpired] = React.useState(false);
  const [riskAccepted, setRiskAccepted] = React.useState(false);
  const [riskError, setRiskError] = React.useState("");
  const [breachChecking, setBreachChecking] = React.useState(false);
  const [pwnedCheck, setPwnedCheck] = React.useState<{ password: string; pwned: boolean } | null>(null);
  const [weakSubmittedPassword, setWeakSubmittedPassword] = React.useState("");
  const signupInFlightRef = React.useRef(false);
  const latestPasswordRef = React.useRef("");

  const registrationDisabled = Boolean(configError);
  const turnstileEnabled = config.turnstileSiteKey !== "";
  const canonicalLocalpart = localpart.trim();
  const sameAttempt =
    attempt !== null && attempt.localpart === canonicalLocalpart && attempt.password === password;
  const secondsRemaining = session ? Math.max(0, Math.ceil((session.recoverySetupExpiresAt - now) / 1000)) : 0;
  const turnstileAccepted =
    !turnstileEnabled || Boolean(turnstileToken) || Boolean(sameAttempt && attempt?.captchaVerified);
  const passwordWeak = password !== "" && passwordEntropyBits(password) < weakEntropyBits;
  const passwordBreached = pwnedCheck !== null && pwnedCheck.password === password && pwnedCheck.pwned;
  const showRiskNotice = (passwordWeak && weakSubmittedPassword === password) || passwordBreached;
  const signupClientErrors = validateSignupFields({
    canonicalLocalpart,
    password,
    passwordConfirmation,
    turnstileAccepted,
  });
  const localpartError =
    signupServerErrors.localpart ||
    (signupTouched.localpart || signupSubmitted ? signupClientErrors.localpart : "");
  const passwordError =
    signupServerErrors.password || (signupTouched.password || signupSubmitted ? signupClientErrors.password : "");
  const passwordConfirmationError =
    signupServerErrors.passwordConfirmation ||
    (signupTouched.passwordConfirmation || signupSubmitted ? signupClientErrors.passwordConfirmation : "");
  const turnstileFieldError =
    signupServerErrors.turnstile ||
    (signupTouched.turnstile || signupSubmitted ? signupClientErrors.turnstile : "");

  const resetTurnstile = React.useCallback(() => {
    setTurnstileToken("");
    setTurnstileResetNonce((value) => value + 1);
  }, []);

  const clearSensitiveSession = React.useCallback(() => {
    setSession(null);
    setPassword("");
    setPasswordConfirmation("");
    setAttempt(null);
    setTurnstileToken("");
    setCapabilities(null);
    setCapabilitiesError("");
    setCompletedMethods([]);
    setPwnedCheck(null);
    setRiskAccepted(false);
    setRiskError("");
    setWeakSubmittedPassword("");
  }, []);

  const handleTurnstileToken = React.useCallback((token: string) => {
    setTurnstileToken(token);
    setSignupServerErrors((current) => ({ ...current, turnstile: "" }));
    if (token) {
      setTurnstileError("");
    }
  }, []);

  React.useEffect(() => {
    if (!session) {
      return;
    }
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [session]);

  React.useEffect(() => {
    if (session && secondsRemaining <= 0) {
      setExpired(true);
      clearSensitiveSession();
    }
  }, [clearSensitiveSession, secondsRemaining, session]);

  React.useEffect(() => {
    if (!session) {
      return;
    }
    let cancelled = false;
    const loadCapabilities = async () => {
      setCapabilitiesError("");
      const result = await apiRequest<RecoveryCapabilities>(config, "/api/recovery/capabilities", {
        method: "GET",
      });
      if (cancelled) {
        return;
      }
      if (!result.ok) {
        setCapabilitiesError(recoveryErrorMessage(result.error));
        setCapabilities(null);
        return;
      }
      setCapabilities(result.payload);
    };
    void loadCapabilities();
    return () => {
      cancelled = true;
    };
  }, [config, session]);

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    if (signupInFlightRef.current || busy || registrationDisabled) {
      return;
    }
    signupInFlightRef.current = true;
    setSignupSubmitted(true);
    setSignupTouched({
      localpart: true,
      password: true,
      passwordConfirmation: true,
      turnstile: true,
    });
    setSignupServerErrors({});
    if (hasFieldErrors(signupClientErrors)) {
      setSignupError("");
      signupInFlightRef.current = false;
      return;
    }

    if (passwordWeak && weakSubmittedPassword !== password) {
      setWeakSubmittedPassword(password);
      setRiskAccepted(false);
      setRiskError("");
      setSignupError("");
      signupInFlightRef.current = false;
      return;
    }

    if (showRiskNotice && !riskAccepted) {
      setRiskError("Check the box above to continue.");
      setSignupError("");
      signupInFlightRef.current = false;
      return;
    }

    if (pwnedCheck === null || pwnedCheck.password !== password) {
      setBreachChecking(true);
      setSignupError("");
      const pwned = await isPasswordPwned(password);
      setBreachChecking(false);
      if (latestPasswordRef.current !== password) {
        signupInFlightRef.current = false;
        return;
      }
      setPwnedCheck({ password, pwned });
      if (pwned) {
        setRiskAccepted(false);
        setRiskError("");
        signupInFlightRef.current = false;
        return;
      }
    }

    let key = attempt && sameAttempt ? attempt.key : "";
    if (!key) {
      try {
        key = createIdempotencyKey();
      } catch {
        setSignupError(signupErrorMessage("crypto_unavailable"));
        signupInFlightRef.current = false;
        return;
      }
    }
    const attemptTurnstileToken =
      turnstileEnabled && sameAttempt && attempt ? turnstileToken || attempt.turnstileToken : turnstileToken;
    const currentAttempt: SignupAttempt = {
      key,
      localpart: canonicalLocalpart,
      password,
      captchaVerified: attempt && sameAttempt ? attempt.captchaVerified : false,
      turnstileToken: attemptTurnstileToken,
    };
    setAttempt(currentAttempt);
    setBusy(true);
    setSignupError("");
    setSignupServerErrors({});

    const body: {
      localpart: string;
      password: string;
      turnstile_token?: string;
    } = {
      localpart: canonicalLocalpart,
      password,
    };
    if (turnstileEnabled) {
      body.turnstile_token = currentAttempt.turnstileToken;
    }

    const result = await apiRequest<SignupSuccess>(config, "/api/signup", {
      method: "POST",
      idempotencyKey: key,
      body,
    });
    setBusy(false);
    signupInFlightRef.current = false;

    if (!result.ok) {
      const fieldErrors = signupServerFieldErrors(result.error, turnstileEnabled);
      if (hasFieldErrors(fieldErrors)) {
        setSignupServerErrors(fieldErrors);
        setSignupError("");
      } else {
        setSignupError(
          turnstileEnabled ? signupErrorMessage(result.error) : disabledTurnstileSignupErrorMessage(result.error)
        );
      }
      if (captchaErrors.has(result.error)) {
        setAttempt(null);
        if (turnstileEnabled) {
          resetTurnstile();
        }
      } else if (result.network || signupTemporaryErrors.has(result.error)) {
        setAttempt({ ...currentAttempt, captchaVerified: true });
      } else if (!result.network) {
        setAttempt(null);
      }
      return;
    }

    if (
      !result.payload.email ||
      !result.payload.username ||
      !result.payload.recovery_setup_token ||
      !Number.isFinite(result.payload.recovery_setup_expires_in_seconds) ||
      result.payload.recovery_setup_expires_in_seconds <= 0
    ) {
      setSignupError(signupErrorMessage("internal_error"));
      setAttempt(null);
      resetTurnstile();
      return;
    }

    setSession({
      email: result.payload.email,
      username: result.payload.username,
      password,
      recoverySetupToken: result.payload.recovery_setup_token,
      recoverySetupExpiresAt: Date.now() + result.payload.recovery_setup_expires_in_seconds * 1000,
    });
    setNow(Date.now());
    setCompletedMethods([]);
    setCapabilities(null);
    setCapabilitiesError("");
    setExpired(false);
    setLocalpart(result.payload.username);
    setPassword("");
    setPasswordConfirmation("");
    setTurnstileToken("");
    setSignupTouched({});
    setSignupSubmitted(false);
    setSignupServerErrors({});
    setAttempt(null);
    setPwnedCheck(null);
    setRiskAccepted(false);
    setRiskError("");
    setWeakSubmittedPassword("");
  };

  const handleRecoveryCompleted = (label: string) => {
    setCompletedMethods((current) => (current.includes(label) ? current : [...current, label]));
  };

  const finish = () => {
    if (!session) {
      return;
    }
    setCompletedAccount({
      email: session.email,
      username: session.username,
      recoveryMethods: completedMethods,
    });
    clearSensitiveSession();
  };

  const handleUnauthorizedRecovery = () => {
    setExpired(true);
    clearSensitiveSession();
  };

  if (completedAccount) {
    return (
      <RegisterPageShell
        title="Account ready"
        description={`${completedAccount.email} is ready. Use the Axichat app to sign in.`}
      >
        {completedAccount.recoveryMethods.length > 0 ? (
          <p className="text-sm text-black/70">Recovery enabled: {completedAccount.recoveryMethods.join(", ")}.</p>
        ) : (
          <p className="text-sm text-amber-800">No recovery method was added on the website.</p>
        )}
        <a
          href={downloadsHref}
          className="mt-5 inline-flex squircle-control border border-black bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-black/85"
        >
          Download Axichat
        </a>
      </RegisterPageShell>
    );
  }

  if (expired) {
    return (
      <RegisterPageShell
        title="Recovery setup expired"
        description="Website recovery setup is only available immediately after signup."
      >
        <a
          href={downloadsHref}
          className="inline-flex squircle-control border border-black bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-black/85"
        >
          Download Axichat
        </a>
      </RegisterPageShell>
    );
  }

  if (session) {
    const emailSupported = capabilities?.email === true;
    const totpSupported = capabilities?.totp === true;
    const recoveryUnavailable = capabilities !== null && !emailSupported && !totpSupported;
    const hasCompletedRecovery = completedMethods.length > 0;

    return (
      <RegisterPageShell
        title="Set up account recovery (recommended)"
        wide
        description={
          <>
            <span className="break-all">{session.email}</span>
            <span className="mt-2 block font-mono font-semibold text-black">
              Expires in {formatCountdown(secondsRemaining)}
            </span>
          </>
        }
      >
        <div className="space-y-4">
          {capabilitiesError ? (
            <div className="rounded-xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {capabilitiesError}
            </div>
          ) : null}

          {!capabilities && !capabilitiesError ? (
            <div className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black/65">
              Loading recovery options...
            </div>
          ) : null}

          {emailSupported ? (
            <RecoveryEmailPanel
              config={config}
              session={session}
              disabled={secondsRemaining <= 0}
              onCompleted={handleRecoveryCompleted}
              onUnauthorized={handleUnauthorizedRecovery}
            />
          ) : null}

          {totpSupported ? (
            <TotpPanel
              config={config}
              session={session}
              disabled={secondsRemaining <= 0}
              onCompleted={handleRecoveryCompleted}
              onUnauthorized={handleUnauthorizedRecovery}
            />
          ) : null}

          {recoveryUnavailable ? (
            <div className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black/65">
              No recovery methods are available right now.
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={finish}
              disabled={!hasCompletedRecovery}
              className="inline-flex squircle-control border border-black bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:border-black/20 disabled:bg-black/20"
            >
              Finish setup
            </button>
            <button
              type="button"
              onClick={finish}
              className="inline-flex squircle-control border border-black/15 bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-black/[0.03]"
            >
              Skip
            </button>
            {!hasCompletedRecovery ? (
              <span className="text-sm text-amber-800">Recovery can be added later in the app.</span>
            ) : null}
          </div>
        </div>
      </RegisterPageShell>
    );
  }

  return (
    <RegisterPageShell>
      <form onSubmit={handleSignup} noValidate>
        {configError ? (
          <div className="mb-5 rounded-xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {configError}
          </div>
        ) : null}

        <label className="block text-sm font-semibold text-black" htmlFor="signup-localpart">
          Username
        </label>
        <div
          className={cx(
            "mt-2 flex squircle-control overflow-hidden border bg-white transition focus-within:border-black focus-within:ring-2 focus-within:ring-black/15",
            localpartError ? "border-rose-500" : "border-black/15"
          )}
        >
          <input
            id="signup-localpart"
            value={localpart}
            onChange={(event) => {
              setLocalpart(event.target.value.toLowerCase());
              setSignupServerErrors((current) => ({ ...current, localpart: "" }));
              setSignupError("");
            }}
            onBlur={() => setSignupTouched((current) => ({ ...current, localpart: true }))}
            disabled={busy || breachChecking || registrationDisabled}
            autoComplete="username"
            maxLength={20}
            required
            aria-invalid={Boolean(localpartError)}
            aria-describedby={localpartError ? "signup-localpart-error" : undefined}
            className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-black outline-none disabled:bg-black/[0.03]"
          />
          <span className="flex items-center border-l border-black/10 bg-black/[0.03] px-3 text-sm font-semibold text-black/65">
            <span className="username-shimmer">@{config.accountDomain}</span>
          </span>
        </div>
        <p className="mt-2 text-xs text-black/55">Case insensitive</p>
        <FieldError id="signup-localpart-error">{localpartError}</FieldError>

        <label className="mt-5 block text-sm font-semibold text-black" htmlFor="signup-password">
          Password
        </label>
        <input
          id="signup-password"
          type="password"
          value={password}
          onChange={(event) => {
            latestPasswordRef.current = event.target.value;
            setPassword(event.target.value);
            setRiskAccepted(false);
            setRiskError("");
            setSignupServerErrors((current) => ({ ...current, password: "" }));
            setSignupError("");
          }}
          onBlur={() => setSignupTouched((current) => ({ ...current, password: true }))}
          disabled={busy || breachChecking || registrationDisabled}
          autoComplete="new-password"
          maxLength={passwordMaxLength}
          required
          aria-invalid={Boolean(passwordError)}
          aria-describedby={passwordError ? "signup-password-error" : undefined}
          className={cx(
            "mt-2 w-full squircle-control border bg-white px-3 py-2.5 text-sm text-black outline-none transition focus:border-black focus:ring-2 focus:ring-black/15 disabled:bg-black/[0.03]",
            passwordError ? "border-rose-500" : "border-black/15"
          )}
        />
        <FieldError id="signup-password-error">{passwordError}</FieldError>

        <label className="mt-5 block text-sm font-semibold text-black" htmlFor="signup-password-confirm">
          Confirm password
        </label>
        <input
          id="signup-password-confirm"
          type="password"
          value={passwordConfirmation}
          onChange={(event) => {
            setPasswordConfirmation(event.target.value);
            setSignupServerErrors((current) => ({ ...current, passwordConfirmation: "" }));
            setSignupError("");
          }}
          onBlur={() => setSignupTouched((current) => ({ ...current, passwordConfirmation: true }))}
          disabled={busy || breachChecking || registrationDisabled}
          autoComplete="new-password"
          maxLength={passwordMaxLength}
          required
          aria-invalid={Boolean(passwordConfirmationError)}
          aria-describedby={passwordConfirmationError ? "signup-password-confirm-error" : undefined}
          className={cx(
            "mt-2 w-full squircle-control border bg-white px-3 py-2.5 text-sm text-black outline-none transition focus:border-black focus:ring-2 focus:ring-black/15 disabled:bg-black/[0.03]",
            passwordConfirmationError ? "border-rose-500" : "border-black/15"
          )}
        />
        <FieldError id="signup-password-confirm-error">{passwordConfirmationError}</FieldError>

        <PasswordStrengthMeter password={password} />

        {showRiskNotice ? (
          <InsecurePasswordNotice
            breached={passwordBreached}
            riskAccepted={riskAccepted}
            riskError={riskError}
            disabled={busy || breachChecking || registrationDisabled}
            onChange={(accepted) => {
              setRiskAccepted(accepted);
              if (accepted) {
                setRiskError("");
              }
            }}
          />
        ) : null}

        {turnstileEnabled ? (
          <div className="mt-5">
            <TurnstileWidget
              siteKey={config.turnstileSiteKey}
              disabled={registrationDisabled}
              resetNonce={turnstileResetNonce}
              onToken={handleTurnstileToken}
              onError={setTurnstileError}
            />
          </div>
        ) : null}
        <FieldError id="signup-turnstile-error">{turnstileEnabled ? turnstileError || turnstileFieldError : ""}</FieldError>
        <FieldError>{signupError}</FieldError>

        <button
          type="submit"
          disabled={busy || breachChecking || registrationDisabled}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 squircle-control border border-black bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:border-black/20 disabled:bg-black/20"
        >
          <span className="inline-flex min-w-[9.5rem] items-center justify-center gap-2 whitespace-nowrap">
            {busy ? (
              <>
                <ButtonSpinner />
                Creating account...
              </>
            ) : breachChecking ? (
              <>
                <ButtonSpinner />
                Checking password safety...
              </>
            ) : (
              "Create account"
            )}
          </span>
        </button>

        <p className="mt-4 text-xs leading-relaxed text-black/55">
          By creating an account, you agree to the{" "}
          <a className="underline underline-offset-4" href={withBasePath("terms/")}>
            Terms
          </a>{" "}
          and{" "}
          <a className="underline underline-offset-4" href={withBasePath("privacy/")}>
            Privacy Policy
          </a>
          .
        </p>
      </form>
    </RegisterPageShell>
  );
}
