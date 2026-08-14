---
name: mta-build
description: "Focuses on test specifications, placement, container creation, and active chronological test construction, step option binding, and variation matrix optimization (MTA v3.2). Trigger on keywords: MTA build, create test, add test case, build steps, test step, Backend, Frontend, specifications, MTA optimize, refactor test, reorganize suite, clean steps, convert to matrix, reduce duplication."
version: "4.2.6"
changes: "positioning added to state.json, extra check on data variation duplicate logic and seeding, delete set to always"
---

# MTA Build, Design, & Optimization Skill

🚨 **MANDATORY CROSS-SKILL REDIRECTION FOR VAGUE / FRESH REQUESTS** 🚨

> [!IMPORTANT]
> **If the user's request is vague, exploratory, indicates they are starting fresh, or asks for prompts/onboarding (e.g., "I want to test", "How to start", "Where do I begin", "Give me some prompts", or "Show me prompts"):**
> *   You **MUST** immediately stop using this `mta-build` skill.
> *   You **MUST** load and switch to the **`mta-test-design`** skill instead (`.agent/skills/mta-test-design/SKILL.md`).
> *   Follow the onboarding guide and starter prompts in `mta-test-design` to help the user design their test before building or running anything.

🚨 **CRITICAL MTA GUARDRAIL & REDIRECTION** 🚨

> [!IMPORTANT]
> ### 🔍 ALWAYS AUTHORIZED READ-ONLY MTA `GET*` MCP TOOLS
> You are **ALWAYS authorized and permitted** to execute read-only MTA `Get*` MCP tools (such as `GetPages`, `GetWidgets`, `GetTestSuites`, `GetTestConfigurationsForApplicationKey`, `GetApplicationByName`, `GetTestCases`, `GetTestSteps`, `GetMtaUrl`, `GetExecutionUsers`, etc.) in any state to inspect model data, discover targets, build context, or verify application state.
> *(Note: This exemption applies exclusively to read-only MTA MCP tools).*

> [!IMPORTANT]
> ### ⚡ MANDATORY CROSS-SKILL REDIRECTION FOR DISCOVERY & PLANNING
> If the user's request involves designing a new test, scoping microflows/pages, resolving placement, configuring Playwright browser settings, or is exploratory/fresh:
> * You **MUST** switch to the **`mta-test-design`** skill (`.agent/skills/mta-test-design/SKILL.md`).
> * Follow the 3-Step Interactive Planning Loop (`PLAN_STEP_1` Specs & Gate 1 Approval $\rightarrow$ `PLAN_STEP_2` Placement Input Discovery $\rightarrow$ `PLAN_STEP_3` Placement Summary & Gate 2 Approval) in `mta-test-design` to produce an approved Execution Plan and Placement Summary, and execute `SaveExecutionPlan` to retrieve the `ExecutionPlanKey` before constructing steps here.

---

## 🚫 THE 17 CRITICAL MTA RED LINES (GOLDEN RULES)

You **MUST** strictly follow the Golden Rules defined in `references/core-playbook.md` at all times. Here is a brief checklist of active construction boundaries:
1. **No conversational refusals**: Transition to `[STATE_QA_ASSISTANCE]` if the user asks conceptual or general questions.
2. **No parallel or batched creations**: Create cases and steps sequentially, waiting for Key N's response before building step N+1.
3. **No dummy predecessor keys**: Pass predecessor keys of `0` for absolute first elements. For subsequent elements, query the last active element's key to append chronologically.
4. **Mandatory Dual-Gate Plan & Placement Approval**: You **MUST** draft the Execution Plan, run the Pre-Approval Self-Audit Report, and **HALT** for explicit user approval (**Gate 1**). Then, gather placement inputs, present the **Placement & Target Summary Box**, and **HALT** for explicit user approval (**Gate 2**) before executing `SaveExecutionPlan` or creating any assets on the server.
5. **Atomic Multi-Case Session Construction & `ExecutionPlanKey` Protocol**: In UI or multi-case tests, do not halt sequentially for browser setup or separate cases. Before entering `STATE_CONSTRUCTION`, call `SaveExecutionPlan` (upon receiving explicit Gate 2 approval at the end of `STATE_BUILD_PLANNING`) to save the approved plan on the server and retrieve the numeric `ExecutionPlanKey`. Upon entering `STATE_CONSTRUCTION` with this active `ExecutionPlanKey`, atomically construct all containers, set up browser options, and build chronological steps in a single execution sweep.
6. **Execution Settings Distinction (_Always vs. None)**: 
   *   **Frontend & Multi-Case Tests:** You **MUST** configure all setups, teardowns, and database seeding/cleanup steps with `ExecutionCondition = "_Always"` (or `"Always"`) and `ResumeExecutionAfterException = "_Continue"`. Specifically, database Seeding in Case 1 (Setup Test Case) and Delete/Cleanup in Case 3 (Teardown Test Case) MUST ALWAYS be set to `_Always` / `"Always"`. This guarantees database and browser cleanups execute reliably even if intermediate UI steps fail.
   *   **Backend Unit Tests:** You **MUST** set ALL test steps in a Backend Unit Test (including Create Object and setup steps) to `ExecutionCondition = "None"` and `ResumeExecutionAfterException = "_Stop"`. Do NOT call `SetExecutionSettingsOfTestStep` to set them to `"Always"`, `"_Always"`, or `"_Continue"`. Since the entire testcase has rollback enabled (`RollbackTcseAfterExecution = "Yes"`), skipping downstream steps upon failure is the standard expected behavior.
   *   **Backend Integration Tests:** In Backend Integration / Process Orchestration tests with multi-case database seeding/teardown steps, configure setup/teardown steps with `ExecutionCondition = "_Always"` (or `"Always"`) and `ResumeExecutionAfterException = "_Continue"`.
