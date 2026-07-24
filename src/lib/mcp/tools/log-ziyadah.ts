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
  name: "log_ziyadah",
  title: "Catat setoran ziyadah",
  description: "Tambah satu entri ziyadah untuk santri. Musyrif hanya bisa mencatat untuk santrinya sendiri (RLS).",
  inputSchema: {
    student_id: z.string().uuid(),
    date: z.string().describe("YYYY-MM-DD"),
    surah_start: z.number().int().min(1).max(114),
    ayah_start: z.number().int().min(1),
    surah_end: z.number().int().min(1).max(114),
    ayah_end: z.number().int().min(1),
    predicate: z.string().optional().describe("mumtaz | jayyid_jiddan | jayyid | maqbul"),
    notes: z.string().optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const sb = supabaseForUser(ctx);
    const { data, error } = await sb
      .from("ziyadah_entries")
      .insert({ ...input, teacher_id: ctx.getUserId() })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Ziyadah tercatat: ${data.id}` }],
      structuredContent: { entry: data },
    };
  },
});
