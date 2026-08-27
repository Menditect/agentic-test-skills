# 📖 MTA Patterns, Anti-Patterns & Golden Rules AI Lookup Index
**📍 Location:** `.agent/skills/mta-shared/references/mta-patterns-and-antipatterns-reference.md`  
**🏠 Return to:** [MTA Test Design Skill](../../mta-test-design/SKILL.md) | [MTA Build Skill](../../mta-build/SKILL.md) | [MTA Run & Analyze Skill](../../mta-run-analyze/SKILL.md) | [Comprehensive Descriptions](mta-patterns-and-antipatterns-descriptions.md)  
*Metadata: Version 2.2.0 | Primary Audience: AI Coding Assistant (Antigravity, MAIA, Subagents)*

---

## 🎯 Purpose & AI Agent Usage Guidelines
This reference serves as the centralized **Single Source of Truth (SSOT), AI Lookup Table, Pre-Flight Verification Index, and Continuous Pattern Register** for Menditect Test Automation (MTA). All codified rules (58 Patterns `PAT-01..58` + 17 Anti-Patterns `ANTI-01..17`) are uniquely indexed with explicit **Category Scopes** (`Backend`, `Frontend`, `General`) across **6 Canonical Functional Domains (Domains A through F)**:

### 🏷️ Category Scope Taxonomy (79 Rules Total):
* **`Backend` Scope (17 Rules: 11 Patterns, 6 Anti-Patterns):** Governs Mendix microflow calls, Unit/Integration tests, domain entity object lifecycle (`Create`, `Change`, `Retrieve`, `Delete`, `Persist`), backend transaction scopes, and microflow-level validation feedback.  
  *(Rules: `PAT-04`, `PAT-06`, `PAT-07`, `PAT-08`, `PAT-09`, `PAT-10`, `PAT-14`, `PAT-17`, `PAT-23`, `PAT-26`, `PAT-31`, `ANTI-01`, `ANTI-03`, `ANTI-06`, `ANTI-07`, `ANTI-10`, `ANTI-13`)*
* **`Frontend` Scope (17 Rules: 15 Patterns, 2 Anti-Patterns):** Governs browser/Playwright automation, Menditect Frontend Testkit widgets (`ACT_Fill_*`, `ACT_Click_*`), UI locators, repeating container ELO filters, browser session lifecycles (`Start`/`Stop`), page navigation, and the 3-case split.  
  *(Rules: `PAT-03`, `PAT-05`, `PAT-13`, `PAT-18`, `PAT-20`, `PAT-22`, `PAT-28`, `PAT-29`, `PAT-35`, `PAT-40`, `PAT-41`, `PAT-42`, `PAT-50`, `PAT-52`, `PAT-58`, `ANTI-12`, `ANTI-14`)*
* **`General` Scope (45 Rules: 35 Patterns, 10 Anti-Patterns):** Overarching testing principles, MTF testing pyramid scoping, MTA MCP tool execution quirks (predecessor chaining, key persistence), state machine gating, step naming standards, and multi-scenario Data Variation matrices.  
  *(Rules: `PAT-01`, `PAT-02`, `PAT-11`, `PAT-12`, `PAT-15`, `PAT-16`, `PAT-19`, `PAT-21`, `PAT-24`, `PAT-25`, `PAT-27`, `PAT-30`, `PAT-32`, `PAT-33`, `PAT-34`, `PAT-36`, `PAT-37`, `PAT-38`, `PAT-39`, `PAT-43`, `PAT-44`, `PAT-45`, `PAT-46`, `PAT-47`, `PAT-48`, `PAT-49`, `PAT-51`, `PAT-53`, `PAT-54`, `PAT-55`, `PAT-56`, `PAT-57`, `PAT-59`, `PAT-60`, `PAT-61`, `ANTI-02`, `ANTI-04`, `ANTI-05`, `ANTI-08`, `ANTI-09`, `ANTI-11`, `ANTI-15`, `ANTI-16`, `ANTI-17`, `ANTI-18`)*

