# MTA Build, Construction, & Audit Guide (States 2-5)
**📍 You are here:** `references/build-construction-guide.md` | **🏠 Return to:** [MTA Core Skill](../SKILL.md)
*Metadata: Version 4.0 | Last Updated: 2026-08-07*

This guide outlines the precise operational checklists, evaluation questions, construction rules, and pre-execution compliance checks required during the test planning, active building, smoke auditing, and run verification phases (States 2-5).

---

## 📋 COMPACTED STATE-BY-STATE CONSTRUCTION CHECKLIST

### 2. `STATE_BUILD_PLANNING` (State 2)
*   **Halt Gate (Pre-Construction Validation):** Present the detailed chronological step sequence execution plan, along with all data variations, and **HALT** for user approval (Guided/Express-BP). This ensures the design is fully complete and accurate before creating any actual steps.
*   **Mandatory Data Variation & Edge Case Prompting:** During `STATE_BUILD_PLANNING` (especially in Guided/Express-BP), you **MUST** proactively ask the user about all intended test scenarios—including happy paths, boundary values, and negative/edge cases—and confirm if these should be handled via MTA's **Data Variations** rather than designing separate, duplicate test cases.
*   **Detailed Variation Specification:** For each identified data variation scenario, you **MUST** prompt the user to specify the relevant input attributes and their values. Proactively draft a structured matrix/mini-table showing the expected input attribute modifications and the corresponding expected outputs/assertions for each variation.
*   **Refined Chronological Execution Plan:** Update the chronological execution plan to include explicit instructions for setting up these data variations rather than just a generic "create objects" or "set parameters" step. It must specify which attributes will be varied, what their default/initial values are for the base test case, and how the variations will map to them.
*   **Boilerplate Start/Stop Inclusion:** Ensure your execution plan for Frontend execution cases always places the startup and stop session steps at the boundaries, noting that they will be created first and configured with `"Always"` execution settings.
*   **Data Retrieve Trigger:** If the plan includes retrieve steps, ask the user if they rely on an active Master Data suite. Actively discourage retrieving any pre-existing database data (e.g., from database backups) as this destroys test portability across application instances. **If the user insists, propose using the MTA feature "Create Object By App Instance" (which allows creating objects based on existing objects in a connected app instance; warn them that this feature is not yet available as an MCP tool and must be set up manually in the MTA UI).** Ensure any valid dependency is documented in the case description.
*   **Verification Gate:** Explicitly present the choice between **Frontend Assertion** (verifying UI render/security) and **Backend Assertion** (database retrieve/assert). Highlight the maintenance tradeoffs.
*   **🚨 Deep Page Inspection Gate (MANDATORY for Frontend):** You **MUST** explicitly ask the user whether they would like to run a **Deep Page Inspection** (to resolve input tab sequences, widget captions, and DatePicker formatting strings) before finalizing the execution plan.
*   **MANDATORY Plan Evaluation Guide Generation:** To aid the user in validating your proposed execution plan, you **MUST** append a prominent, context-aware **"🔍 How to Evaluate This Execution Plan"** checklist at the bottom of your planning response, highlighting specific high-risk patterns for that test structure. Your guide must direct the user to verify:
    *   **Data Piping:** Highlight which steps return dynamic outputs (e.g., created object keys) and explicitly verify that downstream steps reference these dynamically instead of using hardcoded values.
    *   **Execution Settings & Rollbacks:** List which setup, teardown, and database steps must be configured with `ExecutionCondition = "Always"` to guarantee execution on failure, and verify the overall rollback setting for the test cases.
    *   **Empty Object Patterns:** If testing conditional null parameters, explicitly verify that the **Empty Object Retrieve Pattern** is used (with `RetrieveOption = "Teststep"`), rather than direct parameter bindings or database retrieves.
    *   **Parent Container Hierarchies:** For Frontend plans, check if target widgets are nested within tabs, group boxes, or layout grids, and verify that the plan specifies nested/parent locator configurations.
    *   **Step Sequence & Predecessors:** Verify that the steps are chronologically sequenced, starting with predecessor `0` for the first step, with every subsequent step chained to the predecessor immediately preceding it.
    *   **Single Persist Batching:** Confirm that creations and deletions of multiple objects are grouped together and committed in a **single `Persist` step at the very end of the entire block**, rather than adding a redundant `Persist` step after every individual operation.
    *   **Zero-Data Naming Template:** Verify that no raw data values are used in step names, and they strictly match the standard template `[Action] [WidgetType] '[FieldDescriptor]' [Input/Button]`.
    *   **Locator Modularization (POM Equivalence):** For multi-step page flows, check if a single page locator is created at the start and dynamically piped downstream rather than repeating raw widget selectors.
    *   **Native Auto-Waiting:** Ensure there are zero arbitrary wait/sleep steps, relying entirely on implicit waits and dynamic assertions.
    *   **Assertion Failure Topology:** Ensure non-setup/non-teardown assertions default to `ResumeExecutionAfterException = "_Continue"` to enable full-suite error reporting.
