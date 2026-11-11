/* Portal KiTA — konfigurasi Supabase.
 *
 * Isi dua nilai di bawah dari dashboard Supabase:
 *   Project Settings → API → Project URL
 *   Project Settings → API → Project API keys → anon public
 *
 * Selama masih kosong, situs dan panel admin berjalan dalam mode lokal
 * (localStorage), persis seperti sebelumnya.
 *
 * Anon key aman dipublikasikan selama Row Level Security di schema.sql aktif.
 * Jangan pernah menaruh service_role key di file ini.
 */
window.PORTAL_SUPABASE = {
  url: "",
  anonKey: ""
};
