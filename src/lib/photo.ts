import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export const PHOTO_BUCKET = "student-photos";

/** Ambil signed URL untuk satu path foto (bucket privat). */
export function useSignedPhoto(path?: string | null, expires = 3600) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    if (!path) { setUrl(null); return; }
    supabase.storage.from(PHOTO_BUCKET).createSignedUrl(path, expires).then(({ data }) => {
      if (alive) setUrl(data?.signedUrl ?? null);
    });
    return () => { alive = false; };
  }, [path, expires]);
  return url;
}

/** Batch signed URL untuk banyak path (misal daftar santri). */
export function useSignedPhotos(paths: (string | null | undefined)[], expires = 3600) {
  const [map, setMap] = useState<Record<string, string>>({});
  const key = paths.filter(Boolean).join("|");
  useEffect(() => {
    let alive = true;
    const clean = paths.filter((p): p is string => !!p);
    if (clean.length === 0) { setMap({}); return; }
    supabase.storage.from(PHOTO_BUCKET).createSignedUrls(clean, expires).then(({ data }) => {
      if (!alive || !data) return;
      const next: Record<string, string> = {};
      data.forEach((d, i) => { if (d.signedUrl) next[clean[i]] = d.signedUrl; });
      setMap(next);
    });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, expires]);
  return map;
}

/** Upload file foto santri ke bucket. Return path yang disimpan ke DB. */
export async function uploadStudentPhoto(file: File, studentId: string): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${studentId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, file, {
    upsert: true, cacheControl: "3600", contentType: file.type,
  });
  if (error) throw error;
  return path;
}
