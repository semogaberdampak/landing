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
  url: "gmkiawhmeaqosbyejylo.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdta2lhd2htZWFxb3NieWVqeWxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQzNjk4MjUsImV4cCI6MjEwOTk0NTgyNX0.8zppNdJaWokcSEymc4wSOH9zJ-kb44vjh9aW28NFQpw"
};
