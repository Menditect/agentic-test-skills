# Standardized MTA Execution Plan Blueprint

**📍 Location:** `references/execution-plan-template.md` | **🏠 Parent:** [MTA Test Design Skill](../../mta-test-design/SKILL.md) / [MTA Build Skill](../../mta-build/SKILL.md)  
*Patterns Enforced: `PAT-06`, `PAT-07`, `PAT-08`, `PAT-11`, `PAT-12`, `PAT-18`, `PAT-34`, `PAT-43`, `PAT-44`, `PAT-54`, `PAT-59`, `PAT-60`, `PAT-64`, `PAT-67`, `PAT-77`, `PAT-82`, `PAT-88`, `PAT-91`, `PAT-92`, `PAT-93`, `PAT-94`, `PAT-95`, `PAT-110`, `PAT-111`, `PAT-124`, `ANTI-01`, `ANTI-03`, `ANTI-20`, `ANTI-21`, `ANTI-31`, `ANTI-32`, `ANTI-36`, `ANTI-42`, `ANTI-43`, `ANTI-44`, `ANTI-48`, `ANTI-57`, `ANTI-59`, `ANTI-60`, `ANTI-78`, `ANTI-80`, `ANTI-82`*

This document defines the canonical layout and schema for an approved MTA Execution Plan (`EP_<TestCaseName>.md`). Both `mta-test-design` (during plan generation) and `mta-build` (during pre-construction ingestion and post-construction smoke auditing) MUST adhere to this exact specification.

The document structure consists of:
- **Execution Plan Metadata** (collapsible metadata block)
- **## 1. Purpose & Scope**
- **## 2. Component Under Test**
- **## 3. Test Steps & Action Sequence** (visible uncollapsed Master Step Ledger table)
- **## 4. Test Scenarios & Test Data** (visible Target-Bound Variation Matrix)
- **## 5. Quality & Compliance Checks** (collapsed `<details>` 14-point audit & anti-pattern scan)
- **## 6. Verification & Build Receipt** (collapsed `<details>` post-construction 4-phase smoke audit receipt)

---

# Execution Plan: [TestCaseName]

<details>
<summary><b>Execution Plan Metadata (Click to expand)</b></summary>

```yaml
plan_id: "[TestCaseName]-v1"
schema_version: "2.1.0"
revision: 1
supersedes_plan_id: null
target: "[ModuleName].[MicroflowOrPageName]"
test_case_name: "[TestCaseName]"
category: "Backend"                  # Backend | Frontend
test_type: "Unit"
execution_target: "MTA_plugin"       # MTA_plugin | MTA
rollback: "Yes"                      # Yes | No
status: "DRAFT"                      # Values: DRAFT, AUTO_APPROVED, APPROVED, BUILT_AND_VERIFIED, REJECTED
approved_by: null
approver_system_user: null
approved_at: null
approval_turn_id: null
test_intent: "regression"            # regression | exploratory_robustness | exploratory_feature | bug_reproduction
expected_pre_fix_outcome: "PASS"     # PASS | FAIL (strictly FAIL for bug_reproduction)
protection_level: "unlocked"         # unlocked | locked (sealed by mta-lint lock)
locked_sha256: null                  # 64-character SHA-256 hash when locked
spec_source:
  type: "user_story"                 # user_story | bug_report | jira_ticket | prompt_spec
  reference: "TICKET-123"
  summary: "Verified functional expectation"
risks_covered:
  - id: "R-01"
    category: "business_logic"
    description: "Verify primary functional branch and boundary handling"
    mitigated_by_scenarios: [1, 2, 3]
created_at: "2026-10-01T12:00:00Z"
author: "Antigravity"
linter_verified: true
linter_version: "1.10.0"
target_configuration: null
target_configuration_key: null       # Populated at Gate 2 placement approval
target_suite: null
target_suite_key: null               # Populated at Gate 2 placement approval (numeric key > 0, or "NEW_SUITE" if creating a new suite)
test_case_key: null                  # Populated upon CreateTestCase in STATE_CONSTRUCTION
test_case_keys: []
build_started_at: null
built_at: null
builder_system_user: null
verified_at: null
verifier_system_user: null
playwright_browser: "Chromium"       # Chromium | Firefox | Webkit (Frontend only)
playwright_execution_mode: "Headless" # Headless | Headed (Frontend only)
playwright_slow_mo_ms: 0             # Integer >= 0 (Frontend only, default 0 per PAT-116)
frontend_options_confirmed_by_user: false # Set true after Checkpoint 2 user confirmation (Frontend only)
```

