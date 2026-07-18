import { createQrSvg } from "./qr";

type PublicAxiConfig = {
  backendBaseUrl: string;
  accountDomain: string;
  turnstileSiteKey: string;
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
};

type RecoveryEmailStart = {
  ok?: boolean;
  challenge_id: string;
  email_masked?: string;
};

type RecoveryEmailConfirm = {
  ok?: boolean;
  email_masked?: string;
};

type TotpStart = {
  ok?: boolean;
  challenge_id: string;
  secret: string;
  otpauth_uri: string;
};

type SignupFieldName = "localpart" | "password" | "passwordConfirmation" | "turnstile";
type SignupFieldErrors = Partial<Record<SignupFieldName, string>>;

const localpartPattern = /^(?=.{4,20}$)[a-z][a-z0-9_-]*(?:\.[a-z0-9_-]+)*$/;
const localpartErrorMessage =
  "Use 4-20 lowercase letters, numbers, underscores, hyphens, or periods. Start with a letter, and place periods only between other characters.";
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
const spinnerHtml =
  '<span aria-hidden="true" class="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"></span>';

function withBasePath(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
}

function byId<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`missing element: ${id}`);
  }
  return element as T;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
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
  const controller = typeof AbortController === "function" ? new AbortController() : null;
  const timeoutId = controller ? window.setTimeout(() => controller.abort(), 10000) : 0;
  try {
    const hash = await sha1HexUpper(password);
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);
    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      controller ? { signal: controller.signal } : undefined
    );
    if (!response.ok) {
      return false;
    }
    const body = await response.text();
    return body.split(/\r?\n/).some((line) => line.split(":")[0]?.trim().toUpperCase() === suffix);
  } catch {
    return false;
  } finally {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
  }
}

function isPlaceholder(value: string) {
  const trimmed = value.trim();
  return trimmed === "" || /^<[^>]+>$/.test(trimmed) || trimmed.includes("example.com");
}

