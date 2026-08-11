# MTA Execution Settings Reference
**📍 You are here:** `references/execution-settings.md` | **🏠 Return to:** [MTA Core Skill](../SKILL.md)
*Metadata: Version 1.0 | Last Updated: 2026-06-30*

---

This manual contains the canonical reference for selecting and configuring the correct execution conditions, delay settings, rollback behaviors, and cascading dependency laws at both the Test Case level and Teststep level in Menditect Test Automation (MTA).

---

## 🧭 EXECUTION CONDITION DECISION TREE

Use this decision tree to determine the correct settings for any Test Case or Teststep:

1. Is it a Boilerplate Frontend Test Case (Setup Case 1 or Teardown Case 3)?
   ├─► Yes: Set Case ExecutionCondition to "Always", ResumeExecutionAfterException to "_Continue".
   └─► No: Is it Case 2 (Execution)?
       ├─► Yes: Set Case ExecutionCondition to "None" (standard default), ResumeExecutionAfterException to "Stop".
       └─► No: (Backend Unit Test consisting of a single microflow execution): Set RollbackTcseAfterExecution to "Yes". For all other cases, set it to "No".

2. For any Teststep inside Category B (Frontend) tests:
   ├─► Is it a Boilerplate step (Options Objects, Start Frontend Session [Start_MxFrontend_Test_...], Stop Frontend Session [Stop_MxFrontendTest], Playwright Teardown [Teardown_Playwright])?
   │   └─► Set Step ExecutionCondition to "Always", ResumeExecutionAfterException to "_Continue".
   ├─► Is it a Backend Data Action?
   │   ├─► Setup Seeding (Case 1), Teardown Setup Cleanup (Case 3), and UI-Created Cleanup (Case 2) steps:
   │   │   └─► Set Step ExecutionCondition to "Always", ResumeExecutionAfterException to "_Continue".
   │   │       *(This includes Create, Change, Retrieve, Delete, and Persist steps used to prepare data or clean up the database).*
   │   └─► Database Assertions, Assert Steps, & Retrievals used for Assertions:
   │       └─► Set Step ExecutionCondition to "Always", ResumeExecutionAfterException to "_Continue" (🚨 **CRITICAL RULE:** Assertions and retrieve steps used for asserting must default to continuing on failure; only use "Stop" if explicitly requested in the prompt or by the user).
   └─► Is it a Standard UI Interaction (Clicks, Fills, standard UI Assertions)?
       └─► Set Step ExecutionCondition to "None" (standard default), ResumeExecutionAfterException to "Stop" (Note: If any standard UI interaction step functions as an assertion, it should default to continuing on failure unless explicitly requested to stop).

3. For any Teststep inside Category A Backend Unit Tests (Single-Case with Rollback enabled):
   ├─► Do we need to configure execution settings for object actions (Create, Change, Delete, Persist, Assert, Retrievals)?
   └─► **By Default, No!** All backend data actions inside a unit test use the default execution settings (`ExecutionCondition` = `"None"`, `ResumeExecutionAfterException` = `"Stop"`) by default. You do NOT need to call `SetExecutionSettingsOfTestStep` on them unless the user explicitly specifies custom execution settings. Since the entire testcase rolls back on failure, skipping downstream steps immediately is expected and desired.

---

## 📋 EXECUTION CONDITION DECISION MATRIX

