import request from "supertest";
import { natsWrapper } from "../../nats-wrapper";
import { app } from "../../app";

describe("guest user signup", () => {
  it("returns a 201", async () => {
    await request(app).post("/api/en/auth/create-user").send().expect(201);
  });

  it("sets a cookie", async () => {
    const response = await request(app)
      .post("/api/en/auth/create-user")
      .send()
      .expect(201);

    expect(response.get("Set-Cookie")).toBeDefined();
  });

  it("returns an id", async () => {
    const response = await request(app)
      .post("/api/en/auth/create-user")
      .send()
      .expect(201);

    expect(response.body?.user?.id).toBeDefined();
  });
});

describe("normal user signup", () => {
  it("returns a 201", async () => {
    await request(app)
      .post("/api/en/auth/create-user")
      .send({
        email: "test@user.com",
      })
      .expect(201);
  });

  it("sets a cookie", async () => {
    const response = await request(app)
      .post("/api/en/auth/create-user")
      .send({
        email: "test@user.com",
      })
      .expect(201);

    expect(response.get("Set-Cookie")).toBeDefined();
  });

  it("returns an id and email", async () => {
    const response = await request(app)
      .post("/api/en/auth/create-user")
      .send({
        email: "test@user.com",
      })
      .expect(201);

    expect(response.body?.user?.id).toBeDefined();
    expect(response.body?.user?.email).toBe("test@user.com");
  });

  it("publishes an event", async () => {
    await request(app)
      .post("/api/en/auth/create-user")
      .send({
        email: "test@user.com",
      })
      .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});

describe("trying to create user that is already authenticated", () => {
  it("returns a 400", async () => {
    await request(app)
      .post("/api/en/auth/create-user")
      .set("Cookie", await global.signIn("test@user.com"))
      .send()
      .expect(400);
  });
});

describe("trying to use same email twice", () => {
  it("returns a 400", async () => {
    await request(app)
      .post("/api/en/auth/create-user")
      .send({
        email: "test@user.com",
      })
      .expect(201);

    await request(app)
      .post("/api/en/auth/create-user")
      .send({
        email: "test@user.com",
      })
      .expect(400);
  });
});
