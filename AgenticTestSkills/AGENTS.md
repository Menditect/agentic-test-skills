# Menditect Test Automation (MTA) & Zero-Halt Guardrails

🚨 **CRITICAL MTA GUARDRAIL: READ-ONLY CONTEXT DISCOVERY & MUTATING TOOL GATING** 🚨

* **Read-Only MTA `Get*` Tools Always Authorized:** All read-only `Get*` MTA MCP tools (such as `GetApplicationByName`, `GetTestConfigurationsForApplicationKey`, `GetTestSuites`, `GetTestCases`, `GetPages`, `GetWidgets`, `GetExecutionUsers`, etc.) are **ALWAYS authorized in ANY state**, including on the very first turn of a request. You are encouraged to call read-only MTA `Get*` tools to inspect model data, gather context, discover available configurations/suites, and present informed choices to the user. To build clickable MTA Web navigation links and resolve the MCP server endpoint (`[MtaUrl]/tools/mcp`), evaluate in order: (1) project-level `AGENTS.md` (`MTA Url`), (2) `mta_config.json` (`mta_base_url`), (3) `.vscode/settings.json` (`MTA_BASE_URL`), (4) `mta_state.json` (`mta_base_url`), or (5) prompt the user on turn 1.
  *(Note: This exemption applies exclusively to read-only MTA MCP tools).*
* **Frontend Execution Plan Mandatory Quality Protocol (8 Requirements):** When building a Frontend execution plan, you **MUST** enforce these 8 requirements: (1) Ask user first whether MTA is up to date before calling `GetPages`/`GetWidgets` (fallback to `mxcli` recursive discovery via `DESCRIBE PAGE <Module.Page>`, `DESCRIBE SNIPPET <Module.Snippet>`, and `DESCRIBE ENTITY <Module.Entity>` to build an exhaustive Input Widget Inventory under Section 4 [`PAT-67`, `ANTI-23`]); (2) Analyze required seed data based on target pages/widgets; (3) Propose an explicit choice between creating vs retrieving seed data; (4) Plan multiple seed objects (2+ records) for entities displayed in lists or selection widgets; (5) Check if login is required (if reachable anonymously, no login needed; resolve role-based homepage via `mxcli` `SHOW NAVIGATION` or fallback to viewport navigation profile default homepage); (6) Use dynamic scalar value piping (`SelectValueForValue`) for selecting items from dropdowns/lists; (7) For date-time widgets, prefer `CurrentDateTime` + offset and inspect `dateformPattern` in the model; verify String attribute length constraints in the domain model via `mxcli` (`SHOW ENTITY`); (8) Propose Frontend Testkit list filter strategies (`ELO_Filter_*_by_Text`, `ELO_Nth_*_Item`, scalar piping). Output the fully detailed Execution Plan prior to any deep model inspection.
* **Mutating & Execution MTA Tools Gating:** You are strictly prohibited from executing **write, mutating, or execution MTA tools** (such as `CreateTestSuite`, `CreateTestCase`, `CreateTestStep*`, `Set*`, `SaveExecutionPlan`, `ExecuteTestSuite`, `ExecuteTestCase`) on the first turn or during discovery until both approval gates are satisfied:
  1. **Gate 1 Approval:** The **Execution Plan** draft (scoping, steps, data variations) is explicitly approved by the user.
  2. **Gate 2 Approval:** The **Placement & Target Summary** (Test Configuration, Test Suite, Test Case Name, Execution User, Playwright Settings) is explicitly presented and approved by the user.

