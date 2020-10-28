import request from "supertest";
import { app } from "../../app";
import { Genre } from "../../modules/track-ingest/models/genre";

describe("get genres", () => {
  it("returns a 401", async () => {
    await request(app).get("/api/en/catalog/genres").send().expect(401);
  });

  it("returns a 404", async () => {
    await request(app)
      .get("/api/en/catalog/genres")
      .set("Cookie", await global.signIn())
      .send()
      .expect(404);
  });

  it("returns a 200", async () => {
    await Genre.build({
      id: "ab1234567890ab1234567890",
      name: "My Genre",
      language: "en-US",
    }).save();

    await request(app)
      .get("/api/en/catalog/genres")
      .set("Cookie", await global.signIn())
      .send()
      .expect(200);
  });

  it("returns an array with at least one genre", async () => {
    await Genre.build({
      id: "ab1234567890ab1234567890",
      name: "My Genre",
      language: "en-US",
    }).save();

    const response = await request(app)
      .get("/api/en/catalog/genres")
      .set("Cookie", await global.signIn())
      .send()
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body[0]).toEqual(
      expect.objectContaining({
        id: "ab1234567890ab1234567890",
        name: "My Genre",
      })
    );
  });
});
