"use client";

import { incrementViews } from "@/lib/actions/question.action";
import Link from "next/link";

const ReadMore = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => {
  const handleViews = async (id: string) => {
    await incrementViews({ questionId: id });
  };

  return (
    <Link
      href={`/questions/${question}#answer-${answer}`}
      className="body-semibold relative z-10 font-space-grotesk text-primary-100"
      onClick={() => handleViews(question)}
    >
      <p className="mt-1">Read more...</p>
    </Link>
  );
};

export default ReadMore;
