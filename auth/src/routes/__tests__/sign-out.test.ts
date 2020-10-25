import request from "supertest";
import { app } from "../../app";

describe("sign out", () => {
  it("returns a 200 and has no cookie", async () => {
    await request(app)
      .post("/api/en/auth/sign-out")
      .set("Cookie", await global.signIn("test@user.com"))
      .send()
      .expect(200);
  });

  it("clears cookie session", async () => {
    const response = await request(app)
      .post("/api/en/auth/sign-out")
      .set("Cookie", await global.signIn("test@user.com"))
      .send()
      .expect(200);

    expect(response.get("Set-Cookie")).toEqual([
      "express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly",
    ]);
  });
});