7. **Mandatory GetPages & GetWidgets Upfront Execution (Frontend)**: Always call `GetPages` and `GetWidgets` first when building Frontend execution plans, and immediately present a fully detailed Execution Plan with all steps and configurable options before conducting any optional second-pass deep model inspection.
8. **No raw Playwright bypasses**: Rely exclusively on Menditect Frontend Testkit.
9. **Strict State Isolation**: Output your concise chain of thought in the `🧠 Tool Execution Reasoning` format before every tool call.
10. **Strict Direct Link Formatting**: Web links must follow `[MtaBaseUrl]/p/[ObjectType]/[Key]` exactly.
11. **🚫 STRICT DATA VARIATION PROMOTION & EXHAUSTIVE CELL RECONCILIATION LAW**: 
    *   **Proactive Variation Identification:** For all Backend tests, you **MUST** actively seek to use MTA **Data Variations** rather than designing or proposing separate, duplicate test cases that only modify input data. Proposing duplicate test cases with different inputs is a severe quality violation.
    *   **Consolidate to a Single Test Structure:** If multiple scenarios (e.g. happy path, boundary values, invalid inputs) can be tested using the same sequential step sequence, you **MUST** design a single, reusable test case structure and enable Data Variations to define a variation matrix.
    *   **Exhaustive $M \times N$ Matrix Cell Reconciliation Law:** Calling `DuplicateTestCaseDataVariation` (or `DuplicateTestSuiteDataVariation`) ONLY allocates a new variation column container. It DOES NOT set scenario values. You are strictly prohibited from performing "delta-only overrides" or assuming copied columns inherit correct values. After duplicating columns, you MUST call `GetTestCaseDataVariationsDetails`, iterate through **EVERY SINGLE CELL $(i, j)$** in the $M \times N$ matrix, compare the live MTA value against the Execution Plan matrix, and explicitly call the setter tool for every cell that does not match.
    *   **Dual Retrieve/Filter Empty Object Law (Data Variations):** In MTA Data Variations, step structure and association setters are fixed across all variations. You **CANNOT** set or unset an association directly inside a Data Variation item. To dynamically vary between a valid object and an `empty` (NULL) object across variations:
        1. *For Microflow Parameters:* Create a Retrieve/Filter step filtering on a target attribute (e.g. `LicensePlate`). Set filter = `'TEST_VAL'` for valid object variations, or `'NON_EXISTENT'` for null object variations. Pass the Retrieve step output to the microflow parameter.
        2. *For Associations:* Create a Retrieve/Filter step for the associated parent entity filtering on an attribute (e.g. `Code`). Set filter = `'TEST_CODE'` for associated variations, or `'NON_EXISTENT'` for unassociated variations. Pass the Retrieve step output to the association setter step.
    *   **Mandatory User Alignment Gate:** If you are in doubt about whether different inputs warrant separate test cases or should be consolidated into a data variation matrix, **you MUST halt and ask the user for their preference BEFORE proposing a test specification or build plan.**
