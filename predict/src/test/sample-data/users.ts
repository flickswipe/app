import mongoose from "mongoose";

export const USER_A = {
  id: mongoose.Types.ObjectId("useraaaaaaaa").toHexString(),
  email: "a@user.com",
};

export const USER_B = {
  id: mongoose.Types.ObjectId("userbbbbbbbb").toHexString(),
  email: "b@user.com",
};

export const USER_C = {
  id: mongoose.Types.ObjectId("usercccccccc").toHexString(),
  email: "c@user.com",
};
