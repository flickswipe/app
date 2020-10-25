/**
 * Mock environment variables
 */
beforeAll(async () => {
  process.env.HOST = "https://test.flickswipe.app";
  process.env.QUEUE_GROUP_NAME = "test-queue-group";
  process.env.JWT_KEY = "test-jwt-key";
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
});
