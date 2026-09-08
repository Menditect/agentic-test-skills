---
name: mta-build
description: "Focuses on test specifications, placement, container creation, active chronological test construction, step option binding, and variation matrix optimization (MTA v3.2). Trigger on keywords: MTA build, create test, add test case, build steps, test step, Backend, Frontend, specifications, MTA optimize, refactor test, reorganize suite, clean steps, convert to matrix, reduce duplication, test data creation/deletion steps, batch persist pipelines, and object lifecycle sequencing."
version: "6.5.0"
changes: "Enforced Zero Disconnect Between Plan and Build, Deterministic 4-Phase Construction Protocol with Safe Batch Sizing (ANTI-32), Integer Revision Sealing, and Staggered Smoke Audit Reading."
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
> You are **ALWAYS authorized and permitted** to execute read-only MTA `Get*` MCP tools (such as `GetApplicationDetails`, `GetTestConfigurationDetails`, `GetAppModelData`, `GetExecutionUsers`, `GetTestSuiteDetails`, `GetTestCaseDetails`, `GetTeststepDetails`, `GetTestRunResults`) in any state to inspect model data, discover targets, build context, or verify application state. To construct clickable MTA navigation links and resolve the MCP server endpoint (`[MtaUrl]/primitivetools/mcp`), evaluate in order: (1) project-level `AGENTS.md` (`MTA Url`), (2) `mta_config.json` (`mta_base_url`), (3) `.vscode/settings.json` (`MTA_BASE_URL`), (4) `mta_state.json` (`mta_base_url`), or (5) prompt the user on turn 1.
> *(Note: This exemption applies exclusively to read-only MTA MCP tools).*

> [!IMPORTANT]
> ### ⚡ MANDATORY CROSS-SKILL REDIRECTION FOR DISCOVERY & PLANNING
> If the user's request involves designing a new test, scoping microflows/pages, resolving placement, configuring Playwright browser settings, or is exploratory/fresh:
> * You **MUST** switch to the **`mta-test-design`** skill (`.agent/skills/mta-test-design/SKILL.md`).
> * Follow the 3-Step Interactive Planning Loop (`PLAN_STEP_1` Specs & Gate 1 Approval $\rightarrow$ `PLAN_STEP_2` Placement Input Discovery $\rightarrow$ `PLAN_STEP_3` Placement Summary & Gate 2 Approval) in `mta-test-design` to produce an approved Execution Plan and Placement Summary, and store the execution plan locally as a `.md` file (or retain in active chat context if write tools are unavailable) before constructing steps here.

---

## 🚫 MTA TEST CONSTRUCTION & EXECUTION PATTERN REGISTRY

You **MUST** strictly follow the Golden Rules defined in `references/core-playbook.md` and `references/golden-rules.md` at all times. Here is the checklist of active construction boundaries:
1. **No conversational refusals [^PAT-51]**: Transition to `[STATE_QA_ASSISTANCE]` if the user asks conceptual or general questions.
2. **Deterministic 4-Phase Construction Protocol [^PAT-16] [^PAT-78] [^ANTI-05] [^ANTI-32]**:
   * **Phase 1: Sequential Step Pipeline (`SKELETON_PROVISIONING`):** Sequentially provision empty test steps forward using predecessor chaining (`TestStepBeforeKey`). Parallel step creation is strictly forbidden here because step keys must be chained.
   * **Phase 2: Step & Assertion Configuration (`BATCH_BINDING`):** Concurrently dispatch in parallel all attribute inclusions, retrieve filters, parameter values, object parameter bindings, and assertions across resolved step keys in a single turn.
   * **Phase 3: Variation Item Registration (`VARIATION_REGISTRATION`):** Concurrently dispatch **ALL** planned `AddTestCaseVariationItem` calls in a **SINGLE response turn**. Sequential single-item registration loops are strictly prohibited (`ANTI-32`).
   * **Phase 4: Variation Column Population (`VARIATION_POPULATION`):** For each variation column created via `CreateTestCaseVariation`, inspect cloned item keys, then configure the **entire variation column in EXACTLY 1 turn** by concurrently dispatching all cell edits (`EditAttributeValue`, `EditAssert*`), `SetName`, and `SetDescription`. Iterating across multiple turns per column is strictly prohibited (`ANTI-32`).
   * **Safe Batch Sizing (Max 15-20 Calls/Turn):** If any batch configuration or variation population phase requires more than 20 tool calls, split the dispatches into chunks of **15 to 20 tool calls per turn** to avoid model context or token generation limits.
   * **Partial Failure Handling (No Server Transactions):** Because the MTA MCP tools do not support server-side transactions, if an individual call fails within a batch, parse the response, isolate the failed step/setter, and retry or surgically fix it rather than failing the entire test build.
