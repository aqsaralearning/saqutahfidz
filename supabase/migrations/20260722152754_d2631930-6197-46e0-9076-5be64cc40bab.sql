
-- ===== Enums =====
CREATE TYPE public.app_role AS ENUM ('admin', 'musyrif', 'wali');
CREATE TYPE public.gender AS ENUM ('L', 'P');
CREATE TYPE public.setoran_status AS ENUM ('lancar', 'kurang_lancar', 'mengulang');
CREATE TYPE public.attendance_status AS ENUM ('hadir', 'izin', 'sakit', 'alpa');
CREATE TYPE public.exam_predicate AS ENUM ('mumtaz', 'jayyid_jiddan', 'jayyid', 'maqbul', 'belum_lulus');

-- ===== Profiles =====
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_all_auth" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)), NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== User roles =====
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin')
$$;

-- Admins can view all roles
CREATE POLICY "user_roles_admin_all" ON public.user_roles FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ===== Halaqoh (study circles) =====
CREATE TABLE public.halaqoh (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  level TEXT,
  musyrif_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.halaqoh TO authenticated;
GRANT ALL ON public.halaqoh TO service_role;
ALTER TABLE public.halaqoh ENABLE ROW LEVEL SECURITY;
CREATE POLICY "halaqoh_select_auth" ON public.halaqoh FOR SELECT TO authenticated USING (true);
CREATE POLICY "halaqoh_admin_write" ON public.halaqoh FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ===== Students (santri) =====
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nis TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  gender public.gender NOT NULL DEFAULT 'L',
  birth_date DATE,
  class_level TEXT NOT NULL,
  halaqoh_id UUID REFERENCES public.halaqoh(id) ON DELETE SET NULL,
  parent_name TEXT,
  parent_phone TEXT,
  photo_url TEXT,
  target_juz INT DEFAULT 1,
  notes TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- ===== Parent-Student linkage =====
CREATE TABLE public.parent_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  UNIQUE (parent_id, student_id)
);
GRANT SELECT, INSERT, DELETE ON public.parent_students TO authenticated;
GRANT ALL ON public.parent_students TO service_role;
ALTER TABLE public.parent_students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parent_students_own_select" ON public.parent_students FOR SELECT TO authenticated
  USING (parent_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "parent_students_admin_write" ON public.parent_students FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Helper: is user a musyrif of the halaqoh that the student belongs to
CREATE OR REPLACE FUNCTION public.is_musyrif_of_student(_user_id UUID, _student_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.students s
    JOIN public.halaqoh h ON h.id = s.halaqoh_id
    WHERE s.id = _student_id AND h.musyrif_id = _user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.is_parent_of_student(_user_id UUID, _student_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.parent_students WHERE parent_id = _user_id AND student_id = _student_id)
$$;

-- Students RLS
CREATE POLICY "students_admin_all" ON public.students FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "students_musyrif_read" ON public.students FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'musyrif'));
CREATE POLICY "students_musyrif_update_own_halaqoh" ON public.students FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.halaqoh h WHERE h.id = students.halaqoh_id AND h.musyrif_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.halaqoh h WHERE h.id = students.halaqoh_id AND h.musyrif_id = auth.uid()));
CREATE POLICY "students_wali_read_own" ON public.students FOR SELECT TO authenticated
  USING (public.is_parent_of_student(auth.uid(), id));

-- ===== Setoran (ziyadah / murojaah / tasmi') =====
CREATE TABLE public.ziyadah_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  surah TEXT NOT NULL,
  ayat_from INT NOT NULL,
  ayat_to INT NOT NULL,
  juz INT,
  page_from INT,
  page_to INT,
  score INT CHECK (score BETWEEN 0 AND 100),
  status public.setoran_status NOT NULL DEFAULT 'lancar',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ziyadah_entries TO authenticated;
GRANT ALL ON public.ziyadah_entries TO service_role;
ALTER TABLE public.ziyadah_entries ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.murojaah_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  surah_from TEXT NOT NULL,
  surah_to TEXT,
  juz INT,
  score INT CHECK (score BETWEEN 0 AND 100),
  status public.setoran_status NOT NULL DEFAULT 'lancar',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.murojaah_entries TO authenticated;
GRANT ALL ON public.murojaah_entries TO service_role;
ALTER TABLE public.murojaah_entries ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.tasmi_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  juz INT,
  surah_from TEXT NOT NULL,
  surah_to TEXT,
  duration_min INT,
  score INT CHECK (score BETWEEN 0 AND 100),
  status public.setoran_status NOT NULL DEFAULT 'lancar',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasmi_entries TO authenticated;
GRANT ALL ON public.tasmi_entries TO service_role;
ALTER TABLE public.tasmi_entries ENABLE ROW LEVEL SECURITY;

-- Shared setoran policies
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY['ziyadah_entries','murojaah_entries','tasmi_entries']) LOOP
    EXECUTE format('CREATE POLICY "%1$s_admin_all" ON public.%1$s FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()))', t);
    EXECUTE format('CREATE POLICY "%1$s_musyrif_write" ON public.%1$s FOR ALL TO authenticated USING (public.has_role(auth.uid(),''musyrif'') AND (teacher_id = auth.uid() OR public.is_musyrif_of_student(auth.uid(), student_id))) WITH CHECK (public.has_role(auth.uid(),''musyrif'') AND teacher_id = auth.uid())', t);
    EXECUTE format('CREATE POLICY "%1$s_musyrif_read" ON public.%1$s FOR SELECT TO authenticated USING (public.has_role(auth.uid(),''musyrif''))', t);
    EXECUTE format('CREATE POLICY "%1$s_wali_read" ON public.%1$s FOR SELECT TO authenticated USING (public.is_parent_of_student(auth.uid(), student_id))', t);
  END LOOP;
