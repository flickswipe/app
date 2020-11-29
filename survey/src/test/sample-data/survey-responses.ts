import { InterestType } from "@flickswipe/common";
import mongoose from "mongoose";
import { SurveyResponseAttrs } from "../../modules/handle-survey-response/models/survey-response";
import { MEDIA_ITEM_A, MEDIA_ITEM_B } from "./media-items";

export const SURVEY_RESPONSE_CONSUMED_A: SurveyResponseAttrs = {
  user: mongoose.Types.ObjectId("useraaaaaaaa").toHexString(),
  mediaItem: MEDIA_ITEM_A.id,
  interestType: InterestType.Consumed,
  rating: 5,
};

export const SURVEY_RESPONSE_INTERESTED_A: SurveyResponseAttrs = {
  user: mongoose.Types.ObjectId("useraaaaaaaa").toHexString(),
  mediaItem: MEDIA_ITEM_A.id,
  interestType: InterestType.Interested,
  rating: null,
};

export const SURVEY_RESPONSE_UNINTERESTED_A: SurveyResponseAttrs = {
  user: mongoose.Types.ObjectId("useraaaaaaaa").toHexString(),
  mediaItem: MEDIA_ITEM_A.id,
  interestType: InterestType.Uninterested,
  rating: null,
};

export const SURVEY_RESPONSE_NEVER_A: SurveyResponseAttrs = {
  user: mongoose.Types.ObjectId("useraaaaaaaa").toHexString(),
  mediaItem: MEDIA_ITEM_A.id,
  interestType: InterestType.Never,
  rating: null,
};

export const SURVEY_RESPONSE_CONSUMED_B: SurveyResponseAttrs = {
  user: mongoose.Types.ObjectId("useraaaaaaaa").toHexString(),
  mediaItem: MEDIA_ITEM_B.id,
  interestType: InterestType.Consumed,
  rating: 5,
};

export const SURVEY_RESPONSE_INTERESTED_B: SurveyResponseAttrs = {
  user: mongoose.Types.ObjectId("useraaaaaaaa").toHexString(),
  mediaItem: MEDIA_ITEM_B.id,
  interestType: InterestType.Interested,
  rating: null,
};

export const SURVEY_RESPONSE_UNINTERESTED_B: SurveyResponseAttrs = {
  user: mongoose.Types.ObjectId("useraaaaaaaa").toHexString(),
  mediaItem: MEDIA_ITEM_B.id,
  interestType: InterestType.Uninterested,
  rating: null,
};

export const SURVEY_RESPONSE_NEVER_B: SurveyResponseAttrs = {
  user: mongoose.Types.ObjectId("useraaaaaaaa").toHexString(),
  mediaItem: MEDIA_ITEM_B.id,
  interestType: InterestType.Never,
  rating: null,
};
