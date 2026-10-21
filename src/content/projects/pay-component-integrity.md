---
title: Data integrity and protection at scale
client: EPI-USE client engagements
sector: HR & payroll
period: { start: 2025-06, end: present }
summary: Found and fixed 4,740 conflicting pay-component groups with SQL and pandas, and masked tax file and bank numbers with per-record unit tests.
source: [Legacy HR & payroll extracts]
target: [SAP SuccessFactors]
stack: [SQL EXISTS, Python (pandas), SQL masking, PASS/FAIL unit-test queries]
metrics:
  - { value: 4740, label: conflicting groups resolved }
  - { value: 4000, suffix: '+', label: records masked & tested }
order: 3
---

## Challenge

Source data contained conflicting pay-component groups: records that co-occurred when they shouldn't. Sensitive identifiers (tax file numbers and bank account numbers) also had to be protected.

## Transformation

- Wrote **correlated SQL EXISTS checks** to detect co-occurring records.
- Built a **Python (pandas) script** to apply corrective flags at scale.
- Implemented **SQL masking** for tax file and bank account numbers.

## Result

Resolved **4,740 conflicting pay-component groups**. Masking was verified with **per-record PASS/FAIL unit-test queries across 4,000+ records**.
