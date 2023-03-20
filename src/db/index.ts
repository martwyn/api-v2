import { createClient } from "@supabase/supabase-js";
import { Database } from "./types";

const supabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export const getClient = () => supabaseClient;

export const insertContent = async (
  content: string,
  source: string,
  embedding: number[]
) => {
  console.log("🪢 Inserting content from", source);
  const response = await supabaseClient
    .from("content")
    .insert({ content, source, embedding });
  if (response.error) {
    console.error("🥤 Error inserting content", response.error);
    return;
  }
  if (response.data) {
    console.log("🪢 Inserted", (response.data as any).id);
  }
};

export const contentExists = async (content: string) => {
  // Half assed "does it exist" check based on the first 100
  // characters of the content
  console.log("🧦 Checking if exists");
  const { data, error } = await supabaseClient.rpc("existing_content", {
    existing_content: content.substring(0, 100),
  });

  if (error) {
    console.error("🪵 Error checking existence", error.code, error.message);
    throw new Error(error.message);
  }

  return !!data.length;
};

export const matchEmbedding = async (embedding: number[]) => {
  console.log("👑 Matching related embeddings");
  const { data, error } = await supabaseClient.rpc("match_content", {
    query_embedding: embedding,
    // I've got no real clue as to what the correct threshold is here.
    // What is here currently is just a stab in the dark
    similarity_threshold: 0.8,
    match_count: 5,
  });

  if (error) {
    console.error("🐳 Error matching embedding", error.code, error.message);
    throw new Error(error.message);
  }

  return data as Database["public"]["Functions"]["match_content"]["Returns"];
};