### 🏛️ Functional Domains (Domains A through F):
* **Domain A: Scoping, Test Typology & Risk Architecture** (`PAT-01..02`, `PAT-25..26`, `PAT-37..39`, `ANTI-02`, `ANTI-09`)
* **Domain B: Object Lifecycle, Database & Step Chaining Laws** (`PAT-06`, `PAT-08..09`, `PAT-11..12`, `PAT-14..16`, `PAT-20..24`, `PAT-30..32`, `PAT-34`, `PAT-55`, `ANTI-01`, `ANTI-03..06`, `ANTI-10`)
* **Domain C: Execution Settings, Rollback & Exception Handling** (`PAT-03`, `PAT-17..18`, `PAT-29`, `PAT-33`, `ANTI-07`)
* **Domain D: Data Variations, Matrix Reconciliation & Empty Object Protocols** (`PAT-07`, `PAT-19`, `PAT-27`, `PAT-54`, `ANTI-08`, `ANTI-11`)
* **Domain E: Frontend UI & Locator Laws** (`PAT-05`, `PAT-13`, `PAT-28`, `PAT-35`, `PAT-40..42`, `PAT-58`, `ANTI-12`)
* **Domain F: Protocol Gates, State Machine & Multi-Agent Safety** (`PAT-04`, `PAT-10`, `PAT-36`, `PAT-43..53`, `PAT-56..57`, `PAT-59..61`, `ANTI-13..18`)

### Operational Usage by Phase:
* **During `STATE_BUILD_PLANNING` (Test Design):** AI agents cross-reference this table during Execution Plan drafting (Section 2 Prompt vs Skill Conflicts and Section 8 Applied Patterns) to verify that all required patterns are satisfied and zero anti-patterns exist before presenting the plan.
* **During `STATE_CONSTRUCTION` (Test Building):** AI agents retrieve exact pattern names and rationale strings to write step description annotations (`[Pattern: <Name> - <Rationale>]`) via `SetTestStepNameDescription`.
* **During `STATE_SMOKE_AUDIT` (Post-Construction Verification):** AI agents audit created database assets against this matrix to generate the Post-Construction Smoke Audit Report.

---

## 🤖 Mandatory Continuous Auto-Registration Protocol
Whenever a new testing pattern, rule, or anti-pattern is introduced, modified, or learned (via user prompt, `/learn`, skill editing, or runtime debugging):
1. **Immediate Reference Update:** Append or update the rule entry in this file under the relevant Domain, assigning a unique Rule ID (`PAT-xx` or `ANTI-xx`), Name, Scope Category (`Backend` | `Frontend` | `General`), Classification, and Enforcement Logic.
2. **Skill Footnote Cross-Referencing:** Ensure related instruction lines across `.agent/skills/*` cite the canonical Rule ID (e.g. `[^PAT-xx]`).
3. **Automated Synchronization:** Run `sync-mta-skills.bat` to mirror this updated master file to `mta-test-design/references/`, `mta-build/references/`, and `mta-run-analyze/references/`.

---

## 📊 Master Domain Reference Matrix

### 🏛️ Domain A: Scoping, Test Typology & Risk Architecture

| Rule ID | Pattern / Rule Name | Category | Classification | Reference Document | Core Enforcement & Summary |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PAT-01** | **MTF Testing Pyramid Alignment** | **General** | Methodological Law | [risk-matrix.md](risk-matrix.md) | Maps microflow typologies (`VAL_`/`RULE_`/`FTN_` $\rightarrow$ Backend Unit, `ORC_`/`CMT_` $\rightarrow$ Integration, `ACT_`/Pages $\rightarrow$ UI). Pushes testing down the pyramid. |
| **PAT-02** | **Dual Technical & Business Risk Alignment** | **General** | Methodological Law | [risk-matrix.md](risk-matrix.md) | Requires every test specification to explicitly state both technical risk (e.g., ACID violation) and business risk (e.g., financial leakage). |
| **PAT-25** | **Low-Code "What Not to Test" Guardrail** | **General** | Methodological Law | [risk-matrix.md](risk-matrix.md) | Prohibits testing native Mendix platform behaviors (runtime DB commits on microflow end, layout grids). Focuses exclusively on custom business logic. |
| **PAT-26** | **Untestable Component Escape Hatch & MTF Refactoring** | **Backend** | Methodological Law | [mta-scoping-reference.md](mta-scoping-reference.md) | Suggests MTF refactoring for overly complex microflows; pivots gracefully to best-effort happy path testing without blocking test generation. |
| **PAT-37** | **Proactive MTA Value Enlightenment** | **General** | Methodological Law | [mta-scoping-reference.md](mta-scoping-reference.md) | Explains tangible MTA benefits (no-code, model coverage analytics, upgrade DOM resilience) if the user suggests open-source test runners. |
| **PAT-38** | **Data-Risk Centric Prioritization** | **General** | Methodological Law | [risk-matrix.md](risk-matrix.md) | Scopes test cases starting from the most critical Domain Model entities and attributes, targeting microflows that mutate those entities. |
| **PAT-39** | **Intended Use & Purpose Verification** | **General** | Methodological Law | [mta-scoping-reference.md](mta-scoping-reference.md) | Validates functional purpose against high-level business workflow; halts for clarification if user stories or core app intent is missing. |
| **ANTI-02** | **"Ice Cream Cone" Heavy UI Testing** | **General** | Methodological Anti-Pattern | [risk-matrix.md](risk-matrix.md) | Building heavy UI Playwright tests for pure business calculations or validations that should be tested headlessly at Unit/Integration level. |
| **ANTI-09** | **Native Mendix Platform Testing** | **General** | Methodological Anti-Pattern | [risk-matrix.md](risk-matrix.md) | Designing test cases to verify standard Mendix platform mechanisms rather than application-specific rules and integrations. |

