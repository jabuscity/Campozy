WITH u AS (SELECT id FROM profiles ORDER BY created_at LIMIT 25),
c AS (SELECT id FROM campuses LIMIT 5),
emp AS (SELECT id FROM employers LIMIT 5)

INSERT INTO employers (name, description, website, verification_level, contact_user_id, is_active)
SELECT ('{Tech Innovations Ltd,Safaricom PLC,Equity Bank,KCB Group,Kenya Airways}'::text[])[floor(random()*5+1)],
  'Leading employer in Kenya',
  'https://example.com',
  ('{unverified,claimed,community_verified,scout_verified,campozy_verified}'::text[])[floor(random()*5+1)]::verification_level,
  (SELECT id FROM u OFFSET floor(random()*25) LIMIT 1), true
FROM generate_series(1, 5)
ON CONFLICT DO NOTHING;

WITH emp AS (SELECT id FROM employers LIMIT 5), c AS (SELECT id FROM campuses LIMIT 5)
INSERT INTO opportunities (employer_id, creator_id, campus_id, type, title, description, requirements, location, is_remote, compensation, application_url, deadline, is_active)
SELECT (SELECT id FROM emp OFFSET floor(random()*5) LIMIT 1),
  (SELECT id FROM (SELECT id FROM profiles ORDER BY created_at LIMIT 25) u OFFSET floor(random()*25) LIMIT 1),
  (SELECT id FROM c OFFSET floor(random()*5) LIMIT 1),
  ('{job,internship,scholarship,volunteer,event}'::text[])[floor(random()*5+1)]::opportunity_type,
  ('{Software Engineering Internship,Data Analyst Intern,Marketing Intern,Customer Service Rep,Graduate Trainee,Research Assistant,Content Writer,Sales Rep,Finance Intern,HR Intern}'::text[])[floor(random()*10+1)],
  'Join our team and gain valuable experience.',
  '{"skills":["Communication","Teamwork"],"education":"Bachelor"}',
  ('{Nairobi,Remote,Mombasa,Kisumu}'::text[])[floor(random()*4+1)],
  random() > 0.5, 'Stipend + benefits', 'https://apply.example.com', NOW() + (random() * interval '60 days'), true
FROM generate_series(1, 15)
ON CONFLICT DO NOTHING;

SELECT count(*) AS employers FROM employers;
SELECT count(*) AS opportunities FROM opportunities;
