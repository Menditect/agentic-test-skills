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
# MTA BUILD SPECIFICATION HANDOFF (TEMPLATE 1 - UNIT TEST)

> [!NOTE]
> **Pre-Approval Quality Audit:** 13 of 13 compliance checks passed (100% compliant)
> **Category:** Backend | **Execution User:** `MxAdmin` | **Gate Status:** Ready for Gate 1 Review

<details>
<summary><b>Pre-Approval Quality Checklist (13 of 13 Checks Passed)</b></summary>

| # | Check Name | Rule Citation | Scope & Compliance Verification | Status |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **Frontend Split Law** | `PAT-18`, `PAT-03` | Backend Unit Test; browser setup/teardown split NA | `NA` |
| **2** | **Container Formatting & User** | `PAT-11`, `PAT-10` | Rollback & Validation Feedback at TestCase level; `EXUS_ExecutionUser` explicitly assigned | `PASS` |
| **3** | **Backend Direct Piping Deletes** | `PAT-20`, `PAT-16` | In-memory execution without persistence; cleanup NA | `NA` |
| **4** | **Setup Portability** | `PAT-28`, `PAT-41` | In-memory execution without browser setup; URL portability NA | `NA` |
| **5** | **Explicit Filter Attributes & Variations** | `PAT-07`, `PAT-19` | Retrieve handles specified; NULL variations use explicit attribute filters; max 8 cols | `PASS` |
| **6** | **Embedded Step Assertions** | `PAT-08`, `PAT-06` | Assert Object Count / Value compares embedded in producer steps; no standalone steps | `PASS` |
| **7** | **Mandatory Page & Widget Discovery** | `PAT-35`, `PAT-67`, `ANTI-23` | Backend Unit Test; frontend page/snippet discovery NA | `NA` |
| **8** | **Uniform 8-Field Step Schema** | `PAT-12` | All test steps strictly adhere to uniform 8-field schema in exact field order | `PASS` |
| **9** | **Frontend Quality Protocol** | `PAT-41`..`PAT-53` | Backend Unit Test; 8-point frontend verification NA | `NA` |
| **10** | **Dual-Track Strategy Declaration** | `PAT-60` | Option A (Exploratory) vs Option B (Persistent MTA) explicitly declared in Section 1 | `PASS` |
| **11** | **Backend Exploratory Single-Payload Blueprint** | `PAT-63` | Single continuous testcase container with automatic rollback verified for Option A, or NA for Option B | `PASS` / `NA` |
| **12** | **Frontend UI to Backend Microflow Substitution Prohibition** | `ANTI-20` | Backend Unit Test; frontend UI substitution NA | `NA` |
| **13** | **Closed Catalog Frontend Testkit Verification** | `PAT-64`, `ANTI-21` | Backend Unit Test; frontend testkit verification NA | `NA` |

</details>

<details>
<summary><b>1. State Compaction & Target Placement</b></summary>

### MTA STATE COMPACTION BLOCK (SESSION RESTORE)
<!-- Copy and paste this block into a new chat session to instantly restore your conversational state. -->
```json
{
  "MtaState": "[STATE_CONSTRUCTION for Option B | STATE_RUN_ANALYZE for Option A]",
  "TempState": "[null for Option B | STATE_EXPLORATORY_EXECUTION for Option A]",
  "TargetConfig": "[UserSelectedTestConfig | Pending Gate 2 for Option B | null for Option A]",
  "TargetSuite": "[UserSelectedTestSuite | Pending Gate 2 for Option B | null for Option A]",
  "TestCase": "[ModuleName].TC_Unit_[ElementName]_[Scenario]",
  "Category": "Backend",
  "MtaBaseUrl": "[RetrievedUrl]",
  "ExecutionPlanKey": "[GeneratedExecutionPlanKey for Option B | null for Option A]",
  "Context": "Backend Unit Test approved for [ElementName]"
}
```

*   **Target Application:** `[AppName]`
*   **Execution Strategy / Target Mode:** `[Option A: Local Exploratory Test (MTA_plugin - Fast In-Memory Feedback) | Option B: Direct Persistent MTA Test (MTA Server - Full Placement & CI/CD)]`
*   **Target Configuration:** `[UserSelectedTestConfig | Pending Gate 2 for Option B | Bypassed for Option A]`
*   **Target Suite:** `[UserSelectedTestSuite | Pending Gate 2 for Option B | Bypassed for Option A]`
*   **Test Case Name:** `[ModuleName].TC_Unit_[ElementName]_[Scenario]`
*   **MTA Category:** Backend
*   **Execution User (`EXUS_ExecutionUser`):** `[UserSelectedExecutionUser, e.g., MxAdmin | Pending Gate 2 for Option B | Bypassed for Option A]`

</details>

<details>
<summary><b>2. Prompt & Input Log vs. MTA Skill Conflicts (MANDATORY)</b></summary>

*(Explicitly audits the user prompt or raw input log against official MTA Skill Laws. Any conflicts, anti-patterns, or sub-optimal patterns in the user prompt/input are highlighted alongside their automatic skill corrections).*

| # | User Prompt / Input Payload Element | MTA Skill Law Violation | Applied Automatic Correction |
| :-: | :--- | :--- | :--- |
| **1** | `[Raw User Prompt Instruction]` | `[e.g. Direct Attribute Initialization on Create Object [^PAT-06]]` | `[Corrected step / parameter alignment]` |

*(If no conflicts exist between the user prompt/input and MTA Skill Laws, state explicitly: "No conflicts detected. The prompt and input requirements align 100% with official MTA Skill Laws.")*

</details>

## 3. Test Case Scope & Dual-Risk Profile

### Functional Specification Profile
| Specification Property | Detail / Value |
| :--- | :--- |
| **Test Case Identifier** | `[ModuleName].TC_Unit_[ElementName]_[Scenario]` |
| **Primary Objective** | Verify that `[ElementName]` correctly calculates outputs and mitigates operational and integrity risks |
| **Preconditions** | None (Isolated in-memory execution) |
| **Expected Result** | Returns `[Expected Return]` for specified input parameters and passes all embedded assertions |
| **Authentication Scope** | NA (Backend Unit Test) |
| **Recommended MTF Level** | Unit Test (Backend) |

