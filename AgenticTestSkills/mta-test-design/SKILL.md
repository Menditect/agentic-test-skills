---
name: mta-test-design
description: "Onboarding, starting prompts, design, scoping, and planning of test cases for Menditect Test Automation (MTA), answering general testing/prompting questions, exploratory test design, test data provisioning strategies, and performance benchmarking plans. Trigger on keywords: MTA design, test plan, execution plan, exploratory test, exploratory testing, test scoping, data seeding strategy, benchmark plan."
version: "6.32.0"
changes: "Added Option A Payload Trap Warning under PAT-111 and refined pre-approval audit Check 5 & 11."
---

# MTA Test Scoping & Design Skill

## 🚦 Entry Rule: Vague Testing Requests, Exploratory Tests & Ad-Hoc Data Creation Triggers

### 1. General Vague Testing & Exploratory Test Ingestion:
If the user's request is vague, exploratory, asks for an exploratory test (e.g. *"run an exploratory test using the MTA_plugin"*), or contains phrases such as:
- "exploratory test"
- "run an exploratory test"
- "exploratory testing"
- "test using MTA_plugin" / "in-memory test"
- "test this microflow" / "test this entity"
- "I want to test this app"
- "How should I start testing?"
- "What is the best way to test?"
- "Where do I begin with testing?"
- "Show me some prompts for MTA"

Or if an AI agent (like MAIA or another AI) has built or modified software in the Mendix application (detectable by a modified Mendix `.mpr` document, a new Git commit, or upon application startup):
- **You MUST proactively ask the user if they need automated testing for the newly built/modified software.**

