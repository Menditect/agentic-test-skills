# 📖 Menditect Test Automation (MTA) Patterns & Anti-Patterns Reference Guide
**📍 Location:** .agent/skills/mta-shared/references/mta_patterns_and_antipatterns_descriptions.md  
**🏠 Return to:** [MTA Test Design Skill](../../mta-test-design/SKILL.md) | [MTA Build Skill](../../mta-build/SKILL.md) | [MTA Run & Analyze Skill](../../mta-run-analyze/SKILL.md) | [Patterns Reference Index](mta-patterns-and-antipatterns-reference.md)  
*Metadata: Version 2.2.0 | Primary Audience: AI Coding Assistant (Antigravity, MAIA, Subagents)*

This document provides a comprehensive analysis and detailed description of all **55 Patterns (PAT-01 through PAT-55)** and **14 Anti-Patterns (ANTI-01 through ANTI-14)** used in Menditect Test Automation (MTA).

For each rule, this document outlines its scope, category, detailed operational description, core purpose, and explicit relationships to other patterns and anti-patterns.

---

## 🏛️ Domain A: Scoping, Test Typology & Risk Architecture

### `PAT-01`: MTF Testing Pyramid Alignment
* **Scope:** General | **Classification:** Methodological Law
* **Description:** This pattern is based on the Menditect Testability Framework (MTF). It establishes test scoping based on Mendix microflow naming conventions and architecture layers. Microflows prefixed with `VAL_` (validations), `RULE_` (business rules), or `FTN_` (functions) are classified as Backend Unit tests. Microflows prefixed with `ORC_` (orchestrations) or `CMT_` (commit wrappers) are tested as Integration tests. UI pages and `ACT_` microflows triggered by UI events are tested at the UI level. This pattern ensures tests are implemented at the lowest possible layer of the testing pyramid. Microflows that do not have a prefix are unclassified, however, their name, documentation and contents can reveal their function in the app.
* **Related Rules:**
  * **Counterpart Anti-Pattern:** `ANTI-02` ("Ice Cream Cone" Heavy UI Testing) — `PAT-01` actively prevents pushing unit-level business logic tests up into slow UI tests.
  * **Related Patterns:** `PAT-25` (Low-Code "What Not to Test"), `PAT-38` (Data-Risk Centric Prioritization).

---

### `PAT-02`: Dual Technical & Business Risk Alignment
* **Scope:** General | **Classification:** Methodological Law
* **Description:** Requires every test specification to explicitly define both technical risk (e.g., database concurrency, transaction integrity, unhandled null pointers) and business risk (e.g., financial calculation errors, unauthorized data access, regulatory non-compliance).
* **Related Rules:**
  * **Related Patterns:** `PAT-01` (MTF Pyramid Alignment), `PAT-38` (Data-Risk Centric Prioritization), `PAT-39` (Intended Use & Purpose Verification).

---

### `PAT-25`: Low-Code "What Not to Test" Guardrail
* **Scope:** General | **Classification:** Methodological Law
* **Description:** Prohibits creating test cases to verify standard Mendix framework capabilities, such as whether Mendix commits an entity at the end of a microflow when specified, or whether Atlas UI layout grids render HTML containers. Testing efforts must focus strictly on custom application logic, expressions, integrations and UI behaviour.
* **Related Rules:**
  * **Counterpart Anti-Pattern:** `ANTI-09` (Native Mendix Platform Testing) — `PAT-25` is the direct guardrail against `ANTI-09`.
  * **Related Patterns:** `PAT-01` (MTF Pyramid Alignment).

---

### `PAT-26`: Untestable Component Escape Hatch & MTF Refactoring
* **Scope:** Backend | **Classification:** Methodological Law
* **Description:** Provides a structured resolution path when encountering complex or tightly coupled microflows (e.g., microflows combining UI web actions, external web services, and DB updates in a single block). It recommends refactoring the Mendix model according to Menditect Testability Framework (MTF) principles (separating logic into sub-microflows) or falling back gracefully to best-effort happy path testing without halting test generation. 
* **Related Rules:**
  * **Related Patterns:** `PAT-01` (MTF Pyramid Alignment), `PAT-04` (Void Microflow Complexity Audit).

---

### `PAT-37`: Proactive MTA Value Enlightenment
* **Scope:** General | **Classification:** Methodological Law
* **Description:** Mandates articulating the explicit advantages of MTA (such as low-code model inspection, automatic database rollback, model coverage analytics, and upgrade DOM resilience) if a user suggests using standard open-source UI frameworks (like raw Selenium or generic Playwright) for Mendix applications.
* **Related Rules:**
  * **Related Patterns:** `PAT-05` (Menditect Frontend Testkit Strict Default).

---

### `PAT-38`: Data-Risk Centric Prioritization
* **Scope:** General | **Classification:** Methodological Law
* **Description:** Scopes and prioritizes test suite creation starting from core Domain Model entities with high business impact (e.g., Financial Invoices, User Permissions) and identifies all microflows that mutate those entities.
* **Related Rules:**
  * **Related Patterns:** `PAT-01` (MTF Pyramid Alignment), `PAT-02` (Dual Risk Alignment).

---

### `PAT-39`: Intended Use & Purpose Verification
* **Scope:** General | **Classification:** Methodological Law
* **Description:** Ensures functional test requirements align with overarching business workflows before step generation. If user stories or core app intents are ambiguous, the test designer MUST HALT to request clarification rather than making assumptions.
* **Related Rules:**
  * **Related Patterns:** `PAT-02` (Dual Technical & Business Risk Alignment), `PAT-51` (No Conversational Refusal Protocol).

---

### `ANTI-02`: "Ice Cream Cone" Heavy UI Testing
* **Scope:** General | **Classification:** Methodological Anti-Pattern
* **Description:** The anti-pattern of writing heavy UI browser tests for pure business logic, calculations, or validations that could be tested faster, more reliably, and headlessly at the Backend Unit or Integration level.
* **Related Rules:**
  * **Direct Counterpart Pattern:** `PAT-01` (MTF Testing Pyramid Alignment).
  * **Related Anti-Patterns:** `ANTI-09` (Native Mendix Platform Testing).