12. **Untestable Component Escape Hatch**: If you identify a very large microflow or one with many sub-microflows that is impossible to test thoroughly or where data seeding is extremely difficult, stop and suggest both to yourself (the AI) and the user to load and consult the **`menditecttestabilityframework`** skill to learn how to refactor it for testability.
13. **Void Microflow Build-Plan Guardrail (Prevent Warning Fatigue)**:
    *   **The Guardrail:** If asked to build a test for a void microflow (no return value/output parameters) as the main component under test (excluding setup/teardown utility cases), you **MUST** evaluate its complexity. Only raise warnings or prompt for downstream database retrieve checks if the microflow is complex (e.g., has sub-microflows) or commits/modifies multiple critical domain model entities. If the void microflow is trivial or stateless (e.g., writes a single log line or changes a single status boolean), do NOT raise warnings or halt.
    *   **Sub-Microflow Warning:** If a complex void microflow is being tested and sub-microflows are present, highlight that deep, careful side-effect analysis is even more complex and critical.
14. **Real-Time Test Case Placement Key Persistence**: Upon executing `CreateTestSuite` or `CreateTestCase`, you **MUST** immediately write the returned numeric MTA database keys (`test_suite.key`, `test_cases[].key`, `test_suite_key`, `test_configuration_key`, `execution_plan_key`, `status: "Created"`) into `mta_state.json`. In `STATE_SMOKE_AUDIT` and `STATE_RUN_ANALYZE`, always read `mta_state.json` to load these created keys for `GetTestConstructionErrorsOfTestCase(key)`, `GetTestSteps(key)`, and `ExecuteTestCase(key)`.
    *   **The Action:** In `STATE_BUILD_PLANNING` for complex void microflows, you must issue a prominent warning advising that an exception-only assertion is highly limited. Propose adding downstream database Retrieve steps (for Backend) or page inspection steps (for Frontend) to verify the actual expected state changes or entity modifications.
    *   **Testability Refactoring Suggestion:** Proactively advise the user that they can refactor the Mendix microflow to return a value (such as the primary record created or a status flag) to simplify test verification.
14. **Allowed Operational States for Parameter Setters & AALC Assertions**:
    *   You are strictly prohibited from calling `MicroflowParameterValue` setters and `AssertAttributeValueCompare` (AALC) builders during planning, discovery, or placement states.
    *   These tools are exclusively permitted inside **`[STATE_CONSTRUCTION]`**, **`[STATE_STEP_BINDING]`**, or **`[STATE_ASSERT_CONSTRUCTION]`**.
15. **Incremental Construction Success Verification Checklist**:
    *   **The Guardrail:** During step building inside `[STATE_CONSTRUCTION]`, you **MUST** verify step creation success incrementally using MTA MCP tools.
    *   **The Action:** Immediately after creating or configuring a complex step block (such as after setting parameters via `MicroflowParameterValue` tools, creating `AssertAttributeValueCompare` builders, or adding custom associations), you **MUST** call `GetTestConstructionErrorsOfTestCase` targeting the active testcase key. 
    *   **The Failure Gate:** If any validation error, option-binding, mapping, or coordinate failure is returned, you **MUST NOT** proceed to construct subsequent steps. You **MUST** stop, analyze the validation errors, and fix the active step before building further.
16. **Strict Block on Construction for Incomplete Placement or Playwright Settings**:
    *   You are **strictly prohibited** from entering `STATE_CONSTRUCTION` or calling construction tools (`CreateTestStep`, etc.) if placement parameters (Test Configuration, Test Suite, Test Case Name) or Frontend Playwright browser settings are missing, unconfirmed, or incomplete.
    *   Part 1 (Test Specification), Part 2 (Placement), and Part 3 (Playwright Settings for Frontend) of the Execution Plan **MUST** be 100% complete and explicitly approved by the user before construction can begin.
17. **Playwright 3 Conflict Options Tool Execution Law (Frontend Construction)**:
    *   *Option 1 (Inherit Existing Suite Settings):* Do NOT call Playwright configuration microflows on the suite. Construct new action steps after existing steps, before teardown.
    *   *Option 2 (Override Suite Settings):* Execute Playwright configuration microflow steps on the suite key to apply the new 10 Playwright settings before appending test steps.
    *   *Option 3 (New 3-Case Pattern Block):* Call `CreateTestCase` to provision a dedicated new 3-case set (*Setup*, *Action*, *Teardown*) in the suite below existing tests, apply Playwright configuration steps to the setup case, and construct action steps inside the new case.
