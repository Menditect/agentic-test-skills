# 📖 MTA Patterns, Anti-Patterns & Golden Rules AI Lookup Index
**📍 Location:** `.agent/skills/mta-shared/references/mta-patterns-and-antipatterns-reference.md`  
**🏠 Return to:** [MTA Test Design Skill](../../mta-test-design/SKILL.md) | [MTA Build Skill](../../mta-build/SKILL.md) | [MTA Run & Analyze Skill](../../mta-run-analyze/SKILL.md) | [Comprehensive Descriptions](mta-patterns-and-antipatterns-descriptions.md)  
*Metadata: Version 2.2.0 | Primary Audience: AI Coding Assistant (Antigravity, MAIA, Subagents)*

---

## 🎯 Purpose & AI Agent Usage Guidelines
This reference serves as the centralized **Single Source of Truth (SSOT), AI Lookup Table, Pre-Flight Verification Index, and Continuous Pattern Register** for Menditect Test Automation (MTA). All codified rules (Patterns `PAT-xx` and Anti-Patterns `ANTI-xx`) are uniquely indexed with explicit **Category Scopes** (`Backend`, `Frontend`, `General`) across **6 Canonical Functional Domains (Domains A through F)**:

### 🏷️ Category Scope Taxonomy:
* **`Backend` Scope:** Governs Mendix microflow calls, Unit/Integration tests, domain entity object lifecycle (`Create`, `Change`, `Retrieve`, `Delete`, `Persist`), backend transaction scopes, and microflow-level validation feedback.
* **`Frontend` Scope:** Governs browser/Playwright automation, Menditect Frontend Testkit widgets (`ACT_Fill_*`, `ACT_Click_*`), UI locators, repeating container ELO filters, browser session lifecycles (`Start`/`Stop`), page navigation, and persistent 3-case suites.
* **`General` Scope:** Overarching testing principles, MTF testing pyramid scoping, MTA MCP tool execution quirks (predecessor chaining, key persistence), state machine gating, step naming standards, exploratory testing lifecycle, manual test planning, and multi-scenario Data Variation matrices.