---

### 📦 Domain B: Object Lifecycle, Database & Step Chaining Laws

| Rule ID | Pattern / Rule Name | Category | Classification | Reference Document | Core Enforcement & Summary |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PAT-06** | **Direct Attribute & Association Initialization on Create Object** | **General** | Methodological Law | [golden-rules.md](golden-rules.md) | Sets ALL initial attributes and association bindings directly on the `Create Object` step. Prohibits creating a separate `Change Object` step immediately following `Create Object`. |
| **PAT-08** | **Retrieve / Microflow Output Object Count Assertion** | **General** | Methodological Law | [golden-rules.md](golden-rules.md) | Embeds an `Assert Object Count` assertion directly within Field 6 of any `Retrieve Object` or `Microflow Call` producer step before downstream consumption (excluding `Create Object`). Prohibits standalone count steps. |
| **PAT-09** | **Backend-First Delete Pattern** | **Frontend** | Methodological Law | [golden-rules.md](golden-rules.md) | Executes a backend `Retrieve Object` step first before calling `Delete Object`, piping the retrieved object into the delete step. |
| **PAT-11** | **Predecessor Forward Chaining Law** | **General** | Platform API Quirk | [golden-rules.md](golden-rules.md) | Chains element creation calls forward sequentially using the non-zero key returned by the immediate predecessor step (`TestStepBeforeKey`). |
| **PAT-12** | **Test Step Description Pattern Annotation** | **General** | Methodological Law | [golden-rules.md](golden-rules.md) | Writes `[Pattern: <Name> - <Rationale>]` into the step `Description` field via `SetTestStepNameDescription` to document pattern rationale in MTA. |
| **PAT-14** | **Prohibition of Embedded Asserts on Create/Change Object Steps** | **General** | Methodological Law | [golden-rules.md](golden-rules.md) | Embeds all step assertions (Object Count, Attribute Value, Return Value, Exception) directly in Field 6 of Retrieve or Microflow steps. Strictly prohibits embedded assertions on Create or Change steps. |
| **PAT-15** | **The Predecessor `0` Rule** | **General** | Platform API Quirk | [golden-rules.md](golden-rules.md) | Passes `0` for `TestStepBeforeKey`, `TestCaseBeforeKey`, or `TestSuiteBeforeKey` to sequence an element to the absolute top/first position in a container. |
| **PAT-16** | **Sequential Step Execution Ban** | **General** | Platform API Quirk | [golden-rules.md](golden-rules.md) | Prohibits parallel tool execution within the same parent testcase; steps must be built one-by-one waiting for predecessor keys. |
| **PAT-20** | **Unshared Session Architecture & Mandatory Persist Rule** | **Frontend** | Platform Execution Law | [golden-rules.md](golden-rules.md) | Backend runner and browser sessions are unshared. A `Persist` step is required after setup seeding in Case 1 so the browser in Case 2 can see the DB data. |
| **PAT-21** | **Single Persist Batching Law** | **General** | Platform Execution Law | [golden-rules.md](golden-rules.md) | Groups all memory creations/deletions together and executes a single `Persist` step at the very end of the block instead of persisting after every step. |
| **PAT-22** | **Frontend UI Commits Bypass Automatic Rollback** | **Frontend** | Platform Execution Law | [golden-rules.md](golden-rules.md) | Browser UI button clicks run in a separate user session and bypass MTA database rollback; UI-created objects MUST be deleted explicitly in Case 2 or Case 3. |
| **PAT-23** | **Java Action Custom Transaction Exemption** | **Backend** | Platform Execution Law | [golden-rules.md](golden-rules.md) | Java Actions executing custom transaction boundaries bypass MTA's transaction wrapper; committed objects do not roll back automatically. |
| **PAT-24** | **Pre-Existing Database Data Prohibition** | **General** | Platform Execution Law | [golden-rules.md](golden-rules.md) | Prohibits relying on pre-existing database backup records because it breaks test portability across environments. All data must be seeded dynamically. |
| **PAT-30** | **Manual Intervention Highlight Protocol** | **General** | Platform Execution Law | [golden-rules.md](golden-rules.md) | Marks placeholder steps or steps requiring manual configuration/deletion in MTA Web UI with a blue highlight (`SetHighlightOfTestStep(Highlight=true)`). |
| **PAT-31** | **Retrieve-for-Asserting Set & Count Law** | **Backend** | Platform Execution Law | [golden-rules.md](golden-rules.md) | Configures retrieve steps used for assertions with `RetrieveSet = "All"` and explicit/piped attribute filters, coupled with downstream `Assert Object Count`. |
| **PAT-32** | **Dynamic Scalar Value Piping (`SelectValueForValue`)** | **General** | Platform Execution Law | [golden-rules.md](golden-rules.md) | Defines dynamic configuration values or upstream identifiers once and pipes them downstream using scalar value piping for single source of truth. |
| **PAT-34** | **Uniform 8-Field Step Sequence Schema** | **General** | Methodological Law | [golden-rules.md](golden-rules.md) | Enforces uniform 8-field schema (Step Type, Target, Input Handles, Output Handle, Parameters/Values, Embedded Assertions, Execution Settings, Description/Pattern). |
| **PAT-55** | **Zero Data in Step Names** | **General** | Methodological Law | [golden-rules.md](golden-rules.md) | Enforces functional action naming templates (`[Action] [WidgetType] '[FieldDescriptor]' [Input/Button]`) and bans runtime test data in step names. |
| **ANTI-01** | **Separate `Change Object` Step After `Create Object`** | **General** | Platform Anti-Pattern | [golden-rules.md](golden-rules.md) | Creating an object and adding a separate `Change Object` step immediately after instead of initializing values directly on `Create Object`. |
| **ANTI-03** | **Unasserted Retrieve / Microflow Output Consumer Piping** | **Backend** | Methodological Anti-Pattern | [golden-rules.md](golden-rules.md) | Passing a retrieved object/list directly into downstream parameters without first validating existence via embedded `Assert Object Count` on the producer step. |
| **ANTI-04** | **Hardcoding Test Data Values in Step Names** | **General** | Methodological Anti-Pattern | [golden-rules.md](golden-rules.md) | Including runtime data values (e.g. `"Order #1234"`, `"Admin"`) inside step names instead of functional action templates. |
| **ANTI-05** | **Parallel / Batched Creation in Same Container** | **General** | Platform Anti-Pattern | [golden-rules.md](golden-rules.md) | Executing multiple sequential step creation tools in parallel within the same parent testcase, causing write collisions and corrupted sequences. |
| **ANTI-06** | **Asserting Object Count after `Create Object`** | **General** | Methodological Anti-Pattern | [golden-rules.md](golden-rules.md) | Adding embedded `Assert Object Count` on a `Create Object` step (in-memory instantiated objects are guaranteed to exist). |
| **ANTI-10** | **Embedded Assertions on Create/Change Object Steps** | **General** | Methodological Anti-Pattern | [golden-rules.md](golden-rules.md) | Declaring assertions as standalone test steps or configuring assert comparisons on Create or Change object steps instead of using them purely for initialization/mutation. |

