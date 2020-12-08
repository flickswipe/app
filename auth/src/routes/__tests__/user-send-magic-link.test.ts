import request from 'supertest';

import { app } from '../../app';
// sample data
import { USER_A } from '../../test/sample-data/users';

describe("send magic link", () => {
  it("returns a 400 when user authenticated", async () => {
    // has correct status
    await request(app)
      .post("/api/en/auth/send-magic-link")
      .set("Cookie", await global.signIn(USER_A.email))
      .send({
        email: "new@user.com",
      })
      .expect(400);
  });

  it("returns a 400 when no email supplied", async () => {
    // has correct status
    await request(app)
      .post("/api/en/auth/send-magic-link")
      .send({})
      .expect(400);
  });

  it("returns a 400 when invalid email supplied", async () => {
    // has correct status
    await request(app)
      .post("/api/en/auth/send-magic-link")
      .send({
        email: "invalid-email",
      })
      .expect(400);
  });

  it("returns a 202 when valid email supplied", async () => {
    // has correct status
    await request(app)
      .post("/api/en/auth/send-magic-link")
      .send(USER_A)
      .expect(202);
  });
});
