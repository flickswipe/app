import axios from "axios";

import { UtellyApiResultRaw } from "../result-parsers/utelly";

/**
 * @see https://rapidapi.com/utelly/api/utelly?endpoint=apiendpoint_3cad787b-ca7b-449a-84b4-23b40d64fd7
 */
export async function utellyQuery(
  imdbId: string,
  country: string
): Promise<UtellyApiResultRaw | void> {
  try {
    const response = await axios({
      method: "get",
      url: "https://rapidapi.p.rapidapi.com/idlookup",
      headers: {
        "x-rapidapi-host":
          "utelly-tv-shows-and-movies-availability-v1.p.rapidapi.com",
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      },
      params: { source_id: imdbId, source: "imdb", country: country },
    });

    if (!response?.data?.collection?.locations) {
      return null;
    }

    const data = response.data as UtellyApiResultRaw;
    return data;
  } catch (error) {
    console.error("utellyQuery error", error);
    throw error;
  }
}
