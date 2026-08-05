INSERT INTO neighborhood_campus_distances (neighborhood_id, campus_id, distance_km, walking_time_min, transport_time_min, transport_cost)
SELECT n.id, c.id,
  (random() * 20 + 1)::numeric(8,2),
  (random() * 120 + 10)::int,
  (random() * 60 + 5)::int,
  (random() * 200 + 10)::int
FROM neighborhoods n CROSS JOIN campuses c
WHERE n.city_id = (SELECT id FROM cities WHERE name = 'Nairobi')
  AND c.city_id = (SELECT id FROM cities WHERE name = 'Nairobi')
ON CONFLICT DO NOTHING;

SELECT count(*) AS distances FROM neighborhood_campus_distances;
