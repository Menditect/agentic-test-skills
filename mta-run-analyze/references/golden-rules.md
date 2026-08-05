# MTA Golden Rules & Test Design Manual
**📍 You are here:** `references/golden-rules.md` | **🏠 Return to:** [MTA Core Skill](../SKILL.md)
*Metadata: Version 1.0 | Last Updated: 2026-06-30*

---

This manual contains the detailed Golden Rules, zero-data naming templates, options/piping placement guidelines, dynamic piping patterns, and industry-standard test automation alignments for Menditect Test Automation (MTA).

---

## 🏆 THE GOLDEN RULES of MTA TEST CONSTRUCTION

### 1. The Predecessor Chaining Law (Forward Chaining)
To prevent step, case, or suite sequence corruption, elements must be created in chronological forward order:
*   **The Predecessor 0 Rule (First Element in Empty Container):** For the absolute first element (step, case, or suite) in an empty container (empty testcase, empty suite, or empty test configuration), you **MUST** pass `0` for the predecessor parameter (`TestStepBeforeKey`, `TestCaseBeforeKey`, or `TestSuiteBeforeKey`) in the tool call. This explicitly indicates to the MTA backend that the element should be placed at the absolute beginning.
*   **The Non-Empty Container Predecessor Sub-Rule (Subsequent Elements):** For non-empty suites, cases, or configurations, you **MUST** first query the existing elements (via `GetTestCases`, `GetTestSteps`, or `GetTestSuites`) to retrieve the last element's key, using it as the predecessor key to append chronologically. For subsequent elements created within the same turn cycle, you MUST use the actual non-zero numeric key returned by their immediate predecessor to chain them forward chronologically (e.g., Step B uses Step A's returned key as `TestStepBeforeKey`).

```
Create Step A ──► TestStepBeforeKey = 0                      (KeyA returned)
Create Step B ──► TestStepBeforeKey = KeyA                 (KeyB returned. B correctly chained to A)
Create Step C ──► TestStepBeforeKey = KeyB                 (KeyC returned. C correctly chained to B)
```

*   **🚨 THE SEQUENTIAL BATCHING BAN (NO PARALLEL CREATION):** You are strictly prohibited from batching multiple sequential element creation calls (such as creating steps N, N+1, N+2) in a single turn. 
    *   *Why this fails:* Downstream keys do not exist until the server processes their predecessors. Batching multiple sequential creation calls in parallel causes them all to use the same existing `BeforeKey` (or attempt to reference keys that do not exist yet), corrupting the sequence.
    *   *The Correct Procedure:* You **MUST** execute creation calls one by one, waiting for the server's response to retrieve the Key of element N before using it as the `BeforeKey` of element N+1.
    *   *Explicit Server-Side Bans (Red Lines - DO NOT RUN IN PARALLEL):*
        *   **Creation Tools:** Concurrent and parallel execution of step creation tools (e.g., `CreateMicroflowCallTestStep`, `CreateTestStepCreateObject`, etc.) within the **same parent Test Case** is physically blocked by the server and will result in write collisions and sequencing corruption.
        *   **Sequencing Tool:** Concurrent and parallel execution of `SetSequenceOfTestStep` for teststeps in the **same parent Test Suite** is physically blocked by the server.
*   **⚡ THE MAXIMUM PARALLELIZATION PROTOCOL (CONCURRENCY LAW):**
    To optimize performance, minimize execution latency, and reduce the number of conversation turns, you **MUST** run all tools that are permitted to run in parallel as much as possible in parallel. Do not execute them sequentially when concurrent execution is supported.
    *   **1. Scan Phase & Design Phase Tools (MANDATORY Parallelization):**
        *   All read-only lookup, scanning, and discovery tools are completely independent and MUST be executed in parallel during the discovery, placement, and planning phases.
        *   *Parallel Candidates:* `GetPages`, `GetWidgets`, `GetTestSuites`, `GetTestCases`, `GetTestConfigurationsForApplicationKey`, `GetApplicationByName`.
        *   *Actionable Example:* If you need to analyze a page structure and retrieve its widgets, do NOT make separate turns. You MUST invoke `GetPages` and `GetWidgets` in parallel in the same turn.
    *   **2. Independent Write & Configuration Operations (MANDATORY Parallelization):**
        *   Operations that modify independent objects, setup data variations, or configure independent settings do not have predecessor dependencies and MUST be parallelized.
        *   *Parallel Candidates:*
            *   Adding variation items: Calling `AddAttributeValueAsVariationItem` for multiple attributes/values.
            *   Duplicating variations: Calling `DuplicateTestCaseDataVariation` for different test cases/variations.
            *   Configuring execution settings of different steps or test cases: Calling `SetExecutionSettingsOfTestStep` or `SetExecutionSettingsOfTestCase` across separate targets.
            *   Setting metadata: Calling `SetTestStepNameDescription`, `TestCaseDataVariationName`, or `TestCaseDataVariationDescription` on independent entities.
