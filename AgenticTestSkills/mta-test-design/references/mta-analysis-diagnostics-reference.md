# 📋 MTA Execution, Diagnostics, TDBF & Self-Repair Reference (`STATE_RUN_ANALYZE`)

This reference guide contains the complete operational procedures for all micro-states within `STATE_RUN_ANALYZE`: Local Exploratory Execution (`STATE_EXPLORATORY_EXECUTION`), Live Data Provisioning (`STATE_LIVE_DATA_PROVISIONING`), the Option A -> Option B Promotion Bridge, Persistent Server Execution (`STATE_EXECUTION_VERIFY`), the 4-Phase Test-Driven Bug Fixing (TDBF) Lifecycle (`BUGFIX_REPRODUCE_RED` -> `CODE_REPAIR_INTERMISSION` -> `BUGFIX_VERIFY_GREEN`), and Automated Self-Repair (`STATE_SELF_REPAIR`).

---

## 1. Execution & Results Retrieval APIs

| Action | MCP Tool | Purpose / Key Parameters |
| :--- | :--- | :--- |
| **Execute In-Memory / Seeding Test** | `MTA_plugin.execute-testcase` | Executes a Backend test case or seeding payload directly against the running Mendix runtime via `/plugin/mcp`. Requires prior verification via `node tools/mta-lint.mjs pre-exec <plan.md>` (`PAT-43`, `ANTI-46`). Never used for Frontend tests (`PAT-62`). |
| **Execute Persistent Test** | `MTA.ExecuteTest` | Executes persistent tests on the MTA Platform. Parameters: `ApplicationInstanceToken` (resolved from `mta_config.json.default_app_instance_token`), `ExecutionLevel` (`"TestConfiguration"`, `"TestSuite"`, or `"TestCase"`), and corresponding `TestConfigurationKey`, `TestSuiteKey`, or `TestCaseKey`. Optional `ExecutionScope` (`"All"`, `"ChangedOnly"`, `"FailedOnly"`, `"Changed_Failed"`). |
| **Retrieve Results (2-Step Drill-Down)** | `MTA.GetTestRunResults` | Pulls execution status, logs, and failure receipts using the 2-step drill-down (`PAT-83`, `ANTI-37`): Step 1 `RetrieveAction="GetTestRunSummary"` -> Step 2 `RetrieveAction="GetTestCaseRunDetails"` with numeric `TestCaseRunKey`. Never call `"GetTestRunDetails"` across an entire multi-case suite (`ANTI-37`). |

---

## 2. Micro-State 1: `STATE_EXPLORATORY_EXECUTION` (`PAT-43`, `PAT-61`, `PAT-62`, `PAT-66`, `PAT-73`..`PAT-76`, `PAT-120`, `ANTI-22`, `ANTI-27`..`ANTI-30`, `ANTI-46`, `ANTI-48`, `ANTI-60`)

1. **Pre-Execution Gate (`PAT-43`, `ANTI-46`):**
   * Verify `${execution_plans_dir}/EP_<TestCaseName>.md` exists on disk with `status: "APPROVED"` (or `"AUTO_APPROVED"` in `FAST_PATH_EXECUTION`) and passes `node tools/mta-lint.mjs pre-exec "${execution_plans_dir}/EP_<TestCaseName>.md"`.
   * Never corrupt `EP_*.md` with plugin-only JSON shortcuts (`"UseEmptyObjectList": true` or omitting `"TCEX_RQ_Sfar"`); compile `PAT-07` Dual-Retrieve sentinels literally (`ANTI-48`, `ANTI-60`).
2. **6 Plugin Execution Principles:**
   * `ExecutorUsername: "MxAdmin"`, `ApplySecurityExecutor: "NONE"`.
   * Verified domain entity attribute names (`PAT-75`, `ANTI-29`).
   * ISO-8601 UTC date strings (`"YYYY-MM-DDTHH:mm:ss.sssZ"`).
   * Explicit `TCEX_RQ_Sfar` / `TCEX_RQ_Sfcr` handle bindings.
   * `RollbackTcseAfterExecution: "Yes"` with no trailing `Persist` step.
   * Intercept `ECONNREFUSED` or 401/403 errors with the `PAT-95` Sanitized Layered Return Message and offer Option B fallback if `MTA` is online.
