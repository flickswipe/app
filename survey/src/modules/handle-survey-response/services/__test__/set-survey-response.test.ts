import { BadRequestError, InterestType } from "@flickswipe/common";
import { MediaItem } from "../../../track-ingest/models/media-item";
import { SurveyResponse } from "../../models/survey-response";
import { setSurveyResponse } from "../set-survey-response";

describe("set survey response", () => {
  describe("invalid media item", () => {
    it("should return BadRequestError if media item doesn't exist", async () => {
      await expect(() =>
        setSurveyResponse(
          "useruseruser",
          "itemitemitem",
          InterestType.Interested,
          5
        )
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe("valid request", () => {
    beforeEach(async () => {
      await MediaItem.build({
        id: "ab1234567890ab1234567890",
        tmdbMovieId: 123,
        imdbId: "tt1234567",
        title: "My Movie",
        images: {
          poster: "https://example.com/",
          backdrop: "https://example.com/",
        },
        genres: ["bc1234567890ab1234567890"],
        rating: {
          average: 100,
          count: 101,
          popularity: 102,
        },
        language: "en",
        releaseDate: new Date(),
        runtime: 103,
        plot: "My movie plit...",
        streamLocations: {
          us: [
            {
              id: "0987654321234567890",
              name: "Netflix",
              url: "https://example.com/",
            },
          ],
        },
      }).save();
    });

    it("should update existing doc", async () => {
      await SurveyResponse.build({
        user: "aaabbbcccddd",
        mediaItem: "ab1234567890ab1234567890",
        interestType: InterestType.Interested,
      }).save();

      await setSurveyResponse(
        "aaabbbcccddd",
        "ab1234567890ab1234567890",
        InterestType.Uninterested,
        5
      );

      expect(
        await SurveyResponse.findOne({
          user: "aaabbbcccddd",
          mediaItem: "ab1234567890ab1234567890",
        })
      ).toEqual(
        expect.objectContaining({
          user: "aaabbbcccddd",
          mediaItem: "ab1234567890ab1234567890",
          interestType: InterestType.Uninterested,
          rating: 5,
        })
      );
    });

    it("should create new doc", async () => {
      await setSurveyResponse(
        "aaabbbcccddd",
        "ab1234567890ab1234567890",
        InterestType.Uninterested,
        5
      );

      expect(
        await SurveyResponse.findOne({
          user: "aaabbbcccddd",
          mediaItem: "ab1234567890ab1234567890",
        })
      ).toEqual(
        expect.objectContaining({
          user: "aaabbbcccddd",
          mediaItem: "ab1234567890ab1234567890",
          interestType: InterestType.Uninterested,
          rating: 5,
        })
      );
    });
  });
});
