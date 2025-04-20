"use server";

import {
  CreateVoteParams,
  HasVotedParams,
  HasVotedResponse,
  UpdateVoteCountParams,
} from "@/types/action";
import { ActionResponse, ErrorResponse } from "@/types/global";
import action from "../handlers/action";
import {
  CreateVoteSchema,
  HasVotedSchema,
  UpdateVoteCountSchema,
} from "../validation";
import handleError from "../handlers/error";
import { Answer, Question, Vote } from "@/database";
import mongoose, { ClientSession } from "mongoose";
import { revalidatePath } from "next/cache";
import ROUTES from "@/constants/routes";
import { createInteraction, updateVoteInteraction } from "./interaction.action";
import { auth } from "@/auth";

async function updateVoteCount(
  params: UpdateVoteCountParams,
  session?: ClientSession
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: UpdateVoteCountSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { targetId, targetType, voteType, change } = validationResult.params!;

  const Model = targetType === "question" ? Question : Answer;
  const voteField = voteType === "upvote" ? "upvotes" : "downvotes";

  try {
    const result = await Model.findByIdAndUpdate(
      targetId,
      { $inc: { [voteField]: change } },
      { new: true, session }
    );

    if (!result) {
      throw new Error("Failed to update vote count");
    }

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function createVote(
  params: CreateVoteParams
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: CreateVoteSchema,
    authorize: true,
  });
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { targetId, targetType, voteType } = validationResult.params!;
  const userId = validationResult.session?.user?.id;
  if (!userId) {
    return handleError(new Error("Unauthorized")) as ErrorResponse;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const Model = targetType === "question" ? Question : Answer;
    const contentDoc = await Model.findById(targetId).session(session);
    if (!contentDoc) throw new Error("Content not found");
    const contentAuthorId = contentDoc.author.toString();

    const loggedInSession = await auth();
    const loggedInUser = loggedInSession?.user?.id;

    const existingVote = await Vote.findOne({
      author: userId,
      actionId: targetId,
      actionType: targetType,
    }).session(session);

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // If the user is voting again with the same vote type, remove the vote
        await Vote.deleteOne({
          _id: existingVote._id,
        }).session(session);
        await updateVoteCount(
          { targetId, targetType, voteType, change: -1 },
          session
        );
        await updateVoteInteraction({
          action: `remove-${voteType}`,
          actionId: targetId,
          actionTarget: targetType,
          authorId: contentAuthorId!,
          voteAuthorId: loggedInUser!.toString(),
          session,
        });
      } else {
        // If the user is changing their vote, update voteType and adjust counts
        const vote = await Vote.findByIdAndUpdate(
          existingVote._id,
          { voteType },
          { new: true, session }
        );
        await updateVoteCount(
          { targetId, targetType, voteType: existingVote.voteType, change: -1 },
          session
        );
        await updateVoteInteraction({
          action: voteType === "upvote" ? "remove-downvote" : "remove-upvote",
          actionId: targetId,
          actionTarget: targetType,
          authorId: contentAuthorId!,
          voteAuthorId: loggedInUser!.toString(),
          session,
        });

        await updateVoteCount(
          { targetId, targetType, voteType, change: 1 },
          session
        );
        // log the interaction
        await createInteraction({
          action: voteType,
          actionId: targetId,
          actionTarget: targetType,
          authorId: contentAuthorId!,
          voteAuthorId: loggedInUser!.toString(),
          session,
        });
      }
    } else {
      // First-time vote creation
      const [vote] = await Vote.create(
        [
          {
            author: userId,
            actionId: targetId,
            actionType: targetType,
            voteType,
          },
        ],
        { session }
      );
      await updateVoteCount(
        { targetId, targetType, voteType, change: 1 },
        session
      );

      // log the interaction
      await createInteraction({
        action: voteType,
        actionId: targetId,
        actionTarget: targetType,
        authorId: contentAuthorId!,
        voteAuthorId: loggedInUser!.toString(),
        session,
      });
    }

    await session.commitTransaction();
    revalidatePath(ROUTES.QUESTION(targetId));

    return { success: true };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}

export async function hasVoted(
  params: HasVotedParams
): Promise<ActionResponse<HasVotedResponse>> {
  const validationResult = await action({
    params,
    schema: HasVotedSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { targetId, targetType } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  try {
    const vote = await Vote.findOne({
      author: userId,
      actionId: targetId,
      actionType: targetType,
    });

    if (!vote) {
      return {
        success: false,
        data: {
          hasUpvoted: false,
          hasDownvoted: false,
        },
      };
    }

    return {
      success: true,
      data: {
        hasUpvoted: vote.voteType === "upvote",
        hasDownvoted: vote.voteType === "downvote",
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