3. **No dummy predecessor keys [^PAT-15]**: Pass predecessor keys of `0` for absolute first elements. For subsequent elements, query the last active element's key to append chronologically.
4. **Mandatory Dual-Gate Plan & Placement Approval [^PAT-43]**: You **MUST** draft the Execution Plan, run the Pre-Approval Self-Audit Report, and **HALT** for explicit user approval (**Gate 1**). Then, gather placement inputs, present the **Placement & Target Summary Box**, and **HALT** for explicit user approval (**Gate 2**) before saving the plan or creating any assets on the server.
5. **Atomic Multi-Case Session Construction, Revision Sealing & Drift Gating [^PAT-44]**: In UI or multi-case tests, do not halt sequentially for browser setup or separate cases. Before entering `STATE_CONSTRUCTION`, ensure the approved Execution Plan is saved locally as a `.md` file sealed with YAML frontmatter (UUID v4 `plan_id`, integer `revision`, ISO 8601 `approved_at`) with user notification and clickable sealed receipt displayed (or retained in active chat context with a warning if write tools are unavailable) upon receiving Gate 2 approval at the end of `STATE_BUILD_PLANNING`. Upon entering `STATE_CONSTRUCTION`, verify plan revision and timestamp against active state (drift detection). If drift is detected, present the Soft Reconciliation Choice (Accept Changes & Re-Sign vs Halt & Revert). Once verified, atomically construct all containers, set up browser options, and build chronological steps in a single execution sweep.
6. **Execution Settings Distinction (_Always vs. None) [^PAT-17] [^PAT-18] [^ANTI-07]**: 
   *   **Frontend & Multi-Case Tests:** You **MUST** configure all setups, teardowns, and database seeding/cleanup steps with `ExecutionCondition = "_Always"` (or `"Always"`) and `ResumeExecutionAfterException = "_Continue"`. Specifically, database Seeding in Case 1 (Setup Test Case) and Delete/Cleanup in Case 3 (Teardown Test Case) MUST ALWAYS be set to `_Always` / `"Always"`. This guarantees database and browser cleanups execute reliably even if intermediate UI steps fail.
   *   **Backend Unit Tests:** You **MUST** set ALL test steps in a Backend Unit Test (including Create Object, microflow call, retrieve, and assertions) to `ExecutionCondition = "None"` and `ResumeExecutionAfterException = "_Stop"`. Do NOT call `EditTestStep` to set them to `"Always"`, `"_Always"`, or `"_Continue"`. Since the entire testcase has rollback enabled (`RollbackTcseAfterExecution = "true"`), skipping downstream steps upon failure is the standard expected behavior.
   *   **Backend Integration Tests:** In Backend Integration / Process Orchestration tests with multi-case database seeding/teardown steps, configure setup/teardown steps with `ExecutionCondition = "_Always"` (or `"Always"`) and `ResumeExecutionAfterException = "_Continue"`.
