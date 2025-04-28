"use server";

import {
  ActionResponse,
  ErrorResponse,
  GlobalSearchParams,
} from "@/types/global";
import action from "../handlers/action";
import handleError from "../handlers/error";
import { GlobalSearchSchema } from "../validation";

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
    return {
      success: true,
      data: [
        {
          content: global || "",
          category: type || "",
          href: "",
        },
      ],
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
