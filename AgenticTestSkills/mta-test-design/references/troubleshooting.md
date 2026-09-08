# MTA Troubleshooting & Diagnostics
**📍 You are here:** `references/troubleshooting.md` | **🏠 Return to:** [MTA Core Skill](../SKILL.md)
*Metadata: Version 3.0 | Last Updated: 2026-09-02*

Reference for diagnosing, resolving test run failures, sequence compilation errors, and performance blocks in MTA using the consolidated 53-tool MTA-ACCP API (`/primitivetools/mcp`).

---

## 📊 FREQUENCY & PRIORITY MATRIX
Check failing patterns in priority order:

| Issue Pattern | Frequency | Check Priority | Primary Resolution Action |
| :--- | :--- | :--- | :--- |
| **Date Format Casing** | Very High | 🔥 **Check First** | Apply auto-correction casing conversions (e.g., `mm` ➔ `MM`). |
| **Missing Parameter Binding** | High | ⚠️ **Check Second** | Link parameter outputs via `EditMicroflowObjectParameter` or set values via `EditMicroflowParameterValue`. |
| **Visibility Expression Block** | Medium | 📌 **Check Third** | Evaluate the Mendix conditional visibility expression against active entity state. |
| **Reversed Options Order** | Medium | 📌 **Check Fourth** | Construct parameter/option objects *before* the consuming microflow call. |
| **Race Conditions** | Low | 🔍 **Check Last** | Enforce sequential chaining with `TestStepBeforeKey`. |

---

## 🧭 REVERSE TRACING HALT BOUNDARIES (5-STEP RULE)
Visibility and Locator errors (`Widget not found`, `Element not visible`) are usually consequential failures from upstream steps that passed the runner but failed state modification or database validations. 

Trace backward from the failed step until you hit any of these boundaries:
*   🛑 **STOP #1: Page Navigation** (`ACT_Open_Page`, `Navigate_To_Page`, `ACT_Click_Close_Button`)
    *   *Why:* Page navigation resets the active DOM context.
*   🛑 **STOP #2: Database Commit** (Microflows containing `CommitObject` or state-modifying commits)
    *   *Why:* Commits freeze entity states; pre-commit steps cannot affect post-commit states.
*   🛑 **STOP #3: Max 5 Steps Backward**
    *   *Why:* 94% of cascade step failures originate within the immediate 5-step window.

### Mandatory Cascade Diagnostic Report Format
When reporting a cascading failure, you **MUST** output:
1. **The Symptom:** Exact step index, name, and low-level error.
2. **The Cascade Map:** Flow diagram mapping causal chain from Step X ➔ Step Y ➔ Step Z.
3. **Evidence & Audit Details:** Exact visibility expression, actual attribute state, and validation split in the model.
4. **Concrete Proposed Fixes:** Exact adjustments (e.g., change Date format from `MM/dd/yyyy` to `dd-MM-yyyy`).

---

## 📅 DATE FORMAT CASING LAW & AUTO-CORRECTION
Date-picker format patterns are strictly case-sensitive:

| Token | Meaning | Context Validity |
| :--- | :--- | :--- |
| `MM` | Month (01-12) | ✅ Valid Date context |
| `mm` | Minute (00-59) | ❌ Invalid Date-only context (minutes) |
| `dd` | Day (01-31) | ✅ Valid Date context |
| `yyyy` | Year | ✅ Valid Date context |

### Auto-Correction Actions
Before setting test parameters or reporting formats, convert JSON-serialized date formats:
*   `dd-mm-yyyy` ➔ `dd-MM-yyyy`
*   `mm/dd/yyyy` ➔ `MM/dd/yyyy`
*   `yyyy-mm-dd` ➔ `yyyy-MM-dd`
*   `yyyy-mm-dd HH:mm:ss` ➔ `yyyy-MM-dd HH:mm:ss`
*   `yyyy-mm-dd hh:mm:ss` ➔ `yyyy-MM-dd HH:mm:ss`