*   **🚨 THE `SetSequenceOfTestStep` SAFEGUARDS:** When using this tool to manually update step sequences, you MUST adhere to three strict safety gates:
    1.  *Same-Case Validation:* Both `TestStepKey` and `TestStepBeforeKey` MUST reside within the exact same parent Test Case. Linking across case boundaries is strictly prohibited.
    2.  *No Self-Reference or Loops:* Never pass the same key for both parameters, and never point a step's predecessor to a downstream step (which creates circular references and crashes the runner).
    3.  *First-Position Sequencing Pattern:* To sequence an existing teststep to the absolute first position of a testcase, call `SetSequenceOfTestStep` with the target `TestStepKey` and pass `0` for the `TestStepBeforeKey` parameter.
*   **🚨 THE `SetSequenceOfTestCase` SAFEGUARDS:** When sequencing test cases within a test suite:
    1.  *First-Position Pattern:* Symmetrically, to sequence a testcase to the absolute first position of a suite, call `SetSequenceOfTestCase` with the target `TestCaseKey` and pass `0` for `TestCaseBeforeKey`.
    2.  *Chaining Subsequent Cases:* To sequence a case elsewhere, pass the immediate predecessor `TestCaseBeforeKey` representing the case that should directly precede it.
    3.  *Validation constraints:* Both cases must reside in the exact same parent Test Suite. Self-references or circular references are strictly prohibited.
*   **🚨 THE `SetSequenceOfTestSuite` SAFEGUARDS:** When sequencing test suites within a Test Configuration:
    1.  *First-Position Pattern:* To sequence a test suite to the absolute first position of a Test Configuration, call `SetSequenceOfTestSuite` with the target `TestSuiteKey` and pass `0` for `TestSuiteBeforeKey`.
    2.  *Chaining Subsequent Suites:* To sequence a suite elsewhere, pass the immediate predecessor `TestSuiteBeforeKey` representing the suite that should directly precede it.
    3.  *Validation constraints:* Both suites must reside in the exact same parent Test Configuration. Self-references or circular references are strictly prohibited.
*   **🔄 THE TEST STEP REORGANIZATION RULE (`MoveTestStepToOtherTestCase`):**
    When refactoring sequence structures (e.g., separating UI steps into modular setup or teardown test cases), you can relocate a teststep to a different testcase in the same suite:
    1.  *Syntax:* Call `MoveTestStepToOtherTestCase(TestStepKey, TargetTestCaseKey, TestStepBeforeKey)`.
    2.  *Target Placement:* Use the `TestStepBeforeKey` parameter to specify where inside the destination testcase the step should reside. Symmetrically, to place the moved step at the absolute beginning of the target testcase, pass `0` for `TestStepBeforeKey` in the tool call.
    3.  *Validation:* After moving, always run lookups (such as `GetTestSteps`) to verify that the predecessor and successor sequences in both source and target cases are intact.
*   **🚨 THE MANUAL INTERVENTION HIGHLIGHT PROTOCOL (`SetHighlightOfTestStep`):** When you cannot fully automate a step as planned due to system limitations, lack of tool support, or because manual configuration is required, you MUST implement a placeholder step, highlight it to make it stand out (the official highlight/mark color is **blue**), and suggest manual finishing.
    *   *Lack of Tool Support (Configuration Deletions):* Since deleting Test Cases, Test Steps, or Test Suites inside the MTA configuration itself is not supported by the MCP server for safety and auditability reasons, any placeholder step that you wish to propose for deletion must be highlighted in **blue** and documented for the user to delete manually inside the MTA UI.
    *   *AUT Database Object Deletions (Fully Supported):* Note that deleting database records/objects in the App Under Test (AUT) during test execution is fully supported via the `CreateTestStepDeleteObject` tool and does NOT require manual highlights.
    *   *Custom / Complex Steps:* For complex interactions or widgets that cannot be automated with the current toolkit, create a placeholder step, highlight it in **blue**, and clearly direct the user to manually finish it in the MTA UI.
    *   *User-Prompted Highlights:* Of course, if the user explicitly prompts you to highlight specific teststeps, always execute `SetHighlightOfTestStep(Highlight=true)` on those steps to mark them in **blue**.

