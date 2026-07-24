import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "santri_progress",
  title: "Rekap progres santri",
  description:
    "Rekap ringkas hafalan untuk satu santri: ziyadah, muroja'ah, dan tasmi' terbaru. Dibatasi oleh RLS.",
  inputSchema: {
    student_id: z.string().uuid().describe("UUID santri (dari list_santri)."),
    days: z.number().int().min(1).max(365).optional().describe("Jendela hari terakhir (default 30)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ student_id, days }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const sb = supabaseForUser(ctx);
    const since = new Date(Date.now() - (days ?? 30) * 86400 * 1000).toISOString();
    const [z1, m1, t1] = await Promise.all([
      sb.from("ziyadah_entries").select("*").eq("student_id", student_id).gte("date", since).order("date", { ascending: false }),
      sb.from("murojaah_entries").select("*").eq("student_id", student_id).gte("date", since).order("date", { ascending: false }),
      sb.from("tasmi_entries").select("*").eq("student_id", student_id).gte("date", since).order("date", { ascending: false }),
    ]);
    const err = z1.error ?? m1.error ?? t1.error;
    if (err) return { content: [{ type: "text", text: err.message }], isError: true };
    const summary = {
      student_id,
      window_days: days ?? 30,
      ziyadah_count: z1.data?.length ?? 0,
      murojaah_count: m1.data?.length ?? 0,
      tasmi_count: t1.data?.length ?? 0,
      ziyadah: z1.data,
      murojaah: m1.data,
      tasmi: t1.data,
    };
    return { content: [{ type: "text", text: JSON.stringify(summary) }], structuredContent: summary };
  },
});
