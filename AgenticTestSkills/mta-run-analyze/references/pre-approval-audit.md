# 14-Point Pre-Approval Quality Audit Protocol

**📍 Location:** `references/pre-approval-audit.md` | **🏠 Parent:** [MTA Test Design Skill](../../mta-test-design/SKILL.md) / [MTA Build Skill](../../mta-build/SKILL.md)  
*Patterns Enforced: `PAT-03`, `PAT-06`, `PAT-07`, `PAT-08`, `PAT-10`, `PAT-11`, `PAT-12`, `PAT-16`, `PAT-18`, `PAT-19`, `PAT-20`, `PAT-27`, `PAT-28`, `PAT-34`, `PAT-35`, `PAT-41`, `PAT-42`, `PAT-53`, `PAT-54`, `PAT-60`, `PAT-63`, `PAT-64`, `PAT-65`, `PAT-67`, `PAT-75`, `PAT-77`, `PAT-82`, `PAT-89`, `PAT-91`, `PAT-92`, `PAT-93`, `PAT-94`, `PAT-95`, `PAT-96`, `ANTI-01`, `ANTI-03`, `ANTI-08`, `ANTI-11`, `ANTI-20`, `ANTI-21`, `ANTI-23`, `ANTI-29`, `ANTI-31`, `ANTI-36`, `ANTI-41`, `ANTI-42`, `ANTI-43`, `ANTI-44`, `ANTI-45`, `ANTI-46`*

This reference document defines the complete 14-point Pre-Approval Quality Audit protocol required before presenting any Execution Plan to the user in `STATE_BUILD_PLANNING` or proceeding to Checkpoint 1 review.

---

## 📋 The 14 Verification Checks

### [CHECK 1] Frontend Split, Self-Contained Seeding & Symmetric Teardown Law (`PAT-18`, `PAT-03`, `PAT-91`, `PAT-92`, `PAT-93`, `ANTI-42`, `ANTI-43`)
- **Scope:** Frontend UI Tests (NA for Backend).
- **Verification Criteria:** 
  1. Setup and teardown steps MUST be separated into distinct test cases: Case 1 Setup (`ExecutionCondition = "Always"`), Case 2 Execute, and Case 3 Teardown (`ExecutionCondition = "Always"`, `ResumeExecutionAfterException = "_Continue"`).
  2. Case 1 Setup MUST include explicit database seeding (`Create Object` + batch `Persist` steps) for all transactional domain entities bound to target page widgets before browser startup (`PAT-91`).
  3. Static master / reference data (e.g. Countries, Currencies, Roles) is exempt from mandatory creation; clean `Retrieve` steps with attribute filters are authorized (`PAT-91`).
  4. All seeded records MUST use unique synthetic identifiers (e.g. `'TEST_'` prefixes) to prevent collision with dirty database leftovers (`PAT-91`).
  5. Precondition text alone can NEVER substitute for test steps, and copying legacy unseeded test cases from the server is strictly prohibited (`ANTI-42`).
  6. **Symmetric Teardown Invariant (`PAT-92`, `ANTI-43`):** All transactional entities instantiated during Case 1 setup MUST be deleted in Case 3 teardown via direct cross-case handle piping (`ObjectAction = "DeleteObjects"`, `TestStepOutputKey = Case1_CreateStepKey`) without redundant database retrieves. In contrast, runtime transactional records created by the browser during Case 2 MUST be retrieved from the database with explicit synthetic attribute filters prior to deletion. The teardown deletion pipeline concludes with a mandatory trailing batch `Persist` step (`ObjectAction = "Persist"`, `ExecutionCondition = "Always"`, `ResumeExecutionAfterException = "_Continue"`) at the end of the deletion block to commit all deletions to the database. Enforces $\text{Entities}(\text{Case 3 Purge}) == \text{Entities}(\text{Case 1 Seed}) \cup \text{Entities}(\text{Case 2 Runtime Created})$. Cleaning up only runtime data while leaking seeded master data is strictly prohibited (`ANTI-43`).
  7. **Reverse Dependency Order Deletion (`PAT-93`):** Case 3 teardown delete steps must be sequenced in reverse association dependency order ($\text{Leaf / Child} \rightarrow \text{Intermediate Associations} \rightarrow \text{Root Categories}$).