---

### 2. Zero Data in Step Names
You **MUST NOT** mention the actual data values used (such as a specific username, password, order ID, status value, or country name) anywhere in the name of a teststep. Step names must describe *what* the step does functionally, not *which data value* it utilizes. Keeping data values out of step names is critical for test maintainability, clarity, and enabling data variations.

All step names must follow this structured template:
`[Action] [WidgetType] '[FieldDescriptor]' [Input/Button]`

| ❌ Bad Name (Fails Zero-Data Law) | ✅ Good Name (Passes Auto-Validator) |
| :--- | :--- |
| `"Fill Username with Admin"` | `"Fill TextBox 'Username' Input"` |
| `"Click Checkout for Order #1234"` | `"Click ActionButton 'Checkout' Button"` |
| `"Assert Status is Active"` | `"Assert Label 'Status' Text"` |
| `"Select Country 'Netherlands'"` | `"Select DropDown 'Country' Select"` |
| `"Create Customer John Doe"` | `"Create Customer Object"` |
| `"Set AccountCode to ACC-001"` | `"Set Attribute 'AccountCode' Value"` |

---

### 3. The Options & Parameter Placement Protocol & Proactive Output Piping
All object creation, attribute configuration, and object retrieval steps used as parameters **MUST ALWAYS** be placed chronologically *before* the teststep that calls the consuming microflow.
*   **The Flow:** `Create Object` ➔ `Include Attribute` ➔ `Set Attribute Value` ➔ `Create Microflow Call Step` ➔ `Link to Microflow Parameter`.

```
[Create Option Step] (BeforeKey = predecessor) ➔ [Include Attribute Step] (BeforeKey = OptionStep) ➔ [Set Value Step] (BeforeKey = IncludeStep) ➔ [Consuming Microflow Step] (BeforeKey = SetValueStep) ➔ Link parameter to Option Output.
```

*   **🚨 Proactive Output Piping Rule:** You **MUST** proactively pipe outputs from preceding teststeps (such as a returned object/locator from a Create, Retrieve, or Microflow execution step) into subsequent teststep inputs (such as a Change, Delete, or Microflow Parameter input) rather than repeating database queries or hardcoding static values. 
    - **Maintainability Piping for Static Attributes (HIGHLY RECOMMENDED):** To maximize test maintenance, prioritize using scalar piping (`SelectValueForValue`) even for static attributes (such as default usernames, test emails, or numeric thresholds). Instead of hardcoding the same static value across multiple teststeps, define the static value once in a single, early teststep (acting as a "Single Source of Truth") and pipe it downstream. If the value ever needs to change, it is modified in exactly one place and automatically propagates everywhere.
    - Use the target select object binders (`SetTestStepOutputForSelectObjectForChange`, `SetTestStepOutputForSelectObjectForDelete`, `SetTestStepOutputForSelectObjectForRetrieve`, or `SetTestStepOutputForSelectObjectForMicroflowParameter`) to programmatically link memory objects.
    - Link primitive values and dynamic attributes dynamically using `SetInputTypeAttributeValueToTeststep` or `SetInputTypeMicroflowParameterValueToTeststep`.
    - Memory-based piping is the primary, most robust way to reference records in MTA; querying the database should only be used as a fallback if memory references are unavailable.

#### 💡 Test Maintenance & Variable Piping Best Practices
To guarantee that generated test suites remain highly maintainable, resilient to database changes, and scalable over time, always apply the following four core maintenance design patterns:

1.  **Static Configuration Centralization (Single Source of Truth):**
    *   **Problem:** Hardcoding the same static parameters (e.g., test email domains, default thresholds, tax rates, standard timeouts) inside multiple teststeps leads to high modification costs when those defaults change.
    *   **Best Practice:** Define these static parameters *once* at the very beginning of the Test Suite/Case in a single step (e.g., executing a constant-return microflow or setting a variable) and use **Scalar Piping** (`SelectValueForValue`) to pipe them downstream to all consuming steps.
