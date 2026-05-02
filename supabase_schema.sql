-- ============================================================
-- NEON NOCTURNE / STREAMOPHILIA — Complete Supabase Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 0. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    email TEXT,
    avatar_url TEXT DEFAULT 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6qyE2BV1dCnfusfPdmXhBtNGFRnaLpKcZUN4_PHt_DhRLFed7TPdq2SXjdVyYcMq7Jf1WU5J_AVHbr97V8q49PC4IGHZ9HZzC56cf8bT1hMvlcn1zM_-O8OrWdFcEt8dbRRLK7lpCLGYldrJ4rdmyXLxHNPWaYnGkOd-mvxAPBJ12nOvitgvIJcanK1KSxDM5zu68dHQoL47n_mitgKmk8GjlLvVb5rJg_UyJY55FP2AQOmmpbpvpa6BAInqnbDT8_REYcg4cTmQ',
    bio TEXT DEFAULT '',
    is_partner BOOLEAN DEFAULT FALSE,
    is_online BOOLEAN DEFAULT FALSE,
    wallet_balance INTEGER DEFAULT 500,
    badges JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, email, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. CATEGORIES (Game/Content categories)
-- ============================================================
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    cover_image TEXT,
    viewer_count INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    category_type TEXT DEFAULT 'game' CHECK (category_type IN ('game', 'irl', 'creative', 'esports', 'music')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. CHANNELS (Streamer channels)
-- ============================================================
CREATE TABLE public.channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    channel_name TEXT NOT NULL,
    description TEXT DEFAULT '',
    avatar_url TEXT,
    is_live BOOLEAN DEFAULT FALSE,
    current_category_id UUID REFERENCES public.categories(id),
    current_stream_title TEXT DEFAULT '',
    viewer_count INTEGER DEFAULT 0,
    follower_count INTEGER DEFAULT 0,
    subscriber_count INTEGER DEFAULT 0,
    stream_url TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. STREAMS (Individual stream sessions)
-- ============================================================
CREATE TABLE public.streams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id),
    thumbnail_url TEXT,
    stream_url TEXT,
    viewer_count INTEGER DEFAULT 0,
    peak_viewers INTEGER DEFAULT 0,
    is_live BOOLEAN DEFAULT TRUE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    tags TEXT[] DEFAULT '{}',
    language TEXT DEFAULT 'English'
);

-- ============================================================
-- 5. FOLLOWS (User follows channels)
-- ============================================================
CREATE TABLE public.follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, channel_id)
);

-- ============================================================
-- 6. SUBSCRIPTIONS
-- ============================================================
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscriber_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
    tier INTEGER DEFAULT 1 CHECK (tier IN (1, 2, 3)),
    expires_at TIMESTAMPTZ,
    auto_renew BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(subscriber_id, channel_id)
);

-- ============================================================
-- 7. NOTIFICATIONS
-- ============================================================
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('live', 'raid', 'badge', 'subscription', 'tournament', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    icon TEXT DEFAULT 'notifications',
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. MESSAGES (DM system)
-- ============================================================
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.conversation_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. LIVE CHAT (Stream chat messages)
-- ============================================================
CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stream_id UUID NOT NULL REFERENCES public.streams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_superchat BOOLEAN DEFAULT FALSE,
    superchat_amount DECIMAL(10,2) DEFAULT 0,
    is_mod_message BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 10. SUPERCHATS / DONATIONS
-- ============================================================
CREATE TABLE public.superchats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stream_id UUID NOT NULL REFERENCES public.streams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 11. WALLET TRANSACTIONS
-- ============================================================
CREATE TABLE public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,  -- positive = credit, negative = debit
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'tournament_entry', 'tournament_prize', 'superchat', 'subscription', 'badge_reward')),
    description TEXT,
    reference_id UUID,  -- link to tournament, stream, etc.
    balance_after INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 12. TOURNAMENTS
-- ============================================================
CREATE TABLE public.tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    game_type TEXT NOT NULL,
    description TEXT DEFAULT '',
    cover_image TEXT,
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed', 'cancelled')),
    entry_fee INTEGER DEFAULT 0,
    prize_pool TEXT,
    total_slots INTEGER NOT NULL,
    waiting_slots INTEGER DEFAULT 0,
    filled_slots INTEGER DEFAULT 0,
    start_date DATE NOT NULL,
    start_time TIME NOT NULL,
    stream_url TEXT,
    border_color TEXT DEFAULT 'primary',  -- for UI theming
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 13. TOURNAMENT REGISTRATIONS
-- ============================================================
CREATE TABLE public.tournament_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'waitlist', 'cancelled')),
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tournament_id, user_id)
);

-- ============================================================
-- 14. TOURNAMENT WATCHLIST
-- ============================================================
CREATE TABLE public.tournament_watchlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tournament_id, user_id)
);

-- ============================================================
-- 15. ESPORTS — TEAMS
-- ============================================================
CREATE TABLE public.esports_teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    abbreviation TEXT NOT NULL,
    logo_url TEXT,
    color TEXT DEFAULT '#cf96ff',
    game TEXT NOT NULL,
    region TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 16. ESPORTS — MATCHES
