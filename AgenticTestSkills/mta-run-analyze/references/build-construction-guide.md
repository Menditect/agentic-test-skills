# MTA Build, Construction, & Audit Guide (States 2-5)
**📍 You are here:** `references/build-construction-guide.md` | **🏠 Return to:** [MTA Core Skill](../SKILL.md)
*Metadata: Version 5.0 | Last Updated: 2026-09-02*

This guide outlines the precise operational checklists, evaluation questions, construction rules, and pre-execution compliance checks required during the test planning, active building, smoke auditing, and run verification phases (States 2-5) using the consolidated 53-tool MTA-ACCP API (`/primitivetools/mcp`).

---

## 📋 COMPACTED STATE-BY-STATE CONSTRUCTION CHECKLIST

### 2. `STATE_BUILD_PLANNING` (State 2)
*   **Halt Gate (Pre-Construction Validation):** Present the detailed chronological step sequence execution plan, along with all data variations, and **HALT** for user approval (Guided/Express-BP). This ensures the design is fully complete and accurate before creating any actual steps.
*   **Mandatory Data Variation & Edge Case Prompting:** Proactively ask the user about intended test scenarios (happy paths, boundary values, negative cases) and handle them via MTA's **Data Variations**.
*   **Detailed Variation Specification:** For each scenario, prompt for relevant input attributes and values, drafting a structured matrix showing inputs and assertions.
*   **Refined Chronological Execution Plan:** Specify which attributes will be varied, their default values, and how variations map to them.
*   **Boilerplate Start/Stop Inclusion:** Frontend plans must place start/stop session steps at the boundaries, configuring them with `"Always"` execution settings and `"_Continue"` exception handling.
*   **Data Retrieve Trigger:** If retrieving data, ensure objects are seeded within the active test run. Discourage unseeded database reliance.
*   **Verification Gate:** Explicitly present the choice between **Frontend Assertion** (UI render/wiring) and **Backend Assertion** (headless microflow/database assert).
*   **Deep Page Inspection Gate (MANDATORY for Frontend):** Explicitly ask if the user wants a **Deep Page Inspection** before finalizing the plan.
*   **MANDATORY Plan Evaluation Guide Generation:** Append a context-aware **"🔍 How to Evaluate This Execution Plan"** checklist directing the user to verify data piping, execution settings, empty object patterns, step predecessor chaining, single persist batching, and zero-data naming.
*   👉 **Read:** [MTA Frontend Testing Reference](frontend-testing.md) | [MTA Golden Rules Reference](golden-rules.md) | [MTA Data Variations Reference](data-variations.md)

---

## 3. `STATE_CONSTRUCTION` (State 3)

### Step 1: Pre-Construction Model-to-MTA Schema Audit (PAT-82, ANTI-36)
*   **The Single Responsibility & Parity Bypass Rule (PAT-82):** In active sessions where Check 14 of the Pre-Approval Quality Audit (`mta-test-design`) has already verified model parity (`In-Sync`) and the `PAT-44` Pre-Construction Integrity Check confirms no manual drift reconciliation occurred, **SKIP** redundant `GetAppModelData` queries and proceed directly to Step 2.
*   **Conditional Audit Execution:** Only execute `GetAppModelData` in `mta-build` if:
    1. The session is restored from a cold file or state compaction block where parity was not audited in active turn memory.
    2. An exploratory test is being promoted after Gate 1 had previously flagged an *Out-of-Sync* state.
    3. The plan was manually edited and re-signed via the `PAT-44` Drift Reconciliation Gate in Step 0.