---

### `ANTI-09`: Native Mendix Platform Testing
* **Scope:** General | **Classification:** Methodological Anti-Pattern
* **Description:** The anti-pattern of creating test cases to verify built-in Mendix runtime mechanisms (e.g., verifying that a required field attribute validation prevents form submission at the framework level) rather than testing application-specific microflows and custom rules.
* **Related Rules:**
  * **Direct Counterpart Pattern:** `PAT-25` (Low-Code "What Not to Test" Guardrail).

---

## 📦 Domain B: Object Lifecycle, Database & Step Chaining Laws

### `PAT-06`: Direct Attribute & Association Initialization on Create Object
* **Scope:** General | **Classification:** Methodological Law
* **Description:** Mandates setting all initial entity attributes and association references directly within the parameters of the `Create Object` test step (`CreateTestStepCreateObject`). Prohibits generating a separate `Change Object` step immediately after a `Create Object` step to set initial values.
* **Related Rules:**
  * **Direct Counterpart Anti-Pattern:** `ANTI-01` (Separate `Change Object` Step After `Create Object`).
  * **Related Patterns:** `PAT-14` (Prohibition of Embedded Asserts on Create/Change), `PAT-21` (Single Persist Batching Law).

---

### `PAT-08`: Retrieve / Microflow Output Object Count Assertion
* **Scope:** General | **Classification:** Methodological Law
* **Description:** Requires inserting an `Assert Object Count` step immediately following any `Retrieve Object from database` step or `Microflow Call` step that produces an object/list, before using that handle in downstream steps. This guarantees that expected objects exist prior to attribute assertion or parameter passing.
* **Related Rules:**
  * **Direct Counterpart Anti-Pattern:** `ANTI-03` (Unasserted Retrieve / Microflow Output Consumer Piping).
  * **Related Anti-Patterns:** `ANTI-06` (Asserting Object Count after `Create Object` — which is invalid because created objects in-memory are guaranteed to exist).
  * **Related Patterns:** `PAT-31` (Retrieve-for-Asserting Set & Count Law).

---

### `PAT-09`: Backend-First Delete Pattern
* **Scope:** Frontend | **Classification:** Methodological Law
* **Description:** Cleanup in frontend tests is faster via backend teststeps. To delete an object that is created as as result of frontend actions, a `Retrieve Object from database` step must first be executed to fetch the target entity instance into memory, and its output handle is then passed into the `Delete Object` test step.
* **Related Rules:**
  * **Related Patterns:** `PAT-08` (Retrieve Object Count Assertion), `PAT-21` (Single Persist Batching Law).

---

### `PAT-11`: Predecessor Forward Chaining Law
* **Scope:** General | **Classification:** Platform API Quirk
* **Description:** Dictates that when creating test steps sequentially via MTA MCP tools, each step must pass the non-zero database key returned by the immediately preceding step as its `TestStepBeforeKey` parameter to ensure strict chronological ordering (for piping) in the MTA database.
* **Related Rules:**
  * **Related Patterns:** `PAT-15` (The Predecessor `0` Rule), `PAT-16` (Sequential Step Execution Ban).
  * **Direct Counterpart Anti-Pattern:** `ANTI-05` (Parallel / Batched Creation in Same Container).

---

### `PAT-12`: Test Step Description Pattern Annotation
* **Scope:** General | **Classification:** Methodological Law
* **Description:** Mandates documenting the design rationale for each step by writing standard pattern annotation tags (e.g. `[Pattern: Direct Initialization on Create Object [^PAT-06] - Rationale...]`) into the step's `Description` field using `SetTestStepNameDescription`.
* **Related Rules:**
  * **Related Patterns:** `PAT-34` (Uniform 8-Field Step Sequence Schema), `PAT-55` (Zero Data in Step Names).

---

### `PAT-14`: Prohibition of Embedded Asserts on Create/Change Object Steps
* **Scope:** General | **Classification:** Methodological Law
* **Description:** Prohibits setting embedded attribute assertion comparisons on `Create Object` or `Change Object` test steps. Initial and changed attribute values on these steps represent state mutations, not assertions. Assertions must be placed on downstream `Retrieve Object`, `Microflow Call`, or UI assertion steps.
* **Related Rules:**
  * **Direct Counterpart Anti-Pattern:** `ANTI-10` (Embedded Assertions on Create/Change Object Steps).
  * **Related Patterns:** `PAT-06` (Direct Initialization on Create Object).

---

### `PAT-15`: The Predecessor `0` Rule
* **Scope:** General | **Classification:** Platform API Quirk
* **Description:** Specifies that passing `0` for `TestStepBeforeKey`, `TestCaseBeforeKey`, or `TestSuiteBeforeKey` forces the MTA server to place the newly created element at the absolute top (first position) of its parent container.
* **Related Rules:**
  * **Related Patterns:** `PAT-11` (Predecessor Forward Chaining Law).

---

### `PAT-16`: Sequential Step Execution Ban
* **Scope:** General | **Classification:** Platform API Quirk
* **Description:** Prohibits invoking multiple mutating MTA tool calls in parallel or asynchronously within the same parent container. All step creation tool calls must be executed sequentially, waiting for the predecessor key returned by the server to allow chaining of teststeps.
* **Related Rules:**
  * **Direct Counterpart Anti-Pattern:** `ANTI-05` (Parallel / Batched Creation in Same Container).
  * **Related Patterns:** `PAT-11` (Predecessor Forward Chaining Law).

---

### `PAT-20`: Unshared Session Architecture & Mandatory Persist Rule
* **Scope:** Frontend | **Classification:** Platform Execution Law
* **Description:** Accounts for MTA's architecture where backend test setup execution and browser UI test execution run in separate database sessions. Data created during setup in Case 1 must be committed using an explicit `Persist` step so it becomes visible to the Playwright browser session in Case 2.
* **Related Rules:**
  * **Related Patterns:** `PAT-03` (Frontend 3-Case Split Law), `PAT-21` (Single Persist Batching Law), `PAT-22` (Frontend UI Commits Bypass Automatic Rollback).

