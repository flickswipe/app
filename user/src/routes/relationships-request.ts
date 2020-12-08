import express, { Request, Response } from 'express';

import {
    currentUser, NotFoundError, requireAuth, validateIso6391Param, validateObjectIdParam,
    validateRequest
} from '@flickswipe/common';

import { requestRelationship } from '../modules/relationships/relationships';
import { getUser } from '../modules/track-auth/track-auth';

const router = express.Router();

/**
 * @api {post} /api/en/user/relationships/:id/request
 * @apiName Request Relationship
 * @apiGroup RequestRelationship
 *
 * @apiDescription
 * Creates a relationship request
 *
 * @apiParam {string} id the user with whom to request relationship
 *
 * @apiErrorExample {json}  400 Bad request
 * {
 *   "errors": [
 *      // Present when user attempts to use their own id
 *      { message: "Two different IDs must be supplied" },
 *      // Present when user already has a relationship with target user
 *      { message: "Relationship already exists" },
 *      // Present when trying to create an invalid request
 *      { message: "Invalid relationship type" },
 *      // Present when user already has a relationship request with target user
 *      { message: "Request already exists" },
 *      // Present when target user already has a relationship request with user
 *      { message: "Opposite request already exists; accept it instead." },
 *   ]
 * }
 *
 * @apiErrorExample {json}  401 Not authorized
 * {
 *   "errors": [
 *      { message: "Not authorized" },
 *   ]
 * }
 *
 * @apiErrorExample {json}  404 Not found
 * {
 *   "errors": [
 *      { message: "Not found" },
 *   ]
 * }
 *
 * @apiSuccessExample {json} 200 OK
 * {
 *   "message": "Relationship request created"
 * }
 */
router.post(
  "/api/:iso6391/user/relationships/:id/request",
  [validateIso6391Param("iso6391"), validateObjectIdParam("id")],
  validateRequest,
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { currentUser } = req;
    const { id: targetUserId } = req.params;

    // get target user
    const targetUserDoc = await getUser(targetUserId);

    if (!targetUserDoc) {
      throw new NotFoundError();
    }

    // request relationship
    await requestRelationship(currentUser.id, targetUserId);

    res.status(200).send({
      message: `Relationship request created`,
    });
  }
);

export { router as relationshipsRequestRouter };
