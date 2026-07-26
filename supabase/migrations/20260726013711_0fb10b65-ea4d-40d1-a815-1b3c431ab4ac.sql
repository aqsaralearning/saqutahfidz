
-- Tahsin entries table
CREATE TABLE public.tahsin_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  surah text NOT NULL,
  ayat_from integer,
  ayat_to integer,
  juz integer,
  score_makhroj integer,
  score_mad integer,
  score_gunnah integer,
  score_qolqolah integer,
  score_kelancaran integer,
  score_vokal integer,
  final_score numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tahsin_entries TO authenticated;
GRANT ALL ON public.tahsin_entries TO service_role;

ALTER TABLE public.tahsin_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tahsin_admin_all" ON public.tahsin_entries
  FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "tahsin_musyrif_read" ON public.tahsin_entries
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'musyrif'::app_role)
         AND (teacher_id = auth.uid() OR public.is_musyrif_of_student(auth.uid(), student_id)));

CREATE POLICY "tahsin_musyrif_write" ON public.tahsin_entries
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'musyrif'::app_role)
         AND (teacher_id = auth.uid() OR public.is_musyrif_of_student(auth.uid(), student_id)))
  WITH CHECK (public.has_role(auth.uid(), 'musyrif'::app_role) AND teacher_id = auth.uid());

CREATE POLICY "tahsin_wali_read" ON public.tahsin_entries
  FOR SELECT TO authenticated
  USING (public.is_parent_of_student(auth.uid(), student_id));

CREATE TRIGGER tahsin_updated_at BEFORE UPDATE ON public.tahsin_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Storage policies for student-photos: admins & musyrif upload, all auth can read
CREATE POLICY "student_photos_read_auth" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'student-photos');

CREATE POLICY "student_photos_write_staff" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'student-photos'
    AND (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'musyrif'::app_role))
  );

CREATE POLICY "student_photos_update_staff" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'student-photos'
    AND (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'musyrif'::app_role))
  );

CREATE POLICY "student_photos_delete_staff" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'student-photos'
    AND (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'musyrif'::app_role))
  );
