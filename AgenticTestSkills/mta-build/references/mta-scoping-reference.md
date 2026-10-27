# MTA Test Design & Scoping Reference (`STATE_BUILD_PLANNING`)

This reference guide contains the complete operational procedures for test configuration scoping, coverage calibration, intent classification, bifurcated Mendix model discovery, the 3-step interactive planning loop (`PLAN_STEP_1B`, `PLAN_STEP_1`, `PLAN_STEP_2`, `PLAN_STEP_3`, `FAST_PATH_EXECUTION`), and the 6-section Execution Plan Blueprint.

---

## 1. Test Suite & TestCase Scoping & Coverage Calibration

### Container Hierarchy
* **Test Configurations:** Group test suites under specific execution contexts (e.g. `Unit tests`, `Regression Suite`).
* **Test Suites:** Segment test cases logically by module or functional domain (e.g. `SalesSuite`, `InventorySuite`).
* **Test Cases:** Construct isolated execution flows with a single test responsibility (e.g. `TC_CreateOrder_Success`), or a 3-Case Frontend Suite (`Case 1: Setup`, `Case 2: Action`, `Case 3: Teardown` per `PAT-03`).

### Coverage Calibration
* **Coverage Calculation:** Programmatically determined by analyzing the percentage of Mendix microflows and nanoflows executed during a test run.
* **Coverage Goals:** Establish target coverage percentages (e.g. 80%) for critical business modules.
* **Exclude Filters:** Exclude trivial or boilerplate microflows (helpers, custom login flows, third-party marketplace modules) from the coverage denominator.
* **Coverage Exceptions:** Define explicitly approved microflows exempted from coverage targets due to architectural constraints (`PAT-26`).

---

## 2. Entry Rules, Ingestion Protocols & Intent Classification

### 2.1 General Vague Testing & Exploratory Test Ingestion
When the user's request is vague, exploratory, asks for an exploratory test (*"exploratory test"*, *"run an exploratory test"*, *"test using MTA_plugin"*, *"in-memory test"*, *"test this microflow/entity"*, *"I want to test this app"*, *"How should I start testing?"*), or when an AI agent modifies the Mendix `.mpr` / Git history:
1. Proactively ask if automated testing is needed on `.mpr` changes.
2. Load `mta-test-design` first before `mta-build` or `mta-run-analyze`.
3. Present the onboarding guide and copy-pasteable starter prompts from `references/prompts-templates.md` at `STATE_BUILD_PLANNING (PLAN_STEP_1)`.

### 2.2 Ad-Hoc Data & Entity Creation Ingestion Protocol (`PAT-70`, `ANTI-46`, `PAT-89`)
When asked to create, seed, or generate entities/records (e.g. *"create 5 cars with 2 carsizes and 2 locations"*, *"seed 3 orders"*), never execute tools without an Execution Plan (`ANTI-46`) or ask open-ended microflow questions:
1. **Autonomous Domain Entity Resolution (`PAT-109`, `ANTI-75`):** Resolve qualified entity names and associations strictly via **Mode A Studio Pro MCP**: if the prompt gives unqualified entity names (e.g. `"car"`, `"carsize"`), call `StudioPro.list_modules` first to identify candidate application modules, then call `StudioPro.ped_read_document(type="DomainModels$DomainModel", name="<Module>.DomainModel", depth=2)`. Calling `mxcli` for entity discovery when Studio Pro MCP is active is strictly prohibited (`ANTI-75`); use `SELECT Name, QualifiedName FROM CATALOG.ENTITIES` **only** in Mode B offline fallback when Studio Pro MCP is not running.
2. **Draft Standalone Data Seeding Plan (`PAT-70` Option 1):** Write `${execution_plans_dir}/EP_Seed_<Entity>.md` (`status: "DRAFT"`, `test_intent: "data_seeding"`, 1-Case Generator with trailing `Persist`, no teardown, `Rollback = No`). Map initial attributes and associations directly onto `CreateObject` handles (`PAT-06`). Omit `PAT-07` sentinels unless the variation matrix explicitly requires unassigned (`empty`) associations. Distribute requested permutations across Section 4 (`VAR_01`..`VAR_0N`).
3. **Present Checkpoint 1 Decision Card (`PAT-89`):** Render the ~35-line Executive Summary Box and Case 3 from `references/checkpoint-templates.md`:
   - **Option A (Local Direct Seeding via `MTA_plugin`):** Execute immediately via `execute-testcase` with `RollbackTcseAfterExecution = "No"` and trailing `Persist`.
   - **Option B (Persistent 1-Case Data Generator on MTA Server):** Proceed to `PLAN_STEP_2` to build a reusable 1-Case Data Generator on the MTA Server.