### 🏛️ Functional Domains (Domains A through F):
* **Domain A: Scoping, Test Typology & Risk Architecture** (`PAT-01..02`, `PAT-25..26`, `PAT-37..39`, `ANTI-02`, `ANTI-09`)
* **Domain B: Object Lifecycle, Database & Step Chaining Laws** (`PAT-06`, `PAT-08..09`, `PAT-11..12`, `PAT-14..16`, `PAT-20..24`, `PAT-30..32`, `PAT-34`, `PAT-55`, `PAT-75`, `ANTI-01`, `ANTI-03..06`, `ANTI-10`, `ANTI-29`)
* **Domain C: Execution Settings, Rollback & Exception Handling** (`PAT-03`, `PAT-17..18`, `PAT-29`, `PAT-33`, `ANTI-07`)
* **Domain D: Data Variations, Matrix Reconciliation & Empty Object Protocols** (`PAT-07`, `PAT-19`, `PAT-27`, `PAT-54`, `PAT-77`, `ANTI-08`, `ANTI-11`, `ANTI-31`)
* **Domain E: Frontend UI & Locator Laws** (`PAT-05`, `PAT-13`, `PAT-28`, `PAT-35`, `PAT-40..42`, `PAT-62`, `PAT-64`, `PAT-67`, `ANTI-12`, `ANTI-19..21`, `ANTI-23`)
* **Domain F: Protocol Gates, State Machine & Multi-Agent Safety** (`PAT-04`, `PAT-10`, `PAT-36`, `PAT-43..53`, `PAT-56..61`, `PAT-63`, `PAT-65..66`, `PAT-68..71`, `PAT-73..74`, `PAT-76`, `ANTI-13..18`, `ANTI-22`, `ANTI-24..28`, `ANTI-30`)

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
| **PAT-21** | **Single Persist Batching Law** | **General** | Platform Execution Law | [golden-rules.md](golden-rules.md) | Executes a parameterless batch commit at the very end of memory creations/deletions. Must NOT have `EntityQualifiedName` or input handle bindings (`TCEX_RQ_Sfcr`/`Sfdr`). |
| **PAT-22** | **Frontend UI Commits Bypass Automatic Rollback** | **Frontend** | Platform Execution Law | [golden-rules.md](golden-rules.md) | Browser UI button clicks run in a separate user session and bypass MTA database rollback; UI-created objects MUST be deleted explicitly in Case 2 or Case 3. |
| **PAT-23** | **Java Action Custom Transaction Exemption** | **Backend** | Platform Execution Law | [golden-rules.md](golden-rules.md) | Java Actions executing custom transaction boundaries bypass MTA's transaction wrapper; committed objects do not roll back automatically. |
| **PAT-24** | **Pre-Existing Database Data Prohibition** | **General** | Platform Execution Law | [golden-rules.md](golden-rules.md) | Prohibits relying on pre-existing database backup records because it breaks test portability across environments. All data must be seeded dynamically. |
| **PAT-30** | **Manual Intervention Highlight Protocol** | **General** | Platform Execution Law | [golden-rules.md](golden-rules.md) | Marks placeholder steps or steps requiring manual configuration/deletion in MTA Web UI with a blue highlight (`SetHighlightOfTestStep(Highlight=true)`). |
| **PAT-31** | **Retrieve-for-Asserting Set & Count Law** | **Backend** | Platform Execution Law | [golden-rules.md](golden-rules.md) | Configures retrieve steps used for assertions with `RetrieveSet = "All"` and explicit/piped attribute filters, coupled with downstream `Assert Object Count`. |
| **PAT-32** | **Dynamic Scalar Value Piping (`SelectValueForValue`)** | **General** | Platform Execution Law | [golden-rules.md](golden-rules.md) | Defines dynamic configuration values or upstream identifiers once and pipes them downstream using scalar value piping for single source of truth. |
| **PAT-34** | **Uniform 8-Field Step Sequence Schema** | **General** | Methodological Law | [golden-rules.md](golden-rules.md) | Enforces uniform 8-field schema (Step Type, Target, Input Handles, Output Handle, Parameters/Values, Embedded Assertions, Execution Settings, Description/Pattern). |
| **PAT-55** | **Zero Data in Step Names** | **General** | Methodological Law | [golden-rules.md](golden-rules.md) | Enforces functional action naming templates (`[Action] [WidgetType] '[FieldDescriptor]' [Input/Button]`) and bans runtime test data in step names. |
| **PAT-75** | **Verified Entity Fixture Attribute Binding Law** | **General** | Methodological Law | [golden-rules.md](golden-rules.md) | Mandates verifying all entity attribute names and types via domain model AST (`DESCRIBE ENTITY`) before compiling `Create Object` steps or `TCEX_RQ_AttributeValueRun` payloads, prohibiting assumed synthetic attributes. |
| **ANTI-01** | **Separate `Change Object` Step After `Create Object`** | **General** | Platform Anti-Pattern | [golden-rules.md](golden-rules.md) | Creating an object and adding a separate `Change Object` step immediately after instead of initializing values directly on `Create Object`. |
| **ANTI-03** | **Unasserted Retrieve / Microflow Output Consumer Piping** | **Backend** | Methodological Anti-Pattern | [golden-rules.md](golden-rules.md) | Passing a retrieved object/list directly into downstream parameters without first validating existence via embedded `Assert Object Count` on the producer step. |
| **ANTI-04** | **Hardcoding Test Data Values in Step Names** | **General** | Methodological Anti-Pattern | [golden-rules.md](golden-rules.md) | Including runtime data values (e.g. `"Order #1234"`, `"Admin"`) inside step names instead of functional action templates. |
| **ANTI-05** | **Parallel / Batched Creation in Same Container** | **General** | Platform Anti-Pattern | [golden-rules.md](golden-rules.md) | Executing multiple sequential step creation tools in parallel within the same parent testcase, causing write collisions and corrupted sequences. |
| **ANTI-06** | **Asserting Object Count after `Create Object`** | **General** | Methodological Anti-Pattern | [golden-rules.md](golden-rules.md) | Adding embedded `Assert Object Count` on a `Create Object` step (in-memory instantiated objects are guaranteed to exist). |
| **ANTI-10** | **Embedded Assertions on Create/Change Object Steps** | **General** | Methodological Anti-Pattern | [golden-rules.md](golden-rules.md) | Declaring assertions as standalone test steps or configuring assert comparisons on Create or Change object steps instead of using them purely for initialization/mutation. |
| **ANTI-29** | **Unverified / Assumed Entity Fixture Attributes** | **General** | Methodological Anti-Pattern | [golden-rules.md](golden-rules.md) | Populating test step fixtures, filters, or exploratory JSON payloads with unverified synthetic attribute names without confirming existence in domain model AST, causing runtime metamodel mismatch exceptions. |

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
| **PAT-77** | **Mandatory Data Variation Container Metadata & Description Persistence Law** | **General** | Methodological Law | [data-variations.md](data-variations.md) | Mandates calling `TestCaseDataVariationName` AND `TestCaseDataVariationDescription` (or `TestSuiteDataVariation*`) on Scenario #1 (template) and all duplicated variations ($2..N$) immediately upon creation/duplication. |
| **ANTI-08** | **Duplicate Test Case Proliferation** | **General** | Methodological Anti-Pattern | [data-variations.md](data-variations.md) | Creating multiple duplicate test cases that share identical step structures just to test different inputs instead of using Data Variations. |
| **ANTI-11** | **Delta-Only Data Variation Override Assumptions** | **General** | Methodological Anti-Pattern | [data-variations.md](data-variations.md) | Allocating data variation columns without explicitly writing and verifying every single cell value in the matrix. |
| **ANTI-31** | **Unpersisted Variation Metadata & Description Omission Anti-Pattern** | **General** | Methodological Anti-Pattern | [data-variations.md](data-variations.md) | Omitting `TestCaseDataVariationDescription` (or `TestSuiteDataVariationDescription`) during persistent test construction or exploratory promotion, leaving descriptions ephemeral in markdown plans and unpersisted in the MTA database. |

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
| **PAT-62** | **Frontend Persistent MTA Construction Law** | **Frontend** | Methodological Law | [frontend-testing.md](frontend-testing.md) | Directs all Frontend UI tests to persistent MTA Platform construction across the canonical 3-case suite lifecycle with Gate 2 placement and Playwright settings. |
| **PAT-64** | **Closed Catalog Frontend Testkit Microflow Verification Law** | **Frontend** | Methodological Law | [frontend-testing.md](frontend-testing.md) | Mandates that all Frontend test step definitions (in Execution Plans, exploratory JSON blueprints, and persistent MTA test steps) MUST strictly use verified, existing microflows from MenditectMxFrontendTestKit and MenditectPlaywrightConnector catalogs. Prohibits inventing or assuming unverified microflow names. |
| **PAT-67** | **Exhaustive Page & Snippet Input Widget Discovery and Domain Reconciliation Law** | **Frontend** | Methodological Law | [frontend-testing.md](frontend-testing.md) | Mandates recursive multi-level widget extraction (`DESCRIBE PAGE`, `DESCRIBE SNIPPET`, `DESCRIBE ENTITY`) to build an exhaustive input widget inventory across main pages, tabs, and snippets. |
| **PAT-72** | **Single-Pass Page AST Seed Derivation & Testkit Auto-Mapping** | **Frontend** | Methodological Law | [frontend-testing.md](frontend-testing.md) | Derives root DataView entities, form attributes, reference selectors, and list collections directly from DESCRIBE PAGE AST, eliminating multi-entity CLI cascades and mapping widget types directly to Testkit locators. |
| **ANTI-12** | **Raw Playwright Connector Bypass Anti-Pattern** | **Frontend** | Platform Anti-Pattern | [frontend-testing.md](frontend-testing.md) | Bypassing `MenditectMxFrontendTestKit` to execute raw clicks, fills, or DOM selectors without explicit user authorization. |
| **ANTI-19** | **Trial-and-Error Frontend Execution & Raw CSS Selector Bypass** | **Frontend** | Methodological Anti-Pattern | [frontend-testing.md](frontend-testing.md) | Guessing raw Playwright selectors and executing live trial-and-error runs without static model inspection or Testkit locator microflows. |
| **ANTI-20** | **Frontend UI to Backend Domain Microflow Substitution Anti-Pattern** | **Frontend** | Methodological Anti-Pattern | [frontend-testing.md](frontend-testing.md) | Substituting frontend Testkit UI actions with direct backend domain microflows during frontend test planning or exploratory execution. |
| **ANTI-21** | **Frontend Testkit Microflow Invention / Hallucination Anti-Pattern** | **Frontend** | Methodological Anti-Pattern | [frontend-testing.md](frontend-testing.md) | Inventing, assuming, or hallucinating synthetic helper microflow names (e.g. ACT_Playwright_*, Playwright_Click, Page_Click, SetText) that do not exist in the official MenditectMxFrontendTestKit or MenditectPlaywrightConnector modules. |
| **ANTI-23** | **Shallow Page Inspection & Form Input Omission Anti-Pattern** | **Frontend** | Methodological Anti-Pattern | [frontend-testing.md](frontend-testing.md) | Inspecting only top-level page components or deriving form fields strictly from user prompt keywords while omitting nested snippets, tabs, secondary controls, or domain-bound input widgets. |

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
| **PAT-56** | **Dual-Track Decision Gate & Exploratory-First Verification** | **General** | Methodological Law | [core-playbook.md](core-playbook.md) | Prioritizes local in-memory exploratory testing (`execute-testcase`) with zero placement overhead before committing persistent test structures. *(Frontend UI tests are excluded per `PAT-62`)*. |
| **PAT-57** | **Exploratory-to-Persistent Test Promotion Protocol** | **General** | Platform Execution Law | [core-playbook.md](core-playbook.md) | Promotes passing exploratory tests to persistent MTA Platform storage after Gate 2 placement approval and MTA model revision sync verification. |
| **PAT-58** | **Backend Exploratory Execution Lifecycle & Telemetry Analysis** | **Backend** | Platform Execution Law | [exploratory-execution-guide.md](exploratory-execution-guide.md) | Executes Backend exploratory tests in a single continuous array with automatic in-memory rollback and structured telemetry analysis. |
| **PAT-59** | **Zero Construction Error Pre-Flight Law & Build Mismatch Diagnostic** | **General** | Platform Execution Law | [core-playbook.md](core-playbook.md) | Intercepts build errors during step creation to diagnose model mismatches, and enforces zero test construction errors in smoke audits and pre-flight execution. |
| **PAT-60** | **Dual-Track Execution Strategy Explicit Declaration in Execution Plan** | **General** | Methodological Law | [core-playbook.md](core-playbook.md) | Requires Execution Plans to explicitly declare the Execution Strategy in Section 1 (Option A: Exploratory vs Option B: Persistent MTA) and prompt the user for their choice at Gate 1. |
| **PAT-61** | **Standard Exploratory Test Execution Report Format** | **General** | Platform Execution Law | [exploratory-execution-guide.md](exploratory-execution-guide.md) | Mandates the structured exploratory execution report format including Test Goal, Execution Metadata (DateTime, RunID), Tri-State Result (PASS/FAIL/ERROR), TestCase Level Summary (Input/Output/Expected), Step Breakdown Table, and Error Logs. |
| **PAT-63** | **Backend Exploratory Single-Payload Blueprint Law** | **Backend** | Methodological Law | [exploratory-execution-guide.md](exploratory-execution-guide.md) | Mandates drafting a dedicated single-testcase Execution Plan with automatic rollback and JSON blueprint when Backend exploratory testing is chosen. |
| **PAT-65** | **Execution Plan Visual Formatting & Markdown Component Law** | **General** | Methodological Law | [core-playbook.md](core-playbook.md) | Mandates standardized 8-section layout, pre-approval quality audit banner with 13-check table, outer section collapsible containers (<details><summary>), clean Markdown step overview matrix with zero in-cell HTML blocks, standalone per-step drilldown blocks, zero emojis/icons, and pattern rationale tables for all Execution Plans. |
| **PAT-66** | **Exhaustive Exploratory Matrix Execution Law** | **General** | Platform Execution Law | [exploratory-execution-guide.md](exploratory-execution-guide.md) | Mandates iterating through and executing `MTA_plugin.execute-testcase` for all $N$ data variations defined in Section 7 of an approved Execution Plan rather than stopping after the baseline scenario. |
| **PAT-68** | **Live Test Data Provisioning & Manual Test Plan Protocol** | **General** | Methodological Law | [exploratory-execution-guide.md](exploratory-execution-guide.md) | Governs using `MTA_plugin.execute-testcase` with `RollbackTcseAfterExecution = "false"` for structured feature manual testing and exploratory ad-hoc data seeding. |
| **PAT-69** | **Two-Phase Manual Data Seeding & Cleanup Inspection** | **General** | Platform Execution Law | [exploratory-execution-guide.md](exploratory-execution-guide.md) | Mandates offering a dry-run preview before live mutating microflows and an interactive inspection step before batch deleting test data. |
| **PAT-70** | **Data Script & Manual Scenario to MTA Conversion Protocol** | **General** | Methodological Law | [exploratory-execution-guide.md](exploratory-execution-guide.md) | Mandates generating a formal Execution Plan and presents an explicit 3-choice path (Standalone Data Generator without teardown, Frontend 3-Case Suite with Playwright settings, or Backend 3-Case Integration Suite with teardown) when converting data seeding scripts to persistent MTA storage. |
| **PAT-71** | **Targeted Single-Pass Discovery & Semantic Path Tracing** | **General** | Platform Execution Law | [core-playbook.md](core-playbook.md) | Extracts full parameters, variables, return types, subflows, and switch cases from a single DESCRIBE MICROFLOW/PAGE AST command, prohibiting redundant exploratory listings (SHOW MODULES/ENTITIES/ENUMERATIONS). |
| **PAT-73** | **Chained Single-Payload Matrix Execution Law** | **General** | Platform Execution Law | [exploratory-execution-guide.md](exploratory-execution-guide.md) | Packages all N data variations into a single `TCEX_RQ_TestStepRun` array in 1 single `execute-testcase` tool call with intra-block teardown and disjoint keys, guaranteeing sub-second execution with zero cross-variation data conflicts under the existing plugin schema. |
| **PAT-74** | **Exploratory Single-Session Conflict Detection & Isolation Protocol** | **General** | Methodological Law | [exploratory-execution-guide.md](exploratory-execution-guide.md) | Audits microflow AST for single-session conflict vectors (database XPath queries, duplicate checks, singletons, non-transactional side-effects), applies intra-block deletes and disjoint keys, and provides automatic fallback to isolated single-scenario dispatches if unmanaged side-effects are detected. |
| **PAT-76** | **Mandatory Exploratory Benchmark & Latency Telemetry Law** | **General** | Platform Execution Law | [exploratory-execution-guide.md](exploratory-execution-guide.md) | Mandates extracting and displaying the full 3-part performance benchmark profile (wall-clock throughput, operations category split, per-scenario latency) in all exploratory test reports. |
| **ANTI-13** | **Blind Void Microflow Crash-Only Testing** | **Backend** | Methodological Anti-Pattern | [build-construction-guide.md](build-construction-guide.md) | Accepting simple "no crash" execution checks for complex void microflows without auditing database side-effects. |
| **ANTI-14** | **Using MTA TestCase Validation Feedback Assertions in Frontend UI Tests** | **Frontend** | Methodological Anti-Pattern | [frontend-testing.md](frontend-testing.md) | Applying `AssertValidationFeedbackMessageCompare`/`Count` in Frontend UI tests instead of asserting on DOM elements. |
| **ANTI-15** | **Premature Container Provisioning (Bypassing Local Exploratory Verification)** | **General** | Methodological Anti-Pattern | [core-playbook.md](core-playbook.md) | Forcing full central database provisioning on MTA Platform for untested or rapidly changing logic when local app and `MTA_plugin` are active. |
| **ANTI-16** | **Unpromoted Exploratory Test Drift (Ephemeral-Only Testing)** | **General** | Methodological Anti-Pattern | [core-playbook.md](core-playbook.md) | Running exploratory tests in development but never promoting verified tests to persistent MTA test suites, leaving CI/CD pipelines unprotected. |
| **ANTI-17** | **Premature Step Construction on Stale MTA Revision** | **General** | Platform Anti-Pattern | [core-playbook.md](core-playbook.md) | Attempting persistent test step construction when required model elements exist only locally and are not yet synchronized to the active MTA Model Revision. |
| **ANTI-18** | **Ignored Construction Errors & Cascading Build Failure Anti-Pattern** | **General** | Platform Anti-Pattern | [core-playbook.md](core-playbook.md) | Continuing step construction or attempting test execution after encountering model element not-found errors or active construction errors. |
| **ANTI-22** | **Single-Scenario Exploratory Truncation Anti-Pattern** | **General** | Methodological Anti-Pattern | [exploratory-execution-guide.md](exploratory-execution-guide.md) | Executing only the baseline/template variation in local exploratory mode while ignoring the remaining variation matrix rows defined in Section 7. |
| **ANTI-24** | **Dirty Database Test Data Pollution Anti-Pattern** | **General** | Methodological Anti-Pattern | [exploratory-execution-guide.md](exploratory-execution-guide.md) | Creating or mutating database records for manual testing without maintaining an automated teardown/cleanup manifest. |
| **ANTI-25** | **Manual UI Data Entry Slog Anti-Pattern** | **General** | Methodological Anti-Pattern | [exploratory-execution-guide.md](exploratory-execution-guide.md) | Forcing testers to spend hours manually filling out repetitive multi-page UI forms to establish complex prerequisite test states instead of provisioning them via `MTA_plugin`. |
| **ANTI-26** | **Redundant Exploratory Model Query Cascade** | **General** | Platform Anti-Pattern | [core-playbook.md](core-playbook.md) | Executing multiple sequential CLI listing commands (SHOW MODULES, SHOW ENTITIES, DESCRIBE ENUMERATION) when component names and member types are already self-contained in the target element's AST. |
| **ANTI-27** | **Sequential Multi-Turn LLM Matrix Dispatch Anti-Pattern** | **General** | Methodological Anti-Pattern | [exploratory-execution-guide.md](exploratory-execution-guide.md) | Invoking `MTA_plugin.execute-testcase` across multiple sequential agent turns to execute variation rows instead of compiling them into 1 single chained payload. |
| **ANTI-28** | **Cross-Variation State Contamination & Blind Chaining Anti-Pattern** | **General** | Methodological Anti-Pattern | [exploratory-execution-guide.md](exploratory-execution-guide.md) | Chaining multiple data variations into a single session without performing pre-execution AST conflict audits or applying intra-block deletions and disjoint synthetic keys, leading to duplicate key exceptions, inaccurate database query results in downstream variations, or false test failures. |
| **ANTI-30** | **Exploratory Performance & Latency Telemetry Omission Anti-Pattern** | **General** | Methodological Anti-Pattern | [exploratory-execution-guide.md](exploratory-execution-guide.md) | Omitting per-step execution durations, using uncalculated placeholder text (< 1000 ms, [X ms]), or presenting exploratory test results without the 3-part performance profile breakdown. |