---

### `PAT-21`: Single Persist Batching Law
* **Scope:** General | **Classification:** Platform Execution Law
* **Description:** Requires grouping multiple in-memory object creations, changes, or deletions together and executing a single `Persist` step at the end of the logical block, rather than inserting a `Persist` step after every individual object manipulation. The delete teststeps must be ordered according to the delete rules as specified in the domain model.
* **Related Rules:**
  * **Related Patterns:** `PAT-06` (Direct Initialization), `PAT-20` (Unshared Session Architecture).

---

### `PAT-22`: Frontend UI Commits Bypass Automatic Rollback
* **Scope:** Frontend | **Classification:** Platform Execution Law
* **Description:** Identifies that data committed to the database via browser UI interactions (e.g., clicking a Save button in Case 2) occurs in a standard web user session and is NOT wrapped in MTA's backend automated transaction rollback. Any objects created via the UI must be explicitly deleted in Case 2 or Case 3 (Teardown).
* **Related Rules:**
  * **Related Patterns:** `PAT-03` (Frontend 3-Case Split Law), `PAT-20` (Unshared Session Architecture).

---

### `PAT-23`: Java Action Custom Transaction Exemption
* **Scope:** Backend | **Classification:** Platform Execution Law
* **Description:** Highlights that custom Java Actions executing their own transaction management or SQL connections bypass MTA's transaction wrapper. Objects committed by Java Actions will persist in the database after test execution and require explicit deletion steps in teardown.
* **Related Rules:**
  * **Related Patterns:** `PAT-22` (Frontend UI Commits Bypass Automatic Rollback).

---

### `PAT-24`: Pre-Existing Database Data Prohibition
* **Scope:** General | **Classification:** Platform Execution Law
* **Description:** Strictly prohibits relying on pre-existing database records (e.g., static demo records in a target database) for test assertions. All required test data must be dynamically created (seeded) in the test case setup and cleaned up during teardown to guarantee portability.
* **Related Rules:**
  * **Related Patterns:** `PAT-03` (Frontend 3-Case Split Law), `PAT-20` (Unshared Session Architecture), `PAT-40` (Multi-Object List Seeding).

---

### `PAT-30`: Manual Intervention Highlight Protocol
* **Scope:** General | **Classification:** Platform Execution Law
* **Description:** Mandates setting the highlight flag on steps requiring user attention (e.g., temporary credentials, external API keys, or manual cleanup steps) using `SetHighlightOfTestStep(Highlight=true)` so they are visually highlighted in **blue** in the MTA Web UI. Crucially, because the MTA MCP server does NOT support deleting test steps or test configuration elements via API (only AUT application data via `DeleteObject`), any test configuration modifications that require manual cleanup or review must be highlighted in blue for explicit user action.
* **Related Rules:**
  * **Related Patterns:** `PAT-12` (Test Step Description Pattern Annotation).

---

### `PAT-31`: Retrieve-for-Asserting Set & Count Law
* **Scope:** Backend | **Classification:** Platform Execution Law
* **Description:** Configures `Retrieve Object` steps that prepare data for assertion with `RetrieveSet = "All"` along with explicit attribute filters, combined with an immediate downstream `Assert Object Count` step. Using `RetrieveSet = "Head"` on assert retrieves is **strictly prohibited**, because if 0 matching records exist, `"Head"` triggers a runtime retrieval crash instead of allowing a clean `AssertObjectCount = 0` evaluation.
* **Related Rules:**
  * **Related Patterns:** `PAT-08` (Retrieve Output Object Count Assertion).
  * **Direct Counterpart Anti-Pattern:** `ANTI-03` (Unasserted Retrieve Consumer Piping).

---

### `PAT-32`: Dynamic Scalar Value Piping (`SelectValueForValue`)
* **Scope:** General | **Classification:** Platform Execution Law
* **Description:** Defines dynamic test values or object identifier properties once in an upstream step or variable and pipes them downstream using `SelectValueForValue` scalar piping, establishing a single source of truth for test data. Apply dynamic scalar value piping as much as possible.
* **Related Rules:**
  * **Related Patterns:** `PAT-19` (Data Variation Consolidation), `PAT-55` (Zero Data in Step Names).
  * **Direct Counterpart Anti-Pattern:** `ANTI-04` (Hardcoding Test Data Values in Step Names).

---

### `PAT-34`: Uniform 8-Field Step Sequence Schema
* **Scope:** General | **Classification:** Methodological Law
* **Description:** Enforces a strict 8-field schema in exact order for specifying every test step in Execution Plans: `Step Type`, `Target / Entity / Action`, `Input Source / Handles`, `Output Variable Handle`, `Parameters & Attribute Values`, `Embedded Step Assertions`, `Execution Settings`, and `Step Description & Pattern Rationale`.
* **Related Rules:**
  * **Related Patterns:** `PAT-12` (Test Step Description Pattern Annotation).

---

### `PAT-55`: Zero Data in Step Names
* **Scope:** General | **Classification:** Methodological Law
* **Description:** Mandates that test step names must strictly follow functional action templates (e.g., `[Action] [WidgetType] '[FieldDescriptor]'`) and must never contain hardcoded runtime test data values (such as `"Order #10482"` or `"John Doe"`).
* **Related Rules:**
  * **Direct Counterpart Anti-Pattern:** `ANTI-04` (Hardcoding Test Data Values in Step Names).
  * **Related Patterns:** `PAT-32` (Dynamic Scalar Value Piping).

---

### `ANTI-01`: Separate `Change Object` Step After `Create Object`
* **Scope:** General| **Classification:** Platform Anti-Pattern
* **Description:** The anti-pattern of instantiating an object using `Create Object` and immediately adding a separate `Change Object` step to set initial attribute values, rather than specifying initial values directly on `Create Object`.
* **Related Rules:**
  * **Direct Counterpart Pattern:** `PAT-06` (Direct Attribute & Association Initialization on Create Object).

---