*   **Prohibition of Trial-and-Error Building (ANTI-36):** You are strictly prohibited from attempting to build steps or relying on step creation errors to discover missing model elements. Never "try and build" hoping it succeeds or using failed builds as a diagnostic mechanism.
*   **Domain Model Entities & Attributes:** Call `GetAppModelData(RetrieveAction="RetrieveEntityByApplicationAndTestConfiguration", EntityQualifiedName="<Module.Entity>")` to confirm the entity and all referenced attributes exist in MTA.
*   **Microflows & Parameter Signatures:** Call `GetAppModelData(RetrieveAction="RetrieveMicroflowByApplicationAndTestConfiguration", MicroflowQualifiedName="<Module.Microflow>")` to verify microflow parameters, return types, and parameter names.
*   **Enumerations:** Call `GetAppModelData(RetrieveAction="RetrieveEnumerationByApplicationAndTestConfiguration", EnumerationQualifiedName="<Module.Enum>")` to confirm enumeration keys.
*   **Pages & Input Widgets:** Call `GetAppModelData(RetrieveAction="RetrievePagesByApplicationAndTestConfiguration")` and `GetAppModelData(RetrieveAction="RetrieveWidgetsByPage", PageQualifiedName="<Module.Page>")` to verify page and widget availability.
*   **Revision Synchronization Gate:** If any entity, attribute, microflow, parameter, or widget in the approved Execution Plan is missing in MTA's model database, HALT immediately. Explain the exact structural delta to the user, state that MTA requires an updated model revision synchronization before persistent construction can proceed, and offer local exploratory testing (`MTA_plugin.execute-testcase`) in the interim.

### Step 2: Execution Plan Local Storage & Placement Resolution
*   **Execution Plan Local Storage Gating (MANDATORY - PAT-44):** Ensure the approved plan is saved locally as a `.md` file (e.g. `${MTA_OUTPUT_PATH}/execution-plans/EP_<TestCaseName>.md`). If running in an environment without file-writing capabilities (Chat Track), warn the user and ensure the plan is preserved in active chat context. Active step building is strictly prohibited until Gate 1 (Plan) and Gate 2 (Placement) are approved and the plan is stored locally or retained in chat context.
*   **Pre-Creation Execution User Resolution (PAT-79, ANTI-33):** Because `CreateTestCase` requires `ExecutionUserKey` as a mandatory integer, query `GetExecutionUsers(ApplicationKey)` to resolve an existing user or call `CreateExecutionUser` before creating test cases.

### Step 3: The Deterministic Horizontal Layered Construction Protocol (PAT-16, PAT-78, PAT-85, ANTI-05, ANTI-32, ANTI-39)
Execute construction across deterministic horizontal layers rather than vertical per-step interleaving (`ANTI-39`). Strictly adhere to tool dependency boundaries and safe batch sizing (max 15-20 tool calls per turn per `ANTI-32`) across all layers:
*   **Phase 1: Sequential Step Pipeline (`SKELETON_PROVISIONING`):**
    1. **Test Suite Level:** Create test suite (`CreateTestSuite`) if provisioning a new suite.
    2. **Test Case Level (Multi-Case Batching):** In multi-case suites (e.g., Frontend 3-Case lifecycle: Case 1 Setup, Case 2 Action, Case 3 Teardown [`PAT-03`], or multi-case backend integration suites), dispatch ALL planned `CreateTestCase` calls concurrently (with pre-resolved `ExecutionUserKey` per `PAT-79`).
    3. **Test Step Level (Strictly Sequential Forward Chaining):** Construct test steps sequentially in forward chronological order using predecessor chaining (`TestStepBeforeKey = KeyN`, `PAT-11`). Batching step creation across steps in the same case is strictly prohibited because each step requires its predecessor's key.
    4. **Direct Output Binding:** For `ChangeObjects` and `DeleteObjects` steps, pass `TestStepOutputKey` directly into `CreateObjectActionTestStep` at creation time (`PAT-80`).