### 2.3 Hierarchical Test Intent Classification & Anti-Tautology Protocol (`PAT-121`)
Before drafting test steps or expected assertion values, classify the test intent and ground-truth hierarchy to prevent circular/tautological testing:

| Priority Tier | `test_intent` Value | Primary Source of Truth (Oracle) | Core Rules & Constraints |
| :--- | :--- | :--- | :--- |
| **Tier 1** | `regression` | **Live `.mpr` AST (Current Behavior)** | Locks in current behavior against future regressions. Capture external user stories/Jira in `supplementary_context` and note any `specification_drift`. |
| **Tier 2** | `exploratory_robustness` | **Live `.mpr` AST + Boundary Heuristics** | Exercises every AST decision split (`PAT-109`) plus adversarial boundaries: zero, negative, empty/null (`PAT-07` Dual-Retrieve sentinels), and exception handling. |
| **Tier 3** | `exploratory_feature` \| `tdd` | **Mandatory External Specification** | Requires external spec (`jira_*`, `atlassian_*`, `maia_plan_*`, `sprintr_*`, `@annotation`, or explicit prompt criteria). Deriving expected values solely from AST is prohibited (`ANTI-69`). |
| **Tier 4** | `bug_reproduction` (`PAT-124`) | **External Defect Report / Error Prompt** | Current AST is treated as **FLAWED**. Expected assertions MUST come from the defect report (`expected_pre_fix_outcome: "FAIL"`, initial `protection_level: "unlocked"` until locked via `node tools/mta-lint.mjs lock <plan.md>` in `BUGFIX_REPRODUCE_RED`). |
| **Tier 5** | `data_seeding` (`PAT-70`, `PAT-06`) | **User Data Generation Request** | Standalone record creation (`CreateObject`, association binding, batch `Persist`, `Rollback = No`). Exempt from `PAT-07` dummy sentinels unless `empty` associations are varied. |

* **Linguistic & Stub Classifier:**
  * Defect keywords (*"bug", "issue", "defect", "reproduce", "broken", "wrong value", "crash", "doesn't work"*) mandate `bug_reproduction` (`PAT-124`).
  * Creation/modification verbs (*"I added", "I implemented", "new logic", "changed", "fixed", "updated", "test-driven"*) forbid `regression` and mandate `exploratory_feature` or `tdd`.
  * Empty/stub microflows (Start -> End with no business activities per `PAT-109`) mandate `tdd` or `exploratory_feature`.
  * Ambiguous requests (*"test this microflow"* without context) trigger **The Conservative Gate** at Checkpoint 1 rather than silently defaulting to `regression`.
* **Anti-Loophole Guardrails (`ANTI-68`..`ANTI-72`):**
  * `ANTI-68`: No intent downgrading to `regression` to bypass missing external specs.
  * `ANTI-69`: No circular AST-mirrored `external_spec_summary` matching `/as\s+implemented/i`, `/current\s+microflow/i`, `/matches\s+ast/i`, or `/derived\s+from\s+code/i`.
  * `ANTI-70`: No rubber-stamp risk mitigations; `exploratory_feature`/`tdd` plans require boundary tokens (`null`, `empty`, `exceed`, `unauthorized`, `negative`, `boundary`, `invalid`, `fail`).
  * `ANTI-71`: No trivial prompt echoes (`external_spec_summary` must be $\ge 30$ chars and contain conditional/assertion keywords like `if`, `when`, `must`, `should`, `equal`, `returns`).
  * `ANTI-72`: No softened scalar return assertions (scalar return assertions must use `Equal` rather than `NotEqual`).

