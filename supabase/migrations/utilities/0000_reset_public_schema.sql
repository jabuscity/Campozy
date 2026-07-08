/*
===============================================================================
CAMPOZY DATABASE RESET
===============================================================================

Purpose
-------
Completely resets the public schema while preserving Supabase's internal
schemas (auth, storage, extensions, realtime, vault, etc.).

Use this ONLY in development or when intentionally rebuilding the database.

This script removes:

    • Tables
    • Views
    • Materialized Views
    • Indexes
    • Triggers
    • Functions
    • Sequences
    • Types
    • Policies
    • Constraints

It does NOT remove:

    • auth schema
    • storage schema
    • extensions schema
    • vault schema
    • realtime schema

After running this script:

    Execute:

        audited_schema.sql

to recreate the Campozy production schema.

===============================================================================
*/

BEGIN;

SET client_min_messages TO WARNING;

------------------------------------------------------------
-- Remove entire public schema
------------------------------------------------------------

DROP SCHEMA IF EXISTS public CASCADE;

------------------------------------------------------------
-- Recreate public schema
------------------------------------------------------------

CREATE SCHEMA public;

------------------------------------------------------------
-- Restore standard Supabase privileges
------------------------------------------------------------

GRANT ALL ON SCHEMA public TO postgres;

GRANT ALL ON SCHEMA public TO service_role;

GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

------------------------------------------------------------
-- Default privileges
------------------------------------------------------------

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON TABLES TO postgres;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON SEQUENCES TO postgres;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON FUNCTIONS TO postgres;


RESET client_min_messages;

COMMIT;

-------------------------------------------------------------------------------
-- End of reset
-------------------------------------------------------------------------------