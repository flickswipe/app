import { natsWrapper } from "./nats-wrapper";
import { transporterWrapper } from "./transporter-wrapper";

import { EmailTokenCreatedListener } from "./events/listeners/email-token-created";

/**
 * Get environment variables
 */
const {
  NATS_CLIENT_ID,
  NATS_URL,
  NATS_CLUSTER_ID,
  SMTP_PORT,
  SMTP_HOST,
  SMTP_USER,
  SMTP_PASS,
  QUEUE_GROUP_NAME,
  SENDER_ADDRESS,
} = process.env;

if (!NATS_CLIENT_ID) {
  throw new Error("NATS_CLIENT_ID must be defined");
}
if (!NATS_URL) {
  throw new Error("NATS_URL must be defined");
}
if (!NATS_CLUSTER_ID) {
  throw new Error("NATS_CLUSTER_ID must be defined");
}
if (!SMTP_PORT) {
  throw new Error("SMTP_PORT must be defined");
}
if (!SMTP_HOST) {
  throw new Error("SMTP_HOST must be defined");
}
if (!SMTP_USER) {
  throw new Error("SMTP_USER must be defined");
}
if (!SMTP_PASS) {
  throw new Error("SMTP_PASS must be defined");
}
if (!QUEUE_GROUP_NAME) {
  throw new Error("QUEUE_GROUP_NAME must be defined");
}
if (!SENDER_ADDRESS) {
  throw new Error("SENDER_ADDRESS must be defined");
}

/**
 * Initialize
 */
(async () => {
  try {
    // connect to messaging server
    await natsWrapper.connect(NATS_CLUSTER_ID, NATS_CLIENT_ID, NATS_URL);
    natsWrapper.client.on("close", () => {
      console.log(`NATS connection closed!`);
      process.exit();
    });
    process.on("SIGINT", () => natsWrapper.client.close());
    process.on("SIGTERM", () => natsWrapper.client.close());

    // listen to events
    new EmailTokenCreatedListener(natsWrapper.client).listen();

    // connect to mail server
    await transporterWrapper.connect(
      parseInt(SMTP_PORT, 10),
      SMTP_HOST,
      SMTP_USER,
      SMTP_PASS,
      // mail option defaults
      {
        from: SENDER_ADDRESS,
      }
    );
  } catch (err) {
    console.error(err);
  }
})();
