"use server";

import {
  ActionResponse,
  ErrorResponse,
  GlobalSearchParams,
} from "@/types/global";
import action from "../handlers/action";
import handleError from "../handlers/error";
import { GlobalSearchSchema } from "../validation";
import { Answer, Question, Tag, User } from "@/database";
import { FilterQuery } from "mongoose";
import ROUTES from "@/constants/routes";

async function searchAllSchemas(query: string) {
  const qRecommendedQuery: FilterQuery<typeof Question> = {};
  qRecommendedQuery.$or = [{ title: { $regex: query, $options: "i" } }];
  const questions = await Question.find(qRecommendedQuery).limit(2);

  const aRecommendedQuery: FilterQuery<typeof Answer> = {};
  aRecommendedQuery.$or = [{ content: { $regex: query, $options: "i" } }];
  const answers = await Answer.find(aRecommendedQuery).limit(2);

  const uRecommendedQuery: FilterQuery<typeof User> = {};
  uRecommendedQuery.$or = [{ name: { $regex: query, $options: "i" } }];
  const users = await User.find(uRecommendedQuery).limit(2);

  const tRecommendedQuery: FilterQuery<typeof Tag> = {};
  tRecommendedQuery.$or = [{ name: { $regex: query, $options: "i" } }];
  const tags = await Tag.find(tRecommendedQuery).limit(2);

  const qSearchResults = questions.map((item) => {
    return {
      content: item.title,
      category: "Question",
      href: ROUTES.QUESTION(item._id.toString()),
    };
  });

  const aSearchResults = answers.map((item) => {
    return {
      content: item.content.slice(150)
        ? `${item.content.slice(0, 150)}...`
        : item.content,
      category: "Answer",
      href: ROUTES.QUESTION(item.question.toString()),
    };
  });

  const uSearchResults = users.map((item) => {
    return {
      content: item.name,
      category: "User",
      href: ROUTES.PROFILE(item._id.toString()),
    };
  });

  const tSearchResults = tags.map((item) => {
    return {
      content: item.name,
      category: "Tag",
      href: ROUTES.TAG(item._id.toString()),
    };
  });

  const searchResults = [
    ...qSearchResults,
    ...aSearchResults,
    ...uSearchResults,
    ...tSearchResults,
  ];
  return searchResults;
}

async function searchTheSchema(query: string, type: string) {
  const Model =
    type === "question"
      ? Question
      : type === "answer"
        ? Answer
        : type === "user"
          ? User
          : Tag;
  const recommendedQuery: FilterQuery<typeof Model> = {};

  const field =
    type === "question"
      ? "title"
      : type === "answer"
        ? "content"
        : type === "user"
          ? "name"
          : "name";
  recommendedQuery.$or = [{ [field]: { $regex: query, $options: "i" } }];

  const documents = await Model.find(recommendedQuery).limit(8);
  const searchResults = documents.map((item) => {
    const contentValue =
      type === "question"
        ? item.title
        : type === "answer"
          ? item.content.slice(150)
            ? `${item.content.slice(0, 150)}...`
            : item.content
          : type === "user"
            ? item.name
            : item.name;
    const categoryValue =
      type === "question"
        ? "Question"
        : type === "answer"
          ? "Answer"
          : type === "user"
            ? "User"
            : "Tag";
    const hrefValue =
      type === "question"
        ? ROUTES.QUESTION(item._id.toString())
        : type === "answer"
          ? ROUTES.QUESTION(item.question.toString())
          : type === "user"
            ? ROUTES.PROFILE(item._id.toString())
            : ROUTES.TAG(item._id.toString());
    return {
      content: contentValue,
      category: categoryValue,
      href: hrefValue,
    };
  });
  return searchResults;
}

export async function performGlobalSearch(params: GlobalSearchParams): Promise<
  ActionResponse<
    {
      content: string;
      category: string;
      href: string;
    }[]
  >
> {
  const validationResult = await action({
    params,
    schema: GlobalSearchSchema,
  });
  if (validationResult instanceof Error)
    return handleError(validationResult) as ErrorResponse;

  const { global, type } = validationResult.params!;
  try {
    if (type) {
      const result = await searchTheSchema(global!, type);
      return {
        success: true,
        data: JSON.parse(JSON.stringify(result)),
      };
    } else {
      const result = await searchAllSchemas(global!);
      return {
        success: true,
        data: JSON.parse(JSON.stringify(result)),
      };
    }
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
