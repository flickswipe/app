// extend timeouts
let originalTimeout: number;

beforeEach(function () {
  originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 30 * 1000;
});

afterEach(function () {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
});
