import request from "supertest";
import { app } from "../../app";

// sample data
import { USER_A } from "../../test/sample-data/users";

describe("sign out", () => {
  it("returns a 200", async () => {
    // has correct status
    await request(app)
      .post("/api/en/auth/sign-out")
      .set("Cookie", await global.signIn(USER_A.email))
      .send()
      .expect(200);
  });

  it("clears cookie session", async () => {
    const response = await request(app)
      .post("/api/en/auth/sign-out")
      .set("Cookie", await global.signIn(USER_A.email))
      .send();

    // has cleared cookie
    expect(response.get("Set-Cookie")).toEqual([
      "express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly",
    ]);
  });
});
