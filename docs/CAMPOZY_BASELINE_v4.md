# CAMPOZY PRODUCTION BASELINE (v4)

**Status:** Draft (Pending Successful Deployment)  
**Schema Version:** v4  
**Project:** Campozy  
**Database:** PostgreSQL (Supabase)  

---

# Purpose

This document defines the first production-grade database baseline for Campozy.

Once `audited_schema.sql` has been successfully deployed to an empty Supabase database and validated without errors, this document becomes the authoritative reference for all future schema development.

From this point onward:

- All schema changes must be introduced through versioned migrations.
- The production schema should never be edited manually.
- Future versions (v4.1, v5, etc.) must build upon this baseline.

---

# Source of Truth

Production schema:

```
supabase/migrations/audited_schema.sql
```

Supporting utilities:

```
supabase/migrations/utilities/0000_reset_public_schema.sql
```

Validation script:

```
supabase/migrations/validation/0001_validation_checks.sql
```

Deployment log:

```
docs/DEPLOYMENT_LOG.md
```

Schema changelog:

```
SCHEMA_CHANGELOG_v4.md
```

---

# Engineering Principles

The Campozy schema is built around the following principles:

- Consistency over feature accumulation
- Explicit constraints
- Strong relational integrity
- Security-first architecture
- Deterministic trigger behavior
- Production-safe migrations
- Idempotent seed data
- Clear ownership and foreign key relationships
- Maintainable indexes
- Runtime validation before release

---

# Expected Database Components

## Extensions

- uuid-ossp
- pgcrypto
- pg_trgm
- vector

---

## Schema

Primary application schema:

```
public
```

Supabase-managed schemas (not modified by Campozy):

- auth
- storage
- realtime
- extensions
- vault

---

# Core Features

The production schema includes:

- Authentication integration
- Automatic profile creation
- Student management
- Campozy Score engine
- Discussion system
- Reply counter automation
- Notifications
- Messaging
- Marketplace
- Housing
- Community
- Recommendation vectors
- Row Level Security
- Automatic `updated_at` maintenance

---

# Validation Requirements

The schema is considered production-ready only if all of the following pass:

- [ ] Migration executes without SQL errors
- [ ] Extensions installed
- [ ] Tables created
- [ ] Foreign keys validated
- [ ] Indexes created
- [ ] Functions created
- [ ] Triggers created
- [ ] RLS enabled
- [ ] Policies installed
- [ ] Seed data inserted
- [ ] `handle_new_user()` verified
- [ ] Campozy Score verified
- [ ] Reply counter verified
- [ ] Automatic `updated_at` verified

---

# Deployment Information

**Supabase Project**

Pending

---

**Project Reference**

Pending

---

**Deployment Date**

Pending

---

**PostgreSQL Version**

Pending

---

**Git Branch**

schema-v4-hardening

---

**Migration Commit**

Pending

---

# Production Baseline Declaration

This section must only be completed after successful deployment.

---

**Deployment Status**

☐ Pending

☐ Validated

☐ Production Baseline Established

---

**Validated By**

Pending

---

**Validation Date**

Pending

---

**Notes**

Pending

---

# Future Migration Policy

After this baseline is established:

1. Do not edit `audited_schema.sql` for routine schema evolution.
2. Introduce all future database changes as new, versioned migration files.
3. Re-run validation after every migration.
4. Update `SCHEMA_CHANGELOG_v4.md` with every approved schema change.
5. Record deployment outcomes in `DEPLOYMENT_LOG.md`.

This document represents the contractual foundation of Campozy's production database.