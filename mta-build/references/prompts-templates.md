# 📑 Test Prompt Blueprint Templates

**📍 You are here:** `references/prompts-templates.md` | **🏠 Return to:** [MTA Test Design Skill](../SKILL.md)

This reference file contains standardized, copy-pasteable build templates optimized for generating prompts for the `mta-build` skill. Each template aligns with the Menditect Testability Framework (MTF) and MTA guidelines.

> [!IMPORTANT]
> ### 🛡️ THE MTA HANDOFF VERIFICATION GATE & PRE-FILLING RULE
> Before compiling or outputting any build prompt using these templates, the Test Design agent **MUST follow the 3-step interactive planning loop**:
> 1. **Step 1: Test Specification & Scope Drafting (Part 1):** Draft functional objectives, authentication/login requirement (*With vs Without Login* for Frontend), and step sequence WITHOUT asking placement questions or making placement assumptions.
> 2. **Step 2: Placement Resolution Procedure (Part 2):** Display the mandatory warning notice:
>    > ⚠️ **Important Notice:** The AI Assistant is **strictly prohibited from creating new Test Configurations**. If a new Test Configuration is needed, you must manually create it inside the MTA web application first.
>    Then interactively scan Application (`GetApplicationByName` / `GetTestConfigurationsForApplicationKey`), Test Suite (`GetTestSuites`), and Test Case Name (`GetTestCases`).
> 3. **Step 3: Playwright / Browser Settings Finalization (Part 3 - Frontend Only):**
>    * Executed **AFTER** placement is provided in Step 2.
>    * **Existing Suite Check:** If placing a Frontend test into an existing Test Suite that already contains Frontend tests, ask the user to choose between Option 1 (inherit existing suite settings), Option 2 (override suite Playwright settings), or Option 3 (create new 3-case pattern block in suite), explaining why and the consequences of each choice.
>    * **New Suite Check:** If placing into a new Test Suite (or suite with 0 frontend tests), present the explicit table displaying **ALL 10 Playwright Settings**, showing both the **Default / Selected Value** AND **ALL Available Alternative Options** for every setting key.
> 
> **Zero-Halt Handoff:** Once selections are made, you **MUST** pre-fill these exact parameters into the metadata block of the generated prompt (`Target Configuration`, `Target Suite`, `MTA Category`, `Playwright Settings`). This removes vague placeholders, enabling a seamless, zero-halt bridge directly into the `mta-build` skill.

> [!IMPORTANT]
> **Low-Code Custom-Logic Rule**: When generating build prompts using these templates, you **MUST** ensure that the objectives and chronological plans focus *solely* on verifying unique, custom business rules, math formulas, validations, or custom UI-specific visibility constraints. Under no circumstance should you include test steps or assertions that verify standard Mendix platform features (e.g., verifying that standard layout templates render, or checking if standard Committer steps write to the database).

---

## 🧪 Template 1: Unit Test (Backend)

Use this template when testing deterministic business logic, calculations, or validations (`VAL_`, `RULE_`, `FTN_`, `OPR_`).