### ⚠️ Strict Definitions & Guardrail Bypasses:
* **The "First Turn" Rule:** The "first turn" refers to the very first response generated at the start of a brand-new Conversation ID (session), or when starting a completely new test category from scratch, where test parameters have not yet been established.
* **Active Session & Resumption Safeguard:** Once the test parameters (Test Configuration, Test Suite, and Test Case) are established in the active session's history or state tracker (such as when returning from `STATE_QA_ASSISTANCE` back to `STATE_CONSTRUCTION`), you are explicitly authorized to continue the existing build plan and call MTA tools without repeating discovery questions or halting for permission.
* **Test Case Name Strictness:** A generic phrase like *"build a test for page X"*, *"test the login flow"*, or *"add login test"* does **NOT** count as specifying a Test Case name. A Test Case name must be explicitly and clearly named (e.g., `"TC_ValidateLogin"`) or have an explicit placement. If the Test Case name or placement is missing or ambiguous, you MUST resolve placement interactively using read-only MTA `Get*` discovery tools.
* **Mandatory Session State Isolation (Agentic Mode):** At the start of a new chat session (or when starting discovery for a new test request), you **MUST** check `conversation_id` in `mta_state.json`. If `conversation_id` does not match the active session's Conversation ID (or is null/from an earlier session), you **MUST** re-initialize `test_configuration`, `test_suite`, and `test_cases` in `mta_state.json` to `null` defaults (`test_configuration: null`, `test_suite: null`, `test_cases: []`) and set `conversation_id` to the active session ID. You are **strictly prohibited** from reading or reusing `test_configuration`, `test_suite`, or `test_cases` values from `mta_state.json` if `conversation_id` does not match the active session. All placement discovery MUST happen interactively within the active conversation.
* **Granular Test Case Placement Persistence:** As placement is resolved (Gate 2) and assets are created on the MTA server (`SaveExecutionPlan`, `CreateTestSuite`, `CreateTestCase`), you **MUST** immediately write the returned numeric MTA database keys (`test_configuration.key`, `test_suite.key`, `execution_plan_key`, and per-item `test_cases[].key`, `test_suite_key`, `test_configuration_key`, `execution_plan_key`) into `mta_state.json`. This enables the Execution Plan Controller and Smoke Audit runners to map created database entities directly to Execution Plan test cases.

---

### 🧠 Mandatory Tool Execution Chain of Thought (MTA MCP Tools)
Whenever you call ANY MTA MCP tool, you **MUST** output a concise, user-facing explanation of your chain of thought in standard markdown *immediately before* the tool call block using this exact format (do not skip this under any circumstance):
> 🧠 **Tool Execution Reasoning:**
> *   **Tool Call:** `[ToolName]`
> *   **Active State:** `[STATE_NAME]`
> *   **Reasoning:** [Why this specific tool is called and how its expected outcome will advance the active state.]

---

## 🚫 CRITICAL RULE: Branch Management and Skill Modification Guardrail
*   **Active Branch Verification:** Before creating, editing, or deleting any skill files (located in `.agent/skills/`), you **MUST** verify the active git branch.
*   **Prohibit Direct Mainline Changes:** You are strictly prohibited from making any modifications to skill files directly in the `main` branch. 
*   **Warn the User:** If you detect that the active branch is `main` (or any mainline branch) and you are asked to edit skill files, you **MUST** immediately stop, warn the user, and prompt them to switch to the `development` branch before proceeding with any edits.

---

## 🚫 CRITICAL RULE: SKILL.md Frontmatter Formatting Constraints
*   **Single-Line Quoted Descriptions:** You MUST format the `description` key in all `SKILL.md` files as a single-line string enclosed in double quotes `""`.
*   **No Multi-line Block Scalars:** You are strictly prohibited from using multiline YAML block scalars (such as `description: >` or `description: |`) inside the frontmatter.
*   **Strict YAML Escaping & Alphanumeric Only:** Ensure description values inside `SKILL.md` files are clean, alphanumeric strings completely free of any markdown formatting (such as asterisks `**`, backticks, or unescaped characters) to prevent syntax parsing/loading errors in MAIA.
*   **Flat 2-Tier Structure:** All skill folders MUST maintain a strict flat 2-tier structure: the `SKILL.md` file MUST reside at the root of the skill folder, and any reference files MUST be placed directly inside a single `references/` subdirectory without any nested subfolders.


---

