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
  name: "list_santri",
  title: "Daftar santri",
  description:
    "Daftar santri yang dapat diakses oleh pengguna yang sedang login (dibatasi oleh RLS: admin melihat semua, musyrif melihat santri di halaqoh-nya, wali melihat anaknya).",
  inputSchema: {
    search: z.string().trim().optional().describe("Cari berdasarkan nama santri."),
    limit: z.number().int().min(1).max(200).optional().describe("Jumlah baris maksimum (default 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ search, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const sb = supabaseForUser(ctx);
    let q = sb.from("students").select("id, full_name, nis, gender, halaqoh_id, current_juz").limit(limit ?? 50);
    if (search) q = q.ilike("full_name", `%${search}%`);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { santri: data ?? [] },
    };
  },
});
