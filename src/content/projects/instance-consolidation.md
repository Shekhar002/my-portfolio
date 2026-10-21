---
title: Consolidating two SuccessFactors instances
client: ASX-listed health services and distribution group
sector: Healthcare
period: { start: 2025-10, end: 2026-08 }
summary: Led a 250+ employee migration from a legacy SAP SuccessFactors instance into the group's consolidated environment, from transformation build to post-load reconciliation.
source: [Legacy SAP SuccessFactors instance]
target: [Consolidated SAP SuccessFactors environment]
stack: [SAP HANA, SQL, ROW_NUMBER() OVER (PARTITION BY), stored procedures]
metrics:
  - { value: 250, suffix: '+', label: employees consolidated }
  - { value: 500, suffix: '+', label: records deduplicated }
  - { value: 8, label: entities specified }
  - { value: 4, label: load cycles }
order: 2
---

## Challenge

Employees in a legacy SAP SuccessFactors instance had to move into the group's consolidated environment, and many had more than one candidate record.

## Transformation

- Wrote **ROW_NUMBER() OVER (PARTITION BY)** deduplication logic to select one primary record per employee across 500+ records.
- Diagnosed **SAP HANA stored procedure errors** that were blocking data extracts.
- Maintained the **source-to-target specification for 8 entities**.

## Result

Delivered **4 load cycles** to client data SMEs, project managers and delivery managers, owning transformation build, pre-load validation, data loads and post-load reconciliation.