2.  **Decoupled Dynamic Assertions (Zero-Hardcoding in Verifications):**
    *   **Problem:** Verifying UI or backend state using hardcoded values (e.g., asserting that a confirmation page contains `"Order 10564"` or a grid row matches `"Jane Doe"`) breaks immediately if data seeding or execution sequences vary.
    *   **Best Practice:** Always pipe generated attributes dynamically. Retrieve or capture the generated entity upstream (the provider step), extract the relevant attribute (e.g., `OrderNumber`, `FullName`), and pipe it directly as the expected value in the downstream assertion step (`ASR_Contains_Text`, `ASR_Has_Value`).
3.  **Memory over Database Retrieval (Token & Query Efficiency):**
    *   **Problem:** Querying the database repeatedly to find the same record within a single Test Case introduces query overhead and increases locator/state fragility.
    *   **Best Practice:** Keep objects in memory. Capture the output key (`TestStepOutputKey`) of the initial Creation or Retrieve step and proactively pipe that memory reference (`SetTestStepOutputForSelectObject...`) to all downstream Change, Delete, Persist, or Microflow Parameter steps.
4.  **Modular Setup & Teardown Isolation:**
    *   **Problem:** Putting data seeding, environmental configuration, and cleanup steps directly inside main execution cases makes tests cluttered, long, and extremely difficult to debug.
    *   **Best Practice:** Isolate setup/teardown actions in dedicated Test Cases (e.g., Case 1: Setup, Case 3: Teardown). Use global suite-level variables to carry essential identifiers (like generated keys or security tokens) between cases, keeping the core transaction flow clean and modular.

#### 🛠️ Industry-Standard Test Automation Alignment
To ensure your MTA test suite adheres to world-class QA engineering practices (such as those seen in Playwright, Cypress, and Selenium), incorporate the following alignment strategies:

1.  **Page Object Model (POM) Equivalent (Locator Modularization):**
    *   **Industry Standard:** In frameworks like Playwright, POM centralizes element selectors and page interactions into reusable classes (e.g., `LoginPage.login(user, pass)`) to abstract raw selectors from test logic.
    *   **MTA Alignment:** Emulate POM in MTA using **Modular Locator Step Structures**. Instead of repeating complex widget selectors across multiple steps, define a single locator step (e.g., `MxPageLocator` or container-specific `ParentContext` locator) at the start of a page sequence. Use **Proactive Output Piping** to link that locator's output to all subsequent interaction steps (click, fill, select). If a widget or page structure changes, modifying the single locator step repairs the entire suite, preventing locator duplication.
2.  **Native Auto-Waiting (Smart Waits vs. Flaky Sleeps):**
    *   **Industry Standard:** Modern UI testing frameworks eliminate fragile hardcoded delays (`Thread.sleep()`) in favor of dynamic "Smart Waits" (implicitly waiting for elements to be attached, visible, stable, and interactive).
    *   **MTA Alignment:** Strictly leverage MTA's Playwright-backed **Implicit Auto-Waiting** and standard assertion timeouts. **Never** insert arbitrary pause/sleep actions to handle slow page transitions. If a test is failing due to timing, configure standard step timeouts or assert that a transitional boundary has occurred first (e.g., verify that a progress bar is hidden or a target element `ASR_Is_Visible` before proceeding).
3.  **Negative & Validation Testing (Error Path Verification):**
    *   **Industry Standard:** Quality assurance best practices mandate thorough validation of error paths, boundary limits, and edge cases to ensure applications fail gracefully.
    *   **MTA Alignment:** Design robust **Negative Validation Steps** for Mendix form submissions. When testing invalid inputs, do not simply verify that the form did not submit. Explicitly assert the presence of **Validation Feedbacks** (`VALIDATION FEEDBACK` triggers on specific input widgets) and verify warning dialog headers and body text using `Locate_MxWidget_Dialog` combined with `ASR_Has_Text_Dialog_Body` to guarantee precise client-side error handling.
