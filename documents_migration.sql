-- Documents table for Knowledge Base file uploads
CREATE TABLE IF NOT EXISTS documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  storage_path text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select their own documents"
  ON documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
  ON documents FOR DELETE
  USING (auth.uid() = user_id);

-- Storage bucket: run this in Supabase Dashboard > Storage > New Bucket
-- Bucket name: knowledge-docs
-- Public: false (private)
-- After creating the bucket, add these Storage policies in Dashboard > Storage > Policies:

-- Policy 1 (INSERT): auth.uid()::text = (storage.foldername(name))[1]
-- Policy 2 (SELECT): auth.uid()::text = (storage.foldername(name))[1]
-- Policy 3 (DELETE): auth.uid()::text = (storage.foldername(name))[1]
