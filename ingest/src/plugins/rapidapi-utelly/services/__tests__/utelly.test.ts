import axios from "axios";

import { fetchUtelly } from "../fetch-utelly";
import { Utelly } from "../../models/utelly";
import utellyApiResultSample from "./utelly.json";

describe("ingest data from rapidapi", () => {
  it("should ingest utelly api", async () => {
    // @ts-ignore
    axios.mockResolvedValueOnce({
      data: utellyApiResultSample,
    });

    await fetchUtelly("tt4154796", "es");

    expect(axios).toHaveBeenCalled();

    const count = await Utelly.countDocuments({});
    expect(count).toBe(1);

    const doc = await Utelly.findOne({});
    expect(doc?.imdbId).toBe("tt4154796");
    expect(doc?.country).toBe("es");
    expect(doc?.locations).toBeDefined();
  });
});
