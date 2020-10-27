/**
 * Mock modules
 */

// mocked in __mocks__
jest.mock("../transporter-wrapper");
jest.mock("../nats-wrapper");

beforeEach(async () => {
  jest.clearAllMocks();
});