</details>

## 1. Purpose & Scope
*What this test verifies, why it matters, and how test data is isolated.*

* **Functional Scope:** [Clear description of functional requirements and behaviors being validated]
* **Robustness & Edge Cases:** [Boundary values, null/empty parameters, and edge scenarios tested]
* **Database Isolation:** [Execution settings, e.g. Backend Unit test with automatic in-memory rollback (`RollbackTcseAfterExecution = "Yes"`), or Frontend test with Case 1 synthetic seed & Case 3 reverse teardown]


### 🔒 IMMUTABLE_ASSERTION_ANCHOR (Bug Reproduction Only)
```markdown
### 🔒 IMMUTABLE_ASSERTION_ANCHOR: TARGET=[ModuleName].[MicroflowName] | ASSERT_EQUAL=[ExpectedValue]
```
*(Mandatory for `test_intent: "bug_reproduction"`. Verifies that target return assertion is permanently bound to the external bug specification and protected from tampering.)*

## 2. Component Under Test
*The Mendix microflow or page being verified, including its inputs and expected return.*

* **Target Element:** `[ModuleName].[MicroflowOrPageName]`
* **Inputs / Parameters:**
  * `$Parameter1` (`[ModuleName].[EntityName]` object)
  * `$Parameter2` (`[DataType]`, optional/nullable)
* **Output / Return:** `[DataType]` ([Description of return value or outcome])
* **Documentation & Annotations:** `@annotation: [Extracted microflow documentation or user story context]`
* **Input Widget Inventory (Frontend UI Plans):**
  | Widget Name | Widget Type | Location | Bound Attribute | Format / Options | BSON Model Path (`PAT-94`) | Testkit Locator Microflow |
  | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
  | `datePicker_BirthDate` | `DatePicker` | `Form_Main` | `Customer.BirthDate` | `Custom: dd-MM-yyyy` | `Page.widgets[name='datePicker_BirthDate'].formattingInfo.customDateFormat` | `Locate_MxWidget_DatePicker` |

## 3. Test Steps & Action Sequence
*The step-by-step sequence of object creation, actions, and assertions.*

*This single canonical ledger serves as the Single Source of Truth for both the Option A in-memory JVM compiler and Option B persistent MTA construction. All handles, bindings, and assertions are explicitly specified.*

*   **Explicit Piping Rule in Step Ledger (PAT-32):** All UI interaction steps filtering or selecting seeded data (e.g. `ELO_Filter_*`, `ACT_SelectOption_*`) must explicitly state `(SelectValueForValue)` in the table parameters column referencing the upstream seed output handle and attribute instead of hardcoding static literals.