---

### ⚙️ Domain C: Execution Settings, Rollback & Exception Handling

| Rule ID | Pattern / Rule Name | Category | Classification | Reference Document | Core Enforcement & Summary |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PAT-03** | **Frontend 3-Case Split Law** | **Frontend** | Methodological Law | [frontend-testing.md](frontend-testing.md) | Structures Frontend UI tests into 3 cases per suite: Case 1 (Setup/Seeding), Case 2 (Action/UI), and Case 3 (Teardown/Cleanup). |
| **PAT-17** | **Backend Unit Test Execution Settings Law (`_Stop`)** | **Backend** | Methodological Law | [execution-settings.md](execution-settings.md) | Enforces `ExecutionCondition = "None"` and `ResumeExecutionAfterException = "_Stop"` on ALL steps (including setup, action, retrieve, and assertions) in Backend Unit Tests. |
| **PAT-18** | **Frontend Setup/Teardown Execution Condition Law (`_Always` / `_Continue`)** | **Frontend** | Methodological Law | [execution-settings.md](execution-settings.md) | Enforces `ExecutionCondition = "_Always"` and `ResumeExecutionAfterException = "_Continue"` on Case 1 Seeding, Startup, Stop, and Case 3 Delete steps in Frontend tests. |
| **PAT-29** | **Page Object Model (POM) Equivalent Pattern** | **Frontend** | Platform Execution Law | [frontend-testing.md](frontend-testing.md) | Defines a single locator step (`MxPageLocator`/`ParentContext`) at the start of a page sequence and pipes its output key to downstream interaction steps. |
| **PAT-33** | **Default Assertion Failure Behavior (Continue Execution)** | **General** | Platform Execution Law | [execution-settings.md](execution-settings.md) | Defaults assertion steps in Frontend UI and Backend Integration tests to `ResumeExecutionAfterException = "_Continue"` for full-suite error reporting. |
| **ANTI-07** | **Applying `_Always` / `_Continue` to Backend Unit Tests** | **Backend** | Methodological Anti-Pattern | [execution-settings.md](execution-settings.md) | Setting `_Always` or `_Continue` on steps in Backend Unit Tests, bypassing MTA's built-in transaction rollback. |

