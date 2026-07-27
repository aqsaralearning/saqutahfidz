
CREATE TABLE IF NOT EXISTS public.pelanggaran (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  recorded_by uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  kategori text NOT NULL,
  points integer NOT NULL DEFAULT 1,
  deskripsi text,
  tindak_lanjut text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pelanggaran TO authenticated;
GRANT ALL ON public.pelanggaran TO service_role;

ALTER TABLE public.pelanggaran ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pelanggaran_admin_all" ON public.pelanggaran FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "pelanggaran_musyrif_read" ON public.pelanggaran FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'musyrif') AND public.is_musyrif_of_student(auth.uid(), student_id));

CREATE POLICY "pelanggaran_musyrif_write" ON public.pelanggaran FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'musyrif') AND public.is_musyrif_of_student(auth.uid(), student_id))
  WITH CHECK (public.has_role(auth.uid(),'musyrif') AND recorded_by = auth.uid());

CREATE POLICY "pelanggaran_wali_read" ON public.pelanggaran FOR SELECT TO authenticated
  USING (public.is_parent_of_student(auth.uid(), student_id));