```markdown
# 📋 MTA BUILD SPECIFICATION HANDOFF (TEMPLATE 1 - UNIT TEST)

## 1. Metadata & Placement
*   **Target Application:** `[AppName]`
*   **Target Configuration:** `[UserSelectedTestConfig]`
*   **Target Suite:** `[UserSelectedTestSuite]`
*   **Test Case Name:** `[UserSelectedTestCaseName]`
*   **MTA Category:** Backend
*   **Execution User (`EXUS_ExecutionUser`):** `[UserSelectedExecutionUser, e.g., MxAdmin]`

## 2. Prompt & Input Log vs. MTA Skill Conflicts (MANDATORY)
| User Prompt / Execution Log Input | MTA Skill Law / Rule Citation | Conflict Detected? | Automatic Skill Correction Applied |
| :--- | :--- | :--- | :--- |
| `[Raw User Prompt Instruction]` | `[e.g. Direct Attribute Initialization on Create Object [^PAT-06]]` | `[Yes / None]` | `[Corrected step / parameter alignment]` |

## 3. Test Case Documentation & Risk Alignment
*   **Case Name:** `[ModuleName].TC_Unit_[ElementName]_[Scenario]`
*   **Objective:** Verify that `[ElementName]` correctly mitigates the technical risk of `[Technical Risk]` and business risk of `[Business Risk]`.
*   **Preconditions:** None (isolated memory execution).
*   **Expected Result:** The microflow returns `[Expected Return, e.g., true/false/calculated decimal]` for the specified input parameters.
*   **Authentication Requirement:** NA (Backend Unit Test)
*   **Technical Risk Profile:** `[e.g., ACID & Data Integrity]`
*   **Business Risk Profile:** `[e.g., Financial & Calculation Accuracy]`
*   **Recommended MTF Level:** Unit Test (Backend)

## 4. Verified Elements & MTF Testability Check
*   **Target Microflow:** `[ModuleName].[ElementName]`
*   **Input Entity / Entities:** `[ModuleName].[ParameterEntityName]`
*   **Return Type:** `[e.g. Boolean / Decimal / Object]`

## 5. Chronological Step Sequence Plan (Uniform 8-Field Schema)
1.  **Step 1**:
    *   *Step Type*: Create Object
    *   *Target / Entity / Action*: `[ModuleName].[ParameterEntityName]`
    *   *Input Source / Handles*: Memory instantiation
    *   *Output Variable Handle*: `out_param_obj`
    *   *Parameters & Attribute Values*: `[Attribute1 = 'InitialVal']`
    *   *Embedded Step Assertions*: None
    *   *Execution Settings*: `ExecutionCondition = "None"`, `ResumeExecutionAfterException = "_Stop"`
    *   *Step Description & Pattern Rationale*: `[Pattern: Direct Initialization on Create Object [^PAT-06] - Sets initial attributes directly on creation]`
2.  **Step 2**:
    *   *Step Type*: Retrieve Object
    *   *Target / Entity / Action*: `[ModuleName].[EntityName]`
    *   *Input Source / Handles*: Database
    *   *Output Variable Handle*: `out_retrieved_obj`
    *   *Parameters & Attribute Values*: Filter `[ModuleName].[EntityName].[FilterAttribute] = 'TEST_VAL'`
    *   *Embedded Step Assertions*: None
    *   *Execution Settings*: `ExecutionCondition = "None"`, `ResumeExecutionAfterException = "_Stop"`
    *   *Step Description & Pattern Rationale*: `[Pattern: Dual Retrieve/Filter Empty Object [^PAT-07] - Enables NULL object variation via attribute filter]`
3.  **Step 3**:
    *   *Step Type*: Assert Object Count
    *   *Target / Entity / Action*: `out_retrieved_obj` (Step 2)
    *   *Input Source / Handles*: `out_retrieved_obj`
    *   *Output Variable Handle*: None
    *   *Parameters & Attribute Values*: `Operator = "Equals"`, `Count = 1`
    *   *Embedded Step Assertions*: `ObjectCount == 1`
    *   *Execution Settings*: `ExecutionCondition = "None"`, `ResumeExecutionAfterException = "_Stop"`
    *   *Step Description & Pattern Rationale*: `[Pattern: Retrieve Output Object Count Assertion [^PAT-08] - Validates object count before downstream consumption]`
4.  **Step 4**:
    *   *Step Type*: Call Microflow
    *   *Target / Entity / Action*: `[ModuleName].[ElementName]`
    *   *Input Source / Handles*: `out_param_obj`, `out_retrieved_obj`
    *   *Output Variable Handle*: `out_result`
    *   *Parameters & Attribute Values*: Pipe `out_param_obj` and `out_retrieved_obj`
    *   *Embedded Step Assertions*: None
    *   *Execution Settings*: `ExecutionCondition = "None"`, `ResumeExecutionAfterException = "_Stop"`
    *   *Step Description & Pattern Rationale*: `[Pattern: Pure Unit Execution - Executes business microflow]`
5.  **Step 5**:
    *   *Step Type*: Assert Microflow Return Value
    *   *Target / Entity / Action*: `out_result` (Step 4)
    *   *Input Source / Handles*: `out_result`
    *   *Output Variable Handle*: None
    *   *Parameters & Attribute Values*: `ComparisonOperator = "Equals"`, `ComparisonValue = [Expected Value]`
    *   *Embedded Step Assertions*: `ReturnValue == [Expected Value]`
    *   *Execution Settings*: `ExecutionCondition = "None"`, `ResumeExecutionAfterException = "_Stop"`
    *   *Step Description & Pattern Rationale*: `[Pattern: Direct Return Assertion - Verifies calculation result]`

## 6. Playwright / Browser Settings (10 Keys)
*   **Status:** NA (Backend Unit Test - runs headlessly in memory)

## 7. Data Variation Matrix & Metadata (MANDATORY HORIZONTAL & MAX 8-COLUMN LAYOUT)
### 📊 Data Variation Matrix
#### Table 1: Scenarios #1 to #3
| Attribute / Step | #1 (HappyPath) | #2 (BoundaryLow) | #3 (EmptyParam) |
| :--- | :--- | :--- | :--- |
| **`Entity.FilterAttribute`** | `'VALID_VAL'` | `'VALID_VAL'` | `'NON_EXISTENT'` |
| **`Entity.Amount`** | `100` | `0` | `100` |
| **Assert Return Value** | `true` | `false` | `false` |

### 📝 System Registration Recipe & Metadata List
*   **Variation #1 (`HappyPath`):** *Description:* Standard happy path with valid amount.
*   **Variation #2 (`BoundaryLow`):** *Description:* Lower boundary zero amount testing.
*   **Variation #3 (`EmptyParam`):** *Description:* Missing/null parameter object variation.

## 8. Applied Testing Patterns & Rationale (MANDATORY PATTERN EXPLANATION)
*   **Applied Pattern:** `Retrieve / Microflow Output Object Count Assertion Pattern [^PAT-08]`
    *   **Target Step(s):** Step 2 -> Step 3 -> Step 4
    *   **Explanation:** Asserting that Step 2 returns exactly 1 object before passing to Step 4 prevents downstream silent null pointers and unhandled errors.
*   **Applied Pattern:** `Direct Attribute Initialization on Create Object [^PAT-06]`
    *   **Target Step(s):** Step 1
    *   **Explanation:** Sets initial attributes directly on creation step, avoiding separate Change Object steps.
```

