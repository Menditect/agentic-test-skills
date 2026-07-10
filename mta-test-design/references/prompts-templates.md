# 📑 Test Prompt Blueprint Templates

**📍 You are here:** `references/prompts-templates.md` | **🏠 Return to:** [MTA Test Design Skill](../SKILL.md)

This reference file contains standardized, copy-pasteable build templates optimized for generating prompts for the `mta-build` skill. Each template aligns with the Menditect Testability Framework (MTF) and MTA guidelines.

> [!IMPORTANT]
> ### 🛡️ THE MTA HANDOFF VERIFICATION GATE & PRE-FILLING RULE
> Before compiling or outputting any build prompt using these templates, the Test Design agent **MUST halt** and present the user with the Interactive Selection Gate:
> 1. **Test Category Selection:** Ask the user to confirm the category:
>    * *Category A (Backend):* For direct microflow testing without a browser.
>    * *Category B (Frontend):* For functional page and widget testing in a browser.
>    * *Recommendation:* Pre-suggest the category determined during the Test Strategy phase.
> 2. **Workflow Mode Selection:** Ask the user to select their desired build workflow:
>    * *Express with Build Plan:* High speed. HALTs to approve specs and steps list before building.
>    * *Full Express Mode:* Maximum speed. HALTs only once to approve specs.
>    * *Guided Mode:* Full control. HALTs at every step and binding during construction.
> 3. **Placement Discovery Setup:** Ask the user to choose their placement path:
>    * *Direct Path:* User inputs the exact target Configuration, Suite, and desired Test Case Name.
>    * *Scan/Explore Path:* Proactively ask the Test Design agent to run MTA scan tools right now to list available active configurations and suites so they can pick.
>    * *Auto-Default Path:* The prompt instructs the builder to automatically create a default suite named `[ModuleName]_Suite` under the default active configuration.
>    * *Builder Discovery Path (TBD):* Specify placement as `"TBD (Scan and confirm during build)"`. This instructs the build skill to run its standard interactive discovery (Phase 0) when it receives the prompt.
> 
> **Zero-Halt Handoff:** Once selections are made, you **MUST** pre-fill these exact parameters into the metadata block of the generated prompt (e.g. `Target Configuration`, `Target Suite`, `MTA Category`, `Workflow Mode`). This removes vague placeholders, enabling a seamless, zero-halt bridge directly into the `mta-build` skill.

> [!IMPORTANT]
> **Low-Code Custom-Logic Rule**: When generating build prompts using these templates, you **MUST** ensure that the objectives and chronological plans focus *solely* on verifying unique, custom business rules, math formulas, validations, or custom UI-specific visibility constraints. Under no circumstance should you include test steps or assertions that verify standard Mendix platform features (e.g., verifying that standard layout templates render, or checking if standard Committer steps write to the database).

---

## 🧪 Template 1: Unit Test (MTA Category A - Backend)

Use this template when testing deterministic business logic, calculations, or validations (`VAL_`, `RULE_`, `FTN_`, `OPR_`).

```markdown
# 📋 MTA BUILD SPECIFICATION HANDOFF (TEMPLATE 1 - UNIT TEST)

## 1. Metadata
*   **Target Application:** `[AppName]`
*   **Target Configuration:** `[UserSelectedTestConfig | TBD (Scan and confirm during build)]`
*   **Target Suite:** `[UserSelectedTestSuite | TBD (Scan and confirm during build)]`
*   **Test Case Name:** `[UserSelectedTestCaseName]`
*   **MTA Category:** Category A (Backend)
*   **Workflow Mode:** `[Express with Build Plan | Full Express | Guided]`

#### 1. High-Level Specifications
*   **Case Name:** `[ModuleName].TC_Unit_[ElementName]_[Scenario]`
*   **Objective:** Verify that `[ElementName]` correctly mitigates the technical risk of `[Technical Risk]` and business risk of `[Business Risk]`.
*   **Preconditions:** None (isolated memory execution).
*   **Expected Result:** The microflow returns `[Expected Return, e.g., true/false/calculated decimal]` for the specified input parameters.

#### 2. Chronological Build Plan (Step Sequence)
1.  **Step 1**: Create options parameter block in memory (if required).
    *   *Type*: Create Object
    *   *Entity*: `[ModuleName].[ParameterEntityName]`
    *   *Execution*: `"Always"`, `_Continue`
2.  **Step 2**: Execute target microflow.
    *   *Type*: Call Microflow
    *   *Microflow*: `[ModuleName].[ElementName]`
    *   *Parameters*: Pipe parameters from Step 1.
    *   *Execution*: `"None"`, `"Stop"`
3.  **Step 3**: Assert returned output.
    *   *Type*: Assert Microflow Return Value
    *   *Assertion*: Assert that return value equals `[Expected Value]`.
    *   *Execution*: `"None"`, `"Stop"`
```

