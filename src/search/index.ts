require("dotenv").config();

import { matchEmbedding } from "../db";
import { answer, calculateEmbedding, tokenize } from "../openai";
import { AssistantType, getAssistantByType } from "../openai/assistants";

require("dotenv").config();

type PerformSearchOptions = {
  query: string;
  assistantType: AssistantType;
};

export const performSearch = async ({
  query,
  assistantType,
}: PerformSearchOptions) => {
  const queryEmbedding = await calculateEmbedding(query);
  const content = await matchEmbedding(queryEmbedding);
  const context = tokenize(content.map((c: any) => c.content as string));
  const assistant = getAssistantByType(assistantType);
  const returnAnswer = await answer({
    query,
    context,
    assistant,
  });
  const uniqueSources = [...new Set(content.map((c) => c.source))];
  return {
    answer: returnAnswer,
    sources: uniqueSources.map((url) => ({ url })),
  };
};
