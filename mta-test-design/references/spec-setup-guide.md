# MTA Setup & Specifications Approval Guide (Macro States 1-5)
**📍 You are here:** `references/spec-setup-guide.md` | **🏠 Return to:** [MTA Build Skill](../SKILL.md) | [MTA Test Design Skill](../../mta-test-design/SKILL.md)
*Metadata: Version 2.0 | Last Updated: 2026-08-20*

This guide outlines the precise operational checklists, safety gates, and validation checks required across the 5 consolidated macro states of Menditect Test Automation (MTA).

---

## 📋 COMPACTED STATE-BY-STATE SETUP CHECKLIST

### 1. `STATE_DISCOVERY` (State 1)
*   **First-Turn Discovery:** Read `MTA Url` directly from project `AGENTS.md`, `mta_config.json`, `.vscode/settings.json`, or `mta_state.json` and present the interactive discovery template. Do NOT execute mutating tools on a fresh turn.
*   **🚨 Read-Only Tools Always Authorized:** You are always authorized to call read-only MTA `Get*` tools (`GetApplicationByName`, `GetTestConfigurationsForApplicationKey`, `GetTestSuites`, `GetTestCases`, `GetPages`, `GetWidgets`, `GetExecutionUsers`) to discover model state and existing containers.
*   **🚨 Handoff Category Validation (MANDATORY):** If you receive a handoff prompt from the Test Design skill or a custom user prompt, you **MUST** immediately verify a clear, explicit category selection (`Backend` or `Frontend`). If the prompt is generic, ambiguous, or lacks an explicit category, you **MUST NOT** proceed. You **MUST** halt in `STATE_DISCOVERY` and force the user to choose the category before starting any planning.
*   **Selection:** Lock the Test Category (`Backend` vs `Frontend` - **MANDATORY**).
*   👉 **Read:** [MTA Placement & Lifecycle Guide](placement-and-lifecycle.md) | [MTA Installation & Configuration Guide](../../mta-install-config/SKILL.md)

### 2. `STATE_BUILD_PLANNING` (State 2)
*   **3-Step Interactive Planning Loop:**
    1. `PLAN_STEP_1`: Draft unified 8-Section Execution Plan and run Pre-Approval Self-Audit Report. **HALT for Gate 1 Approval**.
    2. `PLAN_STEP_2`: Resolve placement inputs (Config, Suite, Case Name, Execution User, Playwright Settings).
    3. `PLAN_STEP_3`: Present Placement & Target Summary Box. **HALT for Gate 2 Approval**.
*   **🚨 Save Execution Plan Gate (MANDATORY):** Immediately upon receiving Gate 2 approval, call `SaveExecutionPlan` to save the approved plan on the MTA server and obtain the numeric `ExecutionPlanKey`.
*   **🚨 Category Consistency Gate (MANDATORY):** You **MUST** run a strict consistency validation on your drafted specifications to ensure zero mixing of frontend and backend concerns:
    *   *If Backend is locked:* Specifications and step descriptions are strictly prohibited from referencing pages, UI widgets, button clicks, browser navigation, or starting/stopping Playwright sessions.
    *   *If Frontend is locked:* Specifications and step descriptions must focus on browser-level actions and UI assertions, restricting direct microflow calls exclusively to setup/teardown utility cases.
*   **Data Seeding Trigger:** If setup requires complex or multiple entities, proactively ask the user if they exist as static master data or should be created in-case.
*   👉 **Read:** [MTA Placement & Lifecycle Guide](placement-and-lifecycle.md) | [MTA Test Design Skill](../../mta-test-design/SKILL.md) | [MTA Patterns & Anti-Patterns Reference](mta-patterns-and-antipatterns-reference.md)

### 3. `STATE_CONSTRUCTION` (State 3)
*   **🚨 Execution Plan Key Gating Rule:** You are strictly prohibited from executing active construction steps unless a valid `ExecutionPlanKey` is present and non-empty in your active session context.
*   **🚨 Execution User Resolution (CRITICAL):** Resolve `ExecutionUserKey` before creating a test case. Call `GetExecutionUsers` to verify if a user exists. If none are present (or a new user is needed), call `CreateExecutionUser` **first** to provision the user and obtain its key.
*   **Atomic Sequential Provisioning:** Construct test containers and steps sequentially in forward chronological order passing resolved predecessor keys. Immediately call `SetTestCaseSpecifications` to save approved specifications.
*   **Step Option Binding & Assertions:** Configure step attributes, parameters, bindings, and embedded assertions. Call `SetTestStepNameDescription` to annotate steps with pattern rationales (`[Pattern: <Name> - <Rationale>]`).
*   👉 **Read:** [MTA Build Construction Guide](build-construction-guide.md) | [MTA Golden Rules Reference](golden-rules.md) | [MTA Execution Settings Reference](execution-settings.md)

### 4. `STATE_SMOKE_AUDIT` (State 4)
*   **Mandatory Halt Gate:** Run server compiler validation (`GetTestConstructionErrorsOfTestCase`) and perform a **100% Full-Content Audit of ALL 8 Sections of the saved Execution Plan** (`GetExecutionPlan`, `GetTestSteps`, `GetTestCaseDataVariationsDetails`).
*   **Audit Report:** Present the Post-Construction Smoke Audit Report and **HALT** for user confirmation before executing tests.
*   👉 **Read:** [MTA Build Construction Guide](build-construction-guide.md) | [MTA Troubleshooting Guide](troubleshooting.md)

### 5. `STATE_RUN_ANALYZE` (State 5)
*   **Execution & Diagnostics:** Trigger test runs (`ExecuteTestSuite` or `ExecuteTestCase`), retrieve results (`RetrieveTestRunResults`), parse logs, and initiate the automated self-repair protocol if failures occur.
*   👉 **Read:** [MTA Run & Analyze Skill](../../mta-run-analyze/SKILL.md) | [MTA Troubleshooting Guide](troubleshooting.md)