-- ============================================================
CREATE TABLE public.esports_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_name TEXT NOT NULL,
    team_a_id UUID NOT NULL REFERENCES public.esports_teams(id),
    team_b_id UUID NOT NULL REFERENCES public.esports_teams(id),
    score_a INTEGER DEFAULT 0,
    score_b INTEGER DEFAULT 0,
    current_map TEXT,
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed')),
    stream_url TEXT,
    viewer_count INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 17. PREDICTIONS / BETS
-- ============================================================
CREATE TABLE public.predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stream_id UUID REFERENCES public.streams(id) ON DELETE CASCADE,
    match_id UUID REFERENCES public.esports_matches(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    total_sparks_a INTEGER DEFAULT 0,
    total_sparks_b INTEGER DEFAULT 0,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'locked', 'resolved')),
    winner TEXT CHECK (winner IN ('a', 'b')),
    time_remaining INTEGER DEFAULT 300,  -- seconds
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.prediction_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prediction_id UUID NOT NULL REFERENCES public.predictions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    chosen_option TEXT NOT NULL CHECK (chosen_option IN ('a', 'b')),
    amount INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(prediction_id, user_id)
);

-- ============================================================
-- 18. SCHEDULED EVENTS (User's personal schedule)
-- ============================================================
CREATE TABLE public.scheduled_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME,
    reminder BOOLEAN DEFAULT TRUE,
    source_type TEXT CHECK (source_type IN ('stream', 'tournament', 'custom')),
    source_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 19. CREATOR ANALYTICS (for settings/dashboard)
-- ============================================================
CREATE TABLE public.creator_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    watch_time_hours DECIMAL(10,2) DEFAULT 0,
    avg_viewers INTEGER DEFAULT 0,
    peak_viewers INTEGER DEFAULT 0,
    new_subscribers INTEGER DEFAULT 0,
    new_followers INTEGER DEFAULT 0,
    unique_chatters INTEGER DEFAULT 0,
    clip_count INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(channel_id, date)
);

-- ============================================================
-- 20. AUDIENCE DEMOGRAPHICS
-- ============================================================
CREATE TABLE public.audience_demographics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
    country TEXT NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(channel_id, country)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.superchats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esports_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esports_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audience_demographics ENABLE ROW LEVEL SECURITY;

-- PROFILES: public read, own write
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- CATEGORIES: public read
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);

-- CHANNELS: public read, own write
CREATE POLICY "Channels are viewable by everyone" ON public.channels FOR SELECT USING (true);
CREATE POLICY "Users can manage own channel" ON public.channels FOR ALL USING (auth.uid() = user_id);

-- STREAMS: public read
CREATE POLICY "Streams are viewable by everyone" ON public.streams FOR SELECT USING (true);
CREATE POLICY "Channel owners can manage streams" ON public.streams FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM public.channels WHERE id = channel_id)
);

-- FOLLOWS: public read, auth write
CREATE POLICY "Follows are viewable by everyone" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can manage own follows" ON public.follows FOR ALL USING (auth.uid() = follower_id);

-- SUBSCRIPTIONS: own read
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = subscriber_id);
CREATE POLICY "Users can manage own subscriptions" ON public.subscriptions FOR ALL USING (auth.uid() = subscriber_id);

-- NOTIFICATIONS: own read/write
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- CONVERSATIONS & MESSAGES: participant access
CREATE POLICY "Participants can view conversations" ON public.conversations FOR SELECT USING (
    id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid())
);
CREATE POLICY "Users can view own participations" ON public.conversation_participants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Participants can view messages" ON public.messages FOR SELECT USING (
    conversation_id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid())
);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- CHAT MESSAGES: public read, auth write
CREATE POLICY "Chat is viewable by everyone" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can chat" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- SUPERCHATS: public read, auth write
CREATE POLICY "Superchats viewable by everyone" ON public.superchats FOR SELECT USING (true);
CREATE POLICY "Users can send superchats" ON public.superchats FOR INSERT WITH CHECK (auth.uid() = user_id);

-- WALLET: own data
CREATE POLICY "Users can view own transactions" ON public.wallet_transactions FOR SELECT USING (auth.uid() = user_id);

-- TOURNAMENTS: public read, auth write
CREATE POLICY "Tournaments viewable by everyone" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "Users can create tournaments" ON public.tournaments FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update own tournaments" ON public.tournaments FOR UPDATE USING (auth.uid() = creator_id);

-- TOURNAMENT REGISTRATIONS: public read count, own data
CREATE POLICY "Registrations viewable" ON public.tournament_registrations FOR SELECT USING (true);
CREATE POLICY "Users can register" ON public.tournament_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can cancel own registration" ON public.tournament_registrations FOR DELETE USING (auth.uid() = user_id);

-- TOURNAMENT WATCHLIST: own data
CREATE POLICY "Users can view own watchlist" ON public.tournament_watchlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage watchlist" ON public.tournament_watchlist FOR ALL USING (auth.uid() = user_id);

