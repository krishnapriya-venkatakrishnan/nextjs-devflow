import Interaction, { IInteractionDoc } from "@/database/interaction.model";
import {
  CreateInteractionParams,
  UpdateReputationParams,
} from "@/types/action";
import { ActionResponse, ErrorResponse } from "@/types/global";
import handleError from "../handlers/error";
import { ClientSession } from "mongoose";
import { User } from "@/database";

export async function createInteraction(
  params: CreateInteractionParams & { session: ClientSession }
): Promise<ActionResponse<IInteractionDoc>> {
  const {
    action: actionType,
    actionId,
    actionTarget,
    authorId,
    session,
  } = params!;

  try {
    const [interaction] = await Interaction.create(
      [
        {
          user: authorId,
          action: actionType,
          actionId,
          actionType: actionTarget,
        },
      ],
      { session }
    );

    // Update reputation for both the performer and the content author.
    await updateReputation({
      interaction,
      session,
      performerId: authorId!,
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
