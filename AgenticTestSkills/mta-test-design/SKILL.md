---
name: mta-test-design
description: "Onboarding, starting prompts, design, scoping, and planning of test cases for Menditect Test Automation (MTA), answering general testing/prompting questions, test data provisioning strategies, and performance benchmarking plans"
version: "6.12.0"
changes: "Enforced 7-column Step Sequence Matrix overview, scoped note callouts for PAT-84, banned ASCII border art, and standardized comparison operators."
---

# MTA Test Scoping & Design Skill

## 🚦 Entry Rule: Vague Testing Requests & AI-Generated Software Triggers

If the user's request is vague, exploratory, or indicates they are starting fresh — such as:
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

This skill helps the user identify what to test by analyzing business requirements (user stories, documentation) and Mendix model changes (commits, microflow typologies, page layouts). It systematically scores both technical and business risks, maps them to the appropriate tier of the MTF Testing Pyramid, and generates build blueprints that serve as structured input prompts for the `mta-build` skill.

---

## 🧭 THE 3-STEP INTERACTIVE PLANNING LOOP (STATE_BUILD_PLANNING)
When active under the macro state `STATE_BUILD_PLANNING`, track your current planning progress using the Temp State property in the global State Header:

`[State: STATE_BUILD_PLANNING | Temp State: PLAN_STEP_X | Active Skill: mta-test-design]`

You must progress sequentially through these three interactive planning micro-steps to build a rock-solid Execution Plan with dual user approval gates:

### 1. `PLAN_STEP_1: Scoping & Test Specification Drafting (Part 1 - Gate 1 Approval)`
*   **Action**: Perform `mxcli` model audit, define functional scope, test objectives, authentication/login requirement (*With vs Without Login*), and draft the complete Execution Plan directly to a local `.md` file at `${MTA_OUTPUT_PATH}/execution-plans/EP_<TestCaseName>.md` with `status: "DRAFT"` (`PAT-89`). In the chat, render ONLY the concise Executive Summary Box (~35 lines), the clickable file link, and the Checkpoint 1 Decision Card (`ANTI-41`).
*   **📚 Taxonomy Index of MTA Pattern Families (Quick Reference)**:
    Before designing steps, identify which pattern families apply to your target:
    - **Test Pyramid & Scoping:** `PAT-01`, `PAT-02`, `PAT-26`, `ANTI-02`
    - **Object Lifecycle & Creation:** `PAT-06` (Direct Init on Create), `PAT-16`, `PAT-20` (Direct Piping Delete), `ANTI-01`, `ANTI-05`
    - **Retrieve, Filtering & Object Count:** `PAT-07` (Dual Filter/Null), `PAT-08` (Embedded Count Assertion), `ANTI-03`, `ANTI-06`
    - **Backend Microflow Calling & Assertions:** `PAT-04` (Void Flow Side-Effects), `PAT-14` (Embedded Assertions), `PAT-17` (Backend Settings `None`/`_Stop`), `ANTI-07`, `ANTI-10`, `ANTI-13`
    - **Data Variations & Consolidation:** `PAT-19`, `PAT-27`, `PAT-54`, `PAT-77` (Variation Descriptions), `PAT-86`, `PAT-87`, `ANTI-08`, `ANTI-11`, `ANTI-31`, `ANTI-40`
    - **Frontend UI Testing & Locators:** `PAT-03` (3-Case Split), `PAT-18` (UI Settings `_Always`/`_Continue`), `PAT-41` (Navigation/Login), `PAT-42` (Date Offsets), `PAT-52` (List Filters), `PAT-64` (Closed Catalog Testkit), `PAT-67` (Widget Inventory), `PAT-72` (Single-Pass Page AST), `ANTI-20`, `ANTI-21`, `ANTI-23`
    - **Execution Strategy & TDM:** `PAT-60` (Dual-Track), `PAT-63` (Exploratory Single-Payload), `PAT-68`..`PAT-70` (Live Data Seeding/MTP), `PAT-73`..`PAT-76` (Matrix Execution & Telemetry), `ANTI-24`..`ANTI-30`
    - **Governance, Lineage & Verification:** `PAT-43` (Gate Enforcement), `PAT-44` (Plan Sealing), `PAT-82` (14-Point Pre-Approval Audit), `PAT-84` (Plan Lineage), `PAT-88` (Smoke Link Sealing), `PAT-89` (File-First Drafting & Executive Chat Summary), `ANTI-36`, `ANTI-38`, `ANTI-41`
*   **🧠 Mandatory Pattern Applicability Checklist (Silent Chain of Thought - CoT)**:
    Before drafting the Execution Plan, you **MUST** execute a pattern applicability evaluation internally within your thinking tokens (do **NOT** output this checklist into the chat, to keep chat noise minimal):
    1. *Component Typology:* Evaluate detected targets (e.g., Authenticated Page, Void Microflow, Selection Dropdowns, Repeating DataGrid2, etc.).
    2. *Selected Patterns:* Cross-reference the Taxonomy Index above and identify the active `PAT-xx` and `ANTI-xx` rules governing this test.
    3. *Enforcement Rationale:* Verify internally how the plan will conform to each selected pattern.
    *(By performing this checklist internally, you anchor your attention onto the relevant rules, eliminating pattern hallucinations and avoiding the cognitive overload of holding all 128 patterns in working memory).*
*   **⚡ Phase 0: Prior Execution Plan Discovery & Tri-Choice Lineage Law (`PAT-84`, `ANTI-38`)**:
    *   *Silent Discovery:* Before drafting a new Execution Plan, silently search `${MTA_OUTPUT_PATH}/execution-plans/` for any existing `EP_*.md` files targeting the same microflow or page.
    *   *Pre-Flight AST Delta Audit:* If an existing plan is found, parse its metadata header (supporting both outer `<details><summary><b>Execution Plan Metadata</b></summary>` and legacy header formats to extract `revision`, `plan_id`, `status`, `approved_at`, `approved_by`, `built_at`, `verified_at`, `test_case_name`) and run `mxcli DESCRIBE MICROFLOW` (or `DESCRIBE PAGE`) to compare the live AST against Section 4 of the prior plan. Identify added/removed/renamed parameters, return types, called subflows, entity attributes, or enum literals.
    *   *Tri-Choice Lineage Decision Card:* Present the audit summary and prompt the user with the 3 lineage paths adhering strictly to the Scoped Note Box & Clean Markdown Standard:
        1. **Strictly Scoped `> [!NOTE]` Box:** Only the detection header line and metadata bullet points (including a 1–2 line AST delta summary) are inside the note box.
        2. **Tri-Choice Decision Table Outside Note:** The 3 canonical lineage choices (Path A: Evolve & Supersede, Path B: Branch Companion Case, Path C: Clean Slate) are rendered in a clean, focused 4-column Markdown table (`Path`, `Action`, `Revision`, `When to Choose`) directly beneath the note box.
        3. **Zero ASCII / Unicode Box Characters:** Strictly prohibit ASCII border art (`╔`, `═`, `║`, `╠`, `╚`, `┌`, `─`, `│`, `└`). Use standard GitHub Flavored Markdown.
        4. **No Multi-Table Cascading in Chat:** Do not dump URL navigation tables or giant AST delta tables into chat during Phase 0 discovery. All AST comparison happens internally and is summarized in the 1–2 line AST Delta Summary bullet.
        5. **Strictly 3 Canonical Paths:** Only Paths A, B, and C are allowed. Never invent unverified options (such as 'Path D').
    *   *Prohibition:* Blindly overwriting prior plans, discarding prior context with amnesia, or dumping unreadable ASCII-art borders and multi-table cascades into chat is strictly prohibited (`ANTI-38`).