### 2.4 Zero Mendix Model Mutation & Test Microflow Proscription (`PAT-122`, `ANTI-73`)
Never create, generate, or modify Mendix microflows, nanoflows, entities, or pages for testing (`Test_*`, `UT_*`, `ACT_Test_*`). All testing is externalized via `MTA_plugin.execute-testcase` (`RollbackTcseAfterExecution = "Yes"`) or the MTA Platform. If both MCP servers are unreachable, draft and save `EP_<TestCaseName>.md` (`status: "DRAFT"`) and halt at Checkpoint 1 Case 4.

---

## 3. The 3-Step Interactive Planning Loop (`STATE_BUILD_PLANNING`)

### 3.1 `PLAN_STEP_1B`: Phase 0 Prior Plan Lineage Audit (`PAT-84`, `ANTI-38`)
Before running fresh discovery, search `${execution_plans_dir}/` for existing `EP_*.md` files targeting the same microflow, entity, or page:
* If found, run a Pre-Flight AST Delta Audit (`ped_read_document` / `pg_read_page` or `mxcli DESCRIBE`) comparing the live model against Sections 2 and 3 of the prior plan.
* Present the **Prior Plan Lineage Decision Card** from `references/checkpoint-templates.md` (`Path 0: Execute/Build As-Is`, `Path A: Evolve Plan in Place`, `Path B: Branch New Variation`, `Path C: Clean Slate Archive`).
* Also re-enter `PLAN_STEP_1B` when `PLAN_STEP_2` suite reuse (`PAT-123` Option 1) requires structural step or scenario changes (`revision + 1`, `supersedes_plan_id`, `status: "DRAFT"`, re-verified via `node tools/mta-lint.mjs plan`).

### 3.2 `PLAN_STEP_1`: Bounded 2-Turn Discovery & Specification Drafting (Gate 1)
1. **Bounded 2-Turn Discovery Budget (`ANTI-82`, `ANTI-66`):**
   * **Turn 1:** Read `mta_config.json` (`exploratory_execution_mode`, `execution_plans_dir`, `model_source`), extract the target microflow/page/domain model AST in one shot (`PAT-109`, `PAT-71`, `ANTI-26`, `ANTI-58`, `ANTI-75`), and optionally call `GetAppModelData(includeMicroflows=false, includeDomainModel=false)` (`PAT-82`).
   * **Turn 2:** Extract DatePicker BSON format (`PAT-94`) or domain string length constraints (`PAT-53`), write `${execution_plans_dir}/EP_<TestCaseName>.md` (`status: "DRAFT"`, `target_configuration_key: null`, `target_suite_key: null`), run `node tools/mta-lint.mjs plan "${execution_plans_dir}/EP_<TestCaseName>.md"` (which records `DRAFT_LINTED` in `.mta-gate-ledger.json`), and present Checkpoint 1.
   * Calling `GetTestSuiteDetails`, `GetTestCaseDetails`, or `GetTeststepDetails` during `PLAN_STEP_1` is strictly prohibited (`ANTI-82`, `ANTI-66`).
