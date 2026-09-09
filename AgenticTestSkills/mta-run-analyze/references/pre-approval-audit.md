# 14-Point Pre-Approval Quality Audit Protocol

**📍 Location:** `references/pre-approval-audit.md` | **🏠 Parent:** [MTA Test Design Skill](../../mta-test-design/SKILL.md) / [MTA Build Skill](../../mta-build/SKILL.md)  
*Patterns Enforced: `PAT-03`, `PAT-06`, `PAT-07`, `PAT-08`, `PAT-10`, `PAT-11`, `PAT-12`, `PAT-16`, `PAT-18`, `PAT-19`, `PAT-20`, `PAT-27`, `PAT-28`, `PAT-34`, `PAT-35`, `PAT-41`, `PAT-54`, `PAT-60`, `PAT-63`, `PAT-64`, `PAT-65`, `PAT-67`, `PAT-75`, `PAT-77`, `PAT-82`, `PAT-89`, `ANTI-01`, `ANTI-03`, `ANTI-08`, `ANTI-11`, `ANTI-20`, `ANTI-21`, `ANTI-23`, `ANTI-29`, `ANTI-31`, `ANTI-36`, `ANTI-41`*

This reference document defines the complete 14-point Pre-Approval Quality Audit protocol required before presenting any Execution Plan to the user in `STATE_BUILD_PLANNING` or proceeding to Checkpoint 1 review.

---

## 📋 The 14 Verification Checks

### [CHECK 1] Frontend Split Law (`PAT-18`, `PAT-03`)
- **Scope:** Frontend UI Tests (NA for Backend).
- **Verification Criteria:** Setup and teardown steps MUST be separated into distinct test cases: Case 1 Setup (`ExecutionCondition = "_Always"`), Case 2 Execute, and Case 3 Teardown (`ExecutionCondition = "_Always"`, `ResumeExecutionAfterException = "_Continue"`).
- **Compliance Status:** `PASS` or `NA`.

### [CHECK 2] TestCase Container Formatting & Execution User (`PAT-11`, `PAT-10`, `PAT-79`)
- **Scope:** All Tests.
- **Verification Criteria:** Rollback settings and Validation Feedback assertions are formatted strictly at the TestCase container level. `EXUS_ExecutionUser` (or `ExecutorUsername`) is explicitly assigned. No embedded assertions are placed on Create Object or Change Object steps.
- **Compliance Status:** `PASS`.

### [CHECK 3] Backend-First Direct Piping Deletes (`PAT-20`, `PAT-16`)
- **Scope:** Backend Tests (NA for Frontend).
- **Verification Criteria:** Backend-created objects are deleted via direct variable handle piping (`TestStepOutputKey` passed at creation) without redundant database `Retrieve` steps.
- **Compliance Status:** `PASS` or `NA`.

### [CHECK 4] Setup Portability (`PAT-28`, `PAT-41`)
- **Scope:** Frontend UI Tests (NA for Backend).
- **Verification Criteria:** All browser setup paths utilize relative logical paths (e.g., `/index.html`, `/login.html`) rather than hardcoded absolute host URLs.
- **Compliance Status:** `PASS` or `NA`.

### [CHECK 5] Explicit Filter Attributes, Input Handles & Variation Matrix (`PAT-07`, `PAT-19`, `PAT-27`, `PAT-54`, `PAT-77`, `ANTI-08`, `ANTI-11`, `ANTI-31`)
- **Scope:** All Tests.
- **Verification Criteria:** `Retrieve` steps specify `Input Handle Source`. Parameters/associations requiring empty/NULL variations use `Retrieve` with an explicit attribute filter. The Data Variation Matrix adheres to horizontal layout capped at 8 columns. Every variation includes full scenario Name and Description metadata (`PAT-77`, `ANTI-31`).
- **Compliance Status:** `PASS`.

### [CHECK 6] Embedded Step Assertions & Output Object Count (`PAT-08`, `PAT-06`, `ANTI-03`)
- **Scope:** All Tests.
- **Verification Criteria:** All step-level assertions (`Assert Object Count`, `Assert Attribute Value Compare`, `Assert Microflow Return Value`, `Assert Exception`) are embedded directly within Field 6 of their parent producer steps (`Retrieve Object` / `Microflow Call`) and never declared as standalone test steps. Embedded assertions on Create/Change steps are strictly prohibited.
- **Compliance Status:** `PASS` or `NA`.

### [CHECK 7] Mandatory Page & Widget Discovery (`PAT-35`, `PAT-67`, `ANTI-23`)
- **Scope:** Frontend UI Tests (NA for Backend).
- **Verification Criteria:** `GetAppModelData` (Pages/Widgets) or `mxcli` `DESCRIBE PAGE`, `DESCRIBE SNIPPET`, and `DESCRIBE ENTITY` were executed upfront. All form input widgets across tabs and snippets are cataloged in Section 4 Input Widget Inventory. Frontend UI Action steps cite verified Testkit microflows with the automatic `IsVisible` notice.
- **Compliance Status:** `PASS` or `NA`.

