import status from "http-status";
import { Request, Response } from "express";

import { ApiError, ApiResponce, asyncHandler } from "../utils/customUtilities";
import userService from "../services/user.service";
import { AppString } from "../utils/appString";
import subscriptionService from "../services/subscription.service";

const toggleSubscription = asyncHandler(async (req: Request, res: Response) => {
  try {
    const channelId: string = req.params.id;
    const subscriberId = req.user._id;

    let channelIdOwner = await userService.getUserById(channelId);
    if (!channelIdOwner) {
      return res
        .status(status.BAD_REQUEST)
        .json(new ApiError(status.BAD_REQUEST, AppString.USER_NOT_FOUND));
    }
    let subscribe = await subscriptionService.getSubscription(
      channelId,
      subscriberId
    );
    if (subscribe.length > 0) {
      let unsubscribe = await subscriptionService.deleteSubsciption(
        channelId,
        subscriberId
      );
      if (!unsubscribe) {
        return res
          .status(status.INTERNAL_SERVER_ERROR)
          .json(
            new ApiError(
              status.INTERNAL_SERVER_ERROR,
              AppString.UNSUBSCRIPTION_FAILED
            )
          );
      }
      return res
        .status(status.OK)
        .json(new ApiResponce(status.OK, {}, AppString.USER_UNSUBSCRIBED));
    } else {
      let subscribeChannel = await subscriptionService.createSubscription(
        channelId,
        subscriberId
      );
      if (!subscribeChannel) {
        return res
          .status(status.INTERNAL_SERVER_ERROR)
          .json(
            new ApiError(
              status.INTERNAL_SERVER_ERROR,
              AppString.SUBSCRIPTION_FAILED
            )
          );
      }
      return res
        .status(status.OK)
        .json(new ApiResponce(status.OK, {}, AppString.USER_SUBSCRIBED));
    }
  } catch (error) {
    return res
      .status(status.INTERNAL_SERVER_ERROR)
      .json(
        new ApiError(status.INTERNAL_SERVER_ERROR, (error as Error).message)
      );
  }
});

const getSubscribedChannel = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      let subscriberId: string = req.params.id;

      let subscriberExist = await userService.getUserById(subscriberId);

      if (!subscriberExist) {
        return res
          .status(status.BAD_REQUEST)
          .json(
            new ApiError(status.BAD_REQUEST, AppString.SUBSCRIBER_NOT_FOUND)
          );
      }

      let channels =
        await subscriptionService.getSubscribedChannel(subscriberId);

      return res
        .status(status.OK)
        .json(
          new ApiResponce(status.OK, channels, AppString.SUBSCRIBER_FETCHED)
        );
    } catch (error) {
      return res
        .status(status.INTERNAL_SERVER_ERROR)
        .json(
          new ApiError(status.INTERNAL_SERVER_ERROR, (error as Error).message)
        );
    }
  }
);

const getChannelSubscriber = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      let channelId: string = req.params.id;

      let channelExist = await userService.getUserById(channelId);

      if (!channelExist) {
        return res
          .status(status.BAD_REQUEST)
          .json(new ApiError(status.BAD_REQUEST, AppString.CHANNEL_NOT_FOUND));
      }

      let subscriber =
        await subscriptionService.getChannelSubscriber(channelId);

      return res
        .status(status.OK)
        .json(
          new ApiResponce(status.OK, subscriber, AppString.SUBSCRIBER_FETCHED)
        );
    } catch (error) {
      return res
        .status(status.INTERNAL_SERVER_ERROR)
        .json(
          new ApiError(status.INTERNAL_SERVER_ERROR, (error as Error).message)
        );
    }
  }
);

export default {
  toggleSubscription,
  getSubscribedChannel,
  getChannelSubscriber,
};