---

## 🚨 CONSTRUCTION & COMPILATION ERROR PATTERNS

### Pattern A: Reversed Object Creation Order
*   **Root Cause:** Consuming microflow occurs before the creation of the required parameter object.
*   **Resolution:**
    1.  Call `SetSequenceOfTestStep` to move the creation step before the consuming microflow step.
    2.  Alternatively, recreate steps in forward order: `CreateObjectActionTestStep(ObjectAction="CreateObject")` ➔ `EditAttributeValue` ➔ `CreateMicroflowCallTestStep` (binding parameter via `EditMicroflowObjectParameter`).

### Pattern B: Missing Parameter Binding
*   **Root Cause:** Microflow parameter object has no input binding.
*   **Resolution:**
    1.  Call `GetTeststepDetails(TestStepKey)` to identify parameter keys.
    2.  Call `EditMicroflowObjectParameter(EditAction="SetTestStepOutput", SelectObjectForMicroflowParameterKey=..., TestStepOutputKey=ProducerStepKey)`.
    3.  If parameter should be empty/null, call `EditMicroflowObjectParameter(EditAction="SetEmpty", SelectObjectForMicroflowParameterKey=...)`.
    4.  If parameter is a primitive literal, call `EditMicroflowParameterValue(...)`.

### Pattern C: Skipped Data Provider
*   **Root Cause:** Downstream consumer is executed while its upstream data provider is skipped.
*   **Rule (Cascading Consumer Rule):** If a teststep is set to `"Skip"`, all receiving consumer steps must also be set to `"Skip"` via `EditTestStep(ExecutionCondition="Skip")`.

---

## 🛠️ RUNTIME & DESIGN-TIME DIAGNOSTICS

### 1. Test Run Results & Assertion Inspection (Context-Preserving Drill-Down Protocol - PAT-83)
When diagnosing test execution failures, you **MUST** follow the two-step drill-down protocol (`PAT-83`) to prevent context exhaustion and token bloat (`ANTI-37`):
*   **Step 1: High-Level Summary Inspection (`GetTestRunSummary`):**
    Call `GetTestRunResults(TestRunExecutionId, RetrieveAction="GetTestRunSummary")` immediately after `ExecuteTest` completes. Inspect the overall execution status and extract the specific failing test case keys (`TestCaseRunKey`).
*   **Step 2: Targeted Failure Receipt Retrieval (`GetTestCaseRunDetails`):**
    For each failing test case, call `GetTestRunResults(TestRunExecutionId, RetrieveAction="GetTestCaseRunDetails", TestCaseRunKey=<numeric_key>)` to retrieve isolated step execution receipts, error messages, and logs strictly for that test case.
*   **Step 3: Detailed Step Configuration Audit:**
    Call `GetTeststepDetails(TestStepKey)` on the failing step to inspect full configuration, attribute filters, parameter bindings, and embedded assertions.
*   **Anti-Pattern Warning (`ANTI-37`):** Never call `GetTestRunResults(RetrieveAction="GetTestRunDetails")` blindly across an entire suite or configuration, as monolithic JSON dumps can contain tens of thousands of lines and exhaust context windows.

### 2. Auditing Test Cases & Variations
*   **`GetTestCaseDetails(TestCaseKey)`**: Retrieves the complete recursive tree of teststeps, parameters, assertions, and data variations.
*   **`GetTestSuiteDetails(TestSuiteKey)`**: Retrieves test suite hierarchy and global variations.

---

## ⚡ PERFORMANCE TROUBLESHOOTING
*   **SlowMo Adjustment:** Local default is `100ms`. Remote headless runs should use `0ms`.
*   **Timeout Adjustment:** Default is `30,000ms`. Increase for complex workflows.
*   **Trace Optimization:** Disable trace for high-volume smoke runs.

---

## 🧪 ISOLATED VERIFICATION LAW (FASTER FEEDBACK LOOP)