2. **Bifurcated Model Discovery Protocol (`PAT-109`, `PAT-71`, `PAT-97`, `ANTI-26`, `ANTI-58`, `ANTI-75`):**
   * **Mode A (Studio Pro MCP / MAIA Primary):** Active when `ped_read_document`, `pg_read_page`, `ped_find_document`, `ped_list_folder`, `list_modules`, or `ped_get_schema` are available and Studio Pro is running. Running `mxcli` or shell commands for model or entity discovery is **STRICTLY PROHIBITED** (`ANTI-75`), except the `PAT-94` DatePicker BSON dump carve-out (`.\mxcli.bat bson dump "<PageName>" --type page -p "<project.mpr>"`). Read microflows via `ped_read_document(Microflows$Microflow, depth=4)`, pages via `pg_read_page`, and domain models via `list_modules` + `ped_read_document(DomainModels$DomainModel, depth=2/3)`. Mutating Studio Pro tools (`ped_create_document`, `ped_update_document`, `pg_patch_page`, `ped_create_module`) are prohibited (`PAT-122`, `ANTI-73`).
   * **Mode B (Headless `mxcli` Offline Fallback):** Active only when Studio Pro MCP/MAIA is absent:
     * Structural AST: `.\mxcli.bat describe microflow|page <Module.Name> -p <project.mpr>`
     * Microflow catalog & return types: `SELECT Name, ModuleName, ReturnType FROM CATALOG.MICROFLOWS WHERE ModuleName = '<Module>'`
     * Activities & captions: `SELECT ObjectName, ActivityType, Caption, ActionDetail, Disabled FROM CATALOG.ACTIVITIES WHERE ModuleName = '<Module>' AND ObjectName = '<Microflow>'`
     * Cross-references: `SELECT SourceType, SourceModule, SourceObject, TargetType, TargetName, LocationDetail FROM CATALOG.REFS WHERE SourceModule = '<Module>' AND SourceObject = '<Element>'`
     * Entities & attributes: `SELECT EntityName, AttributeName, AttributeType, Length, DefaultValue FROM CATALOG.ATTRIBUTES WHERE ModuleName = '<Module>'`
     * Never run broad `SHOW *` cascades (`ANTI-26`) or ad-hoc `.py`/`.ps1`/`.js` scripts (`ANTI-58`).
3. **Domain Rule Activation Summary:**
   * **Backend Logic (`Category: "Backend"`):** Direct initialization on `CreateObject` with `Input Handle = '-'` (`PAT-06`, `ANTI-01`, `ANTI-05`); unconditional Dual-Retrieve Empty Object Sentinels (`'VAL'` vs `'NON'`/`'NONE'`, $\le 4$ chars) paired per nullable object parameter/association (`PAT-07`) with embedded count assertions in Field 6 (`PAT-08`, `ANTI-03`, `ANTI-06`); embedded assertions (`PAT-14`, `ANTI-10`, `ANTI-13`, `ANTI-14`); Validation Feedback Session Isolation (`PAT-10`, `PAT-120`); `TestStepBeforeKey` forward-chaining (`PAT-11`, `ANTI-44`); `None`/`Stop` execution settings (`PAT-17`, `ANTI-07`); target-bound Section 4 matrix rows (`Step X: Entity.Attribute`, `Step Y: Filter Entity.Attribute`, `Step Z: Assert Return Value` per `PAT-110`, `ANTI-48`, `ANTI-59`); unified promotable blueprint with zero unrolled steps (`PAT-111`, `ANTI-60`).
   * **Frontend UI (`Category: "Frontend"` — 8-Requirement Checklist):**
     1. Single-pass page AST (`pg_read_page` / `DESCRIBE PAGE`) + Section 2 Input Widget Inventory table + `GetAppModelData(RetrieveWidgetsByPage)` metamodel check (`PAT-67`, `PAT-72`, `PAT-114`, `ANTI-23`, `ANTI-63`).
     2. 3-Case Suite split (`Case 1: Setup`, `Case 2: Action`, `Case 3: Teardown` per `PAT-03`) with `Always`/`_Continue` on setup/teardown (`PAT-18`).
     3. Self-contained Case 1 seeding with `'TEST_'` prefixed keys and trailing `Persist` (`PAT-91`, `ANTI-42`).
     4. Minimum 2+ seed records when testing lists, grids, or reference selectors (`PAT-40`).
     5. Guest Access inspection (`allowedRoles`) to choose `Start_MxFrontend_Test_Without_Login` vs `Start_MxFrontend_Test_With_Login` with verified credentials; never invent dummy passwords (`PAT-41`, `PAT-125`, `ANTI-81`).
     6. Dynamic scalar piping (`SelectValueForValue`) from Case 1 into Case 2 filters/inputs (`PAT-52`).
     7. DatePicker BSON `FormattingInfo.CustomDateFormat` extraction (`PAT-42`, `PAT-94`, `ANTI-45`).
     8. Closed-catalog `MenditectMxFrontendTestKit` locators (`PAT-64`, `ANTI-20`, `ANTI-21`, `ANTI-79`): `GenerateMicroflowCallTestStepLocatePage` (clean `PageClassName = '<Page>'`) and `GenerateMicroflowCallTestStepLocateWidget` for standard widgets; post-trigger `Locate_MxWidget_*_ValidationMessage` (`CreateMicroflowCallTestStep`) paired with `ASR_Is_Hidden_MxLocator` / `ASR_Is_Visible_MxLocator` and explicit `Description` (`PAT-119`, `ANTI-74`); symmetric Case 3 teardown in reverse dependency order ending with `Persist` (`PAT-92`, `PAT-93`, `ANTI-43`); default `SlowMo = 0 ms` (`PAT-116`, `ANTI-65`).
   * **Manual Test Plan (MTP) & Live Data Provisioning (`PAT-68`, `PAT-69`, `PAT-70`, `ANTI-24`, `ANTI-25`):** When seeding persistent live test data for manual testers (`RollbackTcseAfterExecution = "No"`), append a mandatory final parameterless `Persist` step (`PAT-69`) and never include teardown deletion in the same case (`ANTI-25`).
