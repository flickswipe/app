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

  it.todo("should return null if no data provided");

  it.todo("should overwrite and return existing docs");

  it("should create and return utelly doc", async () => {
    // @ts-ignore
    axios.mockResolvedValueOnce({
      data: utellyApiResultSample,
    });

    const newDoc = (await fetchUtelly("tt4154796", "es")) as UtellyDoc;
    expect(newDoc).toBeDefined();
    expect(newDoc.imdbId).toBe("tt4154796");
    expect(newDoc.country).toBe("es");

    const count = await Utelly.countDocuments({});
    expect(count).toBe(1);

    const doc = (await Utelly.findOne({})) as UtellyDoc;
    expect(doc).toBeDefined();
    expect(doc.imdbId).toBe("tt4154796");
    expect(doc.country).toBe("es");
  });
});