- **Compliance Status:** `PASS` or `NA`.

### [CHECK 2] TestCase Container Formatting & Execution User (`PAT-10`, `PAT-79`)
- **Scope:** All Tests.
- **Verification Criteria:** Rollback settings and Validation Feedback assertions are formatted strictly at the TestCase container level. `EXUS_ExecutionUser` (or `ExecutorUsername`) is explicitly assigned. No embedded assertions are placed on Create Object or Change Object steps.
- **Compliance Status:** `PASS`.

### [CHECK 3] Backend Direct Piping Deletes (`PAT-95`)
- **Scope:** Backend Tests (NA for Frontend).
- **Verification Criteria:** Backend-created objects are deleted via direct variable handle piping (`TestStepOutputKey` passed at creation) without redundant database `Retrieve` steps.
- **Compliance Status:** `PASS` or `NA`.

### [CHECK 4] Setup Portability (`PAT-28`, `PAT-41`)
- **Scope:** Frontend UI Tests (NA for Backend).
- **Verification Criteria:** All browser setup paths utilize relative logical paths (e.g., `/index.html`, `/login.html`) rather than hardcoded absolute host URLs.
- **Compliance Status:** `PASS` or `NA`.

### [CHECK 5] Explicit Filter Attributes, Input Handles & Variation Matrix (`PAT-07`, `PAT-19`, `PAT-27`, `PAT-53`, `PAT-54`, `PAT-77`, `ANTI-08`, `ANTI-11`, `ANTI-31`)
- **Scope:** All Tests.
- **Verification Criteria:** 
  1. `Retrieve` steps specify `Input Handle Source`.
  2. Parameters/associations requiring empty/NULL variations use `Retrieve` with an explicit attribute filter and short $\le 4$-character sentinels (`'NONE'`, `'NULL'`) complying with the Universal Short Sentinel Law (`PAT-53`).
  3. **Attribute Constraint & Length Verification (`PAT-53`):** All literal values specified in Section 5 (step parameters) and Section 7 (variation matrix) are audited against Mendix Domain Model constraints (`SHOW ENTITY`, `DESCRIBE ENTITY`, or `GetAppModelData`). Specifically verify that string length $\le$ maximum length configured on the entity attribute (e.g., verifying `String(8)` limits before proposing test data).
  4. The Data Variation Matrix adheres to horizontal layout capped at 8 columns and includes the `Domain Type / Constraint` column. Every variation includes full scenario Name and Description metadata (`PAT-77`, `ANTI-31`).
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
- **Verification Criteria:** 
  1. Every detailed test step in Section 5 (`### Detailed Step Configurations & Assertions`) strictly adheres to the uniform 8-field schema in exact field order:
     1. `Step Type`
     2. `Target / Entity / Action`
     3. `Input Source / Handles`
     4. `Output Variable Handle`
     5. `Parameters & Attribute Values`
     6. `Embedded Step Assertions`
     7. `Execution Settings`
     8. `Step Description & Pattern Rationale`
  2. The high-level `Step Sequence Matrix` overview table and any Executive Summary step tables display the concise 7 operational columns (`Step #`, `Case`, `Step Type`, `Target Element / Action`, `Input Source`, `Output Handle`, `Exec Settings`), omitting the verbose narrative rationale column to maintain clean, readable table layouts without text wrapping.
- **Compliance Status:** `PASS`.

### [CHECK 9] Frontend Execution Plan Quality Protocol (`PAT-41`..`PAT-53`, `PAT-67`, `PAT-91`, `PAT-92`, `PAT-93`, `PAT-94`, `ANTI-23`, `ANTI-42`, `ANTI-43`, `ANTI-45`)
- **Scope:** Frontend UI Tests (NA for Backend).
- **Verification Criteria:** 8-point frontend verification:
  1. MTA sync probe asked / `mxcli` recursive discovery fallback used with exhaustive input widget inventory (`PAT-67`, `ANTI-23`).
  2. Required seed data analyzed.
  3. Self-contained Case 1 seeding steps (`Create Object` + batch `Persist`) planned by default for transactional entities, with permitted `Retrieve` for static master reference data and unique synthetic keys (`PAT-91`, `ANTI-42`, omitted ONLY if user explicitly commanded 'use existing data').
  4. Multiple seed objects (2+ records) planned for entities in lists/selectors (`PAT-40`).
  5. Login/role navigation checked (`SHOW NAVIGATION`).
  6. Dynamic scalar value piping used (`SelectValueForValue` referencing Case 1 seed handles) across all form inputs, search filters, dropdowns, and UI assertions consuming seeded data.
  7. **DatePicker Format & Offset Model Verification (`PAT-42`, `PAT-94`, `ANTI-45`):** When using `mxcli` for model discovery, the exact `CustomDateFormat` (or project language date format) MUST be extracted via `mxcli bson dump` command:
     `.\mxcli.bat bson dump -p "[project.mpr]" --type page --object "<Module>.<Page>" --format json`
     Guessing or defaulting format strings without model proof is strictly prohibited (`ANTI-45`).
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

