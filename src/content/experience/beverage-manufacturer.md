---
org: Leading ANZ beverage manufacturer
kind: client
parent: epi-use
sector: Beverage / FMCG
period: { start: 2025-09, end: 2026-08 }
roles:
  - Data Migration Consultant (Remediation)
summary: Took over a payroll data migration remediation from a third-party vendor and led 4,200+ employees' AU and NZ payroll data into SAP SuccessFactors ahead of go-live.
highlights:
  - Took over a data migration remediation from a third-party vendor that had lost client trust, leading migration of 4,200+ employees' AU and NZ payroll data from ADP and Chris21.
  - Built and tested 20+ SAP HANA flowgraph ETL pipelines covering job, compensation, recurring pay, deductions, payment details and superannuation.
  - Introduced a transformation tracking register documenting 50+ rules end to end, with stage-gate reconciliation and business walkthroughs.
  - Validated a 126-field Job Information specification and designed effective-dated, two-record job history logic for NZ employees.
  - Ran pre-load validation, post-load reconciliation and delta loads across 5 load cycles, resolving all transformation defects within agreed SLAs.
metrics:
  - { value: 4200, suffix: '+', label: employees migrated }
  - { value: 20, suffix: '+', label: flowgraph pipelines }
  - { value: 50, suffix: '+', label: transformation rules traced }
  - { value: 5, label: load cycles }
stack: [SAP HANA flowgraphs, SQL, window functions, ADP, Chris21, SAP SuccessFactors EC, EC Payroll]
caseStudies: [payroll-remediation]
order: 2
---
