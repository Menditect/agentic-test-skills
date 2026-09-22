# MTA Troubleshooting & Diagnostics
**📍 You are here:** `references/troubleshooting.md` | **🏠 Return to:** [MTA Core Skill](../SKILL.md)
*Metadata: Version 3.0 | Last Updated: 2026-09-02*

Reference for diagnosing, resolving test run failures, sequence compilation errors, and performance blocks in MTA using the consolidated 51-tool MTA-ACCP API (`/primitivetools/mcp`).

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
    3.  If parameter should be empty/null, call `EditMicroflowObjectParameter(EditAction="SetInputToEmpty", SelectObjectForMicroflowParameterKey=...)`.
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

---

## 🛠️ SCHEMA & VARIATION CONSTRUCTION TROUBLESHOOTING

| Error Message Observed / Symptom | Root Cause | Instant Fix (No Debugging Needed) |
| :--- | :--- | :--- |
| `Cannot , because the EditAction is not given` | Called `EditAttributeValueFilter` to include attribute. | Call `EditAttributeValue(EditAction="IncludeAttribute")` on both Create and Retrieve steps. |
| `Cannot set enumeration for attribute value, because FilterComparisonOperator is not given` | Passed singular `"Equal"` or omitted `FilterComparisonOperator` on `EditAttributeValueFilter`. | Pass plural `FilterComparisonOperator: "Equals"` (plural PascalCase required by MTA backend enum). |
| `Cannot set ... for assert ... compare (...), because the given ComparisonOperator is not valid` | Called value setter (`SetDecimalValue`, `SetIntegerValue`, `SetStringValue`) on `EditAssertMicroflowReturnValueCompare` without passing `ComparisonOperator`. | Always pass `ComparisonOperator: "Equals"` (or target operator) in the same call as `EditAction`. |
| `given ComparisonOperator is not valid` or `Value '...' is not valid for ComparisonOperator` | Used wrong singular/plural casing or guessing count syntax. | Consult the Assertion Operator Matrix in `api-helpers.md`: plural `Equals`/`NotEquals` for microflows, feedback messages, and retrieve attribute filters (`EditAttributeValueFilter`); singular `Equal`/`NotEqual` for attribute value assertions (`EditAssertAttributeValueCompare`); mixed format (`Equals`, `Greater_than`, `GreaterThanEqualTo`, `Less_than`, `LessThanEqualTo`) for count assertions. |
| `ResumeExecutionAfterException invalid` | Passed `"Continue"` instead of `"_Continue"`. | Prepend underscore to Mendix keyword: `"_Continue"`. |
| `EditAction 'SetRollbackTestCaseAfterExecution' parameter missing` | Used parameter name `RollbackTestCaseAfterExecution`. | Use abbreviated parameter name: `RollbackTcseAfterExecution="Yes"`. |
| Cloned variation fails with `ExpectedObjectCount: 0, Actual: 1` | Cloned `AssertObjectCount` containers default to `ExpectedObjectCount: 0` when created via `CreateTestCaseVariation`. | Explicitly call `EditAssertObjectCount(SetExpectedObjectCount)` with `ExpectedObjectCount: N` for any variation expecting $\ge 1$ objects. |
| Variation requires NULL/empty value, but empty string `""` fails type validation | Passing empty string to integer/date/decimal or non-string attribute. | Set `SetValueToEmpty: "_True"` instead of passing empty string literal. |
| Intermediate key lookups slow down variation population | Calling `GetTeststepDetails` repeatedly between variations (`ANTI-40`). | Call `GetTestCaseDetails` once after bulk provisioning and index cloned keys in-memory (`PAT-86`, `PAT-87`). |

---

## 🎭 PLAYWRIGHT TRACEFILE & VIEWER TROUBLESHOOTING (`PAT-90`)

| Issue / Symptom | Root Cause | Corrective Action |
| :--- | :--- | :--- |
| `FileUUID` is missing from `GetTestRunResults` for frontend test run | Tracing was not enabled in `StartMxFrontendTestOptions`. | Ensure `Trace = true` is set on the `StartMxFrontendTestOptions` object in Case 2. |
| Trace viewer displays 404 / Connection Refused when opening trace link | Tracefile base URL pointing to incorrect host or port where Mendix runtime is not serving `/rest/private/tracefile`. | Verify `tracefile_base_url` in `mta_config.json` points to the reachable Mendix application URL (e.g. `http://localhost:8081/rest/private/tracefile?fileUUID=`). |
| Playwright Trace Viewer (`trace.playwright.dev`) reports CORS error downloading trace | Remote tracefile endpoint does not expose CORS headers for `trace.playwright.dev`. | Ensure the Mendix application runtime allows CORS on `/rest/private/tracefile`, or download the trace file directly via browser and drag-and-drop into `https://trace.playwright.dev`. |
| Custom internal network cannot access public `trace.playwright.dev` | Enterprise network block on public internet sites. | Configure an internal trace viewer or local playwright trace server via `playwright_viewer_url` in `mta_config.json`. |

---

## 🔐 SANITIZED TOKEN & AUTHENTICATION TROUBLESHOOTING MATRIX (PAT-95, CWE-209)