function readConfig(): { config: PublicAxiConfig; error: string | null } {
  const fallback: PublicAxiConfig = { backendBaseUrl: "", accountDomain: "axi.im", turnstileSiteKey: "" };
  const config = typeof window !== "undefined" && window.AXI_CONFIG ? window.AXI_CONFIG : fallback;
  const normalized = {
    backendBaseUrl: String(config.backendBaseUrl ?? "").replace(/\/+$/, ""),
    accountDomain: String(config.accountDomain ?? "axi.im").trim() || "axi.im",
    turnstileSiteKey: String(config.turnstileSiteKey ?? "").trim(),
  };

  if (isPlaceholder(normalized.backendBaseUrl) || isPlaceholder(normalized.accountDomain)) {
    return { config: normalized, error: "Registration is not configured yet. Set backendBaseUrl in /config.js." };
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
  const controller = typeof AbortController === "function" ? new AbortController() : null;
  let timedOut = false;
  let timeoutId = 0;

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
    const request = fetch(`${apiBaseUrl(config)}${path}`, {
      method: options.method,
      credentials: "omit",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: controller?.signal,
    });
    const timeout = new Promise<Response>((_, reject) => {
      timeoutId = window.setTimeout(() => {
        timedOut = true;
        controller?.abort();
        reject(new Error("request_timeout"));
      }, options.timeoutMs ?? 30000);
    });
    const response = await Promise.race([request, timeout]);
    const text = await response.text();
    let payload: unknown = {};
    if (text.trim() !== "") {
      try {
        payload = JSON.parse(text) as unknown;
      } catch {
        return { ok: false, status: response.status, error: "bad_json" };
      }
    }
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: typeof payload === "object" && payload && "error" in payload ? String(payload.error) : `http_${response.status}`,
      };
    }
    return { ok: true, status: response.status, payload: payload as T };
  } catch (error) {
    return { ok: false, error: timedOut ? "request_timeout" : "network_error", network: true, timeout: timedOut };
  } finally {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
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
      return localpartErrorMessage;
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
    errors.localpart = localpartErrorMessage;
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

function validateOtpCode(value: string): string {
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

const primaryButtonClass =
  "primary-action axi-button-bounce inline-flex items-center gap-2 px-4 py-2 text-sm";
const secondaryButtonClass =
  "secondary-action axi-button-bounce inline-flex px-4 py-2 text-sm";

type OtpInput = {
  root: HTMLDivElement;
  getValue: () => string;
  reset: () => void;
  setDisabled: (disabled: boolean) => void;
  setInvalid: (invalid: boolean, describedBy?: string) => void;
  onInput: (callback: () => void) => void;
};

function createOtpInput(id: string, label: string): OtpInput {
  const root = document.createElement("div");
  root.className = "mt-2 grid grid-cols-6 gap-2";
  root.setAttribute("role", "group");
  root.setAttribute("aria-label", label);
  let value = "";
  let inputCallback: () => void = () => undefined;
  const inputs: HTMLInputElement[] = [];

  const digits = () => Array.from({ length: otpCodeLength }, (_, index) => value[index] ?? "");

  const paint = () => {
    const current = digits();
    inputs.forEach((input, index) => {
      input.value = current[index] ?? "";
    });
  };

  const focusDigit = (index: number) => {
    window.requestAnimationFrame(() => {
      inputs[Math.max(0, Math.min(otpCodeLength - 1, index))]?.focus();
    });
  };

  const setValue = (next: string) => {
    value = next.replace(/\D/g, "").slice(0, otpCodeLength);
    paint();
    inputCallback();
  };

  const replaceDigits = (startIndex: number, rawValue: string) => {
    const incoming = rawValue.replace(/\D/g, "");
    if (!incoming) {
      return;
    }
    const next = digits();
    incoming
      .slice(0, otpCodeLength - startIndex)
      .split("")
      .forEach((digit, offset) => {
        next[startIndex + offset] = digit;
      });
    setValue(next.join(""));
    focusDigit(Math.min(startIndex + incoming.length, otpCodeLength - 1));
  };

  const clearDigit = (index: number) => {
    const next = digits();
    next[index] = "";
    setValue(next.join(""));
  };

  for (let index = 0; index < otpCodeLength; index += 1) {
    const input = document.createElement("input");
    if (index === 0) {
      input.id = id;
    }
    input.type = "text";
    input.inputMode = "numeric";
    input.pattern = "[0-9]*";
    input.autocomplete = index === 0 ? "one-time-code" : "off";
    input.setAttribute("aria-label", `${label} digit ${index + 1}`);
    input.className =
      "field-control field-control-sm h-10 min-w-0 text-center font-mono text-lg font-semibold";
    input.addEventListener("input", () => {
      const incoming = input.value;
      if (incoming === "") {
        clearDigit(index);
        return;
      }
      replaceDigits(index, incoming);
    });
    input.addEventListener("focus", () => input.select());
    input.addEventListener("paste", (event) => {
      event.preventDefault();
      replaceDigits(index, event.clipboardData?.getData("text") ?? "");
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "Backspace" && !digits()[index] && index > 0) {
        event.preventDefault();
        clearDigit(index - 1);
        focusDigit(index - 1);
      } else if (event.key === "ArrowLeft" && index > 0) {
        event.preventDefault();
        focusDigit(index - 1);
      } else if (event.key === "ArrowRight" && index < otpCodeLength - 1) {
        event.preventDefault();
        focusDigit(index + 1);
      } else if (event.key === "Delete") {
        clearDigit(index);
      }
    });
    inputs.push(input);
    root.appendChild(input);
  }

  return {
    root,
    getValue: () => value,
    reset: () => setValue(""),
    setDisabled: (disabled: boolean) => inputs.forEach((input) => (input.disabled = disabled)),
    setInvalid: (invalid: boolean, describedBy?: string) =>
      inputs.forEach((input, index) => {
        input.setAttribute("aria-invalid", String(invalid));
        input.classList.toggle("field-control-invalid", invalid);
        if (index === 0 && describedBy && invalid) {
          input.setAttribute("aria-describedby", describedBy);
        } else {
          input.removeAttribute("aria-describedby");
        }
      }),
    onInput: (callback: () => void) => {
      inputCallback = callback;
    },
  };
}

const { config, error: configError } = readConfig();
const registrationDisabled = Boolean(configError);
const turnstileEnabled = config.turnstileSiteKey !== "";
const downloadsHref = withBasePath("downloads/index.html");

const shell = byId<HTMLDivElement>("register-shell");
const heading = byId<HTMLDivElement>("register-heading");
const headingTitle = byId<HTMLHeadingElement>("register-title");
const headingDescription = byId<HTMLDivElement>("register-description");
const signupView = byId<HTMLDivElement>("signup-view");
const altView = byId<HTMLDivElement>("alt-view");
const form = byId<HTMLFormElement>("signup-form");
const configErrorBox = byId<HTMLDivElement>("config-error");
const localpartInput = byId<HTMLInputElement>("signup-localpart");
const localpartGroup = byId<HTMLDivElement>("signup-localpart-group");
const localpartError = byId<HTMLParagraphElement>("signup-localpart-error");
const domainLabel = byId<HTMLSpanElement>("signup-domain");
const passwordInput = byId<HTMLInputElement>("signup-password");
const passwordError = byId<HTMLParagraphElement>("signup-password-error");
const confirmInput = byId<HTMLInputElement>("signup-password-confirm");
const confirmError = byId<HTMLParagraphElement>("signup-password-confirm-error");
const strengthLabel = byId<HTMLSpanElement>("strength-label");
const strengthBar = byId<HTMLDivElement>("strength-bar");
const riskNotice = byId<HTMLDivElement>("risk-notice");
const breachBlock = byId<HTMLDivElement>("breach-block");
const privacyToggle = byId<HTMLButtonElement>("privacy-toggle");
const privacyNote = byId<HTMLParagraphElement>("breach-privacy-note");
const riskCheckbox = byId<HTMLInputElement>("risk-checkbox");
const riskSublabel = byId<HTMLSpanElement>("risk-sublabel");
const riskErrorEl = byId<HTMLParagraphElement>("signup-risk-error");
const turnstileWrap = byId<HTMLDivElement>("turnstile-wrap");
const turnstileContainer = byId<HTMLDivElement>("turnstile-container");
const turnstileErrorEl = byId<HTMLParagraphElement>("signup-turnstile-error");
const signupErrorEl = byId<HTMLParagraphElement>("signup-error");
const submitButton = byId<HTMLButtonElement>("signup-submit");
const submitLabel = byId<HTMLSpanElement>("signup-submit-label");

let busy = false;
let breachChecking = false;
let signupInFlight = false;
let signupSubmitted = false;
const signupTouched: Partial<Record<SignupFieldName, boolean>> = {};
let signupServerErrors: SignupFieldErrors = {};
let attempt: SignupAttempt | null = null;
let turnstileToken = "";
let turnstileWidgetId: string | null = null;
let turnstileLoadError = "";
let pwnedCheck: { password: string; pwned: boolean } | null = null;
let riskError = "";
let weakSubmittedPassword = "";
let session: SignupSession | null = null;
let completedMethods: string[] = [];
let countdownInterval = 0;

function canonicalLocalpart() {
  return localpartInput.value.trim();
}

function passwordWeak() {
  return passwordInput.value !== "" && passwordEntropyBits(passwordInput.value) < weakEntropyBits;
}

function passwordBreached() {
  return pwnedCheck !== null && pwnedCheck.password === passwordInput.value && pwnedCheck.pwned;
}

function showRiskNotice() {
  return (passwordWeak() && weakSubmittedPassword === passwordInput.value) || passwordBreached();
}

function turnstileAccepted() {
  const sameAttempt =
    attempt !== null && attempt.localpart === canonicalLocalpart() && attempt.password === passwordInput.value;
  return !turnstileEnabled || Boolean(turnstileToken) || Boolean(sameAttempt && attempt?.captchaVerified);
}

function clientErrors(): SignupFieldErrors {
  return validateSignupFields({
    canonicalLocalpart: canonicalLocalpart(),
    password: passwordInput.value,
    passwordConfirmation: confirmInput.value,
    turnstileAccepted: turnstileAccepted(),
  });
}

function paintFieldError(input: HTMLInputElement, errorEl: HTMLElement, message: string, borderTarget?: HTMLElement) {
  errorEl.textContent = message;
  errorEl.hidden = !message;
  const target = borderTarget ?? input;
  target.classList.toggle("field-control-invalid", Boolean(message));
  input.setAttribute("aria-invalid", String(Boolean(message)));
  if (message) {
    input.setAttribute("aria-describedby", errorEl.id);
  } else {
    input.removeAttribute("aria-describedby");
  }
}

function paintSignupErrors() {
  const errors = clientErrors();
  const visible = (field: SignupFieldName) =>
    signupServerErrors[field] || (signupTouched[field] || signupSubmitted ? errors[field] ?? "" : "");
  paintFieldError(localpartInput, localpartError, visible("localpart"), localpartGroup);
  paintFieldError(passwordInput, passwordError, visible("password"));
  paintFieldError(confirmInput, confirmError, visible("passwordConfirmation"));
  const turnstileMessage = turnstileEnabled ? turnstileLoadError || visible("turnstile") : "";
  turnstileErrorEl.textContent = turnstileMessage;
  turnstileErrorEl.hidden = !turnstileMessage;
}

function paintStrength() {
  const strength = passwordStrengthLevel(passwordInput.value);
  strengthLabel.textContent = strength.label;
  strengthLabel.className = `font-semibold ${strength.textClass}`;
  const fillPercent = Math.min(100, (passwordEntropyBits(passwordInput.value) / maxEntropyBits) * 100);
  strengthBar.style.width = `${fillPercent}%`;
  strengthBar.className = `h-full rounded-full transition-[width,background-color] duration-300 ${strength.barClass}`;
}

function paintRiskNotice() {
  const show = showRiskNotice();
  riskNotice.hidden = !show;
  breachBlock.hidden = !passwordBreached();
  riskSublabel.textContent = passwordBreached()
    ? "Allow this password even though it appeared in a breach."
    : "Allow this password even though it is considered weak.";
  riskErrorEl.textContent = riskError;
  riskErrorEl.hidden = !riskError;
  riskCheckbox.setAttribute("aria-invalid", String(Boolean(riskError)));
  if (riskError) {
    riskCheckbox.setAttribute("aria-describedby", "signup-risk-error");
  } else {
    riskCheckbox.removeAttribute("aria-describedby");
  }
}

function paintSignupError(message: string) {
  signupErrorEl.textContent = message;
  signupErrorEl.hidden = !message;
}

function paintSubmit() {
  if (busy) {
    submitLabel.innerHTML = `${spinnerHtml}Creating account...`;
  } else if (breachChecking) {
    submitLabel.innerHTML = `${spinnerHtml}Checking password safety...`;
  } else {
    submitLabel.textContent = "Create account";
  }
}

function syncDisabled() {
  const disabled = busy || breachChecking || registrationDisabled;
  localpartInput.disabled = disabled;
  passwordInput.disabled = disabled;
  confirmInput.disabled = disabled;
  riskCheckbox.disabled = disabled;
  submitButton.disabled = disabled;
}

function resetTurnstile() {
  turnstileToken = "";
  if (turnstileWidgetId && window.turnstile) {
    window.turnstile.reset(turnstileWidgetId);
  }
}

function renderTurnstile() {
  if (!window.turnstile || turnstileWidgetId) {
    return;
  }
  turnstileWidgetId = window.turnstile.render(turnstileContainer, {
    sitekey: config.turnstileSiteKey,
    action: "signup",
    callback: (token: string) => {
      turnstileToken = token;
      signupServerErrors = { ...signupServerErrors, turnstile: "" };
      turnstileLoadError = "";
      paintSignupErrors();
    },
    "expired-callback": () => {
      turnstileToken = "";
      paintSignupErrors();
    },
    "error-callback": () => {
      turnstileToken = "";
      turnstileLoadError = "Verification failed. Try the challenge again.";
      paintSignupErrors();
    },
  });
}

function setUpTurnstile() {
  if (!turnstileEnabled || registrationDisabled) {
    return;
  }
  turnstileWrap.hidden = false;
  if (window.turnstile) {
    renderTurnstile();
    return;
  }
  const existing = document.querySelector<HTMLScriptElement>('script[data-axi-turnstile="true"]');
  if (existing) {
    existing.addEventListener("load", renderTurnstile);
    return;
  }
  const script = document.createElement("script");
  script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  script.async = true;
  script.defer = true;
  script.dataset.axiTurnstile = "true";
  script.addEventListener("load", renderTurnstile);
  script.addEventListener("error", () => {
    turnstileLoadError = "Verification could not load. Check your connection and try again.";
    paintSignupErrors();
  });
  document.head.appendChild(script);
}

function clearSensitiveSession() {
  session = null;
  passwordInput.value = "";
  confirmInput.value = "";
  attempt = null;
  turnstileToken = "";
  completedMethods = [];
  pwnedCheck = null;
  riskCheckbox.checked = false;
  riskError = "";
  weakSubmittedPassword = "";
  if (countdownInterval) {
    window.clearInterval(countdownInterval);
    countdownInterval = 0;
  }
}

function secondsRemaining() {
  return session ? Math.max(0, Math.ceil((session.recoverySetupExpiresAt - Date.now()) / 1000)) : 0;
}

function showHeading(title: string, descriptionHtml: string) {
  heading.hidden = false;
  headingTitle.textContent = title;
  headingDescription.innerHTML = descriptionHtml;
}

function showAltView(html: string, wide: boolean) {
  signupView.hidden = true;
  altView.hidden = false;
  altView.innerHTML = html;
  shell.classList.toggle("max-w-2xl", wide);
  shell.classList.toggle("max-w-md", !wide);
}

function showExpired() {
  clearSensitiveSession();
  showHeading("Recovery setup expired", "Website recovery setup is only available immediately after signup.");
  showAltView(
    `<a href="${downloadsHref}" class="${primaryButtonClass}">Download Axichat</a>`,
    false
  );
}

function showCompleted(account: { email: string; recoveryMethods: string[] }) {
  showHeading("Account ready", `${escapeHtml(account.email)} is ready. Use the Axichat app to sign in.`);
  const recoveryLine =
    account.recoveryMethods.length > 0
      ? `<p class="text-sm text-black/70">Recovery enabled: ${escapeHtml(account.recoveryMethods.join(", "))}.</p>`
      : `<p class="text-sm text-amber-800">No recovery method was added on the website.</p>`;
  showAltView(
    `${recoveryLine}<a href="${downloadsHref}" class="mt-5 ${primaryButtonClass}">Download Axichat</a>`,
    false
  );
}

function setButtonBusy(button: HTMLButtonElement, busyNow: boolean, busyText: string, idleText: string) {
  button.innerHTML = busyNow ? `${spinnerHtml}${busyText}` : idleText;
}

function panelErrorParagraph() {
  const paragraph = document.createElement("p");
  paragraph.className = "mt-2 text-sm text-rose-700";
  paragraph.dataset.panelError = "true";
  paragraph.hidden = true;
  return paragraph;
}

function setParagraph(paragraph: HTMLParagraphElement, message: string) {
  paragraph.textContent = message;
  paragraph.hidden = !message;
}

type PanelContext = {
  sessionData: SignupSession;
  isDisabled: () => boolean;
  onCompleted: (label: string) => void;
  onUnauthorized: () => void;
};

function renderRecoveryEmailPanel(container: HTMLElement, context: PanelContext) {
  const article = document.createElement("article");
  article.className = "passive-card p-5";
  container.appendChild(article);
  let completed = false;

  const render = (challengeId: string, emailMasked: string) => {
    article.innerHTML = `
      <div class="flex items-start justify-between gap-4">
        <div>
          <h2 class="font-display text-xl font-semibold text-black">Recovery email</h2>
          <p class="mt-1 text-sm leading-relaxed text-black/65">Use an outside email address for recovery codes.</p>
        </div>
        ${completed ? '<span class="status-badge bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">Done</span>' : ""}
      </div>
    `;
    const panelError = panelErrorParagraph();

    if (completed) {
      article.appendChild(panelError);
      return;
    }

    if (!challengeId) {
      const startForm = document.createElement("form");
      startForm.className = "mt-5";
      startForm.noValidate = true;
      startForm.innerHTML = `
        <label class="block text-sm font-semibold text-black" for="recovery-email">Recovery email</label>
        <input id="recovery-email" type="email" required
          class="field-control mt-2 w-full px-3 py-2.5 text-sm" />
        <p id="recovery-email-error" hidden class="mt-2 text-sm text-rose-700"></p>
        <button type="submit" class="mt-4 ${primaryButtonClass}">Send code</button>
      `;
      article.appendChild(startForm);
      article.appendChild(panelError);

      const emailInput = startForm.querySelector<HTMLInputElement>("#recovery-email")!;
      const emailError = startForm.querySelector<HTMLParagraphElement>("#recovery-email-error")!;
      const sendButton = startForm.querySelector<HTMLButtonElement>("button[type=submit]")!;
      let touched = false;
      let panelBusy = false;

      const paintEmailError = (serverMessage?: string) => {
        const message = serverMessage ?? (touched ? validateRecoveryEmail(emailInput.value) : "");
        paintFieldError(emailInput, emailError, message);
      };
      emailInput.addEventListener("input", () => {
        setParagraph(panelError, "");
        paintEmailError();
      });
      emailInput.addEventListener("blur", () => {
        touched = true;
        paintEmailError();
      });

      startForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (context.isDisabled() || panelBusy || completed) {
          return;
        }
        touched = true;
        if (validateRecoveryEmail(emailInput.value)) {
          paintEmailError();
          return;
        }
        panelBusy = true;
        emailInput.disabled = true;
        sendButton.disabled = true;
        setButtonBusy(sendButton, true, "Sending...", "Send code");
        setParagraph(panelError, "");
        const result = await apiRequest<RecoveryEmailStart>(config, "/api/recovery/email/start", {
          method: "POST",
          recoverySetupToken: context.sessionData.recoverySetupToken,
          body: {
            username: context.sessionData.username,
            password: context.sessionData.password,
            recovery_email: emailInput.value.trim(),
          },
        });
        panelBusy = false;
        emailInput.disabled = false;
        sendButton.disabled = false;
        setButtonBusy(sendButton, false, "Sending...", "Send code");
        if (!result.ok) {
          if (result.error === "recovery_setup_unauthorized") {
            context.onUnauthorized();
            return;
          }
          if (result.error === "invalid_recovery_email") {
            paintEmailError(recoveryErrorMessage(result.error));
            return;
          }
          setParagraph(panelError, recoveryErrorMessage(result.error));
          return;
        }
        if (!result.payload.challenge_id) {
          setParagraph(panelError, recoveryErrorMessage("internal_error"));
          return;
        }
        render(result.payload.challenge_id, result.payload.email_masked ?? emailInput.value.trim());
      });
      return;
    }

    const confirmForm = document.createElement("form");
    confirmForm.className = "mt-5";
    confirmForm.noValidate = true;
    confirmForm.innerHTML = `
      <p class="text-sm text-black/65">Enter the code sent to ${escapeHtml(emailMasked || "your recovery email")}.</p>
      <label class="mt-4 block text-sm font-semibold text-black" for="recovery-email-code">6-digit code</label>
    `;
    const otp = createOtpInput("recovery-email-code", "Recovery email confirmation code");
    confirmForm.appendChild(otp.root);
    const codeError = panelErrorParagraph();
    codeError.id = "recovery-email-code-error";
    confirmForm.appendChild(codeError);
    const buttonRow = document.createElement("div");
    buttonRow.className = "mt-4 flex flex-wrap gap-3";
    buttonRow.innerHTML = `
      <button type="submit" class="${primaryButtonClass}">Confirm email</button>
      <button type="button" data-cancel class="${secondaryButtonClass}">Cancel</button>
    `;
    confirmForm.appendChild(buttonRow);
    article.appendChild(confirmForm);
    article.appendChild(panelError);

    const confirmButton = buttonRow.querySelector<HTMLButtonElement>("button[type=submit]")!;
    const cancelButton = buttonRow.querySelector<HTMLButtonElement>("button[data-cancel]")!;
    let touched = false;
    let panelBusy = false;

    const paintCodeError = (serverMessage?: string) => {
      const message = serverMessage ?? (touched ? validateOtpCode(otp.getValue()) : "");
      setParagraph(codeError, message);
      otp.setInvalid(Boolean(message), "recovery-email-code-error");
    };
    otp.onInput(() => {
      setParagraph(panelError, "");
      paintCodeError();
    });

    cancelButton.addEventListener("click", () => {
      if (!panelBusy) {
        render("", "");
      }
    });

    confirmForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (context.isDisabled() || panelBusy || completed) {
        return;
      }
      touched = true;
      if (validateOtpCode(otp.getValue())) {
        paintCodeError();
        return;
      }
      panelBusy = true;
      otp.setDisabled(true);
      confirmButton.disabled = true;
      cancelButton.disabled = true;
      setButtonBusy(confirmButton, true, "Confirming...", "Confirm email");
      setParagraph(panelError, "");
      const result = await apiRequest<RecoveryEmailConfirm>(config, "/api/recovery/email/confirm", {
        method: "POST",
        recoverySetupToken: context.sessionData.recoverySetupToken,
        body: {
          username: context.sessionData.username,
          password: context.sessionData.password,
          challenge_id: challengeId,
          code: otp.getValue().trim(),
        },
      });
      panelBusy = false;
      otp.setDisabled(false);
      confirmButton.disabled = false;
      cancelButton.disabled = false;
      setButtonBusy(confirmButton, false, "Confirming...", "Confirm email");
      if (!result.ok) {
        if (result.error === "recovery_setup_unauthorized") {
          context.onUnauthorized();
          return;
        }
        if (result.error === "invalid_code") {
          paintCodeError(recoveryErrorMessage(result.error));
          return;
        }
        if (result.error === "challenge_expired" || result.error === "challenge_failed") {
          render("", "");
        }
        setParagraph(panelError, recoveryErrorMessage(result.error));
        return;
      }
      completed = true;
      render("", "");
      context.onCompleted("Recovery email");
    });
  };

  render("", "");
}

