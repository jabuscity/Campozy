-- ============================================================================
-- FORUM DOMAIN
-- Additive migration: implements the Forum Domain from doc 09_DATABASE_SCHEMA.md
-- ============================================================================

CREATE TABLE IF NOT EXISTS forums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK (length(trim(name)) > 0),
    description TEXT,
    campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
    neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE SET NULL,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS forum_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forum_id UUID NOT NULL REFERENCES forums(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(forum_id, user_id)
);

CREATE TABLE IF NOT EXISTS forum_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forum_id UUID NOT NULL REFERENCES forums(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (length(trim(title)) > 0),
    content TEXT NOT NULL CHECK (length(trim(content)) > 0),
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    view_count INTEGER NOT NULL DEFAULT 0,
    reply_count INTEGER NOT NULL DEFAULT 0,
    last_reply_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS forum_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (length(trim(content)) > 0),
    parent_post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
    is_solution BOOLEAN NOT NULL DEFAULT FALSE,
    upvotes INTEGER NOT NULL DEFAULT 0,
    downvotes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS forum_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
    notify_on_reply BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, topic_id)
);

-- Indexes
CREATE INDEX idx_forums_campus ON forums(campus_id);
CREATE INDEX idx_forums_neighborhood ON forums(neighborhood_id);
CREATE INDEX idx_forum_topics_forum ON forum_topics(forum_id);
CREATE INDEX idx_forum_topics_user ON forum_topics(user_id);
CREATE INDEX idx_forum_posts_topic ON forum_posts(topic_id);
CREATE INDEX idx_forum_posts_user ON forum_posts(user_id);
CREATE INDEX idx_forum_subscriptions_user ON forum_subscriptions(user_id);
CREATE INDEX idx_forum_subscriptions_topic ON forum_subscriptions(topic_id);