### Dual-Risk Alignment & Mitigation Profile
| Risk Category | Evaluated Risk Profile & Severity | Applied Mitigation Strategy |
| :--- | :--- | :--- |
| **Technical Risk** | `[e.g., ACID & Database Integrity Violation]` *(Severity: High)* | In-memory execution with explicit rollback and atomic count verification |
| **Business Risk** | `[e.g., Calculation Accuracy & Financial Leakage]` *(Severity: Critical)* | Boundary value variation matrix validating strict decimal precision thresholds |

## 4. Verified Model Elements & Testability Profile

| Model Type | Component Name | Verified Attributes, Values & Roles |
| :--- | :--- | :--- |
| **Microflow** | `[ModuleName].[ElementName]` | `[Business logic summary, inputs -> outputs]` |
| **Entity** | `[ModuleName].[ParameterEntityName]` | • `[Attribute1]` *(Type)*<br>• `[Attribute2]` *(Type)* |
| **Entity** | `[ModuleName].[EntityName]` | • `[FilterAttribute]` *(Type)*<br>• `[Amount]` *(Decimal)* |

## 5. Chronological Step Sequence Plan

### Test Case Container Settings: `[ModuleName].TC_Unit_[ElementName]_[Scenario]`
*   **Rollback After Execution:** `RollbackTcseAfterExecution = Yes`
*   **Validation Feedback Assertions (Backend Microflow Tests Only):**
    *   *Compare Member:* `[Target Member, Operator, Comparison String (or NotEquals "__NO_VALIDATION_MESSAGE__" for happy paths)]`
    *   *Message Count:* `Equals 0` *(Happy Path)*

### Step Sequence Matrix
| Step # | Case | Step Type | Target Element / Action | Input Source | Output Handle | Exec Settings | Description & Pattern Rationale |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | Case 1 | `Create Object` | `[ModuleName].[ParameterEntityName]` | Memory | `out_param_obj` | `None` / `_Stop` | Direct Initialization on Create Object [^PAT-06] |
| **2** | Case 1 | `Retrieve Object` | `[ModuleName].[EntityName]` | Database | `out_retrieved_obj` | `None` / `_Stop` | Retrieve Filter & Count Assertion [^PAT-07], [^PAT-08] |
| **3** | Case 1 | `Microflow Call` | `[ModuleName].[ElementName]` | Handles | `out_result` | `None` / `_Stop` | Pure Unit Execution & Direct Return Assertion [^PAT-09] |

### Detailed Step Configurations & Assertions

<details>
<summary><b>Step 1: Create Object ([ModuleName].[ParameterEntityName])</b></summary>

*   **1. Step Type:** `Create Object`
*   **2. Target / Action:** `[ModuleName].[ParameterEntityName]`
*   **3. Input Source / Handles:** `N/A (Memory instantiation)`
*   **4. Output Variable Handle:** `out_param_obj`
*   **5. Parameters & Initial Values:** `[Attribute1 = 'InitialVal']`
*   **6. Embedded Step Assertions:** `None (Embedded assertions are strictly prohibited on Create Object steps)`
*   **7. Execution Settings:** `ExecutionCondition = "None"`, `ResumeExecutionAfterException = "_Stop"`
*   **8. Step Description & Rationale:** `[Pattern: Direct Initialization on Create Object [^PAT-06] - Sets initial attributes directly on creation]`

</details>

<details>
<summary><b>Step 2: Retrieve Object ([ModuleName].[EntityName])</b></summary>

*   **1. Step Type:** `Retrieve Object`
*   **2. Target / Action:** `[ModuleName].[EntityName] (Method: Database | Range: First)`
*   **3. Input Source / Handles:** `N/A (Database)`
*   **4. Output Variable Handle:** `out_retrieved_obj`
*   **5. Parameters & Filters:** `Filter: [ModuleName].[EntityName].[FilterAttribute] = 'TEST_VAL'`
*   **6. Embedded Step Assertions:** `Assert Object Count Equals 1`
*   **7. Execution Settings:** `ExecutionCondition = "None"`, `ResumeExecutionAfterException = "_Stop"`
*   **8. Step Description & Rationale:** `[Pattern: Dual Retrieve/Filter Empty Object & Count Assertion [^PAT-07], [^PAT-08]]`

</details>

<details>
<summary><b>Step 3: Microflow Call ([ModuleName].[ElementName])</b></summary>

*   **1. Step Type:** `Microflow Call`
*   **2. Target / Action:** `[ModuleName].[ElementName]`
*   **3. Input Source / Handles:** `out_param_obj`, `out_retrieved_obj`
*   **4. Output Variable Handle:** `out_result`
*   **5. Parameters & Bindings:** `Pipe: out_param_obj, out_retrieved_obj`
*   **6. Embedded Step Assertions:** `Assert Microflow Return Value: ComparisonOperator = "Equals", ComparisonValue = [Expected Value]`
*   **7. Execution Settings:** `ExecutionCondition = "None"`, `ResumeExecutionAfterException = "_Stop"`
*   **8. Step Description & Rationale:** `[Pattern: Pure Unit Execution & Direct Return Assertion [^PAT-09]]`

</details>

## 6. Playwright / Browser Settings

<details>
<summary><b>Playwright & Browser Environment Settings (Backend Tests - NA)</b></summary>

*   **Status:** NA (Backend Unit Test — executes in memory with zero browser overhead)

</details>

## 7. Data Variation Matrix & Metadata

### Data Variation Matrix
#### Table 1: Scenarios #1 to #3
| Attribute / Step | #1 (HappyPath) | #2 (BoundaryLow) | #3 (EmptyParam) |
| :--- | :--- | :--- | :--- |
| **`Entity.FilterAttribute`** | `'VALID_VAL'` | `'VALID_VAL'` | `'NON_EXISTENT'` |
| **`Entity.Amount`** | `100` | `0` | `100` |
| **Assert Return Value** | `true` | `false` | `false` |

<details>
<summary><b>Scenario Registration Metadata & Variation Recipes</b></summary>

*   **Variation #1 (`HappyPath`):** *Description:* Standard happy path with valid amount.
*   **Variation #2 (`BoundaryLow`):** *Description:* Lower boundary zero amount testing.
*   **Variation #3 (`EmptyParam`):** *Description:* Missing/null parameter object variation.

</details>

