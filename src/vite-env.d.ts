/// <reference types="vite/client" />

type AxiPublicConfig = {
  backendBaseUrl: string;
  accountDomain: string;
  turnstileSiteKey: string;
};

type TurnstileRenderOptions = {
  sitekey: string;
  action?: string;
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
};

interface Window {
  AXI_CONFIG?: AxiPublicConfig;
  turnstile?: {
    render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
    reset: (widgetId: string) => void;
    remove: (widgetId: string) => void;
  };
}