*   👉 **Read:** [MTA Frontend Testing Reference](frontend-testing.md) | [MTA Golden Rules Reference](golden-rules.md) | [MTA Data Variations Reference](data-variations.md)

---

## 3. `STATE_CONSTRUCTION` (State 3)
*   **Save Execution Plan & Retrieve Key (MANDATORY):** Immediately upon entering State 3, you **MUST** save the approved chronological execution plan to the MTA server using the dedicated **`SaveExecutionPlan`** tool to retrieve a valid numeric `ExecutionPlanKey`. You are strictly prohibited from constructing any steps until this key is present in your session context.
*   **🚨 "Start-and-Stop First" Boilerplate Rule (Frontend):** Before constructing any standard UI actions/assertions inside a Frontend execution test case, you **MUST** create the starting session step (e.g., `Start_MxFrontend_Test_With_Login` / `Start_MxFrontend_Test_Without_Login`) and stopping session step (`Stop_MxFrontendTest`) **first**, explicitly configuring both with `ExecutionCondition = "Always"` and `ResumeExecutionAfterException = "_Continue"`. Subsequent UI steps are then built and sequenced *between* them.
*   **Atomic Sequential Provisioning & Sequential Loops:** Construct steps strictly one-by-one in chronological forward order. You **MUST** wait for the return key of the predecessor step before initiating the tool call to build the successor step, guaranteeing that the `TestStepBeforeKey` parameter is perfectly bound.
*   **Piping:** Proactively pipe memory outputs using select binders to link step outputs to subsequent inputs.

#### 🤖 Dual-Track Construction Execution Styles:
*   **Agentic Track:** Call programmatic MCP tools (such as `CreateTestStep`, `SetBooleanAttributeValue`, `CreateTestStepPersist`, etc.) sequentially in the background. Output a clear `🧠 Tool Execution Reasoning` markdown explanation before every single call. Wait for Key N's response before initiating Step N+1.
*   **Chat Track:** You have no write/execute tools. For each step of the approved Execution Plan, generate the exact, complete JSON payloads and parameters to execute. Instruct the user clearly where to paste or run these inputs, and wait for the user to confirm completion before outputting the next payload.

#### Partial-Build Recovery Protocols:
If a connection dropout, timeout, or validation error interrupts active construction mid-flow:
1.  **Do NOT restart the build from scratch.**
2.  **Determine Your Track Recovery Action:**
    *   *Agentic Track:* Use retrieval/listing tools (like `GetTestSteps`) directly to scan the existing steps in the test case and reconstruct the active state.
    *   *Chat Track:* Ask the user to verify which steps are visible in their MTA Web UI and copy-paste the last successful step key to use as the predecessor.
3.  Identify the last successfully built step and retrieve its key to use as the `TestStepBeforeKey` predecessor parameter.
4.  Resume building the remaining sequence cleanly from that point.

*   👉 **Read:** [MTA Golden Rules Reference](golden-rules.md) | [MTA API Helpers Reference](api-helpers.md) | [MTA Data Variations Reference](data-variations.md)

