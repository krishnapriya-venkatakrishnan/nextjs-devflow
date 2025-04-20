"use server";

import Interaction, { IInteractionDoc } from "@/database/interaction.model";
import {
  CreateInteractionParams,
  DeleteInteractionParams,
  DeleteReputationParams,
  UpdateReputationParams,
} from "@/types/action";
import { ActionResponse, ErrorResponse } from "@/types/global";
import handleError from "../handlers/error";
import { ClientSession } from "mongoose";
import { User } from "@/database";
import { auth } from "@/auth";

export async function createInteraction(
  params: CreateInteractionParams & { session: ClientSession }
): Promise<ActionResponse<IInteractionDoc>> {
  const {
    action: actionType,
    actionId,
    actionTarget,
    authorId,
    voteAuthorId,
    session,
  } = params!;

  const authSession = await auth();
  const loggedInUser = authSession?.user?.id;

  try {
    const [interaction] = await Interaction.create(
      [
        {
          user: authorId,
          action: actionType,
          actionId,
          actionType: actionTarget,
          voteAuthorId,
        },
      ],
      { session }
    );

    // Update reputation for both the performer and the content author.
    await updateReputation({
      interaction,
      session,
      performerId: loggedInUser!,
      authorId,
    });

    return {
      success: true,
      data: JSON.parse(JSON.stringify(interaction)),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

async function updateReputation(params: UpdateReputationParams) {
  const { interaction, session, performerId, authorId } = params;
  const { action, actionType } = interaction;

  let performerPoints = 0;
  let authorPoints = 0;

  switch (action) {
    case "upvote":
      performerPoints = 2;
      authorPoints = 10;
      break;
    case "downvote":
      performerPoints = -1;
      authorPoints = -2;
      break;
    case "post":
      authorPoints = actionType === "question" ? 5 : 10;
      break;
  }

  if (performerId === authorId) {
    await User.findByIdAndUpdate(
      performerId,
      { $inc: { reputation: authorPoints } },
      { session }
    );
    return;
  }

  await User.bulkWrite(
    [
      {
        updateOne: {
          filter: { _id: performerId },
          update: { $inc: { reputation: performerPoints } },
        },
      },
      {
        updateOne: {
          filter: { _id: authorId },
          update: { $inc: { reputation: authorPoints } },
        },
      },
    ],
    { session }
  );
}

export async function deleteInteraction(
  params: DeleteInteractionParams & { session: ClientSession }
): Promise<ActionResponse<IInteractionDoc>> {
  const {
    action: actionType,
    actionId,
    actionTarget,
    authorId,
    voteAuthorId,
    session,
  } = params!;

  const authSession = await auth();
  const loggedInUser = authSession?.user?.id;

  try {
    const interaction = {
      user: authorId,
      action: actionType,
      actionId,
      actionType: actionTarget,
      voteAuthorId,
    };

    // Update reputation for both the performer and the content author.
    await deleteReputation({
      interaction,
      session,
      performerId: voteAuthorId ? voteAuthorId : loggedInUser!,
      authorId: voteAuthorId ? loggedInUser! : authorId,
    });

    switch (actionType) {
      case "remove-upvote":
        await Interaction.findOneAndDelete(
          {
            user: authorId,
            action: "upvote",
            actionId,
            actionType: actionTarget,
            voteAuthorId,
          },
          { session }
        );
        break;
      case "remove-downvote":
        await Interaction.findOneAndDelete(
          {
            user: authorId,
            action: "downvote",
            actionId,
            actionType: actionTarget,
            voteAuthorId,
          },
          { session }
        );
        break;
      case "delete":
        await Interaction.findOneAndDelete(
          {
            user: authorId,
            action: "post",
            actionId,
            actionType: actionTarget,
            voteAuthorId,
          },
          { session }
        );
        break;
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(interaction)),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

async function deleteReputation(params: DeleteReputationParams) {
  const { interaction, session, performerId, authorId } = params;
  const { action, actionType } = interaction;

  let performerPoints = 0;
  let authorPoints = 0;

  switch (action) {
    case "remove-upvote":
      performerPoints = -2;
      authorPoints = -10;
      break;
    case "remove-downvote":
      performerPoints = 1;
      authorPoints = 2;
      break;
    case "delete":
      authorPoints = actionType === "question" ? -5 : -10;
      break;
  }

  if (performerId === authorId) {
    await User.findByIdAndUpdate(
      performerId,
      { $inc: { reputation: authorPoints } },
      { session }
    );
    return;
  }

  await User.bulkWrite(
    [
      {
        updateOne: {
          filter: { _id: performerId },
          update: { $inc: { reputation: performerPoints } },
        },
      },
      {
        updateOne: {
          filter: { _id: authorId },
          update: { $inc: { reputation: authorPoints } },
        },
      },
    ],
    { session }
  );
}

export async function updateVoteInteraction(
  params: DeleteInteractionParams & { session: ClientSession }
): Promise<ActionResponse<IInteractionDoc>> {
  const {
    action: actionType,
    actionId,
    actionTarget,
    authorId,
    voteAuthorId,
    session,
  } = params!;

  const authSession = await auth();
  const loggedInUser = authSession?.user?.id;

  try {
    const interaction = {
      user: authorId,
      action: actionType,
      actionId,
      actionType: actionTarget,
      voteAuthorId,
    };

    // Update reputation for both the performer and the content author.
    await deleteReputation({
      interaction,
      session,
      performerId: voteAuthorId!,
      authorId,
    });

    switch (actionType) {
      case "remove-upvote":
        await Interaction.findOneAndDelete(
          {
            user: authorId,
            action: "upvote",
            actionId,
            actionType: actionTarget,
            voteAuthorId,
          },
          { session }
        );
        break;
      case "remove-downvote":
        await Interaction.findOneAndDelete(
          {
            user: authorId,
            action: "downvote",
            actionId,
            actionType: actionTarget,
            voteAuthorId,
          },
          { session }
        );
        break;
      case "delete":
        await Interaction.findOneAndDelete(
          {
            user: authorId,
            action: "post",
            actionId,
            actionType: actionTarget,
            voteAuthorId,
          },
          { session }
        );
        break;
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(interaction)),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