4.  **Test Case Idempotency & Lifecycle-Based Data Cleanup:**
    *   **Industry Standard:** Tests must be idempotent (runnable in any order, repeatedly, concurrently, or in isolation) without leaving leftover "dirty data" that pollutes the database or causes cascading test failures.
        *   **Category B (Frontend) Session Isolation Seeding and Cleanup Strategy:** Because the backend runner transaction session and the browser Playwright session are completely unshared, you **MUST** apply these strict rules to split data lifecycles across Case 1, Case 2, and Case 3:
            1. **Case 1 Setup (Seeding):** Create all required setup data at the end of Case 1 (Setup) and commit it with a single `Persist` step. This ensures the data is written to the database and is fully visible to the browser before the frontend session starts in Case 2.
            2. **Case 2 Execution (UI Cleanup):** If the browser UI actions in Case 2 commit new records to the database (e.g. submitting a form), you **MUST** retrieve, delete, and commit those UI-created objects inside Case 2 itself, right before it exits.
               * *Query filter context:* When retrieving UI-created objects, you **MUST** analyze as much context as possible (e.g. matching a unique reference code, generated string, email, or associated parent key generated earlier in the script) to construct a precise, robust query filter.
               * *Execution settings:* These Case 2 cleanup steps (Retrieve, Delete, and Persist) **MUST** have `ExecutionCondition = "Always"` and `ResumeExecutionAfterException = "_Continue"` so they run reliably even if prior UI interactions or assertions fail.
            3. **Case 3 Teardown (Setup Cleanup):** Delete all Case 1 seeded setup data inside Case 3 (Teardown). To perform this efficiently, use cross-case step output piping to bind Case 3's `Delete Object` steps directly to Case 1's `Create Object` step keys (using `TestStepOutputKey`).
            4. **Multi-Case Suites:** If there are multiple execution cases between Setup and Teardown, consolidate all setup data seeding in Case 1, consolidate all setup teardown in Case N, and let each intermediate case clean up its own UI-created data locally. Ensure seeded data for different testcases is isolated and uniquely prefixed to maintain test idempotency.
        *   **🚨 THE "START-AND-STOP FIRST" BOILERPLATE CREATION RULE (Category B):** 
            *   To prevent forgetting to set the execution condition of crucial boundary steps, you **MUST** create the starting session step (e.g., `Start_MxFrontend_Test_With_Login` or `Start_MxFrontend_Test_Without_Login`) and the stopping session step (`Stop_MxFrontendTest`) **FIRST** before creating any other UI interaction or assertion steps inside a Category B (Frontend) execution test case.
            *   **Immediate Configuration:** Immediately upon creation, both steps **MUST** be explicitly configured with:
                *   `ExecutionCondition` = `"Always"`
                *   `ResumeExecutionAfterException` = `"_Continue"`
                *(using `SetExecutionSettingsOfTestStep`).*
            *   **Sequential Insertion:** All subsequent UI actions (clicks, fills, etc.) and assertions are then built chronologically and inserted/sequenced **between** the start and stop steps.
            *   **Rationale:** Creating these steps first guarantees that the frontend session is always correctly initiated and closed (preventing hanging/orphaned browser sessions even under UI failures), and eliminates the risk of forgetting to set their execution conditions to `"Always"`.
        *   **🚨 The Persist Rule (Separate Sessions & Single Persist Batching):** Because the backend technical runner's session and the frontend browser session are completely unshared, the browser *cannot* see backend-seeded data unless it is written to the database. Therefore:
            1.  **For Seeding:** You **MUST** call a single `Persist` step immediately after your seeding block to write the data to the database.
            2.  **For Teardown / Cleanup:** You **MUST** call a single `Persist` step immediately after your deletion block to commit the deletions (this applies to Case 1 Setup data seeding, Case 2 UI cleanup deletions, and Case 3 Teardown deletions).
            3.  **🚫 STRICT PROHIBITION (No Per-Step Persisting):** When creating or deleting **multiple objects** in a single test case, you are **strictly prohibited** from placing a `Persist` step after every individual `Create` or `Delete` step. Instead, group all memory creations/deletions together and execute a **single `Persist` step at the very end of the entire block**. Adding redundant `Persist` steps increases database write overhead, clutters the test design, and is a major quality violation.
        *   **Backend-First Execution:** **ALWAYS** use MTA's backend features (e.g., Create, Persist, Delete, or Microflow calls) rather than UI-based forms or delete buttons to seed and clean up test data. This is faster, more robust, and completely bypasses frontend fragility.
        *   **Static Master Data Strategy:** Static data that is read but not modified by tests should ideally **not** be seeded and torn down in every execution case. Instead, manage it in a dedicated **Master Data Test Suite** that seeds the environment once at the start of the configuration and tears it down at the end. In individual verification cases, simply retrieve this master data from the database as required (e.g., using a retrieve step) inside the verification testcase.
            *   **🚨 THE PRE-EXISTING DATA PROHIBITION (NO BACKUP DEPENDENCIES):** You are **strictly prohibited** from proposing, allowing, or retrieving database data that was neither dynamically created within the active test case nor seeded by an active Master Data suite in the same test run. Relying on pre-existing records (such as data pre-populated on the environment or restored from a Mendix database backup) is a severe anti-pattern that creates a hard environment lock and **prohibits the portability of tests** across different application instances, cloud nodes, developers' local environments, or sandbox containers.
                *   *Fallback Workaround:* If the user insists on retrieving pre-existing data, propose using the MTA feature called **Create Object By App Instance**. This allows the user to dynamically create objects based on existing objects in a connected app instance. Explicitly notify the user that **this feature is not yet available as an MCP tool**, so they must configure it manually in the MTA Web UI.
            *   *Fallback Interactive Design Query:* If no static master data test suite is available or configured, you **MUST** ask the user during the test design phase (`STATE_SPEC_APPROVAL` or `STATE_BUILD_PLANNING`) whether they want to:
                1. Draft/create a dedicated Master Data Test Suite to seed these static records.
                2. Or use the current Test Suite's Setup (Case 1) and Teardown (Case 3) test cases to take care of seeding and cleaning of static master data alongside dynamic data. (Note: Many users prefer this self-contained option for simpler test suites).

