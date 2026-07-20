-- =====================================================
-- SEED DATA
-- UNIVERSITIES
-- =====================================================
INSERT INTO
    universities (name)
VALUES
    ('University of Nairobi'),
    ('Kenyatta University'),
    ('Moi University'),
    ('Jomo Kenyatta University of Agriculture and Technology'),
    ('Egerton University'),
    ('Maseno University'),
    ('Masinde Muliro University of Science and Technology'),
    ('Chuka University'),
    ('Karatina University'),
    ('Laikipia University'),
    ('Meru University of Science and Technology'),
    ('Technical University of Mombasa'),
    ('Kibabii University'),
    ('Rongo University'),
    ('University of Eldoret'),
    ('University of Kabianga'),
    ('University of Kisii'),
    ('University of Embu'),
    ('University of Eastern Africa, Baraton'),
    ('South Eastern Kenya University'),
    ('Pwani University'),
    ('Dedan Kimathi University of Technology'),
    ('Technical University of Kenya'),
    ('Multimedia University of Kenya'),
    ('Masai Mara University'),
    ('University of Nairobi, Chiromo Campus'),
    ('University of Nairobi, Kikuyu Campus'),
    ('University of Nairobi, Parklands Campus'),
    ('University of Nairobi, Lower Kabete Campus'),
    ('University of Nairobi, Upper Kabete Campus'),
    ('University of Nairobi, Kenyatta National Hospital Campus'),
    ('Technical University of Kenya'),
    ('Dedan Kimathi University of Technology'),
    ('Pwani University'),
    ('South Eastern Kenya University'),
    ('Multimedia University of Kenya') ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- DISCUSSION CATEGORIES
-- =====================================================
INSERT INTO
    discussion_categories (name)
VALUES
    ('General'),
    ('Academics'),
    ('Hostels'),
    ('Campus Life'),
    ('Relationships'),
    ('Faith'),
    ('Events'),
    ('Marketplace'),
    ('Technology'),
    ('Careers') ON CONFLICT (name) DO NOTHING;