#  Martwyn API

This repo serves two purposes:
 - screen scrapes the Sharesies website and Intercom help articles in order to generate and store embeddings for searching through
 - provides an Express server that allows searching through this content and a followup summarisation (with a specified "personality") via OpenAI's GPT3.5

There is a UI counterpart at https://github.com/martwyn/ui-v2

# Requirements

This project uses Supabase as the Postgres database with the pgvector extension. I did originally set this up with Postgres inside a Docker container but couldn't be assed trying to figure out how to install pgvector inside the container when it's so trivial with Supabase. Also, Supabase is legit and I love using it so there's that. This means you'll need to create a Supabase project for this.

This also uses the OpenAI API to both calculate the embeddings for the content as well as passing this to GPT3.5 for summarisation of the search results obtained via Postgres. So you'll need an OpenAI API Key too.

After pulling this down you'll want to `yarn install` or `npm install` to get the necessary modules.

## Environment variables

You'll need to setup the following three variables inside a `.env` file:

```
SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_ANON_KEY="a.b.c-d-e"
OPEN_AI_API_KEY="sk-xyz"
```

# Commands

## Gather

The main function of this code repository is to:
 - crawl the various Sharesies online content sources
 - chunk up the content into digestible chunks
 - get embeddings for these chunks via the OpenAI API
 - store these embeddings in the PostgresDB

To run this you can use `yarn gather` (or `npm run gather` if you wish).

This will take a while because there's a sleep in between each OpenAI API call given the rate limits on the pay as you go tier.

With each piece of content that the embeddings are created for, we also store the `source` url that the content came from. This is useful for when you run a search query and you want to know where the summarised information came from.

## Start server

Running `yarn start` will expose an Express server on port 3001.

There is a single endpoint which is accessible via `/search`. It takes two query parameters:

 - `query` (required) - The question you are wanting to answer
 - `assistant` (optional) - The "personality" of the assistant you want to use. Check out the `openai/assistants.ts` file for the variables that define what you can use here. Defaults simply to the string `assistant` if nothing is given here.

Once you have this all running you can query it like:

```
$ curl http://localhost:3001/search?query=hi

> {"answer":"Hello! How can I assist you today?","sources":[]}
```

Or in JS/TS:
```
const { answer, sources } = await fetch('http://localhost:3001/search?query=hi').then(r => r.json())
console.log(answer, sources)

> "Hello! How can I assist you today?", []
```

