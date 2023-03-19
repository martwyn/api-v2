create extension vector;

create table content (
  id bigserial primary key,
  content text,
  source text,
  embedding vector (1536)
);

create or replace function match_content (
  query_embedding vector(1536),
  similarity_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    content.id,
    content.source,
    content.content,
    1 - (content.embedding <=> query_embedding) as similarity
  from content
  where 1 - (content.embedding <=> query_embedding) > similarity_threshold
  order by content.embedding <=> query_embedding
  limit match_count;
end;
$$;

create or replace function existing_content (
  existing_content text
)
returns table (
  id bigint
)
language plpgsql
as $$
begin
  return query
  select
    content.id
  from content
  where content like concat(existing_content, '%');
end;
$$;

CREATE INDEX ON content USING ivfflat (embedding vector_cosine_ops);