---

### 🧪 Domain D: Data Variations, Matrix Reconciliation & Empty Object Protocols

| Rule ID | Pattern / Rule Name | Category | Classification | Reference Document | Core Enforcement & Summary |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PAT-07** | **Dual Retrieve/Filter Empty Object Pattern** | **Backend** | Methodological Law | [data-variations.md](data-variations.md) | Dynamically varies between valid and `empty`/NULL objects across variations by using a Retrieve/Filter step filtering on an explicit attribute (`'TEST_VAL'` vs `'NON_EXISTENT'`). |
| **PAT-19** | **Data Variation Consolidation** | **General** | Methodological Law | [data-variations.md](data-variations.md) | Consolidates multiple input scenarios into a single reusable step sequence driven by MTA Data Variations instead of duplicate test cases. |
| **PAT-27** | **Horizontal & Capped (8-Column) Variation Matrix Layout** | **General** | Methodological Law | [data-variations.md](data-variations.md) | Caps variation matrix tables at 8 columns total (1 label + 7 scenario columns) to prevent MTA UI truncation, splitting into consecutive tables for 8+ variations. |
| **PAT-54** | **Exhaustive $M \times N$ Matrix Cell Reconciliation Law** | **General** | Methodological Law | [data-variations.md](data-variations.md) | Iterates through and explicitly writes/verifies every single cell $(i, j)$ in the variation matrix after column duplication rather than relying on assumed copied values. |
| **ANTI-08** | **Duplicate Test Case Proliferation** | **General** | Methodological Anti-Pattern | [data-variations.md](data-variations.md) | Creating multiple duplicate test cases that share identical step structures just to test different inputs instead of using Data Variations. |
| **ANTI-11** | **Delta-Only Data Variation Override Assumptions** | **General** | Methodological Anti-Pattern | [data-variations.md](data-variations.md) | Allocating data variation columns without explicitly writing and verifying every single cell value in the matrix. |

---

### 🌐 Domain E: Frontend UI & Locator Laws

