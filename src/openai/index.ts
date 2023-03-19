import { Configuration, OpenAIApi } from "openai";
import GPT3Tokenizer from "gpt3-tokenizer";
import { oneLine, stripIndent } from "common-tags";
import wait from "waait";

const configuration = new Configuration({
  apiKey: process.env.OPEN_AI_API_KEY,
});

const openAiClient = new OpenAIApi(configuration);

export const calculateEmbedding = async (input: string) => {
  console.log("😇 Calculating embedding");
  let embeddingResponse;
  try {
    embeddingResponse = await openAiClient.createEmbedding({
      model: "text-embedding-ada-002",
      input: input.replace(/\n/g, " ").trim(),
    });
  } catch (e) {
    console.log("🕊️ Error with embedding. Trying again");
    await wait(1000);
    embeddingResponse = await openAiClient.createEmbedding({
      model: "text-embedding-ada-002",
      input: input.replace(/\n/g, " ").trim(),
    });
  }

  const [{ embedding }] = embeddingResponse.data.data;
  return embedding;
};

export const tokenize = (content: string[], limit = 1500) => {
  const tokenizer = new GPT3Tokenizer({ type: "gpt3" });
  let tokenCount = 0;
  let contextText = "";

  // Concat matched documents
  for (let i = 0; i < content.length; i++) {
    const encoded = tokenizer.encode(content[i]);
    tokenCount += encoded.text.length;

    // Limit context to max 1500 tokens (configurable)
    if (tokenCount > limit) {
      break;
    }

    contextText += `${content[i].trim()}`;
  }
  return contextText;
};

type AnswerOptions = {
  query: string;
  context: string;
  assistant: string;
};

export const answer = async ({ query, context, assistant }: AnswerOptions) => {
  console.log("🥬 Finding answer to query", query);
  const systemPrompt = stripIndent`${oneLine`
    ${assistant}`}

    Context sections:
    ${context}

  `.replace(/\n/g, " ");

  let completionResponse;
  try {
    completionResponse = await openAiClient.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query },
      ],
    });
  } catch (e) {
    console.error("🐑 Something went wrong", e);
    return "Sorry, something went wrong";
  }

  console.log("🍅 Answer obtained for query");

  const {
    id,
    choices: [
      {
        message: { content },
      },
    ],
  } = completionResponse.data;

  return content;
};
