import { currentUser, requireAuth } from "@flickswipe/common";

import express, { Request, Response } from "express";
import { listAllRelationships } from "../modules/relationships/relationships";

const router = express.Router();

/**
 * Types
 */
type RelationshipsPayload = {
  active: string[];
  blocked: string[];
  pending: string[];
};

/**
 * @api {post} /api/en/user/relationships
 * @apiName GetRelationships
 * @apiGroup GetRelationships
 *
 * @apiDescription
 * Gets the users active, blocked, and pending relationships as arrays of user
 * ids.
 *
 * @apiErrorExample {json}  401 Not authorized
 * {
 *   "errors": [
 *      { message: "Not authorized" },
 *   ]
 * }
 *
 * @apiSuccessExample {json} 200 OK
 * {
 *   "active": ["..."],
 *   "blocked": ["..."],
 *   "pending": ["..."],
 * }
 */
router.post(
  "/api/en/user/relationships",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { currentUser } = req;

    const relationships = (await listAllRelationships(
      currentUser.id
    )) as RelationshipsPayload;

    res.status(200).send(relationships);
  }
);

export { router as getRelationshipsRouter };
