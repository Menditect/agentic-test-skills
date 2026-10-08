# Standardized MTA Execution Plan Blueprint

**📍 Location:** `references/execution-plan-template.md` | **🏠 Parent:** [MTA Test Design Skill](../../mta-test-design/SKILL.md) / [MTA Build Skill](../../mta-build/SKILL.md)  
*Patterns Enforced: `PAT-06`, `PAT-07`, `PAT-08`, `PAT-11`, `PAT-12`, `PAT-18`, `PAT-34`, `PAT-43`, `PAT-44`, `PAT-54`, `PAT-59`, `PAT-60`, `PAT-64`, `PAT-67`, `PAT-77`, `PAT-82`, `PAT-88`, `PAT-91`, `PAT-92`, `PAT-93`, `PAT-94`, `PAT-95`, `PAT-110`, `PAT-111`, `ANTI-01`, `ANTI-03`, `ANTI-20`, `ANTI-21`, `ANTI-31`, `ANTI-32`, `ANTI-36`, `ANTI-42`, `ANTI-43`, `ANTI-44`, `ANTI-48`, `ANTI-57`, `ANTI-59`, `ANTI-60`*

This document defines the canonical layout and schema for an approved MTA Execution Plan (`EP_<TestCaseName>.md`). Both `mta-test-design` (during plan generation) and `mta-build` (during pre-construction ingestion and post-construction smoke auditing) MUST adhere to this exact specification.

The document structure consists of:
- **Test Plan Details & Tracking** (collapsible metadata block)
- **## 1. Purpose & Scope**
- **## 2. Component Under Test**
- **## 3. Test Steps & Action Sequence** (collapsed `<details>` ledger)
- **## 4. Test Scenarios & Test Data** (visible Target-Bound Variation Matrix)
- **## 5. Quality & Compliance Checks** (collapsed `<details>` 14-point audit & anti-pattern scan)
- **## 6. Verification & Build Receipt** (collapsed `<details>` post-construction 4-phase smoke audit receipt)

---

# Execution Plan: [TestCaseName]

<details>
<summary><b>Test Plan Details & Tracking (Click to expand)</b></summary>

```yaml
plan_id: "[TestCaseName]-v1"
schema_version: "2.0.0"
target: "[ModuleName].[MicroflowOrPageName]"
category: "Backend"
test_type: "Unit"
execution_target: "MTA_plugin"
rollback: "Yes"
status: "DRAFT"
created_at: "2026-10-01T12:00:00Z"
author: "Antigravity"
linter_verified: true
linter_version: "1.0.0"
target_configuration_key: null
target_suite_key: null
test_case_keys: []
```

</details>

## 1. Purpose & Scope
*What this test verifies, why it matters, and how test data is isolated.*

* **Functional Scope:** [Clear description of functional requirements and behaviors being validated]
* **Robustness & Edge Cases:** [Boundary values, null/empty parameters, and edge scenarios tested]
* **Database Isolation:** [Execution settings, e.g. Backend Unit test with automatic in-memory rollback (`RollbackTcseAfterExecution = "Yes"`), or Frontend test with Case 1 synthetic seed & Case 3 reverse teardown]

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

<details>
<summary><b>View detailed step specifications (Click to expand)</b></summary>

*This single canonical ledger serves as the Single Source of Truth for both the Option A in-memory JVM compiler and Option B persistent MTA construction. All handles, bindings, and assertions are explicitly specified.*

| # | Case | Step Action & Target | Input Handle | Output Handle | Parameters, Bindings & Initial Values | Embedded Assertions | Exec Settings | Pattern Tag |
| :-: | :--: | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | Case 1 | `CreateObject` (`[ModuleName].[Entity1]`) | - | `entityHandle` | `Attr1 = 'TEST_001'`, `Status = StatusEnum.Active` | - | `None` / `Stop` | `PAT-06` |
| **2** | Case 1 | `CreateObject` (`[ModuleName].[Entity2]`) | - | `seedHandle` | `Category = 'Standard'`, `SentinelKey = 'VALID'` | - | `None` / `Stop` | `PAT-06`, `PAT-07` |
| **3** | Case 1 | `RetrieveObject` (`[ModuleName].[Entity2]`) | - | `filterHandle` | *In-Memory Filter:* `SentinelKey = 'VALID'` | `Assert Object Count == 1` | `None` / `Stop` | `PAT-07`, `PAT-08` |
| **4** | Case 1 | `CallMicroflow` (`[MicroflowName]`) | `entityHandle`, `filterHandle` | `resultHandle` | `Param1 = entityHandle`, `Param2 = filterHandle` | `Assert Return Value == true` | `None` / `Stop` | `PAT-14`, `PAT-17` |

