INSERT INTO business_reviews (business_id, reviewer_id, overall_rating, service_rating, quality_rating, value_rating, cleanliness_rating, staff_rating, title, review, would_recommend, is_verified_visit)
SELECT id, (SELECT id FROM profiles ORDER BY created_at LIMIT 1 OFFSET 0), 5, 4, 5, 4, 5, 4, 'Great service!', 'Good food.', true, true
FROM businesses LIMIT 3
ON CONFLICT DO NOTHING;

INSERT INTO business_reviews (business_id, reviewer_id, overall_rating, service_rating, quality_rating, value_rating, cleanliness_rating, staff_rating, title, review, would_recommend, is_verified_visit)
SELECT id, (SELECT id FROM profiles ORDER BY created_at LIMIT 1 OFFSET 1), 4, 4, 4, 3, 4, 4, 'Average', 'Decent place.', true, true
FROM businesses LIMIT 3
ON CONFLICT DO NOTHING;

INSERT INTO business_reviews (business_id, reviewer_id, overall_rating, service_rating, quality_rating, value_rating, cleanliness_rating, staff_rating, title, review, would_recommend, is_verified_visit)
SELECT id, (SELECT id FROM profiles ORDER BY created_at LIMIT 1 OFFSET 2), 5, 5, 5, 5, 5, 5, 'Excellent!', 'Love it!', true, true
FROM businesses LIMIT 3
ON CONFLICT DO NOTHING;

SELECT count(*) AS br_count FROM business_reviews;
