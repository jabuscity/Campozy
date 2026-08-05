SELECT 'discussions' AS tbl, count(*) AS cnt FROM discussions UNION ALL
SELECT 'discussion_replies', count(*) FROM discussion_replies UNION ALL
SELECT 'community_posts', count(*) FROM community_posts UNION ALL
SELECT 'community_comments', count(*) FROM community_comments UNION ALL
SELECT 'community_likes', count(*) FROM community_likes;
