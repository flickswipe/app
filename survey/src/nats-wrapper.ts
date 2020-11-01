import nats, { Stan } from "node-nats-streaming";

/**
 * Creates a NATS client
 * @see https://www.npmjs.com/package/node-nats-streaming
 *
 * Every microservice that connects to NATS should contain this exact file.
 *
 * Publish/listen to events by extending BasePublisher/BaseListener in
 * @flickswipe/common, and then passing `natsWrapper.client`.
 *
 * @example
 * import { natsWrapper } from "./nats-wrapper";
 * import { ExamplePublisher } from "./events/publishers/example";
 *
 * // publish an event
 * await new ExamplePublisher(natsWrapper.client).publish({ ... });
 */
class NatsWrapper {
  private _client?: Stan;

  /**
   * @returns {Stan} nats client instance
   */
  get client() {
    if (!this._client) {
      throw new Error("Cannot access NATS client before connecting");
    }

    return this._client;
  }

  /**
   * @param clusterId nats cluster id
   * @param clientId  nats client id
   * @param url url of nats server
   *
   * @returns {Stan} nats client instance
   */
  connect(clusterId: string, clientId: string, url: string) {
    this._client = nats.connect(clusterId, clientId, { url });

    return new Promise((resolve, reject) => {
      this.client.on("connect", () => {
        console.log(`Connected to NATS`);
        resolve();
      });
      this.client.on("error", (err) => {
        reject(err);
      });
    });
  }
}

/**
 * Export
 */
export const natsWrapper = new NatsWrapper();