## 🚫 CRITICAL RULE: DEFAULT NON-PUBLISHING WORKFLOW (STAGING MODE BY DEFAULT)
*   **Default Non-Publishing Staging Mode:** By default, whenever you are asked to create, edit, or modify any skill or reference file inside `.agent/skills/`, you **MUST NOT** automatically bump version numbers, update changes YAML frontmatter, run repackaging/compilation scripts (`pack-skills-mpk.py`), merge branches to `main`, or tag/push git releases.
*   **Staging Exclusively on development:** All incremental changes must happen exclusively on the `development` branch. You must modify the files, commit them to `development`, and stop.
*   **Explicit Action for Bumps and Releases:** You are ONLY permitted to bump version numbers, update YAML frontmatter changes, compile `.mpk` module files, merge to `main`, and create release tags when the user explicitly and unambiguously instructs you to **"publish"**, **"release"**, or **"bump versions"**. **Specifically, when the user instructs you to "publish", this explicitly includes pushing the generated git commits and tags to the remote origin on GitHub.**

---

## 🚫 CRITICAL SAFETY RULE: PRESERVATION OF USER'S THEME DIRECTORY (PREVENT CE0535 PAGE ERRORS)
*   **Prohibit Overwriting/Deleting Standard Theme Files:** When packaging, copying, building, or importing `.mpk` module files (like `Menditect_AgenticTestSkills`), or performing any file/database modifications, you are **strictly prohibited** from deleting, renaming, or overwriting standard files within the project's `theme/` or `themesource/` directories (e.g., `main.scss`, `exclusion-variables.scss`, SSO templates, settings, etc.).
*   **Enforce Safety Checks and Restorations:** If a module import or build script changes files in the `theme/` directory, you **MUST** immediately run a git status check, restore any unintentionally modified/deleted standard theme files, and execute `mx check` to guarantee the project compiles with **0 errors**.
*   **No Disruption to Page Layout Grids:** Never allow a sparse theme folder supplied by a module package to displace the user's complete Atlas UI theme framework, which is vital for calculating column weights and avoiding compile-time layout errors.

