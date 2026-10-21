---
title: Rescuing a payroll migration
client: Leading ANZ beverage manufacturer
sector: Beverage / FMCG
period: { start: 2025-09, end: 2026-08 }
summary: Took over a stalled third-party migration and moved 4,200+ employees' AU and NZ payroll data into SAP SuccessFactors ahead of go-live, rebuilding client trust through full traceability.
source: [ADP, Chris21]
target: [SAP SuccessFactors Employee Central, Employee Central Payroll]
stack: [SAP HANA flowgraphs, SQL, UNION / CASE logic, window functions]
metrics:
  - { value: 4200, suffix: '+', label: employees migrated }
  - { value: 20, suffix: '+', label: flowgraph pipelines }
  - { value: 50, suffix: '+', label: rules traced end to end }
  - { value: 126, label: spec fields validated }
  - { value: 5, label: load cycles }
order: 1
---

## Challenge

The client's previous migration vendor had lost their trust, with go-live approaching. More than 4,200 employees' AU and NZ payroll data had to come out of ADP and Chris21 and land correctly in SAP SuccessFactors: job, compensation, recurring pay, deductions, payment details and superannuation.

## Transformation

- Built and tested **20+ SAP HANA flowgraph ETL pipelines** using multi-source joins, UNIONs, CASE logic and window functions.
- Introduced a **transformation tracking register** covering 50+ rules end to end (source and target fields, logic, requirement reference, test result).
- Validated the **126-field Job Information specification**, correcting picklist mismatches, faulty SQL conditions and mandatory fields that lacked source logic.
- Designed **effective-dated, two-record job history logic** for NZ employees.

## Result

Pre-load validation, post-load reconciliation and delta loads ran across **5 load cycles**, and every transformation defect was resolved within the agreed SLAs. Stage-gate reconciliation and business walkthroughs rebuilt the client's confidence.