### 📈 Coverage Expansion Strategy: Boundary Values & Negative Cases

To achieve extremely high coverage in Backend Unit Tests, you **MUST** formulate build plans and prompts for multiple test cases covering these critical execution profiles.

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

## 🔗 Template 2: Integration Test (Backend)

Use this template when testing multi-step processes or transactional orchestrations (`ORC_`, `CMT_`, `VAL_ORC_`) utilizing **TestLogger** foot-printing.

> [!IMPORTANT]
> **🧠 THE IN-MEMORY PREFERENCE PRINCIPLE (BACKEND):**
> - **Preferred Standard:** For all Backend tests, the **highly preferred method is to run everything entirely in memory** without database writes (`Persist` steps) or database cleanups. 
> - **Seeding & Setup:** Create required objects in memory using `Create Object` steps, link them, and pass them directly as input parameters to the target microflow. Do **NOT** use `Persist` steps unless:
>   1. The target microflow or any of its sub-microflows explicitly performs a **Database Retrieve** (`[By Database]`) that cannot be satisfied by passing in-memory object lists or associations.
>   2. You need to pass state across separate test cases in the same suite (since in-memory state is isolated at the individual Test Case boundary).
> - **Clean Up:** By avoiding database persistence, you eliminate the need for cleanup/teardown steps, resulting in extremely fast, stable, and self-contained tests that never pollute the database.

