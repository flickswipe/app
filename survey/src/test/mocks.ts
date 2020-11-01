/**
 * Mock modules
 */

// mocked in __mocks__
jest.mock("../nats-wrapper");

beforeEach(async () => {
  jest.clearAllMocks();
});
