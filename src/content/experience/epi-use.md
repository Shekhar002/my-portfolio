---
org: EPI-USE
kind: employer
location: Southbank, VIC
roles:
  - title: Technical Data Consultant
    start: 2025-06
    end: present
summary: ETL and data migration across 3 concurrent client engagements, moving HR and payroll data from legacy systems into SAP SuccessFactors via SAP HANA.
highlights:
  - Delivered ETL and data migration across 3 concurrent client engagements in the beverage, healthcare and engineering sectors.
  - Resolved 4,740 conflicting pay-component groups using correlated SQL EXISTS checks to detect co-occurring records and a Python (pandas) script to apply corrective flags at scale.
  - Protected sensitive employee data with SQL masking for tax file and bank account numbers, verified by per-record PASS/FAIL unit-test queries across 4,000+ records.
metrics:
  - { value: 3, label: concurrent client engagements }
  - { value: 4740, label: pay-component conflicts resolved }
  - { value: 4000, suffix: '+', label: records masked & unit-tested }
stack: [SAP HANA, SQLScript, HANA flowgraphs, Python, SAP SuccessFactors]
order: 1
---