### `ANTI-03`: Unasserted Retrieve / Microflow Output Consumer Piping
* **Scope:** Backend | **Classification:** Methodological Anti-Pattern
* **Description:** The anti-pattern of piping the output handle of a `Retrieve Object` or `Microflow Call` directly into a downstream parameter or assertion without verifying existence via `Assert Object Count` first.
* **Related Rules:**
  * **Direct Counterpart Pattern:** `PAT-08` (Retrieve Output Object Count Assertion).

---

### `ANTI-04`: Hardcoding Test Data Values in Step Names
* **Scope:** General | **Classification:** Methodological Anti-Pattern
* **Description:** Including specific runtime data values (e.g., `"Set Name to Alice"`, `"Filter Status Approved"`) directly in step names instead of using template-based descriptive names.
* **Related Rules:**
  * **Direct Counterpart Pattern:** `PAT-55` (Zero Data in Step Names).
  * **Related Patterns:** `PAT-32` (Dynamic Scalar Value Piping).

---

### `ANTI-05`: Parallel / Batched Creation in Same Container
* **Scope:** General | **Classification:** Platform Anti-Pattern
* **Description:** Invoking multiple API calls to create steps concurrently within the same test case, leading to database lock contention, duplicate step numbers, or corrupted step execution order.
* **Related Rules:**
  * **Direct Counterpart Patterns:** `PAT-11` (Predecessor Forward Chaining Law), `PAT-16` (Sequential Step Execution Ban).

---

### `ANTI-06`: Asserting Object Count after `Create Object`
* **Scope:** General | **Classification:** Methodological Anti-Pattern
* **Description:** Placing an `Assert Object Count` step on a `Create Object` step. In-memory created objects are guaranteed to exist, rendering count assertions redundant on creation steps.
* **Related Rules:**
  * **Direct Counterpart Pattern:** `PAT-08` (Retrieve Output Object Count Assertion — which belongs on Retrieve or Microflow calls, not Create Object).

---

### `ANTI-10`: Embedded Assertions on Create/Change Object Steps
* **Scope:** General | **Classification:** Methodological Anti-Pattern
* **Description:** Configuring embedded attribute assertion comparisons on `Create Object` or `Change Object` steps rather than treating field inputs on those steps strictly as state modifications.
* **Related Rules:**
  * **Direct Counterpart Pattern:** `PAT-14` (Prohibition of Embedded Asserts on Create/Change Object Steps).

---

## ⚙️ Domain C: Execution Settings, Rollback & Exception Handling

### `PAT-03`: Frontend 3-Case Split Law
* **Scope:** Frontend | **Classification:** Methodological Law
* **Description:** Requires structuring Frontend UI test suites into exactly 3 sequential test cases: Case 1 (Setup Test Case for backend database seeding), Case 2 (Action Test Case for Playwright browser interactions), and Case 3 (Teardown Test Case for explicit data cleanup).
* **Related Rules:**
  * **Related Patterns:** `PAT-18` (Frontend Setup/Teardown Execution Settings Law), `PAT-20` (Unshared Session Architecture), `PAT-22` (UI Commits Bypass Automatic Rollback), `PAT-28` (Start-and-Stop First Boilerplate).

---

### `PAT-17`: Backend Unit Test Execution Settings Law (`_Stop`)
* **Scope:** Backend | **Classification:** Methodological Law
* **Description:** Dictates that ALL steps within Backend Unit Tests (single microflow tests) must use `ExecutionCondition = "None"` (standard default) and `ResumeExecutionAfterException = "_Stop"`. Backend Unit Tests are the **only** test type where `RollbackTcseAfterExecution = "Yes"` is enabled at the TestCase level. Because of this auto-rollback wrapper, all object actions inherit `None` / `_Stop` by default and do NOT require explicit calls to `SetExecutionSettingsOfTestStep` unless custom behavior is required. If any step raises an exception during execution, execution halts immediately so MTA's transactional rollback cleanly cleans up the database. Because rollback is enabled, no cleanup of created data is required.
* **Related Rules:**
  * **Direct Counterpart Anti-Pattern:** `ANTI-07` (Applying `_Always` / `_Continue` to Backend Unit Tests).
  * **Related Patterns:** `PAT-18` (Frontend Execution Condition Law), `PAT-33` (Default Assertion Failure Behavior).

---

### `PAT-18`: Frontend Setup/Teardown Execution Condition Law (`_Always` / `_Continue`)
* **Scope:** Frontend | **Classification:** Methodological Law
* **Description:** Dictates that database seeding steps in Case 1, browser lifecycle management steps (`Start_MxFrontend_Test` and `Stop_MxFrontendTest`), and deletion steps in Case 3 must be configured with `ExecutionCondition = "_Always"` and `ResumeExecutionAfterException = "_Continue"`. This guarantees that cleanup and browser shutdown execute even if the UI test in Case 2 fails.
* **Related Rules:**
  * **Direct Counterpart Anti-Pattern:** `ANTI-07` (Applying `_Always` / `_Continue` to Backend Unit Tests).
  * **Related Patterns:** `PAT-03` (Frontend 3-Case Split Law), `PAT-28` (Start-and-Stop First Boilerplate).

---

### `PAT-29`: Page Object Model (POM) Equivalent Pattern
* **Scope:** Frontend | **Classification:** Platform Execution Law
* **Description:** Defines a single locator step via microflow (`MenditectMxFrontendTestKit.Locate_MxPage`) at the beginning of a page interaction sequence and pipes its container handle into all subsequent widget actions on that page, modularizing page locators.
* **Related Rules:**
  * **Related Patterns:** `PAT-13` (Structural Locator Laws), `PAT-50` (Playwright 3 Conflict Options Strategy).

---

### `PAT-33`: Default Assertion Failure Behavior (Continue Execution)
* **Scope:** General | **Classification:** Platform Execution Law
* **Description:** Sets assertion steps for Backend tests to `ActionFailedAssert = "_ContinueTestRun"` so that all assertions in a suite run to completion, providing a full error report in test logs. Failed assertion for frontend test lead to an exception of the microflow and thus `ResumeExecutionAfterException = "_Continue"` must be set for frontend tests to provide a full error report in the test logs.
* **Related Rules:**
  * **Related Patterns:** `PAT-17` (Backend Unit Test Execution Settings Law — where `_Stop` is required instead), `PAT-18` (Frontend Execution Condition Law).

