-- Create datasets table to store uploaded dataset metadata
CREATE TABLE public.datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  usage_tool TEXT,
  null_handling_preference TEXT,
  columns_info JSONB,
  analysis_results JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create chat_messages table to store conversation history
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID REFERENCES public.datasets(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Public access policies for demo (no auth required)
CREATE POLICY "Anyone can create datasets"
  ON public.datasets FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view datasets"
  ON public.datasets FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update datasets"
  ON public.datasets FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can create messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view messages"
  ON public.chat_messages FOR SELECT
  USING (true);

-- Create storage bucket for datasets
INSERT INTO storage.buckets (id, name, public)
VALUES ('datasets', 'datasets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can upload datasets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'datasets');

CREATE POLICY "Anyone can view datasets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'datasets');

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_datasets_updated_at
  BEFORE UPDATE ON public.datasets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();