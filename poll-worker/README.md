# Axichat discovery poll

This Cloudflare Worker stores only aggregate option counters in D1. Its public response contains coarse, relative bar weights in ten-point steps. It never returns vote counts, response totals, or exact percentages.

The registration page sends a selected option only after account creation succeeds. No username, email address, signup idempotency key, or other account identifier is sent to this Worker.

## Dashboard setup

No local Worker tooling is required.

1. In **D1 SQL database**, create a database named `axichat-discovery-poll`.
2. Open its **Console**, paste `migrations/0001_discovery_poll.sql`, and select **Execute**.
3. In **Workers & Pages**, create a Hello World Worker named `axichat-discovery-poll`.
4. Select **Edit code**, replace the sample with `src/index.js`, and deploy it.
5. Open the Worker's **Bindings** tab. Add the D1 database with variable name `DB`.
6. Under **Settings → Variables and Secrets**, add a text variable named `ALLOWED_ORIGINS` with value `https://axi.chat,http://localhost:5173,http://127.0.0.1:5173`.
7. Under **Settings → Observability**, turn off persisted Workers Logs and leave traces and Logpush disabled.
8. Copy the Worker's `https://...workers.dev` URL into `pollBaseUrl` in `public/config.js`, then rebuild and deploy the website.

For a production custom domain, add `poll.axi.chat` under the Worker's **Settings → Domains & Routes → Add → Custom Domain**, then use `https://poll.axi.chat` as `pollBaseUrl`. The `axi.chat` zone must be active on Cloudflare for this option.

For local development, run `npm run migrate:local` and then `npm run dev`. Add the Vite development origin to `ALLOWED_ORIGINS` if it uses a port other than 5173.

The endpoint accepts:

- `GET /` or `GET /poll` for coarse relative ratios.
- `POST /` or `POST /poll` with one of the configured sources in `{ "source": "web_search" }`.

POST requests require an allowed browser origin. This is an intentionally lightweight, anonymous poll rather than a cryptographically enforced one-vote-per-account system.