---

### `ANTI-07`: Applying `_Always` / `_Continue` to Backend Unit Tests
* **Scope:** Backend | **Classification:** Methodological Anti-Pattern
* **Description:** Setting `ExecutionCondition = "_Always"` or `ResumeExecutionAfterException = "_Continue"` on steps inside Backend Unit Tests. Doing so bypasses MTA's built-in transaction rollback wrapper (`RollbackTcseAfterExecution = "Yes"`), leaving unrolled test data in the database.
* **Related Rules:**
  * **Direct Counterpart Pattern:** `PAT-17` (Backend Unit Test Execution Settings Law).

---

## 🧪 Domain D: Data Variations, Matrix Reconciliation & Empty Object Protocols

### `PAT-07`: Dual Retrieve/Filter Empty Object Pattern
* **Scope:** Backend | **Classification:** Methodological Law
* **Description:** Provides a dynamic mechanism to test both valid objects and `empty`/NULL object scenarios across MTA Data Variations without hardcoding separate test cases. A `Retrieve Object` step filters an upstream `Create Object` handle using a variable attribute filter (`'VALID_VAL'` on valid variations vs `'NON_EXISTENT'` on empty variations). To enforce this safely, 4 strict constraints must be followed:
  1. **Source Option Constraint:** `RetrieveOption` MUST be set to `"Teststep"` (`Retrieve from Teststep`), strictly prohibiting `RetrieveOption = "Database"`.
  2. **Attribute Type Constraint:** The filter attribute MUST be a `String` or `Integer`, NEVER an `Enumeration` (as empty/unmatched enumerations crash during memory filtering).
  3. **Parameter Binding Rule:** Downstream microflow parameter bindings MUST be mapped to the **Retrieve step's output handle**, NEVER directly to the upstream Create step.
  4. **Pattern Recipes:** Can be implemented via the Standard Pattern (fixed dummy filter attribute), Alternative Pattern A (Same-Attribute neutral baseline), or Alternative Pattern B (Different-Attribute coordination).
* **Related Rules:**
  * **Related Patterns:** `PAT-08` (Retrieve Output Object Count Assertion), `PAT-19` (Data Variation Consolidation), `PAT-31` (Retrieve-for-Asserting Set & Count Law).

---

### `PAT-19`: Data Variation Consolidation
* **Scope:** General | **Classification:** Methodological Law
* **Description:** Consolidates multiple test scenarios (e.g., boundary values, invalid inputs, role permissions) into a single reusable step sequence driven by an MTA Data Variation Matrix, rather than creating multiple duplicate test cases.
* **Related Rules:**
  * **Direct Counterpart Anti-Pattern:** `ANTI-08` (Duplicate Test Case Proliferation).
  * **Related Patterns:** `PAT-27` (Horizontal 8-Column Matrix Layout), `PAT-54` (Exhaustive Matrix Cell Reconciliation Law).

---

### `PAT-27`: Horizontal & Capped (8-Column) Variation Matrix Layout
* **Scope:** General | **Classification:** Methodological Law
* **Description:** Limits Data Variation Matrix tables in documentation and Execution Plans to a maximum of 8 columns per table block (1 Parameter Label column + 7 Variation Scenario columns) to prevent truncation in the MTA UI. Matrices with more than 7 variations are split into consecutive 8-column table blocks.
  * **System Naming Constraint:** Column header labels `#1`, `#2`, etc., are strictly for visual Markdown table presentation; actual Data Variation names registered in MTA via `TestCaseDataVariationName` MUST NOT include `#n` prefixes or numbers.
  * **Separator Alignment Law:** The separator row cell count (`|:---|`) must match the header column count exactly to prevent Markdown table parsing breaks.
* **Related Rules:**
  * **Related Patterns:** `PAT-19` (Data Variation Consolidation), `PAT-54` (Exhaustive Matrix Cell Reconciliation Law).

---

### `PAT-54`: Exhaustive $M \times N$ Matrix Cell Reconciliation Law
* **Scope:** General | **Classification:** Methodological Law
* **Description:** Requires explicitly auditing and verifying every cell $(i, j)$ in a Data Variation Matrix when copying or expanding variation columns, ensuring no default or unverified values are assumed.
* **Related Rules:**
  * **Direct Counterpart Anti-Pattern:** `ANTI-11` (Delta-Only Data Variation Override Assumptions).
  * **Related Patterns:** `PAT-19` (Data Variation Consolidation), `PAT-27` (Capped 8-Column Matrix Layout).

---

### `ANTI-08`: Duplicate Test Case Proliferation
* **Scope:** General | **Classification:** Methodological Anti-Pattern
* **Description:** The anti-pattern of creating multiple distinct test cases that duplicate identical step sequences just to test different data inputs or boundary conditions, instead of using MTA Data Variations.
* **Related Rules:**
  * **Direct Counterpart Pattern:** `PAT-19` (Data Variation Consolidation).

---

### `ANTI-11`: Delta-Only Data Variation Override Assumptions
* **Scope:** General | **Classification:** Methodological Anti-Pattern
* **Description:** Assuming that duplicating a data variation column automatically retains parent cell values without explicitly checking and writing every individual cell value in the matrix.
* **Related Rules:**
  * **Direct Counterpart Pattern:** `PAT-54` (Exhaustive $M \times N$ Matrix Cell Reconciliation Law).

---

## 🌐 Domain E: Frontend UI & Locator Laws

### `PAT-05`: Menditect Frontend Testkit Strict Default Law
* **Scope:** Frontend | **Classification:** Methodological Law
* **Description:** Establishes `MenditectMxFrontendTestKit` microflows (`ACT_Fill_*`, `ACT_Click_*`, `ASR_Assert_*`) as the mandatory default for all Frontend UI test steps. Falling back to raw Playwright selectors or custom connectors is strictly prohibited unless authorized by the user.
* **Related Rules:**
  * **Direct Counterpart Anti-Pattern:** `ANTI-12` (Raw Playwright Connector Bypass Anti-Pattern).
  * **Related Patterns:** `PAT-28` (Start-and-Stop First Boilerplate).

