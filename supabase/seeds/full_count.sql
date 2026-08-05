SELECT 'profiles' AS tbl, count(*) AS cnt FROM profiles UNION ALL
SELECT 'properties', count(*) FROM properties UNION ALL
SELECT 'universities', count(*) FROM universities UNION ALL
SELECT 'campuses', count(*) FROM campuses UNION ALL
SELECT 'neighborhoods', count(*) FROM neighborhoods UNION ALL
SELECT 'discussions', count(*) FROM discussions UNION ALL
SELECT 'discussion_replies', count(*) FROM discussion_replies UNION ALL
SELECT 'community_posts', count(*) FROM community_posts UNION ALL
SELECT 'community_comments', count(*) FROM community_comments UNION ALL
SELECT 'forums', count(*) FROM forums UNION ALL
SELECT 'forum_topics', count(*) FROM forum_topics UNION ALL
SELECT 'forum_posts', count(*) FROM forum_posts UNION ALL
SELECT 'businesses', count(*) FROM businesses UNION ALL
SELECT 'business_reviews', count(*) FROM business_reviews UNION ALL
SELECT 'opportunities', count(*) FROM opportunities UNION ALL
SELECT 'employers', count(*) FROM employers UNION ALL
SELECT 'notifications', count(*) FROM notifications UNION ALL
SELECT 'utility_incidents', count(*) FROM utility_incidents UNION ALL
SELECT 'hygiene_reports', count(*) FROM hygiene_reports UNION ALL
SELECT 'neighborhood_reviews', count(*) FROM neighborhood_reviews UNION ALL
SELECT 'roommate_profiles', count(*) FROM roommate_profiles UNION ALL
SELECT 'roommate_matches', count(*) FROM roommate_matches UNION ALL
SELECT 'friend_profiles', count(*) FROM friend_profiles UNION ALL
SELECT 'friend_matches', count(*) FROM friend_matches;