4. **Mode-Aware Gate 1 Halt vs Fast-Path Execution (`PAT-43`, `PAT-63`, `PAT-82`, `PAT-89`, `PAT-112`, `ANTI-36`, `ANTI-41`, `ANTI-46`, `ANTI-56`, `ANTI-61`, `ANTI-80`):**
   * Inspect active MCP servers (`MTA` vs `MTA_plugin`) to select Checkpoint 1 Case 1..6 from `references/checkpoint-templates.md` (including consultative Free Exploratory License guidance under `PAT-112` / `ANTI-61` when connected to `wss://services.menditect.com`).
   * **Fast-Path Auto-Execution (`Temp State: FAST_PATH_EXECUTION`):** When `mta_config.json.exploratory_execution_mode == "auto_execute"`, `Category == "Backend"`, `Target == "MTA_plugin"`, `Rollback == "Yes"`, `MTA_plugin` is online, `test_intent != "bug_reproduction"`, and ground truth is unambiguous, write `EP_<TestCaseName>.md` (`status: "AUTO_APPROVED"`), run `node tools/mta-lint.mjs pre-exec`, and execute `MTA_plugin.execute-testcase` in the **same turn**.
   * **Governed Halt Mode:** When `exploratory_execution_mode == "prompt_approval"`, Conservative Gate triggers, `test_intent == "bug_reproduction"` (Case 6), `Rollback == "No"` (Case 3), or targeting Option B, write `EP_<TestCaseName>.md` (`status: "DRAFT"`), run `node tools/mta-lint.mjs plan`, render the ~35-line Executive Summary + Checkpoint 1 card (`PAT-89`, `ANTI-41`), and **HALT**.
   * **Gate 1 Transitions:**
     * *Option A Approved:* Update `EP_*.md` to `status: "APPROVED"` (`approved_at`, `approved_by`, `approval_turn_id`, `approver_system_user`), sync `mta_state.json`, run `node tools/mta-lint.mjs pre-exec`, and transition to `STATE_RUN_ANALYZE`.
     * *Option B Selected (`ANTI-56`):* Keep `status: "DRAFT"` (or `"AUTO_APPROVED"` if promoting from an exploratory run) and transition to `PLAN_STEP_2`.

