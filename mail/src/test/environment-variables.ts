/**
 * Mock environment variables
 */
beforeAll(async () => {
  process.env.SMTP_PORT = "465";
  process.env.SMTP_HOST = "smtp.example.com";
  process.env.SMTP_USER = "test-user";
  process.env.SMTP_PASS = "test-password";
  process.env.QUEUE_GROUP_NAME = "mail_queue_group";
});