END$$;

-- ===== Exams (ujian tahfidz) =====
CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  examiner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  juz INT NOT NULL,
  surah_from TEXT,
  surah_to TEXT,
  page_from INT,
  page_to INT,
  score_makhroj INT CHECK (score_makhroj BETWEEN 0 AND 100),
  score_mad INT CHECK (score_mad BETWEEN 0 AND 100),
  score_ghunnah INT CHECK (score_ghunnah BETWEEN 0 AND 100),
  score_qolqolah INT CHECK (score_qolqolah BETWEEN 0 AND 100),
  score_kelancaran INT CHECK (score_kelancaran BETWEEN 0 AND 100),
  score_adab INT CHECK (score_adab BETWEEN 0 AND 100),
  final_score NUMERIC(5,2),
  predicate public.exam_predicate,
  passed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exams TO authenticated;
GRANT ALL ON public.exams TO service_role;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exams_admin_all" ON public.exams FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "exams_musyrif_write" ON public.exams FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'musyrif') AND (examiner_id = auth.uid() OR public.is_musyrif_of_student(auth.uid(), student_id)))
  WITH CHECK (public.has_role(auth.uid(),'musyrif') AND examiner_id = auth.uid());
CREATE POLICY "exams_musyrif_read" ON public.exams FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'musyrif'));
CREATE POLICY "exams_wali_read" ON public.exams FOR SELECT TO authenticated USING (public.is_parent_of_student(auth.uid(), student_id));

-- Exam mistakes (per-ayat markings)
CREATE TABLE public.exam_mistakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  surah TEXT NOT NULL,
  ayat INT NOT NULL,
  page INT,
  category TEXT NOT NULL, -- makhroj / mad / ghunnah / qolqolah / kelancaran / lainnya
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exam_mistakes TO authenticated;
GRANT ALL ON public.exam_mistakes TO service_role;
ALTER TABLE public.exam_mistakes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exam_mistakes_admin_all" ON public.exam_mistakes FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "exam_mistakes_musyrif" ON public.exam_mistakes FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = exam_id AND (e.examiner_id = auth.uid() OR public.is_musyrif_of_student(auth.uid(), e.student_id))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = exam_id AND e.examiner_id = auth.uid()));
CREATE POLICY "exam_mistakes_read_musyrif" ON public.exam_mistakes FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'musyrif'));
CREATE POLICY "exam_mistakes_wali_read" ON public.exam_mistakes FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = exam_id AND public.is_parent_of_student(auth.uid(), e.student_id)));

-- ===== Attendance =====
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status public.attendance_status NOT NULL DEFAULT 'hadir',
  recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  UNIQUE (student_id, date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance TO authenticated;
GRANT ALL ON public.attendance TO service_role;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attendance_admin_all" ON public.attendance FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "attendance_musyrif" ON public.attendance FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'musyrif')) WITH CHECK (public.has_role(auth.uid(),'musyrif'));
CREATE POLICY "attendance_wali_read" ON public.attendance FOR SELECT TO authenticated USING (public.is_parent_of_student(auth.uid(), student_id));

-- ===== Schedule =====
CREATE TABLE public.halaqoh_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  halaqoh_id UUID NOT NULL REFERENCES public.halaqoh(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room TEXT
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.halaqoh_schedule TO authenticated;
GRANT ALL ON public.halaqoh_schedule TO service_role;
ALTER TABLE public.halaqoh_schedule ENABLE ROW LEVEL SECURITY;
CREATE POLICY "schedule_read_auth" ON public.halaqoh_schedule FOR SELECT TO authenticated USING (true);
CREATE POLICY "schedule_admin_write" ON public.halaqoh_schedule FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ===== updated_at trigger =====
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_students_updated BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_exams_updated BEFORE UPDATE ON public.exams FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