When building or fixing tests, running a full test configuration (`ExecuteTest(ExecutionLevel="TestConfiguration")`) can be slow and execute unrelated suites. 
*   **The Single Case / Suite Rule:** You **MUST** proactively recommend and use either single test case execution (`ExecuteTest(ExecutionLevel="TestCase")`) or single-suite execution (`ExecuteTest(ExecutionLevel="TestSuite")`) when verifying your changes.
    *   **Single Test Case Execution (`ExecuteTest` with `ExecutionLevel="TestCase"`):** This is the **absolute fastest and most isolated way** to dry-run or verify your active work. It runs exactly one test case (`TestCaseKey`) in isolation on the environment (`ApplicationInstanceToken`), completely bypassing all other test cases in the suite and configuration.
    *   **Single Suite Execution (`ExecuteTest` with `ExecutionLevel="TestSuite"`):** Use this when verifying the interactions or sequence of multiple related test cases within the same suite (`TestSuiteKey`).
*   **Why:** These scoped calls isolate execution strictly to your active work, avoid noise or failures from other suites/cases, reduce execution queue times, and complete significantly faster.
*   **When to suggest:**
    1. During `STATE_CONSTRUCTION` when doing dry runs or teststep verification (highly recommend `ExecuteTest`).
    2. During `STATE_RUN_ANALYZE` as the primary method of verifying the newly built test case.
    3. During troubleshooting when verifying that an applied fix has resolved a specific error.

---

## 🤖 FAILURE RETRIEVAL ENFORCEMENT LAW (AUTOMATIC RUN)
If a test run contains any failed/errored steps:
1. **Do not** just print the failure message and stop.
2. **Automatically trigger** the Proactive Mendix Model Comparison Analysis.
3. Systematically query the local model, compare formats/validations, trace state changes backwards, and output the **Cascade Diagnostic Analysis Report** immediately in your single response.

---

## 🔍 SINGLE-SESSION MATRIX STATE CONTAMINATION DIAGNOSTICS (`PAT-74` / `ANTI-28`)

When executing chained exploratory data variations in a single payload via `MTA_plugin.execute-testcase` (`PAT-73`):

### 1. Diagnosis Matrix

| Symptom in `TCEX_RS` Telemetry | Root Cause | Resolution Action |
| :--- | :--- | :--- |
| `VAR_01` **Passed**, but `VAR_02` fails with SQL/Mendix Unique Constraint Violation | Shared/overlapping synthetic key (e.g. same email, license plate, code used across blocks). | Enforce **Disjoint Synthetic Partitioning** (`VAR01-A`, `VAR02-B`). |
| `VAR_01` **Passed**, but `VAR_02` XPath retrieve returns `Count = 2` instead of `1` | `VAR_01` created/committed records to the database without teardown, polluting `VAR_02`'s query. | Add explicit **Intra-Block Deletion** (`Oact: Delete` via `TCEX_RQ_Sfdr`) at the end of each block. |
| `VAR_02` returns unexpected Validation Feedback *"Record already exists"* | Microflow executes an internal duplicate existence check on the database. | Apply unique synthetic keys per variation and intra-block cleanup. |
| Global configuration or singleton state changed in `VAR_01` affects `VAR_02` | Microflow mutates shared in-memory or database singleton entity. | Revert singleton state at the end of each block or trigger Fallback Protocol. |
| Microflow modifies external non-transactional cache or web service | Non-transactional Java actions cannot be rolled back by Mendix transaction. | Trigger **Session Isolation Fallback Protocol** (dispatch each variation in a separate `execute-testcase` session). |

### 2. Session Isolation Fallback Protocol (`PAT-74`)
If state leakage is caused by unmanaged external side-effects:
1. Halt chained single-payload execution.
2. Re-dispatch the variations as isolated, single-scenario `execute-testcase` calls.
3. Consolidate results into the standard multi-scenario report (`PAT-61`).