### [CHECK 14] MTA Server Model Parity & Active MCP Server Discovery (`PAT-82`, `PAT-53`, `ANTI-36`)
- **Scope:** All Tests.
- **Verification Criteria:** 
  1. **Active Tool Catalog & MCP Server Discovery:** In all AI environments (MAIA, Gemini, Claude, Cursor, Antigravity) and execution modes, inspect the active tool catalog in the current session:
     - *If `MTA` platform tools are not registered in the tool catalog (e.g. in MAIA with only `MTA_plugin` configured) or unreachable:* Check 14 is `BLOCKED (MTA Server Not Registered / Unavailable | Plugin Active)`. Option B is strictly blocked (`ANTI-36`). Option A remains active for Backend tests. Present Checkpoint 1 Case 1.
     - *If `MTA_plugin` is unregistered or unreachable (connection refused `ECONNREFUSED` / offline):* Option A (Local Exploratory Testing) is blocked.
     - *If BOTH are unreachable (Dual Outage):* Status is `BLOCKED (Both MCP Servers Offline)`. Both execution routes are blocked. The plan is stored locally as `status: "DRAFT"` with metadata in `mta_state.json`. Present Checkpoint 1 Case 4.
  2. **Model Parity Audit:** When the `MTA` MCP server is registered and live, audit the plan drafted at local model level (`mxcli`) against the MTA server via read-only `GetAppModelData`. All planned microflows, entities, and attributes must exist in the active MTA server revision, and domain model constraint parity is verified (e.g., verifying `StringLimitedMaxLength` from `GetAppModelData` matches planned test values). If any delta or missing element is detected, status is `BLOCKED (Model Delta / Out of Sync)` and Option B is strictly blocked.
  3. **Resumption & Retry Parity Law:** When resuming an offline draft plan created during an outage or retrying Option B, Check 14 (`GetAppModelData`) MUST be re-executed before proceeding to placement discovery (`PLAN_STEP_2`) or test construction.
- **Compliance Status:** `PASS (Both Active & In-Sync)`, `PASS (MTA Verified) | BLOCKED (Plugin Offline)`, `BLOCKED (MTA Not Registered / Unavailable | Plugin Active)`, or `BLOCKED (Both MCP Servers Offline)`.

---

## 🚦 3-Tier Alert System

The Pre-Approval Self-Audit banner at the top of the Execution Plan is rendered based on audit findings:

1. **100% Compliance / Pass (All 14 Checks Pass):**
```markdown
> [!NOTE]
> **Pre-Approval Quality Audit:** 14/14 checks executed (100% compliant)  
> **MTA Server Availability & Model Check:** Verified (MTA MCP server active, all planned elements exist in server revision)  
> **Category:** [Category]
```

2. **Adjusted / Minor Corrections (Corrections Applied via Conflict Audit):**
```markdown
> [!IMPORTANT]
> **Pre-Approval Quality Audit:** [X] of 14 checks executed (Corrections Applied)  
> **MTA Server Availability & Model Check:** [Verified | Out of Sync | MTA MCP Server Unavailable]  
> **Category:** [Category]
```

3. **Critical Violations Detected / Blocker (Violations detected that prevent execution):**
```markdown
> [!CAUTION]
> **Pre-Approval Quality Audit:** Critical Violations Detected (Plan Blocked)  
> **MTA Server Availability & Model Check:** [Verified | Out of Sync | MTA MCP Server Unavailable]  
> **Category:** [Category]
```