| Level | Component / Flow Type | ExecutionCondition | ResumeExecutionAfterException | Notes / Operational Role |
| :--- | :--- | :--- | :--- | :--- |
| **Case Level** | Case 1 (Setup/Startup/Login) | `"Always"` | `"_Continue"` | Guarantees browser starts and session is created |
| **Case Level** | Case 2 (Standard Actions/Assertions) | `"None"` | `"Stop"` | Standard verification; skips if Setup failed |
| **Case Level** | Case 3 (Teardown/Cleanup) | `"Always"` | `"_Continue"` | Strictly mandatory to close browser & clean up data |
| **Step Level** | Options Objects (`LocalStartOptions`, etc.) | `"Always"` | `"_Continue"` | Options must exist to start browser |
| **Step Level** | Setup & Startup steps (`Start_Frontend...` & `Start_MxFrontend_Test_...`) | `"Always"` | `"_Continue"` | Crucial browser setup/startup steps |
| **Step Level** | Standard UI Interactions (Clicks, Fills) | `"None"` | `"Stop"` | Normal UI verification flow |
| **Step Level** | Backend Data Seeding (Create, Change, Persist) - *Category B / Multi-Case* | `"Always"` | `"_Continue"` | Setup database state |
| **Step Level** | Backend Cleanup (Delete, Persist) - *Category B / Multi-Case* | `"Always"` | `"_Continue"` | Cleanup database state |
| **Step Level** | Assertions & Exception/Count Asserts - *Category B / Multi-Case* | `"Always"` | `"_Continue"` | Default behavior is to continue execution on failed asserts |
| **Step Level** | Retrievals for Assertions - *Category B / Multi-Case* | `"Always"` | `"_Continue"` | Retrieve steps used to prepare downstream assertions |
| **Step Level** | All Object Actions (Create, Change, Delete, Persist, Asserts) - *Category A Unit Tests* | `"None"` | `"Stop"` | Default settings; do NOT call `SetExecutionSettingsOfTestStep` |
| **Step Level** | Browser Close (`Teardown_Playwright` & `Stop_MxFrontendTest`) | `"Always"` | `"_Continue"` | Standard browser teardown and close steps |

---

## 🚨 ROLLBACK DEFAULT CONFIGURATION RULE

1. **Global Default:** You **MUST** set `RollbackTcseAfterExecution` to `"No"` by default for all test cases (including Frontend UI tests, process tests, multi-case backend integration tests, and multi-app tests).
2. **The Only Exception (Backend Unit Tests):** You **MUST** set `RollbackTcseAfterExecution` to `"Yes"` **ONLY** when you are dealing with a **Backend Unit Test (a test consisting of a single microflow execution)**. For all other types of test cases, it must be set to `"No"`.
3. **🚨 Rollback UI Form Constraint (Why Case 3 Teardown is Mandatory):** Since Mendix UI form submissions commit to the database through the browser session (which runs in a separate client-side transaction than the server-side runner), database rollbacks set via `RollbackTcseAfterExecution = "Yes"` will **NOT** automatically roll back UI form entries. Therefore, Case 3 (Teardown) is **strictly mandatory** to clean up UI-created data, even if rollback is enabled.

---

## 🚨 CASCADING LAWS & CONFIGURATION RULES

1. **Boilerplate & Backend Data Actions "Always" Rule:**
   You **MUST** set the execution condition of **all boilerplate steps** as well as **all backend data actions** inside a Category B (Frontend) testcase to `"Always"` using `SetExecutionSettingsOfTestStep`. This guarantees setup/cleanup boundaries execute reliably, even if intermediate UI or validation steps in Case 2 fail.
2. **Options Object "Always" Requirement:**
   Any Playwright or Frontend testkit create options object teststeps (such as `LocalStartOptions`, `NewBrowserContextOptions`, `StartMxFrontendTestOptions`) **MUST** have their execution setting set to `"Always"` via `SetExecutionSettingsOfTestStep`.
3. **The Cascading Provider Law (Backward Execution Cascade):**
   If a teststep's execution condition is set to `"Always"`, **all providing teststeps** (those supplying inputs/parameters to it) in the same test suite **MUST** be set to `"Always"` as well. This cascades backward through the entire dependency chain in the test suite to prevent compilation and unbound parameter execution errors.
4. **The Cascading Consumer Law (Forward Skip Cascade):**
   If a teststep's execution condition is set to `"Skip"`, it cannot provide any output to receiving teststeps in the same test suite. Therefore, **all receiving teststeps** (consumers of its outputs/parameters) **MUST** be set to `"Skip"` as well. This cascades forward through the entire dependency chain in the test suite.
5. **The Cascading Test Case Skip Rule:**
   If a test case's execution condition is set to `"Skip"`, it does not run and cannot pass any outputs (such as an active browser context/session or newly created/modified records) to downstream test cases. Therefore, **all downstream test cases in the suite that depend on its outputs, browser session state, or database changes MUST also be set to `"Skip"`**. This cascades forward through the remaining test cases in the suite.
