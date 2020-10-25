import request from "supertest";
import { app } from "../../app";

describe("send magic link", () => {
  it("returns a 400 when user already authenticated", async () => {
    await request(app)
      .post("/api/en/auth/send-magic-link")
      .set("Cookie", await global.signIn("test@user.com"))
      .send({
        email: "new@user.com",
      })
      .expect(400);
  });

  it("returns a 400 when no email supplied", async () => {
    await request(app)
      .post("/api/en/auth/send-magic-link")
      .send({})
      .expect(400);
  });

  it("returns a 400 when invalid email supplied", async () => {
    await request(app)
      .post("/api/en/auth/send-magic-link")
      .send({
        email: "invalid-email",
      })
      .expect(400);
  });

  it("returns a 202 when valid email supplied", async () => {
    await request(app)
      .post("/api/en/auth/send-magic-link")
      .send({
        email: "new@email.com",
      })
      .expect(202);
  });
});