*   **Phase 2: Step & Assertion Configuration (`HORIZONTAL_LAYERED_BINDING`):**
    Prohibits vertical per-step interleaving (adding attributes, setting values, and creating asserts step-by-step) (`ANTI-39`). Construct steps in strict horizontal cross-step layers:
    *   **Phase 2A: Bulk Slot Inclusion (All Steps) (`BATCH_INCLUSION`):**
        *   Concurrently dispatch in parallel across ALL steps in the test case:
            - `EditAttributeValue(EditAction="IncludeAttribute")` for ALL attributes across ALL steps.
            - `CreateAssertMicroflowReturnValue`, `CreateAssertObjectCount`, `CreateAssertValidationFeedback*`, and `CreateAssertException` for ALL assert steps.
            - `EditTestStepRetrieve(RetrieveOption=...)` and attribute filters for ALL retrieve steps.
        *   Enforce **Safe Batch Sizing (max 15-20 tool calls per turn)** (`ANTI-32`). For large test cases with many attributes/asserts, chunk across sequential turns while remaining within Phase 2A.
    *   **Mid-Phase Bulk Sync (1 Tool Call):**
        *   Execute `GetTestCaseDetails(TestCaseKey)` for the active test case (or `GetTestSuiteDetails` for multi-case suites) to fetch all newly minted `AttributeValueKey`s and assertion keys across the entire step matrix in a single payload.
    *   **Phase 2B: Bulk Value Binding (All Steps) (`BATCH_BINDING`):**
        *   With all `AttributeValueKey`s and assertion keys resolved, concurrently dispatch in parallel across ALL steps:
            - `EditAttributeValue` (`SetStringValue`, `SetIntegerValue`, `SetDateTime*`, `SetTestStepOutputForSelectValueForValue`, using `IntegerLongValue` per `PAT-81`) across ALL steps.
            - `EditAssert*Compare` across ALL assert steps.
            - `EditTestStep(EditAction="SetDescription")` pattern annotations across ALL steps.
            - `EditTestCase` specifications and conditions across ALL cases.
            - `EditTestSuite` suite properties (`SetDescription`, `SetExecutionCondition`, `SetInheritConfigurationSettings`, `SetUsePlaywright`).
        *   Enforce **Safe Batch Sizing (max 15-20 tool calls per turn)** (`ANTI-32`). Chunk large sets across sequential turns while remaining within Phase 2B.
        *   **Partial Failure Handling (No Server Transactions):** Because the MTA MCP server executes each mutating tool individually without atomic transaction rollback, if any call within a batch fails, inspect the error, identify the failed setter, and surgically retry or fix that specific call.
*   **Phase 3: Variation Item Registration (`VARIATION_REGISTRATION`):**
    *   **Zero Disconnect SSOT Invariant:** The variation items registered via `AddTestCaseVariationItem` MUST strictly match Section 7 of the approved Execution Plan. Zero unapproved additions or improvisations allowed.
    *   Enable variations via `AddTestCaseVariationItem(Action="EnableTestCaseDatavariation")`.
    *   Dispatch **ALL** planned `AddTestCaseVariationItem` calls concurrently in safe batches (max 15-20 calls per turn). Sequential single-item loops across turns are strictly prohibited (`ANTI-32`).
*   **Phase 4: Variation Column Population (`VARIATION_POPULATION`):**
    *   For each variation column created via `CreateTestCaseVariation`:
        1. Inspect cloned item keys via `GetTestCaseDetails`.
        2. Configure the **entire variation column in safe batches (max 15-20 calls per turn)** by concurrently dispatching:
           - All `EditAttributeValue` calls for the variation
           - All `EditAssert*` calls for the variation
           - `EditTestCaseVariation(EditAction="SetName")`
           - `EditTestCaseVariation(EditAction="SetDescription")`
        Prohibit iterating through variation setters sequentially across dozens of conversational turns (`ANTI-32`).

#### Strict Wire Format & Datatype Constraints (PAT-81, ANTI-35):
*   All database keys (`TestStepKey`, `TestCaseKey`, `TestSuiteKey`, `TestConfigurationKey`, `TestStepOutputKey`, `ApplicationKey`, `ExecutionUserKey`) MUST be passed as raw JSON integers (e.g., `12345`), never string-quoted (`"12345"`).
*   All `IntegerLongValue` attributes MUST be passed as valid integer numbers, never strings (`"100"` -> `100`).
*   All `ExecutionCondition` fields MUST strictly use valid MTA enum values (`"Always"`, `"Skip"`, `"None"`).
*   All `ResumeExecutionAfterException` fields MUST strictly use valid MTA enum values (`"_Continue"`, `"Stop"` — note: `"Stop"` has NO leading underscore).

---

