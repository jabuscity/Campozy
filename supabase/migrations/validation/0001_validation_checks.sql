/*
===============================================================================
CAMPOZY SCHEMA VALIDATION
===============================================================================

Purpose
-------
Verifies that the Campozy schema installed correctly.

This script DOES NOT modify data.

Checks include:

    ✓ Extensions
    ✓ Tables
    ✓ Functions
    ✓ Triggers
    ✓ Indexes
    ✓ Row Level Security
    ✓ Policies
    ✓ Seed Data

===============================================================================
*/

------------------------------------------------------------
-- PostgreSQL Version
------------------------------------------------------------

SELECT version();

------------------------------------------------------------
-- Installed Extensions
------------------------------------------------------------

SELECT
    extname AS extension
FROM pg_extension
ORDER BY extname;

------------------------------------------------------------
-- Public Tables
------------------------------------------------------------

SELECT
    tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

------------------------------------------------------------
-- Functions
------------------------------------------------------------

SELECT
    routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

------------------------------------------------------------
-- Triggers
------------------------------------------------------------

SELECT
    event_object_table,
    trigger_name
FROM information_schema.triggers
ORDER BY
    event_object_table,
    trigger_name;

------------------------------------------------------------
-- Indexes
------------------------------------------------------------

SELECT
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname='public'
ORDER BY
    tablename,
    indexname;

------------------------------------------------------------
-- RLS Enabled
------------------------------------------------------------

SELECT
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname='public'
ORDER BY tablename;

------------------------------------------------------------
-- Policies
------------------------------------------------------------

SELECT
    tablename,
    policyname
FROM pg_policies
ORDER BY
    tablename,
    policyname;

------------------------------------------------------------
-- Universities Seed Count
------------------------------------------------------------

SELECT
    COUNT(*) AS universities
FROM universities;

------------------------------------------------------------
-- Discussion Categories Seed Count
------------------------------------------------------------

SELECT
    COUNT(*) AS discussion_categories
FROM discussion_categories;

------------------------------------------------------------
-- Completion
------------------------------------------------------------

SELECT
    'CAMPOZY SCHEMA VALIDATION COMPLETE' AS status;