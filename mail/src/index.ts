import { attachExitTasks, connectToMailServer, connectToMessagingServer } from '@flickswipe/common';
import { RewriteFrames } from '@sentry/integrations';
import * as Sentry from '@sentry/node';

import { EmailTokenCreatedListener } from './events/listeners/email-token-created';
import { natsWrapper } from './nats-wrapper';
import { sendTestEmail } from './services/send-test';
import { transporterWrapper } from './transporter-wrapper';

/**
 * Error & performance tracking
 */
const tracesSampleRate = parseInt(process.env.SENTRY_SAMPLE_RATE, 10) || 0;
console.info(`Sending ${tracesSampleRate * 100}% of events to Sentry`);

Sentry.init({
  integrations: [
    new RewriteFrames({
      root: __dirname || process.cwd(),
    }),
  ],

  tracesSampleRate: tracesSampleRate,
});

/**
 * Get environment variables
 */
const {
  NODE_ENV,
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

console.info(`Node environment`, process.version, NODE_ENV);

if (!NATS_CLIENT_ID) {
  throw new Error(`NATS_CLIENT_ID must be defined`);
}
if (!NATS_URL) {
  throw new Error(`NATS_URL must be defined`);
}
if (!NATS_CLUSTER_ID) {
  throw new Error(`NATS_CLUSTER_ID must be defined`);
}
if (!SMTP_PORT) {
  throw new Error(`SMTP_PORT must be defined`);
}
if (!SMTP_HOST) {
  throw new Error(`SMTP_HOST must be defined`);
}
if (!SMTP_USER) {
  throw new Error(`SMTP_USER must be defined`);
}
if (!SMTP_PASS) {
  throw new Error(`SMTP_PASS must be defined`);
}
if (!QUEUE_GROUP_NAME) {
  throw new Error(`QUEUE_GROUP_NAME must be defined`);
}
if (!SENDER_ADDRESS) {
  throw new Error(`SENDER_ADDRESS must be defined`);
}

/**
 * Initialize
 */
(async () => {
  const exitTasks = await Promise.all([
    connectToMessagingServer(
      natsWrapper,
      NATS_CLUSTER_ID,
      NATS_CLIENT_ID,
      NATS_URL,
      [EmailTokenCreatedListener]
    ),
    connectToMailServer(
      transporterWrapper,
      parseInt(SMTP_PORT, 10),
      SMTP_HOST,
      SMTP_USER,
      SMTP_PASS,
      SENDER_ADDRESS
    ),
  ]);

  attachExitTasks(process, exitTasks);

  // send test email
  if (NODE_ENV === "development") {
    try {
      await sendTestEmail();
    } catch (err) {
      console.error(`Can't send test email`, err);
    }
  }
})();