3. **Single-Payload Matrix Compilation vs. Isolated Sessions:**
   * **Standard Multi-Scenario Compilation (`PAT-66`, `PAT-73`, `ANTI-22`, `ANTI-27`):** Unroll all Section 4 variations (`VAR_01..VAR_0N`) into **1 single `TCEX_RQ_TestStepRun` array** using intra-block `Delete` (`TCEX_RQ_Sfdr`) and disjoint entity keys (`1:1` scenario parity: `Count(Executed Scenarios) == Count(Planned Scenarios)`).
   * **Pre-Execution AST Conflict Audit (`PAT-74`, `ANTI-28`) & Validation Feedback Session Isolation (`PAT-120`):** Because `TCEX_RS_ValidationFeedback` is returned as a flat array at the TestCase response root without `TestStepKey` attribution, any test case asserting on Validation Feedback messages (`PAT-10`) or triggering mid-flow database commits/rollbacks MUST be dispatched in isolated `execute-testcase` calls (1 call per scenario) and evaluated agent-side against Section 4.
4. **3-Part Performance & Benchmark Profile & Promotion CTA (`PAT-57`, `PAT-61`, `PAT-76`, `PAT-106`, `PAT-112`, `ANTI-30`, `ANTI-61`):**
   * Render the **MTA Exploratory Test Execution Report** (`references/exploratory-execution-guide.md`) containing:
     * **4.1 Overall Wall-Clock Throughput:** Total Steps, Total Scenarios, Total Wall-Clock Duration (`ms`), Mean Step Latency (`ms/step`).
     * **4.2 Operations Category Breakdown Table:** Create Object, Retrieve Object, Microflow Execution, Delete / Cleanup (`Step Count`, `Total Time (ms)`, `Avg Time (ms)`, `% of Run`).
     * **4.3 Per-Scenario Latency Table:** Scenario ID (`VAR_01..VAR_0N`), Target Step, Duration (`ms`), Status.
     * **Section 5 Promotion Call-to-Action:** Render Checkpoint 4 Case A (Connected MTA Server `PAT-106`), Case B (Free Exploratory License `wss://services.menditect.com` consultative upgrade info `PAT-112`, `ANTI-61`), or Case C (Offline Mode) from `references/checkpoint-templates.md`.

---

## 3. Micro-State 2: `STATE_LIVE_DATA_PROVISIONING` (`PAT-21`, `PAT-68`, `PAT-69`, `PAT-70`, `ANTI-14`, `ANTI-24`, `ANTI-25`, `ANTI-46`)

1. Verify `${execution_plans_dir}/EP_Seed_<Entity>.md` (`status: "APPROVED"`, never `"AUTO_APPROVED"`) passes `node tools/mta-lint.mjs pre-exec`.
2. Dispatch `MTA_plugin.execute-testcase` with `"RollbackTcseAfterExecution": "No"` and a mandatory final parameterless `{"Action": "Persist", "ExecutionCondition": "Always", "ResumeExecutionAfterException": "_Continue"}` step (`PAT-21`, `PAT-69`).
3. Present the **Live Data Provisioning Receipt** (`Created Records Table` + `Manual Tester Verification Guide`) and the **Data Script Conversion Bridge** (`PAT-70`, `PAT-106`):
   * **Option 1 (1-Case Data Generator on MTA Server):** Transition to `PLAN_STEP_2` (`STATE_BUILD_PLANNING`).
   * **Option 2 (Full 3-Case Automated Regression Suite):** Transition to `PLAN_STEP_1B` (`STATE_BUILD_PLANNING`) to add Case 2 assertions and Case 3 teardown (`ANTI-14`).

---

## 4. Option A -> Option B Promotion Bridge (`PAT-57`, `PAT-70`, `PAT-82`, `PAT-106`, `PAT-118`, `PAT-123`, `PAT-124`, `ANTI-56`, `ANTI-67`, `ANTI-76`, `ANTI-80`)

When the user confirms promoting an in-memory exploratory test (`STATE_EXPLORATORY_EXECUTION`), a verified bug-reproduction test (`BUGFIX_VERIFY_GREEN`), or a live data seeding script (`STATE_LIVE_DATA_PROVISIONING`) to the MTA Server:
1. Switch to `[State: STATE_BUILD_PLANNING | Temp State: PLAN_STEP_2 | Active Skill: mta-test-design]` (or `PLAN_STEP_1B` if expanding 1-case seeding into a 3-case suite).
2. In the **SAME turn**, execute read-only parity and placement discovery:
   * `GetAppModelData(includeMicroflows=false, includeDomainModel=false)` (`PAT-82`).
   * `GetApplicationDetails` (halting via `ask_question` if `configurations.length > 1`; never guess index 0 per `PAT-118`, `ANTI-67`).
   * `GetExecutionUsers` and `GetTestConfigurationDetails` (halting via `ask_question` on suite/case collision per `PAT-123`, `ANTI-76`).
