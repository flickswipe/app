import request from "supertest";
import { natsWrapper } from "../../nats-wrapper";
import { app } from "../../app";

// sample data
import { USER_A } from "../../test/sample-data/users";

describe("guest user signup", () => {
  it("returns a 201", async () => {
    // returns correct status
    await request(app).post("/api/en/auth/create-user").send().expect(201);
  });

  it("sets a cookie", async () => {
    const response = await request(app).post("/api/en/auth/create-user").send();

    // has set cookie
    expect(response.get("Set-Cookie")).toBeDefined();
  });

  it("returns an id", async () => {
    const response = await request(app).post("/api/en/auth/create-user").send();

    // returns any id
    expect(response.body?.user?.id).toBeDefined();
  });
});

describe("normal user signup", () => {
  it("returns a 201", async () => {
    // returns correct status
    await request(app)
      .post("/api/en/auth/create-user")
      .send(USER_A)
      .expect(201);
  });

  it("sets a cookie", async () => {
    const response = await request(app)
      .post("/api/en/auth/create-user")
      .send(USER_A);

    // has set cookie
    expect(response.get("Set-Cookie")).toBeDefined();
  });

  it("returns an id and email", async () => {
    const response = await request(app)
      .post("/api/en/auth/create-user")
      .send(USER_A);

    // has id
    expect(response.body?.user?.id).toBeDefined();

    // has email
    expect(response.body?.user?.email).toBe(USER_A.email);
  });

  it("publishes an event", async () => {
    await request(app).post("/api/en/auth/create-user").send(USER_A);

    // has published event
    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});

describe("trying to create user that is already authenticated", () => {
  it("returns a 400", async () => {
    // returns correct status
    await request(app)
      .post("/api/en/auth/create-user")
      .set("Cookie", await global.signIn(USER_A.email))
      .send()
      .expect(400);
  });
});

describe("trying to use same email twice", () => {
  it("returns a 400", async () => {
    await request(app).post("/api/en/auth/create-user").send(USER_A);

    // returns correct status
    await request(app)
      .post("/api/en/auth/create-user")
      .send(USER_A)
      .expect(400);
  });
});