function renderTotpPanel(container: HTMLElement, context: PanelContext) {
  const article = document.createElement("article");
  article.className = "passive-card p-5";
  container.appendChild(article);
  let completed = false;

  const render = (challengeId: string, secret: string, qrSvg: string) => {
    article.innerHTML = `
      <div class="flex items-start justify-between gap-4">
        <div>
          <h2 class="font-display text-xl font-semibold text-black">Authenticator app</h2>
          <p class="mt-1 text-sm leading-relaxed text-black/65">Add a time-based code from your authenticator.</p>
        </div>
        ${completed ? '<span class="status-badge bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">Done</span>' : ""}
      </div>
    `;
    const panelError = panelErrorParagraph();

    if (completed) {
      article.appendChild(panelError);
      return;
    }

    if (!challengeId) {
      const startButton = document.createElement("button");
      startButton.type = "button";
      startButton.className = `mt-5 ${primaryButtonClass}`;
      startButton.textContent = "Set up authenticator";
      article.appendChild(startButton);
      article.appendChild(panelError);

      startButton.addEventListener("click", async () => {
        if (context.isDisabled() || completed) {
          return;
        }
        startButton.disabled = true;
        setButtonBusy(startButton, true, "Starting...", "Set up authenticator");
        setParagraph(panelError, "");
        const result = await apiRequest<TotpStart>(config, "/api/recovery/totp/start", {
          method: "POST",
          recoverySetupToken: context.sessionData.recoverySetupToken,
          body: {
            username: context.sessionData.username,
            password: context.sessionData.password,
          },
        });
        startButton.disabled = false;
        setButtonBusy(startButton, false, "Starting...", "Set up authenticator");
        if (!result.ok) {
          if (result.error === "recovery_setup_unauthorized") {
            context.onUnauthorized();
            return;
          }
          setParagraph(panelError, recoveryErrorMessage(result.error));
          return;
        }
        if (!result.payload.challenge_id || !result.payload.secret || !result.payload.otpauth_uri) {
          setParagraph(panelError, recoveryErrorMessage("internal_error"));
          return;
        }
        let svg = "";
        try {
          svg = createQrSvg(result.payload.otpauth_uri);
        } catch {
          svg = "";
        }
        render(result.payload.challenge_id, result.payload.secret, svg);
        if (!svg) {
          const errorTarget = article.querySelector<HTMLParagraphElement>(":scope > p[data-panel-error]");
          if (errorTarget) {
            setParagraph(errorTarget, "The QR code could not be generated for this setup URI. Use the manual key below.");
          }
        }
      });
      return;
    }

    const confirmForm = document.createElement("form");
    confirmForm.className = "mt-5";
    confirmForm.noValidate = true;
    const qrBlock = qrSvg
      ? `<div class="passive-card w-full max-w-[14rem] overflow-hidden p-3">${qrSvg}</div>`
      : "";
    confirmForm.innerHTML = `
      ${qrBlock}
      <div class="passive-card muted-panel mt-4 px-4 py-3">
        <div class="text-xs font-semibold uppercase tracking-[0.16em] text-black/50">Manual key</div>
        <div class="mt-2 break-all font-mono text-sm text-black">${escapeHtml(secret)}</div>
      </div>
      <label class="mt-4 block text-sm font-semibold text-black" for="totp-code">6-digit code</label>
    `;
    const otp = createOtpInput("totp-code", "Authenticator code");
    confirmForm.appendChild(otp.root);
    const codeError = panelErrorParagraph();
    codeError.id = "totp-code-error";
    confirmForm.appendChild(codeError);
    const buttonRow = document.createElement("div");
    buttonRow.className = "mt-4 flex flex-wrap gap-3";
    buttonRow.innerHTML = `
      <button type="submit" class="${primaryButtonClass}">Confirm authenticator</button>
      <button type="button" data-cancel class="${secondaryButtonClass}">Cancel</button>
    `;
    confirmForm.appendChild(buttonRow);
    article.appendChild(confirmForm);
    article.appendChild(panelError);

    const confirmButton = buttonRow.querySelector<HTMLButtonElement>("button[type=submit]")!;
    const cancelButton = buttonRow.querySelector<HTMLButtonElement>("button[data-cancel]")!;
    let touched = false;
    let panelBusy = false;

    const paintCodeError = (serverMessage?: string) => {
      const message = serverMessage ?? (touched ? validateOtpCode(otp.getValue()) : "");
      setParagraph(codeError, message);
      otp.setInvalid(Boolean(message), "totp-code-error");
    };
    otp.onInput(() => {
      setParagraph(panelError, "");
      paintCodeError();
    });

    cancelButton.addEventListener("click", () => {
      if (!panelBusy) {
        render("", "", "");
      }
    });

    confirmForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (context.isDisabled() || panelBusy || completed) {
        return;
      }
      touched = true;
      if (validateOtpCode(otp.getValue())) {
        paintCodeError();
        return;
      }
      panelBusy = true;
      otp.setDisabled(true);
      confirmButton.disabled = true;
      cancelButton.disabled = true;
      setButtonBusy(confirmButton, true, "Confirming...", "Confirm authenticator");
      setParagraph(panelError, "");
      const result = await apiRequest<{ ok?: boolean }>(config, "/api/recovery/totp/confirm", {
        method: "POST",
        recoverySetupToken: context.sessionData.recoverySetupToken,
        body: {
          username: context.sessionData.username,
          password: context.sessionData.password,
          challenge_id: challengeId,
          code: otp.getValue().trim(),
        },
      });
      panelBusy = false;
      otp.setDisabled(false);
      confirmButton.disabled = false;
      cancelButton.disabled = false;
      setButtonBusy(confirmButton, false, "Confirming...", "Confirm authenticator");
      if (!result.ok) {
        if (result.error === "recovery_setup_unauthorized") {
          context.onUnauthorized();
          return;
        }
        if (result.error === "invalid_code") {
          paintCodeError(recoveryErrorMessage(result.error));
          return;
        }
        if (result.error === "challenge_expired" || result.error === "challenge_failed") {
          render("", "", "");
        }
        setParagraph(panelError, recoveryErrorMessage(result.error));
        return;
      }
      completed = true;
      render("", "", "");
      context.onCompleted("Authenticator app");
    });
  };

  render("", "", "");
}