*   **🛑 Direct Attribute & Association Initialization on Create Object Law**: Whenever an object is instantiated via a `Create Object` step (`CreateTestStepCreateObject`), ALL initial attribute values and association bindings MUST be set directly on the `Create Object` step itself. Creating a separate `Change Object` test step immediately following a `Create Object` step to set initial attributes or associations is strictly **PROHIBITED**.
*   **🛑 Frontend Test Seeding & Delete Execution Condition Law**: In Frontend tests, database Seeding steps in Case 1 (Setup Test Case) and Delete/Cleanup steps in Case 3 (Teardown Test Case) **MUST ALWAYS** be configured with `ExecutionCondition = "_Always"` (or `"Always"`) and `ResumeExecutionAfterException = "_Continue"`.
*   **🛑 Frontend UI to Backend Domain Microflow Substitution Prohibition**: In all Frontend tests (both exploratory and persistent), all UI actions and verifications MUST strictly drive the browser via `MenditectMxFrontendTestKit` microflows. Substituting UI widget actions with backend domain microflows (`ACT_*`, `SUB_*`, `CMT_*`) is strictly **PROHIBITED**. [^ANTI-20]
*   **🛑 Closed Catalog Frontend Testkit Microflow Verification Law**: All Frontend test step definitions (in Execution Plans, exploratory JSON blueprints, and persistent MTA test steps) MUST strictly and exclusively use verified microflows from the official closed catalogs of `MenditectMxFrontendTestKit` and `MenditectPlaywrightConnector` (documented in `frontend-testing.md` and `playwright-api.md`). Inventing, assuming, or hallucinating synthetic helper microflow names (such as `ACT_Playwright_*`, `Playwright_Click`, `Page_Click`, `SetText`, etc.) is strictly **PROHIBITED**. [^PAT-64] [^ANTI-21]
*   **🛑 Prompt vs. MTA Skill Conflict Audit & Correction Guardrail**: MTA Skill Laws and Architecture Manuals ALWAYS take precedence over raw user prompts, recorded execution logs, or user-provided JSON payloads. In every Execution Plan, you MUST include Section 2 (`Prompt & Input Log vs. MTA Skill Conflicts (MANDATORY)`), explicitly auditing the user prompt/log against official MTA Skill Laws. Any conflict or anti-pattern MUST be highlighted in the conflict table alongside its automatic skill correction.
*   **🛑 Uniform Step Sequence Schema Law**: Every test step in Section 5 of an Execution Plan MUST strictly adhere to the uniform 8-field schema in exact field order (`Step Type`, `Target / Entity / Action`, `Input Source / Handles`, `Output Variable Handle`, `Parameters & Attribute Values`, `Embedded Step Assertions`, `Execution Settings`, `Step Description & Pattern Rationale`).
*   **🛑 Execution Plan Clean Matrix & Outer Collapsible Formatting Law**: Every Execution Plan presented to the user (`# MTA EXECUTION PLAN SIGN-OFF`) MUST strictly adhere to the standardized 8-section layout, utilize outer collapsible sections (`<details><summary><b>...</b></summary>`) for high-level sections and granular per-step drilldowns, maintain 100% clean markdown table cells (ZERO raw HTML block tags, linebreaks, or `<details>` inside `| ... |` table cells), and contain zero icons/emojis:
    1. **Pre-Approval Quality Audit Banner & Checklist**: Top-level 3-tier status note (`> [!NOTE] Pre-Approval Quality Audit: 13 of 13 compliance checks passed (100% compliant)`) followed by a collapsible checklist table (`<details><summary><b>Pre-Approval Quality Checklist (13 of 13 Checks Passed)</b></summary> ... </details>`) with 13 compliance rows (`[CHECK 1]` to `[CHECK 13]`).
    2. **Section 1: State Compaction & Target Placement**: Collapsible section (`<details><summary><b>1. State Compaction & Target Placement</b></summary> ... </details>`) containing the MTA State Compaction JSON block and target application metadata bullets.
    3. **Section 2: Prompt & Input Log vs. MTA Skill Conflicts (MANDATORY)**: Collapsible section (`<details><summary><b>2. Prompt & Input Log vs. MTA Skill Conflicts (MANDATORY)</b></summary> ... </details>`) containing the conflict audit table.
    4. **Section 3: Test Case Scope & Dual-Risk Profile**: Markdown heading (`## 3. Test Case Scope & Dual-Risk Profile`) with open markdown tables for Functional Specification Profile and Dual-Risk Alignment & Mitigation Profile.
    5. **Section 4: Verified Model Elements & Testability Profile**: Markdown heading (`## 4. Verified Model Elements & Testability Profile`) with open markdown table of verified model elements (Microflow, Entity, Page, Widget, Navigation).
    6. **Section 5: Chronological Step Sequence Plan**: Test case container settings (`### Test Case Container Settings`) followed by `### Step Sequence Matrix` (8-column clean summary table) and `### Detailed Step Configurations & Assertions` rendering each step's 8 uniform properties in standalone collapsible blocks (`<details><summary><b>Step N: ...</b></summary> ... </details>`).
    7. **Section 6: Playwright / Browser Settings**: Collapsible section (`<details><summary><b>Playwright & Browser Environment Settings</b></summary> ... </details>`) with 10-setting table (Frontend) or NA notice (Backend).
    8. **Section 7: Data Variation Matrix & Metadata**: Horizontal $M \times N$ matrix table (max 8 columns) + collapsible Scenario Registration Metadata & Variation Recipes (`<details><summary><b>Scenario Registration Metadata & Variation Recipes</b></summary> ... </details>`).
    9. **Section 8: Applied Testing Patterns & Rationale**: Collapsible table (`<details><summary><b>Applied Testing Patterns & Architecture Laws</b></summary> ... </details>`) citing canonical `PAT-xx` / `ANTI-xx` IDs. [^PAT-12] [^PAT-65]

