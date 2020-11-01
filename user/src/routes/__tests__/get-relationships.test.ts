import request from "supertest";
import { app } from "../../app";
import { listAllRelationships } from "../../modules/relationships/relationships";

jest.mock("../../modules/relationships/relationships");

describe("get relationships", () => {
  describe("user not signed in", () => {
    it("returns a 400", async () => {
      await request(app).get("/api/en/user/relationships").send().expect(401);
    });
  });

  describe("user signed in", () => {
    it("returns a 200", async () => {
      await request(app)
        .get("/api/en/user/relationships")
        .set("Cookie", await global.signIn())
        .send()
        .expect(200);
    });

    it("calls listAllRelationships", async () => {
      await request(app)
        .get("/api/en/user/relationships")
        .set("Cookie", await global.signIn())
        .send();

      expect(listAllRelationships).toHaveBeenCalled();
    });

    it("returns value of listAllRelationships", async () => {
      const response = await request(app)
        .get("/api/en/user/relationships")
        .set("Cookie", await global.signIn())
        .send();

      expect(response.body).toEqual(await listAllRelationships("sourcesource"));
    });
  });
});
