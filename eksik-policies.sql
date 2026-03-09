-- =============================================
-- LINKSY — EKSİK RLS POLİCY'LER
-- Bu SQL'i Supabase Dashboard > SQL Editor'a yapıştır
-- =============================================

-- server_members INSERT policy (sunucu oluşturma ve katılma için)
CREATE POLICY "members_insert" ON server_members FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- server_members DELETE policy (sunucudan ayrılma için)
CREATE POLICY "members_delete" ON server_members FOR DELETE
USING (auth.uid() = user_id);

-- categories INSERT policy (sunucu sahibi kategori ekleyebilsin)
CREATE POLICY "categories_insert" ON categories FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM servers WHERE id = categories.server_id AND owner_id = auth.uid()
  )
);

-- channels INSERT policy (sunucu sahibi kanal ekleyebilsin)
CREATE POLICY "channels_insert" ON channels FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM servers WHERE id = channels.server_id AND owner_id = auth.uid()
  )
);

-- servers SELECT: herkes kendi üye olduğu sunucuları + genel sunucuları görebilsin
-- Mevcut policy sadece üyelerin görmesine izin veriyor, bu doğru

-- profiles için realtime subscription izni
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- =============================================
-- SUPABASE DASHBOARD AYARLARI (elle yapılacak):
-- =============================================
-- 1. Authentication > Settings > Email Auth:
--    "Enable email confirmations" = KAPALI yap (beta için)
--    VEYA açık bırak ama Confirm Email template'ini düzenle
--
-- 2. Authentication > Settings > Site URL:
--    https://senin-domain.vercel.app
--
-- 3. Authentication > URL Configuration > Redirect URLs:
--    https://senin-domain.vercel.app/auth/callback
--    https://senin-domain.vercel.app/reset-password
--
-- 4. Authentication > Providers > Google:
--    Google OAuth'u aktif et, Client ID ve Secret gir
--
-- 5. Database > Replication:
--    messages, reactions, profiles tablolarının
--    realtime'da aktif olduğundan emin ol