| Rule ID | Pattern / Rule Name | Category | Classification | Reference Document | Core Enforcement & Summary |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PAT-05** | **Menditect Frontend Testkit Strict Default Law** | **Frontend** | Methodological Law | [frontend-testing.md](frontend-testing.md) | Mandates `MenditectMxFrontendTestKit` as the exclusive default for UI tests. Prohibits falling back to raw Playwright commands without explicit user approval. |
| **PAT-13** | **Structural Locator Laws (Law 1, Law 2, Law 3)** | **Frontend** | Platform Execution Law | [frontend-testing.md](frontend-testing.md) | Law 1 (Non-Repeating: 2-step chain), Law 2 (Repeating Container: 4-step ELO chain), Law 3 (ComboBox: 4-step trigger-fill-trigger open-fill-close sequence). |
| **PAT-28** | **"Start-and-Stop First" Boilerplate Session Law** | **Frontend** | Platform Execution Law | [frontend-testing.md](frontend-testing.md) | Creates `Start_MxFrontend_Test_*` and `Stop_MxFrontendTest` steps FIRST (`_Always` / `_Continue`) and sequences UI steps between them to prevent hanging browser sessions. |
| **PAT-35** | **Native Auto-Waiting vs. Sleep Prohibition** | **Frontend** | Platform Execution Law | [frontend-testing.md](frontend-testing.md) | Leverages Playwright auto-waiting and visibility assertions (`ASR_Is_Visible`) instead of inserting hardcoded sleep/pause steps. |
| **PAT-40** | **Multi-Object List & Dropdown Seeding** | **Frontend** | Methodological Law | [frontend-testing.md](frontend-testing.md) | Creates or retrieves multiple seed records (2+) for entities appearing in repeating containers or selection widgets to validate selection accuracy. |
| **PAT-41** | **Anonymous vs. Role Navigation Resolution** | **Frontend** | Methodological Law | [frontend-testing.md](frontend-testing.md) | Checks if starting page is reachable anonymously (no login needed); if login required, queries Mendix navigation (`SHOW NAVIGATION` via `mxcli`). |
| **PAT-42** | **Date-Time Offset & Format Pattern Inspection** | **General** | Methodological Law | [frontend-testing.md](frontend-testing.md) | Uses `CurrentDateTime` with relative offset for date-time widgets and inspects `dateformPattern` in the Mendix model via `mxcli`. |
| **PAT-58** | **Unified 3-Phase Lifecycle for Frontend Exploratory Execution** | **Frontend** | Platform Execution Law | [frontend-testing.md](frontend-testing.md) | Executes Frontend exploratory tests in a single continuous array (Seed/Launch -> Testkit Actions -> Rollback) with automatic JVM DB rollback. |
| **ANTI-12** | **Raw Playwright Connector Bypass Anti-Pattern** | **Frontend** | Platform Anti-Pattern | [frontend-testing.md](frontend-testing.md) | Bypassing `MenditectMxFrontendTestKit` to execute raw clicks, fills, or DOM selectors without explicit user authorization. |

---

### 🛡️ Domain F: Protocol Gates, State Machine & Multi-Agent Safety