3. Stage placement via `node tools/mta-lint.mjs stage-placement "${execution_plans_dir}/EP_<TestCaseName>.md" --config-key <Key> --suite-key <Key|NEW_SUITE>`, render **Checkpoint 2: Confirm Test Suite Placement & Settings**, and **HALT** (`ANTI-56`, `ANTI-80`).
4. In the **next turn** (after the user replies **"Approved"**), update `EP_*.md` to `status: "APPROVED"` (`approved_by`, `approved_at`, `approval_turn_id`, `target_configuration_key > 0`, `target_suite_key > 0` or `"NEW_SUITE"`), run `node tools/mta-lint.mjs lock <plan.md> --reseal-wiring` if promoting a locked `PAT-124` plan with updated Section 3 wiring, verify via `node tools/mta-lint.mjs pre-build <plan.md>`, and transition to `STATE_CONSTRUCTION`.

---

## 5. Micro-States 3–5: Test-Driven Bug Fixing (TDBF) 4-Phase Lifecycle (`PAT-124`, `ANTI-69`, `ANTI-75`, `ANTI-78`)

### Phase 1: `BUGFIX_REPRODUCE_RED` (Red Verification Gate)
1. Verify `EP_<TestCaseName>.md` (`test_intent: "bug_reproduction"`, `expected_pre_fix_outcome: "FAIL"`, `protection_level: "unlocked"`) passes `mta-lint.mjs pre-exec` and execute against the unpatched Mendix application.
2. **Strict Failure Classification:**
   * **`PASS (Bug Reproduced)` — Valid Red:** All upstream `CreateObject`, `RetrieveObjects`, and parameter bindings succeeded, AND the target assertion failed (`FAIL_ASSERTION_MISMATCH` or `FAIL_VALIDATION_ERROR`) matching the reported defect symptoms. Unhandled runtime exceptions qualify ONLY if the defect spec explicitly reports a crash inside the target microflow.
   * **`FAIL_TEST_SETUP_DEFECT` — Invalid Red:** Failure occurred in an upstream setup/retrieve step or missing required attribute. Do NOT lock; return to `mta-test-design` (`PLAN_STEP_1`) to fix the test setup.
   * **`FAIL (False Positive)` — Invalid Red:** The test unexpectedly passed (`PASS`) against the buggy code. Do NOT lock; return to `mta-test-design` (`PLAN_STEP_1`) to refine scenario inputs or assertions.

### Phase 2: Cryptographic Seal & Lock (`mta-lint.mjs lock`)
Immediately upon confirming a genuine Red reproduction:
1. Run:
   ```bash
   node tools/mta-lint.mjs lock "${execution_plans_dir}/EP_<TestCaseName>.md"
   ```
   This sets `protection_level: "locked"`, computes `locked_sha256` over normalized Sections 3 & 4, and injects `### 🔒 IMMUTABLE_ASSERTION_ANCHOR`.
2. Render **Checkpoint 4 Case C (Bug Reproduced & Test Locked)** from `references/checkpoint-templates.md` and transition to `CODE_REPAIR_INTERMISSION`.

### Phase 3: `CODE_REPAIR_INTERMISSION` (Quarantined Mendix Model Repair)
1. **Directory Write Quarantine:** Calling `write_file`, `edit_file`, or shell commands to modify ANY file inside `${execution_plans_dir}/` is **STRICTLY PROHIBITED**.
2. **MTA Mutating Tool Quarantine:** Calling any mutating MTA MCP tool (`Edit*`, `Create*`, `Set*`) is **STRICTLY PROHIBITED**.
3. **Production Bug Fix & AST Disclosure:** Repair ONLY the Mendix application model in Studio Pro (`ped_update_document`), disclose the exact AST diff (Before vs After expression/flow), and refuse any request to weaken or delete assertions (`ANTI-78`). Prompt the user to save/synchronize in Studio Pro and reply *"Run verified test"*.

### Phase 4: `BUGFIX_VERIFY_GREEN` (Tamper Check, Rebuild Verification & Green Certification)
1. **Tamper Check:** Run `node tools/mta-lint.mjs verify-lock "${execution_plans_dir}/EP_<TestCaseName>.md"`. If the hash fails (`TAMPERED_TEST_REJECTED`), abort execution and restore the locked Sections 3 & 4 from Git/anchor.
2. **Mendix Bytecode Rebuild Check (`ANTI-75`):** Verify the running Mendix runtime incorporates the Studio Pro change before replaying the test.
3. **Verbatim Replay & Certification:** Replay the exact same test payload.
   * **On `PASS (Bug Fixed & Verified)`:** Lift the write quarantine, append the Section 6 Bugfix Certification Receipt to `EP_<TestCaseName>.md` (retaining `status: "APPROVED"` if promoting to Option B so `stage-placement` / `pre-build` succeed, or setting `"BUILT_AND_VERIFIED"` if already built on MTA), and offer Option B promotion.
   * **2-Cycle Circuit Breaker:** If `BUGFIX_VERIFY_GREEN` fails twice consecutively, **HALT** and present 3 options:
     1. **Option 1: Continue Manual Code Repair in Studio Pro** (stay in `CODE_REPAIR_INTERMISSION`).
     2. **Option 2: Revise Specification / Oracle** (return to `PLAN_STEP_1B`, increment `revision`, and re-lock via `node tools/mta-lint.mjs lock <plan.md> --force`).
     3. **Option 3: Abandon Bugfix Cycle** (retain locked Red plan for developer escalation).