7. **Mandatory GetAppModelData Upfront Execution (Frontend) [^PAT-35] [^PAT-36]**: Always call `GetAppModelData` (`RetrieveAction="RetrievePagesByApplicationAndTestConfiguration"` / `"RetrieveWidgetsByPage"`) first when building Frontend execution plans, and immediately present a fully detailed Execution Plan with all steps and configurable options before conducting any optional second-pass deep model inspection.
8. **No raw Playwright bypasses [^PAT-05] [^ANTI-12]**: Rely exclusively on Menditect Frontend Testkit.
9. **Strict State Isolation [^PAT-45]**: Output your concise chain of thought in the `🧠 Tool Execution Reasoning` format before every tool call.
10. **Strict Direct Link Formatting [^PAT-46]**: Web links must follow `[MtaBaseUrl]/p/[ObjectType]/[Key]` exactly. Available `ObjectTypes`: `testconfiguration`, `testsuite`, `testcase`, `testrun`, `testsuiterun`, `testcaserun`.
11. **🚫 STRICT DATA VARIATION PROMOTION & EXHAUSTIVE CELL RECONCILIATION LAW [^PAT-19] [^PAT-27] [^PAT-54] [^PAT-77] [^ANTI-08] [^ANTI-11] [^ANTI-31]**: 
    *   **Proactive Variation Identification:** For all Backend tests, you **MUST** actively seek to use MTA **Data Variations** rather than designing or proposing separate, duplicate test cases that only modify input data. Proposing duplicate test cases with different inputs is a severe quality violation (`ANTI-08`).
    *   **Consolidate to a Single Test Structure:** If multiple scenarios (e.g. happy path, boundary values, invalid inputs) can be tested using the same sequential step sequence, you **MUST** design a single, reusable test case structure and enable Data Variations to define a variation matrix (`PAT-19`).
    *   **Zero Disconnect Execution Plan Variation Item Lock (`ANTI-32`):** The Data Variation Items registered on the server via `AddTestCaseVariationItem` **MUST strictly match** the variation items declared in Section 7 of the approved Execution Plan. You are **strictly prohibited** from improvising or adding any attribute, parameter, retrieve filter, or assertion to the variation matrix that is not explicitly declared as a variation item in the approved plan.
    *   **Mandatory Variation Container Metadata & Description Persistence (`PAT-77`, `ANTI-31`):** When creating or promoting data variations, you **MUST** configure both the Name and Description on the MTA server for every variation container:
        1. *Template Variation (Scenario #1):* Upon calling `EnableTestCaseDataVariations`, immediately call `EditTestCaseVariation (SetName)(TemplateVariationKey, Name)` AND `EditTestCaseVariation (SetDescription)(TemplateVariationKey, Description)`.
        2. *Duplicated Variations (Scenarios #2..#N):* For each column created via `CreateTestCaseVariation`, immediately call `EditTestCaseVariation (SetName)(NewVariationKey, Name)` AND `EditTestCaseVariation (SetDescription)(NewVariationKey, Description)` matching Section 7 of the Execution Plan. Leaving descriptions empty or unpersisted on the server is strictly prohibited (`ANTI-31`).
    *   **Exhaustive $M \times N$ Matrix Cell Reconciliation Law (`PAT-54`, `ANTI-11`):** Calling `CreateTestCaseVariation` (or `DuplicateTestSuiteDataVariation`) ONLY allocates a new variation column container. It DOES NOT set scenario values. You are strictly prohibited from performing "delta-only overrides" or assuming copied columns inherit correct values (`ANTI-11`). After duplicating columns and setting container metadata (`PAT-77`), you MUST call `GetTestCaseDetails`, iterate through **EVERY SINGLE CELL $(i, j)$** in the $M \times N$ matrix, compare the live MTA value against the Execution Plan matrix, and explicitly call the setter tool for every cell that does not match (`PAT-54`).
    *   **Dual Retrieve/Filter Empty Object Law (Data Variations) [^PAT-07]:** In MTA Data Variations, step structure and association setters are fixed across all variations. You **CANNOT** set or unset an association directly inside a Data Variation item. To dynamically vary between a valid object and an `empty` (NULL) object across variations:
        1. *For Microflow Parameters:* Create a Retrieve/Filter step filtering on a target attribute (e.g. `LicensePlate`). Set filter = `'TEST_VAL'` for valid object variations, or `'NON_EXISTENT'` for null object variations. Pass the Retrieve step output to the microflow parameter.
        2. *For Associations:* Create a Retrieve/Filter step for the associated parent entity filtering on an attribute (e.g. `Code`). Set filter = `'TEST_CODE'` for associated variations, or `'NON_EXISTENT'` for unassociated variations. Pass the Retrieve step output to the association setter step.
    *   **Mandatory User Alignment Gate:** If you are in doubt about whether different inputs warrant separate test cases or should be consolidated into a data variation matrix, **you MUST halt and ask the user for their preference BEFORE proposing a test specification or build plan.**
12. **Untestable Component Escape Hatch [^PAT-26]**: If you identify a very large microflow or one with many sub-microflows that is impossible to test thoroughly or where data seeding is extremely difficult, stop and suggest both to yourself (the AI) and the user to load and consult the **`menditecttestabilityframework`** skill to learn how to refactor it for testability.
13. **Void Microflow Build-Plan Guardrail (Prevent Warning Fatigue) [^PAT-04] [^ANTI-13]**:
    *   **The Guardrail:** If asked to build a test for a void microflow (no return value/output parameters) as the main component under test (excluding setup/teardown utility cases), you **MUST** evaluate its complexity. Only raise warnings or prompt for downstream database retrieve checks if the microflow is complex (e.g., has sub-microflows) or commits/modifies multiple critical domain model entities. Use `RetrieveByAssociation` and the structure of the domain model to find the right objects. Warn the user if objects are modified that cannot be retrieved. If the void microflow is trivial or stateless (e.g., writes a single log line or changes a single status boolean), do NOT raise warnings or halt.
    *   **Sub-Microflow Warning:** If a complex void microflow is being tested and sub-microflows are present, highlight that deep, careful side-effect analysis is even more complex and critical.
    *   **The Action:** In `STATE_BUILD_PLANNING` for complex void microflows, you must issue a prominent warning advising that an exception-only assertion is highly limited. Propose adding downstream database Retrieve steps (for Backend) or page inspection steps (for Frontend) to verify the actual expected state changes or entity modifications.
    *   **Testability Refactoring Suggestion:** Proactively advise the user that they can refactor the Mendix microflow to return a value (such as the primary record created or a status flag) to simplify test verification.
14. **Real-Time Test Case Placement Key Persistence [^PAT-47]**: Upon executing `CreateTestSuite` or `CreateTestCase`, you **MUST** immediately write the returned numeric MTA database keys (`test_suite.key`, `test_cases[].key`, `test_suite_key`, `test_configuration_key`, `status: "Created"`), along with `execution_plan_file`, `execution_plan_id`, `execution_plan_approved_at`, `execution_plan_revision`, and `execution_plan_supersedes_id` into `mta_state.json` (if in Agentic Mode) OR update the Session Compaction Block in your response (if in Chat Mode). In `STATE_SMOKE_AUDIT` and `STATE_RUN_ANALYZE`, always read `mta_state.json` (or the Compaction Block) to load these created keys for `GetTestCaseDetails(key)`, `GetTeststepDetails(key)`, and `ExecuteTest(key)`.
15. **Zero-Redundant-Query Construction Law [^PAT-71] [^ANTI-26]**: When entering `STATE_CONSTRUCTION` with an approved Execution Plan, you **MUST** treat the approved plan as the complete, authoritative Single Source of Truth (SSOT). You are **strictly prohibited** from re-executing `mxcli` discovery queries (`DESCRIBE MICROFLOW`, `DESCRIBE PAGE`, `DESCRIBE ENTITY`, `SHOW *`) or querying the Mendix model during step construction. All step types, parameter names, entity qualified names, attribute mappings, locator keys, and assertion criteria are already fully resolved in the plan. Proceed directly with sequential MTA API calls (`CreateTestCase`, `CreateObjectActionTestStep`, `CreateMicroflowCallTestStep`, `Set*`).
16. **Allowed Operational States for Parameter Setters & AALC Assertions [^PAT-48]**:
    *   You are strictly prohibited from calling parameter setters, custom association builders, output binding tools, and assertions during planning, discovery, or placement states.
    *   These tools are exclusively permitted inside **`[State: STATE_CONSTRUCTION | Temp State: BATCH_BINDING]`**.
17. **Post-Batch Construction Verification [^PAT-49]**:
    *   **The Guardrail:** During `[STATE_CONSTRUCTION]`, you **MUST NOT** halt incrementally after every single step.
    *   **The Action:** After dispatching all concurrent setters and bindings during the `BATCH_BINDING` phase, you MUST verify the test case bulk via `GetTestCaseDetails` before finalizing the state transition.
    *   **The Failure Gate:** If any validation error, option-binding, mapping, or coordinate failure is detected in the bulk retrieve, you MUST stop, analyze the validation errors, and fix the failed steps.
17. **Strict Block on Construction for Incomplete Placement or Playwright Settings [^PAT-43]**:
    *   You are **strictly prohibited** from entering `STATE_CONSTRUCTION` or calling construction tools (`CreateObjectActionTestStep`, `CreateMicroflowCallTestStep`, etc.) if placement parameters (Test Configuration, Test Suite, Test Case Name) or Frontend Playwright browser settings are missing, unconfirmed, or incomplete.
    *   Part 1 (Test Specification), Part 2 (Placement), and Part 3 (Playwright Settings for Frontend) of the Execution Plan **MUST** be 100% complete and explicitly approved by the user before construction can begin.
18. **Playwright 3 Conflict Options Tool Execution Law (Frontend Construction) [^PAT-50]**:
    *   *Option 1 (Inherit Existing Suite Settings):* Do NOT call Playwright configuration microflows on the suite. Construct new action steps after existing steps, before teardown.
    *   *Option 2 (Override Suite Settings):* Execute Playwright configuration microflow steps on the suite key to apply the new 10 Playwright settings before appending test steps.
    *   *Option 3 (New 3-Case Pattern Block):* Call `CreateTestCase` to provision a dedicated new 3-case set (*Setup*, *Action*, *Teardown*) in the suite below existing tests, apply Playwright configuration steps to the setup case, and construct action steps inside the new case.
19. **Mandatory Test Step Description Pattern Annotation Law [^PAT-12]**:
    *   **The Guardrail:** During `STATE_CONSTRUCTION`, whenever you build a test step that implements a specific testing pattern (such as *Retrieve / Microflow Output Object Count Assertion*, *Backend-First Delete*, *Empty Object / Conditional Null Filter*, *Validation Feedback Assertion (Backend Only)*, *Void Microflow Side-Effect*, etc.), you **MUST** set the description via `EditTestStep` on that `TestStepKey`.
    *   **Tool Parameters:** Set `TestStepDescription = "[Pattern: <Pattern Name> - <Short Rationale>]"`.
    *   **Consistency:** The annotation string MUST match the pattern and rationale specified in Section 5 (Step Sequence) and Section 8 (Applied Testing Patterns & Rationale) of the approved Execution Plan.
20. **Direct Attribute & Association Initialization on Create Object Law [^PAT-06] [^ANTI-01]**:
    *   Whenever an object is instantiated via a `Create Object` test step (`CreateObjectActionTestStep` with `ObjectAction="CreateObject"`), ALL initial attribute values and association bindings MUST be set directly on the `Create Object` test step itself. Creating a separate `Change Object` test step immediately following a `Create Object` step to set initial attributes or associations is strictly **PROHIBITED**.
21. **Embedded Step Assertion Scoping & Create/Change Prohibition Law [^PAT-14] [^ANTI-10]**:
    *   All step-level assertions (`CreateAssertObjectCount`, `CreateAssertAttributeValueCompare`, `CreateAssertMicroflowReturnValue`, `CreateAssertException`, `CreateAssertValidationFeedbackMessageCompare`) MUST be configured as embedded child assertions directly attached to their parent `Retrieve Object` or `Microflow Call` steps (via Field 6). Declaring assertions as isolated, standalone test step containers is strictly **PROHIBITED**.
    *   Furthermore, embedded assertions are strictly **PROHIBITED** on `Create Object` and `Change Object` test steps. Initial attributes on `Create Object` and modified attributes on `Change Object` are set directly as step initializers/mutators, NOT as assertions. Assertions belong on `Retrieve Object` (Filter) steps, `Microflow Call` steps (for return values), or UI Action/Assertion steps.
22. **Domain Model Attribute Length & Constraint Compliance Law [^PAT-53]**:
    *   When configuring attribute values on test steps (`EditAttributeValue`, etc.) or adding item attribute overrides in data variations, you **MUST** ensure string values do not exceed maximum length limits defined on the target entity attributes in the Mendix Domain Model. Inspect the entity via `mxcli` (`SHOW ENTITY`) whenever proposing or binding string attribute values.
23. **Proactive Pre-Construction Model-to-MTA Schema Audit Law [^PAT-82] [^PAT-36] [^ANTI-36]**:
    *   **The Prohibition (No Trial-and-Error Building):** You are strictly prohibited from attempting to build test steps or relying on step creation errors to discover missing model elements (`ANTI-36`). Never "try and build" hoping it succeeds or using failed builds as a diagnostic mechanism.
    *   **The Mandatory First Step:** Before constructing ANY test suite, test case, or test step in MTA (or when evaluating whether an exploratory test can be promoted), you **MUST** run a schema audit using `GetAppModelData` comparing the synchronized MTA model against the local Mendix AST (`mxcli`).
    *   **Audit Scope:** Verify that all planned domain model entities, attributes, microflows, parameters, enumerations, pages, and widgets exist in MTA.
    *   **Action on Mismatch:** If any required element is missing or outdated in MTA, **HALT** immediately before dispatching any creation tools. Inform the user of the exact missing element and state that MTA requires an updated Model Revision before persistent building or promotion can proceed. Offer immediate in-memory exploratory testing via `MTA_plugin.execute-testcase` in the interim.

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
| *Auditing step sequences, validating all 118 testing patterns/anti-patterns (`PAT-01..82`, `ANTI-01..36`), auto-registering new learned patterns* | **`references/mta-patterns-and-antipatterns-reference.md`** |
| *Promoted exploratory tests, TCEX_RQ to MTA construction transformer (`PAT-70`)* | **`references/mta-plugin-mcp-schema.md`** |

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
   - *Milestone:* Design chronological action sequences, map variation matrices, execute the Pre-Approval Self-Audit Report, obtain user approval, and store the execution plan locally as a `.md` file (or retain in active chat context if write tools are unavailable).

2. **Phase 2: `STATE_CONSTRUCTION`**
   - *State Header:* `[State: STATE_CONSTRUCTION | Temp State: [SKELETON_PROVISIONING | BATCH_BINDING | VARIATION_REGISTRATION | VARIATION_POPULATION] | Active Skill: mta-build]`
   - *Milestone:* Actively construct test steps, option bindings, parameters, and assertions on the server (unlocked only if an approved Execution Plan is saved locally or verified in chat context).
      - **Step 0: Pre-Construction Plan Integrity, Ingestion & Drift Check (PAT-44):**
        *   **Agentic Mode:** Read the local Execution Plan `.md` file at `${MTA_OUTPUT_PATH}/execution-plans/EP_<TestCaseName>.md` (or path in `mta_state.json`). Inspect frontmatter to extract `plan_id`, `revision`, `approved_at`, and `supersedes_plan_id`. Compare against `execution_plan_id`, `execution_plan_revision`, and `execution_plan_approved_at` recorded in `mta_state.json`.
        *   **Mandatory Plan Ingestion & Variation Item Lock:** Parse and extract the exact list of Data Variation Items declared in **Section 7 (Data Variation Matrix & Metadata)** and cross-check against Section 5. The variation items in Section 7 are the absolute Single Source of Truth (SSOT). You are **strictly prohibited** from improvising, speculating, or adding any attributes, parameters, retrieve filters, or assertions to the variation matrix that are not explicitly defined in Section 7 (`ANTI-32`).
        *   **Integrity Verified:** If revision and approved timestamp match state, plan integrity is intact; proceed directly to Step 1.
        *   **Drift Reconciliation Gate:** If drift or unapproved file edits are detected, halt and present the Soft Reconciliation Choice:
            1. *Accept Changes & Re-Sign:* Increment `revision` (`<old_revision + 1>`), update `approved_at` timestamp, re-save frontmatter, update `mta_state.json`, and proceed to construction.
            2. *Halt & Revert:* Halt construction to allow the user to restore the original approved plan file.
      - **Step 1: Mandatory Pre-Construction Model-to-MTA Schema Audit (PAT-82, ANTI-36):**
        *   **The Prohibition (No Trial-and-Error Building):** You are strictly prohibited from attempting to build steps or relying on step creation errors to discover missing model elements (`ANTI-36`). Never "try and build" hoping it succeeds or using failed builds as a diagnostic mechanism.
        *   **The Law:** Before constructing any test suite, test case, or test steps in MTA (or when assessing whether an exploratory test can be promoted directly to MTA), you **MUST** run a schema audit using `GetAppModelData` comparing the synchronized MTA model against local Mendix AST (`mxcli`).
        *   **Audit Scope:** Compare domain model entities, attributes, microflows, parameters, enumerations, pages, and widgets in MTA to the local Mendix model AST.
        *   **Promotion Feasibility:** Use `GetAppModelData` to identify if you can promote an exploratory test directly to MTA or whether MTA needs an updated revision first.
        *   **Execution Timing:** Make this analysis the **FIRST STEP** when a user wants to build a test in MTA based on the execution plan. This should **ALWAYS** be done first, before building anything in MTA.
        *   **Mismatch Gate:** If any model element planned in the Execution Plan is missing or outdated in MTA, **HALT** construction immediately. Inform the user that the MTA Model Revision must be updated/synchronized before persistent building or promotion can proceed.
      - **Mode-Specific Execution Style:**
        *   **Agentic Mode:** Execute the **Deterministic 4-Phase Construction Protocol (`PAT-78`, `ANTI-32`)**:
            1. **Phase 1: Sequential Step Pipeline (`Temp State: SKELETON_PROVISIONING`):** Concurrently dispatch `CreateTestCase` for all cases (`PAT-79`). Sequentially create all empty test steps forward using predecessor chaining (`PAT-11`). Parallel creation of steps in the same case is strictly forbidden because each step depends on its predecessor's returned key.
            2. **Phase 2: Step & Assertion Configuration (`Temp State: BATCH_BINDING`):** Once all step keys are resolved, batch-dispatch in parallel all attribute inclusions, retrieve filters (`EditTestStepRetrieve`, `EditAttributeValueFilter`), parameter values (`EditMicroflowParameterValue`), object parameter bindings (`EditMicroflowObjectParameter`), associations (`CreateSelectObjectForAssociation`), dedicated output bindings (`SetTestStepOutputFor*`), and embedded assertions (`CreateAssertMicroflowReturnValue`, `CreateAssertObjectCount`, `CreateAssertValidationFeedback*`, `CreateAssertException`) across steps (`PAT-81`). If total calls exceed 20, chunk into batches of **15 to 20 calls per turn**. If any individual call fails, inspect the error, isolate the failed setter, and retry or surgically correct it (no server transaction rollbacks available). Single-call turn loops here are strictly prohibited (`ANTI-32`).
            3. **Phase 3: Variation Item Registration (`Temp State: VARIATION_REGISTRATION`):** Once baseline steps and planned variation targets exist, dispatch **ALL** planned `AddTestCaseVariationItem` calls concurrently in safe batches (max 15-20 per turn). Sequential single-item registration loops across turns are strictly prohibited (`ANTI-32`).
            4. **Phase 4: Variation Column Population (`Temp State: VARIATION_POPULATION`):** For each variation column created via `CreateTestCaseVariation`, inspect cloned item keys via `GetTestCaseDetails`, then configure the variation column by concurrently dispatching:
               - All `EditAttributeValue` calls for the variation
               - All `EditAssert*` calls for the variation
               - `EditTestCaseVariation(EditAction="SetName")`
               - `EditTestCaseVariation(EditAction="SetDescription")`
               Keep dispatches within safe batches of 15 to 20 calls per turn. Prohibit iterating through variation setters sequentially across dozens of conversational turns (`ANTI-32`).
       *   **Chat Mode:** You have no write/execute tools. For each step of the approved Execution Plan, generate the exact, complete JSON payloads and parameters to execute. Instruct the user clearly where to paste or run these inputs, and wait for the user to confirm completion before outputting the next payload.

3. **Phase 3: `STATE_SMOKE_AUDIT`**
   - *State Header:* `[State: STATE_SMOKE_AUDIT | Temp State: None | Active Skill: mta-build]`
   - *Milestone:* Audit saved Execution Plan against local `.md` file (or chat context), verify Plan ID, revision sequence, and approval timestamp integrity, audit created test cases and steps (`GetTestCaseDetails`), verify 0 construction discrepancies, and output the Post-Construction Smoke Audit Report.
   - **Mandatory 8-Section Plan Conformity Audit:**
     1. **Section 1 (Metadata, Provenance & Placement):** App, Config, Suite, Case Name, Category, Execution User (`GetExecutionUsers`), Plan ID (`execution_plan_id`), Revision (`execution_plan_revision`), Supersedes Plan ID (`execution_plan_supersedes_id`), Approved Timestamp (`execution_plan_approved_at`), and Revision Sealing status (`execution_plan_revision`, `execution_plan_approved_at`).
     2. **Section 2 (Prompt & Input Log vs. MTA Skill Conflicts):** Verify prompt conflicts and automatic skill corrections.
     3. **Section 3 (Documentation & Risk Alignment):** Objective, Preconditions, Expected Results, Technical Risk, Business Risk.
     4. **Section 4 (Verified Elements):** Target microflows, pages, entities, and attributes referenced across steps (`GetAppModelData`).
     5. **Section 5 (Step Sequence):** Line-by-line check of created steps (`GetTestCaseDetails`) vs Section 5 (step types, sequence, predecessors, execution settings `"Always"`/`"_Continue"` vs `"None"`/`"_Stop"`, pattern annotations).
     6. **Section 6 (Playwright / Browser Settings):** Verify all Playwright options steps and 10 browser settings configured on suite/setup case.
     7. **Section 7 (Data Variation Matrix & Metadata):** **Cell-by-cell & item-by-item audit with Zero Disconnect Verification**: Call `GetTestCaseDetails` (or `GetTestSuiteDetails`) and verify:
        * System names and non-empty descriptions match Section 7 (`PAT-77`, `ANTI-31`).
        * Input attribute/parameter overrides, return value assertions, object counts, exception strings, and validation feedback strings match the Section 7 matrix (`PAT-54`).
        * **Zero Disconnect Check:** Verify that **zero unapproved additions** exist (no extra assertions, variation items, attributes, or retrieve filters exist on the server that were not declared in Section 7 or Section 5).
     8. **Section 8 (Applied Testing Patterns & Rationale):** Verify pattern explanations match pattern annotations written into step descriptions via `EditTestStep(EditAction="SetDescription")`.
   - **Mode-Specific Execution Style:**
     *   **Agentic Mode:** Read the local Execution Plan markdown file (at `${MTA_OUTPUT_PATH}/execution-plans/EP_<TestCaseName>.md` or path in `mta_state.json`) to retrieve the approved specifications. **Staggered Smoke Audit Reading:** When auditing multi-case test suites (e.g. 3-case frontend suites), dispatch `GetTestCaseDetails(TestCaseKey)` for **ONE test case per turn** rather than querying all test cases simultaneously. Because `GetTestCaseDetails` returns extensive JSON trees of all steps, parameters, and variation items, querying multiple cases concurrently risks token saturation and context truncation. Staggering the inspection across test cases guarantees clean, exhaustive verification of each case. Audit steps and variations line-by-line. Generate and output the Post-Construction Smoke Audit Report, including direct clickable MTA Web navigation links (`[MtaBaseUrl]/p/[ObjectType]/[Key]`) for target Config, Suite, and Case(s), along with a link to the local Execution Plan file.
     *   **Chat Mode:** Instruct the user to verify checks in the MTA Web console, and copy-paste variation/step details into chat. Then compile and output the Post-Construction Smoke Audit Report based on their input, including direct clickable MTA Web navigation links (`[MtaBaseUrl]/p/[ObjectType]/[Key]`).

When the smoke audit is successfully validated and approved by the user, prompt the user: *"The test cases and steps have successfully passed validation and are fully built. Would you like to transition to execution (`STATE_RUN_ANALYZE`) and run the tests?"*

---

## 🔄 MCP Tool Description Context & Bridge Rule

> [!NOTE]
> **MTA Tool Context Mapping:**
> The MTA MCP tools and schemas refer to the "mta skill" or "MTA". Since we have split the monolithic `mta` skill into `mta-build` and `mta-run-analyze`, treat all tool schema references to "mta skill" as referring to these two specialized skills.