*   **⚡ Targeted Single-Pass Model Discovery & Deep Semantic Path Tracing (`PAT-71`, `ANTI-26`)**:
    *   *Single-Pass CLI Execution:* When a target microflow or component is specified, immediately execute the targeted command `DESCRIBE MICROFLOW <Module.Microflow>` (or `DESCRIBE PAGE <Module.Page>`) in a single pass on turn 1.
    *   *Self-Contained AST Extraction:* Extract input parameters, return types, variables, called sub-microflows, member expressions, and enum literals directly from the self-contained AST. You are **strictly prohibited** from running broad exploratory listing queries (`SHOW MODULES`, `SHOW MICROFLOWS`, `SHOW ENTITIES`, `DESCRIBE ENUMERATION`) when all required elements are present in the target AST (`ANTI-26`).
    *   *Verified Entity Fixture Attribute Binding Law (`PAT-75`, `ANTI-29`):* When constructing seed objects or in-memory entity fixtures (`Oact: Create` / `TCEX_RQ_AttributeValueRun`), if target entity members are not fully present in the microflow AST, verify entity attribute names and data types via `DESCRIBE ENTITY <Module.Entity>` before generating test steps/payloads. Prohibit assuming or hallucinating synthetic placeholder attributes (such as `Code`, `Id`, `Name`) without domain model verification.
    *   *Deep Semantic Path Tracing:* Systematically trace the microflow control flow graph (cascading guard hierarchies, decision combinations, and formula calculations) with 100% logic fidelity. Single-pass discovery optimizes retrieval speed, but deep semantic path analysis must remain fully rigorous to capture all boundary variations.
*   **⚡ Mandatory Single-Pass Page AST Seed Derivation & Testkit Auto-Mapping (`PAT-72`, `PAT-67`, `ANTI-23`, `ANTI-26`)**: When building an Execution Plan for Frontend tests:
    *   *MTA Server Fast-Path (Zero-CLI):* Execute a silent read-only `GetAppModelData` probe (`RetrieveAction="RetrievePagesByApplicationAndTestConfiguration"` and `"RetrieveWidgetsByPage"`) if MTA is configured and reachable to retrieve page keys, custom CSS classes, widget keys, widget types, and list data source flags in sub-second time. If MTA is not yet synchronized or local model AST is preferred, use `mxcli` single-pass page AST discovery (`PAT-72`).
    *   *Single-Pass Page AST Seed Derivation (`PAT-72`):* If inspecting the local Mendix model via `mxcli`:
        1. **Page AST Inspection:** Execute `DESCRIBE PAGE <Module.Page>` (and recursive `DESCRIBE SNIPPET <Module.Snippet>` only for embedded snippets).
        2. **Single-Pass Seed Graph Extraction:** Derive the complete seed data profile directly from the page AST: the root DataView entity, bound form input attributes (`TextBox`, `DropDown`, `DatePicker`), parent-child association dependencies (`ReferenceSelector`), and collection entities (`DataGrid2`/`ListView`). Eliminates 3–5 redundant `DESCRIBE ENTITY` queries.
        3. **Deterministic Testkit Auto-Mapping & Two-Step Chain Law (Law 1, PAT-64, ANTI-21):** Every UI interaction strictly enforces the Two-Step Chain (`Locate` returning `Locator` -> `ACT` consuming `Locator`). Map discovered widgets to verified `MenditectMxFrontendTestKit` microflows:
           * Text Inputs (`TextBox`, `TextArea`) -> `Locate_MxWidget_TextBox` / `Locate_MxWidget_TextArea` + `ACT_Fill_TextBox_Input` / `ACT_Fill_TextArea_Input` (or `ACT_Clear_TextBox_Input`)
           * Selection Dropdowns (`DropDown`, `ReferenceSelector`) -> `Locate_MxWidget_DropDown` + `ACT_SelectOption_DropDown_Select_By_Label` (or `SelectValueForValue` scalar piping)
           * ComboBox Widgets (`ComboBox`) -> `Locate_MxWidget_ComboBox` + 4-Step Protocol (`ACT_OpenMenu_ComboBox_Action` -> `ACT_Fill_ComboBox_Search_Input` -> `ACT_SelectOption_ComboBox_Menu_By_Label` -> `ACT_CloseMenu_ComboBox_Action`, Law 3)
           * Checkbox / Switch (`CheckBox`, `Switch`) -> `Locate_MxWidget_CheckBox` / `Locate_MxWidget_Switch` + `ACT_Check_CheckBox_Input` / `ACT_Uncheck_CheckBox_Input` / `ACT_Toggle_Switch_Input`
           * Date Inputs (`DatePicker`) -> `Locate_MxWidget_DatePicker` + `ACT_Fill_DatePicker_Input` (with relative offset per `PAT-42`)
           * Action Buttons (`Button`, `ActionRow`) -> `Locate_MxWidget_Button` + `ACT_Click_Button`
           * Repeating Containers (`DataGrid2`, `ListView`, `Gallery`) -> `Locate_MxWidget_DataGrid2` / `Locate_MxWidget_ListView` / `Locate_MxWidget_Gallery` + `ELO_Filter_*_by_Text` / `ELO_Nth_*_Item`
           * DOM Visibility / Value Assertions -> `ASR_Is_Visible_MxLocator`, `ASR_Has_Value_TextBox_Input`, `ASR_Has_Value_DropDown_Select`, `ASR_Has_Value_ComboBox`
        4. **Pluggable Widget & String Resolution via mxcli v0.21.0:**
           * *Pluggable & Custom Widgets:* For complex or custom widgets (e.g., DataGrid2, Gallery, custom extensions), run `.\mxcli.bat -p "[MPR]" -c "DESCRIBE WIDGET <kind>"` (or package ID) to expose exact property keys, dynamically visible properties, hide rules, and container child slots/object lists.
           * *Deterministic Text Locator Resolution:* Run `.\mxcli.bat -p "[MPR]" -c "SEARCH STRINGS '<Text>'"` (or `CATALOG.strings`) to resolve exact translatable strings for button captions, tab headers, and filter values without guessing.
        5. **Input Widget Inventory:** In Section 4 ("Verified Model Elements & Testability Profile") of the Execution Plan, construct an explicit **Input Widget Inventory** table listing every form widget, widget type, container/snippet/tab location, bound attribute, and verified Testkit locator microflow (`PAT-67`).
    *   *Page & Widget Summary:* Always show an explicit summary list of all pages and snippets involved in the test under Section 4 ("Verified Elements") of the plan.
*   **🚨 Mandatory Seed Data Analysis & Strategy Choice (Frontend Plans)**: Based on required pages and widgets, analyze what seed entity records are required for the test. You **MUST** present an explicit choice to the user:
    *   *Choice A:* Create fresh seed data in Case 1 (Setup) via `Create Object` / `Persist` steps.
    *   *Choice B:* Retrieve pre-existing seed data from the database via `Retrieve Object` steps.
