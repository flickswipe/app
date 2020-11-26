import { validateIso6391Param, validateRequest } from "@flickswipe/common";
import express, { Request, Response } from "express";

import { Jwt } from "../services/jwt";

const router = express.Router();

/**
 * @api {post} /api/en/auth/sign-out
 * @apiName SignOut
 * @apiGroup SignOut
 *
 * @apiDescription
 * Deletes JWT cookie.
 *
 * @apiSuccessExample {json} 200 OK
 * {
 *   "message": "User signed out"
 * }
 */
router.post(
  "/api/:iso6391/auth/sign-out",
  [validateIso6391Param("iso6391")],
  validateRequest,
  async (req: Request, res: Response) => {
    Jwt.clearSession(req);

    res.status(200).send({
      message: `User signed out`,
    });
  }
);

/**
 * Exports
 */
export { router as signOutRouter };