### 3.3 `PLAN_STEP_2`: Placement & Settings Discovery (Gate 2 Input Phase)
1. **Pre-Flight Server Check (`PAT-95`):** Verify `MTA` MCP server is reachable; on 401/403/offline, retain `status: "DRAFT"` and output the `PAT-95` Sanitized Layered Return Message.
2. **Promotion Routing (`PAT-57`, `PAT-70`):** In-memory exploratory tests (`Rollback = Yes`) promote 1:1 to a Backend Test Case with Data Variations; live seeding (`Rollback = No`) defaults to a 1-Case Data Generator.
3. **Multi-Configuration Hard Gate (`PAT-118`, `ANTI-67`):** Call `MTA.GetApplicationDetails(ApplicationName)`:
   * `0` configs: Direct user to create one in MTA Web UI (`[mta_base_url]/p/Application/[ApplicationKey]`) and offer Option A.
   * `1` config: Auto-select and proceed.
   * `> 1` configs (or mismatch with `default_app_instance`): **Never guess index 0 (`ANTI-67`)**. **HALT** and call `ask_question` listing active configurations.
4. **Frontend Playwright Settings Elicitation (`PAT-116`, `ANTI-65`):** For `category: "Frontend"`, call `ask_question` with 3 questions: (1) Browser (`chromium` [Recommended], `firefox`, `webkit`), (2) Mode (`headless` [Recommended], `headed`), (3) SlowMo (`0 ms` [Recommended per `PAT-116`], `250 ms`). Record `playwright_browser`, `playwright_execution_mode`, `playwright_slow_mo_ms`, and `frontend_options_confirmed_by_user: true`.
5. **Targeted Suite Scan & Collision Gate (`PAT-123`, `ANTI-76`):** Call `GetTestConfigurationDetails(selectedConfigurationKey)`. If an existing suite or test case matches the target name/microflow/flow, **HALT IMMEDIATELY** and call `ask_question` (**Option 1: Reuse / Repair Existing Suite** vs **Option 2: Create Brand-New Suite**). Handle Playwright conflict options per `references/execution-settings.md` and `references/placement-and-lifecycle.md`.

### 3.4 `PLAN_STEP_3`: Placement Staging, Checkpoint 2 & Plan Sealing (Gate 2 Sign-Off)
1. **Turn N (Stage Placement & Present Checkpoint 2 — `PAT-43`, `PAT-79`, `PAT-106`, `ANTI-56`, `ANTI-80`):**
   While `EP_<TestCaseName>.md` is still `status: "DRAFT"` (or `"AUTO_APPROVED"`), run:
   ```bash
   node tools/mta-lint.mjs stage-placement "${execution_plans_dir}/EP_<TestCaseName>.md" --config-key <ConfigKey> --suite-key <SuiteKeyOrNEW_SUITE>
   ```
   Render **Checkpoint 2: Confirm Test Suite Placement & Settings** from `references/checkpoint-templates.md` and **HALT** (`SAME_TURN_GATE_CHAINING_BLOCKED`).
2. **Turn N+1 (Seal Plan After User Replies "Approved" / "Proceed" — `PAT-44`, `PAT-47`):**
   Update `${execution_plans_dir}/EP_<TestCaseName>.md` to `status: "APPROVED"`, populate `approved_by`, `approver_system_user`, `approved_at` (ISO 8601), `approval_turn_id`, `target_configuration_key > 0`, `target_suite_key > 0` (or `"NEW_SUITE"` with non-empty `target_suite`), and Frontend Playwright metadata. Sync `mta_state.json`, display the **Sealed Receipt Notification**, and run `node tools/mta-lint.mjs pre-build "${execution_plans_dir}/EP_<TestCaseName>.md"` before transitioning to `mta-build` (`STATE_CONSTRUCTION`).

---