### Step 4: Mid-Flow Halts & Handoffs
If interrupted mid-flow:
*   Save the current State Header with the precise macro state and sub-state.
*   Log newly generated keys (`test_suite.key`, `test_cases[].key`, `test_steps[].key`) into `mta_state.json`.
*   Resume gracefully from the exact sub-state without repeating earlier creation phases.

---

### 4. `STATE_SMOKE_AUDIT` (State 4)
*   **Mandatory Halt Gate:** Transitioning directly from construction to execution is prohibited. Enter `STATE_SMOKE_AUDIT`, run validation queries, present the **Post-Construction Verification & Compliance Report**, and **HALT** for user confirmation.

##### 🤖 Dual-Track Smoke Audit Styles:
*   **Agentic Track:** Read the locally saved execution plan file (`.md`) via file viewing tools. **Staggered Smoke Audit Reading:** Query `GetTestCaseDetails(TestCaseKey)` for one test case at a time per turn to prevent context window saturation while inspecting every case. Audit created steps, attributes, parameters, assertions, and variation overrides against Section 7 of the plan. Verify zero unapproved additions exist. Generate the Smoke Audit Report.
*   **Chat Track:** Audit created steps, attributes, parameters, assertions, and variations against the execution plan retained in the active chat context.

#### The Post-Construction Verification & Compliance Report Structure:
Your report **MUST** contain four distinct sections:
1. **100% Entire Execution Plan Content Audit (Execution Plan vs. Reality - ALL 8 SECTIONS):** Compare the approved execution plan (State 2) section-by-section with the actual created assets on MTA:
    *   **Section 1 (State Compaction & Target Placement):** App, Test Configuration, Test Suite, Test Case Name, Category, Execution User (`EXUS_ExecutionUser`).
    *   **Section 2 (Prompt & Input Log vs. MTA Skill Conflicts):** Verify prompt conflicts and automatic skill corrections.
    *   **Section 3 (Test Case Scope & Dual-Risk Profile):** Objective, Preconditions, Expected Results, Auth Requirement (`GetTestCaseDetails`), Technical Risk, Business Risk.
    *   **Section 4 (Verified Model Elements & Testability Profile):** Target microflows, pages, entities, attributes referenced.
    *   **Section 5 (Chronological Step Sequence Plan):** Compare approved steps line-by-line with created steps (`GetTeststepDetails`), verifying step types, predecessors, settings (`"Always"`/`"_Continue"` vs `"None"`/`"Stop"`), and `[Pattern: ...]` annotations.
    *   **Section 6 (Playwright / Browser Settings):** Verify all 10 browser setting keys/values configured on suite/setup case (Frontend only).
    *   **Section 7 (Data Variation Matrix & Metadata):** **Mandatory Cell-by-Cell & Zero-Disconnect Verification**: Call `GetTestCaseDetails` (or `GetTestSuiteDetails`) and verify:
        * Every variation system name and description matches Section 7 (`PAT-77`, `ANTI-31`).
        * Every input attribute value, microflow parameter, return value assertion, object count, exception string, and validation feedback string matches Section 7 (`PAT-54`).
        * **Zero Disconnect Check:** Verify that **zero unapproved additions** exist (no extra assertions, variation items, attributes, or retrieve filters exist on the server that were not declared in Section 7 or Section 5).
    *   **Section 8 (Applied Testing Patterns & Rationale):** Verify pattern explanations match pattern annotations written into step descriptions via `EditTestStep`.
