---
org: ASX-listed health services and distribution group
kind: client
parent: epi-use
sector: Healthcare
period: { start: 2025-10, end: 2026-08 }
roles:
  - Business Analyst
  - Data Management Consultant
summary: Started as Business Analyst on a performance and goals rollout, then moved into data, leading a 250+ employee migration from a legacy SuccessFactors instance into the group's consolidated environment.
highlights:
  - Translated 4 workshop sessions for a performance and goals module rollout into functional documentation and future-state process maps with full requirement traceability.
  - Led migration of 250+ employees from a legacy SAP SuccessFactors instance into the consolidated environment, owning transformation build, pre-load validation, loads and post-load reconciliation.
  - Wrote ROW_NUMBER() OVER (PARTITION BY) deduplication logic selecting one primary record per employee across 500+ records, and diagnosed HANA stored procedure errors blocking extracts.
  - Resolved 4,740 conflicting pay-component groups using correlated SQL EXISTS checks and a Python (pandas) script to apply corrective flags at scale.
  - Implemented SQL masking for tax file and bank account numbers, verified by per-record PASS/FAIL unit-test queries across 4,000+ records.
  - Maintained the source-to-target specification for 8 entities and delivered 4 load cycles to client data SMEs, project managers and delivery managers.
metrics:
  - { value: 250, suffix: '+', label: employees consolidated }
  - { value: 500, suffix: '+', label: records deduplicated }
  - { value: 4740, label: pay-component conflicts resolved }
  - { value: 8, label: entities specified }
  - { value: 4, label: load cycles }
stack: [SAP HANA, SQL, stored procedures, Python (pandas), SAP SuccessFactors]
caseStudies: [instance-consolidation, pay-component-integrity]
order: 3
---