…you MUST load and follow this skill FIRST, before `mta-build` or `mta-run-analyze`.
Do NOT assume a specific test case or microflow target. 
**Onboarding Requirement:** You MUST immediately respond by presenting the onboarding guide and copy-pasteable starter prompts from [prompts-templates.md](references/prompts-templates.md#🚀-onboarding--starter-prompts-for-new-users) to make it extremely easy for the user to start successfully. Begin at `STATE_BUILD_PLANNING (PLAN_STEP_1)`.

### 2. Ad-Hoc Data & Entity Creation Ingestion Protocol (`PAT-70`, `ANTI-46`, `PAT-89`):
If the user's prompt requests creating, seeding, or generating business entities or records—regardless of how conversational, informal, or underspecified—such as:
- *"create 5 cars with 2 carsizes and 2 locations in my app"*
- *"seed 3 orders with 2 customers"*
- *"generate 10 invoices in module Billing"*
- *"add some test data for products"*

You are **strictly prohibited** from:
1. Executing tool calls directly to insert data without an Execution Plan (`ANTI-46`).
2. Asking unstructured, open-ended conversational questions (e.g. "which microflow should I use?").
3. Bypassing `STATE_BUILD_PLANNING`.

**Mandatory Autonomous Action Protocol:**
1. **Autonomous Domain Entity Resolution (Single-Pass `mxcli`):** Extract the entity and association nouns (e.g. `cars` -> `Car`, `carsizes` -> `CarSize`, `locations` -> `Location`). Silently execute `mxcli SHOW ENTITIES` (or `SHOW MODULES`) to resolve fully qualified entity names (e.g., `CarRental.Car`, `CarRental.CarSize`, `CarRental.Location`) and their cross-entity associations (`Car_CarSize`, `Car_Location`).
2. **Draft Standalone Data Seeding Execution Plan (`PAT-70` Option 1):** Immediately draft an `# MTA EXECUTION PLAN SIGN-OFF` (`EP_Seed_<Entity>.md`) with `status: "DRAFT"` in `${execution_plans_dir}/`:
   - *Profile:* Standalone Data Seeding Test Case (1-Case Generator with trailing `Persist` step and no teardown steps; `Rollback = No`).
   - *Attribute & Association Init:* Map initial attributes and associations directly onto `CreateObjectActionTestStep(ObjectAction="CreateObject")` (`PAT-06`).
   - *Data Variations Matrix (Section 7):* Compile the requested counts into a balanced $N$-variation matrix (`VAR_01`..`VAR_0N`) systematically distributing the permutations (e.g., distributing the 2 sizes and 2 locations across the 5 cars).
3. **Present Checkpoint 1 Decision Card (`PAT-89`):** Render the concise Executive Summary Box (~35 lines) and present the universal execution environment decision (referencing Case 3 in [checkpoint-templates.md](references/checkpoint-templates.md#case-3-for-standalone-data-seeding-plans-ep_seed_entitymd--rollback--no)):
   - **Option A (Local Direct Seeding):** Dispatches the data seeding payload directly into the running local Mendix JVM via `MTA_plugin.execute-testcase` with `Rollback = No` and trailing batch `Persist`. *Zero server placement/configuration scanning; immediate execution in 1 turn.*
   - **Option B (Persistent MTA Platform Seeding Test Case):** Constructs a reusable 1-case Data Generator test case on the MTA Server (`Rollback = No`, trailing `Persist`, no teardown) for CI/CD or team use. *Proceeds to `PLAN_STEP_2` for configuration and suite placement.*

This skill helps the user identify what to test by analyzing business requirements (user stories, documentation) and Mendix model changes (commits, microflow typologies, page layouts). It systematically scores both technical and business risks, maps them to the appropriate tier of the MTF Testing Pyramid, and generates build blueprints that serve as structured input prompts for the `mta-build` skill.

---

## 🧭 THE 3-STEP INTERACTIVE PLANNING LOOP (STATE_BUILD_PLANNING)
When active under the macro state `STATE_BUILD_PLANNING`, track your current planning progress using the Temp State property in the global State Header:

`[State: STATE_BUILD_PLANNING | Temp State: PLAN_STEP_X | Active Skill: mta-test-design]`

You must progress sequentially through these three interactive planning micro-steps to build a rock-solid Execution Plan with dual user approval gates:

### 1. `PLAN_STEP_1: Scoping & Test Specification Drafting (Part 1 - Gate 1 Approval)`
*   **Action**: Perform `mxcli` model audit, define functional scope, test objectives, authentication/login requirement (*With vs Without Login*), and draft the complete Execution Plan directly to a local `.md` file at `${execution_plans_dir}/EP_<TestCaseName>.md` (resolved from `mta_config.json` > `execution_plans_dir`, falling back to `${MTA_OUTPUT_PATH}/execution-plans/`) with `status: "DRAFT"` (`PAT-89`). In the chat, render ONLY the concise Executive Summary Box (~35 lines), the clickable file link, and the Checkpoint 1 Decision Card (`ANTI-41`).
*   **📚 Taxonomy Index of MTA Pattern Families (Quick Reference)**:
    Before designing steps, identify which pattern families apply to your target:
    - **Test Pyramid & Scoping:** `PAT-01`, `PAT-02`, `PAT-26`, `PAT-111` (Unified Promotable Blueprint Invariant), `ANTI-02`, `ANTI-60` (Unrolled Step Sequence Anti-Pattern)
    - **Object Lifecycle & Creation:** `PAT-06` (Direct Init on Create), `PAT-16`, `PAT-95` (Direct Piping Delete), `ANTI-01`, `ANTI-05`
    - **Retrieve, Filtering & Object Count:** `PAT-07` (Dual Filter/Null), `PAT-08` (Embedded Count Assertion), `ANTI-03`, `ANTI-06`
    - **Backend Microflow Calling & Assertions:** `PAT-04` (Void Flow Side-Effects), `PAT-14` (Embedded Assertions), `PAT-17` (Backend Settings `None`/`Stop`), `PAT-109` (One-Shot Microflow AST Extraction Protocol), `ANTI-07`, `ANTI-10`, `ANTI-13`
    - **Data Variations & Consolidation:** `PAT-19`, `PAT-27`, `PAT-54`, `PAT-77` (Variation Descriptions), `PAT-86`, `PAT-87`, `PAT-110` (Target-Bound Variation Matrix Schema), `ANTI-08`, `ANTI-11`, `ANTI-31`, `ANTI-40`, `ANTI-59` (Conceptual Untargeted Matrix Columns)
    - **Frontend UI Testing & Locators:** `PAT-03` (3-Case Split), `PAT-18` (UI Settings `Always`/`_Continue`), `PAT-41` (Navigation/Login), `PAT-42` (Date Offsets), `PAT-52` (List Filters), `PAT-64` (Closed Catalog Testkit), `PAT-67` (Widget Inventory), `PAT-72` (Single-Pass Page AST), `ANTI-20`, `ANTI-21`, `ANTI-23`
    - **Execution Strategy & TDM:** `PAT-60` (Dual-Track), `PAT-63` (Exploratory Single-Payload), `PAT-68`..`PAT-70` (Live Data Seeding/MTP), `PAT-73`..`PAT-76` (Matrix Execution & Telemetry), `PAT-111` (Unified Promotable Blueprint Invariant), `PAT-112` (Free MTA Exploratory License Detection & Consultative Value Protocol), `ANTI-24`..`ANTI-30`, `ANTI-60` (Unrolled Step Sequence Anti-Pattern), `ANTI-61` (Deceptive Offline Masking & Commercial Spamming Anti-Pattern)
    - **Governance, Lineage & Verification:** `PAT-43` (Gate Enforcement), `PAT-44` (Plan Sealing), `PAT-82` (14-Point Pre-Approval Audit), `PAT-84` (Plan Lineage), `PAT-88` (Smoke Link Sealing), `PAT-89` (File-First Drafting & Executive Chat Summary), `ANTI-36`, `ANTI-38`, `ANTI-41`
*   **🧠 Mandatory Pattern Applicability Checklist (Silent Chain of Thought - CoT)**:
    Before drafting the Execution Plan, you **MUST** execute a pattern applicability evaluation internally within your thinking tokens (do **NOT** output this checklist into the chat, to keep chat noise minimal):
    1. *Component Typology:* Evaluate detected targets (e.g., Authenticated Page, Void Microflow, Selection Dropdowns, Repeating DataGrid2, etc.).
    2. *Selected Patterns:* Cross-reference the Taxonomy Index above and identify the active `PAT-xx` and `ANTI-xx` rules governing this test.
    3. *Enforcement Rationale:* Verify internally how the plan will conform to each selected pattern.
*   **⚡ Phase 0: Prior Execution Plan Discovery & Tri-Choice Lineage Law (`PAT-84`, `ANTI-38`)**:
    *   *Silent Discovery:* Before drafting a new Execution Plan, silently search `${execution_plans_dir}/` for any existing `EP_*.md` files targeting the same microflow or page.
    *   *Pre-Flight AST Delta Audit:* If an existing plan is found, parse its metadata header and run `mxcli DESCRIBE MICROFLOW` (or `DESCRIBE PAGE`) to compare the live AST against Section 4 of the prior plan. Identify added/removed/renamed elements.
    *   *Lineage Decision Card:* Present the audit summary using the canonical Lineage Decision Card template in [checkpoint-templates.md](references/checkpoint-templates.md#1-⚡-phase-0-prior-plan-lineage-decision-card-pat-84-anti-38) (**Path 0: Use Existing Plan As-Is**, **Path A: Evolve & Supersede**, **Path B: Branch Companion Case**, **Path C: Clean Slate**).
*   **⚡ One-Shot Microflow AST Extraction & Bifurcated Model Discovery Protocol (`PAT-109`, `PAT-71`, `ANTI-26`, `ANTI-58`)**:
    *   *Mandatory Initial Tool Call (`PAT-109`):* For any backend test, the very first model inspection action MUST be a single-pass:
        ```bash
        .\mxcli.bat describe microflow <ModuleName>.<MicroflowName> -p <project.mpr>
        ```
    *   *Single Source of Truth Extraction:* The output of `describe microflow` provides parameter signatures, return types, documentation annotations (`@annotation`) containing business rules and constraints, all decision nodes (`if`, `case`) and expression logic, sub-microflow calls, and inline entity mutations (`change $Object`) in 1 single turn.
    *   *Secondary Query Prohibition & Escape Hatch:* Agents are strictly forbidden from performing exploratory query cascades (such as querying `catalog.db`, running `SHOW ENTITIES`, or executing separate `DESCRIBE MICROFLOW` on sub-microflows) unless secondary queries are explicitly required to trace nested side-effects (`PAT-97`) or verify domain attribute length constraints (`PAT-53`).
    *   *Path B: Domain Model, Entity Schema & Call-Graph Discovery (Catalog SQL):* When Case 1 seeding or call-graph tracing requires catalog queries, query SQLite catalog (`[MENDIX_MPR_PATH]\.mxcli\catalog.db`) using native `mxcli` SQL commands (`.\mxcli.bat -c "SELECT ... FROM CATALOG.<TABLE>"`):
        - Microflow metadata & complexity: `SELECT Name, QualifiedName, ReturnType, ParameterCount, ActivityCount, Complexity FROM CATALOG.MICROFLOWS WHERE QualifiedName = 'Module.Microflow';`
        - Activities & call graph: `SELECT Sequence, ActivityType, Caption, ActionType, ActionRef, EntityRef FROM CATALOG.ACTIVITIES WHERE MicroflowQualifiedName = 'Module.Microflow' ORDER BY Sequence;`
        - Referenced entities & subflows: `SELECT SourceName, TargetName, TargetType, RefKind FROM CATALOG.REFS WHERE SourceName = 'Module.Microflow';`
        - Entity verification: `SELECT Name, QualifiedName, EntityType, AttributeCount FROM CATALOG.ENTITIES WHERE QualifiedName = 'Module.Entity';`
        - Domain attributes & types (`PAT-75`, `PAT-53`, `ANTI-29`): `SELECT Name, DataType, Length, IsRequired FROM CATALOG.ATTRIBUTES WHERE EntityQualifiedName = 'Module.Entity';`
        - Java Action input parameters (when testing Java Actions): `SELECT Name, ParameterType, Ordinal FROM CATALOG.JAVA_ACTION_PARAMETERS WHERE QualifiedName = 'Module.JavaAction' ORDER BY Ordinal;`
    *   *Prohibition of Ad-Hoc Scripts (`ANTI-58`):* All SQLite catalog queries MUST be executed via the standard `mxcli` CLI interface (`.\mxcli.bat -c "..."`). Generating or running ad-hoc Python, PowerShell, or Node.js SQLite inspection scripts is strictly prohibited.
    *   *Schema Resilience & Parameter Invariant:* Microflow parameters are not stored in catalog tables (there is no `MICROFLOW_PARAMETERS` table); parameter discovery via `DESCRIBE MICROFLOW` is standard operation and MUST NOT trigger false catalog missing warnings. If any catalog query fails due to unexpected column schema changes, the agent executes `DESCRIBE CATALOG.<TABLE>;` before aborting.
    *   *Self-Contained Structure Extraction:* Extract parameters, return types, variables, called subflows, member expressions, and enum literals without running broad exploratory listing cascades (`SHOW MODULES`, `SHOW MICROFLOWS`, `SHOW ENTITIES`, `DESCRIBE ENUMERATION`) (`ANTI-26`).
    *   *Deep Semantic Path Tracing:* Systematically trace the microflow control flow graph (cascading guards, decision combinations, and formula calculations) with 100% logic fidelity to capture all boundary variations.
*   **🚨 AST Null-Check Decision Scanner & Mandatory `PAT-07` In-Memory Retrieve Injection**:
    *   *Pre-Planning AST Decision Audit:* During the single-shot `mxcli describe microflow` inspection, scan the AST for:
        1. **Parameter Null Checks:** `$Parameter != empty`
        2. **Association / Associated Object Null Checks:** `$Object/Association != empty` or retrieved associated object null checks.
    *   *Automatic Skeleton Injection (`PAT-07`, `ANTI-48`):* If any parameter or association null check is detected, AND the planned test scope includes null/empty boundary scenarios, the planner MUST NOT pipe `Create Object` directly to the microflow or association. It MUST automatically generate the **Dual Retrieve/Filter Empty Object Pattern (`PAT-07`)** in Phase 1:
        - **For Empty Parameter Support:**
          - Step A: Create Object (e.g. `Car`, initial attributes with synthetic key and sentinel attribute `LicensePlate = 'VALID'`)
          - Step B: Retrieve Object (`RetrieveOption = "Teststep"`, filtering on `LicensePlate == 'VALID'`)
          - Step C: Microflow Call (bound to Step B output handle).
          - In Variation Matrix: Scenario #1..#N-1 sets Step B Filter to `'VALID'`; Scenario #N (Null boundary) sets Step B Filter to `'NONE'`, producing an empty object handle in memory.
        - **For Empty Association Support:**
          - Step A: Create Target Object (e.g. `CarSize`, setting sentinel `Size = 'Small'`)
          - Step B: Retrieve Object (`RetrieveOption = "Teststep"`, filtering on `Size == 'Small'`)
          - Step C: Create Host Object (e.g. `Car`, setting association `Car_CarSize` to Step B output handle).
          - In Variation Matrix: Scenario with unassigned association sets Step B Filter to `'NONE'`, resulting in no association linked.
    *   *Prohibition of Raw JSON Shortcuts in Execution Plans (`PAT-07`, `PAT-111`):* Omission of `PAT-07` in favor of raw JSON shortcuts (such as `"UseEmptyObjectList": true` or omitted association keys) inside the documented Execution Plan `EP_*.md` is strictly prohibited. All nullable variations MUST be modeled via `PAT-07` Dual-Retrieve sentinels in the canonical skeleton.
    *   *Prohibition of Association Rows in Variation Matrix (`ANTI-48`):* Association bindings (e.g. `Car.Car_CarSize`, `Order.Order_Customer`) and Object Reference Handles are structural step settings and **CAN NEVER appear as rows in the Section 7 Data Variation Matrix**. MTA's variation engine (`AddTestCaseVariationItem`) only accepts scalar attributes, parameters, and assertions.
*   **🚨 Strict Target-Bound Data Variation Matrix Schema (`PAT-110`, `ANTI-59`)**:
    *   *Matrix Schema Invariant:* Section 7 Data Variation Matrices must strictly bind Rows (Y-Axis) to concrete test steps and registered variation items:
        - `Step X: Entity.Attribute`
        - `Step Y: Filter Entity.Attribute` (for `PAT-07` empty object/association variations)
        - `Step Z: Assert Return Value` / `Assert Validation Feedback`
    *   *Scenario Columns:* Columns (X-Axis) must strictly represent Scenarios (`#1 (ScenarioName)` through `#N (ScenarioName)`).
    *   *Prohibition of Conceptual Columns (`ANTI-59`):* High-level conceptual column headers or arbitrary boolean flags (e.g. `Association Assigned: Yes/No`, `Discount Applied`) are strictly prohibited in matrix headers. Every varied dimension must bind 1:1 to an MTA variation item (`TCVI_TestCaseVariationItems`).
*   **🚨 Mandatory Unified Promotable Blueprint Invariant & Anti-Unrolling Law (`PAT-111`, `ANTI-60`)**:
    *   *Unified Promotable Blueprint Invariant (`PAT-111`):* Every Execution Plan (`EP_<TestCaseName>.md`) written to disk MUST strictly document a single, minimal, canonical MTA step skeleton (e.g. 1 Create/Retrieve chain per entity + 1 Microflow Call) parameterized by Section 7 Data Variation Matrix.
    *   *Prohibition of Unrolled Step Sequences (`ANTI-60`):* Documenting unrolled, concatenated, or multiplied step sequences (e.g. repeating 3 steps 8 times to produce a 24-step plan across 8 scenario blocks) in `EP_*.md` is strictly prohibited.
    *   *Zero Plan Divergence:* The structure of `EP_*.md` on disk must be 100% identical whether drafted for Option A exploratory execution or Option B persistent MTA construction.
    *   *Option A Dynamic Plugin Execution Adapter Protocol:* The on-disk Execution Plan (`EP_*.md`) is the immutable Master Promotable Blueprint. When executing under Option A, the agent (`mta-run-analyze`) acts purely as a runtime compiler that programmatically expands the canonical skeleton across the $N$ variation matrix rows into the JVM `execute-testcase` payload in memory (or executes the parametric matrix) without altering the master blueprint on disk.
    *   *🚨 OPTION A PAYLOAD TRAP WARNING (`PAT-111`, `ANTI-48`):* Even when drafting an Execution Plan for Option A local exploratory auto-execution, you are **STRICTLY PROHIBITED** from using raw plugin shortcuts in the documented `EP_*.md` file (such as placing association bindings in Section 7 matrix rows or relying on `UseEmptyObjectList: true`). The file written to disk MUST ALWAYS be the **Master Promotable Blueprint** using `PAT-07` Dual-Retrieve filter steps (`Size == 'Small'` vs `'NONE'`) for nullable objects and associations. When executing Option A, the agent acts purely as a runtime compiler that translates `PAT-07` empty object handles into the local JVM payload in memory.
    *   *Seamless Promotion Guarantee (`PAT-106`):* Because the plan on disk is already a canonical MTA skeleton with `PAT-07` and Section 7 matrix, promoting an Option A exploratory test to Option B requires zero step restructuring or matrix translation. Construction proceeds directly from the exact same skeleton.
*   **⚡ Mandatory Single-Pass Page AST Seed Derivation & Testkit Auto-Mapping (`PAT-72`, `PAT-67`, `ANTI-23`, `ANTI-26`)**: When building an Execution Plan for Frontend tests:
    *   *MTA Server Fast-Path (Zero-CLI):* Execute a silent read-only `GetAppModelData` probe (`RetrieveAction="RetrievePagesByApplicationAndTestConfiguration"` and `"RetrieveWidgetsByPage"`) if MTA is reachable to retrieve page keys, custom CSS classes, widget keys, and types in sub-second time.
    *   *Single-Pass Page AST Seed Derivation (`PAT-72`):* If inspecting the local Mendix model via `mxcli`:
        1. **Page AST Inspection:** Execute `DESCRIBE PAGE <Module.Page>` (and recursive `DESCRIBE SNIPPET <Module.Snippet>` only for embedded snippets).
        2. **Single-Pass Seed Graph Extraction:** Derive the root DataView entity, bound form input attributes (`TextBox`, `DropDown`, `DatePicker`), parent-child association dependencies (`ReferenceSelector`), and collection entities (`DataGrid2`/`ListView`). Eliminates 3–5 redundant `DESCRIBE ENTITY` queries.
        3. **Deterministic Testkit Auto-Mapping & Two-Step Chain Law (Law 1, PAT-64, ANTI-21):** Every UI interaction strictly enforces the Two-Step Chain (`Locate` returning `Locator` -> `ACT` consuming `Locator`). Map discovered widgets to verified `MenditectMxFrontendTestKit` microflows per [frontend-testing.md](references/frontend-testing.md).
        4. **Pluggable Widget & String Resolution via mxcli v0.21.0:** For complex widgets run `DESCRIBE WIDGET <kind>`, and for text locators run `SEARCH STRINGS '<Text>'`.
        5. **Input Widget Inventory:** In Section 4 of the Execution Plan, construct an explicit **Input Widget Inventory** table listing every form widget, widget type, location, bound attribute, and verified Testkit locator microflow (`PAT-67`).
*   **🚨 Mandatory Self-Contained Seed Data Invariant with Master Data Distinction (Frontend Plans) (`PAT-91`, `PAT-92`, `PAT-93`, `ANTI-42`, `ANTI-43`)**:
    *   *Default Invariant (Transactional Seeding):* Plan explicit `Create Object` steps for all primary business entities and selectable catalog records bound to page widgets, concluded by a batch `Persist` step in Case 1 before launching the browser (`ExecutionCondition = "Always"`, `ResumeExecutionAfterException = "_Continue"`).
    *   *Symmetric Teardown Cleanup Law (`PAT-92`, `ANTI-43`):* Every transactional entity instantiated during Case 1 setup MUST have a corresponding direct handle delete in Case 3 Teardown (`TestStepOutputKey = Case1_CreateStepKey`), followed by a mandatory trailing batch `Persist` step (`ObjectAction = "Persist"`, `ExecutionCondition = "Always"`, `ResumeExecutionAfterException = "_Continue"`).
    *   *Reverse Dependency Order Deletion Protocol (`PAT-93`):* Teardown deletions in Case 3 MUST strictly proceed in reverse association dependency order ($\text{Leaf / Child Entities} \rightarrow \text{Intermediate Associations} \rightarrow \text{Root Entities}$) to prevent constraint errors.
    *   *Master / Reference Data Retrieval Exemption:* Static configuration entities (e.g. `Country`, `Currency`, `UserRole`) use explicit `Retrieve` steps with attribute filters in Case 1.
    *   *Disjoint Synthetic Identifiers:* All seeded records in Case 1 MUST use unique synthetic identifiers (e.g., prefixing codes with `'TEST_'`).
    *   *Precondition Prohibition (`ANTI-42`):* Preconditions must NEVER state *"Master data pre-seeded"* as a substitute for test steps.
*   **🚨 Mandatory Multiple Seed Objects for Lists & Selection Widgets (`PAT-40`, `PAT-67`, `ANTI-26`)**: For repeating containers or selection widgets, create at least 2 distinct seed records in Case 1.
*   **🚨 Mandatory Login & Role-Based Navigation Analysis (`PAT-41`)**: Determine authentication requirement (`Start_MxFrontend_Test_With_Login` vs `Start_MxFrontend_Test_Without_Login`) and resolve role-based home page navigation via `mxcli SHOW NAVIGATION`.
*   **🚨 Mandatory Dynamic Scalar Selection Piping**: Use dynamic scalar value piping (`SelectValueForValue`) referencing upstream seed steps instead of hardcoding static literal strings.
*   **🚨 Mandatory DatePicker Format & Offset Model Extraction Protocol (`PAT-42`, `PAT-94`, `ANTI-45`)**: For DatePicker widgets, execute `.\mxcli.bat bson dump -p "[MPR]" --type page --object "<Module>.<Page>" --format json` and inspect `FormattingInfo` to extract exact format patterns (`PAT-94`). Prohibit guessing date formats (`ANTI-45`).
*   **🚨 Mandatory Domain Model Attribute Length & Constraint Inspection (`PAT-53`)**: Check every proposed literal string value against `String(N)` length limits in the domain model. Propose only valid length values.
*   **🚨 Mandatory List Selection Filter Options Proposal**: Present Testkit filter options (`ELO_Filter_*_by_Text`, `ELO_Nth_*_Item`, scalar piping) in Section 5 (`PAT-52`).
*   **🚨 Mandatory Closed Catalog Frontend Testkit Microflow Verification (`PAT-64`, `ANTI-21`)**: All Frontend UI test steps must strictly use verified microflows from `MenditectMxFrontendTestKit` and `MenditectPlaywrightConnector` documented in [frontend-testing.md](references/frontend-testing.md).
*   **Intended Purpose & Void Flow Audit**: If target microflow returns Void, audit database side-effects for retrieve/count assertions (`PAT-04`). For Backend microflows, audit validation feedback actions (`AssertValidationFeedbackMessageCompare`/`Count`).
*   **Local-Level Execution Plan Drafting & Pre-Approval Parity Audit (`PAT-82`, `PAT-89`, `ANTI-36`, `ANTI-41`)**:
    1. *Execution Plan Formatting Resolution (`execution_plan_collapsible`):*
        Resolve the formatting style (Collapsible `<details>` vs Flat `##` Markdown) according to this strict hierarchy:
        - **1. Conversational Prompt:** If user explicitly requests "flat plan", "no collapsible tags", or "collapsible plan", follow prompt directly.
        - **2. `mta_config.json`:** If available, evaluate `execution_plan_collapsible` (boolean: `true` or `false`).
        - **3. Mode-Aware Fallback:**
            - **Agentic Mode (saving `.md` to disk):** Default to `true` (Collapsible `<details>`), guaranteeing compact navigation in IDEs (VS Code/Cursor/GitHub). Ensure blank lines surround `<summary>...</summary>` and `</details>` per CommonMark.
            - **Chat Mode (rendering directly in chat):** If client is Claude Desktop or user requests flat markdown, default to `false` (flat `##` Markdown headers) to prevent raw HTML rendering corruption.
    2. *Mode-Aware Execution Plan Delivery (`PAT-89`, `ANTI-41`):*
        - **Agentic Mode (Filesystem Tools Available):** Write the complete Execution Plan directly to `${execution_plans_dir}/EP_<TestCaseName>.md` with `status: "DRAFT"` using the canonical blueprint in [execution-plan-template.md](references/execution-plan-template.md). Persist draft metadata (`execution_plan_file`, `execution_plan_id`, `execution_plan_status: "DRAFT"`) into `mta_state.json`. In the chat stream, render ONLY the concise Executive Summary Box (~35 lines), clickable file link, and the appropriate Checkpoint 1 Decision Card.
        - **Chat Mode (No Filesystem Access / Pure Web Chat):** In the chat stream, render ONLY the concise Executive Summary Box (~35 lines) and the Checkpoint 1 Decision Card (which includes the `[Show Full Plan]` action option). If the user explicitly asks to view the full plan (or clicks `[Show Full Plan]`), render the complete 8-section plan inside a single copyable ````markdown ```` code block.
    3. *Mandatory Active MCP Server Discovery & Parity Verification (`PAT-82`, `ANTI-36`):* In all AI environments (MAIA, Gemini, Claude, Cursor, Antigravity) and modes (Agentic/Chat), inspect the active tool catalog in the current session:
        - *Tool Catalog & Server Status Probing:*
            - Check if `MTA` platform tools (`GetAppModelData`, `GetApplicationDetails`, `CreateTestSuite`, `ExecuteTest`, etc.) are registered in the current session. If registered, call read-only `GetAppModelData` to audit planned elements against the active MTA model revision.
            - Check if `MTA_plugin` tools (`execute-testcase`) are registered in the current session.
        - *Outcome Classification:*
            - **Case 1 (`MTA` Not Registered / Down / Out-of-Sync / Free Exploratory License & `MTA_plugin` Active):** If `MTA` tools are not registered in the tool catalog (e.g., in MAIA with only `MTA_plugin` configured or under Free MTA Exploratory License `mta_license_tier: "free_exploratory"`, `PAT-112`) or unreachable, mark Check 14 as `BLOCKED (Free Exploratory Tier / MTA Server Not Registered | Plugin Active)`. Strictly block Option B (`ANTI-36`, `ANTI-61`). For Backend tests, Option A remains **ACTIVE**. Present **Checkpoint 1 Case 1**. NEVER present Option B as available.
            - **Case 2 (`MTA` In-Sync & Active AND `MTA_plugin` Active):** Both servers are registered and live. Mark Check 14 as `PASS (Verified)`. Present **Checkpoint 1 Case 2** (Dual Track Option A vs Option B).
            - **Case 3 (Standalone Data Seeding):** Present **Checkpoint 1 Case 3** (Option A Direct Seeding vs Option B Persistent Seeding).
            - **Case 4 (Dual Outage — `MTA` Down/Unregistered AND `MTA_plugin` Down/Unregistered):** Mark Check 14 as `BLOCKED (Both MCP Servers Offline)`. Strictly block both Option A and Option B execution. If in Agentic Mode, save the draft plan (`status: "DRAFT"`), record metadata in `mta_state.json`, present **Checkpoint 1 Case 4 (Offline / Dual-Outage Mode)**, and provide setup instructions.
            - **Case 5 (Asymmetric Outage — `MTA` In-Sync & Active, but `MTA_plugin` Down / Not Registered):** Mark Check 14 as `PASS (MTA Verified) | BLOCKED (Local Plugin Offline)`. Option A is blocked. Option B is **ACTIVE**. Present **Checkpoint 1 Case 5 (Persistent MTA Platform Only)**.
    4. *Offline Draft Resumption & Model Parity Law:* When resuming an offline draft or retrying Option B after an outage, you **MUST** re-evaluate Check 14 (`GetAppModelData`) to verify model parity against the server revision before proceeding to placement discovery (`PLAN_STEP_2`).
    5. *Frontend UI Offline Invariant (`PAT-62`):* Frontend UI tests drive browser sessions via Playwright on the MTA Platform and **cannot** execute via `MTA_plugin.execute-testcase`. When `Category: Frontend` and the `MTA` MCP server is unavailable, Option A is NOT available; save the plan to disk as `status: "DRAFT"` (updating `mta_state.json`) and inform the user that test execution is queued until the MTA server is available.
*   **🚨 Mode-Aware Gate 1 Halt & Auto-Approval Law (`PAT-43`, `exploratory_execution_mode`)**:
    Evaluate `mta_config.json.exploratory_execution_mode` (default: `"auto_execute"`).
    
    1. **Option A Fast-Path Auto-Execution (`"auto_execute"`):**
       - **Applicability:** Applies strictly when `Category == "Backend"`, `Target == "MTA_plugin"`, and `RollbackTcseAfterExecution == "Yes"`.
       - **Action:** Write the complete Execution Plan directly to `${execution_plans_dir}/EP_<TestCaseName>.md` with `status: "AUTO_APPROVED"` (enforcing the 5-anchor contract). Persist plan metadata into `mta_state.json`.
       - **Zero-Wait Invariant:** Do **NOT** halt at Checkpoint 1.
       - **Immediate Execution:** In the **very same turn**, invoke `mta-run-analyze` (`Temp State: STATE_EXPLORATORY_EXECUTION`) to compile the JSON blueprint and execute `MTA_plugin.execute-testcase`.
       - **Turn Output:** Output the rich exploratory execution telemetry report along with a direct clickable link to the persisted plan (`[EP_<TestCaseName>.md](file:///...)`).
    
    2. **Option A Governed Mode (`"prompt_approval"`):**
       - Write the Execution Plan with `status: "DRAFT"`, present the Executive Summary Box and Checkpoint 1 Decision Card, and **HALT** for explicit user approval before execution.
    
    3. **Option B (MTA Platform) & Live Database Seeding (`Rollback == "No"`):**
       - Strictly prohibited from auto-executing. The agent **MUST ALWAYS HALT** for explicit user approval (Checkpoint 1 for plan review, followed by Checkpoint 2 for placement).
*   **🚨 Checkpoint 1 Halt Rule & Strategy Decision Card (When Halting for Approval)**: Present the Executive Summary Box (and clickable link in Agentic Mode), render the appropriate Checkpoint 1 Decision Card from [checkpoint-templates.md](references/checkpoint-templates.md#2-🚦-checkpoint-1-test-plan-review--execution-strategy-decision-cards-pat-43-pat-60-pat-82-pat-89-anti-36-anti-41), and **HALT** for explicit user approval:
    - **Case 1 (Model Delta / Mismatch or MTA MCP Server Unavailable, MTA_plugin Active):** Render Case 1 card (Option B Blocked, Option A Active for Backend).
    - **Case 2 (In-Sync Parity & Both MCP Servers Active):** Render Case 2 card (Dual Track Option A vs Option B).
    - **Case 3 (Standalone Data Seeding):** Render Case 3 card (Option A Direct Local Seeding vs Option B Persistent Seeding).
    - **Case 4 (Dual Outage — Both MCP Servers Unavailable):** Render Case 4 card (Both Execution Routes Blocked, Draft Saved to Disk, Diagnostic Steps).
    - **Case 5 (Asymmetric Outage — MTA Active & In-Sync, Local Plugin Offline):** Render Case 5 card (Option A Blocked, Option B Active).
    - **Frontend UI Tests Policy Notice (`PAT-62`):** Frontend tests route exclusively to Option B (Persistent MTA Platform) when the MTA MCP server is available.
*   **⚡ Execution Strategy Decision Flow & Fast-Path Local Execution Law (`PAT-63`)**:
    *   **If User Selects Option A (Immediate Local Execution - Exploratory Test or Live Data Seeding):** Zero server scanning. Transition immediately to `mta-run-analyze` (`Temp State: STATE_EXPLORATORY_EXECUTION` or `STATE_LIVE_DATA_PROVISIONING`) to execute via `MTA_plugin.execute-testcase` in 1 turn.
    *   **If User Selects Option B (Direct Persistent MTA Test - Default for Frontend):** Proceed to `PLAN_STEP_2` (Placement Discovery) and `PLAN_STEP_3` (Gate 2 Approval).

### 📋 Manual Test Plan (MTP) & Live Test Data Provisioning Mode (`PAT-68`, `PAT-69`, `PAT-70`, `ANTI-24`, `ANTI-25`)
When the user's intent is manual exploratory testing or structured manual verification:
*   **Action**: Leverage `MTA_plugin.execute-testcase` as an ultra-fast, deterministic TDM engine (`RollbackTcseAfterExecution = "false"`).
*   **Data Script to MTA Conversion Protocol (`PAT-70`, `PAT-43`, `ANTI-46`):**
    1. *No Direct Construction Bypasses (`ANTI-46`):* Generate official Execution Plan (Gate 1) and resolve placement (Gate 2) before calling persistent construction tools.
    2. *Execution Plan Profiles:* Option 1 (Default: Standalone Data Seeding 1-Case Generator, `Rollback = No`, no teardown), Option 2 (Automated Frontend Test Suite, 3 cases), Option 3 (Automated Backend Integration Suite, 3 cases).

### 2. `PLAN_STEP_2: Placement & Settings Discovery (Part 2 - User Input Phase)`
*   **Action**: Interactively scan and resolve placement parameters and execution settings based on user input.
*   **🛑 Pre-Flight MTA MCP Server Availability Gate:** Before querying `GetApplicationDetails` or `GetTestConfigurationDetails`, verify that the remote `MTA` MCP server is registered and responsive. If unreachable (offline, connection error, or missing auth token per `PAT-95`):
    - Do NOT throw an unhandled error or attempt write operations.
    - Retain the Execution Plan on disk as `status: "DRAFT"` and update `mta_state.json`.
    - Output the `PAT-95` Sanitized Layered Return Message with diagnostic configuration steps, keeping the conversation active without deadlocking.
*   **Promotion Routing Rules**:
    *   **From In-Memory Exploratory Test (`PAT-57` — `Rollback = Yes`):** Promote directly 1:1 to a persistent Backend Test Case with Data Variations without prompting for structure type.
    *   **From Live Data Seeding (`PAT-70` — `Rollback = No`):** Default directly to **Type 1: Standalone Data Seeding Test Case (1-Case Generator)**.
*   **Mandatory Placement Prompt & Consolidated Scan:**
    *   *Fast-Path Placement (Known Placement):* If configuration, suite, or test case name are specified, sequentially query `GetApplicationDetails`, `GetTestConfigurationDetails`, and `GetTestSuiteDetails` in 1 single turn to validate and present the **Placement & Target Summary Box** (`PLAN_STEP_3`).
    *   *Consolidated Scan (Unknown Placement):* Query `GetApplicationDetails`, `GetTestConfigurationDetails`, and `GetExecutionUsers` in 1 single turn to present a consolidated Interactive Placement Card proposing selected configuration, suite, case name, and execution user.
*   **Existing & New Suite Checks:** For Frontend tests, present Playwright settings per [execution-settings.md](references/execution-settings.md) and handle suite overrides/conflicts per [placement-and-lifecycle.md](references/placement-and-lifecycle.md).

### 3. `PLAN_STEP_3: Placement Summary Presentation & Execution Plan Sign-Off (Part 3 - Checkpoint 2 Approval)`
*   **Action**: Compile and display the dedicated **Placement & Target Summary Box** from [checkpoint-templates.md](references/checkpoint-templates.md#3-🚦-checkpoint-2-confirm-test-suite-placement--settings-box-pat-43-pat-79) for Gate 2 approval.
*   **⚡ Mandatory Local Plan Storage, Revision Sealing & Sign-Off Protocol (`PAT-43`, `PAT-44`, `PAT-47`):**
    Upon Gate 2 approval, store the Execution Plan locally at `${execution_plans_dir}/EP_<TestCaseName>.md`:
    - Prepend the collapsible **Execution Plan Metadata Header** YAML block from [checkpoint-templates.md](references/checkpoint-templates.md#collapsible-metadata-yaml-block-schema-v120) (`schema_version: "1.2.0"`, `revision`, `status: "APPROVED"`, `approved_at`, `approved_by`, `approver_system_user`, etc.).
    - Display the **Sealed Receipt Notification** from [checkpoint-templates.md](references/checkpoint-templates.md#sealed-receipt-notifications) with clickable file links.
    - In Chat Mode (without file-writing tools), output the **Session Compaction JSON Block** from [checkpoint-templates.md](references/checkpoint-templates.md#5-💾-chat-only-session-compaction-json-block-pat-44).
    - Write metadata to `mta_state.json` (`execution_plan_file`, `execution_plan_id`, `execution_plan_status`, `execution_plan_approved_at`, `execution_plan_approved_by`, `execution_plan_revision`, `execution_plan_supersedes_id`, `test_configuration`, `test_suite`, `test_cases`).
*   **⚡ MTA Model Revision Synchronization & Decoupled Plan Storage Law**: Drafting and storing plans locally is always permitted even with uncommitted local elements (`PAT-36`).
*   **🛑 Backend Unit Test Execution Settings Law**: For ALL Backend Unit Tests, ALL test steps MUST be configured with `ExecutionCondition = "None"` and `ResumeExecutionAfterException = "Stop"` (`PAT-17`, `ANTI-07`).
*   **🛑 Direct Attribute & Association Initialization on Create Object Law**: Set all initial attributes and associations directly on `CreateObjectActionTestStep(ObjectAction="CreateObject")` (`PAT-06`, `ANTI-01`).
*   **🛑 Retrieve / Microflow Output Object Count Assertion Law**: Whenever an output object is consumed downstream, embed `Assert Object Count` directly in Field 6 of the producer step (`PAT-08`, `ANTI-03`).
*   **🛑 Dual Retrieve/Filter Empty Object Law (Data Variations)**: Use filter values (`'TEST_VAL'` vs `'NON_EXISTENT'`) to dynamically vary between valid and null objects/associations across variation rows (`PAT-07`).
*   **🚫 Strict Data Variation Consolidation**: Consolidate test cases with identical step topology into a single test case with an $N$-row Data Variation matrix (`PAT-19`, `ANTI-08`).
*   **🔄 Execution Plan Iteration & Modification Protocol (`PAT-89`, `ANTI-41`)**: When modifying a plan, update the `.md` file on disk, re-audit patterns against [pre-approval-audit.md](references/pre-approval-audit.md), and output ONLY the updated Executive Summary Box and Checkpoint 1 card in chat (`ANTI-41`).

---

## 📋 Standardized AI-Generated Execution Plan Blueprint

You **MUST** format the final approved Execution Plan strictly in accordance with the standardized blueprint defined in [execution-plan-template.md](references/execution-plan-template.md).

The Execution Plan layout consists of:
- **Execution Plan Metadata Header:** Collapsible `<details><summary><b>Execution Plan Metadata</b></summary>` YAML block (`schema_version: "1.2.0"`).
- **Single Unified Status Note:** Top-level status banner with Pre-Approval Quality Audit score (`14/14 checks executed`), MTA Server Parity status, and test category.
- **Direct MTA Web Navigation Links Table (Post-Build):** Placed beneath top note upon smoke verification.
- **Pre-Approval Quality Checklist:** Collapsible container verifying all 14 quality checks per [pre-approval-audit.md](references/pre-approval-audit.md).
- **8 Core Numbered Sections (plus Section 9 Post-Build Receipt):**
  1. *State Compaction & Target Placement*
  2. *Prompt & Input Log vs. MTA Skill Conflicts (MANDATORY)*
  3. *Test Case Scope & Dual-Risk Profile*
  4. *Verified Model Elements & Testability Profile (with Input Widget Inventory)*
  5. *Chronological Step Sequence Plan (with nested step drilldowns)*
  6. *Playwright / Browser Settings*
  7. *Data Variation Matrix & Metadata (with nested scenario descriptions)*
  8. *Applied Testing Patterns & Rationale*
  9. *MTA Build & Smoke Verification Receipt (Appended Post-Build)*

Consult [execution-plan-template.md](references/execution-plan-template.md) for the complete verbatim template and code fences.

---

## 📅 STRICT REACTIVE LOADING STRATEGY

To maximize token efficiency, **DO NOT load reference files preemptively**. Load them **strictly on-demand** based on the state or request:

| State / Focus Area | Load ONLY this file: |
| --- | --- |
| *Checkpoint 1 Decision Cards, Checkpoint 2 Summary Box, Lineage Cards & Sealed Receipts* | **`references/checkpoint-templates.md`** |
| *Execution Plan canonical layout, code fences & 8-section sign-off template* | **`references/execution-plan-template.md`** |
| *14-point Pre-Approval Quality Checklist details & verification criteria* | **`references/pre-approval-audit.md`** |
| *Identifying technical or business risks, evaluating microflow typologies* | **`references/risk-matrix.md`** |
| *Constructing and formatting build prompts for Backend or Frontend* | **`references/prompts-templates.md`** |
| *Auditing Execution Plans, verifying all 173 testing patterns/anti-patterns (`PAT-01..112`, `ANTI-01..61`), or auto-registering new learned patterns* | **`references/mta-patterns-and-antipatterns-reference.md`** |
| *Local Exploratory Execution, TCEX_RQ schema & bidirectional mapping* | **`references/mta-plugin-mcp-schema.md`** |

---

## 🔄 Downstream Handoff Trigger
Depending on the approved Execution Strategy, output the appropriate handoff trigger:

* **If Option A (Local Execution & Data Provisioning) was approved:**
  > 🚀 **Handoff Trigger (Local Execution Track)**: Ready to transition to `mta-run-analyze`. Load the `mta-run-analyze` skill to execute the test/seeding directly against the local application via `MTA_plugin.execute-testcase` (`Rollback = Yes (true)` with in-memory execution by default; `Rollback = No` only for `PAT-68` live test data seeding with batch `Persist`).

* **If Option B (Direct Persistent MTA Test) was approved in Gate 2 (`PLAN_STEP_3`):**
  > 🚀 **Handoff Trigger (Persistent Track)**: Ready to transition to `mta-build`. Load the `mta-build` skill with the generated prompt to construct the test on the MTA server.

---

## 🚫 MTA TEST SCOPING & DESIGN PATTERN REGISTRY

All testing patterns, laws, and anti-patterns enforced during test design (`PAT-01` through `PAT-111`, and `ANTI-01` through `ANTI-60`) are centrally defined and maintained in the canonical pattern catalog:  
➔ **[references/mta-patterns-and-antipatterns-reference.md](references/mta-patterns-and-antipatterns-reference.md)**
