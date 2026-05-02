// ============================================================
// NEON NOCTURNE — Supabase Client & Database API
// ============================================================
// SETUP: Replace the URL and KEY below with your Supabase project credentials.
// Find them at: https://app.supabase.com → Your Project → Settings → API
// ============================================================

const SUPABASE_URL = 'https://lkvoqtzfqvdzrqjfvplm.supabase.co';       // e.g. https://abcdefgh.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxrdm9xdHpmcXZkenJxamZ2cGxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMTI3MjMsImV4cCI6MjA5MjU4ODcyM30.jfx3b1Kvk4xKc3SbZPSStnUrudG41ud8qEwio0fjNyQ'; // e.g. eyJhbGciOiJIUzI1NiIs...

// ============================================================
// 1. Initialize Supabase Client (loads from CDN)
// ============================================================
// Add this script tag to your HTML <head> BEFORE this file:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

let supabase;

function initSupabase() {
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        console.error('Supabase JS library not loaded. Add the CDN script to your HTML.');
    }
    return supabase;
}

// ============================================================
// 2. AUTH — Sign Up, Sign In, Sign Out
// ============================================================

const NeonAuth = {
    // Sign up with email & password
    async signUp(email, password, username) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username, display_name: username }
            }
        });
        if (error) throw error;
        return data;
    },

    // Sign in with email & password
    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Update online status
        if (data.user) {
            await supabase.from('profiles').update({ is_online: true }).eq('id', data.user.id);
        }
        return data;
    },

    // Sign in with Google OAuth
    async signInWithProvider(provider = 'google') {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: { redirectTo: window.location.origin + '/Streamophilia/index.html' }
        });
        if (error) throw error;
        return data;
    },

    // Sign out
    async signOut() {
        const user = await this.getUser();
        if (user) {
            await supabase.from('profiles').update({ is_online: false }).eq('id', user.id);
        }
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        window.location.href = 'login.html';
    },

    // Get current user
    async getUser() {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    // Get current session
    async getSession() {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    },

    // Listen for auth changes
    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange(callback);
    },

    // Check if logged in (redirect if not)
    async requireAuth() {
        const session = await this.getSession();
        if (!session) {
            window.location.href = 'login.html';
            return null;
        }
        return session;
    }
};

// ============================================================
// 3. PROFILES
// ============================================================

const NeonProfiles = {
    async getMyProfile() {
        const user = await NeonAuth.getUser();
        if (!user) return null;
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        if (error) throw error;
        return data;
    },

    async getProfile(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (error) throw error;
        return data;
    },

    async getProfileByUsername(username) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('username', username)
            .single();
        if (error) throw error;
        return data;
    },

    async updateProfile(updates) {
        const user = await NeonAuth.getUser();
        const { data, error } = await supabase
            .from('profiles')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', user.id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async getWalletBalance() {
        const profile = await this.getMyProfile();
        return profile?.wallet_balance ?? 0;
    }
};

// ============================================================
// 4. CATEGORIES
// ============================================================