### 📈 Coverage Expansion Strategy: Boundary Values & Negative Cases

To achieve extremely high coverage in Category A Unit Tests, you **MUST** formulate build plans and prompts for multiple test cases covering these critical execution profiles.

> [!IMPORTANT]
> **Data Variation Focus & Risk Prioritization**: When defining and designing data variations, always focus strictly on the relevant attributes that directly change the execution path or logical outcome of the code. Avoid wasting variations on static or non-impactful attributes. If applicable, prioritize and expand variations for attributes carrying high business value or operational risk (such as billing calculations, tax rates, or regulatory limits).

You **MUST** cover these critical execution profiles:

1.  **Standard Happy Path Scenario**: 
    - Verifies that normal, correct inputs result in the expected successful outcomes and state changes.
2.  **Boundary Value Test (BVT) Scenarios**:
    - **Numeric Thresholds**: Test the exact threshold value, plus exactly one unit above and one unit below (e.g., testing age thresholds of 18 requires distinct test cases for `17`, `18`, and `19`).
    - **Mathematical Extremes**: Test with zero (`0`), negative values, and very large integers or decimals.
    - **String Lengths**: Test with empty string (`""`), single-character strings, and extremely long strings.
    - **List/Collection Sizes**: Test with empty lists (`0` items), single-item lists, and multi-item lists.
3.  **Negative Edge Case Scenarios**:
    - **Null and Empty States**: Test passing `null` or unassigned association values to verify defensive guard logic.
    - **Validation Failures**: Test invalid formatting, out-of-range values, or incorrect domain validation flags to ensure that the microflow gracefully handles illegal states.
    - **Exception Assertions**: When an input is expected to trigger an explicit error or crash, build a test case that verifies the error handling. 
      - *MTA Rule*: Downstream, use `CreateAssertException` and set its properties via `SetAssertExceptionProperties` to assert that the target microflow throws the expected error message or error code.

---

## 🔗 Template 2: Integration Test (MTA Category A - Backend)

Use this template when testing multi-step processes or transactional orchestrations (`ORC_`, `CMT_`, `VAL_ORC_`) utilizing **TestLogger** foot-printing.

> [!IMPORTANT]
> **🧠 THE IN-MEMORY PREFERENCE PRINCIPLE (CATEGORY A):**
> - **Preferred Standard:** For all Category A (Backend) tests, the **highly preferred method is to run everything entirely in memory** without database writes (`Persist` steps) or database cleanups. 
> - **Seeding & Setup:** Create required objects in memory using `Create Object` steps, link them, and pass them directly as input parameters to the target microflow. Do **NOT** use `Persist` steps unless:
>   1. The target microflow or any of its sub-microflows explicitly performs a **Database Retrieve** (`[By Database]`) that cannot be satisfied by passing in-memory object lists or associations.
>   2. You need to pass state across separate test cases in the same suite (since in-memory state is isolated at the individual Test Case boundary).
> - **Clean Up:** By avoiding database persistence, you eliminate the need for cleanup/teardown steps, resulting in extremely fast, stable, and self-contained tests that never pollute the database.

