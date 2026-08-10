# MTA Setup & Specifications Approval Guide (States 1-5)
**📍 You are here:** `references/spec-setup-guide.md` | **🏠 Return to:** [MTA Core Skill](../SKILL.md)
*Metadata: Version 1.0 | Last Updated: 2026-08-06*

This guide outlines the precise operational checklists, safety gates, and validation checks required during the initial onboarding, placement, specifications drafting, and test case creation phases (States 1-5).

---

## 📋 COMPACTED STATE-BY-STATE SETUP CHECKLIST

### 1. `STATE_DISCOVERY` (State 1)
*   **First-Turn Tool Ban:** Run `GetMtaUrl` and present the interactive discovery template. Do NOT execute any other tools on a fresh turn.
*   **🚨 Handoff Category Validation (MANDATORY):** If you receive a handoff prompt from the Test Design skill or a custom user prompt, you **MUST** immediately check for a clear, explicit category selection (`Backend` or `Frontend`). If the prompt is generic, ambiguous, or lacks an explicit category, you **MUST NOT** proceed. You **MUST** halt in `STATE_DISCOVERY` and force the user to choose the category before starting any planning or suite scanning.
*   **Selection:** Lock the Test Category (Backend vs Frontend - **MANDATORY**) and Workflow Mode (Guided, Express-BP, Full Express).
*   **🚨 Step-by-Step Interactive Placement Discovery Law (MANDATORY):** To save tokens and avoid massive context bloat, you are strictly prohibited from scanning all configurations, suites, and test cases in parallel or in a single turn. You **MUST** perform the scans sequentially and interactively as defined in [MTA Placement & Lifecycle Guide](placement-and-lifecycle.md#41-step-by-step-interactive-placement-discovery-law-token-conservation), halting for user selection/creation after each level:
    1. Scan & present Test Configurations -> User selects or creates one.
    2. Scan & present Test Suites in that Configuration -> User selects an existing suite or creates a new one (propose a clear Name and Description, while offering the option for the user to define their own).
    3. Scan & present Test Cases in that Suite -> User selects or overwrites an existing case or creates a new one (propose a clear Name, while offering the option for the user to define their own).
*   👉 **Read:** [MTA Placement & Lifecycle Guide](placement-and-lifecycle.md)

### 2. `STATE_PLACEMENT` (State 2)
*   **Placement:** Execute the sequential step-by-step discovery. Present the results of each scan and ask the user to select an existing container or specify a name to create a new one. Do not guess or assume placements.
*   👉 **Read:** [MTA Placement & Lifecycle Guide](placement-and-lifecycle.md)

### 3. `STATE_SPEC_APPROVAL` (State 3)
*   **Mandatory Halt:** Draft detailed specs for all 3 cases and **HALT for user approval** in all modes.
*   **🚨 Category Consistency Gate (MANDATORY):** You **MUST** run a strict consistency validation on your drafted specifications to ensure zero mixing of frontend and backend concerns.
    *   *If Backend is locked:* Specifications and step descriptions are strictly prohibited from referencing pages, UI widgets, button clicks, browser navigation, or starting/stopping Playwright sessions.
    *   *If Frontend is locked:* Specifications and step descriptions must focus on browser-level actions and UI assertions, restricting direct microflow calls exclusively to setup/teardown utility cases.
    *   *If any mixing is detected:* You **MUST** reject the specifications, explain the mismatch to the user, and rollback to `STATE_DISCOVERY`.
*   **Data Seeding Trigger:** If setup requires complex or multiple entities, proactively ask the user if they exist as static master data or should be created in-case.
*   👉 **Read:** [MTA Placement & Lifecycle Guide](placement-and-lifecycle.md) | [MTA Execution Settings Reference](execution-settings.md)

### 4. `STATE_CASE_CREATION` (State 4)
*   **🚨 Execution User Resolution (CRITICAL):** You **MUST** resolve the `ExecutionUserKey` before creating a test case, as it is a required parameter for `CreateTestCase`. Call `GetExecutionUsers` to verify if a user exists. If none are present (or a new user is needed), call `CreateExecutionUser` **first** to provision the user and obtain its key. You cannot create the test case first and register the user later.
*   **Creation & Save Specifications (MANDATORY):** Create test cases sequentially in forward chronological order passing the resolved `ExecutionUserKey`. Immediately after creation, you **MUST** call `SetTestCaseSpecifications` to save the complete approved specifications (Name, Objective, Preconditions, Expected Result) to the MTA server without any summarization.
*   **Settings:** Set execution options via `SetExecutionSettingsOfTestCase`.
*   👉 **Read:** [MTA Execution Settings Reference](execution-settings.md) | [MTA Placement & Lifecycle Guide](placement-and-lifecycle.md)

### 5. `STATE_BROWSER_SETUP` (State 5)
*   **Halt Gate:** In Guided Mode, offer Option A or Option B and **HALT** for validation. Auto-apply smart defaults in Express modes.
*   **Piping:** Link Case 1's returned `Browser` context output to Case 2's start step input.
*   👉 **Read:** [Playwright Browser Setup Manual](playwright-api.md#%F0%9F%8C%90-playwright-browser-setup-state-5)