---

### 4. The Test Case Session & Transaction Boundary Law
*   **Isolated Sessions:** Each test case sets up its own distinct user session. Consequently, objects kept in memory can **ONLY** be used or retrieved within the same test case.
*   **State Passing via DB:** If you need to pass objects or session state from one test case to another downstream case, the object **MUST** be written and stored in the database (use a `persist` teststep where needed).
*   **Commit Simplification:** If a microflow explicitly commits an object to the database, a separate `persist` teststep is **NOT** required.
*   **Database Rollbacks & Transaction Boundaries:**
    *   If rollback is enabled (`RollbackTcseAfterExecution = "Yes"`), all database commits made during that test case execution are automatically rolled back.
    *   This database rollback includes commits made by executed microflows.
    *   **🚨 Java Action Exception (No Rollback):** The ONLY exception is when a microflow executes Java Actions that explicitly start or stop transactions (such as `start transaction` or `stop transaction`). These actions create a new database context that bypasses the MTA transaction wrapper, meaning any commits within them **will NOT be rolled back** by MTA.
    *   **🚨 Frontend UI Session Commits (No Rollback):** Database rollbacks **only** affect transactions initiated directly by the backend technical runner's teststep execution. Any commits performed client-side by user interactions in the web browser (e.g., typing into form fields and clicking a UI "Save" button that triggers a browser-side commit) run in a completely separate user session/database context and **will NOT be rolled back** by MTA. Therefore, you must always explicitly delete browser-created records in your Teardown testcase using backend-first delete steps.

---

### 5. Retrieve-for-Asserting & Assertion Failure Default Laws (Aesthetics & Robustness)

*   **🚨 Retrieve for Assertions Law (Strict Dynamic Filtering Preference):**
    When constructing a retrieve teststep for asserting or verifying data, you **MUST** adhere to these constraints:
    1.  **Piped Filters Only (Highly Preferred):** Prioritize using attribute filters that can be dynamically piped/linked from preceding teststeps (using the `SelectValueForValue` scalar piping pattern).
    2.  **Hardcoded Filters Restriction:** Hardcoded or static filters on retrieve steps are **strictly restricted** and **only allowed as a last-resort fallback** if no other option exists.
    3.  **Avoid `"Head"`, retrieve `"All"`:** Avoid setting `RetrieveSet = "Head"` on assert retrieves. Always configure the retrieve set to `"All"`.
    4.  **Downstream Object Count Assertion:** To check for object existence or correct record count, couple the `"All"` retrieve with an `AssertObjectCount` step downstream to programmatically verify the returned count (e.g., asserting that the list size is exactly `1`).
*   **🚨 Default Assertion Failure Law (Continue on Failure):**
    To ensure comprehensive error reporting across test runs, the default execution behavior on any assertion failure is to **continue execution** rather than stopping:
    1.  **Standard Teststep execution:** For standard assertions and retrieve steps used for assertions, set `ResumeExecutionAfterException` to `"_Continue"` (using `SetExecutionSettingsOfTeststep`).
    2.  **Assertion Tool settings:** For assertion property configurations (such as `CreateAssertMicroflowReturnValue`, `SetAssertExceptionProperties`, `SetAssertObjectCountProperties`), default the action failed assertion parameter (`ASRT_ActionFailedAssert` / `ActionFailedAssert`) to `"ContinueTestRun"`.
    3.  **Bypass/Stop Override:** Only configure assertions to stop execution upon failure (`"Stop"` or `"StopTestRun"`) when explicitly requested in the prompt or by the user.