```markdown
# 📋 MTA BUILD SPECIFICATION HANDOFF (TEMPLATE 2 - INTEGRATION TEST)

## 1. Metadata
*   **Target Application:** `[AppName]`
*   **Target Configuration:** `[UserSelectedTestConfig | TBD (Scan and confirm during build)]`
*   **Target Suite:** `[UserSelectedTestSuite | TBD (Scan and confirm during build)]`
*   **Test Case Name:** `[UserSelectedTestCaseName]`
*   **MTA Category:** Category A (Backend)
*   **Workflow Mode:** `[Express with Build Plan | Full Express | Guided]`

#### 1. High-Level Specifications
*   **Case Name:** `[ModuleName].TC_Int_[ElementName]_[Scenario]`
*   **Objective:** Verify that `[ElementName]` coordinates business components in the exact sequence, avoiding the operational risk of `[Operational Risk]` and transactional risk of `[ACID Risk]`.
*   **Preconditions:** None (Isolated in-memory execution) or [Database state seeded - ONLY if database retrieve is required].
*   **Expected Result:** Orchestration finishes successfully and the **TestLogger** footprint matches the expected baseline.

#### 2. Chronological Build Plan (Step Sequence)
1.  **Step 1 (Setup - Optional, ONLY if DB-retrieve is required)**: Seed database objects.
    *   *Type*: Create and Persist database entities.
    *   *Execution*: `"Always"`, `_Continue`
2.  **Step 2 (Execution)**: Call parent orchestration microflow.
    *   *Type*: Call Microflow
    *   *Microflow*: `[ModuleName].[ElementName]`
    *   *Parameters*: Pipe seeded in-memory parameter objects (if any).
    *   *Execution*: `"None"`, `"Stop"`
3.  **Step 3 (Assertion)**: Query TestLogger.
    *   *Type*: Call Microflow `TestLogger.GetFootprint` or equivalent.
    *   *Assertion*: Assert that called unit sequence equals the expected footprint baseline.
    *   *Execution*: `"None"`, `"Stop"`
4.  **Step 4 (Teardown - Optional, ONLY if Step 1 was executed)**: Clean up seeded records.
    *   *Type*: Delete and Persist database entities.
    *   *Execution*: `"Always"`, `_Continue`
```

---

## 🖥️ Template 3: Functional UI Test (MTA Category B - Frontend)

Use this template when testing screen layouts, button clicks, client-cache synchronization, and navigational flows (`ACT_` triggered from pages).

```markdown
# 📋 MTA BUILD SPECIFICATION HANDOFF (TEMPLATE 3 - FUNCTIONAL UI TEST)

## 1. Metadata
*   **Target Application:** `[AppName]`
*   **Target Configuration:** `[UserSelectedTestConfig | TBD (Scan and confirm during build)]`
*   **Target Suite:** `[UserSelectedTestSuite | TBD (Scan and confirm during build)]`
*   **Test Case Name:** `[UserSelectedTestCaseName]`
*   **MTA Category:** Category B (Frontend)
*   **Workflow Mode:** `[Express with Build Plan | Full Express | Guided]`

#### 1. High-Level Specifications
*   **Case 1: SETUP**
    *   *Name*: `[ModuleName].TC_UI_[ElementName]_Setup`
    *   *Objective*: Initialize browser environment.
    *   *Execution*: `"Always"`, `_Continue`
*   **Case 2: EXECUTION**
    *   *Name*: `[ModuleName].TC_UI_[ElementName]_Execute`
    *   *Objective*: Verify UI navigation, widget inputs, and page submission, mitigating client desync and brand abandonment.
    *   *Expected Result*: User lands on success page and success notification is displayed.
    *   *Execution*: `"None"`, `"Stop"`
*   **Case 3: TEARDOWN**
    *   *Name*: `[ModuleName].TC_UI_[ElementName]_Teardown`
    *   *Objective*: Close browser context safely.
    *   *Execution*: `"Always"`, `_Continue`

#### 2. Chronological Build Plan (Step Sequence)
*   **CASE 1 (Setup)**:
    1.  Create Playwright browser session (`Start_Playwright_Browser`).
*   **CASE 2 (Execution)**:
    1.  *[Seeding - Always, _Continue]* Create and persist backend records needed for the UI screen context.
    2.  *[UI Startup - Always, _Continue]* Open browser to URL: `[PageLoginRedirectURL]`.
    3.  *[UI Interaction - None, Stop]* Locate and fill text widget `'[WidgetCaption]'` with `[InputValue]`.
    4.  *[UI Interaction - None, Stop]* Locate and click button `'[ButtonCaption]'`.
    5.  *[UI Assertion - None, Stop]* Verify notification text equals `[SuccessMessage]`.
    6.  *[UI Session Stop - Always, _Continue]* Call `Stop_MxFrontendTest`.
    7.  *[Cleanup - Always, _Continue]* Delete and persist seeded database records.
*   **CASE 3 (Teardown)**:
    1.  Call `Teardown_Playwright`.
```

### 🖥️ Frontend Risk-Focus Strategy for Category B Tests

To ensure that frontend tests are highly valuable and not just duplicating backend logic, the prompts for Category B tests **MUST** focus strictly on aspects and risks unique to the frontend that *cannot* be verified via direct backend microflow or unit tests. These include:

1.  **Conditional Visibility & Editability**:
    - Verifying that fields, containers, or buttons are correctly hidden, visible, enabled, or disabled on screen based on the user's role or other data selections (e.g., verifying a "Submit" button is disabled until all required fields are filled).
2.  **Client-Side Validation & Feedback**:
    - Checking that validation error messages, tooltips, or popup dialogs are displayed immediately in the UI when invalid data is entered.
3.  **UI Navigation & Interactive Page Flows**:
    - Verifying multi-page wizards, popup windows (opening and closing), tab switching, and menu navigation sequences.
4.  **Client Cache State & Uncommitted Data**:
    - Testing user interactions that alter the local client-cache state before any server-side database commit occurs (such as entering data, navigating away and back, and verifying the state is preserved or discarded).
5.  **Role-Based Dynamic Layouts**:
    - Verifying that different user roles see different screens, sections, or widgets, ensuring restricted UI elements are inaccessible to unauthorized personas.
6.  **Asynchronous UI Updates & Loading States**:
    - Checking the behavior of loading indicators, progress bars, dynamic search grids, and instant page refreshes upon backend changes.

---

## 🚀 ONBOARDING & STARTER PROMPTS FOR NEW USERS

To help new users get started successfully with MTA and the AI coding assistant, we have compiled a set of proven starter prompts. These prompts are designed to trigger high-quality, structured behaviors from the AI, avoiding typical starting friction.

> [!TIP]
> ### 🔑 Where to find your App Instance Token:
> You can retrieve your secure **App Instance Token** directly from the **MTA Web Portal**:
> 1. Log in to your **MTA Portal** account.
> 2. Select your target **Application** from the dashboard.
> 3. Navigate to the **Application Instances** section.
> 4. Locate your specific environment instance (e.g., `Local`, `Development`, `Staging`) and click to copy its secure **App Instance Token** (or App Token).

### 🔑 The 3 Golden Starter Prompts:

1.  **For Test Architecture and Strategy Planning:**
    > "I want to run strategy planning in MTA using App Instance Token '[AppInstanceToken]'. Suggest a testing blueprint plan for module '[ModuleName]'"
    *   *Why this works:* It provides the secure token context, locks the module scope, and allows the AI to suggest a clean structural separation of tests.

2.  **For Backend Unit Testing:**
    > "I want to build a backend unit test in MTA using App Instance Token '[AppInstanceToken]'. Generate boundary tests for microflow '[ModuleName].[MicroflowName]'"
    *   *Why this works:* It immediately locks Category A (Backend), specifies the target element, and triggers the automated boundary-value analysis (BVT) coverage guidelines.

3.  **For Frontend Functional Testing (Happy Paths):**
    > "I want to build a frontend happy flow in MTA using App Instance Token '[AppInstanceToken]'. Build a test script to '[achieve functional goal X]'"
    *   *Why this works:* It establishes the environment and token, locks Category B (Frontend), and provides the functional user story for UI actions and assertions.

---

### 💡 Additional Specialized MTA AI Starter Prompts:

Based on the capabilities of the MTA skills, users can also use these advanced prompt starters to achieve high-quality results:

#### 🧪 1. For Microflows returning complex Calculations or Decisions:
> "I want to build a backend test case for microflow [ModuleName].[MicroflowName] with data variations. Here is the spec table: [paste data matrix/table]"
*   *Outcome:* Triggers the creation of a Category A (Backend) data-driven test case using the "In-Memory Preference Principle" and automatically sets up duplicated variations with names and descriptions.

#### 🛠️ 2. For Page Security and Dynamic Visibility Checks:
> "Build a frontend test case to verify that the button '[ButtonCaption]' on page [ModuleName].[PageName] is only visible to user role '[RoleName]'"
*   *Outcome:* Locks Category B (Frontend), targets the specific layout rule, and builds the dual-user setup/execution step sequence.

#### 📈 3. For Complex Multi-Step Integration Flows (Transactional):
> "I need an integration test for the orchestration microflow [ModuleName].[OrchestrationMicroflowName]. Show me a plan using TestLogger footprints first."
*   *Outcome:* Instructs the AI to build a Category A transactional integration test and map the exact expected sequence of sub-microflow calls.

#### 🐛 4. For Debugging Runtime Failures:
> "My test case '[TestCaseName]' failed. Here is the execution log output: [paste log snippet]. Help me troubleshoot and fix the test case."
*   *Outcome:* Triggers the `mta-run-analyze` diagnostic skill to parse the error codes and propose specific sequencing or attribute fixes.