-- ESPORTS: public read
CREATE POLICY "Teams viewable by everyone" ON public.esports_teams FOR SELECT USING (true);
CREATE POLICY "Matches viewable by everyone" ON public.esports_matches FOR SELECT USING (true);

-- PREDICTIONS: public read, auth write
CREATE POLICY "Predictions viewable" ON public.predictions FOR SELECT USING (true);
CREATE POLICY "Entries viewable" ON public.prediction_entries FOR SELECT USING (true);
CREATE POLICY "Users can place predictions" ON public.prediction_entries FOR INSERT WITH CHECK (auth.uid() = user_id);

-- SCHEDULED EVENTS: own data
CREATE POLICY "Users can view own events" ON public.scheduled_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own events" ON public.scheduled_events FOR ALL USING (auth.uid() = user_id);

-- ANALYTICS: channel owner
CREATE POLICY "Owners can view analytics" ON public.creator_analytics FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM public.channels WHERE id = channel_id)
);
CREATE POLICY "Demographics for owners" ON public.audience_demographics FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM public.channels WHERE id = channel_id)
);


-- ============================================================
-- SEED DATA — Populate with your app's existing content
-- ============================================================

-- Categories
INSERT INTO public.categories (name, slug, cover_image, viewer_count, tags, category_type) VALUES
('Just Chatting', 'just-chatting', 'https://static-cdn.jtvnw.net/ttv-boxart/509658-285x380.jpg', 950000, '{"IRL","Talk Show"}', 'irl'),
('VALORANT', 'valorant', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2mvt.jpg', 420000, '{"Shooter","FPS","Competitive"}', 'game'),
('BGMI', 'bgmi', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2k3k.jpg', 380000, '{"Mobile","Battle Royale"}', 'game'),
('Fortnite', 'fortnite', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2dlt.jpg', 210000, '{"Battle Royale","Building"}', 'game'),
('League of Legends', 'league-of-legends', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4bna.jpg', 300000, '{"MOBA","Competitive"}', 'game'),
('EA Sports FC 24', 'fc24', 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6tms.jpg', 150000, '{"Sports","Football"}', 'game'),
('Chess', 'chess', 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=640&h=360&fit=crop', 180000, '{"Strategy","Board Game"}', 'game'),
('PUBG PC', 'pubg-pc', 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=640&h=360&fit=crop', 310000, '{"Battle Royale","FPS"}', 'game'),
('Call of Duty', 'call-of-duty', 'https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=640&h=360&fit=crop', 550000, '{"FPS","Warzone"}', 'game'),
('Clash of Clans', 'clash-of-clans', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=640&h=360&fit=crop', 128000, '{"Strategy","Mobile"}', 'game'),
('Minecraft', 'minecraft', 'https://images.unsplash.com/photo-1587573089734-09cb69c0f2b4?w=640&h=360&fit=crop', 250000, '{"Sandbox","Survival"}', 'game'),
('Albion Online', 'albion-online', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=640&h=360&fit=crop', 45000, '{"MMO","PvP"}', 'game');

-- Esports Teams
INSERT INTO public.esports_teams (name, abbreviation, logo_url, color, game, region) VALUES
('Sentinels', 'SEN', NULL, '#cf96ff', 'VALORANT', 'NA'),
('Fnatic', 'FNC', NULL, '#ff6e84', 'VALORANT', 'EU'),
('OpTic Texas', 'OG', NULL, '#00ff00', 'Call of Duty', 'NA'),
('Atlanta FaZe', 'FAZE', NULL, '#ff0000', 'Call of Duty', 'NA'),
('T1', 'T1', NULL, '#ff0000', 'VALORANT', 'KR'),
('G2 Esports', 'G2', NULL, '#ffffff', 'VALORANT', 'EU'),
('Team Liquid', 'TL', NULL, '#002f6c', 'VALORANT', 'EU'),
('Paper Rex', 'PRX', NULL, '#cf96ff', 'VALORANT', 'APAC'),
('Cloud9', 'C9', NULL, '#00d9ff', 'VALORANT', 'NA');


-- ============================================================
-- USEFUL INDEXES
-- ============================================================
CREATE INDEX idx_streams_channel ON public.streams(channel_id);
CREATE INDEX idx_streams_live ON public.streams(is_live) WHERE is_live = TRUE;
CREATE INDEX idx_channels_live ON public.channels(is_live) WHERE is_live = TRUE;
CREATE INDEX idx_follows_follower ON public.follows(follower_id);
CREATE INDEX idx_follows_channel ON public.follows(channel_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at);
CREATE INDEX idx_chat_messages_stream ON public.chat_messages(stream_id, created_at);
CREATE INDEX idx_tournaments_status ON public.tournaments(status);
CREATE INDEX idx_tournament_regs ON public.tournament_registrations(tournament_id);
CREATE INDEX idx_wallet_user ON public.wallet_transactions(user_id, created_at);
CREATE INDEX idx_esports_matches_status ON public.esports_matches(status);
CREATE INDEX idx_predictions_status ON public.predictions(status);
