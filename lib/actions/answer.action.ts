"use server";

import Answer, { IAnswerDoc } from "@/database/answer.model";
import {
  CreateAnswerParams,
  DeleteAnswerParams,
  GetAnswersParams,
} from "@/types/action";
import {
  ActionResponse,
  Answer as AnswerGType,
  ErrorResponse,
} from "@/types/global";
import action from "../handlers/action";
import {
  AnswerServerSchema,
  DeleteAnswerSchema,
  GetAnswersSchema,
} from "../validation";
import handleError from "../handlers/error";
import mongoose from "mongoose";
import { Interaction, Question, Vote } from "@/database";
import { revalidatePath } from "next/cache";
import ROUTES from "@/constants/routes";
import { createInteraction, deleteInteraction } from "./interaction.action";

export async function createAnswer(
  params: CreateAnswerParams
): Promise<ActionResponse<IAnswerDoc>> {
  const validationResult = await action({
    params,
    schema: AnswerServerSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { content, questionId } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const question = await Question.findById(questionId);
    if (!question) {
      throw new Error("Question not found");
    }

    const [newAnswer] = await Answer.create(
      [
        {
          author: userId,
          question: questionId,
          content,
        },
      ],
      { session }
    );

    if (!newAnswer) {
      throw new Error("Failed to create answer");
    }

    question.answers += 1;
    await question.save({ session });

    // log the interaction

    await createInteraction({
      action: "post",
      actionId: newAnswer._id.toString(),
      actionTarget: "answer",
      authorId: userId as string,
      session,
    });

    await session.commitTransaction();

    revalidatePath(ROUTES.QUESTION(questionId));

    return {
      success: true,
      data: JSON.parse(JSON.stringify(newAnswer)),
    };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}

export async function getAnswers(params: GetAnswersParams): Promise<
  ActionResponse<{
    answers: AnswerGType[];
    isNext: boolean;
    totalAnswers: number;
  }>
> {
  const validationResult = await action({
    params,
    schema: GetAnswersSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId, page = 1, pageSize = 10, filter } = params;
  const skip = (Number(page) - 1) * pageSize;
  const limit = pageSize;

  let sortCriteria = {};

  switch (filter) {
    case "latest":
      sortCriteria = { createdAt: -1 };
      break;
    case "oldest":
      sortCriteria = { createdAt: 1 };
      break;
    case "popular":
      sortCriteria = { upvotes: -1 };
      break;
    default:
      sortCriteria = { createdAt: -1 };
      break;
  }

  try {
    const totalAnswers = await Answer.countDocuments({ question: questionId });

    const answers = await Answer.find({ question: questionId })
      .populate("author", "_id name image")
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit);

    const isNext = totalAnswers > skip + answers.length;

    return {
      success: true,
      data: {
        answers: JSON.parse(JSON.stringify(answers)),
        isNext,
        totalAnswers,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function deleteAnswer(
  params: DeleteAnswerParams
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: DeleteAnswerSchema,
    authorize: true,
  });
  if (validationResult instanceof Error)
    return handleError(validationResult) as ErrorResponse;

  const { answerId } = validationResult.params!;
  const { user } = validationResult.session!;

  const session = await mongoose.startSession();

  session.startTransaction();

  try {
    const answer = await Answer.findById(answerId).session(session);
    if (!answer) throw new Error("Answer not found");

    if (answer.author.toString() !== user?.id)
      throw new Error("You are not authorized to delete this answer");

    // Decrement the number of answers from the associated Question document.
    await Question.findByIdAndUpdate(
      answer.question,
      { $inc: { answers: -1 } },
      { new: true }
    ).session(session);

    // if there are any votes for the answer, delete the related Vote documents.
    if (answer.upvotes || answer.downvotes) {
      await Vote.deleteMany({
        actionId: answerId,
        actionType: "answer",
      }).session(session);

      if (answer.upvotes) {
        const interactions = await Interaction.find({
          action: "upvote",
          actionId: answerId,
          actionType: "answer",
        }).session(session);
        await Promise.all(
          interactions.map((interaction) => {
            deleteInteraction({
              action: "remove-upvote",
              actionId: answerId,
              actionTarget: "answer",
              authorId: interaction.user.toString(),
              voteAuthorId: interaction.voteAuthorId.toString(),
              session,
            });
          })
        );
      }

      if (answer.downvotes) {
        const interactions = await Interaction.find({
          action: "downvote",
          actionId: answerId,
          actionType: "answer",
        }).session(session);
        await Promise.all(
          interactions.map((interaction) => {
            deleteInteraction({
              action: "remove-downvote",
              actionId: answerId,
              actionTarget: "answer",
              authorId: interaction.user.toString(),
              voteAuthorId: interaction.voteAuthorId.toString(),
              session,
            });
          })
        );
      }
    }

    await Answer.findByIdAndDelete(answerId).session(session);

    // log the interaction
    await deleteInteraction({
      action: "delete",
      actionId: answerId,
      actionTarget: "answer",
      authorId: answer.author.toString(),
      session,
    });

    await session.commitTransaction();

    revalidatePath(`/profile/${user?.id}`);
    return { success: true };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}
