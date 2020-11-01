/**
 * Provide global helper functions for tests
 */
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

declare global {
  namespace NodeJS {
    interface Global {
      signIn(id?: string, email?: string): Promise<string[]>;
    }
  }
}

/**
 * Simulate a signed in user
 */
global.signIn = async (id: string = null, email: string = null) => {
  // Build a JWT payload.  { id, email }
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: email || "test@user.com",
  };

  // Create the JWT!
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Build session Object. { jwt: MY_JWT }
  const session = { jwt: token };

  // Turn that session into JSON
  const sessionJSON = JSON.stringify(session);

  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString("base64");

  // return a string thats the cookie with the encoded data
  return [`express:sess=${base64}`];
};
