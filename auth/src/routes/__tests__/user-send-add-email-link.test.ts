import request from 'supertest';

import { app } from '../../app';
// sample data
import { USER_A } from '../../test/sample-data/users';

describe("send email update link", () => {
  it("returns a 401 when no current user", async () => {
    // has correct status
    await request(app)
      .post("/api/en/auth/send-add-email-link")
      .send(USER_A)
      .expect(401);
  });

  it("returns a 400 when no email supplied", async () => {
    // has correct status
    await request(app)
      .post("/api/en/auth/send-add-email-link")
      .set("Cookie", await global.signIn(USER_A.email))
      .send()
      .expect(400);
  });

  it("returns a 400 when invalid email supplied", async () => {
    // has correct status
    await request(app)
      .post("/api/en/auth/send-add-email-link")
      .set("Cookie", await global.signIn(""))
      .send({
        email: "invalid-email",
      })
      .expect(400);
  });

  it("returns a 400 when user has email already", async () => {
    // has correct status
    await request(app)
      .post("/api/en/auth/send-add-email-link")
      .set("Cookie", await global.signIn(USER_A.email))
      .send({
        email: "new@email.com",
      })
      .expect(400);
  });

  it("returns a 202 when valid email supplied", async () => {
    // has correct status
    await request(app)
      .post("/api/en/auth/send-add-email-link")
      .set("Cookie", await global.signIn(""))
      .send({
        email: "new@email.com",
      })
      .expect(202);
  });
});