const NeonCategories = {
    async getAll(type = null) {
        let query = supabase.from('categories').select('*').order('viewer_count', { ascending: false });
        if (type) query = query.eq('category_type', type);
        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    async getBySlug(slug) {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('slug', slug)
            .single();
        if (error) throw error;
        return data;
    }
};

// ============================================================
// 5. CHANNELS & STREAMS
// ============================================================

const NeonChannels = {
    async getLiveChannels(limit = 20) {
        const { data, error } = await supabase
            .from('channels')
            .select('*, profiles(username, avatar_url), categories(name, slug)')
            .eq('is_live', true)
            .order('viewer_count', { ascending: false })
            .limit(limit);
        if (error) throw error;
        return data;
    },

    async getChannel(channelId) {
        const { data, error } = await supabase
            .from('channels')
            .select('*, profiles(username, avatar_url, is_partner), categories(name)')
            .eq('id', channelId)
            .single();
        if (error) throw error;
        return data;
    },

    async getMyChannel() {
        const user = await NeonAuth.getUser();
        const { data, error } = await supabase
            .from('channels')
            .select('*')
            .eq('user_id', user.id)
            .single();
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
        return data;
    },

    async getFollowedChannels() {
        const user = await NeonAuth.getUser();
        const { data, error } = await supabase
            .from('follows')
            .select('channels(*, profiles(username, avatar_url), categories(name))')
            .eq('follower_id', user.id);
        if (error) throw error;
        return data.map(f => f.channels);
    }
};

const NeonStreams = {
    async getLiveStreams(categorySlug = null, limit = 20) {
        let query = supabase
            .from('streams')
            .select('*, channels(channel_name, avatar_url:profiles(avatar_url)), categories(name, slug)')
            .eq('is_live', true)
            .order('viewer_count', { ascending: false })
            .limit(limit);

        if (categorySlug) {
            query = query.eq('categories.slug', categorySlug);
        }
        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    async getStream(streamId) {
        const { data, error } = await supabase
            .from('streams')
            .select('*, channels(*, profiles(username, avatar_url, is_partner)), categories(name)')
            .eq('id', streamId)
            .single();
        if (error) throw error;
        return data;
    }
};

// ============================================================
// 6. FOLLOWS & SUBSCRIPTIONS
// ============================================================

const NeonFollows = {
    async follow(channelId) {
        const user = await NeonAuth.getUser();
        const { data, error } = await supabase
            .from('follows')
            .insert({ follower_id: user.id, channel_id: channelId })
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async unfollow(channelId) {
        const user = await NeonAuth.getUser();
        const { error } = await supabase
            .from('follows')
            .delete()
            .eq('follower_id', user.id)
            .eq('channel_id', channelId);
        if (error) throw error;
    },

    async isFollowing(channelId) {
        const user = await NeonAuth.getUser();
        const { data } = await supabase
            .from('follows')
            .select('id')
            .eq('follower_id', user.id)
            .eq('channel_id', channelId)
            .maybeSingle();
        return !!data;
    }
};

// ============================================================
// 7. NOTIFICATIONS
// ============================================================

const NeonNotifications = {
    async getAll(limit = 20) {
        const user = await NeonAuth.getUser();
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(limit);
        if (error) throw error;
        return data;
    },

    async getUnreadCount() {
        const user = await NeonAuth.getUser();
        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('is_read', false);
        if (error) throw error;
        return count;
    },

    async markAllRead() {
        const user = await NeonAuth.getUser();
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false);
        if (error) throw error;
    },

    async markRead(notifId) {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notifId);
        if (error) throw error;
    },

    // Subscribe to realtime notifications
    subscribeToNew(callback) {
        return supabase
            .channel('notifications')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${supabase.auth.getUser().then(u => u.data.user?.id)}`
            }, payload => callback(payload.new))
            .subscribe();
    }
};

// ============================================================
// 8. MESSAGES (DM)
// ============================================================

const NeonMessages = {
    async getConversations() {
        const user = await NeonAuth.getUser();
        const { data, error } = await supabase
            .from('conversation_participants')
            .select(`
                conversation_id,
                conversations(
                    id, updated_at,
                    messages(content, created_at, sender_id)
                )
            `)
            .eq('user_id', user.id)
            .order('conversations(updated_at)', { ascending: false });
        if (error) throw error;
        return data;
    },

    async getMessages(conversationId, limit = 50) {
        const { data, error } = await supabase
            .from('messages')
            .select('*, profiles:sender_id(username, avatar_url)')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true })
            .limit(limit);
        if (error) throw error;
        return data;
    },

    async sendMessage(conversationId, content) {
        const user = await NeonAuth.getUser();
        const { data, error } = await supabase
            .from('messages')
            .insert({ conversation_id: conversationId, sender_id: user.id, content })
            .select()
            .single();
        if (error) throw error;

        // Update conversation timestamp
        await supabase
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', conversationId);

        return data;
    },

    // Subscribe to new messages in a conversation
    subscribeToMessages(conversationId, callback) {
        return supabase
            .channel(`messages:${conversationId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${conversationId}`
            }, payload => callback(payload.new))
            .subscribe();
    }
};

// ============================================================
// 9. LIVE CHAT
// ============================================================

const NeonChat = {
    async sendChatMessage(streamId, content, isSuperchat = false, amount = 0) {
        const user = await NeonAuth.getUser();
        const { data, error } = await supabase
            .from('chat_messages')
            .insert({
                stream_id: streamId,
                user_id: user.id,
                content,
                is_superchat: isSuperchat,
                superchat_amount: amount
            })
            .select('*, profiles:user_id(username, avatar_url, is_partner)')
            .single();
        if (error) throw error;
        return data;
    },

    async getChatMessages(streamId, limit = 100) {
        const { data, error } = await supabase
            .from('chat_messages')
            .select('*, profiles:user_id(username, avatar_url, is_partner)')
            .eq('stream_id', streamId)
            .order('created_at', { ascending: true })
            .limit(limit);
        if (error) throw error;
        return data;
    },

    // Subscribe to realtime chat
    subscribeToChat(streamId, callback) {
        return supabase
            .channel(`chat:${streamId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter: `stream_id=eq.${streamId}`
            }, payload => callback(payload.new))
            .subscribe();
    }
};

// ============================================================
// 10. WALLET
// ============================================================

const NeonWallet = {
    async getBalance() {
        return await NeonProfiles.getWalletBalance();
    },

    async getTransactions(limit = 20) {
        const user = await NeonAuth.getUser();
        const { data, error } = await supabase
            .from('wallet_transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(limit);
        if (error) throw error;
        return data;
    },

    async deductCoins(amount, type, description, referenceId = null) {
        const user = await NeonAuth.getUser();
        const profile = await NeonProfiles.getMyProfile();

        if (profile.wallet_balance < amount) {
            throw new Error('Insufficient balance');
        }

        const newBalance = profile.wallet_balance - amount;

        // Update balance
        await supabase.from('profiles').update({ wallet_balance: newBalance }).eq('id', user.id);

        // Log transaction
        const { data, error } = await supabase
            .from('wallet_transactions')
            .insert({
                user_id: user.id,
                amount: -amount,
                type,
                description,
                reference_id: referenceId,
                balance_after: newBalance
            })
            .select()
            .single();
        if (error) throw error;
        return { transaction: data, newBalance };
    },

    async addCoins(amount, type, description, referenceId = null) {
        const user = await NeonAuth.getUser();
        const profile = await NeonProfiles.getMyProfile();
        const newBalance = profile.wallet_balance + amount;

        await supabase.from('profiles').update({ wallet_balance: newBalance }).eq('id', user.id);

        const { data, error } = await supabase
            .from('wallet_transactions')
            .insert({
                user_id: user.id,
                amount,
                type,
                description,
                reference_id: referenceId,
                balance_after: newBalance
            })
            .select()
            .single();
        if (error) throw error;
        return { transaction: data, newBalance };
    }
};

// ============================================================
// 11. TOURNAMENTS
// ============================================================

const NeonTournaments = {
    async getAll(status = null) {
        let query = supabase.from('tournaments').select('*, profiles:creator_id(username)').order('created_at', { ascending: false });
        if (status) query = query.eq('status', status);
        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    async getTournament(id) {
        const { data, error } = await supabase
            .from('tournaments')
            .select('*, profiles:creator_id(username, avatar_url), tournament_registrations(user_id, status)')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    async create(tournament) {
        const user = await NeonAuth.getUser();
        const { data, error } = await supabase
            .from('tournaments')
            .insert({ ...tournament, creator_id: user.id })
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async join(tournamentId, entryFee) {
        const user = await NeonAuth.getUser();

        // Deduct entry fee
        if (entryFee > 0) {
            await NeonWallet.deductCoins(entryFee, 'tournament_entry', `Tournament entry fee`, tournamentId);
        }

        // Register
        const { data, error } = await supabase
            .from('tournament_registrations')
            .insert({ tournament_id: tournamentId, user_id: user.id })
            .select()
            .single();
        if (error) throw error;

        // Update filled slots
        await supabase.rpc('increment_tournament_slots', { t_id: tournamentId });

        return data;
    },

    async addToWatchlist(tournamentId) {
        const user = await NeonAuth.getUser();
        const { data, error } = await supabase
            .from('tournament_watchlist')
            .insert({ tournament_id: tournamentId, user_id: user.id })
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async getMyTournaments() {
        const user = await NeonAuth.getUser();
        const { data, error } = await supabase
            .from('tournament_registrations')
            .select('*, tournaments(*)')
            .eq('user_id', user.id);
        if (error) throw error;
        return data;
    }
};

// ============================================================
// 12. ESPORTS
// ============================================================

const NeonEsports = {
    async getTeams(game = null) {
        let query = supabase.from('esports_teams').select('*');
        if (game) query = query.eq('game', game);
        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    async getLiveMatches() {
        const { data, error } = await supabase
            .from('esports_matches')
            .select('*, team_a:team_a_id(*), team_b:team_b_id(*)')
            .eq('status', 'live')
            .order('viewer_count', { ascending: false });
        if (error) throw error;
        return data;
    },

    async getUpcomingMatches(limit = 10) {
        const { data, error } = await supabase
            .from('esports_matches')
            .select('*, team_a:team_a_id(*), team_b:team_b_id(*)')
            .eq('status', 'upcoming')
            .order('started_at', { ascending: true })
            .limit(limit);
        if (error) throw error;
        return data;
    }
};

// ============================================================
// 13. PREDICTIONS
// ============================================================

const NeonPredictions = {
    async getForStream(streamId) {
        const { data, error } = await supabase
            .from('predictions')
            .select('*')
            .eq('stream_id', streamId)
            .eq('status', 'open')
            .single();
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    async placeBet(predictionId, option, amount) {
        const user = await NeonAuth.getUser();

        // Deduct from wallet
        await NeonWallet.deductCoins(amount, 'tournament_entry', `Prediction bet`, predictionId);

        const { data, error } = await supabase
            .from('prediction_entries')
            .insert({
                prediction_id: predictionId,
                user_id: user.id,
                chosen_option: option,
                amount
            })
            .select()
            .single();
        if (error) throw error;

        // Update totals
        const column = option === 'a' ? 'total_sparks_a' : 'total_sparks_b';
        await supabase.rpc('increment_prediction_sparks', {
            p_id: predictionId,
            col: column,
            amt: amount
        });

        return data;
    }
};

// ============================================================
// 14. SCHEDULED EVENTS
// ============================================================

const NeonSchedule = {
    async add(title, date, time, sourceType = 'custom', sourceId = null) {
        const user = await NeonAuth.getUser();
        const { data, error } = await supabase
            .from('scheduled_events')
            .insert({
                user_id: user.id,
                title,
                event_date: date,
                event_time: time,
                source_type: sourceType,
                source_id: sourceId
            })
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async getMySchedule() {
        const user = await NeonAuth.getUser();
        const { data, error } = await supabase
            .from('scheduled_events')
            .select('*')
            .eq('user_id', user.id)
            .order('event_date', { ascending: true });
        if (error) throw error;
        return data;
    }
};

// ============================================================
// 15. CREATOR ANALYTICS (for settings.html)
// ============================================================

const NeonAnalytics = {
    async getAnalytics(channelId, days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error } = await supabase
            .from('creator_analytics')
            .select('*')
            .eq('channel_id', channelId)
            .gte('date', startDate.toISOString().split('T')[0])
            .order('date', { ascending: true });
        if (error) throw error;
        return data;
    },

    async getDemographics(channelId) {
        const { data, error } = await supabase
            .from('audience_demographics')
            .select('*')
            .eq('channel_id', channelId)
            .order('percentage', { ascending: false });
        if (error) throw error;
        return data;
    }
};

// ============================================================
// EXPORT / MAKE AVAILABLE GLOBALLY
// ============================================================
window.NeonDB = {
    init: initSupabase,
    auth: NeonAuth,
    profiles: NeonProfiles,
    categories: NeonCategories,
    channels: NeonChannels,
    streams: NeonStreams,
    follows: NeonFollows,
    notifications: NeonNotifications,
    messages: NeonMessages,
    chat: NeonChat,
    wallet: NeonWallet,
    tournaments: NeonTournaments,
    esports: NeonEsports,
    predictions: NeonPredictions,
    schedule: NeonSchedule,
    analytics: NeonAnalytics
};

// Auto-init when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    initSupabase();
    console.log('%c🌙 Neon Nocturne DB Connected', 'color: #cf96ff; font-size: 14px; font-weight: bold;');
});
