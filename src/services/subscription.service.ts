import mongoose from "mongoose";
import { Subscription } from "../models/subscription.model";
import { User } from "../models/user.model";

const createSubscription = async (channel: string, subscriber: string) => {
  return await Subscription.create({
    subscriber: subscriber,
    channel: channel,
  });
};

const deleteSubsciption = async (channel: string, subscriber: string) => {
  return await Subscription.findOneAndDelete({
    channel: new mongoose.Types.ObjectId(channel),
    subscriber: new mongoose.Types.ObjectId(subscriber),
  });
};

const getSubscription = async (channel: string, subscriber: string) => {
  let pipeline = [
    {
      $match: {
        $and: [
          { channel: new mongoose.Types.ObjectId(channel) },
          { subscriber: new mongoose.Types.ObjectId(subscriber) },
        ],
      },
    },
  ];
  return await Subscription.aggregate(pipeline);
};

const getSubscribedChannel = async (subscriber: string) => {
  let pipeline = [
    {
      $match: { subscriber: new mongoose.Types.ObjectId(subscriber) },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channel",
      },
    },
    {
      $unwind: "$channel",
    },
    {
      $project: {
        channelId: "$channel._id", // Rename the field to remove '$'
        channel: "$channel",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "channelId",
        foreignField: "subscriber",
        as: "user",
      },
    },
    {
      $addFields: {
        username: "$channel.username",
        avatar: "$channel.avatar",
        subscribedChannel: { $size: "$user" },
      },
    },
    {
      $project: {
        username: 1,
        avatar: 1,
        subscribedChannel: 1,
        createdAt: 1,
      },
    },
  ];
  return await Subscription.aggregate(pipeline);
};
const getChannelSubscriber = async (channel: string) => {
  let pipeline = [
    {
      $match: { channel: new mongoose.Types.ObjectId(channel) },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
      },
    },
    {
      $unwind: "$subscriber", // Deconstruct the subscriber array
    },
    {
      $project: {
        subscriberId: "$subscriber._id", // Rename the field to remove '$'
        subscriber: "$subscriber",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "subscriberId",
        foreignField: "channel",
        as: "user",
      },
    },
    {
      $addFields: {
        username: "$subscriber.username",
        avatar: "$subscriber.avatar",
        subscriber: { $size: "$user" },
      },
    },
    {
      $project: {
        username: 1,
        avatar: 1,
        subscriber: 1,
        createdAt: 1,
      },
    },
  ];
  return await Subscription.aggregate(pipeline);
};

export default {
  createSubscription,
  deleteSubsciption,
  getSubscription,
  getSubscribedChannel,
  getChannelSubscriber,
};
