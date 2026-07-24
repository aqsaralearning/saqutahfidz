import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listSantri from "./tools/list-santri";
import santriProgress from "./tools/santri-progress";
import logZiyadah from "./tools/log-ziyadah";

// Direct Supabase host as OAuth issuer (RFC 8414); the .lovable.cloud proxy is rejected.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "saqu-tahfidz-mcp",
  title: "SAQU Mutaba'ah Tahfidz",
  version: "0.1.0",
  instructions:
    "Alat untuk aplikasi Mutaba'ah Tahfidz SAQU. Gunakan list_santri untuk menemukan santri, santri_progress untuk melihat rekap hafalan, dan log_ziyadah untuk mencatat setoran ziyadah baru. Semua akses dibatasi oleh peran pengguna (admin, musyrif, wali).",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listSantri, santriProgress, logZiyadah],
});