*   **🚨 Mandatory Multiple Seed Objects for Lists & Selection Widgets**: For entities appearing in repeating containers (Gallery, ListView, DataGrid2) or selection widgets (DropDown, ComboBox, ReferenceSelector, ReferenceSetSelector), you **MUST** plan to create/retrieve **multiple seed objects** (at least 2-3 records) of the same entity type to validate selection accuracy and list filtering.
*   **🚨 Mandatory Login & Role-Based Navigation Analysis (`PAT-41`)**: Determine whether authentication is required and resolve navigation paths:
    *   *Login Required (Default):* By default, accessing Mendix pages requires authentication using `Start_MxFrontend_Test_With_Login`.
    *   *Anonymous Accessible:* If the target starting page is accessible without authentication, use `Start_MxFrontend_Test_Without_Login`. Note that Anonymous access is only permitted if enabled in App security settings and is **always explicitly mapped to an App-level user role**.
    *   *Navigation Resolution (Universal for Authenticated & Anonymous):* For both authenticated and anonymous flows, inspect Mendix navigation (`SHOW NAVIGATION` via `mxcli`) for the relevant User Role to identify the role-based home page and the menu navigation path leading to the starting page under test. If no role-based home page is defined for that user role, use the **default home page for the applied viewport navigation profile** (Desktop, Tablet, Phone screen settings) as the starting point (`PAT-41`).
*   **🚨 Mandatory Dynamic Scalar Selection Piping**: For selecting items from dropdowns, comboboxes, reference selectors, or lists, you **MUST** use dynamic scalar value piping (`SelectValueForValue`) referencing the output of upstream seed data steps instead of hardcoding static literal strings.
*   **🚨 Mandatory Date-Time Offset & Format Pattern Inspection**: For `DatePicker` / date-time widgets, you **MUST** use `CurrentDateTime` with an offset (e.g. `CurrentDateTime + 1 day`, `CurrentDateTime - 7 days`) as the preferred default option (`PAT-42`). Only choose a fixed `DateTime` when strictly necessary for the test purpose. Inspect the Mendix model via `mxcli` / page model for custom date format pattern configurations (`dateformPattern`).
*   **🚨 Mandatory Domain Model Attribute Length & Constraint Inspection**: When proposing test values or test step parameters for String (or other constrained) attributes, data types are enforced automatically, BUT attribute length restrictions (such as maximum length limits configured on String attributes in the Mendix Domain Model) are NOT automatically checked during value proposal (`PAT-53`). You **MUST** inspect the target entity's domain model definition via `mxcli` (`SHOW ENTITY`, `SHOW DOMAINMODEL`) or model tools to verify attribute constraints—specifically checking String maximum length limits—and ensure all proposed test attribute values strictly comply with these domain model constraints.
*   **🚨 Mandatory List Selection Filter Options Proposal**: When selecting an item from a list or repeating container, you **MUST** present the available Frontend Testkit filter options (`PAT-52`) directly inside the `ExecutionPlan`:
    *   *Option 1:* Text Filter (`ELO_Filter_*_by_Text`)
    *   *Option 2:* Position / Index Filter (`ELO_Nth_*_Item`)
    *   *Option 3:* Dynamic Scalar Value Piping from seeded objects
*   **🚨 Mandatory Closed Catalog Frontend Testkit Microflow Verification (`PAT-64`, `ANTI-21`)**: When drafting Frontend test steps (in Section 5 of an Execution Plan, exploratory JSON blueprints, or persistent step construction), you **MUST** strictly select and verify microflows from the official closed catalog of `MenditectMxFrontendTestKit` and `MenditectPlaywrightConnector` documented in `references/frontend-testing.md`. You are **strictly prohibited** from inventing, assuming, or hallucinating synthetic helper microflow names (e.g. `ACT_Playwright_*`, `Playwright_Click`, `Page_Click`, `SetText`). All parameter names, parameter types, and return types MUST match the official testkit signatures.
*   **Intended Purpose Verification**: Establish the intended use of the application and target component. If the intended use or target component is unclear, **do NOT guess or assume**. Stop and ask the user to clarify.
*   **Void Microflow Side-Effect Audit**: If the target microflow returns Void (no output parameter), halt and warn the user. Ask them to help identify database side-effects (creations, deletions, modifications) so that retrieve/count assertions can be designed instead of a basic exception-only check.
*   **Universal Validation Feedback Audit (Backend Microflow Tests ONLY)**: For Backend Microflow tests, inspect ANY target microflow (regardless of prefix or typology such as `ACT_`, `ORC_`, `SUB_`, `CMT_`) for "Validation feedback" action activities. Always evaluate whether `AssertValidationFeedbackMessageCompare` (for specific member messages) or `AssertValidationFeedbackMessageCount` (for message thresholds) are required. *(Note: This applies EXCLUSIVELY to Backend Microflow tests. For Frontend UI tests, validation feedback is checked directly on the page using UI widget text assertions).*
*   **Boundary & Scenario Identification**: Identify critical boundary conditions, edge cases, and scenarios to test.
*   **Local-Level Execution Plan Drafting & Pre-Approval Parity Audit (`PAT-82`, `PAT-89`, `ANTI-36`, `ANTI-41`)**: You are explicitly authorized to draft and design the entire Execution Plan based on the local Mendix model AST (`mxcli`).
    1. *File-First Plan Persistence (`PAT-89`):* Write the complete Execution Plan directly to a local Markdown file at `${MTA_OUTPUT_PATH}/execution-plans/EP_<TestCaseName>.md` with `status: "DRAFT"` using the canonical 8-section layout enclosed in outer collapsible headers.
    2. *Parity Verification:* Call the read-only MTA tool `GetAppModelData` to verify whether all planned microflows, entities, and attributes match identically in MTA.
       - *If Parity Matches (In-Sync):* Both Option A (Local Exploratory) and Option B (Direct Persistent MTA) are available.
       - *If Delta/Mismatch Detected (Out-of-Sync / Stale MTA Revision):* To prevent server build failures (`ANTI-36`), Option B is strictly blocked. The plan is automatically restricted to **Option A (Immediate Local Exploratory Testing)** until MTA is synchronized.
    3. *Executive Chat Summary Presentation (`PAT-89`, `ANTI-41`):* In the chat response, do **NOT** print the full hundreds-of-lines execution plan tables. Instead, render ONLY the concise **Executive Summary Box** (~35 lines, formatted strictly with standard native Markdown blockquotes/lists and NEVER with ASCII/Unicode box-drawing borders `╔═...═╗`), a direct clickable Markdown file link to the generated `.md` file, and the Checkpoint 1 Decision Card.