---

## 6. Micro-States 6–7: `STATE_EXECUTION_VERIFY` & `STATE_SELF_REPAIR` (Click-to-Repair Loop)

### `STATE_EXECUTION_VERIFY` (`PAT-45`, `PAT-46`, `PAT-59`, `PAT-83`, `PAT-90`, `PAT-95`, `PAT-115`, `ANTI-18`, `ANTI-37`, `ANTI-64`)
1. Verify `GetTestCaseDetails` reports `0` construction errors and passes `node tools/mta-lint.mjs audit` (`PAT-59`, `ANTI-18`). Decommissioned `[TO DELETE]` steps (`ExecutionCondition = "Skip"`, `PAT-115`) do not block execution; include the Manual Cleanup Recommendation box (`ANTI-64`) in post-run reports.
2. Resolve `ApplicationInstanceToken` from `mta_config.json.default_app_instance_token` (intercepting 401/403/token errors with the `PAT-95` Sanitized Layered Return Message) and call `MTA.ExecuteTest`.
3. Drill down via `GetTestRunResults(RetrieveAction="GetTestRunSummary")` -> `GetTestRunResults(RetrieveAction="GetTestCaseRunDetails", TestCaseRunKey=...)` (`PAT-83`, `ANTI-37`).
4. For Frontend runs, extract `FileUUID` and assemble clickable Playwright trace links (`${playwright_viewer_url}${tracefile_base_url}${FileUUID}`, `PAT-90`).

### `STATE_SELF_REPAIR` (`PAT-83`, `PAT-90`, `PAT-119`, `PAT-124`, `ANTI-78`)
When `STATE_EXECUTION_VERIFY` detects a runtime failure, transition immediately to `STATE_SELF_REPAIR` in the **same turn**:
1. Inspect step configuration (`GetTeststepDetails`), check event-driven frontend validation timing (`PAT-119`), check `protection_level: "locked"` (`PAT-124`, `ANTI-78`), and perform a **5-Step Cognitive Reverse Trace** (Failure Symptom -> Failing Step Input Handle -> Upstream Producer Step -> Domain/AST Constraint -> Root Cause).
2. Present the **MTA Run Failure Diagnostic & Self-Repair Plan** and **HALT** for user approval:
   ```markdown
   ### 🚨 MTA Run Failure Diagnostic & Self-Repair Plan
   - **Failing Test Case:** `<TestCaseName>` (`Key: <TestCaseKey>`)
   - **Failing Step:** `Step #<N>: <StepName>` (`Key: <TestStepKey>`)
   - **Failure Category:** `<Assertion Mismatch | Mendix Microflow Exception | Null Pointer / Empty Retrieve | Playwright Locator Timeout>`
   - **Playwright Trace Viewer (if Frontend):** `[View Trace](<PlaywrightTraceUrl>)`

   #### 📄 Mendix / Playwright Exception Log
   ```text
   <Sanitized exception stack trace or assertion diff>
   ```

   #### 🔍 Root Cause Analysis (5-Step Reverse Trace)
   <Concise explanation of why the failure occurred>

   #### 🛠️ Proposed Surgical Fix
   1. **Execution Plan Update (`EP_<TestCaseName>.md`):** <Exact Section 3 / Section 4 change>
   2. **MTA Server Mutation (`mta-build`):** <Exact MCP setter / step insertion call>
   ```
3. **4-Step Post-Approval Atomic Repair Sequence:**
   * **Step 1:** Update `EP_<TestCaseName>.md` (`status: "APPROVED"`, `revision + 1`, `supersedes_plan_id`; run `node tools/mta-lint.mjs lock <plan.md> --reseal-wiring` or `--force` if locked).
   * **Step 2:** Verify the updated plan via `node tools/mta-lint.mjs plan "${execution_plans_dir}/EP_<TestCaseName>.md"`.
   * **Step 3:** Transition to `mta-build` (`BATCH_INCLUSION` or `BATCH_BINDING`) to apply the surgical MCP mutations on the MTA Server.
   * **Step 4:** Run `STATE_SMOKE_AUDIT` (`node tools/mta-lint.mjs audit`) and re-verify via `STATE_EXECUTION_VERIFY`.
