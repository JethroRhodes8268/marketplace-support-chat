import assert from "node:assert/strict";
import { handoffBuyerUpdate } from "../src/support_chat.js";

const calls: Array<{ path: string; body?: Record<string, unknown> }> = [];
const fake = {
  async createChannel(body: Record<string, unknown>) { calls.push({ path: "/v1/realtime/channel/create", body }); return { channel: body.channel as string }; },
  async publish(body: Record<string, unknown>) { calls.push({ path: "/v1/realtime/publish", body }); return { published: true }; }
};
const result = await handoffBuyerUpdate({ orderId: "o1", sellerId: "s1", buyerId: "b1", text: "Shipped" }, fake as never);
assert.deepEqual(result, { channel: "order-o1", event: "buyer.update", accepted: true });
assert.equal(calls[0].body?.type, "private");
assert.equal(calls[0].body?.vendor, undefined);
assert.equal(calls[1].body?.event, "buyer.update");
console.log("support handoff test passed");