## 8. Applied Testing Patterns & Rationale

<details>
<summary><b>Applied Testing Patterns & Architecture Laws</b></summary>

| Applied Testing Pattern | Target Step(s) | Architecture Law Citation | Applied Rationale & Risk Prevention |
| :--- | :--- | :--- | :--- |
| **Direct Initialization on Create Object** | Step 1 | `PAT-06`, `ANTI-01` | Initial attributes set directly on creation step, preventing unnecessary Change Object steps |
| **Dual Retrieve/Filter Empty Object** | Step 2 | `PAT-07` | Enables testing NULL/missing database objects in variation matrix via attribute filter |
| **Retrieve Output Object Count Assertion** | Step 2 -> Step 3 | `PAT-08`, `ANTI-03` | Verifies database query count immediately before passing handle to downstream step, preventing silent null pointers |

</details>
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
# MTA BUILD SPECIFICATION HANDOFF (TEMPLATE 2 - INTEGRATION TEST)

> [!NOTE]
> **Pre-Approval Quality Audit:** 13 of 13 compliance checks passed (100% compliant)
> **Category:** Backend | **Execution User:** `MxAdmin` | **Gate Status:** Ready for Gate 1 Review

<details>
<summary><b>Pre-Approval Quality Checklist (13 of 13 Checks Passed)</b></summary>

| # | Check Name | Rule Citation | Scope & Compliance Verification | Status |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **Frontend Split Law** | `PAT-18`, `PAT-03` | Backend Integration Test; browser setup/teardown split NA | `NA` |
| **2** | **Container Formatting & User** | `PAT-11`, `PAT-10` | Rollback & Validation Feedback at TestCase level; `EXUS_ExecutionUser` explicitly assigned | `PASS` |
| **3** | **Backend Direct Piping Deletes** | `PAT-20`, `PAT-16` | Seeded objects deleted via direct handle piping in teardown step with `_Always` / `_Continue` | `PASS` / `NA` |
| **4** | **Setup Portability** | `PAT-28`, `PAT-41` | Backend test; URL portability NA | `NA` |
| **5** | **Explicit Filter Attributes & Variations** | `PAT-07`, `PAT-19` | Retrieve handles specified; single orchestration run or matrix <= 8 cols | `PASS` |
| **6** | **Embedded Step Assertions** | `PAT-08`, `PAT-06` | TestLogger footprint assertions embedded directly on microflow call step | `PASS` |
| **7** | **Mandatory Page & Widget Discovery** | `PAT-35`, `PAT-67`, `ANTI-23` | Backend Integration Test; frontend page/snippet discovery NA | `NA` |
| **8** | **Uniform 8-Field Step Schema** | `PAT-12` | All test steps strictly adhere to uniform 8-field schema in exact field order | `PASS` |
| **9** | **Frontend Quality Protocol** | `PAT-41`..`PAT-53` | Backend Integration Test; 8-point frontend verification NA | `NA` |
| **10** | **Dual-Track Strategy Declaration** | `PAT-60` | Option A (Exploratory) vs Option B (Persistent MTA) explicitly declared in Section 1 | `PASS` |
| **11** | **Backend Exploratory Single-Payload Blueprint** | `PAT-63` | Single continuous testcase container with automatic rollback verified for Option A, or NA for Option B | `PASS` / `NA` |
| **12** | **Frontend UI to Backend Microflow Substitution Prohibition** | `ANTI-20` | Backend Integration Test; frontend UI substitution NA | `NA` |
| **13** | **Closed Catalog Frontend Testkit Verification** | `PAT-64`, `ANTI-21` | Backend Integration Test; frontend testkit verification NA | `NA` |

</details>

<details>
<summary><b>1. State Compaction & Target Placement</b></summary>

### MTA STATE COMPACTION BLOCK (SESSION RESTORE)
<!-- Copy and paste this block into a new chat session to instantly restore your conversational state. -->
```json
{
  "MtaState": "[STATE_CONSTRUCTION for Option B | STATE_RUN_ANALYZE for Option A]",
  "TempState": "[null for Option B | STATE_EXPLORATORY_EXECUTION for Option A]",
  "TargetConfig": "[UserSelectedTestConfig | Pending Gate 2 for Option B | null for Option A]",
  "TargetSuite": "[UserSelectedTestSuite | Pending Gate 2 for Option B | null for Option A]",
  "TestCase": "[ModuleName].TC_Int_[ElementName]_[Scenario]",
  "Category": "Backend",
  "MtaBaseUrl": "[RetrievedUrl]",
  "ExecutionPlanKey": "[GeneratedExecutionPlanKey for Option B | null for Option A]",
  "Context": "Backend Integration Test approved for [ElementName]"
}
```

*   **Target Application:** `[AppName]`
*   **Execution Strategy / Target Mode:** `[Option A: Local Exploratory Test (MTA_plugin - Fast In-Memory Feedback) | Option B: Direct Persistent MTA Test (MTA Server - Full Placement & CI/CD)]`
*   **Target Configuration:** `[UserSelectedTestConfig | Pending Gate 2 for Option B | Bypassed for Option A]`
*   **Target Suite:** `[UserSelectedTestSuite | Pending Gate 2 for Option B | Bypassed for Option A]`
*   **Test Case Name:** `[ModuleName].TC_Int_[ElementName]_[Scenario]`
*   **MTA Category:** Backend
*   **Execution User (`EXUS_ExecutionUser`):** `[UserSelectedExecutionUser, e.g., MxAdmin | Pending Gate 2 for Option B | Bypassed for Option A]`

</details>

<details>
<summary><b>2. Prompt & Input Log vs. MTA Skill Conflicts (MANDATORY)</b></summary>

*(Explicitly audits the user prompt or raw input log against official MTA Skill Laws. Any conflicts, anti-patterns, or sub-optimal patterns in the user prompt/input are highlighted alongside their automatic skill corrections).*

| # | User Prompt / Input Payload Element | MTA Skill Law Violation | Applied Automatic Correction |
| :-: | :--- | :--- | :--- |
| **1** | `[Raw User Prompt Instruction]` | `[e.g. MTF Testing Pyramid Alignment [^PAT-01]]` | `[In-memory setup configured]` |

*(If no conflicts exist between the user prompt/input and MTA Skill Laws, state explicitly: "No conflicts detected. The prompt and input requirements align 100% with official MTA Skill Laws.")*