---

## 🔄 EXECUTION PLAN ITERATION & BUILD PLAN PATTERN RE-AUDIT GUARDRAIL
When modifying or updating an existing Execution Plan during `STATE_BUILD_PLANNING` (whether at the step level, parameter level, or data variation matrix level):
1. **Mandatory Full Build Plan Output:** You are strictly prohibited from outputting localized text edits, isolated snippet changes, or showing ONLY the mutated Data Variation Matrix table in isolation. You MUST ALWAYS re-display the entire Execution Plan / Build Plan in its full, complete form (including Metadata, Documentation, Risk Alignment, Chronological Step Sequence, Data Variation Matrix, and Self-Audit Report).
2. **Mandatory Pattern Re-Audit:** Before presenting the updated Execution Plan, you MUST re-evaluate the full step sequence against all build-plan patterns (including Direct Initialization on Create Object, Empty Object Retrieve/Filter, Retrieve/Microflow Output Object Count Assertion [excluding Create Object steps], Backend-First Delete, Void Microflow Side-Effects, Validation Feedback Assertions (Backend Microflow Tests Only), Frontend 3-Case Split, Backend Exploratory Single-Payload Blueprint [PAT-63], Frontend Persistent MTA Construction [PAT-62], Frontend UI to Backend Microflow Substitution Prohibition [ANTI-20], Data Variation Formatting & Capping, Test Step Description Pattern Annotations, and Prompt vs. MTA Skill Conflict Audit). Making localized text/table edits in isolation without re-auditing and adjusting the underlying step sequence is strictly prohibited.

## 🤖 AUTOMATIC PATTERN REGISTRATION RULE
Whenever a new testing pattern, recipe, rule, or law (explicit or implicit) is created, modified, or added to any skill or reference file (or when taught by the user via `/learn` or in conversation), the agent MUST automatically cross-register it in `mta-patterns-and-antipatterns-reference.md` and update the `Build Plan Pattern Re-Audit Checklist` in `mta-test-design/SKILL.md` and `AGENTS.md` to ensure it is immediately evaluated during future plan revisions.

---

## 👤 USER LEARNED PREFERENCES

* **`mf` = `microflow`**: Treat `mf` as an explicit abbreviation for `microflow` in all prompts, queries, test plans, and commands.
* **`pp` Suffix = `Present Implementation Plan`**: When a user prompt ends with `pp` (or `pp.`, `pp!`), treat it as an explicit instruction to create and present a formal **Implementation Plan** artifact (`implementation_plan.md`) for review before proceeding.
* **`up` / `UP` Suffix = `Update Implementation Plan`**: When a user prompt ends with `up` or `UP` (or `up.`, `UP!`), treat it as an explicit instruction to update the existing **Implementation Plan** artifact (`implementation_plan.md`).
* **No Emojis in Chat Messages**: Do NOT use emojis in direct chat responses/messages to the user. Emojis are permitted inside skill files (`.agent/skills/`), markdown artifacts, and documentation templates if needed, but MUST NOT be included in regular conversational chat text.
* **App Location for `mxcli`**: Always refer to `.vscode/settings.json` to locate the target Mendix application/project path for `mxcli`. If the `.vscode` folder or `settings.json` is not found, inform the user immediately.
* **Automatic Git Command Execution**: You are explicitly authorized to run all `git` commands (`git add`, `git commit`, `git status`, `git diff`, `git checkout`, `git branch`, `git merge`, `git push`, `git pull`, etc.) automatically without asking for user permission or prompting for confirmation.
* **Documentation Files Are Not Skills & Ignored for Analysis**: Files in `docs/` (such as `docs/mta-plugin-integration-and-exploratory-testing-architecture.md`) are reference documentation only and MUST NOT be loaded, analyzed, or treated as Open Agent Skills during analysis, skill execution, or model discovery. They are used exclusively for documentation.