18. **Mandatory Test Step Description Pattern Annotation Law**:
    *   **The Guardrail:** During `STATE_CONSTRUCTION`, whenever you build a test step that implements a specific testing pattern (such as *Retrieve / Microflow Output Object Count Assertion*, *Backend-First Delete*, *Empty Object / Conditional Null Filter*, *Validation Feedback Assertion (Backend Only)*, *Void Microflow Side-Effect*, etc.), you **MUST** call `SetTestStepNameDescription` on that `TestStepKey`.
    *   **Tool Parameters:** Set `ActionWithName = "Omit"` (or `"Set"` if updating the step name), `ActionWithDescription = "Set"`, and `Description = "[Pattern: <Pattern Name> - <Short Rationale>]"`.
    *   **Consistency:** The annotation string MUST match the pattern and rationale specified in Section 4 of the approved Execution Plan.
19. **Direct Attribute & Association Initialization on Create Object Law**:
    *   Whenever an object is instantiated via a `Create Object` test step (`CreateTestStepCreateObject`), ALL initial attribute values and association bindings MUST be set directly on the `Create Object` test step itself. Creating a separate `Change Object` test step immediately following a `Create Object` step to set initial attributes or associations is strictly **PROHIBITED**.

---

## 📅 STRICT REACTIVE LOADING STRATEGY

To maximize token efficiency, **DO NOT load reference files preemptively**, except for `core-playbook.md` on the first active turn. Load other reference files **strictly on-demand** based on the request:

| User request mentions... | ...then load ONLY this file: |
| --- | --- |
| *MTA request startup, workflow modes, transitions, or core rules* | **`references/core-playbook.md`** (Preemptive) |
| *Backend/API testing, taxonomies, associations, assertions, REST APIs* | **`references/api-helpers.md`** |
| *Data matrices, scenarios, date offsets, variation items, or matrices* | **`references/data-variations.md`** |
| *UI widgets, buttons, inputs, pages, or element locators* | **`references/frontend-testing.md`** |
| *Playwright connector APIs, options, coordinate entities, or enums* | **`references/playwright-api.md`** |
| *Design-time warnings, step compilation warnings, sequence issues* | **`references/troubleshooting.md`** |
| *Unfamiliar technical acronyms, prefixes, or parameter glossary* | **`references/glossary.md`** |
| *Test case placement, hierarchy, lifecycles, database/memory piping, setups* | **`references/placement-and-lifecycle.md`** |
| *Execution conditions, cascading skip/provider, rollback defaults* | **`references/execution-settings.md`** |
| *Predecessor chaining, zero-data, golden rules, piping structures* | **`references/golden-rules.md`** |

> [!IMPORTANT]
> **🚫 STRICT BACKEND VS FRONTEND ISOLATION:**
> - If the user selects **Backend**, you are **strictly prohibited** from loading or referencing `references/frontend-testing.md` or `references/playwright-api.md`, even if their prompt mentions "pages", "inputs", "buttons", or other UI keywords.
> - For **Backend**, keep your focus exclusively on `references/api-helpers.md` (microflows, associations, database actions, assertions, and REST API calls). If the user tries to add form/UI steps to a Backend test, reject it immediately and politely explain that Backend is headless/backend-only.
> - Conversely, for **Frontend**, avoid using backend-only assertions and pure microflow-testing logic unless strictly used as a database setup/teardown utility.

---

## 🧭 MACRO-STATE AND WORKFLOW COORDINATION
This skill is activated and coordinated by the global orchestrator (`agents.md`) across three distinct, un-bypassable macro-states representing the core phases of test generation. Use the exact State Header for each phase:

1. **Phase 1: `STATE_BUILD_PLANNING`**
   - *State Header:* `[State: STATE_BUILD_PLANNING | Temp State: None | Active Skill: mta-test-design]`
   - *Milestone:* Design chronological action sequences, map variation matrices, execute the Pre-Approval Self-Audit Report, obtain user approval, and execute `SaveExecutionPlan` to save the approved plan on the server and retrieve the `ExecutionPlanKey`.

