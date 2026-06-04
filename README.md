### Axichat Website

Axichat terms and privacy policy are also stored here.

### Registration config

Website registration reads public deployment values from `public/config.js`:

```js
window.AXI_CONFIG = {
  backendBaseUrl: "https://axi.im",
  accountDomain: "axi.im",
  turnstileSiteKey: "0x4AAAAAADehgiH6s4PnL66Z"
};
```

Only public values belong in this file. Do not put `X-Client-Token`, signup backend tokens, authorization secrets, or
email-glue secrets in browser code.

Set `turnstileSiteKey` to a Cloudflare Turnstile site key to enable browser verification. Leaving it empty disables the
Turnstile widget and omits `turnstile_token` from signup requests.