</details>

## 3. Test Case Scope & Dual-Risk Profile

### Functional Specification Profile
| Specification Property | Detail / Value |
| :--- | :--- |
| **Test Case Identifier** | `[ModuleName].TC_Int_[ElementName]_[Scenario]` |
| **Primary Objective** | Verify that `[ElementName]` coordinates business components in exact sequence, avoiding operational disruptions |
| **Preconditions** | None (Isolated in-memory execution) or [Database state seeded - ONLY if database retrieve is required] |
| **Expected Result** | Orchestration finishes successfully and TestLogger footprint matches expected baseline |
| **Authentication Scope** | NA (Backend Integration Test) |
| **Recommended MTF Level** | Integration Test (Backend) |

### Dual-Risk Alignment & Mitigation Profile
| Risk Category | Evaluated Risk Profile & Severity | Applied Mitigation Strategy |
| :--- | :--- | :--- |
| **Technical Risk** | `Control Flow & Orchestration (High)` | TestLogger sequence footprint assertion validating sub-process execution order |
| **Business Risk** | `Operational Disruption (Medium)` | End-to-end integration validation across multi-step transactions |

## 4. Verified Model Elements & Testability Profile

| Model Type | Component Name | Verified Attributes, Values & Roles |
| :--- | :--- | :--- |
| **Microflow** | `[ModuleName].[ElementName]` | `[Main orchestration microflow under test]` |
| **Microflow** | `[ModuleName].[SubMicroflow1]` | `[Sub-process 1 called in sequence]` |
| **Microflow** | `[ModuleName].[SubMicroflow2]` | `[Sub-process 2 called in sequence]` |
| **Microflow** | `TestLogger.GetFootprint` | Diagnostic footprint probe verifying exact invocation sequence |

## 5. Chronological Step Sequence Plan

### Test Case Container Settings: `[ModuleName].TC_Int_[ElementName]_[Scenario]`
*   **Rollback After Execution:** `RollbackTcseAfterExecution = Yes`
*   **Validation Feedback Assertions:** `Count Equals 0`

### Step Sequence Matrix
| Step # | Case | Step Type | Target Element / Action | Input Source | Output Handle | Exec Settings | Description & Pattern Rationale |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | Case 1 | `Create Object & Persist` | `[ModuleName].[EntityName]` | Database | `out_seeded_obj` | `Always` / `_Continue` | Seeding Step [^PAT-18] |
| **2** | Case 1 | `Microflow Call` | `[ModuleName].[ElementName]` | `out_seeded_obj` | `out_int_result` | `None` / `_Stop` | Orchestration Execution |
| **3** | Case 1 | `Microflow Call` | `TestLogger.GetFootprint` | None | `out_footprint` | `None` / `_Stop` | Diagnostic Probe Footprint [^PAT-08] |
| **4** | Case 1 | `Delete Object & Persist` | `out_seeded_obj` | `out_seeded_obj` | `N/A` | `Always` / `_Continue` | Backend Teardown Cleanup [^PAT-20] |

### Detailed Step Configurations & Assertions

<details>
<summary><b>Step 1: Create Object & Persist ([ModuleName].[EntityName])</b></summary>

*   **1. Step Type:** `Create Object & Persist`
*   **2. Target / Action:** `[ModuleName].[EntityName]`
*   **3. Input Source / Handles:** `Database`
*   **4. Output Variable Handle:** `out_seeded_obj`
*   **5. Parameters & Attribute Values:** `[Attribute1 = 'Val1']`
*   **6. Embedded Step Assertions:** `None`
*   **7. Execution Settings:** `ExecutionCondition = "Always"`, `ResumeExecutionAfterException = "_Continue"`
*   **8. Step Description & Rationale:** `[Pattern: Seeding Step [^PAT-18] - Prepares database record for sub-microflow retrieve]`

</details>

<details>
<summary><b>Step 2: Microflow Call ([ModuleName].[ElementName])</b></summary>

*   **1. Step Type:** `Microflow Call`
*   **2. Target / Action:** `[ModuleName].[ElementName]`
*   **3. Input Source / Handles:** `out_seeded_obj`
*   **4. Output Variable Handle:** `out_int_result`
*   **5. Parameters & Bindings:** `Pipe: out_seeded_obj`
*   **6. Embedded Step Assertions:** `None`
*   **7. Execution Settings:** `ExecutionCondition = "None"`, `ResumeExecutionAfterException = "_Stop"`
*   **8. Step Description & Rationale:** `[Pattern: Orchestration Execution - Triggers parent workflow]`

</details>

<details>
<summary><b>Step 3: Microflow Call (TestLogger.GetFootprint)</b></summary>

*   **1. Step Type:** `Microflow Call (TestLogger Footprint)`
*   **2. Target / Action:** `TestLogger.GetFootprint`
*   **3. Input Source / Handles:** `None`
*   **4. Output Variable Handle:** `out_footprint`
*   **5. Parameters & Bindings:** `None`
*   **6. Embedded Step Assertions:** `Assert Microflow Return Value: ComparisonOperator = "Equals", ComparisonValue = [Expected Footprint]`
*   **7. Execution Settings:** `ExecutionCondition = "None"`, `ResumeExecutionAfterException = "_Stop"`
*   **8. Step Description & Rationale:** `[Pattern: Diagnostic Probe Footprint [^PAT-08] - Validates sub-process execution order]`

</details>

<details>
<summary><b>Step 4: Delete Object & Persist (out_seeded_obj)</b></summary>

*   **1. Step Type:** `Delete Object & Persist`
*   **2. Target / Action:** `out_seeded_obj (Step 1)`
*   **3. Input Source / Handles:** `out_seeded_obj`
*   **4. Output Variable Handle:** `N/A`
*   **5. Parameters & Bindings:** `None`
*   **6. Embedded Step Assertions:** `None`
*   **7. Execution Settings:** `ExecutionCondition = "Always"`, `ResumeExecutionAfterException = "_Continue"`
*   **8. Step Description & Rationale:** `[Pattern: Backend Teardown Cleanup [^PAT-20] - Removes seeded database record]`

</details>

## 6. Playwright / Browser Settings

<details>
<summary><b>Playwright & Browser Environment Settings (Backend Tests - NA)</b></summary>