---

### `PAT-13`: Structural Locator Laws (Law 1, Law 2, Law 3)
* **Scope:** Frontend | **Classification:** Platform Execution Law
* **Description:** Mandates three structural locator rules and widget-binding constraints for Mendix UI widgets:
  * **Law 1 (Non-Repeating Widgets):** 3-step chain (Page Locator $\rightarrow$ Widget Locator $\rightarrow$ Widget Action).
  * **Law 2 (Repeating Container Widgets - ListViews, DataGrids):** 5-step ELO chain (Page Locator $\rightarrow$ ELO Container $\rightarrow$ Item Selection/Filter $\rightarrow$ Widget Locator $\rightarrow$ Widget Action).
  * **Law 3 (ComboBox / Selection Widgets):** Strict **4-step sequence**: (1) Locate ComboBox (`Locate_MxWidget_ComboBox`) $\rightarrow$ (2) Open ComboBox Trigger (`ACT_Click_ComboBox_Trigger`) $\rightarrow$ (3) Fill Option Value (`ACT_Fill_ComboBox_Input`) $\rightarrow$ (4) Close ComboBox Trigger (`ACT_Click_ComboBox_Trigger`). The 4th step (second trigger click) is mandatory to close the floating dropdown overlay container and prevent overlay pollution from blocking downstream clicks.
  * **Exact-Match Locator Binding Law:** Actions must use widget-specific connectors (e.g., `ACT_Fill_ComboBox_Input` for ComboBoxes, NEVER `ACT_Fill_TextBox_Input`).
* **Related Rules:**
  * **Counterpart Anti-Pattern:** `ANTI-12` (Raw Playwright Connector Bypass Anti-Pattern).
  * **Related Patterns:** `PAT-05` (TestKit Strict Default), `PAT-29` (POM Locator Equivalent), `PAT-52` (Frontend List Filter Options Protocol).

---

### `PAT-28`: "Start-and-Stop First" Boilerplate Session Law
* **Scope:** Frontend | **Classification:** Platform Execution Law
* **Description:** Dictates that when building a Frontend test case, `Start_MxFrontend_Test_*` and `Stop_MxFrontendTest` steps must be created FIRST with execution settings `_Always` / `_Continue`, and all interaction steps are sequenced between them to ensure browser sessions are always cleaned up.
* **Related Rules:**
  * **Related Patterns:** `PAT-03` (Frontend 3-Case Split Law), `PAT-18` (Frontend Setup/Teardown Settings), `PAT-05` (TestKit Strict Default).

---

### `PAT-35`: Native Auto-Waiting vs. Sleep Prohibition
* **Scope:** Frontend | **Classification:** Platform Execution Law
* **Description:** Requires relying on Playwright's native auto-waiting mechanisms and visibility assertion steps (`ASR_Is_Visible`) rather than inserting fixed wait/sleep delays. The `ASR_Is_Visible` check is performed automatically for all `Locate_MxPage` and `Locate_MxWidget_` microflows from the `MenditectMxFrontendTestKit`
* **Related Rules:**
  * **Related Patterns:** `PAT-05` (TestKit Strict Default).

---

### `PAT-36`: MTA Sync Probe & Local Model Fallback
* **Scope:** Frontend | **Classification:** Methodological Law
* **Description:** Requires asking the user if the MTA server synchronization is up to date before calling `GetPages` or `GetWidgets` (Requirement 1 of the 8-Requirement Frontend Quality Protocol). If MTA is not synced, the agent falls back to querying the local model (via `mxcli`) (`SHOW PAGES`).
* **Related Rules:**
  * **Related Patterns:** `PAT-41` (Anonymous vs. Role Navigation Resolution), `PAT-52` (List Filter Options Protocol).

---

### `PAT-40`: Multi-Object List & Dropdown Seeding
* **Scope:** Frontend | **Classification:** Methodological Law
* **Description:** Requires creating multiple seed records (2 or more) for entities displayed in list views, data grids, or dropdown selection widgets during Case 1 setup (Requirement 4 of the Frontend Quality Protocol) to verify that filters and selection locators pick the correct record.
* **Related Rules:**
  * **Related Patterns:** `PAT-03` (Frontend 3-Case Split Law), `PAT-24` (Pre-Existing Database Data Prohibition), `PAT-52` (List Filter Options Protocol).

---

### `PAT-41`: Anonymous vs. Role Navigation Resolution
* **Scope:** Frontend | **Classification:** Methodological Law
* **Description:** Determines whether the target page is accessible anonymously (Requirement 5 of the Frontend Quality Protocol). Anonymous are only allowed if set in the App security settings and are always associated to an App level user role. Use Mendix navigation (`SHOW NAVIGATION` via `mxcli`) to identify the role based home page and navigation to the starting page of the test. If no role based homepage is defined, use the default home page for the applied viewport settings as starting point (Mendix allows for different Navigation profiles based on screen settings)
* **Related Rules:**
  * **Related Patterns:** `PAT-03` (Frontend 3-Case Split Law), `PAT-36` (MTA Sync Probe).

---

### `PAT-42`: Date-Time Offset & Format Pattern Inspection
* **Scope:** General | **Classification:** Methodological Law
* **Description:** By default, use `CurrentDateTime` with relative day/hour offsets for date-time inputs and inspects the Mendix model's `dateformPattern` via `mxcli` (Requirement 7 of the Frontend Quality Protocol) to ensure string formatting matches widget display requirements. Only choose a fixed `DateTime` when strictly nessary for the test purpose.
* **Related Rules:**
  * **Related Patterns:** `PAT-53` (Domain Model Attribute Length & Constraint Verification).

---

