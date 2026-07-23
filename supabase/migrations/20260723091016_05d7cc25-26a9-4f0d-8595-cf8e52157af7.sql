
ALTER TABLE public.murojaah_entries ADD COLUMN IF NOT EXISTS murojaah_type TEXT NOT NULL DEFAULT 'lama' CHECK (murojaah_type IN ('lama','baru'));
ALTER TABLE public.tasmi_entries ADD COLUMN IF NOT EXISTS tasmi_type TEXT NOT NULL DEFAULT 'q1' CHECK (tasmi_type IN ('q1','q2','q3','q4'));