*   **Status:** NA (Backend Integration Test — executes in memory)

</details>

## 7. Data Variation Matrix & Metadata

*   **Status:** Single scenario orchestration run (or define variations table if testing multiple paths).

## 8. Applied Testing Patterns & Rationale

<details>
<summary><b>Applied Testing Patterns & Architecture Laws</b></summary>

| Applied Testing Pattern | Target Step(s) | Architecture Law Citation | Applied Rationale & Risk Prevention |
| :--- | :--- | :--- | :--- |
| **Diagnostic Footprint Verification** | Step 3 | `PAT-01`, `PAT-08` | Asserts complete sub-process execution order without mocking internal components |
| **Direct Handle Piping & Teardown Cleanup** | Step 1, Step 4 | `PAT-06`, `PAT-20` | Seeds database entity when required and cleans up via direct handle piping |

</details>
```

---

## 🖥️ Template 3: Functional UI Test (Frontend)

Use this template when testing screen layouts, button clicks, client-cache synchronization, and naviga```markdown
# MTA BUILD SPECIFICATION HANDOFF (TEMPLATE 3 - FUNCTIONAL UI TEST)

> [!NOTE]
> **Pre-Approval Quality Audit:** 13 of 13 compliance checks passed (100% compliant)
> **Category:** Frontend | **Execution User:** `MxAdmin` | **Gate Status:** Ready for Gate 1 Review

<details>
<summary><b>Pre-Approval Quality Checklist (13 of 13 Checks Passed)</b></summary>

| # | Check Name | Rule Citation | Scope & Compliance Verification | Status |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **Frontend Split Law** | `PAT-18`, `PAT-03` | Verifies Case 1 Setup (`_Always`), Case 2 Execute, Case 3 Teardown (`_Always`) | `PASS` |
| **2** | **Container Formatting & User** | `PAT-11`, `PAT-10` | Rollback & settings configured per TestCase container; `EXUS_ExecutionUser` assigned | `PASS` |
| **3** | **Backend Direct Piping Deletes** | `PAT-20`, `PAT-16` | Case 3 Teardown cleans up seeded records via cross-case handle piping | `PASS` |
| **4** | **Setup Portability** | `PAT-28`, `PAT-41` | Relative logical launch paths used (`/index.html`) rather than absolute host URLs | `PASS` |
| **5** | **Explicit Filter Attributes & Variations** | `PAT-07`, `PAT-19` | Retrieve handles specified; list filters use dynamic scalar piping | `PASS` |
| **6** | **Embedded Step Assertions** | `PAT-08`, `PAT-06` | Assertions embedded directly in producer steps / UI element operator steps | `PASS` |
| **7** | **Mandatory Page & Widget Discovery** | `PAT-35`, `PAT-67`, `ANTI-23` | `GetPages`/`GetWidgets` or `DESCRIBE PAGE/SNIPPET/ENTITY` executed; exhaustive widget inventory | `PASS` |
| **8** | **Uniform 8-Field Step Schema** | `PAT-12` | All test steps strictly adhere to uniform 8-field schema in exact field order | `PASS` |
| **9** | **Frontend Quality Protocol** | `PAT-41`..`PAT-53` | 8-point frontend verification (seed data, multiple seed items, navigation, scalar piping) | `PASS` |
| **10** | **Dual-Track Strategy Declaration** | `PAT-60` | Option B (Persistent MTA Platform) explicitly declared in Section 1 | `PASS` |
| **11** | **Frontend Persistent MTA Construction** | `PAT-62` | Direct 3-Case persistent MTA Platform construction; exploratory single-payload format NA | `PASS` |
| **12** | **Frontend UI to Backend Microflow Substitution Prohibition** | `ANTI-20` | All UI actions/assertions drive the browser via Testkit microflows without backend domain substitution | `PASS` |
| **13** | **Closed Catalog Frontend Testkit Verification** | `PAT-64`, `ANTI-21` | All Frontend steps strictly use verified microflows from `MenditectMxFrontendTestKit` and `MenditectPlaywrightConnector` catalogs | `PASS` |

</details>

<details>
<summary><b>1. State Compaction & Target Placement</b></summary>

### MTA STATE COMPACTION BLOCK (SESSION RESTORE)
<!-- Copy and paste this block into a new chat session to instantly restore your conversational state. -->
```json
{
  "MtaState": "STATE_CONSTRUCTION",
  "TempState": null,
  "TargetConfig": "[UserSelectedTestConfig | Pending Gate 2]",
  "TargetSuite": "[UserSelectedTestSuite | Pending Gate 2]",
  "TestCase": "[ModuleName].TC_UI_[ElementName]",
  "Category": "Frontend",
  "MtaBaseUrl": "[RetrievedUrl]",
  "ExecutionPlanKey": "[GeneratedExecutionPlanKey]",
  "Context": "Frontend UI Test approved for [PageName]"
}
```

*   **Target Application:** `[AppName]`
*   **Execution Strategy / Target Mode:** `Option B: Direct Persistent MTA Test (MTA Server - Full Placement & CI/CD)`
*   **Target Configuration:** `[UserSelectedTestConfig | Pending Gate 2]`
*   **Target Suite:** `[UserSelectedTestSuite | Pending Gate 2]`
*   **Test Case Name:** `[ModuleName].TC_UI_[ElementName]`
*   **MTA Category:** Frontend
*   **Execution User (`EXUS_ExecutionUser`):** `[UserSelectedExecutionUser, e.g., MxAdmin | Pending Gate 2]`
*   **Playwright Settings:** `[UserSelectedPlaywrightSettings]`

</details>

<details>
<summary><b>2. Prompt & Input Log vs. MTA Skill Conflicts (MANDATORY)</b></summary>

*(Explicitly audits the user prompt or raw input log against official MTA Skill Laws. Any conflicts, anti-patterns, or sub-optimal patterns in the user prompt/input are highlighted alongside their automatic skill corrections).*

| # | User Prompt / Input Payload Element | MTA Skill Law Violation | Applied Automatic Correction |
| :-: | :--- | :--- | :--- |
| **1** | `[Raw User Prompt Instruction]` | `[e.g. Frontend 3-Case Split Law [^PAT-18]]` | `[Separated into Case 1, Case 2, Case 3]` |