---

### 4. `STATE_SMOKE_AUDIT` (State 4)
*   **Mandatory Halt Gate:** You are **strictly prohibited** from transitioning directly from step creation/binding to test execution (`STATE_RUN_ANALYZE` / State 5). You **MUST** enter `STATE_SMOKE_AUDIT`, run the validation queries, present the detailed **MANDATORY Post-Construction Verification & Compliance Report**, and **HALT** for user approval before any run can be executed.

#### 🤖 Dual-Track Smoke Audit Styles:
*   **Agentic Track:** Call **`GetExecutionPlan(ExecutionPlanKey)`** to retrieve the saved execution plan. Call `GetTestConstructionErrorsOfTestCase(TestCaseKey)` directly to retrieve compiler/configuration errors on the server. Call `GetTestSteps` to audit created steps. Call `GetTestCaseDataVariationsDetails` (or `GetTestSuiteDataVariationsDetails`) to perform a cell-by-cell audit of every registered variation item and override value against Section 7 of the Execution Plan. Generate and output the Post-Construction Smoke Audit Report.
*   **Chat Track:** Instruct the user to run the compiler checks in the MTA Web console, verify that no errors are highlighted on their test cases, and copy-paste any highlighted error descriptions into the chat. Then compile and output the Post-Construction Smoke Audit Report based on their input.

#### The Post-Construction Verification & Compliance Report Structure:
Your report **MUST** contain four distinct sections:
1. **100% Entire Execution Plan Content Audit (Execution Plan vs. Reality - ALL 8 SECTIONS):** Compare the approved execution plan (State 2) section-by-section with the actual created assets on MTA:
    *   **Section 1 (State Compaction & Target Placement):** App, Test Configuration, Test Suite, Test Case Name, Category, Execution User (`EXUS_ExecutionUser`).
    *   **Section 2 (Prompt & Input Log vs. MTA Skill Conflicts):** Verify prompt conflicts and automatic skill corrections.
    *   **Section 3 (Test Case Scope & Dual-Risk Profile):** Objective, Preconditions, Expected Results, Auth Requirement (`GetTestCaseSpecifications`), Technical Risk, Business Risk.
    *   **Section 4 (Verified Model Elements & Testability Profile):** Target microflows, pages, entities, attributes referenced.
    *   **Section 5 (Chronological Step Sequence Plan):** Compare approved steps line-by-line with created steps (`GetTestSteps`), verifying step types, predecessors, settings (`"Always"`/`"_Continue"` vs `"None"`/`"_Stop"`), and `[Pattern: ...]` annotations.
    *   **Section 6 (Playwright / Browser Settings):** Verify all 10 browser setting keys/values configured on suite/setup case.
    *   **Section 7 (Data Variation Matrix & Metadata):** **Mandatory Cell-by-Cell Verification**: Call `GetTestCaseDataVariationsDetails` (or `GetTestSuiteDataVariationsDetails`) and verify every variation system name, description, input attribute value, microflow parameter, return value assertion, object count, exception string, and validation feedback string against Section 7 matrix.
    *   **Section 8 (Applied Testing Patterns & Rationale):** Verify pattern explanations match pattern annotations written into step descriptions via `SetTestStepNameDescription`.