---

## 🤖 AI Pre-Flight Plan Audit Checklist (Execution Protocol)

Before presenting any Execution Plan to the user in `STATE_BUILD_PLANNING` or constructing steps in `STATE_CONSTRUCTION`, the AI Agent MUST run the 13-point mental self-audit against the canonical pattern index (detailed in `mta-test-design/SKILL.md`):

```markdown
[ ] [CHECK 1] DIRECT INITIALIZATION [Backend]: Are all attributes/associations set directly on Create Object steps without subsequent Change Object steps? (PAT-06 / ANTI-01)
[ ] [CHECK 2] EMBEDDED STEP ASSERTIONS [Backend]: Are assertions embedded directly in Field 6 of Retrieve/Microflow producer steps? (PAT-08 / PAT-14 / ANTI-03 / ANTI-06 / ANTI-10)
[ ] [CHECK 3] ZERO DATA IN NAMES [General]: Are all step names free of hardcoded runtime values? (PAT-55 / ANTI-04)
[ ] [CHECK 4] EXECUTION SETTINGS [Backend/Frontend]: Are execution settings properly configured per tier (_Stop for Backend vs _Always/_Continue for Frontend Seeding/Cleanup)? (PAT-03 / PAT-17 / PAT-18 / ANTI-07)
[ ] [CHECK 5] UNSHARED SESSION PERSISTENCE [Frontend]: Is a single parameterless Persist step included after Case 1 seeding in Frontend tests? (PAT-20 / PAT-21)
[ ] [CHECK 6] SEQUENTIAL BATCHING [General]: Are step creation tool calls executed strictly one-by-one with forward predecessor chaining? (PAT-11 / PAT-16 / ANTI-05)
[ ] [CHECK 7] DUAL-TRACK STRATEGY EXPLICIT CHOICE: Is the execution strategy explicitly declared and selected? (PAT-56 / PAT-60 / PAT-62)
[ ] [CHECK 8] DATA VARIATION MATRIX RECONCILIATION: Is the scenario matrix fully defined and capped (max 8 columns) with all variation names and descriptions persisted? (PAT-19 / PAT-54 / PAT-77 / ANTI-08 / ANTI-11 / ANTI-31)
[ ] [CHECK 9] TEST STEP PATTERN ANNOTATION: Are step descriptions properly formatted with pattern tags? (PAT-12)
[ ] [CHECK 10] PROMPT VS MTA SKILL CONFLICT AUDIT: Is Section 2 included and audited against MTA Skill Laws?
[ ] [CHECK 11] FRONTEND TESTKIT CLOSED CATALOG VERIFICATION: Are all Frontend microflows verified from closed catalogs? (PAT-64 / ANTI-20 / ANTI-21)
[ ] [CHECK 12] UNIFORM 8-FIELD STEP SCHEMA: Do all steps strictly adhere to the 8-field schema? (PAT-34)
[ ] [CHECK 13] VISUAL FORMATTING & COMPONENT STANDARD: Are required markdown tables and outer collapsible containers present with zero in-cell HTML blocks and zero icons? (PAT-65)
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
