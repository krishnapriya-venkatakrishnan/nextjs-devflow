"use client";

import { toast } from "@/hooks/use-toast";
import { toggleSaveQuestion } from "@/lib/actions/collection.action";
import { ActionResponse } from "@/types/global";
import Image from "next/image";
import { use, useState } from "react";

const SaveQuestion = ({
  questionId,
  hasSavedQuestionPromise,
  userId,
}: {
  questionId: string;
  hasSavedQuestionPromise: Promise<ActionResponse<{ saved: boolean }>>;
  userId?: string;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const { data } = use(hasSavedQuestionPromise);
  const { saved: hasSaved } = data || {};

  const handleSave = async () => {
    if (isLoading) return;

    if (!userId) {
      return toast({
        title: "You need to be logged in to save a question",
        variant: "destructive",
      });
    }

    setIsLoading(true);
    try {
      const { success, data, error } = await toggleSaveQuestion({ questionId });
      if (!success) {
        throw new Error(error?.message || "An error occurred");
      }

      toast({
        title: `Question ${data?.saved ? "saved" : "unsaved"} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Image
      src={hasSaved ? "/icons/star-filled.svg" : "/icons/star-red.svg"}
      alt="save"
      width={18}
      height={18}
      className={`cursor-pointer ${isLoading && "opacity-50"}`}
      aria-label="Save question"
      onClick={handleSave}
    />
  );
};

export default SaveQuestion;