2. **MTA Server Validation Audit (Compiler Check):** Show retrieved compiler or configuration errors from `GetTestCaseDetails`. Report the output. If any compilation errors are found, they **MUST** be resolved before proceeding.
3. **MTA Platform Quality & Execution Safety Checklist:**
    * **Execution User Check:** `ExecutionUserKey` is bound and valid.
    * **Atomic Batching Check:** Multi-case suites batched concurrently.
    * **Piping Integrity:** Every consumer step references its producer's returned memory outputs (like created object keys) dynamically, with zero hardcoding.
    * **Execution topology:** All setup, teardown, and database-seeding steps are set to `"Always"` execution with `"_Continue"` exception handling.
    * **Empty Object retrieves:** Any conditional null parameter retrieves use `RetrieveOption = "Teststep"`.
    * **Data Matrix Conformity:** Every created Data Variation has its `Name` and `Description` explicitly configured (`PAT-77`), zero empty descriptions exist (`ANTI-31`), and all variation item values match the Execution Plan matrix cell-by-cell (`PAT-54`).
    * **Zero Data in Names:** Step names are purely action-descriptive with zero raw test data in the titles, conforming to the `[Action] [WidgetType] '[FieldDescriptor]' [Input/Button]` template.
    * **Single Persist Check:** No redundant per-step `Persist` steps exist; creations/deletions of multiple objects are committed via a single grouped `Persist` step at the end.
    * **No Sequential Batching Violations:** No steps were created in parallel in a single turn; sequential steps were built one-by-one waiting for their predecessor keys.
    * **No Flaky Sleeps:** Zero sleep/delay steps exist in the test sequence.
    * **Execution & Assertion Settings:** For Backend Unit tests, ALL steps (including asserts) use `ExecutionCondition = "None"` and `ResumeExecutionAfterException = "Stop"` (`PAT-17`). For Frontend UI and Backend Integration tests, assertions default to `"ContinueTestRun"` or `"_Continue"` exception handling (`PAT-33`).
    * **Date Format Casing:** All date-picker formats use uppercase `MM` for months (converting any lowercase `mm` used in date-only context to avoid minute fields overrides).
    * **Retrieve for Assertions:** Retrieve steps used for asserting objects configure explicit or piped dynamic attribute filters with `RetrieveSet = "All"`, coupled with an immediate downstream `Assert Object Count` step (`PAT-07`, `PAT-13`, `PAT-31`).
    * **Cascading Consumer Check:** No step executes on a skipped provider step (downstream consumers of skipped steps must also be set to `"Skip"`).
    * **Cascading Provider Check:** If a teardown/cleanup step is `"Always"`, all of its upstream input provider steps are also set to `"Always"`.
    * **Order of Operations Check:** Memory retrieves called `EditTestStepRetrieve(RetrieveOption = "Teststep")` before attempting to retrieve or set select objects.
    * **Integer Piping Datatype Check:** All binding and piping keys passed in tool payloads (e.g. `TestStepOutputKey`) are raw, unquoted integers, never quoted strings.
4. **Direct MTA Web Navigation Links & Plan Verification:** Provide direct clickable markdown links (plain text without emojis) to the constructed/verified MTA assets using the official MTA URL pattern `[MtaBaseUrl]/p/[ObjectType]/[Key]`:
    * **Test Configuration:** `[ConfigName]([MtaBaseUrl]/p/testconfiguration/[ConfigKey])`
    * **Test Suite:** `[SuiteName]([MtaBaseUrl]/p/testsuite/[SuiteKey])`
    * **Test Case(s):** `[TestCaseName]([MtaBaseUrl]/p/testcase/[CaseKey])`
    * **Execution Plan:** `[EP_<TestCaseName>.md](file:///path/to/EP_<TestCaseName>.md)` (or `Retained in Chat Context`)

*   👉 **Read:** [MTA Golden Rules Reference](golden-rules.md) | [MTA API Helpers Reference](api-helpers.md) | [MTA Data Variations Reference](data-variations.md) | [MTA Troubleshooting Guide](troubleshooting.md)

---

### 5. `STATE_RUN_ANALYZE` (State 5)
*   **Execution:** Call `ExecuteTest(ApplicationInstanceToken="...", ExecutionLevel="TestSuite"|"TestCase"|"TestConfiguration", TestSuiteKey=... | TestCaseKey=... | TestConfigurationKey=...)` to trigger background execution. Obtain `TestRunExecutionId`, retrieve summary via `GetTestRunResults(TestRunExecutionId=..., RetrieveAction="GetTestRunSummary")`, and inspect failures via targeted `GetTestCaseRunDetails` (`PAT-83`).
*   👉 **Read:** [MTA Troubleshooting Guide](troubleshooting.md)
