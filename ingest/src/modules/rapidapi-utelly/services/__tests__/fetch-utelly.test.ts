import axios from "axios";

import { fetchUtelly } from "../fetch-utelly";
import { Utelly, UtellyDoc } from "../../models/utelly";
import utellyApiResultSample from "./utelly.json";

describe("fetch utelly", () => {
  it("should call axios", async () => {
    // @ts-ignore
    axios.mockResolvedValueOnce({
      data: utellyApiResultSample,
    });

    await fetchUtelly("tt4154796", "es");

    expect(axios).toHaveBeenCalled();
  });

  it("should return null if no data provided", async () => {
    // @ts-ignore
    axios.mockResolvedValueOnce({});

    const result = await fetchUtelly("tt4154796", "es");

    expect(result).toBeNull();
  });

  it("should overwrite existing doc and return", async () => {
    const existingDocAttrs = {
      imdbId: "tt4154796",
      country: "uk",
      locations: [
        {
          displayName: "Netflix",
          name: "NETFLIXGB",
          id: "aaaaaaa",
          url: "http://example.com/",
        },
      ],
    };

    await Utelly.build(existingDocAttrs).save();

    // @ts-ignore
    axios.mockResolvedValueOnce({
      data: utellyApiResultSample,
    });

    const result = await fetchUtelly("tt4154796", "uk");

    const overwrittenDoc = await Utelly.findOne({
      imdbId: "tt4154796",
      country: "uk",
    });

    // has been overwritten
    expect(overwrittenDoc.locations).toHaveLength(4);

    // has been returned
    expect(overwrittenDoc.id).toEqual(result && result.id);
  });

  it("should create utelly doc and return", async () => {
    // @ts-ignore
    axios.mockResolvedValueOnce({
      data: utellyApiResultSample,
    });

    const newDoc = (await fetchUtelly("tt4154796", "es")) as UtellyDoc;

    // has been returned
    expect(newDoc).toEqual(
      expect.objectContaining({
        imdbId: "tt4154796",
        country: "es",
      })
    );

    // has been created
    const createdDoc = (await Utelly.findOne({})) as UtellyDoc;
    expect(createdDoc).toEqual(
      expect.objectContaining({
        imdbId: "tt4154796",
        country: "es",
      })
    );
  });
});