## 4. Standardized 6-Section Execution Plan Blueprint (`schema_version: "2.1.0"`)

All `EP_<TestCaseName>.md` files MUST adhere to `references/execution-plan-template.md`:
* **Collapsible YAML Metadata Header (`schema_version: "2.1.0"`):** Lifecycle status (`DRAFT`, `AUTO_APPROVED`, `APPROVED`, `BUILT_AND_VERIFIED`), intent & oracle fields (`test_intent`, `ground_truth_source`, `external_spec_ref`, `external_spec_summary`), placement keys (`target_configuration_key`, `target_suite_key`), and TDBF lock fields (`protection_level`, `locked_sha256`).
1. **Section 1: Test Case Scope & Dual-Risk Profile:** Functional Specification Profile table + Dual-Risk Alignment & Mitigation Profile table (`PAT-01`, `PAT-02`, `PAT-121`).
2. **Section 2: Verified Model Elements & Testability Profile:** Verified Model Elements table + Input Widget Inventory table for Frontend plans (`PAT-67`, `PAT-72`, `PAT-109`).
3. **Section 3: Master Chronological Step Ledger:** Open, uncollapsed 9-column markdown table (`Step #`, `Case #`, `Action / Microflow`, `Entity / Target`, `Input Handle`, `Output / Assertion`, `Exec / Resume`, `Pattern / Rationale`, `Step Details & Parameters`).
4. **Section 4: Data Variation Matrix & Scenario Metadata:** Target-bound $M \times N$ variation matrix (`Step X: Entity.Attribute`, `Step Y: Filter Entity.Attribute`, `Step Z: Assert Return Value`) with columns `#1 (VAR_01)`..`#N (VAR_0N)` (`PAT-110`, `PAT-111`, `ANTI-59`, `ANTI-60`).
5. **Section 5: Pre-Approval Quality Audit & Applied Patterns:** 14-Point Pre-Approval Quality Checklist (`[CHECK 1]`..`[CHECK 14]`), 6-Point Negative Anti-Pattern Scan (`[SCAN 1]`..`[SCAN 6]`), and Applied Testing Patterns table (`PAT-82`, `references/pre-approval-audit.md`).
6. **Section 6: MTA Build & Smoke Verification Receipt:** Populated post-construction during `STATE_SMOKE_AUDIT` (or post-verification in `STATE_RUN_ANALYZE`) with the 4 audit verification tables (`PAT-59`, `PAT-88`).

---

## 5. Canonical Specialized Scoping Guides & Knowledge Base Links

| Domain / Scenario | Documentation Topic | Canonical Reference Link |
| :--- | :--- | :--- |
| **REST API Microflows** | Testing microflows consuming or exposing REST services | [Testing REST Microflows](https://documentation.menditect.com/how-tos/test-rest-microflow) |
| **JsonPath Assertions** | Asserting on structured JSON return strings | [JsonPath Assertions](https://documentation.menditect.com/how-tos/jsonpath) |
| **Nanoflow Testing** | Scoping & verifying client-side Nanoflows | [Nanoflow Testing Guide](https://documentation.menditect.com/how-tos/test-nanoflows) |
| **File Handling** | Testing file upload, download, and FileDocuments | [Testing File Handling](https://documentation.menditect.com/how-tos/test-file-handling) |
| **Anonymous Users** | Testing pages and flows accessible anonymously | [Anonymous User Testing](https://documentation.menditect.com/how-tos/test-anonymous-user) |
| **Date Variations** | Handling dynamic dates and date offsets in variations | [Date Variations Guide](https://documentation.menditect.com/best-practice/data-variations-dates) |
| **List Operations** | Filtering, counting, and asserting on object lists | [Testing Lists Guide](https://documentation.menditect.com/how-tos/test-lists) |
| **XPath Constraints** | Verifying database XPath access rules and retrieves | [XPath Testing Guide](https://documentation.menditect.com/how-tos/test-xpath) |
