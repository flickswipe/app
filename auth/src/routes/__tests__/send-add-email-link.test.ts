import request from "supertest";
import { app } from "../../app";

describe("send email update link", () => {
  it("returns a 401 when no current user", async () => {
    await request(app)
      .post("/api/en/auth/send-add-email-link")
      .send({
        email: "new@user.com",
      })
      .expect(401);
  });

  it("returns a 400 when no email supplied", async () => {
    await request(app)
      .post("/api/en/auth/send-add-email-link")
      .set("Cookie", await global.signIn("test@user.com"))
      .send()
      .expect(400);
  });

  it("returns a 400 when invalid email supplied", async () => {
    await request(app)
      .post("/api/en/auth/send-add-email-link")
      .set("Cookie", await global.signIn(""))

      .send({
        email: "invalid-email",
      })
      .expect(400);
  });

  it("returns a 400 when user has email already", async () => {
    await request(app)
      .post("/api/en/auth/send-add-email-link")
      .set("Cookie", await global.signIn("test@user.com"))
      .send({
        email: "new@email.com",
      })
      .expect(400);
  });

  it("returns a 202 when valid email supplied", async () => {
    await request(app)
      .post("/api/en/auth/send-add-email-link")
      .set("Cookie", await global.signIn(""))
      .send({
        email: "new@email.com",
      })
      .expect(202);
  });
});
