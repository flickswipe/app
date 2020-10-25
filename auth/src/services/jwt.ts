import { Request } from "express";
import jwt from "jsonwebtoken";

/**
 * Handles JWT logic
 */
export class Jwt {
  /**
   * Issue a JWT and save to current cookie session
   *
   * @param req current request
   * @param payload data to attach to JWT
   */
  static setOnSession(req: Request, payload: any = {}): void {
    const { JWT_KEY } = process.env;

    req.session = {
      jwt: jwt.sign(payload, JWT_KEY!),
    };
  }

  /**
   * Clear current cookie session
   *
   * @param req current request
   */
  static clearSession(req: Request): void {
    req.session = null;
  }
}
