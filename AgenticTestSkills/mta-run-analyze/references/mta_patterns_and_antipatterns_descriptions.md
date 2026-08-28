# 📖 Menditect Test Automation (MTA) Patterns & Anti-Patterns Reference Guide
**📍 Location:** .agent/skills/mta-shared/references/mta_patterns_and_antipatterns_descriptions.md  
**🏠 Return to:** [MTA Test Design Skill](../../mta-test-design/SKILL.md) | [MTA Build Skill](../../mta-build/SKILL.md) | [MTA Run & Analyze Skill](../../mta-run-analyze/SKILL.md) | [Patterns Reference Index](mta-patterns-and-antipatterns-reference.md)  
*Metadata: Version 2.2.0 | Primary Audience: AI Coding Assistant (Antigravity, MAIA, Subagents)*

This document provides a comprehensive analysis and detailed description of all Patterns (`PAT-xx`) and Anti-Patterns (`ANTI-xx`) codified for Menditect Test Automation (MTA).

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
* **Description:** Requires embedding an `Assert Object Count` assertion directly within Field 6 (`Embedded Step Assertions`) of any `Retrieve Object from database` step or `Microflow Call` step that produces an object or list, before that handle is consumed downstream. This guarantees that expected objects exist prior to parameter passing or attribute assertion. Prohibits declaring `Assert Object Count` as a separate standalone test step container.
* **Related Rules:**
  * **Direct Counterpart Anti-Pattern:** `ANTI-03` (Unasserted Retrieve / Microflow Output Consumer Piping).
  * **Related Anti-Patterns:** `ANTI-06` (Asserting Object Count after `Create Object` — which is invalid because created objects in-memory are guaranteed to exist).
  * **Related Patterns:** `PAT-14` (Prohibition of Embedded Asserts on Create/Change), `PAT-31` (Retrieve-for-Asserting Set & Count Law), `PAT-34` (Uniform 8-Field Step Sequence Schema).

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
* **Description:** Mandates that all step-level assertions (`Assert Object Count`, `Assert Attribute Value Compare`, `Assert Microflow Return Value`, `Assert Exception`) must be configured as embedded child assertions directly within Field 6 (`Embedded Step Assertions`) of their parent `Retrieve Object` or `Microflow Call` test steps, and never declared as standalone test step containers. Furthermore, strictly prohibits configuring embedded attribute or count assertions on `Create Object` and `Change Object` steps (where field inputs represent state initialization and mutation, not assertions).
* **Related Rules:**
  * **Direct Counterpart Anti-Pattern:** `ANTI-10` (Embedded Assertions on Create/Change Object Steps).
  * **Related Patterns:** `PAT-06` (Direct Initialization on Create Object), `PAT-08` (Retrieve / Microflow Output Object Count Assertion), `PAT-34` (Uniform 8-Field Step Sequence Schema).

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
* **Description:** Requires grouping multiple in-memory object creations, changes, or deletions together and executing a single parameterless `Persist` step at the end of the logical block, rather than inserting a `Persist` step after every individual object manipulation. A `Persist` test step acts as a batch commit for all uncommitted objects in the current session; it must NOT have `EntityQualifiedName` or input handle bindings (`TCEX_RQ_Sfcr` / `Sfdr`). Furthermore, delete test steps preceding the `Persist` step must be ordered according to the delete rules and foreign key dependencies specified in the domain model.
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
* **Description:** The anti-pattern of piping the output handle of a `Retrieve Object` or `Microflow Call` directly into a downstream parameter or assertion without verifying existence via an embedded `Assert Object Count` on the producer step first.
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
* **Description:** Placing an embedded `Assert Object Count` assertion on a `Create Object` step. In-memory created objects are guaranteed to exist, rendering count assertions redundant on creation steps.
* **Related Rules:**
  * **Direct Counterpart Pattern:** `PAT-08` (Retrieve Output Object Count Assertion — which belongs on Retrieve or Microflow calls, not Create Object).

---

### `ANTI-10`: Embedded Assertions on Create/Change Object Steps
* **Scope:** General | **Classification:** Methodological Anti-Pattern
* **Description:** The anti-pattern of either (1) declaring assertions (`Assert Object Count`, `Assert Attribute Value Compare`, `Assert Microflow Return Value`, `Assert Exception`) as separate, standalone test step containers rather than embedding them directly in their parent step's Field 6, or (2) configuring embedded attribute assertion comparisons on `Create Object` or `Change Object` steps instead of treating field inputs on those steps strictly as state modifications.
* **Related Rules:**
  * **Direct Counterpart Pattern:** `PAT-14` (Prohibition of Embedded Asserts on Create/Change Object Steps).

---

### `PAT-75`: Verified Entity Fixture Attribute Binding Law
* **Scope:** General | **Classification:** Methodological Law
* **Description:** Requires verifying entity attribute names and data types against the Mendix Domain Model AST via `DESCRIBE ENTITY <Module.Entity>` before compiling in-memory entity fixtures (`Oact: Create` or `TCEX_RQ_AttributeValueRun`) whenever target entity attributes are not fully declared in the target microflow's AST. Prohibits assuming or guessing attribute names (e.g. `Code`, `Id`, `Name`), which cause Mendix runtime metamodel validation crashes.
* **Related Rules:**
  * **Direct Counterpart Anti-Pattern:** `ANTI-29` (Unverified / Assumed Entity Fixture Attributes).
  * **Related Patterns:** `PAT-06` (Direct Attribute & Association Initialization on Create Object), `PAT-71` (Targeted Single-Pass Discovery), `PAT-73` (Chained Single-Payload Matrix Execution Law).

---

### `ANTI-29`: Unverified / Assumed Entity Fixture Attributes
* **Scope:** General | **Classification:** Methodological Anti-Pattern
* **Description:** The anti-pattern of guessing, assuming, or hallucinating synthetic attribute names (such as `Code`, `Id`, `Description`) when constructing entity creation steps or exploratory payloads without inspecting the entity's domain model AST. This causes Mendix JVM runtime exceptions (`Entity does not contain member`).
* **Related Rules:**
  * **Direct Counterpart Pattern:** `PAT-75` (Verified Entity Fixture Attribute Binding Law).
  * **Related Patterns:** `PAT-06` (Direct Initialization on Create Object).

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
  * **Related Patterns:** `PAT-19` (Data Variation Consolidation), `PAT-27` (Capped 8-Column Matrix Layout), `PAT-77` (Mandatory Data Variation Container Metadata & Description Persistence Law).

---

### `PAT-77`: Mandatory Data Variation Container Metadata & Description Persistence Law
* **Scope:** General | **Classification:** Methodological Law
* **Description:** Mandates calling `TestCaseDataVariationName(VariationKey, Name)` AND `TestCaseDataVariationDescription(VariationKey, Description)` (or `TestSuiteDataVariation*`) on Scenario #1 (the Template Variation) and every duplicated variation ($2..N$) immediately upon container creation or duplication. Guarantees that all scenario names and descriptions defined in Section 7 of the Execution Plan are strictly persisted in the MTA database rather than remaining ephemeral in markdown plans.
* **Related Rules:**
  * **Direct Counterpart Anti-Pattern:** `ANTI-31` (Unpersisted Variation Metadata & Description Omission Anti-Pattern).
  * **Related Patterns:** `PAT-19` (Data Variation Consolidation), `PAT-27` (Capped 8-Column Matrix Layout), `PAT-54` (Exhaustive Matrix Cell Reconciliation Law), `PAT-57` (Exploratory Test Promotion Bridge), `PAT-70` (Data Script Conversion Bridge).

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

