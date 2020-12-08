import mongoose from 'mongoose';

export const USER_A = {
  id: mongoose.Types.ObjectId("useraaaaaaaa").toHexString(),
  email: "a@test.com",
};

export const USER_B = {
  id: mongoose.Types.ObjectId("userbbbbbbbb").toHexString(),
  email: "b@test.com",
};

export const USER_C = {
  id: mongoose.Types.ObjectId("usercccccccc").toHexString(),
  email: "c@test.com",
};

export const USER_D = {
  id: mongoose.Types.ObjectId("userdddddddd").toHexString(),
  email: "d@test.com",
};