| Rule ID | Pattern / Rule Name | Category | Classification | Reference Document | Core Enforcement & Summary |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PAT-04** | **Void Microflow Complexity & Side-Effect Audit Guardrail** | **Backend** | Methodological Law | [build-construction-guide.md](build-construction-guide.md) | Evaluates complexity of void microflows and enforces adding downstream DB `Retrieve` + `Assert Object Count`/`Attribute` steps rather than relying on crash-only checks. |
| **PAT-10** | **Universal Validation Feedback Assertion Law (Backend Only)** | **Backend** | Methodological Law | [build-construction-guide.md](build-construction-guide.md) | Inspects Backend microflows for validation feedback; applies `AssertValidationFeedbackMessageCompare` and `Count` (`Count = 0` on happy path). |
| **PAT-36** | **MTA Model Revision Synchronization & Structural Delta Classification** | **General** | Methodological Law | [core-playbook.md](core-playbook.md) | Decouples Execution Plan storage from MTA revision status, distinguishes internal microflow logic from structural model deltas, and guides revision updates. |
| **PAT-43** | **Mandatory Dual-Gate Plan & Placement Approval** | **General** | Methodological Law | [core-playbook.md](core-playbook.md) | Enforces Gate 1 (Execution Plan Spec approval) and Gate 2 (Placement & Target Summary approval) before calling `SaveExecutionPlan` or mutating server assets. |
| **PAT-44** | **Atomic Multi-Case Construction & `ExecutionPlanKey` Gating** | **General** | Methodological Law | [core-playbook.md](core-playbook.md) | Requires valid `ExecutionPlanKey` before step construction in `STATE_CONSTRUCTION`; provisions containers and steps in a single uninterrupted execution sweep. |
| **PAT-45** | **Mandatory Tool Execution Reasoning Chain of Thought** | **General** | Methodological Law | [core-playbook.md](core-playbook.md) | Outputs concise `🧠 Tool Execution Reasoning` markdown block before every MTA tool call. |
| **PAT-46** | **Clickable MTA Web Navigation Link Formatting** | **General** | Methodological Law | [core-playbook.md](core-playbook.md) | Formats direct clickable markdown links to created assets using the official pattern `[MtaBaseUrl]/p/[ObjectType]/[Key]`. |
| **PAT-47** | **Real-Time Placement Key Persistence** | **General** | Methodological Law | [core-playbook.md](core-playbook.md) | Writes returned database keys (`test_suite.key`, `test_cases[].key`, `execution_plan_key`) immediately into `mta_state.json` during construction. |
| **PAT-48** | **Allowed Operational States for Parameter Setters & Assertions** | **General** | Methodological Law | [core-playbook.md](core-playbook.md) | Prohibits calling parameter setters and assertions during discovery or planning; restricts them exclusively to `STATE_CONSTRUCTION`. |
| **PAT-49** | **Incremental Construction Success Verification** | **General** | Methodological Law | [core-playbook.md](core-playbook.md) | Calls `GetTestConstructionErrorsOfTestCase` immediately after building a complex step block to verify binding and layout coordinates. |
| **PAT-50** | **Playwright 3 Conflict Options Strategy** | **Frontend** | Methodological Law | [core-playbook.md](core-playbook.md) | Resolves Frontend placement conflicts in existing suites: Option 1 (Inherit Settings), Option 2 (Override Settings), Option 3 (Dedicated New 3-Case Pattern Block). |
| **PAT-51** | **No Conversational Refusal Protocol (`STATE_QA_ASSISTANCE`)** | **General** | Methodological Law | [core-playbook.md](core-playbook.md) | Pauses test building gracefully to answer out-of-band questions in `STATE_QA_ASSISTANCE` before prompting to resume active building. |
| **PAT-52** | **Frontend List Filter Options Proposal Protocol** | **Frontend** | Methodological Law | [frontend-testing.md](frontend-testing.md) | Halts and presents explicit list filter choices (Text Filter, Index Filter, Dynamic Scalar Piping) when repeating containers are detected. |
| **PAT-53** | **Domain Model Attribute Length & Constraint Verification** | **General** | Methodological Law | [golden-rules.md](golden-rules.md) | Verifies Domain Model attribute length limits via `mxcli` (`SHOW ENTITY`) when proposing test values to prevent runtime truncation errors. |
| **PAT-56** | **Dual-Track Decision Gate & Exploratory-First Verification** | **General** | Methodological Law | [core-playbook.md](core-playbook.md) | Prioritizes local in-memory exploratory testing (`execute-testcase`) with zero placement overhead before committing persistent test structures. |
| **PAT-57** | **Exploratory-to-Persistent Test Promotion Protocol** | **General** | Platform Execution Law | [core-playbook.md](core-playbook.md) | Promotes passing exploratory tests to persistent MTA Platform storage after Gate 2 placement approval and MTA model revision sync verification. |
| **PAT-59** | **Zero Construction Error Pre-Flight Law & Build Mismatch Diagnostic** | **General** | Platform Execution Law | [core-playbook.md](core-playbook.md) | Intercepts build errors during step creation to diagnose model mismatches, and enforces zero test construction errors in smoke audits and pre-flight execution. |
| **PAT-60** | **Dual-Track Execution Strategy Explicit Declaration in Execution Plan** | **General** | Methodological Law | [core-playbook.md](core-playbook.md) | Requires Execution Plans to explicitly declare the Execution Strategy in Section 1 (Option A: Exploratory vs Option B: Persistent MTA) and prompt the user for their choice at Gate 1. |
| **PAT-61** | **Standard Exploratory Test Execution Report Format** | **General** | Platform Execution Law | [exploratory-execution-guide.md](exploratory-execution-guide.md) | Mandates the structured exploratory execution report format including Test Goal, Execution Metadata (DateTime, RunID), Tri-State Result (PASS/FAIL/ERROR), TestCase Level Summary (Input/Output/Expected), Step Breakdown Table, and Error Logs. |
| **ANTI-13** | **Blind Void Microflow Crash-Only Testing** | **Backend** | Methodological Anti-Pattern | [build-construction-guide.md](build-construction-guide.md) | Accepting simple "no crash" execution checks for complex void microflows without auditing database side-effects. |
| **ANTI-14** | **Using MTA TestCase Validation Feedback Assertions in Frontend UI Tests** | **Frontend** | Methodological Anti-Pattern | [frontend-testing.md](frontend-testing.md) | Applying `AssertValidationFeedbackMessageCompare`/`Count` in Frontend UI tests instead of asserting on DOM elements. |
| **ANTI-15** | **Premature Container Provisioning (Bypassing Local Exploratory Verification)** | **General** | Methodological Anti-Pattern | [core-playbook.md](core-playbook.md) | Forcing full central database provisioning on MTA Platform for untested or rapidly changing logic when local app and `MTA_plugin` are active. |
| **ANTI-16** | **Unpromoted Exploratory Test Drift (Ephemeral-Only Testing)** | **General** | Methodological Anti-Pattern | [core-playbook.md](core-playbook.md) | Running exploratory tests in development but never promoting verified tests to persistent MTA test suites, leaving CI/CD pipelines unprotected. |
| **ANTI-17** | **Premature Step Construction on Stale MTA Revision** | **General** | Platform Anti-Pattern | [core-playbook.md](core-playbook.md) | Attempting persistent test step construction when required model elements exist only locally and are not yet synchronized to the active MTA Model Revision. |
| **ANTI-18** | **Ignored Construction Errors & Cascading Build Failure Anti-Pattern** | **General** | Platform Anti-Pattern | [core-playbook.md](core-playbook.md) | Continuing step construction or attempting test execution after encountering model element not-found errors or active construction errors. |