### `ANTI-31`: Unpersisted Variation Metadata & Description Omission Anti-Pattern
* **Scope:** General | **Classification:** Methodological Anti-Pattern
* **Description:** Omitting `TestCaseDataVariationDescription` (or `TestSuiteDataVariationDescription`) during persistent test construction or exploratory-to-persistent conversion, leaving scenario descriptions ephemeral in markdown plans while unpersisted in the MTA database.
* **Related Rules:**
  * **Direct Counterpart Pattern:** `PAT-77` (Mandatory Data Variation Container Metadata & Description Persistence Law).
  * **Related Patterns:** `PAT-54` (Exhaustive Matrix Cell Reconciliation Law).

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

### `PAT-36`: MTA Model Revision Synchronization & Structural Delta Classification
* **Scope:** General | **Classification:** Methodological Law
* **Description:** Decouples Execution Plan storage from MTA Model Revision currency and establishes the structural delta classification rules:
  1. *Execution Plan Decoupling:* Drafting and storing an Execution Plan via `SaveExecutionPlan` is always valid and supported even when local model elements are not yet present in MTA. The plan is stored as a specification document on the server and does not bind to live metamodel elements.
  2. *Delta Classification:*
     - *Internal-Only Microflow Logic Changes:* (Microflow actions, loops, expressions, or sub-microflow calls change, but parameter names, parameter types, and return types remain identical) $\rightarrow$ No MTA Model Revision update required. Persistent test creation and execution proceed immediately.
     - *Structural Model Modifications:* (Domain model entities, attributes, associations, enumerations; Page widgets, page renames; Microflow signatures, parameter additions/removals/renames, return type changes) $\rightarrow$ Require an updated Model Revision in MTA before persistent step construction or test execution.
  3. *Proactive Upgrade Guidance:* If structural model deltas are identified during `STATE_BUILD_PLANNING`, the assistant completes Gate 1 and Gate 2, saves the execution plan (`SaveExecutionPlan`), and then proactively proposes upgrading the MTA Model Revision prior to entering `STATE_CONSTRUCTION` (or offers local exploratory testing via `MTA_plugin.execute-testcase`).
* **Related Rules:**
  * **Direct Counterpart Anti-Pattern:** `ANTI-17` (Premature Step Construction on Stale MTA Revision).
  * **Related Patterns:** `PAT-41` (Anonymous vs. Role Navigation Resolution), `PAT-43` (Mandatory Dual-Gate Plan & Placement Approval), `PAT-52` (List Filter Options Protocol), `PAT-56` (Dual-Track Decision Gate), `PAT-57` (Exploratory-to-Persistent Test Promotion Protocol), `PAT-59` (Zero Construction Error Pre-Flight Law & Build Mismatch Diagnostic).

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

### `PAT-56`: Dual-Track Decision Gate & Exploratory-First Verification
* **Scope:** General | **Classification:** Methodological Law
* **Description:** When developing or modifying backend microflow or domain logic locally and `MTA_plugin.execute-testcase` is active, prefer running an in-memory exploratory test with zero database placement and automatic JVM rollback (`RollbackTcseAfterExecution = "true"`) before creating persistent MTA server records. This provides sub-second execution feedback, eliminates container provisioning waste for broken logic, and guarantees verification prior to database persistence. Note: Frontend UI tests are explicitly excluded from Option A exploratory testing per `PAT-62` and must directly construct persistent 3-Case MTA suites.
* **Related Rules:**
  * **Direct Counterpart Pattern:** `ANTI-15` (Premature Container Provisioning).
  * **Related Patterns:** `PAT-01` (MTF Testing Pyramid Alignment), `PAT-57` (Exploratory-to-Persistent Test Promotion Protocol), `PAT-62` (Frontend Persistent MTA Construction Law).

---

### `PAT-57`: Exploratory-to-Persistent Test Promotion Protocol
* **Scope:** General | **Classification:** Platform Execution Law
* **Description:** Once an in-memory exploratory test passes via `MTA_plugin.execute-testcase`, provide an explicit, frictionless promotion path to persistent MTA Platform storage (`SaveExecutionPlan` -> Gate 2 Placement -> `STATE_CONSTRUCTION`). Prior to executing server construction, verify that the active Model Revision on the MTA server contains all new/modified model elements (`PAT-36`). Automatically transform the single unified `TCEX_RQ_TestStepRun` sequence into the target persistent MTA structure (single Backend TestCase with Data Variations, or canonical 3-TestCase Frontend Suite).
* **Related Rules:**
  * **Direct Counterpart Pattern:** `ANTI-16` (Unpromoted Exploratory Test Drift).
  * **Related Patterns:** `PAT-36` (MTA Model Revision Synchronization & Local Fallback), `PAT-43` (Mandatory Dual-Gate Plan & Placement Approval), `PAT-56` (Dual-Track Decision Gate), `PAT-58` (Unified 3-Phase Frontend Lifecycle).

---

### `PAT-58`: Backend Exploratory Execution Lifecycle & Telemetry Analysis
* **Scope:** Backend | **Classification:** Platform Execution Law
* **Description:** When running Backend exploratory tests via `MTA_plugin.execute-testcase`, compile all setup, execution, and verification steps into a single continuous `TCEX_RQ_TestStepRun` array. Ensure `RollbackTcseAfterExecution = "true"` so database modifications are rolled back automatically in-memory upon completion. Telemetry (`TCEX_RS`) from step executions, return values, and validation feedback is analyzed and presented in the standardized exploratory execution report (`PAT-61`).
* **Related Rules:**
  * **Related Patterns:** `PAT-56` (Dual-Track Decision Gate & Exploratory-First Verification), `PAT-57` (Exploratory-to-Persistent Test Promotion Protocol), `PAT-61` (Standard Exploratory Test Execution Report Format), `PAT-63` (Backend Exploratory Single-Payload Blueprint Law).

---

### `ANTI-15`: Premature Container Provisioning (Bypassing Local Exploratory Verification)
* **Scope:** General | **Classification:** Methodological Anti-Pattern
* **Description:** Creating persistent `TestSuite`, `TestCase`, and step records on the central MTA Platform server for untested or rapidly changing microflows when the local Mendix application and `MTA_plugin` are active. Forcing full central database provisioning before verifying the test logic in-memory leads to database clutter, orphan test cases, and unnecessary test construction rollback overhead.
* **Related Rules:**
  * **Direct Counterpart Pattern:** `PAT-56` (Dual-Track Decision Gate & Exploratory-First Verification).

---

