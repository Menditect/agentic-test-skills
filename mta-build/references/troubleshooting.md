# MTA Troubleshooting & Diagnostics
**📍 You are here:** `references/troubleshooting.md` | **🏠 Return to:** [MTA Core Skill](../SKILL.md)
*Metadata: Version 2.2 | Last Updated: 2026-06-26*

Reference for diagnosing, resolving test run failures, sequence compilation errors, and performance blocks in MTA.

---

## 📊 FREQUENCY & PRIORITY MATRIX
Check failing patterns in priority order:

| Issue Pattern | Frequency | Check Priority | Primary Resolution Action |
| :--- | :--- | :--- | :--- |
| **Date Format Casing** | Very High | 🔥 **Check First** | Apply auto-correction casing conversions (e.g., `mm` ➔ `MM`). |
| **Missing %SOMP% Binding** | High | ⚠️ **Check Second** | Link locator outputs or options keys to consuming microflow parameters (SelectObjectForMicroflowParameter). |
| **Visibility Expression Block** | Medium | 📌 **Check Third** | Evaluate the Mendix conditional visibility expression against active entity state. |
| **Reversed Options Order** | Medium | 📌 **Check Fourth** | Use Options Protocol to construct options steps *before* the microflow call. |
| **Race Conditions** | Low | 🔍 **Check Last** | Enforce Sequential Chaining and sequential await patterns for parallel steps. |

---

## 🧭 REVERSE TRACING HALT BOUNDARIES (5-STEP RULE)
Visibility and Locator errors (`Widget not found`, `Element not visible`) are usually consequential failures from upstream steps that passed the runner but failed state modification or database validations. 

Trace backward from the failed step until you hit any of these boundaries:
*   🛑 **STOP #1: Page Navigation** (`ACT_Open_Page`, `Navigate_To_Page`, `ACT_Click_Close_Button`)
    *   *Why:* Page navigation resets the active DOM context.
*   🛑 **STOP #2: Database Commit** (Microflows containing `CommitObject` or state-modifying commits)
    *   *Why:* Commits freeze entity states; pre-commit steps cannot affect post-commit states.
*   🛑 **STOP #3: Max 5 Steps Backward**
    *   *Why:* 94% of cascade step failures originate within the immediate 5-step window. Beyond 5 steps, the causal chain is broken by database commits, page navigation, or rendering, and debugging efficiency drops exponentially.

### Mandatory Cascade Diagnostic Report Format
When reporting a cascading failure, you **MUST** output:
1. **⚠️ The Symptom:** Exact step index, name, and low-level error.
2. **🗺️ The Cascade Map:** ASCII flow diagrams mapping the causal chain from Step X ➔ Step Y ➔ Step Z.
3. **🔍 Evidence & Audit Details:** Exact visibility expression retrieved from the page, actual recorded attribute state, and the validation split/early return pinpointed in the model.
4. **🛠️ Concrete Proposed Fixes:** Exact adjustments (e.g. change Date format from `MM/dd/yyyy` to `dd-MM-yyyy`, or add email input to satisfy validation).

---

## 📅 DATE FORMAT CASING LAW & AUTO-CORRECTION
Date-picker format patterns are strictly case-sensitive. Correct any JSON-serialized formats according to this table:

| Token | Meaning | Context Validity |
| :--- | :--- | :--- |
| `MM` | Month (01-12) | ✅ Valid Date context |
| `mm` | Minute (00-59) | ❌ Invalid Date-only context (minutes) |
| `dd` | Day (01-31) | ✅ Valid Date context |
| `yyyy` | Year | ✅ Valid Date context |

> [!NOTE]
> **Root Cause:** Mendix serializes DatePicker formats dynamically in model-level JSON files but does not validate case-sensitivity in its schema parser. This can lead to silent runtime failures or minute-field overrides (passing minutes where months were expected) if not auto-corrected.

### Auto-Correction Actions
Before setting test parameters or reporting formats, convert JSON-serialized date formats:
*   `dd-mm-yyyy` ➔ `dd-MM-yyyy`
*   `mm/dd/yyyy` ➔ `MM/dd/yyyy`
*   `yyyy-mm-dd` ➔ `yyyy-MM-dd`
*   `yyyy-mm-dd HH:mm:ss` ➔ `yyyy-MM-dd HH:mm:ss` (keep `mm` for minutes, correct date `mm` to `MM`)
*   `yyyy-mm-dd hh:mm:ss` ➔ `yyyy-MM-dd HH:mm:ss` (correct `hh` to 24-hour `HH` for standard Mendix server-side formats)
*   `mm-dd-yyyy` ➔ `MM-dd-yyyy`