2. **MTA Server Validation Audit (Compiler Check):** Show retrieved compiler or configuration errors from `GetTestConstructionErrorsOfTestCase`. Report the output. If any compilation errors are found, they **MUST** be resolved before proceeding.
3. **Rules & Best Practices Checklist (Skill Conformity):** Verify and confirm that:
    * **Piping Integrity:** Every consumer step references its producer's returned memory outputs (like created object keys) dynamically, with zero hardcoding.
    * **Execution topology:** All setup, teardown, and database-seeding steps are set to `"Always"` execution with `"_Continue"` exception handling.
    * **Empty Object retrieves:** Any conditional null parameter retrieves use `RetrieveOption = "Teststep"`.
    * **Data Matrix Conformity:** Every created Data Variation has its `Name` and `Description` explicitly configured (`PAT-77`), zero empty descriptions exist (`ANTI-31`), and all variation item values match the Execution Plan matrix cell-by-cell (`PAT-54`).
    * **Zero Data in Names:** Step names are purely action-descriptive with zero raw test data in the titles, conforming to the `[Action] [WidgetType] '[FieldDescriptor]' [Input/Button]` template.
    * **Single Persist Check:** No redundant per-step `Persist` steps exist; creations/deletions of multiple objects are committed via a single grouped `Persist` step at the end.
    * **No Sequential Batching Violations:** No steps were created in parallel in a single turn; sequential steps were built one-by-one waiting for their predecessor keys.
    * **No Flaky Sleeps:** Zero sleep/delay steps exist in the test sequence.
    * **Execution & Assertion Settings:** For Backend Unit tests, ALL steps (including asserts) use `ExecutionCondition = "None"` and `ResumeExecutionAfterException = "_Stop"` (`PAT-17`). For Frontend UI and Backend Integration tests, assertions default to `"ContinueTestRun"` or `"_Continue"` exception handling (`PAT-33`).
    * **Date Format Casing:** All date-picker formats use uppercase `MM` for months (converting any lowercase `mm` used in date-only context to avoid minute fields overrides).
    * **Retrieve for Assertions:** Retrieve steps used for asserting objects configure explicit or piped dynamic attribute filters with `RetrieveSet = "All"`, coupled with an immediate downstream `Assert Object Count` step (`PAT-07`, `PAT-13`, `PAT-31`).
    * **Cascading Consumer Check:** No step executes on a skipped provider step (downstream consumers of skipped steps must also be set to `"Skip"`).
    * **Cascading Provider Check:** If a teardown/cleanup step is `"Always"`, all of its upstream input provider steps are also set to `"Always"`.
    * **Order of Operations Check:** Memory retrieves called `SetRetrieveSettingsOfTestStep(RetrieveOption = "Teststep")` before attempting to retrieve or set select objects.
    * **Integer Piping Datatype Check:** All binding and piping keys passed in tool payloads (e.g. `TestStepOutputKey`) are raw, unquoted integers, never quoted strings.
4. **Direct MTA Web Navigation Links:** Provide direct clickable markdown links (plain text without emojis) to the constructed/verified MTA assets using the official MTA URL pattern `[MtaBaseUrl]/p/[ObjectType]/[Key]`:
    * **Test Configuration:** `[ConfigName]([MtaBaseUrl]/p/testconfiguration/[ConfigKey])`
    * **Test Suite:** `[SuiteName]([MtaBaseUrl]/p/testsuite/[SuiteKey])`
    * **Test Case(s):** `[TestCaseName]([MtaBaseUrl]/p/testcase/[CaseKey])`
    * **Saved Execution Plan:** `[ExecutionPlanKey]([MtaBaseUrl]/p/executionplan/[ExecutionPlanKey])`

*   👉 **Read:** [MTA Golden Rules Reference](golden-rules.md) | [MTA API Helpers Reference](api-helpers.md) | [MTA Data Variations Reference](data-variations.md) | [MTA Troubleshooting Guide](troubleshooting.md)

---

### 5. `STATE_RUN_ANALYZE` (State 5)
*   **Execution:** Call `ExecuteTestSuite` (recommended) or `ExecuteTestCase` (isolated dry-run). Return Execution ID and **HALT**. Do NOT auto-poll.
*   👉 **Read:** [MTA Troubleshooting Guide](troubleshooting.md)

---

### `STATE_QA_ASSISTANCE` (Out-of-Band State)
*   **Inquiry:** Pauses active test building to address tangents, questions, or explanations.
*   **🚨 Resumption Halt Gate (MANDATORY):** Before transitioning back to resume the active building or execution state, the assistant **MUST HALT** and explicitly ask the user for approval to proceed (e.g., "Would you like to resume test building according to our approved plan?"). This ensures the user has a chance to ask further questions before test construction continues.
*   👉 **Read:** [MTA Glossary & Syntax Map](glossary.md)