### `ANTI-16`: Unpromoted Exploratory Test Drift (Ephemeral-Only Testing)
* **Scope:** General | **Classification:** Methodological Anti-Pattern
* **Description:** Executing exploratory tests via `MTA_plugin.execute-testcase` during development but neglecting to offer or perform the promotion of verified test logic to persistent MTA Platform test suites. Leaving validated test cases solely in ephemeral conversation context fails to establish long-term automated regression safety in CI/CD pipelines.
* **Related Rules:**
  * **Direct Counterpart Pattern:** `PAT-57` (Exploratory-to-Persistent Test Promotion Protocol).

---

### `ANTI-17`: Premature Step Construction on Stale MTA Revision
* **Scope:** General | **Classification:** Platform Anti-Pattern
* **Description:** Attempting to construct persistent test steps (`CreateTestStep*`, `Set*AttributeValue`, `CreateMicroflowCallTestStep`) on the MTA server when required model elements (entities, attributes, microflow signatures, widgets) exist only locally and have not yet been synchronized into the active MTA Model Revision. This causes immediate step creation failures or broken metadata references on the server.
* **Related Rules:**
  * **Direct Counterpart Pattern:** `PAT-36` (MTA Model Revision Synchronization & Structural Delta Classification).
  * **Related Patterns:** `PAT-57` (Exploratory-to-Persistent Test Promotion Protocol).

---

### `PAT-59`: Zero Construction Error Pre-Flight Law & Build Mismatch Diagnostic
* **Scope:** General | **Classification:** Platform Execution Law
* **Description:** Governs construction error interception and verification across test building, smoke audits, and execution:
  1. *Reactive Build Error Interception (`STATE_CONSTRUCTION`):* If any mutating step creation tool (e.g. `CreateTestStepCreateObject`, `SetStringAttributeValue`, `CreateMicroflowCallTestStep`) fails with a model element not-found error, the assistant MUST immediately halt further step creation, relate the error to an MTA Model Revision mismatch (identifying the specific missing entity, attribute, microflow, parameter, or widget), inform the user that further building will not work until MTA is upgraded, and offer immediate local exploratory testing (`MTA_plugin.execute-testcase`) to test against uncommitted local code.
  2. *Smoke Audit Gatekeeper (`STATE_SMOKE_AUDIT`):* Immediately following test step construction, the assistant MUST invoke `GetTestConstructionErrorsOfTestCase(TestCaseKey)`. If construction errors > 0, progression to `STATE_RUN_ANALYZE` is strictly blocked, errors are detailed in the Smoke Audit report, and the assistant remains in `STATE_CONSTRUCTION` to resolve the mismatch.
  3. *Pre-Flight Execution Guard (`STATE_RUN_ANALYZE`):* Before calling `ExecuteTestCase` or `ExecuteTestSuite`, verify that `GetTestConstructionErrorsOfTestCase` returns 0 errors. If errors exist, reject execution and guide revision synchronization.
* **Related Rules:**
  * **Direct Counterpart Anti-Pattern:** `ANTI-18` (Ignored Construction Errors & Cascading Build Failure Anti-Pattern).
  * **Related Patterns:** `PAT-36` (MTA Model Revision Synchronization & Structural Delta Classification), `PAT-44` (Atomic Multi-Case Construction), `PAT-49` (Incremental Construction Success Verification).

---

### `PAT-60`: Dual-Track Execution Strategy Explicit Declaration in Execution Plan
* **Scope:** General | **Classification:** Methodological Law
* **Description:** Every Execution Plan drafted during `STATE_BUILD_PLANNING` MUST explicitly declare the Execution Strategy in Section 1 Metadata (`Option A: Local Exploratory Test (MTA_plugin - Fast In-Memory Feedback)` vs. `Option B: Direct Persistent MTA Test (MTA Server - Full Placement & CI/CD)`). When presenting the plan for Gate 1 approval, the assistant MUST prompt the user for their explicit choice between Option A (bypassing Gate 2 and `STATE_CONSTRUCTION` to run immediately in-memory with automatic rollback) and Option B (initiating Gate 2 placement discovery and `SaveExecutionPlan` for persistent server creation).
* **Related Rules:**
  * **Related Patterns:** `PAT-12` (Uniform Step Sequence Schema Law), `PAT-43` (Mandatory Dual-Gate Plan & Placement Approval), `PAT-56` (Dual-Track Decision Gate & Exploratory-First Verification), `PAT-57` (Exploratory-to-Persistent Test Promotion Protocol).

---