| # | Case | Step Action & Target | Input Handle | Output Handle | Parameters, Bindings & Initial Values | Embedded Assertions | Exec Settings | Pattern Tag |
| :-: | :--: | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | Case 1 | `CreateObject` (`[ModuleName].[ParentEntity]`) | - | `step1_Parent` | `Category = 'Standard'`, `SentinelKey = 'VALID'` | - | `None` / `Stop` | `PAT-06` |
| **2** | Case 1 | `RetrieveObject` (`[ModuleName].[ParentEntity]`) | `step1_Parent` | `step2_Parent` | `RetrieveOption = "Teststep"`, *In-Memory Filter:* `SentinelKey = 'VALID'` | `Assert Object Count == 1` | `None` / `Stop` | `PAT-07`, `PAT-08` |
| **3** | Case 1 | `CreateObject` (`[ModuleName].[HostEntity]`) | - | `step3_Host` | `Attr1 = 'TEST_001'`, `Host_Parent = step2_Parent`, `SentinelKey = 'VALID'` | - | `None` / `Stop` | `PAT-06` |
| **4** | Case 1 | `RetrieveObject` (`[ModuleName].[HostEntity]`) | `step3_Host` | `step4_Host` | `RetrieveOption = "Teststep"`, *In-Memory Filter:* `SentinelKey = 'VALID'` | `Assert Object Count == 1` | `None` / `Stop` | `PAT-07`, `PAT-08` |
| **5** | Case 1 | `CallMicroflow` (`[ModuleName].[MicroflowName]`) | `step4_Host` | `resultHandle` | `HostParam = step4_Host` | `Assert Return Value == true` | `None` / `Stop` | `PAT-14`, `PAT-17` |

## 4. Test Scenarios & Test Data
*The business situations to verify, with inputs and expected outcomes for each scenario.*

| # | Step Target | Scenario #1 (Baseline) | Scenario #2 (Unassigned Parent) | Scenario #3 (Null Host Parameter) |
| :---: | :--- | :--- | :--- | :--- |
| **0** | **Scenario Name** | Standard Baseline | Unassigned Parent Association | Null Host Parameter Fallback |
| **0** | **Scenario Description** | Standard active verification | Parent association is unassigned/null | Host parameter object is null |
| 1 | Step 1: `ParentEntity.Category` | `'Standard'` | `'Standard'` | `'Standard'` |
| 2 | Step 2: Filter `ParentEntity.SentinelKey` | `'VALID'` | `'NONE'` | `'VALID'` |
| 3 | Step 3: `HostEntity.Attr1` | `'TEST_001'` | `'TEST_001'` | `'TEST_001'` |
| 4 | Step 4: Filter `HostEntity.SentinelKey` | `'VALID'` | `'VALID'` | `'NONE'` |
| 5 | Step 5: Assert Return Value | `true` | `false` | `false` |

## 5. Quality & Compliance Checks
*Automated rules and best-practice checks validated before running or building.*

<details>
<summary><b>View automated quality checks (Click to expand)</b></summary>