*(If no conflicts exist between the user prompt/input and MTA Skill Laws, state explicitly: "No conflicts detected. The prompt and input requirements align 100% with official MTA Skill Laws.")*

</details>

## 3. Test Case Scope & Dual-Risk Profile

### Functional Specification Profile
| Specification Property | Detail / Value |
| :--- | :--- |
| **Case 1 (Setup)** | `[ModuleName].TC_UI_[ElementName]_Setup` *(Objective: Initialize browser & seed data, Execution: `_Always` / `_Continue`)* |
| **Case 2 (Execution)** | `[ModuleName].TC_UI_[ElementName]_Execute` *(Objective: Verify UI navigation, widget inputs, and page submission, Authentication: `[With Login \| Without Login]`, Execution: `None` / `_Stop`)* |
| **Case 3 (Teardown)** | `[ModuleName].TC_UI_[ElementName]_Teardown` *(Objective: Close browser and clean up seeded records, Execution: `_Always` / `_Continue`)* |
| **Preconditions** | Application running at target base URL; test execution user provisioned |
| **Expected Result** | Browser session launches, navigates to target page, fills inputs, asserts widget visibility/state, and tears down cleanly |
| **Authentication Scope** | `[With Login (admin/1) | Without Login (Anonymous)]` |
| **Recommended MTF Level** | Functional UI Test (Frontend) |

### Dual-Risk Alignment & Mitigation Profile
| Risk Category | Evaluated Risk Profile & Severity | Applied Mitigation Strategy |
| :--- | :--- | :--- |
| **Technical Risk** | `Client Cache & UI Sync (Medium)` | Full browser DOM automation testing real client-side state transitions |
| **Business Risk** | `Brand & User Drop-off (Medium)` | Verifies critical UI user journey and form submission without platform errors |

## 4. Verified Model Elements & Testability Profile

### Model Components Summary
| Model Type | Component Name | Verified Attributes, Values & Roles |
| :--- | :--- | :--- |
| **Page** | `[ModuleName].[PageName]` | • Page Key / CSS: `[PageKey]`<br>• Layout: Atlas Responsive Master Layout |
| **Snippet(s)** | `[ModuleName].[SnippetName]` | • Snippet Key / Call: `[SnippetCall]` (or None if no nested snippets) |
| **Domain Entity** | `[ModuleName].[EntityName]` | • Bound Attributes: `[Attr1 (String), Attr2 (Enum)]` |
| **Navigation** | Default / Role-Based Home Page | Checked via `SHOW NAVIGATION` for target user role |

### Input Widget Inventory (Exhaustive Discovery - PAT-67)
| # | Widget Name | Widget Type | Container / Snippet / Tab | Data Source / Attribute Binding | Testkit Locator & Action Microflow |
| :-: | :--- | :--- | :--- | :--- | :--- |
| **1** | `textBox_CustomerName` | `TextBox` | Main Page (`[ModuleName].[PageName]`) | `Customer.Name` (String 200) | `Locate_MxWidget_TextBox` ➔ `ACT_Fill_TextBox_Input` |
| **2** | `dropDown_Status` | `DropDown` | Main Page | `Customer.Status` (Enum) | `Locate_MxWidget_DropDown` ➔ `ACT_Select_DropDown_Option` |
| **3** | `datePicker_BirthDate` | `DatePicker` | Snippet (`[ModuleName].[SnippetName]`) | `Customer.BirthDate` (DateTime) | `Locate_MxWidget_DatePicker` ➔ `ACT_Fill_DatePicker_Input` |
| **4** | `btn_Save` | `ActionButton` | Main Page Footer | `ACT_SaveCustomer` (Microflow) | `Locate_MxWidget_Button` ➔ `ACT_Click_Button` |

## 5. Chronological Step Sequence Plan

### Step Sequence Matrix

#### Case 1: Setup & Data Seeding (`[ModuleName].TC_UI_[ElementName]_Setup` — Rollback: `No`, Execution: `_Always` / `_Continue`)
| Step # | Case | Step Type | Target Element / Action | Input Source | Output Handle | Exec Settings | Description & Pattern Rationale |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **101** | Case 1 | `Create Object` | `LocalStartOptions` | Memory | `out_options` | `Always` / `_Continue` | Start-and-Stop Boilerplate [^PAT-28] |
| **102** | Case 1 | `Create Object & Persist` | `[ModuleName].[EntityName]` | Database | `out_seeded_obj` | `Always` / `_Continue` | Frontend Setup Seeding [^PAT-18] |

#### Case 2: UI Action & Execution (`[ModuleName].TC_UI_[ElementName]_Execute` — Rollback: `No`, Execution: `None` / `_Stop`)
| Step # | Case | Step Type | Target Element / Action | Input Source | Output Handle | Exec Settings | Description & Pattern Rationale |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **201** | Case 2 | `Start Frontend Session` | `Start_MxFrontend_Test_With_Login` | `out_options` | `out_browser_page` | `Always` / `_Continue` | Start-and-Stop Boilerplate [^PAT-28] |
| **202** | Case 2 | `Locate Page` | `[ModuleName].[PageName]` | `out_browser_page` | `out_page_locator` | `None` / `_Stop` | Page Object Model Locator [^PAT-29] |
| **203** | Case 2 | `Locate Widget & Fill` | `Locate_MxWidget_TextBox` ➔ `ACT_Fill_TextBox_Input` | `out_page_locator` | `out_widget_locator` | `None` / `_Stop` | Structural Locator Law 1 [^PAT-13], [^PAT-64] |
| **204** | Case 2 | `Locate Widget & Click` | `Locate_MxWidget_Button` ➔ `ACT_Click_Button` | `out_page_locator` | `out_button_locator` | `None` / `_Stop` | Structural Locator Law 1 [^PAT-13], [^PAT-64] |
| **205** | Case 2 | `Stop Frontend Test` | `Stop_MxFrontendTest` | `out_browser_page` | `N/A` | `Always` / `_Continue` | Start-and-Stop Boilerplate [^PAT-28] |

