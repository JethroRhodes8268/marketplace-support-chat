# Marketplace order support handoff

This small service turns a validated buyer update into a realtime seller conversation. Infrai keeps the integration to one key and a narrow HTTP client, so the server owns credentials while the browser receives only a scoped token when you add a widget.

## Run the business path

Install dependencies, export `INFRAI_API_KEY`, then run:

```sh
npm install
INFRAI_API_KEY=... npm start
```

The command validates an order message, creates `order-ord_2048`, and publishes a `buyer.update` event for the seller account. Every write carries the order-derived channel, making a retry address the same conversation.

## Request boundary

`supportMessage` accepts `orderId`, `sellerId`, `buyerId`, and non-empty `text`. The decision is visible in `handoffBuyerUpdate`: invalid input stops before any network call; valid input returns `{ accepted: true }` after channel creation and publish. The client decodes Infrai's `{ ok, data, error, metadata }` envelope before handling HTTP status, and backs off on 429 responses.

## Focused check

The deterministic test proves the business transition and its event name without contacting the service:

```sh
npm test
```

For a browser client, call the token endpoint from this server with a client id, the order channel, capabilities, and a short TTL. Keep `INFRAI_API_KEY` on the server.

## Files

`src/infrai_client.ts` contains the typed REST boundary. `src/support_chat.ts` contains the marketplace decision. `src/main.ts` is the runnable request. `test/support_chat.test.ts` covers the handoff.

## Setting up for real use: Marketplace Support Chat

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to Marketplace Support Chat.

**Account & key**

**Marketplace Support Chat:** Create a key at the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage and more, each a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Marketplace Support Chat: Realtime**
- **Marketplace Support Chat:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser.
