import { EmailTokenType } from "@flickswipe/common";

export const SIGN_IN_TOKEN_A = {
  id: "AAAAAA",
  emailTokenType: EmailTokenType.SignIn,
  email: "test@user",
  url: "https://example.com/",
  token: "AAAAAA",
  expiresAt: new Date(),
};

export const ADD_EMAIL_TOKEN_A = {
  id: "AAAAAA",
  emailTokenType: EmailTokenType.AddEmail,
  email: "test@user",
  url: "https://example.com/",
  token: "AAAAAA",
  expiresAt: new Date(),
};