When tool invocations fail due to missing, expired, invalid, or unauthorized tokens, agents and users MUST intercept the error and return the standardized **Sanitized Layered Return Message**. Under no circumstances should internal entity names, microflow names, database states, or cryptographic details be exposed.

| Failure Scenario | Trigger Condition | Standard Protocol Status | Sanitized Reason | Resolution Action |
| :--- | :--- | :--- | :--- | :--- |
| **Option 1: Missing Token** | No token configured in environment or `.env` | `401 Unauthorized` | Missing authorization header | Run `npm run setup` or set `MTA_MCP_AUTH_HEADER` in `.env` |
| **Option 2: Expired Token** | Token expiration timestamp passed on server | `401 Unauthorized` | Token expiration date passed | Generate new session token in MTA Portal under Account Settings > Service Accounts |
| **Option 3: Invalid / Unrecognized Token** | Token revoked, replaced, or malformed | `401 Unauthorized` | Invalid or unrecognized credentials | Verify token string, generate new token in MTA Portal, update `.env` |
| **Option 4: Insufficient Permissions** | Account authenticated but tool execution disabled | `403 Forbidden` | Service account lacks tool execution permissions | Edit service account in MTA Portal and enable automated tools access |
| **Option 5: Unresolved Target Instance** | `ExecuteTest` called with missing/unmapped runtime instance | Client resolution error | Target runtime environment not found or inactive | Run `npm run setup` or configure `default_app_instance_token` in `mta_config.json` |

### Standardized Layered Message Templates

#### Template 1: Missing Token
```markdown
> [!WARNING]
> **Action Needed: Authentication Token Missing**
> 
> The assistant cannot connect to the MTA server because no authentication token is configured.
> 
> **How to fix this:**
> 1. In your workspace, run: `npm run setup` to configure your service credentials.
> 2. Or, paste your token into your `.env` file:
>    `MTA_MCP_AUTH_HEADER="Bearer <your-token>"`
> 3. Tell the assistant: *"Retry connection"*.
> 
> <details>
> <summary><b>Technical Details</b></summary>
> 
> * **Service:** MTA Server
> * **Status:** `401 Unauthorized`
> * **Reason:** Missing authorization header.
> </details>
```

#### Template 2: Expired Token
```markdown
> [!CAUTION]
> **Session Expired: Token Expired**
> 
> Your connection token has expired. The assistant has been disconnected from the MTA server.
> 
> **How to fix this:**
> 1. Log in to the MTA Portal and navigate to **Account Settings** > **Service Accounts**.
> 2. Generate a new session token.
> 3. Update the token in your `.env` file (`MTA_MCP_AUTH_HEADER`) or reply in the chat:
>    *"Use service token: <paste-new-token>"*.
> 
> <details>
> <summary><b>Technical Details</b></summary>
> 
> * **Service:** MTA Server
> * **Status:** `401 Unauthorized`
> * **Reason:** Token expiration date passed.
> </details>
```

#### Template 3: Invalid or Unrecognized Token
```markdown
> [!CAUTION]
> **Authentication Failed: Invalid or Unrecognized Token**
> 
> The provided authentication token is invalid or unrecognized.
> 
> **How to fix this:**
> 1. Verify that the entire token was copied completely without trailing spaces or missing characters.
> 2. If the token was revoked or replaced, generate a fresh token in the MTA Portal under **Account Settings** > **Service Accounts**.
> 3. Update your `.env` file (`MTA_MCP_AUTH_HEADER`) and retry.
> 
> <details>
> <summary><b>Technical Details</b></summary>
> 
> * **Service:** MTA Server
> * **Status:** `401 Unauthorized`
> * **Reason:** Invalid or unrecognized credentials.
> </details>
```

#### Template 4: Insufficient Permissions (Access Denied)
```markdown
> [!CAUTION]
> **Permission Denied: Access Disabled**
> 
> Your service account is authenticated, but it does not have permission to execute automated tools on the MTA server.
> 
> **How to fix this:**
> 1. In the MTA Portal, go to **Account Settings** > **Service Accounts**.
> 2. Edit your service account and enable automated tools access.
> 3. Save your changes and retry your command.
> 
> <details>
> <summary><b>Technical Details</b></summary>
> 
> * **Service:** MTA Server
> * **Status:** `403 Forbidden`
> * **Reason:** Service account lacks tool execution permissions.
> </details>
```

#### Template 5: Missing or Invalid Target Application Instance Token
```markdown
> [!WARNING]
> **Action Needed: Target Application Instance Missing or Invalid**
> 
> The test cannot be dispatched because the target application instance is not recognized or not configured.
> 
> **How to fix this:**
> 1. Run `npm run setup` to detect your running Mendix application instance automatically.
> 2. Or, verify your application instances in the MTA Portal under your application's **App Instances** tab.
> 3. Add the instance token to `mta_config.json` (`default_app_instance_token`) or tell the assistant:
>    *"Use instance token: <paste-token>"*.
> 
> <details>
> <summary><b>Technical Details</b></summary>
> 
> * **Service:** MTA Test Execution Engine
> * **Status:** Target instance resolution failure.
> * **Reason:** Target runtime environment not found or inactive.
> </details>
```