### 14-Point Pre-Approval Structural Assertions
* [x] **Check 1 (Frontend Split / Backend Settings & Direct Init):** Backend Unit Test -> `ExecutionCondition = "None"`, `ResumeExecutionAfterException = "Stop"`; initial attributes initialized directly on CreateObject (`PAT-06`, `PAT-17`, `ANTI-01`).
* [x] **Check 2 (TestCase Container & Execution User):** Rollback and `ExecutorUsername` explicitly configured at container level; zero assertions on Create/Change steps (`PAT-10`, `PAT-79`).
* [x] **Check 3 (Object Lifecycle & Rollback Architecture):** Automatic transaction rollback (`Rollback = "Yes"`) or synthetic key teardown (`PAT-17`, `PAT-95`, `ANTI-47`).
* [x] **Check 4 (Setup Portability):** Relative logical paths used (`NA` for Backend) (`PAT-28`, `PAT-41`).
* [x] **Check 5 (Filter Sentinels, Matrix & Scenarios):** SentinelKey used in RetrieveObject for null/empty variations (`PAT-07`), target-bound rows (`PAT-110`), zero association rows (`ANTI-48`), and explicit scenario names/descriptions (`PAT-77`).
* [x] **Check 6 (Embedded Assertions & Count Parity):** Assertions embedded inside host Retrieve/Microflow steps (`Assert Object Count == 1` on piped retrieves) (`PAT-08`, `PAT-14`, `ANTI-03`).
* [x] **Check 7 (Mandatory Page & Widget Discovery):** Page/Widget AST verified (`NA` for Backend) (`PAT-35`, `PAT-67`).
* [x] **Check 8 (Master Step Ledger & Wire Enum Tokens):** Single canonical step ledger in Section 3 with exact wire enum tokens; zero unrolled duplicate sequences (`PAT-100`, `PAT-111`, `ANTI-60`).
* [x] **Check 9 (Frontend Quality, Piping & Teardown Sequencing):** Seed data, BSON date formats (`PAT-94`), explicit scalar piping (`SelectValueForValue` on `ELO_Filter_*` / `ACT_SelectOption_*`) (`PAT-32`), post-submit validation sequencing (`PAT-119`), and Case 3 teardown of runtime-created entities (`PAT-92`) verified (`NA` for Backend).
* [x] **Check 10 (Dual-Track Strategy & Suite Collision Audit):** Execution strategy declared in Section 1; suite collision gate (`PAT-101`, `PAT-123`) enforced.
* [x] **Check 11 (Backend Exploratory & Promotable Blueprint):** Single-case promotable blueprint verified against domain model AST (`PAT-75`, `PAT-111`, `ANTI-48`).
* [x] **Check 12 (Frontend UI to Backend Microflow Ban):** Zero backend microflows substituted for UI interactions (`NA` for Backend) (`ANTI-20`).
* [x] **Check 13 (Closed Catalog Testkit Verification):** Verified Testkit microflows and synthetic `'TEST_'` data isolation (`PAT-64`, `ANTI-21`).
* [x] **Check 14 (MTA Server Model Parity & Active MCP Discovery):** Active MCP tool catalog and model parity verified (`PAT-82`, `ANTI-36`).

### Pre-Sign-Off Negative Anti-Pattern Scan
* [x] **ANTI-01 Verified:** 0 `Change Object` steps immediately following `Create Object`.
* [x] **ANTI-48 Verified:** 0 association bindings or object handles in Section 4 variation rows.
* [x] **ANTI-44 Verified:** Step creation sequence is strictly forward (zero parallel reordering calls).
* [x] **ANTI-20 Verified:** Zero backend domain microflows used to substitute UI interactions.

</details>

## 6. Verification & Build Receipt
*Audit confirmation verifying that the constructed test matches this plan with zero errors.*

<details>
<summary><b>View post-build audit details (Click to expand)</b></summary>

*(Populated after construction or test execution in `STATE_SMOKE_AUDIT` via `mta-lint audit`)*
* **Phase 1 (Step Count Parity):** Planned: 5 | Server: 5 | Status: `PASS`
* **Phase 2 (Variation Item Registration):** Planned: 5 | Registered: 5 | Status: `PASS`
* **Phase 3 (Scenario Metadata):** Columns: 3 | Descriptions Populated: 3/3 | Status: `PASS`
* **Phase 4 (Cell Value Parity):** 15/15 cells reconciled | Discrepancies: 0 | Status: `PASS`
* **MTA Construction Errors:** `TCER_TestConstructionErrors == 0` | Status: `PASS`

### Direct MTA Web Navigation Links
| MTA Asset Type | Asset Name | Database Key | Direct MTA Web Link |
| :--- | :--- | :---: | :--- |
| **Test Configuration** | `[ConfigName]` | `[ConfigKey]` | [Open Configuration]([MtaBaseUrl]/p/testconfiguration/[ConfigKey]) |
| **Test Suite** | `[SuiteName]` | `[SuiteKey]` | [Open Suite]([MtaBaseUrl]/p/testsuite/[SuiteKey]) |
| **Test Case** | `[TestCaseName]` | `[TestCaseKey]` | [Open Test Case]([MtaBaseUrl]/p/testcase/[TestCaseKey]) |

</details>