6. **Deprecation of Suite-Level Settings:**
   Test suite-level execution settings are deprecated and removed. You **MUST NOT** use or refer to any suite-level execution condition tools (such as `SetTestSuiteExecutionCondition`). All execution controls are handled strictly at the individual teststep level.
7. **Schema Requirements & Defaults for `SetExecutionSettingsOfTestStep`:**
   Because all four fields of `SetExecutionSettingsOfTestStep` are strictly marked `required` in the schema, you **MUST** provide all of them:
   - `TestStepKey`: The key of the target teststep.
   - `ExecutionCondition`: Default is `"None"` for standard steps, `"Always"` for boilerplate/backend data steps.
   - `ExecutionDelayInMs`: Numeric delay (set to `0` if no delay is desired).
   - `ResumeExecutionAfterException`: Default is `"Stop"` for standard interaction steps, and `"_Continue"` for boilerplate, backend data seeding/cleanup, assertions, and retrieve steps used for asserting (note the leading underscore!). Only configure assertions to stop execution upon failure when explicitly specified.

---

## 🚨 EXECUTION USERS & BACKEND SECURITY BOUNDARIES

MTA allows managing backend users and evaluating application security profiles at the database and transaction level. 

### 🔧 Backend Execution User Management

You can list and provision backend test users using the following MCP tools:
*   `GetExecutionUsers(ApplicationKey, TestConfigurationKey)`: Lists all configured backend execution users for an application and environment configuration.
*   `CreateExecutionUser(ApplicationKey, TestConfigurationKey, Username)`: Programmatically registers a new backend execution user.

### 🚨 CRITICAL DEPENDENCY: User Creation Before Test Case Creation

There is a strict, sequential dependency between the creation of backend execution users and test cases:
*   **Execution User Key Requirement:** The `CreateTestCase` tool requires a valid `ExecutionUserKey` as a mandatory input parameter.
*   **Sequential Ordering:** If there are no execution users configured (or if you need a new one), you **MUST** call `CreateExecutionUser` **first** to register the user and obtain its key.
*   **No Post-Creation Assignment:** It is impossible and invalid to create the test case first and then create the execution user. The execution user key must already exist at the moment of calling `CreateTestCase`.
*   **Workflow Sequence:**
    1. Call `GetExecutionUsers` to verify if a suitable execution user already exists.
    2. If no users are returned (or a new user is needed), call `CreateExecutionUser` to provision the new user and receive its key.
    3. Call `CreateTestCase` passing the verified/created `ExecutionUserKey` as a required parameter.

---

### 🚨 THE 5 RULES OF BACKEND VS. FRONTEND SECURITY

You **MUST** strictly adhere to the following architectural boundaries regarding security execution contexts:

1.  **Backend-Only Scope:** 
    Backend Execution Users are strictly restricted to backend database and transactional memory security evaluation.
2.  **Object Actions Only:** 
    Mendix entity-level and attribute-level security rules are checked *exclusively* on backend object action teststeps (`Create`, `Change`, `Delete`, `Persist`, `Retrieve`).
3.  **Required Activation Flag:** 
    Backend security is active *only* when the Test Case execution settings have `ApplySecurity` set to `"Yes"` via `SetExecutionSettingsOfTestCase`. If set to `"No"` (the global default), all database actions bypass security and run in System context.
4.  **Microflow Execution Bypass:** 
    Direct microflow execution teststeps (`CreateMicroflowCallTestStep`) execute in Mendix System context during MTA runs. They bypass backend test-level security constraints and are *never* restricted by backend execution users or `ApplySecurity` flags.
5.  **Complete Frontend UI Isolation:** 
    In Frontend tests, **all test cases (Case 1 Setup, Case 2 Execution, Case 3 Teardown) MUST use `MxAdmin` as the backend Execution User at the test case level**. The user that logs in via the login step (e.g. `Start_MxFrontend_Test_With_Login`) in Case 2 is strictly the frontend user executing the test in the browser. Apply Security (`ApplySecurityExecutor`) is set to `"NONE"` at the test case level.