### `PAT-61`: Standard Exploratory Test Execution Report Format
* **Scope:** General | **Classification:** Platform Execution Law
* **Description:** Governs the mandatory standard format for presenting exploratory test execution results from `MTA_plugin.execute-testcase`. Every exploratory test execution response MUST use this uniform structure containing:
  1. **Execution Metadata & Environment Details:** Collapsible section at the very top detailing Local DateTime stamp, unique Run ID (`TCEX-YYYYMMDD-HHMMSS-XXXX`), Total Wall-Clock Execution Time (ms), Execution User, Rollback Mode (`RollbackTcseAfterExecution = true`), and Execution Throughput.
  2. **Goal of the Test:** High-level business and technical verification intent.
  3. **Overall Result (Tri-State):** Explicit outcome status:
     * `PASS`: All test steps, microflow executions, return values, and assertions succeeded.
     * `FAIL`: One or more steps completed execution, but assertions failed (e.g. return value mismatch, object count mismatch, or unexpected validation feedback).
     * `ERROR`: An unhandled exception or runtime crash occurred during execution (e.g. `NullPointerException`, Mendix Java runtime exception).
  4. **Test Case Level Summary:** High-level table of Input state, Actual Output returned, and Expected Result.
  5. **Performance & Benchmark Profile (PAT-76):** Granular timing breakdown detailing Wall-Clock & Throughput Telemetry, Operations Breakdown by Step Category (Create/Change/Delete/Microflow/Assertions/Persist/Rollback), and Per-Scenario Latency Breakdown.
  6. **Error & Diagnostic Logs:** Included upon `FAIL` or `ERROR`, detailing exception class, error message, stack trace snippets, and root-cause diagnosis.
  7. **Step Level Execution Breakdown & Latency Telemetry:** Collapsible section positioned at the very bottom containing the sequential table listing step index (#), Step Name/Type, Input (handles/passed values), Actual Output (return value/GUID/attributes), Expected Result & Assertions, Step Result (`PASS`/`FAIL`/`ERROR`/`SKIPPED`), and Duration (ms).
  8. **Promotion Prompt:** Interactive prompt offering one-click promotion to persistent MTA storage if the test passed.
* **Related Rules:**
  * **Related Patterns:** `PAT-56` (Dual-Track Decision Gate & Exploratory-First Verification), `PAT-57` (Exploratory-to-Persistent Test Promotion Protocol), `PAT-58` (Unified 3-Phase Lifecycle for Frontend Exploratory Execution), `PAT-76` (Mandatory Exploratory Benchmark & Latency Telemetry Law).

---

### `ANTI-18`: Ignored Construction Errors & Cascading Build Failure Anti-Pattern
* **Scope:** General | **Classification:** Platform Anti-Pattern
* **Description:** Continuing to invoke step creation tools after encountering model element not-found errors, or attempting to execute test cases (`ExecuteTestCase` / `ExecuteTestSuite`) without verifying and resolving active test construction errors (`GetTestConstructionErrorsOfTestCase`). Continuing to build or execute despite construction errors leads to cascading failures, unrunnable test suites, and corrupted test structures.
* **Related Rules:**
  * **Direct Counterpart Pattern:** `PAT-59` (Zero Construction Error Pre-Flight Law & Build Mismatch Diagnostic).
  * **Related Patterns:** `PAT-49` (Incremental Construction Success Verification).

---

### `PAT-62`: Frontend Persistent MTA Construction Law
* **Scope:** Frontend | **Classification:** Methodological Law
* **Description:** Frontend UI automation requires Playwright browser lifecycle management, session context isolation, and DOM locator mapping provided by the MTA Platform (Option B). All Frontend UI tests MUST be constructed directly on the persistent MTA Platform across the canonical 3-Case suite lifecycle (Case 1 Setup, Case 2 Action, Case 3 Teardown) with Gate 2 Placement and Playwright browser settings. In-memory exploratory execution (`MTA_plugin.execute-testcase`) is reserved for backend microflow and domain logic testing.
* **Related Rules:**
  * **Direct Counterpart Anti-Pattern:** `ANTI-19` (Trial-and-Error Frontend Execution & Raw CSS Selector Bypass).
  * **Related Patterns:** `PAT-03` (Frontend 3-Case Split Law), `PAT-05` (Menditect Frontend Testkit Strict Default Law), `PAT-13` (Structural Locator Laws), `PAT-20` (Unshared Session Architecture & Mandatory Persist Rule), `PAT-28` ("Start-and-Stop First" Boilerplate Session Law), `PAT-64` (Closed Catalog Frontend Testkit Microflow Verification Law).

---

### `ANTI-19`: Trial-and-Error Frontend Execution & Raw CSS Selector Bypass
* **Scope:** Frontend | **Classification:** Methodological Anti-Pattern
* **Description:** Attempting to construct or debug frontend tests by guessing raw Playwright CSS selectors (`Page_Get_By_Selector`, `Locator_Get_By_Text`, `:first-child`, `>> nth=0`) and running live trial-and-error executions against the running runtime without first inspecting the Mendix widget model via `mxcli` or using official `MenditectMxFrontendTestKit` locator/ELO microflows. This causes session exhaustion, non-deterministic UI failures, and fragile tests that bypass Mendix model abstraction.
* **Related Rules:**
  * **Direct Counterpart Pattern:** `PAT-62` (Frontend Persistent MTA Construction Law).
  * **Related Anti-Patterns:** `ANTI-12` (Raw Playwright Connector Bypass Anti-Pattern).

---

### `PAT-63`: Backend Exploratory Single-Payload Blueprint Law
* **Scope:** Backend | **Classification:** Methodological Law
* **Description:** Governs the dedicated single-testcase Execution Plan schema and JSON message blueprint for Backend exploratory tests:
  1. *Dedicated Single-TestCase Structure:* When exploratory testing (`execute-testcase`) is selected for Backend logic, format the Execution Plan as **1 single continuous test case** payload (`TCEX_RQ_TestStepRun` array) with `RollbackTcseAfterExecution = "true"`.
  2. *Self-Contained Setup & Verification:* Include entity creation/retrieval, parameter setup, microflow calls, and assertions within the continuous step sequence.
  3. *JSON Message Blueprint:* The exploratory plan MUST include the complete JSON payload preview mapping all steps directly to `TCEX_RQ_TestStepRun`.
* **Related Rules:**
  * **Direct Counterpart Anti-Pattern:** `ANTI-20` (Frontend UI to Backend Domain Microflow Substitution Anti-Pattern).
  * **Related Patterns:** `PAT-56` (Dual-Track Decision Gate & Exploratory-First Verification), `PAT-57` (Exploratory-to-Persistent Test Promotion Protocol), `PAT-60` (Dual-Track Execution Strategy Explicit Declaration), `PAT-61` (Standard Exploratory Test Execution Report Format), `PAT-66` (Exhaustive Exploratory Matrix Execution Law).

---

### `ANTI-20`: Frontend UI to Backend Domain Microflow Substitution Anti-Pattern
* **Scope:** Frontend | **Classification:** Methodological Anti-Pattern
* **Description:** Substituting frontend user-facing UI interactions (clicks, text input, dropdown selections, UI assertions) with direct backend domain microflow calls (`ACT_*`, `SUB_*`, `CMT_*`) during frontend test planning or exploratory execution. In Frontend tests, domain microflows are strictly restricted to backend database seeding in setup or backend cleanup in teardown; all interactive UI steps MUST be driven via official `MenditectMxFrontendTestKit` microflows in the browser.
* **Related Rules:**
  * **Direct Counterpart Pattern:** `PAT-63` (Exploratory Execution Plan Single-Payload Blueprint Law), `PAT-05` (Menditect Frontend Testkit Strict Default Law).
  * **Related Anti-Patterns:** `ANTI-02` (Ice Cream Cone Heavy UI Testing Anti-Pattern), `ANTI-12` (Raw Playwright Connector Bypass Anti-Pattern).

---

### `PAT-64`: Closed Catalog Frontend Testkit Microflow Verification Law
* **Scope:** Frontend | **Classification:** Methodological Law
* **Description:** Mandates that all Frontend test step definitions (in Execution Plans, exploratory JSON blueprints, and persistent MTA test steps) MUST strictly use verified, existing microflows from `MenditectMxFrontendTestKit` and `MenditectPlaywrightConnector` module catalogs. Prohibits inventing, guessing, or assuming unverified synthetic microflow names (e.g. `ACT_Playwright_*`, `Playwright_Click`, `Page_Click`, `SetText`). When designing frontend steps, the agent MUST inspect the testkit catalog in `frontend-testing.md` or `playwright-api.md` and use exact parameter names, data types, and return types.
* **Related Rules:**
  * **Direct Counterpart Anti-Pattern:** `ANTI-21` (Frontend Testkit Microflow Invention / Hallucination Anti-Pattern).
  * **Related Patterns:** `PAT-05` (Menditect Frontend Testkit Strict Default Law), `PAT-13` (Structural Locator Laws), `PAT-62` (Exploratory Frontend Testing via MxFrontendTestKit Structural Laws), `PAT-63` (Exploratory Execution Plan Single-Payload Blueprint Law).

---

### `ANTI-21`: Frontend Testkit Microflow Invention / Hallucination Anti-Pattern
* **Scope:** Frontend | **Classification:** Methodological Anti-Pattern
* **Description:** Inventing, assuming, or hallucinating synthetic helper microflow names (e.g. `ACT_Playwright_*`, `Playwright_Click`, `Page_Click`, `SetText`) that do not exist in the official `MenditectMxFrontendTestKit` or `MenditectPlaywrightConnector` modules. This occurs when test designs bypass catalog inspection and invent generic names, resulting in non-executable plans and broken JSON step payloads.
* **Related Rules:**
  * **Direct Counterpart Pattern:** `PAT-64` (Closed Catalog Frontend Testkit Microflow Verification Law).
  * **Related Anti-Patterns:** `ANTI-12` (Raw Playwright Connector Bypass Anti-Pattern), `ANTI-20` (Frontend UI to Backend Domain Microflow Substitution Anti-Pattern).

---

### `PAT-65`: Execution Plan Visual Formatting & Markdown Component Law
* **Scope:** General | **Classification:** Methodological Law
* **Description:** Mandates that every Execution Plan presented to the user (`# MTA EXECUTION PLAN SIGN-OFF`) strictly adheres to the standardized 8-section layout and required markdown components: (1) Pre-Approval Quality Audit Banner with 13-check collapsible checklist; (2) State Compaction & Target Placement collapsible details block; (3) Prompt vs. Skill Conflict Audit table; (4) Test Case Scope & Dual-Risk Profile open tables; (5) Chronological Step Sequence formatted with a clean summary matrix table (zero in-cell HTML or nested details blocks) followed by standalone collapsible per-step drilldowns (`<details><summary><b>Step N: ...</b></summary>`); (6) Playwright / Browser Settings details block; (7) Data Variation Matrix horizontal table; (8) Applied Testing Patterns & Rationale table citing canonical PAT/ANTI rule IDs. Embedding HTML blocks (`<details>`, `<summary>`, `<br>`) inside Markdown table cells is strictly prohibited, and all emojis/icons must be omitted from headers and plans.
* **Related Rules:**
  * **Related Patterns:** `PAT-12` (Uniform Step Sequence Schema Law), `PAT-43` (Mandatory Dual-Gate Approval), `PAT-60` (Dual-Track Execution Strategy Explicit Declaration in Execution Plan).

---

### `PAT-66`: Exhaustive Exploratory Matrix Execution Law
* **Scope:** General | **Classification:** Platform Execution Law
* **Description:** Mandates that when Option A (Local Exploratory Testing) is selected, the assistant MUST automatically iterate through and execute `MTA_plugin.execute-testcase` for all rows `VAR_01` through `VAR_0N` defined in Section 7 (Data Variation Matrix) of the approved Execution Plan before compiling and presenting the final execution report. Executing only the baseline/template scenario when a multi-row data variation matrix exists is strictly prohibited.
* **Related Rules:**
  * **Direct Counterpart Anti-Pattern:** `ANTI-22` (Single-Scenario Exploratory Truncation Anti-Pattern).
  * **Related Patterns:** `PAT-19` (Data Variation Consolidation Law), `PAT-54` ($M \times N$ Matrix Cell Value Reconciliation Law), `PAT-56` (Dual-Track Decision Gate & Exploratory-First Verification), `PAT-61` (Standard Exploratory Test Execution Report Format), `PAT-63` (Exploratory Execution Plan Single-Payload Blueprint Law).

---

### `ANTI-22`: Single-Scenario Exploratory Truncation Anti-Pattern
* **Scope:** General | **Classification:** Methodological Anti-Pattern
* **Description:** Executing only the baseline/template variation via `MTA_plugin.execute-testcase` during local exploratory testing and halting without executing the remaining planned data variation rows defined in Section 7. This leaves planned boundary conditions, edge cases, and error scenarios unverified prior to reporting or promotion.
* **Related Rules:**
  * **Direct Counterpart Pattern:** `PAT-66` (Exhaustive Exploratory Matrix Execution Law).
  * **Related Anti-Patterns:** `ANTI-08` (Duplicate Test Case Proliferation Anti-Pattern), `ANTI-11` (Delta-Only Override Assumption Anti-Pattern).

---

### `PAT-67`: Exhaustive Page & Snippet Input Widget Discovery and Domain Reconciliation Law
* **Scope:** Frontend | **Classification:** Methodological Law
* **Description:** When designing Frontend execution plans, especially when `GetWidgets` is unavailable or when inspecting complex Mendix pages, the agent MUST perform exhaustive, multi-level widget discovery to identify all form input controls, selection widgets, and interactive triggers:
  1. *Recursive Page & Snippet Inspection:* First execute `mxcli` `DESCRIBE PAGE <Module.Page>` (or `GetWidgets` if MTA is up to date). If any `SnippetCall` references or nested container calls (e.g., `SnippetCall Administration.Account_Details`) are detected, immediately execute `DESCRIBE SNIPPET <Module.Snippet>` recursively for each snippet to uncover all embedded form fields.
  2. *Domain Model Attribute Reconciliation:* Inspect the underlying domain entity via `DESCRIBE ENTITY <Module.Entity>` or `SHOW ENTITY <Module.Entity>` to compare domain attributes against discovered widgets, ensuring no essential input attributes or reference selectors were overlooked.
  3. *Mandatory Input Widget Inventory:* In Section 4 ("Verified Model Elements & Testability Profile") of the Execution Plan, construct an explicit **Input Widget Inventory** table listing every input widget, its widget type (`TextBox`, `DropDown`, `DatePicker`, `CheckBox`, `ReferenceSelector`), its container/snippet/tab location, bound entity/attribute, and verified Testkit locator microflow.
  4. *Complete Step Coverage in Step Sequence:* Ensure Section 5 (Chronological Step Sequence) and Section 7 (Data Variation Matrix) include explicit locate-and-fill steps for all discovered required and relevant form inputs rather than testing only a superficial subset of fields.
* **Related Rules:**
  * **Direct Counterpart Anti-Pattern:** `ANTI-23` (Shallow Page Inspection & Form Input Omission Anti-Pattern).
  * **Related Patterns:** `PAT-05` (Menditect Frontend Testkit Strict Default Law), `PAT-13` (Structural Locator Laws), `PAT-40` (Multi-Object List & Dropdown Seeding), `PAT-42` (Date-Time Offset & Format Pattern Inspection), `PAT-53` (Domain Model Attribute Length & Constraint Verification), `PAT-64` (Closed Catalog Frontend Testkit Microflow Verification Law).

---

### `ANTI-23`: Shallow Page Inspection & Form Input Omission Anti-Pattern
* **Scope:** Frontend | **Classification:** Methodological Anti-Pattern
* **Description:** Inspecting only the top-level widgets of a Mendix page (or relying strictly on keywords mentioned in the user prompt) without recursively inspecting nested snippets (`DESCRIBE SNIPPET`), tab containers, or domain model entity attributes (`DESCRIBE ENTITY`). This causes form input widgets embedded inside snippets or secondary containers to be missed in the Execution Plan, resulting in incomplete test scenarios, unpopulated required fields, and false validation failures.
* **Related Rules:**
  * **Direct Counterpart Pattern:** `PAT-67` (Exhaustive Page & Snippet Input Widget Discovery and Domain Reconciliation Law).
  * **Related Anti-Patterns:** `ANTI-19` (Trial-and-Error Frontend Execution & Raw CSS Selector Bypass), `ANTI-21` (Frontend Testkit Microflow Invention / Hallucination Anti-Pattern).

---

### `PAT-68`: Live Test Data Provisioning & Manual Test Plan Protocol
* **Scope:** General | **Classification:** Methodological Law
* **Description:** When developers or QA engineers perform manual exploratory or structured testing for new features, the agent leverages `MTA_plugin.execute-testcase` with `RollbackTcseAfterExecution = "false"` as a deterministic Test Data Management (TDM) and Manual Test Plan (MTP) execution engine. Instead of requiring human testers to manually click through dozens of setup forms (`ANTI-25`), the agent drafts executable provisioning recipes (`TCEX_RQ`) to instantiate domain graphs, link parent-child associations (`TCEX_RQ_Sfar`), configure user accounts with roles, or advance state via business microflows. The agent outputs a structured Manual Test Data Provisioning Report with top-collapsed execution metadata, created record identifiers, navigation routes, login credentials, step-by-step verification checklists, a ready-to-run teardown manifest, and bottom-collapsed step execution telemetry.
* **Related Rules:**
  * **Direct Counterpart Anti-Pattern:** `ANTI-25` (Manual UI Data Entry Slog Anti-Pattern).
  * **Related Patterns:** `PAT-56` (Dual-Track Decision Gate), `PAT-69` (Two-Phase Manual Data Seeding & Cleanup Inspection), `PAT-70` (Manual-to-Automated Test Promotion Bridge).

---

### `PAT-69`: Two-Phase Manual Data Seeding & Cleanup Inspection
* **Scope:** General | **Classification:** Platform Execution Law
* **Description:** Protects the local development database from unintended state corruption during manual test data operations. 
  1. *Two-Phase Mutating Execution:* Whenever data seeding involves executing custom business logic microflows (`MicroflowCall`) or mutating existing shared records, the agent first executes the payload in dry-run mode (`RollbackTcseAfterExecution = "true"`). Upon verifying zero exceptions and valid business returns, the agent prompts for confirmation and executes the live database commit (`RollbackTcseAfterExecution = "false"`).
  2. *Interactive Cleanup Inspection:* Before executing batch deletes or mass teardowns (`Oact: Delete`), the agent runs a read-only query (`Oact: Retrieve`), presents the exact count and identifiers of candidate records to the user in chat, and deletes only upon explicit user confirmation.
* **Related Rules:**
  * **Direct Counterpart Anti-Pattern:** `ANTI-24` (Dirty Database Test Data Pollution Anti-Pattern).
  * **Related Patterns:** `PAT-68` (Live Test Data Provisioning & Manual Test Plan Protocol), `PAT-18` (Idempotent Test Case Isolation Law).

---

### `PAT-70`: Data Script & Manual Scenario to MTA Conversion Protocol
* **Scope:** General | **Classification:** Methodological Law
* **Description:** Governs converting live test data provisioning / seeding scripts (`TCEX_RQ`) and verified manual test scenarios into persistent MTA Platform assets. Strictly mandates the **Universal Execution Plan Law** (`PAT-43`): no data script may bypass the `# MTA EXECUTION PLAN SIGN-OFF` (Gate 1) and Placement Discovery (Gate 2). Whenever a data script is ready for persistent conversion, the agent MUST present an explicit 3-choice menu with clear educational explanations:
  1. *Option 1: Standalone Data Seeding Test Case (Persistent Data Generator)* - Generates a Backend Execution Plan (1 Case: Data Seeding, direct attribute and association bindings, trailing `Persist`, **NO teardown steps in this test case** so records remain available in the database for manual QA, demos, or downstream tests; Section 6 Playwright is marked NA).
  2. *Option 2: Automated Frontend Test Suite (3-Case UI Pattern)* - Transitions to `mta-test-design` to prompt for the target page, executes single-pass page AST discovery (`PAT-72`), presents the full 10-setting Playwright table, and generates a Frontend Execution Plan (`Case 1: Setup Data Seed` with `_Always`/`_Continue`, `Case 2: Playwright UI Actions` using `MenditectMxFrontendTestKit`, `Case 3: Teardown Cleanup` with cascading delete and `_Always`/`_Continue`).
  3. *Option 3: Automated Backend Integration Suite (3-Case Backend Pattern)* - Prompts for target backend logic, runs `DESCRIBE MICROFLOW` (`PAT-71`), and generates a Backend Execution Plan (`Case 1: Setup Data Seed` with `_Always`/`_Continue`, `Case 2: Microflow Calls & Assertions`, `Case 3: Teardown Cleanup` with cascading delete and `_Always`/`_Continue`; Section 6 Playwright is marked NA).
* **Related Rules:**
  * **Direct Counterpart Anti-Pattern:** `ANTI-16` (Unpromoted Exploratory Test Drift), `ANTI-14` (Execution Plan Bypass).
  * **Related Patterns:** `PAT-02` (3-Test-Case Automated Pattern), `PAT-03` (Universal Teardown Cleanup Law), `PAT-21` (Dual-Requirement Persistence Law), `PAT-41` (Anonymous vs. Role Navigation Resolution), `PAT-43` (Mandatory Dual-Gate Plan & Placement Approval), `PAT-57` (Exploratory-to-Persistent Test Promotion Protocol), `PAT-68` (Live Test Data Provisioning & Manual Test Plan Protocol), `PAT-72` (Single-Pass Page AST Seed Derivation).

---

### `PAT-71`: Targeted Single-Pass Discovery & Semantic Path Tracing
* **Scope:** General | **Classification:** Platform Execution Law
* **Description:** Maximizes model discovery performance and reduces planning latency by extracting the complete component structure in a single command. When a target microflow or page is specified, the agent executes `DESCRIBE MICROFLOW <Module.Name>` or `DESCRIBE PAGE <Module.Name>` on turn 1. The agent extracts input parameters, return types, variables, called sub-microflows, member expressions, and enum literals directly from the self-contained AST, and systematically traces the microflow control flow graph (cascading guard hierarchies, decision combinations, and formula calculations). The agent is strictly prohibited from executing secondary exploratory listing commands (`SHOW MODULES`, `SHOW MICROFLOWS`, `SHOW ENTITIES`, `DESCRIBE ENUMERATION`) when all required elements are present in the primary AST.
* **Related Rules:**
  * **Direct Counterpart Anti-Pattern:** `ANTI-26` (Redundant Exploratory Model Query Cascade).
  * **Related Patterns:** `PAT-01` (MTF Testing Pyramid Alignment), `PAT-58` (Backend Exploratory Execution Lifecycle), `PAT-72` (Single-Pass Page AST Seed Derivation).

---

### `PAT-72`: Single-Pass Page AST Seed Derivation & Testkit Auto-Mapping
* **Scope:** Frontend | **Classification:** Methodological Law
* **Description:** Eliminates recursive CLI cascades when planning Frontend UI tests. The agent inspects the `DESCRIBE PAGE` AST in a single pass to derive the complete seed data profile: the root DataView entity, bound form input attributes (`TextBox`, `DropDown`, `DatePicker`), parent-child association dependencies (`ReferenceSelector`), and collection entities (`DataGrid2`/`ListView`). The agent automatically maps discovered widget types to verified `MenditectMxFrontendTestKit` microflows using a deterministic locator mapping table, avoiding trial-and-error reasoning and eliminating 3–5 separate `DESCRIBE ENTITY` queries. When MTA Server is connected and synchronized, the agent leverages `GetPages` and `GetWidgets` for sub-second zero-CLI discovery.
* **Related Rules:**
  * **Direct Counterpart Anti-Pattern:** `ANTI-23` (Shallow Page Inspection & Form Input Omission Anti-Pattern), `ANTI-26` (Redundant Exploratory Model Query Cascade).
  * **Related Patterns:** `PAT-05` (Frontend Testkit Strict Default), `PAT-40` (Multi-Object List & Dropdown Seeding), `PAT-67` (Exhaustive Page & Snippet Input Widget Discovery).

---

### `PAT-73`: Chained Single-Payload Matrix Execution Law
* **Scope:** General | **Classification:** Platform Execution Law
* **Description:** In local exploratory testing (Option A), when an approved Execution Plan contains $N$ data variation scenarios (`VAR_01`..`VAR_0N`), the agent MUST compile all variations into a single `TCEX_RQ_TestStepRun` array dispatched in **1 single `execute-testcase` tool call** under the existing plugin schema. To prevent database pollution and cross-variation state contamination when testing microflows that create or commit data, each variation block in the sequence MUST follow the self-contained sandwich structure: Seed Data Object Instantiation (with disjoint synthetic keys) -> Microflow Call & Assertion -> Intra-Block Object Deletion (`Action: Delete` via `TCEX_RQ_Sfdr`). The entire batch executes in JVM memory in sub-second time (< 1s) and cleanly rolls back at test completion via `RollbackTcseAfterExecution = "Yes"`.
* **Related Rules:**
  * **Direct Counterpart Anti-Pattern:** `ANTI-27` (Sequential Multi-Turn LLM Matrix Dispatch Anti-Pattern).
  * **Related Patterns:** `PAT-58` (Backend Exploratory Execution Lifecycle), `PAT-61` (Standard Exploratory Test Execution Report Format), `PAT-66` (Exhaustive Exploratory Matrix Execution Law), `PAT-74` (Exploratory Single-Session Conflict Detection & Isolation Protocol).

---

### `PAT-74`: Exploratory Single-Session Conflict Detection & Isolation Protocol
* **Scope:** General | **Classification:** Methodological Law
* **Description:** When designing or executing a chained single-payload matrix (`PAT-73`), the agent MUST audit the target microflow AST during discovery for potential single-session conflict vectors: (1) Database XPath queries or aggregate calculations (`COUNT`, `SUM`) where uncleaned records alter subsequent queries; (2) Unique constraint / duplicate existence checks where identical keys collide; (3) Singleton / application configuration mutations; (4) Non-transactional side-effects (e.g. Java actions calling unmanaged caches or external web services). For database-mutating flows, the agent MUST enforce intra-block object deletions (`Action: Delete` via `TCEX_RQ_Sfdr`) and disjoint synthetic keys (`VAR01-xxx`, `VAR02-xxx`). If non-transactional side-effects or unresolvable state leakage is detected (e.g. `VAR_01` passes but `VAR_02` fails due to persistent session state), the agent MUST trigger the **Session Isolation Fallback Protocol**, cleanly executing each variation in an independent dispatch session.
* **Related Rules:**
  * **Direct Counterpart Anti-Pattern:** `ANTI-28` (Cross-Variation State Contamination & Blind Chaining Anti-Pattern).
  * **Related Patterns:** `PAT-18` (Idempotent Test Case Isolation Law), `PAT-71` (Targeted Single-Pass Discovery & Semantic Path Tracing), `PAT-73` (Chained Single-Payload Matrix Execution Law).

---

### `PAT-76`: Mandatory Exploratory Benchmark & Latency Telemetry Law
* **Scope:** General | **Classification:** Platform Execution Law
* **Description:** In local exploratory testing (Option A), whenever `MTA_plugin.execute-testcase` is invoked, the agent MUST extract, compute, and render the complete **3-Part Performance & Benchmark Profile** in the final test execution report (`PAT-61`): (1) *Wall-Clock & Throughput Telemetry* (Total Execution Time, Step Count, Execution Throughput in steps/second, and Database Commit Overhead); (2) *Operations Breakdown by Step Category Table* (explicit counts, aggregated time share, and avg duration per step category: `Oact: Create/Change/Delete/Persist` vs `MicroflowCall` logic vs transaction rollback); and (3) *Per-Scenario / Per-Step Latency Breakdown Table* (mapping elapsed time per variation block). The agent MUST compute concrete millisecond values from tool execution start/completion timestamps and runtime telemetry, and is strictly prohibited from omitting duration values or using uncalculated placeholder text.
* **Related Rules:**
  * **Direct Counterpart Anti-Pattern:** `ANTI-30` (Exploratory Performance & Latency Telemetry Omission Anti-Pattern).
  * **Related Patterns:** `PAT-58` (Backend Exploratory Execution Lifecycle), `PAT-61` (Standard Exploratory Test Execution Report Format), `PAT-73` (Chained Single-Payload Matrix Execution Law).

---

### `ANTI-24`: Dirty Database Test Data Pollution Anti-Pattern
* **Scope:** General | **Classification:** Methodological Anti-Pattern
* **Description:** Creating or modifying test data in local or shared development environments during manual testing sessions without establishing a structured teardown manifest or tracking mechanism (such as Root Object Cascades, Dedicated Test User Isolation, Time-Window Deltas, or Prefix Tagging). This leaves stale, orphan, or conflicting records in the database, corrupting future test runs and polluting demo environments.
* **Related Rules:**
  * **Direct Counterpart Pattern:** `PAT-69` (Two-Phase Manual Data Seeding & Cleanup Inspection).
  * **Related Patterns:** `PAT-03` (Universal Teardown Cleanup Law), `PAT-18` (Idempotent Test Case Isolation Law), `PAT-68` (Live Test Data Provisioning & Manual Test Plan Protocol).

---

### `ANTI-25`: Manual UI Data Entry Slog Anti-Pattern
* **Scope:** General | **Classification:** Methodological Anti-Pattern
* **Description:** Forcing developers or QA testers to spend hours manually typing data into repetitive, multi-step UI forms just to establish complex prerequisite states for manual testing (e.g. creating 10 customers, 5 addresses, 20 order lines, and applying status transition buttons). This wastes engineering time and introduces human data-entry error into test setups.
* **Related Rules:**
  * **Direct Counterpart Pattern:** `PAT-68` (Live Test Data Provisioning & Manual Test Plan Protocol).
  * **Related Patterns:** `PAT-56` (Dual-Track Decision Gate), `PAT-58` (Backend Exploratory Execution Lifecycle & Telemetry Analysis).

---

### `ANTI-26`: Redundant Exploratory Model Query Cascade
* **Scope:** General | **Classification:** Platform Anti-Pattern
* **Description:** Executing multiple broad, sequential CLI listing commands (such as running `SHOW MODULES`, `SHOW ENTITIES`, `SHOW MICROFLOWS`, or separate `DESCRIBE ENUMERATION` queries) when the target component name is already qualified and its AST self-contains all necessary parameter types, return signatures, subflow invocations, and enum branch cases. This introduces 40–60 seconds of unnecessary latency into test plan design.
* **Related Rules:**
  * **Direct Counterpart Pattern:** `PAT-71` (Targeted Single-Pass Discovery & Semantic Path Tracing), `PAT-72` (Single-Pass Page AST Seed Derivation).
  * **Related Patterns:** `PAT-67` (Exhaustive Page & Snippet Discovery).

---

### `ANTI-27`: Sequential Multi-Turn LLM Matrix Dispatch Anti-Pattern
* **Scope:** General | **Classification:** Methodological Anti-Pattern
* **Description:** Executing a variation matrix in local exploratory mode by invoking `MTA_plugin.execute-testcase` in multiple sequential agent conversation turns (e.g., 9 separate LLM round-trips for 9 scenarios). This introduces 25–40 seconds of unnecessary LLM latency for executions that take only milliseconds inside the Mendix JVM.
* **Related Rules:**
  * **Direct Counterpart Pattern:** `PAT-73` (Chained Single-Payload Matrix Execution Law).
  * **Related Patterns:** `PAT-66` (Exhaustive Exploratory Matrix Execution Law).

---

### `ANTI-28`: Cross-Variation State Contamination & Blind Chaining Anti-Pattern
* **Scope:** General | **Classification:** Methodological Anti-Pattern
* **Description:** Chaining multiple data variations into a single session without performing pre-execution AST conflict audits or applying intra-block deletions and disjoint synthetic keys. This leads to duplicate key constraint exceptions, contaminated XPath database retrieve results in downstream variations, or false negative test failures.
* **Related Rules:**
  * **Direct Counterpart Pattern:** `PAT-74` (Exploratory Single-Session Conflict Detection & Isolation Protocol).
  * **Related Patterns:** `PAT-18` (Idempotent Test Case Isolation Law), `PAT-73` (Chained Single-Payload Matrix Execution Law).

---

### `ANTI-30`: Exploratory Performance & Latency Telemetry Omission Anti-Pattern
* **Scope:** General | **Classification:** Methodological Anti-Pattern
* **Description:** Omitting per-step execution durations, using uncalculated approximations (such as `< 1000 ms` or `[X ms]`), or presenting exploratory test results without the complete 3-part performance benchmark breakdown (wall-clock throughput, operations category split, and per-scenario latency). This deprives developers and QA engineers of critical performance profiling and regression detection insights during local verification.
* **Related Rules:**
  * **Direct Counterpart Pattern:** `PAT-76` (Mandatory Exploratory Benchmark & Latency Telemetry Law).
  * **Related Patterns:** `PAT-61` (Standard Exploratory Test Execution Report Format), `PAT-73` (Chained Single-Payload Matrix Execution Law).

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
| **`PAT-36`** (MTA Model Revision Synchronization) | **`ANTI-17`** (Premature Step Construction on Stale Revision) | Verifying MTA Model Revision is in sync before constructing persistent steps |
| **`PAT-54`** ($M \times N$ Matrix Cell Reconciliation) | **`ANTI-11`** (Delta-Only Override Assumptions) | Explicit cell verification vs assuming copied matrix values |
| **`PAT-55`** (Zero Data in Step Names) | **`ANTI-04`** (Hardcoding Data in Step Names) | Functional action templates vs hardcoding runtime data |
| **`PAT-56`** (Dual-Track Decision Gate) | **`ANTI-15`** (Premature Container Provisioning) | Local exploratory testing first vs premature central container allocation |
| **`PAT-57`** (Exploratory-to-Persistent Promotion) | **`ANTI-16`** (Unpromoted Exploratory Test Drift) | Frictionless test promotion vs leaving ephemeral tests uncommitted |
| **`PAT-59`** (Zero Construction Error & Build Mismatch Diagnostic) | **`ANTI-18`** (Ignored Construction Errors & Cascading Build Failure) | Intercepting build errors, zero construction errors before execution vs blind building/running |
| **`PAT-62`** (Frontend Persistent MTA Construction Law) | **`ANTI-19`** (Trial-and-Error Frontend Execution & Selector Bypass) | Direct 3-case persistent MTA Platform construction vs exploratory UI trial-and-error |
| **`PAT-63`** (Backend Exploratory Single-Payload Blueprint) | **`ANTI-20`** (Frontend UI to Backend Microflow Substitution) | Single-payload exploratory plan for backend vs substituting backend microflows in UI tests |
| **`PAT-64`** (Closed Catalog Frontend Testkit Microflow Verification Law) | **`ANTI-21`** (Frontend Testkit Microflow Invention / Hallucination Anti-Pattern) | Using only verified MenditectMxFrontendTestKit catalog microflows vs inventing synthetic helper microflows |
| **`PAT-66`** (Exhaustive Exploratory Matrix Execution Law) | **`ANTI-22`** (Single-Scenario Exploratory Truncation Anti-Pattern) | Iterating through all data variation rows vs stopping after baseline scenario |
| **`PAT-67`** (Exhaustive Page & Snippet Input Widget Discovery and Domain Reconciliation Law) | **`ANTI-23`** (Shallow Page Inspection & Form Input Omission Anti-Pattern) | Recursive multi-level widget extraction & domain attribute reconciliation vs omitting nested snippet/tab form inputs |
| **`PAT-68`** (Live Test Data Provisioning & Manual Test Plan Protocol) | **`ANTI-25`** (Manual UI Data Entry Slog Anti-Pattern) | Automated live data provisioning & manual test plans vs tedious manual UI form typing |
| **`PAT-69`** (Two-Phase Manual Data Seeding & Cleanup Inspection) | **`ANTI-24`** (Dirty Database Test Data Pollution Anti-Pattern) | Dry-run verification & structured teardown manifests vs unmanaged database pollution |
| **`PAT-70`** (Manual-to-Automated Test Promotion Bridge) | **`ANTI-16`** (Unpromoted Exploratory Test Drift) | Converting verified manual test setups to persistent MTA regression suites vs ephemeral testing |
| **`PAT-71`** (Targeted Single-Pass Discovery & Semantic Path Tracing) | **`ANTI-26`** (Redundant Exploratory Model Query Cascade) | Single-pass AST discovery and control flow path tracing vs multi-query listing cascades |
| **`PAT-72`** (Single-Pass Page AST Seed Derivation & Testkit Auto-Mapping) | **`ANTI-26`** (Redundant Exploratory Model Query Cascade) | Direct seed graph derivation & Testkit locator mapping vs recursive entity/snippet CLI cascades |
| **`PAT-73`** (Chained Single-Payload Matrix Execution Law) | **`ANTI-27`** (Sequential Multi-Turn LLM Matrix Dispatch Anti-Pattern) | Single-call chained payload matrix execution with intra-block teardown vs multi-turn sequential dispatch |
| **`PAT-74`** (Exploratory Single-Session Conflict Detection & Isolation Protocol) | **`ANTI-28`** (Cross-Variation State Contamination & Blind Chaining Anti-Pattern) | AST conflict vector audit, intra-block teardown & fallback to isolated sessions vs blind chained execution |
| **`PAT-75`** (Verified Entity Fixture Attribute Binding Law) | **`ANTI-29`** (Unverified / Assumed Entity Fixture Attributes) | Verifying domain model attributes before fixture compilation vs guessing non-existent entity members |
| **`PAT-76`** (Mandatory Exploratory Benchmark & Latency Telemetry Law) | **`ANTI-30`** (Exploratory Performance & Latency Telemetry Omission Anti-Pattern) | Extracting and displaying full 3-part performance profile vs omitting durations or using uncalculated placeholders |