```markdown
# 📋 MTA BUILD SPECIFICATION HANDOFF (TEMPLATE 2 - INTEGRATION TEST)

## 1. Metadata & Placement
*   **Target Application:** `[AppName]`
*   **Target Configuration:** `[UserSelectedTestConfig]`
*   **Target Suite:** `[UserSelectedTestSuite]`
*   **Test Case Name:** `[UserSelectedTestCaseName]`
*   **MTA Category:** Backend
*   **Execution User (`EXUS_ExecutionUser`):** `[UserSelectedExecutionUser, e.g., MxAdmin]`

## 2. Prompt & Input Log vs. MTA Skill Conflicts (MANDATORY)
| User Prompt / Execution Log Input | MTA Skill Law / Rule Citation | Conflict Detected? | Automatic Skill Correction Applied |
| :--- | :--- | :--- | :--- |
| `[Raw User Prompt Instruction]` | `[e.g. In-Memory Preference Principle [^PAT-16]]` | `[None]` | `[In-memory setup configured]` |

## 3. Test Case Documentation & Risk Alignment
*   **Case Name:** `[ModuleName].TC_Int_[ElementName]_[Scenario]`
*   **Objective:** Verify that `[ElementName]` coordinates business components in the exact sequence, avoiding the operational risk of `[Operational Risk]` and transactional risk of `[ACID Risk]`.
*   **Preconditions:** None (Isolated in-memory execution) or [Database state seeded - ONLY if database retrieve is required].
*   **Expected Result:** Orchestration finishes successfully and the **TestLogger** footprint matches the expected baseline.
*   **Authentication Requirement:** NA (Backend Integration Test)
*   **Technical Risk Profile:** `Control Flow & Orchestration (Medium/High)`
*   **Business Risk Profile:** `Operational Disruption (Medium)`
*   **Recommended MTF Level:** Integration Test (Backend)

## 4. Verified Elements & MTF Testability Check
*   **Target Microflow:** `[ModuleName].[ElementName]`
*   **Underlying Microflows Called:** `[Module.Sub1]`, `[Module.Sub2]`
*   **TestLogger Probe Configured:** Yes

## 5. Chronological Step Sequence Plan (Uniform 8-Field Schema)
1.  **Step 1 (Setup - Optional, ONLY if DB-retrieve is required)**:
    *   *Step Type*: Create Object & Persist
    *   *Target / Entity / Action*: `[ModuleName].[EntityName]`
    *   *Input Source / Handles*: Database
    *   *Output Variable Handle*: `out_seeded_obj`
    *   *Parameters & Attribute Values*: `[Attribute1 = 'Val1']`
    *   *Embedded Step Assertions*: None
    *   *Execution Settings*: `ExecutionCondition = "Always"`, `ResumeExecutionAfterException = "_Continue"`
    *   *Step Description & Pattern Rationale*: `[Pattern: Seeding Step - Prepares database record for sub-microflow retrieve]`
2.  **Step 2 (Execution)**:
    *   *Step Type*: Call Microflow
    *   *Target / Entity / Action*: `[ModuleName].[ElementName]`
    *   *Input Source / Handles*: `out_seeded_obj`
    *   *Output Variable Handle*: `out_int_result`
    *   *Parameters & Attribute Values*: Pipe `out_seeded_obj`
    *   *Embedded Step Assertions*: None
    *   *Execution Settings*: `ExecutionCondition = "None"`, `ResumeExecutionAfterException = "_Stop"`
    *   *Step Description & Pattern Rationale*: `[Pattern: Orchestration Execution - Triggers parent workflow]`
3.  **Step 3 (Assertion)**:
    *   *Step Type*: Call Microflow (TestLogger Footprint)
    *   *Target / Entity / Action*: `TestLogger.GetFootprint`
    *   *Input Source / Handles*: None
    *   *Output Variable Handle*: `out_footprint`
    *   *Parameters & Attribute Values*: None
    *   *Embedded Step Assertions*: Assert footprint matches `[Expected Footprint]`
    *   *Execution Settings*: `ExecutionCondition = "None"`, `ResumeExecutionAfterException = "_Stop"`
    *   *Step Description & Pattern Rationale*: `[Pattern: TestLogger Integration Footprint - Validates sub-process execution order]`
4.  **Step 4 (Teardown - Optional, ONLY if Step 1 was executed)**:
    *   *Step Type*: Delete Object & Persist
    *   *Target / Entity / Action*: `out_seeded_obj` (Step 1)
    *   *Input Source / Handles*: `out_seeded_obj`
    *   *Output Variable Handle*: None
    *   *Parameters & Attribute Values*: None
    *   *Embedded Step Assertions*: None
    *   *Execution Settings*: `ExecutionCondition = "Always"`, `ResumeExecutionAfterException = "_Continue"`
    *   *Step Description & Pattern Rationale*: `[Pattern: Backend Teardown Cleanup - Removes seeded database record]`

## 6. Playwright / Browser Settings (10 Keys)
*   **Status:** NA (Backend Integration Test - runs headlessly)

## 7. Data Variation Matrix & Metadata (MANDATORY HORIZONTAL & MAX 8-COLUMN LAYOUT)
*   **Status:** Single scenario orchestration run (or define variations table if testing multiple paths).

## 8. Applied Testing Patterns & Rationale (MANDATORY PATTERN EXPLANATION)
*   **Applied Pattern:** `TestLogger Footprint Verification [^PAT-01]`
    *   **Target Step(s):** Step 3
    *   **Explanation:** Asserts complete sub-process execution order without mocking internal components.
```

