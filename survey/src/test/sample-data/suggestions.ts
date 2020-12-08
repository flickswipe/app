import mongoose from 'mongoose';

import { MEDIA_ITEM_A, MEDIA_ITEM_B } from './media-items';

export const SUGGESTION_A = {
  user: mongoose.Types.ObjectId("useraaaaaaaa").toHexString(),
  mediaItem: MEDIA_ITEM_A.id,
};

export const SUGGESTION_B = {
  user: mongoose.Types.ObjectId("useraaaaaaaa").toHexString(),
  mediaItem: MEDIA_ITEM_B.id,
};