2. **Phase 2: `STATE_CONSTRUCTION`**
   - *State Header:* `[State: STATE_CONSTRUCTION | Temp State: [STATE_CASE_CREATION | STATE_STEP_CREATION] | Active Skill: mta-build]`
   - *Milestone:* Actively construct test steps, option bindings, parameters, and assertions on the server (unlocked only if a valid `ExecutionPlanKey` is present).
   - **Track-Specific Execution Style:**
     *   **Agentic Track:** Call programmatic MCP tools (such as `CreateTestStep`, `SetBooleanAttributeValue`, `CreateTestStepPersist`, etc.) sequentially in the background. Output a clear `🧠 Tool Execution Reasoning` markdown explanation before every single call. Wait for Key N's response before initiating Step N+1.
     *   **Chat Track:** You have no write/execute tools. For each step of the approved Execution Plan, generate the exact, complete JSON payloads and parameters to execute. Instruct the user clearly where to paste or run these inputs, and wait for the user to confirm completion before outputting the next payload.

3. **Phase 3: `STATE_SMOKE_AUDIT`**
   - *State Header:* `[State: STATE_SMOKE_AUDIT | Temp State: None | Active Skill: mta-build]`
   - *Milestone:* Run the programmatic server compiler checks (`GetTestConstructionErrorsOfTestCase`), perform a **100% Full-Content Audit of ALL 8 Sections of the saved Execution Plan** (`GetExecutionPlan`, `GetTestSteps`, `GetTestCaseDataVariationsDetails` / `GetTestSuiteDataVariationsDetails`), and output the Post-Construction Smoke Audit Report (unlocked only if a valid `ExecutionPlanKey` is present).
   - **Mandatory 8-Section Plan Conformity Audit:**
     1. **Section 1 (Metadata & Placement):** App, Config, Suite, Case Name, Category, Execution User (`EXUS_ExecutionUser`).
     2. **Section 2 (Documentation):** Objective, Preconditions, Expected Results, Auth Requirement (`GetTestCaseSpecifications`).
     3. **Section 3 (Risk Alignment):** Technical Risk, Business Risk, Intended Use.
     4. **Section 4 (Verified Elements):** Target microflows, pages, entities, and attributes referenced across steps.
     5. **Section 5 (Step Sequence):** Line-by-line check of created steps (`GetTestSteps`) vs Section 5 (step types, sequence, predecessors, execution settings `"Always"`/`"_Continue"` vs `"None"`/`"_Stop"`, pattern annotations).
     6. **Section 6 (Playwright Browser Settings):** Verify all 10 browser setting keys/values configured on suite/setup case.
     7. **Section 7 (Data Variation Matrix & Metadata):** **Cell-by-cell & item-by-item audit**: Call `GetTestCaseDataVariationsDetails` (or `GetTestSuiteDataVariationsDetails`) and verify system names, descriptions, input attribute/parameter overrides, return value assertions, object counts, exception strings, and validation feedback strings against Section 7 matrix.
     8. **Section 8 (Applied Testing Patterns & Rationale):** Verify pattern explanations match pattern annotations written into step descriptions via `SetTestStepNameDescription`.
   - **Track-Specific Execution Style:**
     *   **Agentic Track:** Call `GetExecutionPlan(ExecutionPlanKey)` to fetch the approved plan. Call `GetTestConstructionErrorsOfTestCase(TestCaseKey)` for compiler checks. Call `GetTestSteps(TestCaseKey)` to audit steps line-by-line. Call `GetTestCaseDataVariationsDetails(TestCaseKey)` (or `GetTestSuiteDataVariationsDetails`) to audit every variation item and cell value against Section 7. Generate and output the Post-Construction Smoke Audit Report, including direct clickable MTA Web navigation links (`[MtaBaseUrl]/p/[ObjectType]/[Key]`) for target Config, Suite, Case(s), and Execution Plan.
     *   **Chat Track:** Instruct the user to run compiler checks in the MTA Web console, verify zero errors, and copy-paste variation/step details into chat. Then compile and output the Post-Construction Smoke Audit Report based on their input, including direct clickable MTA Web navigation links (`[MtaBaseUrl]/p/[ObjectType]/[Key]`).

When the smoke audit is successfully validated and approved by the user, prompt the user: *"The test cases and steps have successfully passed validation and are fully built. Would you like to transition to execution (`STATE_RUN_ANALYZE`) and run the tests?"*

---

## 🔄 MCP Tool Description Context & Bridge Rule

> [!NOTE]
> **MTA Tool Context Mapping:**
> The MTA MCP tools and schemas refer to the "mta skill" or "MTA". Since we have split the monolithic `mta` skill into `mta-build` and `mta-run-analyze`, treat all tool schema references to "mta skill" as referring to these two specialized skills.