function showSession() {
  if (!session) {
    return;
  }
  const sessionData = session;
  showHeading(
    "Set up account recovery (recommended)",
    `<span class="break-all">${escapeHtml(sessionData.email)}</span><span class="mt-2 block font-mono font-semibold text-black">Expires in <span id="session-countdown">${formatCountdown(secondsRemaining())}</span></span>`
  );
  showAltView('<div id="session-content" class="space-y-4"><div id="session-panels" class="space-y-4"></div></div>', true);
  const content = byId<HTMLDivElement>("session-content");
  const panels = byId<HTMLDivElement>("session-panels");
  panels.innerHTML = '<div class="passive-card px-4 py-3 text-sm text-black/65">Loading recovery options...</div>';

  const buttonRow = document.createElement("div");
  buttonRow.className = "flex flex-wrap items-center gap-3";
  buttonRow.innerHTML = `
    <button type="button" id="finish-button" disabled class="primary-action axi-button-bounce inline-flex px-4 py-2 text-sm">Finish setup</button>
    <button type="button" id="skip-button" class="${secondaryButtonClass}">Skip</button>
    <span id="finish-hint" class="text-sm text-amber-800">Recovery can be added later in the app.</span>
  `;
  content.appendChild(buttonRow);

  const finish = () => {
    if (!session) {
      return;
    }
    const account = { email: session.email, recoveryMethods: completedMethods };
    clearSensitiveSession();
    showCompleted(account);
  };
  byId<HTMLButtonElement>("finish-button").addEventListener("click", finish);
  byId<HTMLButtonElement>("skip-button").addEventListener("click", finish);

  countdownInterval = window.setInterval(() => {
    const countdownEl = document.getElementById("session-countdown");
    if (countdownEl) {
      countdownEl.textContent = formatCountdown(secondsRemaining());
    }
    if (secondsRemaining() <= 0) {
      showExpired();
    }
  }, 1000);

  const context: PanelContext = {
    sessionData,
    isDisabled: () => secondsRemaining() <= 0,
    onCompleted: (label: string) => {
      if (!completedMethods.includes(label)) {
        completedMethods = [...completedMethods, label];
      }
      const finishButton = document.getElementById("finish-button") as HTMLButtonElement | null;
      const finishHint = document.getElementById("finish-hint");
      if (finishButton) {
        finishButton.disabled = false;
      }
      if (finishHint) {
        finishHint.hidden = true;
      }
    },
    onUnauthorized: () => showExpired(),
  };

  void (async () => {
    const result = await apiRequest<RecoveryCapabilities>(config, "/api/recovery/capabilities", { method: "GET" });
    if (!session) {
      return;
    }
    panels.innerHTML = "";
    if (!result.ok) {
      const errorBox = document.createElement("div");
      errorBox.className = "border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm text-amber-900";
      errorBox.textContent = recoveryErrorMessage(result.error);
      panels.appendChild(errorBox);
      return;
    }
    const emailSupported = result.payload.email === true;
    const totpSupported = result.payload.totp === true;
    if (emailSupported) {
      renderRecoveryEmailPanel(panels, context);
    }
    if (totpSupported) {
      renderTotpPanel(panels, context);
    }
    if (!emailSupported && !totpSupported) {
      const none = document.createElement("div");
      none.className = "passive-card px-4 py-3 text-sm text-black/65";
      none.textContent = "No recovery methods are available right now.";
      panels.appendChild(none);
    }
  })();
}

