-- =============================================
-- NEXUS CHAT — Supabase SQL Şeması
-- Supabase Dashboard > SQL Editor'a yapıştır
-- =============================================

-- Profiller tablosu
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  tag TEXT NOT NULL DEFAULT '#0001',
  avatar_color TEXT NOT NULL DEFAULT 'linear-gradient(135deg,#2b5bde,#7b5ea7)',
  status TEXT NOT NULL DEFAULT 'online' CHECK (status IN ('online','idle','dnd','offline')),
  activity TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sunucular tablosu
CREATE TABLE IF NOT EXISTS servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  initials TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'linear-gradient(135deg,#2b5bde,#7b5ea7)',
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sunucu üyeleri
CREATE TABLE IF NOT EXISTS server_members (
  server_id UUID REFERENCES servers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'Member' CHECK (role IN ('Founder','Moderator','Member','Bot')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (server_id, user_id)
);

-- Kategoriler
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID REFERENCES servers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0
);

-- Kanallar tablosu
CREATE TABLE IF NOT EXISTS channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID REFERENCES servers(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text','voice','announcement','forum','calendar','media','docs','locked')),
  description TEXT,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mesajlar tablosu
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  reply_to UUID REFERENCES messages(id) ON DELETE SET NULL,
  edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reaksiyonlar
CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (message_id, user_id, emoji)
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- Profiller: herkes okuyabilir, sadece sahibi yazabilir
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Sunucular: üyeler okuyabilir
CREATE POLICY "servers_select" ON servers FOR SELECT USING (
  EXISTS (SELECT 1 FROM server_members WHERE server_id = servers.id AND user_id = auth.uid())
);
CREATE POLICY "servers_insert" ON servers FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Üyelik: üyeler okuyabilir
CREATE POLICY "members_select" ON server_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM server_members sm WHERE sm.server_id = server_members.server_id AND sm.user_id = auth.uid())
);

-- Kategoriler: sunucu üyeleri okuyabilir
CREATE POLICY "categories_select" ON categories FOR SELECT USING (
  EXISTS (SELECT 1 FROM server_members WHERE server_id = categories.server_id AND user_id = auth.uid())
);

-- Kanallar: sunucu üyeleri okuyabilir
CREATE POLICY "channels_select" ON channels FOR SELECT USING (
  EXISTS (SELECT 1 FROM server_members WHERE server_id = channels.server_id AND user_id = auth.uid())
);

-- Mesajlar: kanal üyeleri okuyabilir ve yazabilir
CREATE POLICY "messages_select" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM channels c
    JOIN server_members sm ON sm.server_id = c.server_id
    WHERE c.id = messages.channel_id AND sm.user_id = auth.uid()
  )
);
CREATE POLICY "messages_insert" ON messages FOR INSERT WITH CHECK (
  auth.uid() = author_id AND
  EXISTS (
    SELECT 1 FROM channels c
    JOIN server_members sm ON sm.server_id = c.server_id
    WHERE c.id = messages.channel_id AND sm.user_id = auth.uid()
  )
);
CREATE POLICY "messages_delete" ON messages FOR DELETE USING (auth.uid() = author_id);

-- Reaksiyonlar
CREATE POLICY "reactions_select" ON reactions FOR SELECT USING (true);
CREATE POLICY "reactions_insert" ON reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reactions_delete" ON reactions FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- REALTIME
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE reactions;

-- =============================================
-- TRIGGER: otomatik profil oluştur (Google OAuth için)
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, tag, avatar_color, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    '#' || LPAD(FLOOR(RANDOM() * 9999)::TEXT, 4, '0'),
    'linear-gradient(135deg,#2b5bde,#7b5ea7)',
    'online'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
