import { handoffBuyerUpdate } from "./support_chat.js";

const result = await handoffBuyerUpdate({ orderId: "ord_2048", sellerId: "seller_7", buyerId: "buyer_9", text: "Package handed to carrier." });
console.log(JSON.stringify(result));
