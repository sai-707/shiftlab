// SERVER ONLY. Reads the Students page through the admin-only database functions, which check the role themselves.
import { createClient } from "@/lib/supabase/server";
import { PAGE_SIZE, type StudentDetail, type StudentsPage } from "@/lib/adminStudents";

export type Result<T> = { ok: true; data: T } | { ok: false; code: string };

export async function getStudents(page: number, q: string): Promise<Result<StudentsPage>> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_students", { lim: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE, q: q || null });
  if (error || !data) {
    console.error("[admin] students failed:", error?.code); // code only
    return { ok: false, code: error?.code ?? "empty" };
  }
  return { ok: true, data: data as StudentsPage };
}

/** Null data with ok: true means there is no such student. */
export async function getStudent(id: string): Promise<Result<StudentDetail | null>> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_student", { uid: id });
  if (error) {
    console.error("[admin] student failed:", error.code);
    return { ok: false, code: error.code };
  }
  return { ok: true, data: (data as StudentDetail | null) ?? null };
}
