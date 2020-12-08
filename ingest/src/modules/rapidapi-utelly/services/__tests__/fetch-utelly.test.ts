import axios from 'axios';

import { UTELLY_DOC_A } from '../../../../test/sample-data/utelly-docs';
import { Utelly } from '../../models/utelly';
import { fetchUtelly } from '../fetch-utelly';
// sample data
import utellyApiResultSample from './utelly.json';

describe("fetch utelly", () => {
  describe("no data provided", () => {
    beforeEach(() => {
      // @ts-ignore
      axios.mockResolvedValueOnce({});
    });

    it("should return null if no data provided", async () => {
      // has correct data
      expect(
        await fetchUtelly(UTELLY_DOC_A.imdbId, UTELLY_DOC_A.country)
      ).toBeNull();
    });
  });

  describe("data provided", () => {
    beforeEach(() => {
      // @ts-ignore
      axios.mockResolvedValueOnce({
        data: utellyApiResultSample,
      });
    });

    describe("doc exists", () => {
      it("should overwrite doc", async () => {
        const existingDoc = await Utelly.build(UTELLY_DOC_A).save();

        await fetchUtelly(UTELLY_DOC_A.imdbId, UTELLY_DOC_A.country);

        // has been overwritten
        expect((await Utelly.findById(existingDoc.id)).locations).toHaveLength(
          4
        );
      });
    });

    describe("no doc exists", () => {
      it("should create doc", async () => {
        await fetchUtelly(UTELLY_DOC_A.imdbId, UTELLY_DOC_A.country);

        // has been created
        expect(await Utelly.findOne({})).toEqual(
          expect.objectContaining({
            imdbId: UTELLY_DOC_A.imdbId,
            country: UTELLY_DOC_A.country,
          })
        );
      });
    });
  });
});