### `ANTI-12`: Raw Playwright Connector Bypass Anti-Pattern
* **Scope:** Frontend | **Classification:** Platform Anti-Pattern
* **Description:** Bypassing `MenditectMxFrontendTestKit` to execute raw Playwright clicks, fills, or DOM selectors without explicit user authorization.
* **Related Rules:**
  * **Direct Counterpart Pattern:** `PAT-05` (Menditect Frontend Testkit Strict Default Law).
  * **Related Patterns:** `PAT-13` (Structural Locator Laws).

---

## 🛡️ Domain F: Protocol Gates, State Machine & Multi-Agent Safety

### `PAT-04`: Void Microflow Complexity & Side-Effect Audit Guardrail
* **Scope:** Backend | **Classification:** Methodological Law
* **Description:** Evaluates the internal complexity of microflows with no return value (void microflows). If the void microflow mutates database records, the test case must include explicit downstream `Retrieve Object` and `Assert Object Count` or `Attribute` steps to verify side-effects rather than relying on crash-only checks. Use `RetrieveByAssociation` and the structure of the domain model to find the right objects. Warn the user if objects are modified that cannot be retrieved.
* **Related Rules:**
  * **Direct Counterpart Anti-Pattern:** `ANTI-13` (Blind Void Microflow Crash-Only Testing).
  * **Related Patterns:** `PAT-08` (Retrieve Object Count Assertion).

---

### `PAT-10`: Universal Validation Feedback Assertion Law (Backend Only)
* **Scope:** Backend | **Classification:** Methodological Law
* **Description:** Inspects backend microflows for validation feedback actions and applies `AssertValidationFeedbackMessageCompare` and `AssertValidationFeedbackMessageCount` steps (`Count = 0` on happy path, `Count > 0` on validation failure paths). For happy path Data Variations where no validation message is expected, configures `ComparisonOperator = "NotEquals"` with `ComparisonString = "__NO_VALIDATION_MESSAGE__"` so the variation passes cleanly without triggering false validation failures.
* **Related Rules:**
  * **Direct Counterpart Anti-Pattern:** `ANTI-14` (Using MTA Validation Feedback Assertions in Frontend UI Tests — which is invalid because validation feedback assertions apply only to Backend microflow execution).

---

### `PAT-43`: Mandatory Dual-Gate Plan & Placement Approval
* **Scope:** General | **Classification:** Methodological Law
* **Description:** Enforces a two-step approval process before executing mutating MTA tools:
  * **Gate 1 Approval:** The Execution Plan specification draft is approved by the user.
  * **Gate 2 Approval:** The target placement summary (Test Configuration, Test Suite, Test Case Name) is approved by the user.
* **Related Rules:**
  * **Related Patterns:** `PAT-44` (Atomic Multi-Case Construction & ExecutionPlanKey Gating), `PAT-48` (Allowed Operational States).

---

### `PAT-44`: Atomic Multi-Case Construction & `ExecutionPlanKey` Gating
* **Scope:** General | **Classification:** Methodological Law
* **Description:** Requires saving the approved plan via `SaveExecutionPlan` to obtain an `ExecutionPlanKey` before constructing steps in `STATE_CONSTRUCTION`. The returned `execution_plan_key` MUST be immediately persisted in `mta_state.json` and attached to all generated test cases (`test_cases[].execution_plan_key`) to link database entities to the plan. Once gated, all test cases and steps are provisioned in a single uninterrupted execution sweep.
* **Related Rules:**
  * **Related Patterns:** `PAT-43` (Mandatory Dual-Gate Approval), `PAT-47` (Real-Time Placement Key Persistence).

---

### `PAT-45`: Mandatory Tool Execution Reasoning Chain of Thought
* **Scope:** General | **Classification:** Methodological Law
* **Description:** Requires outputting a user-facing markdown explanation block (`🧠 Tool Execution Reasoning`) immediately before every MTA MCP tool call.
* **Related Rules:**
  * **Related Patterns:** `PAT-46` (Clickable MTA Web Navigation Link Formatting).

---

### `PAT-46`: Clickable MTA Web Navigation Link Formatting
* **Scope:** General | **Classification:** Methodological Law
* **Description:** Formats clickable markdown links to created MTA elements using the standard structure `[MtaBaseUrl]/p/[ObjectType]/[Key]` so users can open created suites and cases directly in their browser. These are the available `ObjectTypes`: testconfiguration, testsuite, testcase, testrun, testsuiterun, testcaserun.
* **Related Rules:**
  * **Related Patterns:** `PAT-47` (Real-Time Placement Key Persistence).

---

### `PAT-47`: Real-Time Placement Key Persistence
* **Scope:** General | **Classification:** Methodological Law
* **Description:** Writes returned numeric MTA database keys (`test_configuration.key`, `test_suite.key`, `execution_plan_key`, `test_cases[].key`) immediately into `mta_state.json` as assets are created.
* **Related Rules:**
  * **Related Patterns:** `PAT-44` (Atomic Construction & ExecutionPlanKey Gating), `PAT-46` (Clickable Navigation Links).

---

### `PAT-48`: Allowed Operational States for Parameter Setters & Assertions
* **Scope:** General | **Classification:** Methodological Law
* **Description:** Restricts mutating tool calls (parameter setters, assertions, step creators) strictly to `STATE_CONSTRUCTION`. They are blocked during `STATE_DISCOVERY` and `STATE_BUILD_PLANNING`.
* **Related Rules:**
  * **Related Patterns:** `PAT-43` (Mandatory Dual-Gate Approval).

---

### `PAT-49`: Incremental Construction Success Verification
* **Scope:** General | **Classification:** Methodological Law
* **Description:** Calls `GetTestConstructionErrorsOfTestCase` immediately after building a step block to check for unbound parameters or broken sequence keys on the MTA server. Also serves as the mandatory compiler verification gate during `STATE_SMOKE_AUDIT` before generating the Post-Construction Smoke Audit Report and transitioning to `STATE_RUN_ANALYZE`.
* **Related Rules:**
  * **Related Patterns:** `PAT-44` (Atomic Construction).

---