---

## 🖥️ Template 3: Functional UI Test (Frontend)

Use this template when testing screen layouts, button clicks, client-cache synchronization, and navigational flows (`ACT_` triggered from pages).

```markdown
# 📋 MTA BUILD SPECIFICATION HANDOFF (TEMPLATE 3 - FUNCTIONAL UI TEST)

## 1. Metadata & Placement
*   **Target Application:** `[AppName]`
*   **Target Configuration:** `[UserSelectedTestConfig]`
*   **Target Suite:** `[UserSelectedTestSuite]`
*   **Test Case Name:** `[UserSelectedTestCaseName]`
*   **MTA Category:** Frontend
*   **Execution User (`EXUS_ExecutionUser`):** `MxAdmin`
*   **Playwright Settings:** `[UserSelectedPlaywrightSettings]`

## 2. Prompt & Input Log vs. MTA Skill Conflicts (MANDATORY)
| User Prompt / Execution Log Input | MTA Skill Law / Rule Citation | Conflict Detected? | Automatic Skill Correction Applied |
| :--- | :--- | :--- | :--- |
| `[Raw User Prompt Instruction]` | `[e.g. Frontend 3-Case Split Law [^PAT-18]]` | `[Yes / None]` | `[Separated into Case 1, Case 2, Case 3]` |

## 3. Test Case Documentation & Risk Alignment
*   **Case 1 (Setup):** `[ModuleName].TC_UI_[ElementName]_Setup` (Objective: Initialize browser & seed data, Execution: `_Always` / `_Continue`)
*   **Case 2 (Execution):** `[ModuleName].TC_UI_[ElementName]_Execute` (Objective: Verify UI navigation, widget inputs, and page submission, Authentication: `[With Login | Without Login]`, Execution: `None` / `_Stop`)
*   **Case 3 (Teardown):** `[ModuleName].TC_UI_[ElementName]_Teardown` (Objective: Close browser and clean up seeded records, Execution: `_Always` / `_Continue`)
*   **Technical Risk Profile:** `Client Cache & UI Sync (Low/Medium)`
*   **Business Risk Profile:** `Brand & User Drop-off (Low/Medium)`
*   **Recommended MTF Level:** Functional UI Test (Frontend)

## 4. Verified Elements & MTF Testability Check
*   **Target Page:** `[ModuleName].[PageName]` (CSS Class: `[PageClassName]`)
*   **Target Widgets:** `[Widget1]`, `[Widget2]`, `[SubmitButton]`
*   **Navigation Document:** Default / Role-Based Home Page checked via `SHOW NAVIGATION`

## 5. Chronological Step Sequence Plan (Uniform 8-Field Schema)
### CASE 1: Setup & Data Seeding
1.  **Step 101**:
    *   *Step Type*: Create Playwright Options Object
    *   *Target / Entity / Action*: `MenditectMxFrontendTestKit.LocalStartOptions`
    *   *Input Source / Handles*: Memory instantiation
    *   *Output Variable Handle*: `out_options`
    *   *Parameters & Attribute Values*: `Headless = true`, `SlowMo = 0`
    *   *Embedded Step Assertions*: None
    *   *Execution Settings*: `ExecutionCondition = "Always"`, `ResumeExecutionAfterException = "_Continue"`
    *   *Step Description & Pattern Rationale*: `[Pattern: Start-and-Stop Boilerplate [^PAT-31] - Configures browser startup]`
2.  **Step 102**:
    *   *Step Type*: Create Object & Persist (Data Seeding)
    *   *Target / Entity / Action*: `[ModuleName].[EntityName]`
    *   *Input Source / Handles*: Database
    *   *Output Variable Handle*: `out_seeded_obj`
    *   *Parameters & Attribute Values*: `[Attribute1 = 'SeedVal']`
    *   *Embedded Step Assertions*: None
    *   *Execution Settings*: `ExecutionCondition = "Always"`, `ResumeExecutionAfterException = "_Continue"`
    *   *Step Description & Pattern Rationale*: `[Pattern: Frontend Setup Seeding [^PAT-18] - Prepares database record for UI screen]`

### CASE 2: UI Action & Execution
3.  **Step 201**:
    *   *Step Type*: Start Frontend Session (With/Without Login)
    *   *Target / Entity / Action*: `MenditectMxFrontendTestKit.Start_MxFrontend_Test_With_Login`
    *   *Input Source / Handles*: `out_options`
    *   *Output Variable Handle*: `out_browser_page`
    *   *Parameters & Attribute Values*: `Username = 'admin'`, `Password = '1'`, `TargetUrl = '/index.html'`
    *   *Embedded Step Assertions*: None
    *   *Execution Settings*: `ExecutionCondition = "Always"`, `ResumeExecutionAfterException = "_Continue"`
    *   *Step Description & Pattern Rationale*: `[Pattern: Start-and-Stop Boilerplate [^PAT-31] - Launches browser session]`
4.  **Step 202**:
    *   *Step Type*: Locate Page
    *   *Target / Entity / Action*: `[ModuleName].[PageName]` (`PageClassName`)
    *   *Input Source / Handles*: `out_browser_page`
    *   *Output Variable Handle*: `out_page_locator`
    *   *Parameters & Attribute Values*: `PageQualifiedName = '[ModuleName].[PageName]'`
    *   *Embedded Step Assertions*: None
    *   *Execution Settings*: `ExecutionCondition = "None"`, `ResumeExecutionAfterException = "_Stop"`
    *   *Step Description & Pattern Rationale*: `[Pattern: Page Object Model Locator [^PAT-32] - Modularizes page container context]`
5.  **Step 203**:
    *   *Step Type*: Locate Widget & Fill Input
    *   *Target / Entity / Action*: `[WidgetCaption]`
    *   *Input Source / Handles*: `out_page_locator`
    *   *Output Variable Handle*: `out_widget_locator`
    *   *Parameters & Attribute Values*: `Value = 'TestInput'`
    *   *Embedded Step Assertions*: None
    *   *Execution Settings*: `ExecutionCondition = "None"`, `ResumeExecutionAfterException = "_Stop"`
    *   *Step Description & Pattern Rationale*: `[Pattern: Structural Locator Law 1 [^PAT-30] - 2-step widget locate and fill chain]`
6.  **Step 204**:
    *   *Step Type*: Locate Widget & Click Button
    *   *Target / Entity / Action*: `[ButtonCaption]`
    *   *Input Source / Handles*: `out_page_locator`
    *   *Output Variable Handle*: `out_button_locator`
    *   *Parameters & Attribute Values*: None
    *   *Embedded Step Assertions*: None
    *   *Execution Settings*: `ExecutionCondition = "None"`, `ResumeExecutionAfterException = "_Stop"`
    *   *Step Description & Pattern Rationale*: `[Pattern: Structural Locator Law 1 [^PAT-30] - 2-step widget locate and click chain]`
7.  **Step 205**:
    *   *Step Type*: Stop Frontend Test
    *   *Target / Entity / Action*: `MenditectMxFrontendTestKit.Stop_MxFrontendTest`
    *   *Input Source / Handles*: `out_browser_page`
    *   *Output Variable Handle*: None
    *   *Parameters & Attribute Values*: None
    *   *Embedded Step Assertions*: None
    *   *Execution Settings*: `ExecutionCondition = "Always"`, `ResumeExecutionAfterException = "_Continue"`
    *   *Step Description & Pattern Rationale*: `[Pattern: Start-and-Stop Boilerplate [^PAT-31] - Closes active browser session]`

### CASE 3: Teardown & Cleanup
8.  **Step 301**:
    *   *Step Type*: Delete Object & Persist
    *   *Target / Entity / Action*: `out_seeded_obj` (Case 1 Step 102 via cross-case piping)
    *   *Input Source / Handles*: `out_seeded_obj`
    *   *Output Variable Handle*: None
    *   *Parameters & Attribute Values*: None
    *   *Embedded Step Assertions*: None
    *   *Execution Settings*: `ExecutionCondition = "Always"`, `ResumeExecutionAfterException = "_Continue"`
    *   *Step Description & Pattern Rationale*: `[Pattern: Cross-Case Output Piping Teardown [^PAT-20] - Cleans up seeded setup record]`
9.  **Step 302**:
    *   *Step Type*: Teardown Playwright
    *   *Target / Entity / Action*: `MenditectMxFrontendTestKit.Teardown_Playwright`
    *   *Input Source / Handles*: None
    *   *Output Variable Handle*: None
    *   *Parameters & Attribute Values*: None
    *   *Embedded Step Assertions*: None
    *   *Execution Settings*: `ExecutionCondition = "Always"`, `ResumeExecutionAfterException = "_Continue"`
    *   *Step Description & Pattern Rationale*: `[Pattern: Playwright Process Cleanup - Ensures zero orphan browser processes]`

## 6. Playwright / Browser Settings (MANDATORY FRONTEND TABLE - ALL 10 KEYS)
| Setting Key | Default / Selected Value | All Available Alternative Options |
| :--- | :--- | :--- |
| **1. Browser Environment** | `Locally` | `Playwright Server`, `Azure Workspaces` |
| **2. Browser Type** | `Chromium` | `Firefox`, `WebKit` |
| **3. Execution Mode** | `Headless` | `Headed` (Visual browser window) |
| **4. Viewport Dimensions** | `1280 x 720` | `1920 x 1080`, `1366 x 768`, `375 x 812` (Mobile), Custom |
| **5. Target Base URL / Path** | `http://localhost:8080/index.html` | Custom URL string or relative launch path |
| **6. Action Delay (SlowMo)** | `0 ms` (Server) / `100 ms` (Local) | Custom delay in milliseconds |
| **7. Default Timeout** | `30,000 ms` | `15,000 ms`, `60,000 ms`, Custom timeout in ms |
| **8. Tracing (Trace)** | `true` (Enabled) | `false` (Disabled) |
| **9. Browser Locale** | System Default (`en-US`) | `nl-NL`, `de-DE`, `fr-FR`, or valid BCP-47 tag |
| **10. Virtual Timezone ID** | System Default (`Europe/Amsterdam`) | `UTC`, `America/New_York`, `Asia/Tokyo`, or valid IANA ID |