*   **🚨 Checkpoint 1 Halt Rule & Strategy Decision Card (Execution Plan Review)**: Present the Executive Summary Box and clickable plan link, conclude with the structured **Checkpoint 1: Test Plan Review & Execution Strategy Decision Card**, and **HALT**. You **MUST** ask for explicit user approval of the Execution Plan and handle the Execution Strategy based on the test category and parity audit results: [^PAT-43] [^PAT-60] [^PAT-82] [^PAT-89] [^ANTI-36] [^ANTI-41]
    *   **For Backend Microflow & Domain Logic Tests (`Category == Backend`):**
        *   **Case 1: When Model Delta is Detected (Option B Blocked ➔ Option A Only):**
            Render the decision card with warning status, audit delta table, and Option B marked blocked:
            ```markdown
            ---

            ## 🚦 CHECKPOINT 1: TEST PLAN REVIEW & EXECUTION STRATEGY

            > [!WARNING]
            > **MTA Server Model Check:** Out of Sync — Persistent MTA Building Blocked (`ANTI-36`)  
            > One or more planned elements do not exist in the active MTA server revision.
            >
            > 💡 **Automate Model Updates on Every Commit:**  
            > If you want MTA to automatically update its model revision whenever you commit, you can subscribe your Test Configuration to your git branch. Expand the setup guide below for step-by-step instructions.

            <details>
            <summary><b>MTA Branch Subscription Setup Guide (Automate Model Sync on Every Git Commit)</b></summary>

            Subscribing to a branch in MTA allows it to automatically poll for new commits on that branch and download new revisions in the background, keeping your test suite synchronized with zero manual effort.  
            Official documentation: [Menditect Branch Subscription Guide](https://documentation.menditect.com/mta/branch-subscription).

            #### How to set it up in the MTA Web UI:
            1. **Navigate to:** `Test configurations` in the MTA Web application.
            2. **Select:** Your target Test Configuration (e.g., `Test`).
            3. **Open:** `App revisions`.
            4. **Click:** The ellipsis menu (`...`) next to the Application and select **Subscribe to branch**.
            5. **Choose Branch:** Select your active branch (e.g., `main` or your current feature branch).
            6. **Polling Frequency:** Set to `High` (recommended during active development sprints) or `Medium`.
            7. **Enable Auto-Adapt:** Check **Adapt automatically: Latest application revision** to make sure test suites automatically adapt to downloaded revisions.
            8. **Save:** Save the configuration. MTA will now automatically track and apply all future git commits.

            </details>

            ### 🔍 Model Discrepancy Summary

            | Inspected Element | Local AST (`mxcli`) | MTA Server Revision | Parity Status | Impact |
            | :--- | :--- | :--- | :--- | :--- |
            | `[Element Qualified Name]` | Verified Present | **Not Found on Server** | **MISMATCH** | Causes immediate step creation failure (`ANTI-36`) on MTA |

            ### 🧭 Execution Strategy Availability

            | Strategy Option | Target Environment | Status | Description |
            | :--- | :--- | :---: | :--- |
            | **Option A: Local Exploratory Test** | Local App (`MTA_plugin`) | **`ACTIVE`** | **1-Click In-Memory Execution.** Runs all scenarios in `< 1s` with `Rollback = Yes`. Zero database pollution, instant feedback. |
            | **Option B: Persistent MTA Test** | MTA Server Platform | **`BLOCKED`** | **Temporarily Disabled.** Blocked until project model is synchronized (via [Branch Subscription](https://documentation.menditect.com/mta/branch-subscription) or manual upload). |

            ### 💬 Decision Required:
            > **Do you approve this Execution Plan for immediate local execution?**
            > - **[Yes, Execute Option A]** ➔ Dispatches local in-memory exploratory test (`< 1s` execution).
            > - **[Adjust Plan]** ➔ Make changes to test steps, assertions, or data variations first.
            > - **[Sync MTA First]** ➔ Set up [Branch Subscription](https://documentation.menditect.com/mta/branch-subscription) or trigger a manual model upload so Option B can be unlocked.

            > [!WARNING]
            > **Local Runtime Unreachable Fallback:**
            > If the local application is not running or the `MTA_plugin` endpoint (`http://localhost:8080/primitivetools/mcp`) is unreachable:
            > 1. Start the local Mendix application from Studio Pro (or run `mendix-cli` / start local server).
            > 2. Alternatively, commit your local changes and sync MTA ([Branch Subscription](https://documentation.menditect.com/mta/branch-subscription) or manual upload) to unblock Option B.
            > 3. You can still review, refine, and store the Execution Plan locally (`EP_<TestCaseName>.md`) in `STATE_BUILD_PLANNING` without requiring an active application runtime.

            ---
            ```
        *   **Case 2: When Model Parity is 100% In-Sync (Dual Options Available):**
            Render the neutral comparative decision matrix:
            ```markdown
            ---

            ## 🚦 CHECKPOINT 1: TEST PLAN REVIEW & EXECUTION STRATEGY

            > [!NOTE]
            > **MTA Server Model Check:** Verified (`PAT-82`)  
            > All planned microflows, entities, and attributes exist in the MTA server.

            ### 🧭 Choose Your Execution Strategy

            | Strategy Option | Target Environment | Speed | Execution Profile |
            | :--- | :--- | :---: | :--- |
            | **Option A: Local Exploratory Test** | Local App (`MTA_plugin`) | `< 1s` | In-memory exploratory execution with automatic database rollback (`Rollback = Yes`). Zero database pollution, instant feedback. |
            | **Option B: Persistent MTA Test** | MTA Server Platform | `~15s` | Persistent test asset creation on MTA server for CI/CD pipelines, team collaboration, and long-term regression suites. |

            ### 💬 Decision Required:
            > **Do you approve this Execution Plan? If so, which execution route would you like to take?**
            > - **Reply "A"** ➔ Run immediate local exploratory execution via `MTA_plugin`.
            > - **Reply "B"** ➔ Proceed to Checkpoint 2 (Placement & Target Configuration) to build persistent test cases in MTA.
            > - **Reply "Adjust"** ➔ Modify test steps, assertions, or data variations first.

            ---
            ```
    *   **For Frontend UI Tests (`Category == Frontend`):**
        Frontend tests ALWAYS route to Option B (Direct Persistent MTA Platform). State definitively:
        > *"Please review the proposed Frontend Execution Plan above. Frontend UI tests require MTA Platform locator mapping, Playwright settings, and 3-case suite lifecycle management. Therefore, they are constructed directly on the MTA Platform (Option B). Once approved, we will proceed to Checkpoint 2 (Confirm Test Suite Placement & Settings)."*
*   **⚡ Execution Strategy Decision Flow & Backend Exploratory / Provisioning Blueprint Law (`PAT-63`)**:
    *   **If Backend and User Selects Option A (Immediate Local Exploratory Execution):**
        *   *Chained Single-Payload Matrix Assembly & Exhaustive Execution (`PAT-66`, `PAT-73`, `PAT-74`, `PAT-75`, `PAT-76`, `ANTI-22`, `ANTI-27`, `ANTI-28`, `ANTI-29`, `ANTI-30`):* When Section 7 defines multiple data variations (`VAR_01`..`VAR_0N`), selecting Option A compiles all variations into **1 single `TCEX_RQ_TestStepRun` array** in **1 single `execute-testcase` tool call** with `"ExecutorUsername": "MxAdmin"` (or active execution user), `"ApplySecurityExecutor": "NONE"`, and `"RollbackTcseAfterExecution": "Yes"` (or `"true"`) with NO trailing `Persist` step, AST conflict vector auditing, intra-block teardown, verified entity attributes (`PAT-75`), mandatory 3-part performance benchmark breakdown (`PAT-76`), and disjoint synthetic keys, executing the entire matrix in sub-second time (< 1s) with zero database pollution. Invoking `execute-testcase` across multiple sequential agent turns is strictly prohibited (`ANTI-27`). If unmanaged external side-effects are detected, trigger the Session Isolation Fallback Protocol (`PAT-74`). For explicit test data seeding (`PAT-68`), `"RollbackTcseAfterExecution": "No"` with a trailing batch `Persist` step is applied.
        *   *Execution Plan Persistence:* Plan is stored locally as a `.md` file or retained in active chat context during exploratory testing. When promoting an exploratory/provisioning test to persistent MTA, the plan is saved to disk at `${MTA_OUTPUT_PATH}/execution-plans/EP_<TestCaseName>.md` (or retained in chat context if write tools are unavailable) prior to construction.
        *   *Promotion Bridge:* Upon successful execution, the user can choose to promote the test to the MTA Platform with one click (Store Plan Locally -> Gate 2 Placement -> `STATE_CONSTRUCTION`). [^PAT-57]
    *   **If User Selects Option B (Direct Persistent MTA Test - Default for Frontend):**
        *   *Behavior:* Proceeds to `PLAN_STEP_2` (Placement & Settings Discovery) and `PLAN_STEP_3` (Gate 2 Approval), stores the execution plan locally as a `.md` file (or retains in chat context if write tools are unavailable), and transitions to `STATE_CONSTRUCTION`. [^PAT-43] [^PAT-44]
    *   **If `MTA_plugin` is not detected (Platform-Only Mode):** Automatically proceeds to `PLAN_STEP_2` (Placement & Settings Discovery) for standard MTA Platform creation.

### 📋 Manual Test Plan (MTP) & Live Test Data Provisioning Mode (`PAT-68`, `PAT-69`, `PAT-70`, `ANTI-24`, `ANTI-25`)
When the user's intent is manual exploratory testing or structured manual verification of a new feature:
*   **Action**: Leverage `MTA_plugin.execute-testcase` as an ultra-fast, deterministic Test Data Management (TDM) engine (`RollbackTcseAfterExecution = "false"`).
*   **Model & Page Analysis**: Run `mxcli` (`DESCRIBE PAGE`, `DESCRIBE SNIPPET`, `DESCRIBE ENTITY`) to map out target form fields, required associations, and role access.
*   **Draft Manual Test Plan (MTP)**:
    1. *Test Objectives & Target Scope:* Define the feature and verification goals.
    2. *Executable Live Data Seeding Recipe:* Construct the complete `TCEX_RQ` payload (`RollbackTcseAfterExecution = "false"`) to instantiate root entities, link parent-child associations (`TCEX_RQ_Sfar`), mutate states (`TCEX_RQ_Sfcr`), or run setup microflows.
    3. *5-Pillar Tracking & Teardown Protocol:* Apply root cascade deletes, test user isolation (`System.owner`), timestamp deltas (`createdDate >= T_start`), recommended prefix conventions (`TEST-%`), and interactive cleanup inspection (`PAT-69`).
    4. *Manual Verification Checklist:* Provide clear, step-by-step navigation, login credentials, and UI verification checkpoints.
*   **Data Script to MTA Conversion Protocol (`PAT-70`, `PAT-43`, `ANTI-14`):** When converting a live data script (`TCEX_RQ`) or manual test scenario into a persistent MTA Platform asset, the agent strictly enforces the **Universal Execution Plan Mandate**:
    1. *No Direct Construction Bypasses (`ANTI-14`):* The agent **MUST** generate an official `# MTA EXECUTION PLAN SIGN-OFF` (Gate 1) and resolve target placement (Gate 2) before calling any persistent construction tools.
    2. *The 3 Structured Execution Plan Profiles:*
       * **Option 1: Standalone Data Seeding Test Case (Backend Execution Plan):** Generates a 1-case plan with entity instantiations, attribute/association mappings, and trailing `Persist`. **No teardown steps** are included so records remain in the database for manual QA, demos, or downstream tests. Section 6 Playwright is marked NA.
       * **Option 2: Automated Frontend Test Suite (Frontend Execution Plan):** Prompts for target page (`Module.Page`), runs single-pass AST discovery (`PAT-72`), presents the 10-setting Playwright table (Section 6), and generates a 3-case plan (`Case 1: Setup Data Seed` with `_Always`/`_Continue`, `Case 2: Frontend UI Test` using verified `MenditectMxFrontendTestKit` microflows, `Case 3: Teardown Cleanup` with cascading delete and `_Always`/`_Continue`).
       * **Option 3: Automated Backend Integration Suite (Backend Execution Plan):** Prompts for target backend logic, runs `DESCRIBE MICROFLOW` (`PAT-71`), and generates a 3-case plan (`Case 1: Setup Data Seed` with `_Always`/`_Continue`, `Case 2: Microflow Calls & Assertions`, `Case 3: Teardown Cleanup` with cascading delete and `_Always`/`_Continue`; Section 6 Playwright is marked NA).
    3. *Handoff:* Present the fully compliant `# MTA EXECUTION PLAN SIGN-OFF` with the 14-point Pre-Approval Quality Checklist for Gate 1 approval, proceed to `PLAN_STEP_2` for Gate 2 placement approval, store the execution plan locally as a `.md` file (or retain in chat context if write tools are unavailable), and hand off to `STATE_CONSTRUCTION`.

### 2. `PLAN_STEP_2: Placement & Settings Discovery (Part 2 - User Input Phase)`
*   **Action**: Interactively scan and resolve placement parameters and execution settings based on user input.
*   **Promotion Routing Rules**:
    *   **From In-Memory Exploratory Test (`PAT-57` — Logic Test with `Rollback = Yes`):** Promote directly 1:1 to a persistent Backend Test Case with Data Variations. **Do NOT prompt for structure type.** Proceed immediately to the Iterative Placement Protocol below.
    *   **From Test Data Provisioning / Seeding Plan (`PAT-70` — Live Data with `Rollback = No`):** Prompt the user to choose their preferred persistent structure before proceeding:
        1. **Type 1: Standalone Data Seeding Test Case (1-Case Generator)** — Creates and permanently commits records with `Rollback = No` (no teardown steps).
        2. **Type 2: 3-Case Backend Integration Pattern** — Case 1 (Setup Seed Data) -> Case 2 (Backend Logic) -> Case 3 (Teardown Cleanup).
        3. **Type 3: 3-Case Frontend UI Pattern** — Case 1 (Setup Seed Data) -> Case 2 (Playwright UI Test) -> Case 3 (Teardown Cleanup).
*   **Mandatory Placement Prompt & Interactive Scanning Offer:** Immediately after receiving Execution Plan approval (Gate 1) or structure choice, initiate placement discovery:
    *   *Fast-Path Placement Validation (Single-Turn):* If the user has already specified or implied the Target Test Configuration, Test Suite, and/or Test Case Name (in their prompt or earlier in the conversation), execute the Fast-Path: sequentially query `GetApplicationDetails`, `GetTestConfigurationDetails`, and `GetTestSuiteDetails` within a single turn to validate existence, resolve keys, and immediately present the **Placement & Target Summary Box** (`PLAN_STEP_3`) for Gate 2 approval.
    *   *Interactive Discovery (When Placement is Unknown or Ambiguous):* In your prompt, state:
        > *"Where would you like to place this test case? You can specify the target Test Configuration and Test Suite directly, or I can interactively scan your app right now to retrieve and display all available Test Configurations and Test Suites for you."*
*   **Mandatory AI Configuration Creation Notice**: You MUST inform the user if a new configuration is needed:
    > ⚠️ **Important Notice:** The AI Assistant cannot create new Test Configurations. If a new Test Configuration is needed, you must manually create it inside the MTA web application first.
*   **Read-Only MTA `Get*` Discovery Authorization:** Executing read-only MTA `Get*` tools (`GetApplicationDetails`, `GetTestConfigurationDetails`, `GetTestSuiteDetails`, `GetTestCaseDetails`, `GetExecutionUsers`, etc.) is **ALWAYS authorized in ANY state** (including Turn 1) to retrieve data and present choices to the user.
*   **Universal Placement Resolution Protocol**:
    *   **Fast-Path Option (Known Placement):** When target Configuration, Suite, and/or Case name are known or provided upfront, validate them directly in one turn using read-only `Get*` calls and skip directly to `PLAN_STEP_3`.
    *   **Single-Turn Consolidated Placement Scan (When Placement is Unknown):**
        To minimize conversational friction, resolve placement in **1 single turn** rather than halting for multi-turn interrogation:
        1. Query `GetApplicationDetails(ApplicationName=...)` to discover available Test Configurations.
        2. In the same turn, query `GetTestConfigurationDetails(TestConfigurationKey=...)` for the active/default configuration to retrieve existing Test Suites, and query `GetExecutionUsers` to discover execution users.
        3. Present a single consolidated **Interactive Placement Card** proposing:
           - Selected Test Configuration (with available alternatives listed).
           - Selected Test Suite (with existing suites and option for a new suite).
           - Proposed Test Case Name (formatted descriptively per MTF convention).
           - Proposed Execution User (`MxAdmin` or discovered user).
        4. Halt for the user to confirm or adjust in 1 turn before moving to `PLAN_STEP_3`.
*   **Existing Test Suite Conflict Check (3 Options)**:
    If placing a Frontend test into an existing Test Suite that already contains Frontend tests, ask the user to choose between 3 options: Option 1 (Inherit Suite Settings), Option 2 (Override Suite Settings), Option 3 (Dedicated New 3-Test-Case Pattern).
*   **New Test Suite Check (10-Setting Explicit Table)**:
    If placing into a new Test Suite (or a suite with 0 frontend tests), present the explicit table displaying **ALL 10 Playwright Browser Settings**, showing both Default/Selected Value and ALL Alternative Options.
*   **Vague Onboarding Guardrail**: If the user request is vague (e.g. "I want to test", "How to start"), immediately stop and present the onboarding guide from [prompts-templates.md](references/prompts-templates.md).

### 3. `PLAN_STEP_3: Placement Summary Presentation & Execution Plan Sign-Off (Part 3 - Checkpoint 2 Approval)`
*   **Action**: Compile and display the dedicated **Placement & Target Summary Box** summarizing all resolved placement parameters and settings:

```markdown
## 🚦 CHECKPOINT 2: CONFIRM TEST SUITE PLACEMENT & SETTINGS

> 📍 **PLACEMENT & TARGET SUMMARY**
> * **Application Name:** `[AppName]`
> * **Target Test Configuration:** `[UserSelectedTestConfig]`
> * **Target Test Suite:** `[UserSelectedTestSuite]`
> * **Test Case Name:** `[UserSelectedTestCaseName]`
> * **Execution User:** `[UserSelectedExecutionUser, e.g. MxAdmin]`
> * **MTA Category:** `[Backend | Frontend]`
> * **Browser Settings (Frontend):** `[Environment / Mode / Browser Type / Viewport]`
>
> ❓ *Please confirm if this target placement and settings summary is correct so I can save the execution plan and proceed to test construction.*
```

*   **⚡ Mandatory Local Plan Storage, Revision Sealing & Sign-Off Protocol (`PAT-43`, `PAT-44`, `PAT-47`):**
    Upon receiving explicit user approval for the Placement & Target Summary (Checkpoint 2), you **MUST** store the approved Execution Plan locally as a `.md` file at `${MTA_OUTPUT_PATH}/execution-plans/EP_<TestCaseName>.md` (defaulting to `${workspaceFolder}/menditect-output/execution-plans/EP_<TestCaseName>.md`).
    
    > **Target File & Versioning In-Place (Git History Delegation):**
    > Before saving, inspect if `${MTA_OUTPUT_PATH}/execution-plans/EP_<TestCaseName>.md` already exists on disk:
    > - **Case A: Fresh Plan (No existing file):**
    >   - Set `revision: 1`
    >   - Set `plan_id: "<TestCaseName>-v1"`
    >   - Set `supersedes_plan_id: null`
    > - **Case B: Zero-Change Re-Run (Existing file unchanged):**
    >   - If re-running an already approved and unchanged plan: **Do NOT duplicate or overwrite unnecessarily**. Output:
    >     > `ℹ️ Notice: The approved execution plan matches the active plan on disk (Revision: <revision>). Re-using existing Plan ID without changes.`
    >   - Retain existing plan and proceed to `STATE_CONSTRUCTION`.
    > - **Case C: Modified Plan / Revision (Updated plan specifications):**
    >   - Read the existing file's metadata header to extract its `revision` (defaulting to 1 if missing).
    >   - Set `revision: <old_revision + 1>`
    >   - Set `plan_id: "<TestCaseName>-v<new_revision>"`
    >   - Set `supersedes_plan_id: "<TestCaseName>-v<old_revision>"`
    >   - **Overwrite in place:** Overwrite `${MTA_OUTPUT_PATH}/execution-plans/EP_<TestCaseName>.md` in place. Do NOT attempt to create archive subfolders or move files. Version history and historical diffs are delegated to Git.

    > **Collapsible Execution Plan Metadata Header (YAML Block - Option A):**
    > Prepend a collapsible YAML block enclosed within an outer `<details>` tag with CommonMark blank line padding to the top of the Markdown plan file:
    > ```markdown
    > <details><summary><b>Execution Plan Metadata</b></summary>
    >
    > ```yaml
    > plan_id: "<TestCaseName>-v<revision>"
    > schema_version: "1.2.0"
    > supersedes_plan_id: "<TestCaseName>-v<old_revision> | null"
    > revision: 1
    > status: "APPROVED"
    > approved_at: "<ISO 8601 Timestamp, e.g. 2026-09-08T16:11:41+02:00>"
    > approved_by: "<UserEmailOrName>"
    > approver_system_user: "<OSUsername>"
    > built_at: null
    > builder_system_user: null
    > verified_at: null
    > verifier_system_user: null
    > test_case_name: "<TestCaseName>"
    > target_configuration: "<TargetConfig>"
    > target_configuration_key: null
    > target_suite: "<TargetSuite>"
    > target_suite_key: null
    > test_case_keys: []
    > category: "<Backend | Frontend>"
    > ```
    >
    > </details>
    > ```
    > *Approver Identity Resolution (3-Tier Strategy):*
    > - **Tier 1 (Preferred):** Git User Identity (`git config user.email` or `git config user.name`).
    > - **Tier 2 (Fallback):** System / Environment Username (`$env:USERNAME` on Windows or `$env:USER` on Unix).
    > - **Tier 3 (Explicit):** Explicit User Override if specified during prompt / sign-off.

    > **Mandatory User Notification & Sealed Receipt Display:**
    > Immediately upon saving the Execution Plan to disk, you **MUST** explicitly notify the user that the plan has been stored and display its absolute and relative file location as a clickable markdown file link along with the sealed receipt:
    > - *Fresh Creation (Revision 1):*
    >   ```markdown
    >   📄 **Execution Plan Stored & Sealed:**
    >   • **Plan ID:** `<TestCaseName>-v1` (Revision 1)
    >   • **File Location:** [`EP_<TestCaseName>.md`](file:///absolute/path/to/menditect-output/execution-plans/EP_<TestCaseName>.md)
    >   • **Relative Path:** `menditect-output/execution-plans/EP_<TestCaseName>.md`
    >   • **Approved At:** `<ISO 8601 Timestamp>`
    >   • **Approved By:** `<approved_by>` (`<approver_system_user>`)
    >   • **Status:** Approved (Gate 1 & Gate 2) & Sealed to Workspace
    >   ```
    > - *Revision / Superseding Prior Plan:*
    >   ```markdown
    >   📄 **Execution Plan Stored & Sealed:**
    >   • **Plan ID:** `<TestCaseName>-v<N>` (Revision <N>)
    >   • **Supersedes:** `<TestCaseName>-v<old_revision>` (Version history tracked in Git)
    >   • **Active Plan:** [`EP_<TestCaseName>.md`](file:///absolute/path/to/menditect-output/execution-plans/EP_<TestCaseName>.md)
    >   • **Approved At:** `<ISO 8601 Timestamp>`
    >   • **Approved By:** `<approved_by>` (`<approver_system_user>`)
    >   • **Status:** Approved (Gate 1 & Gate 2) & Sealed to Workspace
    >   ```

    > **Chat-Only Environment & Memory Protocol:**
    > If operating in an environment without file-writing tools (Chat Mode):
    > - Output the complete Execution Plan directly in chat.
    > - Generate semantic `plan_id: "<TestCaseName>-v<revision>"` and ISO 8601 `approved_at`.
    > - The **JSON State Compaction Block** is your SINGLE SOURCE OF TRUTH and sole persistent memory across sessions. You **MUST** output it inside a collapsible block at the end of the sign-off response:
    >   ```markdown
    >   <details><summary><b>💾 MTA Session Compaction Block (Chat-Only Restore)</b></summary>
    >
    >   ```json
    >   {
    >     "MtaState": "STATE_CONSTRUCTION",
    >     "TempState": "SKELETON_PROVISIONING",
    >     "TargetConfig": "<TargetConfigKey>",
    >     "TargetSuite": "<TargetSuiteKey>",
    >     "TestCase": "<TestCaseName>",
    >     "Category": "<Backend | Frontend>",
    >     "ExecutionPlanFile": "chat-context",
    >     "ExecutionPlanId": "<TestCaseName>-v<revision>",
    >     "ExecutionPlanStatus": "APPROVED",
    >     "ExecutionPlanApprovedAt": "<ISO 8601 Timestamp>",
    >     "ExecutionPlanApprovedBy": "<approved_by>",
    >     "ExecutionPlanRevision": <revision>,
    >     "ExecutionPlanSupersedesId": "<supersedes_id | null>",
    >     "Context": "<Short summary of approved test case>"
    >   }
    >   ```
    >   </details>
    >   ```
    > - Inform the user: *"Since local file storage is unavailable, please copy the State Compaction Block above to restore this session in future turns if needed. Proceeding to STATE_CONSTRUCTION..."*

    In write-enabled environments, write the target file path, plan ID, status ("APPROVED"), approved timestamp, approved by, revision number, and supersedes ID to `execution_plan_file`, `execution_plan_id`, `execution_plan_status`, `execution_plan_approved_at`, `execution_plan_approved_by`, `execution_plan_revision`, and `execution_plan_supersedes_id` in `mta_state.json` (along with `test_configuration` `key`/`name`, `test_suite` `key`/`name`, and register planned `test_cases`). Keep `execution_plan_key: null` for backward compatibility. Successfully storing the plan and notifying the user with the clickable file location and sealed receipt (or issuing the chat-context compaction block) completes `STATE_BUILD_PLANNING` and authorizes transition to `STATE_CONSTRUCTION`. Note that upon entering `STATE_CONSTRUCTION`, because Check 14 in `STATE_BUILD_PLANNING` already verified model parity (`PAT-82`, `ANTI-36`), Step 1 skips `GetAppModelData` by default and proceeds directly to Phase 1 (skeleton provisioning). Re-verification via `GetAppModelData` is only triggered if entering via a cold session restore (`mta_state.json`), promoting after an out-of-sync state, or reconciling plan drift. [^PAT-43] [^PAT-44] [^PAT-47] [^PAT-82] [^ANTI-36]
*   **⚡ MTA Model Revision Synchronization & Decoupled Plan Storage Law**:
    1. *Plan Storage Decoupling:* Drafting and storing an Execution Plan locally as a `.md` file is **always permitted and encouraged**, even when the local Mendix model contains uncommitted elements not yet present in the active MTA Model Revision. The plan is stored as a specification document on disk and does not bind to live metamodel elements until construction. [^PAT-36]
    2. *Internal-Only Logic vs. Structural Delta Classification:*
       - If only internal microflow activities/loops/expressions were modified locally (with no signature, parameter, or return type changes), no MTA Model Revision update is needed; proceed immediately to `STATE_CONSTRUCTION`. [^PAT-36]
       - If structural changes exist (new/modified/deleted entities, attributes, microflows, microflow parameters, or page widgets), persistent step building in `STATE_CONSTRUCTION` will fail until the MTA Model Revision is upgraded. [^PAT-36] [^ANTI-17]
    3. *Proactive Upgrade Guidance:* If structural model deltas are known during `STATE_BUILD_PLANNING`, after saving the Execution Plan locally, proactively inform the user and propose upgrading the MTA Model Revision before starting test construction (or offer local in-memory exploratory testing via `MTA_plugin.execute-testcase` if local changes cannot yet be committed). [^PAT-36] [^PAT-56] [^PAT-82] [^ANTI-36]
*   **🛑 Backend Unit Test Execution Settings Law**: For ALL Backend Unit Tests, ALL test steps (including Create Object and setup steps) **MUST** be configured with `ExecutionCondition = "None"` and `ResumeExecutionAfterException = "_Stop"`. You are strictly prohibited from applying `"Always"` or `"_Continue"` to setup steps in Backend Unit Tests. [^PAT-17] [^ANTI-07]
*   **🛑 Direct Attribute & Association Initialization on Create Object Law**: Whenever an object is instantiated via a `Create Object` test step (`CreateObjectActionTestStep` with `ObjectAction="CreateObject"`), ALL initial attribute values and association bindings MUST be set directly on the `Create Object` test step itself. Creating a separate `Change Object` test step immediately following a `Create Object` step to set initial attributes or associations is strictly **PROHIBITED**. [^PAT-06] [^ANTI-01]
*   **🛑 Retrieve / Microflow Output Object Count Assertion Law**: Whenever an object or list retrieved via a `Retrieve Object` step or returned by a `Microflow Call` step is passed as input to a subsequent test step (e.g. Microflow parameter, Change Object, Delete Object, Persist Object, etc.), an `Assert Object Count` assertion MUST be embedded directly within Field 6 (`Embedded Step Assertions`) of the producer step before downstream consumption. Declaring `Assert Object Count` as a separate standalone test step container is strictly **PROHIBITED**. Default expected object count is `1` (for single object parameters), unless the receiving parameter/step accepts a List (where default matches expected list count N >= 0). Asserting object count immediately provides fast-fail diagnostic clarity and prevents silent null-pointer exceptions or confusing downstream test failures. *(Note: This law applies EXCLUSIVELY to `Retrieve Object` and `Microflow Call` steps. It does **NOT** apply to `Create Object` test steps, as in-memory objects instantiated via `Create Object` are guaranteed to exist and do NOT need object count assertions).* [^PAT-08] [^ANTI-03] [^ANTI-06]
*   **🛑 Dual Retrieve/Filter Empty Object Law (Data Variations)**: In MTA Data Variations, step structures and association setters are fixed across all variations. You **CANNOT** set or unset an association directly inside a Data Variation item. To dynamically vary between a valid object and an `empty` (NULL) object across variations: [^PAT-07]
    1. **For Microflow Parameters:** Create a Retrieve/Filter step filtering on a target attribute (e.g., `LicensePlate`). For valid object variations, set filter = `'TEST_VAL'`. For null object variations, set filter = `'NON_EXISTENT'`. Pass the Retrieve step output to the microflow parameter.
    2. **For Associations:** Create a Retrieve/Filter step for the associated parent entity filtering on an attribute (e.g., `Code`). For associated variations, set filter = `'TEST_CODE'`. For unassociated variations, set filter = `'NON_EXISTENT'`. Pass the Retrieve step output to the association setter step.
*   **Right-Level Allocation (The "Ice Cream Cone" Check)**: Defend against the "Ice Cream Cone" Anti-Pattern. Push logic testing down the pyramid to Unit or Integration levels where possible. [^PAT-01] [^ANTI-02]
*   **🚫 Strict Data Variation Consolidation**: Seek to use MTA **Data Variations** rather than separate, duplicate test cases that only modify input data. Design a single, reusable test case structure and enable Data Variations to define a variation matrix. [^PAT-19] [^ANTI-08]
*   **🔄 Execution Plan Iteration & Modification Protocol (`PAT-89`, `ANTI-41`)**:
    Whenever the user requests a modification, addition, or refinement to an existing or draft Execution Plan (whether at step, parameter, or variation matrix level):
    1. **Scenario 1 (Chat Delta Modification):** If the user requests changes in chat, update the local `.md` file on disk directly (incrementing revision if previously approved), re-audit patterns silently, and render an updated Executive Summary in chat with a concise diff summary and the Checkpoint 1 Decision Card (`PAT-89`).
    2. **Scenario 2 (Manual IDE File Edit Ingestion):** If the user modifies the `.md` file directly in their editor/IDE, re-read the file via `view_file`, validate changes against domain AST and MTA Skill Laws, update `mta_state.json`, and render an updated Executive Summary in chat.
    3. 🔍 **Pattern Re-Audit:** Cross-reference the updated step sequence against the [MTA Scoping & Design Pattern Registry](#-mta-test-scoping--design-pattern-registry) and the 14-point audit in [pre-approval-audit.md](references/pre-approval-audit.md).
    4. 📝 **Re-Run Pre-Approval Self-Audit:** Re-embed the updated Pre-Approval Quality Audit status banner and checklist table in the `.md` file reflecting any step sequence adjustments.
    5. 🚫 **Chat Flooding Prohibition (`ANTI-41`):** You are strictly prohibited from dumping hundreds of lines of raw execution plan tables or localized text snippets into chat. Keep the complete specification on disk and output ONLY the Executive Summary in chat.
    6. 🤖 **Automatic Pattern Registration:** If during conversation or planning a new pattern or rule is identified, register it in `mta-patterns-and-antipatterns-reference.md`, run `sync-mta-skills.bat`, and add footnote cross-references (`[^PAT-xx]` / `[^ANTI-xx]`).

---

## 📋 Standardized AI-Generated Execution Plan Blueprint

You **MUST** format the final approved Execution Plan strictly in accordance with the standardized blueprint defined in [execution-plan-template.md](references/execution-plan-template.md).

The Execution Plan layout consists of the Metadata Header followed by the Single Unified Audit Note, top navigation links table (post-build), the collapsible checklist, and 8 numbered sections (with Section 9 added post-build):
- **Execution Plan Metadata Header:** Outer collapsible `<details><summary><b>Execution Plan Metadata</b></summary>` containing the YAML block (`plan_id`, `schema_version: "1.2.0"`, `revision`, `status`, `approved_at`, `approved_by`, `approver_system_user`, etc.).
- **Single Unified Status Note:** Single continuous top-level status note (`> [!NOTE]`) with:
  - `Pre-Approval Quality Audit: 14/14 checks executed (100% compliant)`
  - `MTA Server Model Check: Verified (All planned microflows, entities, and attributes exist in the MTA server)`
  - `Category: [Backend | Frontend]`
  - *(And upon smoke verification, appended post-construction verification status and builder/verifier timestamps without empty lines)*
- **Direct MTA Web Navigation Links Table (Post-Build):** Placed immediately beneath the top note upon successful smoke verification, displaying 1-click links to the Test Configuration, Test Suite, and all created Test Cases.
- **Pre-Approval Quality Checklist:** Collapsible checklist (`<details><summary><b>Pre-Approval Quality Checklist (14 of 14 Checks Executed)</b></summary>`) verifying all 14 quality checks defined in [pre-approval-audit.md](references/pre-approval-audit.md).
1. **State Compaction & Target Placement:** Collapsible container (`<details><summary><b>1. State Compaction & Target Placement</b></summary>`) with session restoration block, target application, execution strategy, suite, case name, and execution user.
2. **Prompt & Input Log vs. MTA Skill Conflicts (MANDATORY):** Collapsible container (`<details><summary><b>2. Prompt & Input Log vs. MTA Skill Conflicts (MANDATORY)</b></summary>`) with explicit table auditing user prompt/JSON log against MTA Skill Laws with applied automatic corrections.
3. **Test Case Scope & Dual-Risk Profile:** Collapsible container (`<details><summary><b>3. Test Case Scope & Dual-Risk Profile</b></summary>`) with functional specification profile and Technical vs Business risk mitigation table.
4. **Verified Model Elements & Testability Profile:** Collapsible container (`<details><summary><b>4. Verified Model Elements & Testability Profile</b></summary>`) with model elements inspected via `mxcli` AST or `GetAppModelData`.
5. **Chronological Step Sequence Plan:** Collapsible container (`<details><summary><b>5. Chronological Step Sequence Plan</b></summary>`) with rollback setting, clean step sequence matrix (zero raw HTML in cells), and nested outer collapsible step drilldown blocks (`<details><summary><b>Step N: ...</b></summary>`).
6. **Playwright / Browser Settings:** Collapsible container (`<details><summary><b>6. Playwright / Browser Settings</b></summary>`) for browser settings (Frontend) or memory notice (Backend).
7. **Data Variation Matrix & Metadata:** Collapsible container (`<details><summary><b>7. Data Variation Matrix & Metadata</b></summary>`) with variation matrix capped at 8 columns per table, followed by nested outer collapsible scenario descriptions (`EditAction="SetDescription"` SSOT).
8. **Applied Testing Patterns & Rationale:** Collapsible container (`<details><summary><b>8. Applied Testing Patterns & Rationale</b></summary>`) with table documenting applied patterns, step targets, and rule citations (`[^PAT-xx]`, `[^ANTI-xx]`).
9. **MTA Build & Smoke Verification Receipt (Post-Build):** Appended at the bottom as `<details><summary><b>9. MTA Build & Smoke Verification Receipt</b></summary>` containing non-collapsible `### Smoke Audit Results & Verification Details (0 Discrepancies)` (always open) with the 7-row verification table.

For the complete verbatim Markdown template with sample values and code fences, consult [execution-plan-template.md](references/execution-plan-template.md).

---

### 📋 Standard Self-Audit Validation Report Protocol
The Pre-Approval Self-Audit evaluates all 14 checks detailed in [pre-approval-audit.md](references/pre-approval-audit.md) using the 3-Tier Alert System:
- **100% Compliance / Pass (14/14 Checks Pass):** Render `> [!NOTE]` status banner.
- **Adjusted / Minor Corrections Applied:** Render `> [!IMPORTANT]` status banner with Section 2 conflict references.
- **Critical Violations Detected / Blocker:** Render `> [!CAUTION]` status banner.

---

## 📅 STRICT REACTIVE LOADING STRATEGY

To maximize token efficiency, **DO NOT load reference files preemptively**. Load them **strictly on-demand** based on the state or request:

| State / Focus Area | Load ONLY this file: |
| --- | --- |
| *Execution Plan canonical layout, code fences & 8-section sign-off template* | **`references/execution-plan-template.md`** |
| *14-point Pre-Approval Quality Checklist details & verification criteria* | **`references/pre-approval-audit.md`** |
| *Identifying technical or business risks, evaluating microflow typologies* | **`references/risk-matrix.md`** |
| *Constructing and formatting build prompts for Backend or Frontend* | **`references/prompts-templates.md`** |
| *Auditing Execution Plans, verifying all 128 testing patterns/anti-patterns (`PAT-01..88`, `ANTI-01..40`), or auto-registering new learned patterns* | **`references/mta-patterns-and-antipatterns-reference.md`** |
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

All testing patterns, laws, and anti-patterns enforced during test design (`PAT-01` through `PAT-88`, and `ANTI-01` through `ANTI-40`) are centrally defined and maintained in the canonical pattern catalog:
➔ **[references/mta-patterns-and-antipatterns-reference.md](references/mta-patterns-and-antipatterns-reference.md)**

Consult that reference for complete rule descriptions, risk rationales, and pattern citations when drafting Execution Plans and auditing Section 2 prompt conflicts.

