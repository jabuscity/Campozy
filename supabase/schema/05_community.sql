-- ============================================================================
-- Module 05: Community
-- ============================================================================

CREATE TABLE IF NOT EXISTS discussion_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL CHECK(length(trim(name)) > 0),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID REFERENCES campuses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES discussion_categories(id),
    title TEXT NOT NULL CHECK(length(trim(title)) > 0),
    content TEXT NOT NULL CHECK(length(trim(content)) > 0),
    reply_count INTEGER NOT NULL DEFAULT 0 CHECK(reply_count >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discussions_campus ON discussions(campus_id);

CREATE INDEX IF NOT EXISTS idx_discussions_user ON discussions(user_id);

CREATE INDEX IF NOT EXISTS idx_discussions_created ON discussions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_discussions_title_search ON discussions USING gin(title gin_trgm_ops);

CREATE TABLE IF NOT EXISTS discussion_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discussion_id UUID NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK(length(trim(content)) > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discussion_replies_discussion ON discussion_replies(discussion_id);

-- ============================================================================
-- COMMUNITY POSTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    campus_id UUID REFERENCES campuses(id),
    title TEXT CHECK(
        title IS NULL
        OR length(trim(title)) > 0
    ),
    content TEXT NOT NULL CHECK(length(trim(content)) > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_posts_author ON community_posts(author_id);

CREATE INDEX IF NOT EXISTS idx_community_posts_campus ON community_posts(campus_id);

CREATE TABLE IF NOT EXISTS community_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK(length(trim(content)) > 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON community_comments(post_id);

CREATE TABLE IF NOT EXISTS community_likes (
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY(post_id, user_id)
);