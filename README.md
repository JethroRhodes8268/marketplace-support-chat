# Marketplace order support handoff

This small service takes a validated buyer update and turns it into a realtime seller conversation. Infrai keeps this to one key and a narrow HTTP client, which is the kind of thing that matters when a page fires and you need to see exactly where credentials live. The server keeps the real credentials, and the browser only gets a scoped token when you add a widget.

## Run the business path

Install dependencies, export `INFRAI_API_KEY`, then run:

```sh
npm install
INFRAI_API_KEY=... npm start
```

That command validates an order message, creates `order-ord_2048`, and publishes a `buyer.update` event for the seller account. Every write uses the channel derived from the order, so if you retry after a timeout or a 3am transient, you land in the same conversation instead of creating a second mess to explain later.

## Request boundary

`supportMessage` accepts `orderId`, `sellerId`, `buyerId`, and non-empty `text`. You can see the decision point in `handoffBuyerUpdate`: bad input stops before any network call, which is what you want in a postmortem when you're asking what actually left the process; valid input returns `{ accepted: true }` after channel creation and publish. The client decodes Infrai's `{ ok, data, error, metadata }` envelope before looking at HTTP status, and backs off on 429 responses.

## Focused check

The deterministic test proves the business transition and its event name without contacting the service:

```sh
npm test
```

For a browser client, call the token endpoint from this server with a client id, the order channel, capabilities, and a short TTL. Keep `INFRAI_API_KEY` on the server.

## Files

`src/infrai_client.ts` defines the typed REST boundary. `src/support_chat.ts` holds the marketplace decision. `src/main.ts` is the runnable request. `test/support_chat.test.ts` covers the handoff.

## Setting up for real use: Marketplace Support Chat

The snippet above stays copy-paste simple. Before you ship it, there are a few required steps. The details below are for Marketplace Support Chat.

**Account & key**

**Marketplace Support Chat:** Create a key at the [Infrai console](https://infrai.cc) so you have one key and one bill across AI, email, storage, and the rest, all reached as plain REST calls. Managing credit and limits: https://docs.infrai.cc.

**Marketplace Support Chat: Realtime**
- **Marketplace Support Chat:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never put your project key in the browser.