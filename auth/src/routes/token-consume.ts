import {
  BadRequestError,
  EmailTokenType,
  validateIso6391Param,
  validateRequest,
} from "@flickswipe/common";

import express, { Request, Response } from "express";
import { body } from "express-validator";

import { ObjectId } from "mongodb";

import { EmailToken } from "../models/email-token";
import { User } from "../models/user";

import { Jwt } from "../services/classes/jwt";

import { natsWrapper } from "../nats-wrapper";
import { UserUpdatedEmailPublisher } from "../events/publishers/user-updated-email";

const router = express.Router();

/**
 * @api {post} /api/en/auth/consume-token
 * @apiName ConsumeToken
 * @apiGroup ConsumeToken
 *
 * @apiDescription
 * Consumes email token and takes one of the following actions:
 *
 * | Email Token Type | Action                             |
 * | ---------------- | ---------------------------------- |
 * | `SignIn`         | Creates JWT cookie                 |
 * | `AddEmail`       | Publishes `UserUpdatedEmail` event |
 *
 * @apiParam {string} userId (required)
 * @apiParam {string} token (required)
 *
 * @apiErrorExample {json}  400 Bad Request
 * {
 *   "errors": [
 *      // Present when params are missing or invalid
 *      { message: "You must supply a user id", field: "userId" },
 *      { message: "You must supply a token", field: "token" },
 *      // Present when details do not match a valid token
 *      { message: "Invalid credentials" },
 *      // Present when token is corrupted for some reason
 *      { message: "Invalid Token Payload" },
 *      // Present when user already has an associated email
 *      { message: "Cannot add email; user already has one" }
 *   ]
 * }
 *
 * @apiSuccessExample {json} 200 OK
 * {
 *   "message": "Token consumed"
 * }
 */
router.post(
  "/api/:iso6391/auth/consume-token",
  [
    validateIso6391Param("iso6391"),
    body("userId").trim().notEmpty().withMessage(`You must supply a user id`),
    body("token").trim().notEmpty().withMessage(`You must supply a token`),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { useragent: userAgent } = req;
    const { userId, token } = req.body;

    if (!ObjectId.isValid(userId)) {
      // thrown when user id is invalid
      throw new BadRequestError(`Invalid credentials`);
    }

    // get user
    const user = await User.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      // thrown when user doesn't exist
      throw new BadRequestError(`Invalid credentials`);
    }

    // get token
    const storedToken = await EmailToken.findOne({
      user: userId,
      token: token,
    });
    if (!storedToken) {
      // thrown when stored token doesn't exist
      throw new BadRequestError(`Invalid Credentials`);
    }

    if (storedToken.expiresAt < new Date()) {
      // throw when token has expired
      throw new BadRequestError(`Invalid Credentials`);
    }

    if (storedToken.userAgent !== userAgent.source) {
      // throw when token has expired
      throw new BadRequestError(`Invalid Credentials`);
    }

    // consume token
    switch (storedToken.emailTokenType) {
      case EmailTokenType.AddEmail:
        if (!storedToken.payload?.email) {
          throw new BadRequestError(`Invalid Token Payload`);
        }

        if (user.email) {
          throw new BadRequestError(`Cannot add email; user already has one`);
        }

        user.email = storedToken.payload.email;
        await user.save();

        // Publish an event saying that email was updated
        new UserUpdatedEmailPublisher(natsWrapper.client).publish({
          id: user.id,
          email: user.email,
          updatedAt: user.updatedAt,
        });

        // Generate JWT
        Jwt.setOnSession(req, {
          id: user.id,
          email: user.email,
        });
        break;

      case EmailTokenType.SignIn:
        // Generate JWT
        Jwt.setOnSession(req, {
          id: user.id,
          email: user.email,
        });
        break;
    }

    // delete token
    storedToken.remove();

    res.status(200).send({
      message: `Token consumed`,
    });
  }
);

export { router as tokensConsumeRouter };
