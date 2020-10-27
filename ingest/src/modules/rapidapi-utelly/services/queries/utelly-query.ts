import axios from "axios";
import { UtellyApiResultRaw } from "./utelly-parser";

/**
 * @see https://rapidapi.com/utelly/api/utelly?endpoint=apiendpoint_3cad787b-ca7b-449a-84b4-23b40d64fd7
 *
 * @param imdbId movie id to fetch
 * @param country country of streaming services to fetch
 *
 * @returns {UtellyApiResultRaw} raw api result
 */
export async function utellyQuery(
  imdbId: string,
  country: string
): Promise<UtellyApiResultRaw | void> {
  // make request
  let response;
  try {
    response = await axios({
      method: "get",
      url: "https://rapidapi.p.rapidapi.com/idlookup",
      headers: {
        "x-rapidapi-host":
          "utelly-tv-shows-and-movies-availability-v1.p.rapidapi.com",
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      },
      params: { source_id: imdbId, source: "imdb", country: country },
    });
  } catch (error) {
    console.error(`utellyQuery error`, error);
  }

  // handle missing data
  if (!response?.data?.collection?.locations) {
    console.log(`utelly query invalid response`, response && response.data);
    return null;
  }

  // return raw result
  return response.data as UtellyApiResultRaw;
}