async function handleSignup(event: Event) {
  event.preventDefault();
  if (signupInFlight || busy || registrationDisabled) {
    return;
  }
  signupInFlight = true;
  signupSubmitted = true;
  signupTouched.localpart = true;
  signupTouched.password = true;
  signupTouched.passwordConfirmation = true;
  signupTouched.turnstile = true;
  signupServerErrors = {};
  const errors = clientErrors();
  if (Object.values(errors).some(Boolean)) {
    paintSignupError("");
    paintSignupErrors();
    signupInFlight = false;
    return;
  }
  paintSignupErrors();

  const password = passwordInput.value;
  if (passwordWeak() && weakSubmittedPassword !== password) {
    weakSubmittedPassword = password;
    riskCheckbox.checked = false;
    riskError = "";
    paintSignupError("");
    paintRiskNotice();
    signupInFlight = false;
    return;
  }

  if (showRiskNotice() && !riskCheckbox.checked) {
    riskError = "Check the box above to continue.";
    paintSignupError("");
    paintRiskNotice();
    signupInFlight = false;
    return;
  }

  if (pwnedCheck === null || pwnedCheck.password !== password) {
    breachChecking = true;
    paintSignupError("");
    syncDisabled();
    paintSubmit();
    const pwned = await isPasswordPwned(password);
    breachChecking = false;
    syncDisabled();
    paintSubmit();
    if (passwordInput.value !== password) {
      signupInFlight = false;
      return;
    }
    pwnedCheck = { password, pwned };
    if (pwned) {
      riskCheckbox.checked = false;
      riskError = "";
      paintRiskNotice();
      signupInFlight = false;
      return;
    }
  }

  const localpart = canonicalLocalpart();
  const sameAttempt = attempt !== null && attempt.localpart === localpart && attempt.password === password;
  let key = attempt && sameAttempt ? attempt.key : "";
  if (!key) {
    try {
      key = createIdempotencyKey();
    } catch {
      paintSignupError(signupErrorMessage("crypto_unavailable"));
      signupInFlight = false;
      return;
    }
  }
  const attemptTurnstileToken =
    turnstileEnabled && sameAttempt && attempt ? turnstileToken || attempt.turnstileToken : turnstileToken;
  const currentAttempt: SignupAttempt = {
    key,
    localpart,
    password,
    captchaVerified: attempt && sameAttempt ? attempt.captchaVerified : false,
    turnstileToken: attemptTurnstileToken,
  };
  attempt = currentAttempt;
  busy = true;
  paintSignupError("");
  syncDisabled();
  paintSubmit();

  const body: { localpart: string; password: string; turnstile_token?: string } = { localpart, password };
  if (turnstileEnabled) {
    body.turnstile_token = currentAttempt.turnstileToken;
  }

  const result = await apiRequest<SignupSuccess>(config, "/api/signup", {
    method: "POST",
    idempotencyKey: key,
    body,
  });
  busy = false;
  signupInFlight = false;
  syncDisabled();
  paintSubmit();

  if (!result.ok) {
    const fieldErrors = signupServerFieldErrors(result.error, turnstileEnabled);
    if (Object.values(fieldErrors).some(Boolean)) {
      signupServerErrors = fieldErrors;
      paintSignupError("");
    } else {
      paintSignupError(
        turnstileEnabled ? signupErrorMessage(result.error) : disabledTurnstileSignupErrorMessage(result.error)
      );
    }
    paintSignupErrors();
    if (captchaErrors.has(result.error)) {
      attempt = null;
      if (turnstileEnabled) {
        resetTurnstile();
      }
    } else if (result.network || signupTemporaryErrors.has(result.error)) {
      attempt = { ...currentAttempt, captchaVerified: true };
    } else {
      attempt = null;
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
    paintSignupError(signupErrorMessage("internal_error"));
    attempt = null;
    resetTurnstile();
    return;
  }

  session = {
    email: result.payload.email,
    username: result.payload.username,
    password,
    recoverySetupToken: result.payload.recovery_setup_token,
    recoverySetupExpiresAt: Date.now() + result.payload.recovery_setup_expires_in_seconds * 1000,
  };
  completedMethods = [];
  localpartInput.value = result.payload.username;
  passwordInput.value = "";
  confirmInput.value = "";
  turnstileToken = "";
  signupSubmitted = false;
  signupTouched.localpart = false;
  signupTouched.password = false;
  signupTouched.passwordConfirmation = false;
  signupTouched.turnstile = false;
  signupServerErrors = {};
  attempt = null;
  pwnedCheck = null;
  riskCheckbox.checked = false;
  riskError = "";
  weakSubmittedPassword = "";
  showSession();
}

function setUpSignupForm() {
  form.addEventListener("submit", (event) => {
    void handleSignup(event);
  });
  heading.hidden = true;
  form.noValidate = true;
  domainLabel.textContent = `@${config.accountDomain}`;
  if (configError) {
    configErrorBox.textContent = configError;
    configErrorBox.hidden = false;
  }
  syncDisabled();
  setUpTurnstile();

  localpartInput.addEventListener("input", () => {
    const lowered = localpartInput.value.toLowerCase();
    if (localpartInput.value !== lowered) {
      localpartInput.value = lowered;
    }
    signupServerErrors = { ...signupServerErrors, localpart: "" };
    paintSignupError("");
    paintSignupErrors();
  });
  localpartInput.addEventListener("blur", () => {
    signupTouched.localpart = true;
    paintSignupErrors();
  });

  passwordInput.addEventListener("input", () => {
    riskCheckbox.checked = false;
    riskError = "";
    signupServerErrors = { ...signupServerErrors, password: "" };
    paintSignupError("");
    paintSignupErrors();
    paintStrength();
    paintRiskNotice();
  });
  passwordInput.addEventListener("blur", () => {
    signupTouched.password = true;
    paintSignupErrors();
  });

  confirmInput.addEventListener("input", () => {
    signupServerErrors = { ...signupServerErrors, passwordConfirmation: "" };
    paintSignupError("");
    paintSignupErrors();
  });
  confirmInput.addEventListener("blur", () => {
    signupTouched.passwordConfirmation = true;
    paintSignupErrors();
  });

  riskCheckbox.addEventListener("change", () => {
    if (riskCheckbox.checked) {
      riskError = "";
      paintRiskNotice();
    }
  });

  privacyToggle.addEventListener("click", () => {
    const open = privacyToggle.getAttribute("aria-expanded") === "true";
    privacyToggle.setAttribute("aria-expanded", String(!open));
    privacyNote.hidden = open;
  });

  document.documentElement.setAttribute("data-registration-ready", "");
}

setUpSignupForm();