---

## 🤖 AI Pre-Flight Plan Audit Checklist (Execution Protocol)

Before presenting any Execution Plan to the user in `STATE_BUILD_PLANNING` or constructing steps in `STATE_CONSTRUCTION`, the AI Agent MUST run this mental self-audit against the 55-pattern / 14-anti-pattern lookup index:

```markdown
[ ] 1. DIRECT INITIALIZATION [Backend]: Are all attributes/associations set directly on Create Object steps without subsequent Change Object steps? (PAT-06 / ANTI-01)
[ ] 2. OBJECT COUNT ASSERTIONS [Backend]: Is an Assert Object Count step placed immediately after every Retrieve / Microflow producer step? (PAT-08 / ANTI-03 / ANTI-06)
[ ] 3. ZERO DATA IN NAMES [General]: Are all step names free of hardcoded runtime values? (PAT-55 / ANTI-04)
[ ] 4. BACKEND UNIT STOP SETTINGS [Backend]: Are ALL steps in Backend Unit Tests configured with ExecutionCondition = "None" and ResumeExecutionAfterException = "_Stop"? (PAT-17 / ANTI-07)
[ ] 5. UNSHARED SESSION PERSISTENCE [Frontend]: Is a single Persist step included after Case 1 seeding in Frontend tests? (PAT-20 / PAT-21)
[ ] 6. SEQUENTIAL BATCHING [General]: Are step creation tool calls executed strictly one-by-one with forward predecessor chaining? (PAT-11 / PAT-16 / ANTI-05)
```

---

## 🏷️ Standardized Step Description Pattern Annotation Glossary

When calling `SetTestStepNameDescription` during `STATE_CONSTRUCTION`, write these standardized annotation tags into the `Description` field:

* **`PAT-06` Direct Initialization [Backend]:** `[Pattern: Direct Initialization on Create Object [^PAT-06] - Sets all initial attributes and associations directly on instantiation]`
* **`PAT-07` Dual Retrieve/Filter Empty Object [Backend]:** `[Pattern: Dual Retrieve/Filter Empty Object [^PAT-07] - Enables NULL object variations via explicit attribute filtering]`
* **`PAT-08` Retrieve Count Assertion [Backend]:** `[Pattern: Retrieve Output Object Count Assertion [^PAT-08] - Validates object count immediately to prevent silent downstream failures]`
* **`PAT-09` Backend-First Delete [Backend]:** `[Pattern: Backend-First Delete [^PAT-09] - Retrieves object in memory prior to deletion]`
* **`PAT-10` Validation Feedback Assertion [Backend]:** `[Pattern: Universal Validation Feedback Assertion [^PAT-10] - Asserts validation messages on backend microflow execution]`
* **`PAT-12` Pattern Annotation Tag [General]:** `[Pattern: <Name> - <Rationale>]`
* **`PAT-18` Frontend Setup/Teardown Settings [Frontend]:** `[Pattern: Frontend Setup/Teardown Settings [^PAT-18] - Configures _Always / _Continue on seeding and cleanup]`
* **`PAT-29` POM Locator Modularization [Frontend]:** `[Pattern: Page Object Model Locator [^PAT-29] - Modularizes page container selector for downstream step reuse]`