### `PAT-50`: Playwright 3 Conflict Options Strategy
* **Scope:** Frontend | **Classification:** Methodological Law
* **Description:** Resolves placement conflicts when adding Frontend test cases to existing suites by presenting 3 explicit options: Option 1 (Inherit existing suite Playwright settings), Option 2 (Override settings), or Option 3 (Create dedicated new 3-case suite).
* **Related Rules:**
  * **Related Patterns:** `PAT-03` (Frontend 3-Case Split Law), `PAT-43` (Mandatory Dual-Gate Approval).

---

### `PAT-51`: No Conversational Refusal Protocol (`STATE_QA_ASSISTANCE`)
* **Scope:** General | **Classification:** Methodological Law
* **Description:** Allows pausing active test construction gracefully to answer user out-of-band questions or provide QA guidance by transitioning to `STATE_QA_ASSISTANCE` without resetting state or losing session context, then prompting the user to resume active building.
* **Related Rules:**
  * **Related Patterns:** `PAT-39` (Intended Use & Purpose Verification).

---

### `PAT-52`: Frontend List Filter Options Proposal Protocol
* **Scope:** Frontend | **Classification:** Methodological Law
* **Description:** Proposes explicit filtering strategies (Text Filter via `ELO_Filter_*_by_Text`, Nth Item Index via `ELO_Nth_*_Item`, or Dynamic Scalar Piping) when repeating containers are detected on a target page (Requirement 8 of the Frontend Quality Protocol). These Filter choices must be presented in the `ExecutionPlan`
* **Related Rules:**
  * **Related Patterns:** `PAT-13` (Structural Locator Laws), `PAT-40` (Multi-Object List Seeding).

---

### `PAT-53`: Domain Model Attribute Length & Constraint Verification
* **Scope:** General | **Classification:** Methodological Law
* **Description:** Checks entity attribute (e.g. max-length) constraints and enumeration definitions in the Mendix Domain Model via `mxcli` (`SHOW ENTITY`) before proposing test data values (part of Requirement 7 of the Frontend Quality Protocol) to prevent runtime truncation or validation failures.
* **Related Rules:**
  * **Related Patterns:** `PAT-32` (Dynamic Scalar Value Piping), `PAT-42` (Date-Time Offset & Format Pattern Inspection).

---

### `ANTI-13`: Blind Void Microflow Crash-Only Testing
* **Scope:** Backend | **Classification:** Methodological Anti-Pattern
* **Description:** Accepting simple "no crash / execution success" checks for void microflows that modify database data without asserting their underlying database side-effects.
* **Related Rules:**
  * **Direct Counterpart Pattern:** `PAT-04` (Void Microflow Complexity & Side-Effect Audit Guardrail).

---

### `ANTI-14`: Using MTA TestCase Validation Feedback Assertions in Frontend UI Tests
* **Scope:** Frontend | **Classification:** Methodological Anti-Pattern
* **Description:** Attempting to use MTA microflow validation feedback assertion tools (`AssertValidationFeedbackMessageCompare` / `Count`) in Frontend UI tests. Validation feedback assertions apply exclusively to Backend microflow execution; UI tests must assert validation messages via DOM element visibility assertions.
* **Related Rules:**
  * **Direct Counterpart Pattern:** `PAT-10` (Universal Validation Feedback Assertion Law - Backend Only).

---

## 🔄 Direct Counterpart Summary Index (Patterns vs. Anti-Patterns)

| Pattern (Positive Law) | Anti-Pattern (Violation) | Core Focus |
| :--- | :--- | :--- |
| **`PAT-01`** (MTF Pyramid Alignment) | **`ANTI-02`** (Ice Cream Cone Heavy UI Testing) | Scoping logic at lowest pyramid layer vs over-relying on UI tests |
| **`PAT-04`** (Void Microflow Side-Effect Audit) | **`ANTI-13`** (Blind Void Microflow Testing) | Asserting DB side-effects vs relying on crash-only checks |
| **`PAT-05`** / **`PAT-13`** (Frontend Testkit & Structural Locators) | **`ANTI-12`** (Raw Playwright Bypass) | Using Menditect Testkit & structural chains vs raw Playwright code |
| **`PAT-06`** (Direct Initialization on Create) | **`ANTI-01`** (Separate Change Object Step) | Setting attributes on Create vs adding extra Change Object step |
| **`PAT-08`** (Retrieve Output Count Assertion) | **`ANTI-03`** (Unasserted Consumer Piping) | Verifying retrieved object existence before downstream piping |
| **`PAT-08`** (Retrieve Output Count Assertion) | **`ANTI-06`** (Asserting Count after Create) | Count assertions belong on Retrieve / Microflow calls, NEVER on Create Object |
| **`PAT-10`** (Validation Feedback Assertion) | **`ANTI-14`** (Validation Feedback in UI Tests) | Validation feedback assertions apply to Backend microflows only |
| **`PAT-11`** / **`PAT-16`** (Predecessor Chaining & Sequential Execution Ban) | **`ANTI-05`** (Parallel/Batched Step Calls) | Sequential tool execution vs parallel API race conditions (`PAT-11` provides predecessor chaining) |
| **`PAT-14`** (No Embedded Asserts on Create) | **`ANTI-10`** (Embedded Asserts on Create/Change) | Create/Change are state mutations, not assertions |
| **`PAT-17`** (Backend Unit Test `_Stop` Setting) | **`ANTI-07`** (`_Always`/`_Continue` in Unit Tests) | Preserving DB auto-rollback wrapper in unit tests |
| **`PAT-19`** (Data Variation Consolidation) | **`ANTI-08`** (Duplicate Test Case Proliferation) | Using Data Variations vs proliferating duplicate cases |
| **`PAT-25`** (What Not to Test Guardrail) | **`ANTI-09`** (Native Platform Testing) | Testing custom app logic vs Mendix framework mechanisms |
| **`PAT-54`** ($M \times N$ Matrix Cell Reconciliation) | **`ANTI-11`** (Delta-Only Override Assumptions) | Explicit cell verification vs assuming copied matrix values |
| **`PAT-55`** (Zero Data in Step Names) | **`ANTI-04`** (Hardcoding Data in Step Names) | Functional action templates vs hardcoding runtime data |