#### Case 3: Teardown & Cleanup (`[ModuleName].TC_UI_[ElementName]_Teardown` — Rollback: `No`, Execution: `_Always` / `_Continue`)
| Step # | Case | Step Type | Target Element / Action | Input Source | Output Handle | Exec Settings | Description & Pattern Rationale |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **301** | Case 3 | `Delete Object & Persist` | `out_seeded_obj` | `out_seeded_obj` | `N/A` | `Always` / `_Continue` | Cross-Case Output Piping Teardown [^PAT-20], [^PAT-18] |
| **302** | Case 3 | `Teardown Playwright` | `Teardown_Playwright` | None | `N/A` | `Always` / `_Continue` | Playwright Process Cleanup [^PAT-18] |

### Detailed Step Configurations & Assertions

<details>
<summary><b>Step 101: Create Playwright Options Object (MenditectMxFrontendTestKit.LocalStartOptions)</b></summary>

*   **1. Step Type:** `Create Playwright Options Object`
*   **2. Target / Action:** `MenditectMxFrontendTestKit.LocalStartOptions`
*   **3. Input Source / Handles:** `Memory instantiation`
*   **4. Output Variable Handle:** `out_options`
*   **5. Parameters & Initial Values:** `Headless = true, SlowMo = 0`
*   **6. Embedded Step Assertions:** `None`
*   **7. Execution Settings:** `ExecutionCondition = "Always"`, `ResumeExecutionAfterException = "_Continue"`
*   **8. Step Description & Rationale:** `[Pattern: Start-and-Stop Boilerplate [^PAT-28] - Configures browser startup]`

</details>

<details>
<summary><b>Step 102: Create Object & Persist ([ModuleName].[EntityName])</b></summary>

*   **1. Step Type:** `Create Object & Persist`
*   **2. Target / Action:** `[ModuleName].[EntityName]`
*   **3. Input Source / Handles:** `Database`
*   **4. Output Variable Handle:** `out_seeded_obj`
*   **5. Parameters & Initial Values:** `[Attribute1 = 'SeedVal']`
*   **6. Embedded Step Assertions:** `None`
*   **7. Execution Settings:** `ExecutionCondition = "Always"`, `ResumeExecutionAfterException = "_Continue"`
*   **8. Step Description & Rationale:** `[Pattern: Frontend Setup Seeding [^PAT-18] - Prepares database record for UI screen]`

</details>

<details>
<summary><b>Step 201: Start Frontend Session (MenditectMxFrontendTestKit.Start_MxFrontend_Test_With_Login)</b></summary>

*   **1. Step Type:** `Start Frontend Session (With Login)`
*   **2. Target / Action:** `MenditectMxFrontendTestKit.Start_MxFrontend_Test_With_Login`
*   **3. Input Source / Handles:** `out_options`
*   **4. Output Variable Handle:** `out_browser_page`
*   **5. Parameters & Initial Values:** `Username = 'admin', Password = '1', TargetUrl = '/index.html'`
*   **6. Embedded Step Assertions:** `None`
*   **7. Execution Settings:** `ExecutionCondition = "Always"`, `ResumeExecutionAfterException = "_Continue"`
*   **8. Step Description & Rationale:** `[Pattern: Start-and-Stop Boilerplate [^PAT-28] - Launches browser session]`

</details>

<details>
<summary><b>Step 202: Locate Page ([ModuleName].[PageName])</b></summary>

*   **1. Step Type:** `Locate Page`
*   **2. Target / Action:** `[ModuleName].[PageName]`
*   **3. Input Source / Handles:** `out_browser_page`
*   **4. Output Variable Handle:** `out_page_locator`
*   **5. Parameters & Initial Values:** `PageQualifiedName = '[ModuleName].[PageName]'`
*   **6. Embedded Step Assertions:** `None (Automatic internal page IsVisible check executed by Locate_Page)`
*   **7. Execution Settings:** `ExecutionCondition = "None"`, `ResumeExecutionAfterException = "_Stop"`
*   **8. Step Description & Rationale:** `[Pattern: Page Object Model Locator [^PAT-29] - Modularizes page container context]`

</details>

<details>
<summary><b>Step 203: Locate Widget & Fill Input (textBox_CustomerName)</b></summary>

*   **1. Step Type:** `Locate Widget & Fill Input`
*   **2. Target / Action:** `MenditectMxFrontendTestKit.Locate_MxWidget_TextBox` -> `MenditectMxFrontendTestKit.ACT_Fill_TextBox_Input`
*   **3. Input Source / Handles:** `out_page_locator`
*   **4. Output Variable Handle:** `out_widget_locator`
*   **5. Parameters & Initial Values:** `WidgetName = 'textBox_CustomerName'`, `Value = 'TestInput'`
*   **6. Embedded Step Assertions:** `None`
*   **7. Execution Settings:** `ExecutionCondition = "None"`, `ResumeExecutionAfterException = "_Stop"`
*   **8. Step Description & Rationale:** `[Pattern: Structural Locator Law 1 [^PAT-13] [^PAT-64] - 2-step widget locate and fill chain using verified closed-catalog testkit microflows]`

</details>

<details>
<summary><b>Step 204: Locate Widget & Click Button (btn_Save)</b></summary>

*   **1. Step Type:** `Locate Widget & Click Button`
*   **2. Target / Action:** `MenditectMxFrontendTestKit.Locate_MxWidget_Button` -> `MenditectMxFrontendTestKit.ACT_Click_Button`
*   **3. Input Source / Handles:** `out_page_locator`
*   **4. Output Variable Handle:** `out_button_locator`
*   **5. Parameters & Initial Values:** `WidgetName = 'btn_Save'`
*   **6. Embedded Step Assertions:** `None`
*   **7. Execution Settings:** `ExecutionCondition = "None"`, `ResumeExecutionAfterException = "_Stop"`
*   **8. Step Description & Rationale:** `[Pattern: Structural Locator Law 1 [^PAT-13] [^PAT-64] - 2-step widget locate and click chain using verified closed-catalog testkit microflows]`

</details>

<details>
<summary><b>Step 205: Stop Frontend Test (MenditectMxFrontendTestKit.Stop_MxFrontendTest)</b></summary>

*   **1. Step Type:** `Stop Frontend Test`
*   **2. Target / Action:** `MenditectMxFrontendTestKit.Stop_MxFrontendTest`
*   **3. Input Source / Handles:** `out_browser_page`
*   **4. Output Variable Handle:** `N/A`
*   **5. Parameters & Initial Values:** `None`
*   **6. Embedded Step Assertions:** `None`
*   **7. Execution Settings:** `ExecutionCondition = "Always"`, `ResumeExecutionAfterException = "_Continue"`
*   **8. Step Description & Rationale:** `[Pattern: Start-and-Stop Boilerplate [^PAT-28] - Closes active browser session]`

