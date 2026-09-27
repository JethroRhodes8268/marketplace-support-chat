import { z } from "zod";
import { InfraiClient } from "./infrai_client.js";

export const supportMessage = z.object({
  orderId: z.string().min(1), sellerId: z.string().min(1), buyerId: z.string().min(1), text: z.string().min(1).max(2000)
});
export type SupportMessage = z.infer<typeof supportMessage>;

export async function handoffBuyerUpdate(input: SupportMessage, client = new InfraiClient()) {
  const message = supportMessage.parse(input);
  const channel = `order-${message.orderId}`;
  await client.createChannel({ channel, type: "private" });
  await client.publish({ channel, event: "buyer.update", account_id: message.sellerId, data: { buyer_id: message.buyerId, text: message.text, order_id: message.orderId } });
  return { channel, event: "buyer.update", accepted: true };
}