### [CHECK 8] Uniform 8-Field Step Sequence Schema (`PAT-12`, `PAT-34`)
- **Scope:** All Tests.
- **Verification Criteria:** Every test step in Section 5 strictly adheres to the uniform 8-field schema in exact field order:
  1. `Step Type`
  2. `Target / Entity / Action`
  3. `Input Source / Handles`
  4. `Output Variable Handle`
  5. `Parameters & Attribute Values`
  6. `Embedded Step Assertions`
  7. `Execution Settings`
  8. `Step Description & Pattern Rationale`
- **Compliance Status:** `PASS`.

### [CHECK 9] Frontend Execution Plan Quality Protocol (`PAT-41`..`PAT-53`, `PAT-67`, `ANTI-23`)
- **Scope:** Frontend UI Tests (NA for Backend).
- **Verification Criteria:** 8-point frontend verification:
  1. MTA sync probe asked / `mxcli` recursive discovery fallback used with exhaustive input widget inventory (`PAT-67`, `ANTI-23`).
  2. Required seed data analyzed.
  3. Explicit choice between creating vs retrieving seed data proposed.
  4. Multiple seed objects (2+ records) planned for entities in lists/selectors.
  5. Login/role navigation checked (`SHOW NAVIGATION`).
  6. Dynamic scalar selection piping used (`SelectValueForValue`).
  7. DatePicker offset & dateformat pattern verified against model.
  8. List filter strategies proposed (`ELO_Filter_*_by_Text`, `ELO_Nth_*_Item`).
- **Compliance Status:** `PASS` or `NA`.

### [CHECK 10] Dual-Track Execution Strategy Explicit Declaration (`PAT-60`, `PAT-62`)
- **Scope:** All Tests.
- **Verification Criteria:** Section 1 explicitly declares the Execution Strategy (Option A vs Option B for Backend; Option B Persistent MTA for Frontend). The Checkpoint 1 prompt presents the appropriate path for user choice.
- **Compliance Status:** `PASS`.

### [CHECK 11] Backend Exploratory Single-Payload Plan Blueprint (`PAT-63`, `PAT-75`, `ANTI-29`)
- **Scope:** Backend Tests with Option A (NA for Frontend or Option B).
- **Verification Criteria:** Adheres to the single-case flow with complete `TCEX_RQ_TestStepRun` JSON message blueprint. All entity fixture attributes are verified against domain model AST (`DESCRIBE ENTITY`) prior to compilation.
- **Compliance Status:** `PASS` or `NA`.

### [CHECK 12] Frontend UI to Backend Microflow Substitution Prohibition (`ANTI-20`)
- **Scope:** Frontend UI Tests (NA for Backend).
- **Verification Criteria:** All UI actions/assertions drive the browser strictly via `MenditectMxFrontendTestKit` microflows and are not substituted with backend domain microflows.
- **Compliance Status:** `PASS` or `NA`.

### [CHECK 13] Closed Catalog Frontend Testkit Verification (`PAT-64`, `ANTI-21`)
- **Scope:** Frontend UI Tests (NA for Backend).
- **Verification Criteria:** All Frontend steps strictly use verified microflows from `MenditectMxFrontendTestKit` and `MenditectPlaywrightConnector` catalogs with exact parameter signatures. Zero synthetic microflows invented.
- **Compliance Status:** `PASS` or `NA`.

### [CHECK 14] MTA Server Model Check (`PAT-82`, `ANTI-36`)
- **Scope:** All Tests.
- **Verification Criteria:** Plan drafted at local model level (`mxcli`) is audited against the MTA server via `GetAppModelData`. All planned microflows, entities, and attributes must exist in the MTA server. If any delta or missing element is detected: Option B is strictly blocked, and the plan is restricted to Option A (Exploratory Testing Only) until MTA is synchronized.
- **Compliance Status:** `PASS`.

---

## 🚦 3-Tier Alert System

The Pre-Approval Self-Audit banner at the top of the Execution Plan is rendered based on audit findings:

1. **100% Compliance / Pass (All 14 Checks Pass):**
```markdown
> [!NOTE]
> **Pre-Approval Quality Audit:** 14/14 checks executed (100% compliant)  
> **MTA Server Model Check:** Verified (All planned microflows, entities, and attributes exist in the MTA server)  
> **Category:** [Category]
```

2. **Adjusted / Minor Corrections (Corrections Applied via Conflict Audit):**
```markdown
> [!IMPORTANT]
> **Pre-Approval Quality Audit:** [X] of 14 checks executed (Corrections Applied)  
> **MTA Server Model Check:** [Verified | Out of Sync]  
> **Category:** [Category]
```

3. **Critical Violations Detected / Blocker (Violations detected that prevent execution):**
```markdown
> [!CAUTION]
> **Pre-Approval Quality Audit:** Critical Violations Detected (Plan Blocked)  
> **MTA Server Model Check:** [Verified | Out of Sync]  
> **Category:** [Category]
```