</details>

<details>
<summary><b>Step 301: Delete Object & Persist (out_seeded_obj)</b></summary>

*   **1. Step Type:** `Delete Object & Persist`
*   **2. Target / Action:** `out_seeded_obj (Case 1 Step 102 via cross-case piping)`
*   **3. Input Source / Handles:** `out_seeded_obj`
*   **4. Output Variable Handle:** `N/A`
*   **5. Parameters & Initial Values:** `None`
*   **6. Embedded Step Assertions:** `None`
*   **7. Execution Settings:** `ExecutionCondition = "Always"`, `ResumeExecutionAfterException = "_Continue"`
*   **8. Step Description & Rationale:** `[Pattern: Cross-Case Output Piping Teardown [^PAT-20] [^PAT-18] - Cleans up seeded setup record]`

</details>

<details>
<summary><b>Step 302: Teardown Playwright (MenditectPlaywrightConnector.Teardown_Playwright)</b></summary>

*   **1. Step Type:** `Teardown Playwright`
*   **2. Target / Action:** `MenditectPlaywrightConnector.Teardown_Playwright`
*   **3. Input Source / Handles:** `None`
*   **4. Output Variable Handle:** `N/A`
*   **5. Parameters & Initial Values:** `None`
*   **6. Embedded Step Assertions:** `None`
*   **7. Execution Settings:** `ExecutionCondition = "Always"`, `ResumeExecutionAfterException = "_Continue"`
*   **8. Step Description & Rationale:** `[Pattern: Playwright Process Cleanup [^PAT-18] - Ensures zero orphan browser processes]`

</details>

## 6. Playwright / Browser Settings

<details>
<summary><b>Playwright & Browser Environment Settings (Frontend UI Tests)</b></summary>

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

</details>

## 7. Data Variation Matrix & Metadata

### Data Variation Matrix (Horizontal Layout)
#### Table 1: Scenarios #1 to #3
| Target Step & Parameter | #1 (`standard-happy-flow`) | #2 (`special-character-input`) | #3 (`maximum-length-input`) |
| :--- | :--- | :--- | :--- |
| **System Variation Name** | `standard-happy-flow` | `special-character-input` | `maximum-length-input` |
| **Business Scenario Description** | Standard valid UI form submission | Form submission with accent characters and punctuation | Form submission with upper boundary length input |
| **Step 203: `txt_CustomerName`** | `'Jane Doe'` | `'Renée O\'Connor'` | `'Alexander Bartholomew Montgomery-Smith'` |
| **Step 204: `txt_Email`** | `'jane.doe@example.com'` | `'renee.oconnor@example.com'` | `'alex.montgomery@example.com'` |
| **Step 209: Assert Grid Row Exists** | `true` (`'Jane Doe'`) | `true` (`'Renée O\'Connor'`) | `true` (`'Alexander Bartholomew...'`) |

<details>
<summary><b>Scenario Registration Metadata & Variation Recipes</b></summary>

*   **Variation #1 (`standard-happy-flow`):** *Description:* Standard valid UI form submission.
*   **Variation #2 (`special-character-input`):** *Description:* Form submission with accent characters and punctuation.
*   **Variation #3 (`maximum-length-input`):** *Description:* Form submission with upper boundary length input.

</details>

## 8. Applied Testing Patterns & Rationale

<details>
<summary><b>Applied Testing Patterns & Architecture Laws</b></summary>

| Applied Testing Pattern | Target Step(s) | Architecture Law Citation | Applied Rationale & Risk Prevention |
| :--- | :--- | :--- | :--- |
| **Frontend 3-Case Split Law** | Case 1 -> Case 2 -> Case 3 | `PAT-18`, `PAT-03` | Separates setup seeding, UI execution, and cleanup across 3 isolated test cases with `_Always` / `_Continue` settings on setup and teardown |
| **Structural Locator Law 1** | Steps 203, 204 | `PAT-13`, `PAT-64` | Enforces direct 2-step widget locate and action chains using closed-catalog microflows |
| **Start-and-Stop Boilerplate** | Steps 101, 201, 205, 302 | `PAT-28`, `PAT-18` | Controls clean browser instance lifecycle from initialization through safe process teardown |
| **Closed Catalog Frontend Testkit Verification** | Steps 201, 202, 203, 204, 205, 302 | `PAT-64`, `ANTI-21` | All UI actions and teardowns use verified closed catalog microflows from MenditectMxFrontendTestKit and MenditectPlaywrightConnector |
| **Frontend UI to Backend Microflow Substitution Prohibition** | Case 2 | `ANTI-20` | All UI interactions drive the browser via Testkit microflows without substituting backend domain microflows |

</details>
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

#### 📋 5. For Manual Test Plans & Live Test Data Provisioning (New Feature):
> "I want to manually test the new feature '[FeatureName]' on page '[ModuleName].[PageName]'. Create a Manual Test Plan with live test data provisioning."
*   *Outcome:* Triggers `PAT-68` to inspect the domain model and pages via `mxcli`, generates a structured Manual Test Plan (MTP) with executable `execute-testcase` data seeding recipes (`RollbackTcseAfterExecution = "false"`), navigation instructions, manual test checklist, and teardown manifest.

#### ⚡ 6. For Ad-Hoc Live Test Data Seeding (Exploratory / Manual Testing):
> "Seed 3 test customers with Gold tier and 2 open orders in module '[ModuleName]' so I can test the discount calculation manually in the browser."
*   *Outcome:* Builds and executes a direct `MTA_plugin.execute-testcase` live payload (`RollbackTcseAfterExecution = "false"`), outputs the provisioned entity inventory, and sets up instant teardown tracking.

#### 🧹 7. For Manual Test Data Teardown & Database Cleanup:
> "Clean up the test data created for order '[OrderNumber]' / user '[Username]' during my manual test session."
*   *Outcome:* Triggers `PAT-69` interactive cleanup inspection, retrieves matching records, shows the deletion breakdown, and executes deterministic teardown (`Oact: Delete`).

