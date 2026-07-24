
-- 1. Fix mutable search_path on set_updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- 2. Lock down SECURITY DEFINER function execute privileges
-- Trigger-only functions: revoke from all app roles
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- RLS helpers: revoke from PUBLIC and anon; keep authenticated (needed by RLS policies)
REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_musyrif_of_student(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_parent_of_student(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_musyrif_of_student(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_parent_of_student(uuid, uuid) TO authenticated;

-- 3. Restrict profiles SELECT to owner + admin
DROP POLICY IF EXISTS profiles_select_all_auth ON public.profiles;
CREATE POLICY profiles_select_own_or_admin ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_admin(auth.uid()));

-- 4. Scope musyrif read policies to their own students
DROP POLICY IF EXISTS students_musyrif_read ON public.students;
CREATE POLICY students_musyrif_read ON public.students
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'musyrif'::public.app_role)
    AND EXISTS (
      SELECT 1 FROM public.halaqoh h
      WHERE h.id = students.halaqoh_id AND h.musyrif_id = auth.uid()
    )
  );

-- attendance: split ALL policy into scoped read + write
DROP POLICY IF EXISTS attendance_musyrif ON public.attendance;
CREATE POLICY attendance_musyrif_read ON public.attendance
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'musyrif'::public.app_role)
    AND public.is_musyrif_of_student(auth.uid(), student_id)
  );
CREATE POLICY attendance_musyrif_write ON public.attendance
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'musyrif'::public.app_role)
    AND public.is_musyrif_of_student(auth.uid(), student_id)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'musyrif'::public.app_role)
    AND public.is_musyrif_of_student(auth.uid(), student_id)
  );

-- exams read scoped
DROP POLICY IF EXISTS exams_musyrif_read ON public.exams;
CREATE POLICY exams_musyrif_read ON public.exams
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'musyrif'::public.app_role)
    AND (examiner_id = auth.uid() OR public.is_musyrif_of_student(auth.uid(), student_id))
  );

-- exam_mistakes read scoped via parent exam
DROP POLICY IF EXISTS exam_mistakes_read_musyrif ON public.exam_mistakes;
CREATE POLICY exam_mistakes_read_musyrif ON public.exam_mistakes
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'musyrif'::public.app_role)
    AND EXISTS (
      SELECT 1 FROM public.exams e
      WHERE e.id = exam_mistakes.exam_id
        AND (e.examiner_id = auth.uid() OR public.is_musyrif_of_student(auth.uid(), e.student_id))
    )
  );

-- setoran entries read scoped
DROP POLICY IF EXISTS murojaah_entries_musyrif_read ON public.murojaah_entries;
CREATE POLICY murojaah_entries_musyrif_read ON public.murojaah_entries
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'musyrif'::public.app_role)
    AND (teacher_id = auth.uid() OR public.is_musyrif_of_student(auth.uid(), student_id))
  );

DROP POLICY IF EXISTS tasmi_entries_musyrif_read ON public.tasmi_entries;
CREATE POLICY tasmi_entries_musyrif_read ON public.tasmi_entries
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'musyrif'::public.app_role)
    AND (teacher_id = auth.uid() OR public.is_musyrif_of_student(auth.uid(), student_id))
  );

DROP POLICY IF EXISTS ziyadah_entries_musyrif_read ON public.ziyadah_entries;
CREATE POLICY ziyadah_entries_musyrif_read ON public.ziyadah_entries
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'musyrif'::public.app_role)
    AND (teacher_id = auth.uid() OR public.is_musyrif_of_student(auth.uid(), student_id))
  );
