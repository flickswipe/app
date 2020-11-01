import request from "supertest";
import { app } from "../../app";
import { listAllSettings } from "../../modules/settings/settings";

jest.mock("../../modules/settings/settings");

describe("get settings", () => {
  describe("user not signed in", () => {
    it("returns a 400", async () => {
      await request(app).get("/api/en/user/settings").send().expect(401);
    });
  });

  describe("user signed in", () => {
    it("returns a 200", async () => {
      await request(app)
        .get("/api/en/user/settings")
        .set("Cookie", await global.signIn())
        .send()
        .expect(200);
    });

    it("calls listAllSettings", async () => {
      await request(app)
        .get("/api/en/user/settings")
        .set("Cookie", await global.signIn())
        .send();

      expect(listAllSettings).toHaveBeenCalled();
    });

    it("returns value of listAllSettings", async () => {
      const response = await request(app)
        .get("/api/en/user/settings")
        .set("Cookie", await global.signIn())
        .send();

      expect(response.body).toEqual(await listAllSettings("sourcesource"));
    });
  });
});