</details>

## 4. Test Scenarios & Test Data
*The business situations to verify, with inputs and expected outcomes for each scenario.*

| # | Step Target | Scenario #1 (Baseline) | Scenario #2 (Boundary) | Scenario #3 (Null Sentinel) |
| :---: | :--- | :--- | :--- | :--- |
| **0** | **Scenario Name** | Standard Baseline | Boundary Limit | Null Sentinel Fallback |
| **0** | **Scenario Description** | Standard active customer verification | Boundary threshold condition | Unassigned parameter fallback |
| 1 | Step 1: `Entity1.Attr1` | `'TEST_001'` | `'TEST_002'` | `'TEST_003'` |
| 2 | Step 2: `Entity2.Category` | `'Standard'` | `'Premium'` | `'Standard'` |
| 3 | Step 3: Filter `Entity2.SentinelKey` | `'VALID'` | `'VALID'` | `'NONE'` |
| 4 | Step 4: Assert Return Value | `true` | `true` | `false` |

## 5. Quality & Compliance Checks
*Automated rules and best-practice checks validated before running or building.*

<details>
<summary><b>View automated quality checks (Click to expand)</b></summary>

### 14-Point Pre-Approval Structural Assertions
* [x] **Check 1 (Scope & Microflow Signature):** Verified via `mxcli describe microflow [TargetMicroflow]`.
* [x] **Check 2 (Category & Settings):** Backend Unit Test -> `ExecutionCondition = "None"`, `ResumeExecutionAfterException = "Stop"`.
* [x] **Check 3 (Direct Attribute Init):** Initial attributes initialized directly on CreateObject (`PAT-06`). Zero `Change Object` steps (`ANTI-01`).
* [x] **Check 4 (Null/Empty Sentinel):** SentinelKey used in RetrieveObject to deliver null/empty parameter variations safely (`PAT-07`).
* [x] **Check 5 (Object Count Assertion):** Embedded in sentinel RetrieveObject step (`Assert Object Count == 1`) (`PAT-08`).
* [x] **Check 6 (Single Master Ledger):** Exactly 1 canonical sequence; zero unrolled duplicate sequences (`PAT-111`, `ANTI-60`).
* [x] **Check 7 (Target-Bound Matrix):** All matrix rows bound to concrete step targets (`PAT-110`).
* [x] **Check 8 (Zero Association Rows):** Association rows count: 0 (`ANTI-48`).
* [x] **Check 9 (Scenario Descriptions):** All scenarios have explicit, non-empty names and descriptions (`PAT-77`).
* [x] **Check 10 (Embedded Assertions):** Assertions embedded directly inside host action steps (`PAT-14`).
* [x] **Check 11 (Execution Strategy Gating):** Target strategy explicitly declared.
* [x] **Check 12 (Synthetic Key Isolation):** Synthetic `'TEST_'` prefixes used to isolate test data.
* [x] **Check 13 (Lineage & Discovery):** Fresh plan generated without stale state.
* [x] **Check 14 (Active MCP Discovery):** Verified active tool catalog.

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
* **Phase 1 (Step Count Parity):** Planned: 4 | Server: 4 | Status: `PASS`
* **Phase 2 (Variation Item Registration):** Planned: 4 | Registered: 4 | Status: `PASS`
* **Phase 3 (Scenario Metadata):** Columns: 3 | Descriptions Populated: 3/3 | Status: `PASS`
* **Phase 4 (Cell Value Parity):** 12/12 cells reconciled | Discrepancies: 0 | Status: `PASS`
* **MTA Construction Errors:** `TCER_TestConstructionErrors == 0` | Status: `PASS`

### Direct MTA Web Navigation Links
| MTA Asset Type | Asset Name | Database Key | Direct MTA Web Link |
| :--- | :--- | :---: | :--- |
| **Test Configuration** | `[ConfigName]` | `[ConfigKey]` | [Open Configuration]([MtaBaseUrl]/p/testconfiguration/[ConfigKey]) |
| **Test Suite** | `[SuiteName]` | `[SuiteKey]` | [Open Suite]([MtaBaseUrl]/p/testsuite/[SuiteKey]) |
| **Test Case** | `[TestCaseName]` | `[TestCaseKey]` | [Open Test Case]([MtaBaseUrl]/p/testcase/[TestCaseKey]) |

</details>
