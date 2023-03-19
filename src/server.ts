require("dotenv").config();

import express, { Request, Response } from "express";
import cors from "cors";
import { performSearch } from "./search";
import { AssistantType } from "./openai/assistants";

const app = express();
app.use(cors());

const port = process.env.PORT || 3001;

app.get("/search", async (req: Request, res: Response) => {
  const searchQuery = req.query.query as string;
  const searchAssistantType =
    (req.query.assistant as AssistantType) || "assistant";
  const searchAnswer = await performSearch({
    query: searchQuery,
    assistantType: searchAssistantType,
  });
  res.json(searchAnswer);
});

app.listen(port, () => {
  console.log(`🖥️ Server listening on port ${port}`);
});