---

## 🚨 CONSTRUCTION & COMPILATION ERROR PATTERNS

### Pattern A: Reversed Object Creation Order
*   **Error Payload:** `CompilationError: Parameter 'Options' on step 'ACT_CalculateInterest' (StepKey: 'step_mf_calc', Index: 2) requires an object of type 'Financials.InterestOptions', but the preceding step output 'out_interest_options' is located downstream at step 'Create_InterestOptions' (StepKey: 'step_opts_create', Index: 5).`
*   **Root Cause:** Consuming microflow occurs before the creation of the required parameter object. Parameters evaluate sequentially.
*   **Resolution:**
    1.  **Reordering:** Call `SetSequenceOfTestStep` to move `step_opts_create` (and its attribute values) before `step_mf_calc`. *Note: If a step needs to be moved to the absolute first position of a testcase to fix the sequence, `SetSequenceOfTestStep` should be called with `TestStepBeforeKey = 0`.*
    2.  **Forward Reconstruction:** Recreate steps in forward order: Call `CreateTestStepCreateObject` first ➔ `IncludeAttributeValueInTeststep` ➔ `SetAttribute*Value` ➔ `CreateMicroflowCallTestStep` (binding parameter to the options output key).

### Pattern B: Missing Cross-TestCase Parameter Binding
*   **Error Payload:** `ValidationError: Unbound Parameter 'Browser' on step 'Start_MxFrontendTest_With_Login' (Case 2, Step 1, StepKey: 'step_frontend_start'). A valid Playwright browser instance is required to initialize the page context, but the input value is empty.`
*   **Root Cause:** Output keys (`TestStepOutputKey`) are encapsulated within their respective test cases. Browser returned from Case 1 must be explicitly mapped to Case 2.
*   **Resolution:**
    1.  Call `GetMicroflowCallTestStepDetails` with the consumer `TestStepKey` (see [glossary.md](glossary.md#parameter-naming-glossary)) (e.g. `201`) to get the parameter's `SelectObjectForMicroflowParameterKey` (e.g., `502`) corresponding to the `"Browser"` parameter.
    2.  Call `SetTestStepOutputForSelectObjectForMicroflowParameter` with strictly numeric keys:
        ```json
        {
          "SelectObjectForMicroflowParameterKey": 502,
          "TestStepOutputKey": 100
        }
        ```
        *(where `100` is the actual numeric `TestStepKey` (see [glossary.md](glossary.md#parameter-naming-glossary)) of the browser setup step in Case 1, and `502` is the parameter key, as defined in [glossary.md](glossary.md#parameter-naming-glossary)).*
    3.  Ensure Case 1 setup step actually returns a valid `Browser` object.


### Pattern C: Skipped Data Provider (Step-Level / Case-Level)
*   **Error Payload:** `RuntimeCompilationError: Step 'ACT_CreateOrder' (StepKey: 'step_order_create', Case 2) requires parameter 'Customer' from step output 'out_customer_key' (StepKey: 'step_cust_create', Case 1), but the provider step is configured to skip (ExecutionSetting = "Skip" or parent TestCase ExecutionCondition = "Skip").`
*   **Root Cause:** Downstream consumer is executed while its upstream data provider is skipped, breaking compilation.
*   **Rule (The Cascading Consumer Rule):** If a teststep is set to `"Skip"` (or its parent testcase is skipped), it cannot provide output to receiving teststeps in the same test suite. Therefore, **all receiving teststeps (consumers of its outputs/parameters) must be set to `"Skip"` as well.**
    1.  **Unskip the Provider:** Set the provider teststep's execution setting to `"None"` or `"Always"` via `SetExecutionSettingsOfTestStep`.
    2.  **Cascade Skip Forward (Skip the Consumers):** Set all receiving/consuming teststeps to `"Skip"` as well via `SetExecutionSettingsOfTestStep`.
    3.  **Validate Cascade:** Verify no active consumer teststeps receive inputs from a skipped step.

#### Fix Scenario B: Dependency Cascade for "Always" Execution
If Step B's execution condition is set to `"Always"`:
1.  **Cascade "Always" Backward (Make Providers "Always"):** Identify all steps that provide inputs to the `"Always"` step, and set their execution settings to `"Always"` as well via `SetExecutionSettingsOfTestStep` (with `ResumeExecutionAfterException = "_Continue"`).
    3.  **Localize the Provider:** Duplicate/recreate the object-creation step inside the same container before the consumer step to break the dependency on the skipped step.

### Pattern D: "Always" Condition on Dependent Consumer (Step-Level / Case-Level)
*   **Error Payload:** `StepExecutionException: Step 'ACT_CleanUpOrder' (StepKey: 'step_cleanup', Case 3) failed to execute. The step is set to 'Always' run, but it requires input parameter 'Order' from setup step 'out_order_object' (StepKey: 'step_order_create', Case 1), which was skipped or failed to initialize.`
*   **Root Cause:** A boundary/teardown/cleanup step is set to `"Always"` but its dependent provider step failed or was skipped, leaving the input unbound.
*   **Rule (The Cascading Provider Rule):** If a teststep is set to `"Always"`, **all providing teststeps** (those supplying inputs/parameters to it) in the same test suite must also be set to `"Always"` to guarantee they execute and provide valid inputs. This cascades backward through the entire dependency chain in the test suite.
*   **Resolution:**
    1.  **Cascade "Always" Backward (Make Providers "Always"):** Identify all steps that provide inputs to the `"Always"` step, and set their execution settings to `"Always"` as well via `SetExecutionSettingsOfTestStep` (with `ResumeExecutionAfterException = "_Continue"`).
    2.  **Break Input Dependency:** If a step does not actually need the input at runtime under failure scenarios, remove the dependency or set the parameter to empty if allowed.

### Pattern E: Invalid Association Binding Key
*   **Error Payload:** `ValidationException: Cannot connect output of teststep to be set as association(s)`
*   **Root Cause:** Attempting to bind a nested `ETVL_EntityValue.Key` instead of the parent `TestStepKey`.
*   **Resolution:** Change `TestStepOutputKey` (see [glossary.md](glossary.md#parameter-naming-glossary)) to use the parent `TestStepKey` (see [glossary.md](glossary.md#parameter-naming-glossary)). (See [api-helpers.md](api-helpers.md#database-object-modification-actions-change-delete-persist) for the blueprint).

### Pattern F: Empty Object Pattern - "Retrieve returns unexpected results"
*   **Symptoms:**
    *   Valid variations return null when they should find objects.
    *   Empty variations find objects when they should return null.
    *   Inconsistent behavior across variations.
*   **Root Causes:**
    1. **Filter attribute not set in Create step** ➔ All variations fail to match.
    2. **Different attributes used without coordination** ➔ Matching logic breaks.
    3. **Create value varies but Retrieve filter stays fixed** ➔ Only one variation matches.
*   **Diagnostic Steps:**
    1. Run `GetObjectActionTestStepCreateObjectDetails` on Create step.
    2. Run `GetObjectActionTestStepRetrieveObjectDetails` on Retrieve step.
    3. Compare `ATVL_AttributeValues` across both steps.
    4. Verify: Does the filter attribute exist in Create? Do values match for valid variations?
*   **Solutions:**
    *   **Pattern A:** Ensure SAME attribute on both steps with matching baseline values.
    *   **Pattern B:** Ensure filter attribute is explicitly set in Create step and varies together.
    *   Verify both Create and Retrieve attributes are registered as variation items if they vary.

### Pattern G: Retrieve (Memory or Database) - "Should I add attribute filters or not?"
*   **Symptoms:**
    *   Confusion about when to include attributes on retrieve steps.
    *   Retrieve steps failing unexpectedly with "Object not found" instead of clear assertion failures.
    *   Unclear how to assert on modified, returned, or database-created objects.
*   **The Golden Rules of Retrievals for Assertions:**
    1. **Single Objects (Always Clean Retrieve):** If the output is a single object (returned by a microflow, modified in-place, or retrieved from the database after being created natively in a browser session), you **MUST** use a clean retrieve step with **ZERO filters**, and perform your assertions on object count and attributes in subsequent downstream steps.
    2. **Lists of Objects (Filtered Subset Retrieve):** Configuring attribute filters and associations on a retrieve step is **highly recommended and extremely powerful** when querying a **list of objects** (from memory or the database). You use these filters to isolate and extract the precise subset of records you want to assert on (e.g. filtering a table to verify that the remaining count of specific objects is correct).
*   **Decision Matrix:**

| Target Output Type | Retrieve Filters? | Link To (Memory) | Assertion Location |
| :--- | :--- | :--- | :--- |
| **Single Object** (Direct Return) | ❌ NO (Clean retrieve) | Microflow execution step | Downstream steps |
| **Single Object** (In-Place Mod) | ❌ NO (Clean retrieve) | Original provider step (Create/Retrieve) | Downstream steps |
| **Single Object** (Browser-Created/DB) | ❌ NO (Clean retrieve) | N/A (Database option) | Downstream steps |
| **List of Objects** (Assert on subset) | ✅ YES (Attributes/Associations) | Preceding step returning the list | Downstream (on filtered subset) |

*   **Anti-Pattern Detection:**
    *   ❌ **Wrong:** Retrieve step (memory or database) has attribute filters configured for a single object (fails with cryptic "Object not found" when assertion fails).
    *   ✅ **Correct:** Clean retrieve step with no filters, followed by separate downstream assertion steps.

### Pattern H: Retrieve from Teststep Failures (Memory Retrieve Binding)
*   **Symptoms:**
    *   `StepExecutionException: Object not found` or `Retrieve failed` during runtime.
    *   `ValidationError` or `CompilationError` regarding unbound select object or empty input source.
    *   MTA Schema validation failures during creation (e.g. `TestStepOutputKey` (see [glossary.md](glossary.md#parameter-naming-glossary)) must be a number, not a string).
*   **Root Causes:**
    1.  **Missing `SetRetrieveSettingsOfTestStep`:** Forgot to call this tool to explicitly configure the retrieve step to look in memory. It defaults to `"Database"`, which fails because no database XPath/filters are configured.
    2.  **Casing Mismatch on `RetrieveOption`:** Passed `"TestStep"` (capital "S") instead of `"Teststep"` (lowercase "s") to `SetRetrieveSettingsOfTestStep`.
    3.  **Unlinked Select Object:** Forgot to call `GetSelectObjectForRetrieveOfTeststep` to get the binding key and `SetTestStepOutputForSelectObjectForRetrieve` to bind it to the producer step.
    4.  **Incorrect `TestStepOutputKey` Datatype:** Passed the key as a quoted string (e.g. `"400"`) instead of a raw integer (`400`).
    5.  **Entity Type Mismatch:** The retrieve step's `EntityQualifiedName` (e.g., `"Sales.Invoice"`) does not match the output entity type of the producer step (e.g., `"Sales.Order"`).
    6.  **Missing TestStepName Convention:** The `TestStepName` parameter in `CreateTestStepRetrieveObject` was not set exactly to `"retrieve object from teststep"`.
    7.  **Order of Operations Trap (Pre-requisite Setting Mismatch):** Attempting to call `GetSelectObjectForRetrieveOfTeststep` or `SetTestStepOutputForSelectObjectForRetrieve` *before* calling `SetRetrieveSettingsOfTestStep` with `RetrieveOption = "Teststep"`. (If the option is still the default `"Database"`, no select object exists yet, causing the fetch to fail).
    8.  **Void Microflow Output Trap:** Linking the retrieve step's `TestStepOutputKey` (see [glossary.md](glossary.md#parameter-naming-glossary)) to a `CreateMicroflowCallTestStep` when the microflow returns `Void` (or a boolean) instead of returning the expected Entity. (You must link back to the original `CreateObject` or retrieve step that first created/loaded the object).
*   **Resolution Protocol (The 4-Point Memory Retrieve Checklist):**
    Before executing or saving a memory retrieve step, verify that you have completed all four points in order:
    1.  **Option Configuration (MUST BE DONE FIRST):**
        Call `SetRetrieveSettingsOfTestStep(TestStepKey=RetrieveStepKey, RetrieveOption="Teststep", RetrieveSet="All")`. (Use `RetrieveSet="All"` for assertion-related retrieves to retrieve the entire list; `RetrieveSet="Head"` is reserved for parameter-retrieve workarounds). Ensure `"Teststep"` has a lowercase `"s"`. This activates the memory retrieve select-object on the server.
    2.  **Output Binding (MUST BE DONE SECOND):**
        Retrieve the select object key using `GetSelectObjectForRetrieveOfTeststep(TestStepKey=RetrieveStepKey) to obtain `SelectObjectForRetrieveKey`.
    3.  **Strict Integer Linking & Producer Selection (MUST BE DONE THIRD):**
        Call `SetTestStepOutputForSelectObjectForRetrieve` with raw numeric keys (e.g. `SelectObjectForRetrieveKey: 800, TestStepOutputKey` (see [glossary.md](glossary.md#parameter-naming-glossary)): `ProducerStepKey`). 
        *   *Check producer:* If the microflow returns `Void`, ensure `ProducerStepKey` is the **original Create/Retrieve step** (not the microflow call). If the microflow returns the entity directly, link to the **microflow step**.
        *   *Check type:* Double-check that `TestStepOutputKey` (see [glossary.md](glossary.md#parameter-naming-glossary)) is NOT a quoted string.
    4.  **Entity Validation:**
        Verify that the retrieve step's entity type matches the output entity type of the provider step exactly.

### Pattern I: Highlighted Teststep (Manual Intervention Required)
*   **Symptom:** A teststep appears highlighted (colored or flagged) in the MTA UI, or the AI has created a step with `SetHighlightOfTestStep(Highlight=true)`.
*   **Root Cause:** The teststep is a placeholder that requires manual editing, configuration, or deletion in the MTA UI because it cannot be fully automated by the AI (such as deletion actions, complex custom widgets, or unsupported UI actions).
*   **Resolution Protocol:**
    1.  Open the test suite in the MTA UI and locate the highlighted teststep.
    2.  Read the step description or objective for specific instructions on what manual configuration is needed.
    3.  Manually edit the step properties (e.g., configure complex custom widget bindings) or perform manual deletion actions where required (since deletion actions are not supported by the MCP toolset and must be manually executed in MTA).
    4.  Once the manual configuration is complete, you can optionally remove the highlight or run the test case as usual.

---

## 🔍 RUNTIME FAILURE DIAGNOSTICS & PROACTIVE AUDITING GETTERS

When a test case or suite fails during runtime execution verification (`[STATE_EXECUTION_VERIFY]` or `[STATE_QA_ASSISTANCE]`), you **MUST** leverage MTA's programmatic diagnostics and auditing getters to trace values, associations, and assertion structures. 

These tools let you inspect the internal states of executed teststeps in transaction memory without resorting to guess-work.

### 1. Programmatic Failure Retrieval & Assertion Inspection
To audit failed assertions or retrieve structured execution receipts:
*   **`RetrieveTestRunResults`**: Call this tool immediately after execution to retrieve the complete, structured execution receipt. It returns execution statuses, timestamps, logs, and a list of failed step keys.
*   **`GetAssertExceptionByTestStep`**: If a microflow execution step fails with an exception, use this getter to retrieve the exact exception assertion properties configured on that step.
*   **`GetAssertObjectCountByTestStep`**: If a retrieve-and-assert step fails count validations, use this getter to retrieve the expected vs. actual object count assertion properties.

### 2. Auditing Attributes and Associations in Memory
To inspect what values were written or read by a specific teststep during active execution, call these audit getters:
*   **`GetAttributeValuesOfTeststep`**: Programmatically retrieves all attribute values configured, written, or filtered on the specified teststep.
*   **`GetAssociationsByTestStep`**: Programmatically retrieves all configured association select objects and their operations (e.g., `Add`, `Set`, `Clear`) defined on the specified teststep.

### 3. Deep Memory Object Inspection
For advanced verification of structured object states inside the transaction memory, use the specialized detail getters:
*   **`GetObjectActionTestStepCreateObjectDetails`**: Retrieves the deep, recursive entity values, included attributes, and values for a `Create Object` step.
*   **`GetObjectActionTestStepChangeObjectDetails`**: Retrieves details of the changes and output mappings applied to a `Change Object` step.
*   **`GetObjectActionTestStepRetrieveObjectDetails`**: Retrieves the database filters, XPaths, and output select options for a `Retrieve Object` step.
*   **`GetObjectActionTestStepDeleteObjectDetails`**: Retrieves output mappings and target selectors for a `Delete Object` step.
*   **`GetObjectActionTestStepPersistDetails`**: Retrieves transaction commit information for a `Persist` step.

> [!TIP]
> **Diagnostic Workflow:** When a step fails, run `GetAttributeValuesOfTeststep` and `GetAssociationsByTestStep` on both the *producer step* and the *consumer step* to verify that keys, values, and reference mappings were correctly propagated.

---

## 🛠️ DESIGN-TIME CONSTRUCTION DIAGNOSTICS (GetTestConstructionErrorsOfTestCase)

Design-time construction and validation errors are programmatically retrieved from the MTA server using `GetTestConstructionErrorsOfTestCase(TestCaseKey)` during the Pre-Execution Smoke Audit at the end of `STATE_CONSTRUCTION`.

### 🧭 Construction Error Diagnostics & Resolution Protocol

When `GetTestConstructionErrorsOfTestCase` returns errors or warnings, parse and resolve them according to this protocol:

#### 1. Unbound Microflow Parameter
*   **Error / Warning Message:** `Validation issue in test step 'ACT_Invoice_Pay' (StepKey: 504): Parameter 'Invoice' is not bound. Please set a static value, association, or link it to a previous test step output.`
*   **Root Cause:** A microflow call step contains an input parameter that is not configured with any value or bound to an upstream step's output.
*   **Resolution Sequence:**
    1.  Call `GetMicroflowCallTestStepDetails(TestStepKey=504)` to identify the unbound parameter's `SelectObjectForMicroflowParameterKey` (e.g., `802`).
    2.  If the parameter should be **linked to an upstream step**: Call `SetTestStepOutputForSelectObjectForMicroflowParameter(SelectObjectForMicroflowParameterKey=802, TestStepOutputKey=ProducerStepKey)` with raw integers.
    3.  If the parameter should be **unbound/empty**: Call `SetEmptyForSelectObjectForMicroflowParameter(SelectObjectForMicroflowParameterKey=802)`.
    4.  If the parameter should be a **static/literal value**: Call the appropriate `Set*ValueMicroflowParameterValue` tool (e.g., `SetBooleanValueMicroflowParameterValue`, `SetStringMicroflowParameterValue`) to set the literal value.
    5.  If the parameter should be **unbound/empty**: Pass an empty string or omit binding.

---

### Quick Decision Flowchart

```
[Need to configure parameter binding?]
       │
       ├─► Is parameter an object type?
       │     ├─► Passing upstream object ──► SetTestStepOutputForSelectObjectForMicroflowParameter
       │     └─► Passing null/empty ───────► SetEmptyForSelectObjectForMicroflowParameter
       │
       └─► Is parameter a primitive type?
             ├─► Dynamic value from step ──► SetInputTypeMicroflowParameterValueToTestStep + SetOutputForSelectValueForValue
             └─► Static literal value ──────► Call tool directly by type:
                                                - String ─────► SetStringMicroflowParameterValue
                                                - Boolean ────► SetBooleanValueMicroflowParameterValue
                                                - Enum ───────► SetEnumerationMicroflowParameterValue
                                                - DateTime ───► SetDateTimeMicroflowParameterValue
                                                - Integer ────► SetIntegerMicroflowParameterValue
                                                - Decimal ────► SetDecimalMicroflowParameterValue
```

#### 2. Dangling Select Object (No Binding or Value Assigned)
*   **Error / Warning Message:** `Validation warning: Orphaned SelectObject for parameter 'Customer' in test step 'ACT_Customer_Disable' (StepKey: 601) contains no value or binding.`
*   **Root Cause:** A select object wrapper was created for a microflow parameter or retrieve step, but no binding action (empty, literal, or output mapping) was ever applied to it.
*   **Resolution Sequence:** Set an explicit value or binding to the select object.
    *   To link: `SetTestStepOutputForSelectObjectForMicroflowParameter`
    *   To empty: `SetEmptyForSelectObjectForMicroflowParameter`
    *   To literal: `Set*ValueMicroflowParameterValue` (e.g. `SetStringMicroflowParameterValue`)

#### 3. Type Mismatch on Parameter Binding
*   **Error / Warning Message:** `Compilation issue: Type mismatch in test step 'ACT_ProcessOrder' (StepKey: 702). Parameter 'Order' expects entity 'Sales.Order', but receives entity 'Sales.Quote' from step 'Create_Quote' (StepKey: 401).`
*   **Root Cause:** The `TestStepOutputKey` bound to the parameter select object produces an entity type incompatible with the microflow's expected input parameter type.
*   **Resolution Sequence:**
    1.  Trace back to identify where the correct entity type is created or retrieved.
    2.  If the correct object is retrieved or created in a different step (e.g., Step `501` of type `Sales.Order`), update the select object binding by calling `SetTestStepOutputForSelectObjectForMicroflowParameter(SelectObjectForMicroflowParameterKey=ParamKey, TestStepOutputKey=501)`.
    3.  If the correct object does not exist in memory, insert a `Retrieve` or `Create` step of the correct entity type *before* the microflow call step using `SetSequenceOfTestStep`.

#### 4. Missing Required Attribute on Create/Change Step
*   **Error / Warning Message:** `Validation error: Required attribute 'Email' of entity 'Administration.Account' has no value in test step 'Create_Account' (StepKey: 201).`
*   **Root Cause:** An attribute marked as mandatory or required in the Mendix domain model has not been included or set in the `CreateObject` or `ChangeObject` test step.
*   **Resolution Sequence:**
    1.  Call `IncludeAttributeInTeststep(TestStepKey=201, AttributeQualifiedName="Administration.Account.Email")`.
    2.  Set the value using the appropriate attribute setter (e.g., `SetStringAttributeValue(TestStepKey=201, AttributeQualifiedName="Administration.Account.Email", Value="test@example.com")`).

#### 5. Symmetrical Attribute Exclusion Warning (Clean-up Orphaned Filters/Values)
*   **Error / Warning Message:** `Validation warning: Unused or invalid attribute 'Discount' configured on step 'Retrieve_Invoices' (StepKey: 301).`
*   **Root Cause:** An attribute filter is configured on a Retrieve, Create, or Change step that is no longer desired or causes logic conflicts (e.g., retrieving with a filter that was supposed to be excluded).
*   **Resolution Sequence:**
    *   Call `ExcludeAttributeFromTestStep(TestStepKey=301, AttributeQualifiedName="Sales.Invoice.Discount")` to clean up and remove the attribute value or constraint.
    *   *Note:* Symmetrically, this removes value-writing from Create/Change steps and removes query filter/XPath constraints from Retrieve steps.

---

## ⚡ PERFORMANCE TROUBLESHOOTING
*   **SlowMo Adjustment:** Default local SlowMo is `100ms`. For faster local runs, reduce to `50ms` or `0ms` via `StartFrontendTestLocallyOptions` attributes. Headless remote runs must use `SlowMo = 0ms`.
*   **Timeout Adjustment:** Default is `30,000ms`. For slow pages/microflows, increase timeout via `StartFrontendTestOptions` attributes.
*   **Trace Optimization:** Keep `Trace = true` for debugging complex workflows, but disable trace for smoke tests to save bandwidth and execution time.

---

## 🧪 ISOLATED VERIFICATION LAW (FASTER FEEDBACK LOOP)

When building or fixing tests, running a full test configuration (`ExecuteTestConfiguration`) can be slow and execute unrelated suites. 
*   **The Single Case / Suite Rule:** You **MUST** proactively recommend and use either single test case execution (`ExecuteTestCase`) or single-suite execution (`ExecuteTestSuite`) when verifying your changes.
    *   **Single Test Case Execution (`ExecuteTestCase`):** This is the **absolute fastest and most isolated way** to dry-run or verify your active work. It runs exactly one test case (`TestCaseKey`) in isolation on the environment (`ApplicationInstanceToken`), completely bypassing all other test cases in the suite and configuration.
    *   **Single Suite Execution (`ExecuteTestSuite`):** Use this when verifying the interactions or sequence of multiple related test cases within the same suite (`TestSuiteKey`).
*   **Why:** These tools isolate execution strictly to your active work, avoid noise or failures from other suites/cases, reduce execution queue times, and complete significantly faster.
*   **When to suggest:**
    1. During `STATE_CONSTRUCTION` when doing dry runs or teststep verification (highly recommend `ExecuteTestCase`).
    2. During `STATE_EXECUTION_VERIFY` as the primary method of verifying the newly built test case.
    3. During troubleshooting when verifying that an applied fix has resolved a specific error.

---

## 🤖 FAILURE RETRIEVAL ENFORCEMENT LAW (AUTOMATIC RUN)
If a test run contains any failed/errored steps:
1. **Do not** just print the failure message and stop.
2. **Automatically trigger** the Proactive Mendix Model Comparison Analysis.
3. Systematically query the local model, compare formats/validations, trace state changes backwards, and output the **Cascade Diagnostic Analysis Report** immediately in your single response.