## 7. Data Variation Matrix & Metadata (MANDATORY HORIZONTAL & MAX 8-COLUMN LAYOUT)
*   **Status:** Single happy-path UI verification (or headless backend variation pattern for validation matrices).

## 8. Applied Testing Patterns & Rationale (MANDATORY PATTERN EXPLANATION)
*   **Applied Pattern:** `Frontend 3-Case Split Law [^PAT-18]`
    *   **Target Step(s):** Case 1 Setup -> Case 2 Execution -> Case 3 Teardown
    *   **Explanation:** Separates setup seeding, UI execution, and cleanup across 3 isolated test cases with `_Always` / `_Continue` settings on setup and teardown.
*   **Applied Pattern:** `Structural Locator Law 1 [^PAT-30]`
    *   **Target Step(s):** Steps 203, 204
    *   **Explanation:** Enforces direct 2-step widget locate and action chains without intermediate wrappers.
```

### 🖥️ Frontend Risk-Focus Strategy for Frontend Tests

To ensure that frontend tests are highly valuable and not just duplicating backend logic, the prompts for Frontend tests **MUST** focus strictly on aspects and risks unique to the frontend that *cannot* be verified via direct backend microflow or unit tests. These include:

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
    *   *Why this works:* It immediately locks Backend, specifies the target element, and triggers the automated boundary-value analysis (BVT) coverage guidelines.

3.  **For Frontend Functional Testing (Happy Paths):**
    > "I want to build a frontend happy flow in MTA using App Instance Token '[AppInstanceToken]'. Build a test script to '[achieve functional goal X]'"
    *   *Why this works:* It establishes the environment and token, locks Frontend, and provides the functional user story for UI actions and assertions.

---

### 💡 Additional Specialized MTA AI Starter Prompts:

Based on the capabilities of the MTA skills, users can also use these advanced prompt starters to achieve high-quality results:

#### 🧪 1. For Microflows returning complex Calculations or Decisions:
> "I want to build a backend test case for microflow [ModuleName].[MicroflowName] with data variations. Here is the spec table: [paste data matrix/table]"
*   *Outcome:* Triggers the creation of a Backend data-driven test case using the "In-Memory Preference Principle" and automatically sets up duplicated variations with names and descriptions.

#### 🛠️ 2. For Page Security and Dynamic Visibility Checks:
> "Build a frontend test case to verify that the button '[ButtonCaption]' on page [ModuleName].[PageName] is only visible to user role '[RoleName]'"
*   *Outcome:* Locks Frontend, targets the specific layout rule, and builds the dual-user setup/execution step sequence.

#### 📈 3. For Complex Multi-Step Integration Flows (Transactional):
> "I need an integration test for the orchestration microflow [ModuleName].[OrchestrationMicroflowName]. Show me a plan using TestLogger footprints first."
*   *Outcome:* Instructs the AI to build a Backend transactional integration test and map the exact expected sequence of sub-microflow calls.

#### 🐛 4. For Debugging Runtime Failures:
> "My test case '[TestCaseName]' failed. Here is the execution log output: [paste log snippet]. Help me troubleshoot and fix the test case."
*   *Outcome:* Triggers the `mta-run-analyze` diagnostic skill to parse the error codes and propose specific sequencing or attribute fixes.
