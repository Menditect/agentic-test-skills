# MTA Data Variations Master Guide
**📍 You are here:** `references/data-variations.md` | **🏠 Return to:** [MTA Core Skill](../SKILL.md)
*Metadata: Version 2.2 | Last Updated: 2026-06-26*

This reference defines the sequence, parameters, and naming rules for creating data-driven test scenarios (variations) in MTA.

> [!TIP]
> **⚡ SPEED OPTIMIZATION: Headless Backend Case for Frontend Variations**
> If you have extensive data-driven variations (e.g., testing 5+ input validation or calculation scenarios on a form), do **NOT** run them all via browser screens. Doing so is extremely slow and fragile.
> Instead, create a separate **Backend Test Case** to execute those variations directly and headlessly via the underlying microflows. Keep the Frontend UI testcase restricted to a **single "Happy Path"** to verify widget rendering and wiring. (See [placement-and-lifecycle.md](placement-and-lifecycle.md) for full architecture and trade-offs).

---

## 👥 TERMINOLOGY: "TEMPLATE VARIATION" VS. "VARIATION #1"

To prevent any confusion between system-generated defaults and our logical test designs, make sure you understand the following terminology:
1. **Template Variation (System Default):** This is the baseline, default variation that is automatically created by the system when you execute `EnableTestCaseDataVariations`. It serves as the container for all standard steps and their base settings.
2. **Variation #1 (Logical Primary Scenario):** This is our human-designed label for the primary scenario in the spec table. In the MTA system, **Variation #1 corresponds directly to the Template Variation itself**. Therefore, you do NOT duplicate a new variation for "Scenario #1 / Variation #1". Any setters/overrides you apply to the base/template keys directly update the primary scenario. You only call `DuplicateTestCaseDataVariation` for downstream scenarios (e.g., Scenario #2, Scenario #3, etc.).

---

## 🎯 EMPTY OBJECT PATTERN: QUICK DECISION GUIDE

> [!NOTE]
> This guide outlines the conceptual patterns and decision logic for conditional null parameters across variations. For complete step-by-step tool-calling examples and real-world implementation sequences of empty object retrieves, see [api-helpers.md](api-helpers.md#empty-object-microflow-parameter-checklist).

**Q: Do you need to conditionally pass null/empty objects to a microflow across variations?**

✅ **YES** ➔ You **MUST** use the **Empty Object Retrieve Pattern** with **Retrieve from Teststep**!

**Step-by-Step (Alternative Same-Attribute Pattern when dummy attributes are not possible):**
1. ✅ **Create object** with attribute(s) (e.g. `Subject`).
2. ✅ **Include & register** the Create attribute as a variation item using `AddAttributeValueAsVariationItem`.
3. ✅ **Retrieve from Teststep** (NOT Database!) with the matching filter attribute.
4. ✅ **Set settings:** Call `SetRetrieveSettingsOfTestStep` with `RetrieveOption = "Teststep"` and `RetrieveSet = "Head"`.
5. ✅ **Link retrieve to create** using `GetSelectObjectForRetrieveOfTeststep` & `SetTestStepOutputForSelectObjectForRetrieve`.
6. ✅ **Include & register** the Retrieve filter attribute as a variation item (coordinates with the Create attribute).
7. ✅ **For valid variations:** Set BOTH Create and Retrieve keys to matching values (e.g., `"Meeting Invitation"`).
8. ✅ **For null variations:** Set the Retrieve filter value key to `"NON_EXISTENT"` (leaving the Create key as `"Meeting Invitation"`). This fails the retrieve in memory, passing a clean null object to the microflow.
9. ✅ **Bind microflow parameter** to the **retrieve step output** (NOT the create step output).

❌ **NEVER** use `RetrieveOption = "Database"` for this empty object pattern.
❌ **NEVER** bind a microflow parameter directly to a Create step when implementing the empty object pattern.

---

## 🚨 MANDATORY VARIATION METADATA (NAME & DESCRIPTION) RULE

To ensure that all data variations can be identified, understood, and audited in the MTA dashboard, you **MUST** configure both the Name and Description for **every single variation** you create, including the baseline Template Variation (Variation #1) and any duplicated variations.

For **each** variation (both the template and duplicated ones):
1.  **Set Name:** Call `TestCaseDataVariationName(TestCaseVariationKey, Name)`.
    *   *Format:* Lowercase alphanumeric with hyphens (e.g. `"standard-case"`, `"invalid-age-negative"`). Do not use spaces, uppercase characters, or special symbols like `#`.
2.  **Set Description (MANDATORY - DO NOT FORGET):** Call `TestCaseDataVariationDescription(TestCaseVariationKey, Description)`.
    *   *Requirement:* Provide a complete, clear, and professional description explaining the exact functional scenario, inputs, and expected outcomes verified by this variation (e.g., `"Verifies that a registration with age 17 fails with validation error."`).

This metadata is **mandatory for all workflows** (both the Simple Fast-Track and the Complex Workflow). Failing to set names and descriptions for all variations is a severe quality violation.

---

## 🏃 SIMPLE CASE: 3-STEP FAST-TRACK
For 1 or 2 alternate scenarios:
1.  **Enable Variations:** Call `EnableTestCaseDataVariations(TestCaseKey)` ➔ Returns template `TestCaseVariationKey`.
2.  **Configure Template Metadata:** Set the name and description for the template/primary variation (Variation #1).
    *   Call `TestCaseDataVariationName(TemplateVariationKey, "variation-name")`
    *   Call `TestCaseDataVariationDescription(TemplateVariationKey, "Description of primary scenario...")`
3.  **Build Template Steps:** Build your teststeps sequentially.
4.  **Register & Override:**
    *   Call `AddAttributeValueAsVariationItem` for the specific attribute to change ➔ Returns base `AttributeValueKey`.
    *   Call `AddTestCaseVariationItemAttributeValue` for the specific attribute to change ➔ Returns base `AttributeValueKey`.
    *   Call `DuplicateTestCaseDataVariation` ➔ Returns new `TestCaseVariationKey`.
    *   **Configure Duplicated Metadata:** Set the name and description for the new variation:
        *   Call `TestCaseDataVariationName(NewTestCaseVariationKey, "duplicate-variation-name")`
        *   Call `TestCaseDataVariationDescription(NewTestCaseVariationKey, "Description of duplicated scenario...")`
    *   **MANDATORY:** Call `GetTestCaseDataVariationsDetails` to fetch the nested JSON structure.
    *   Extract the **unique, variation-specific `AttributeValueKey`** for that attribute within the duplicated variation.
    *   Call `SetStringAttributeValue` (or appropriate setter) passing the **unique, variation-specific** `AttributeValueKey` (not the base template key) and the override value.

---

## 🚨 EXHAUSTIVE MATRIX CELL RECONCILIATION LAW ($M \times N$ GRID RECONCILIATION)

> [!CAUTION]
> **CRITICAL LAW: COLUMN DUPLICATION IS NOT VALUE ASSIGNMENT**
> 
> Calling `DuplicateTestCaseDataVariation` (or `DuplicateTestSuiteDataVariation`) **ONLY allocates a new variation column container**. It snapshot-copies whatever baseline values existed in the source variation at that moment.
> 
> **THE DELTA OVERRIDE FALLACY:** You are **strictly prohibited** from calling `DuplicateTestCaseDataVariation` and then only updating the 1 or 2 attributes you consider "changed" while assuming all other cells are correct. Retying on column copy inheritance leaves unverified, stale, or draft values in duplicated columns.
> 
> **MANDATORY $M \times N$ GRID RECONCILIATION RULE:**
> Treat the variation table as a full $M \times N$ grid ($M$ variation item rows $\times$ $N$ scenario columns).
> After duplicating columns, you **MUST**:
> 1. Call `GetTestCaseDataVariationsDetails` to fetch the unique cell keys (`AttributeValueKey`, `MicroflowParameterValueKey`, Assert keys) for every single cell $(i, j)$ in the matrix.
> 2. Compare the live MTA value of **EVERY SINGLE CELL $(i, j)$** against the Execution Plan matrix.
> 3. Call the appropriate type-specific setter tool for **EVERY cell $(i, j)$** where the MTA value does not explicitly match the Execution Plan cell.
> 4. Execute a final `GetTestCaseDataVariationsDetails` call to verify that 100% of cells in the matrix match the target specification.

## 🧪 COMPLEX CASE: FULL 11-STEP WORKFLOW
For complex matrices (3+ scenarios):
1.  **Enable:** Call `EnableTestCaseDataVariations` ➔ Returns template `TestCaseVariationKey`.
2.  **Create Steps:** Build all teststeps sequentially in the test case.
3.  **Register Inputs:** Call `AddTestCaseVariationItemAttributeValue` or `AddTestCaseVariationItemMicroflowParameterValue` for changing attributes/parameters ➔ Returns base `AttributeValueKey`.
4.  **Register Assertions:** Call the appropriate registration tool for changing assertions:
    *   *Microflow Return Values:* `AddTestCaseVariationItemAssertMicroflowReturnValue(AssertMicroflowReturnValueCompareKey)`
    *   *Object Attribute Comparisons:* `AddTestCaseVariationItemAssertAttributeValueCompare(AssertAttributeValueCompareKey)`
    *   *Object Counts:* `AddTestCaseVariationItemAssertObjectCount(AssertObjectCountKey)`
    *   *Exceptions:* `AddTestCaseVariationItemAssertException(AssertExceptionKey)`
    *   *Validation Feedback Message Compare:* `AddTestCaseVariationAssertValidationFeedbackCompare(AssertValidationFeedbackMessageCompareKey)`
    *   *Validation Feedback Message Count:* `AddTestCaseVariationAssertValidationFeedbackCount(AssertValidationFeedbackMessageCountKey)`
5.  **Duplicate:** Call `DuplicateTestCaseDataVariation` for each scenario ➔ Returns a new `TestCaseVariationKey`.
6.  **Name Variation:** Call `TestCaseDataVariationName(TestCaseVariationKey, Name)`.
    *   *Format:* Lowercase alphanumeric with hyphens (e.g. `"blank-password"`). Never prepend `#` or use spaces.
7.  **Describe:** Call `TestCaseDataVariationDescription(TestCaseVariationKey, Description)`.
8.  **MANDATORY MAP RETRIEVAL:** Call `GetTestCaseDataVariationsDetails` to retrieve the complete mapping of scenarios and their unique cell keys.
9.  **Exhaustive Cell Setter Iteration ($M \times N$ Grid):** Iterate through **EVERY cell $(i, j)$** across all variation item rows $i$ and scenario columns $j$. Call type-specific setter tools (e.g. `SetStringAttributeValue`, `SetStringMicroflowParameterValue`) passing the **unique, variation-specific cell key** extracted from the mapping in Step 8 (not the base template key!) for every cell that requires value setting according to the Execution Plan matrix.
10. **Exhaustive Assertion Setter Iteration:** For each duplicated variation column, call the appropriate type-specific assertion setter tool for EVERY assertion item row:
    *   *Microflow Return Values:* Call `SetDecimalAssertMicroflowReturnValueCompareCompare`, `SetIntegerLongAssertMicroflowReturnValueCompare`, `SetBooleanAssertMicroflowReturnValueCompare`, etc. with that variation's unique assertion key (obtained via `GetTestCaseDataVariationsDetails`).
    *   *Object Attribute Comparisons:* Call `SetStringAssertAttributeValueCompare`, `SetBooleanAssertAttributeValueCompare`, etc. with that variation's unique assertion key.
    *   *Object Counts:* Call `SetAssertObjectCountProperties` passing that variation's unique `AssertObjectCountKey`, the comparison operator, expected count, and failed action.
    *   *Exceptions:* Call `SetAssertExceptionProperties` passing that variation's unique `AssertExceptionKey`, expected result, comparison string, and actions.
    *   *Validation Feedback Compare:* Call `SetAssertValidationFeedbackMessageCompareProperties` with that variation's unique `AssertValidationFeedbackMessageCompareKey`. **(Happy Path Variation Pattern):** For variations where NO validation message is expected (happy path items), set `ComparisonOperator = "NotEquals"` and `ComparisonString = "__NO_VALIDATION_MESSAGE__"` (or any impossible dummy text) so the variation passes cleanly without requiring an error message to be present.
    *   *Validation Feedback Count:* Call `SetAssertValidationFeedbackMessageCountProperties` with that variation's unique `AssertValidationFeedbackMessageCountKey`.
11. **Verify Sync:** Call `GetTestCaseDataVariationsDetails` again to audit the full $M \times N$ matrix and verify all variation values are 100% synchronized against the Execution Plan.

---

## 🚨 CRITICAL: Understanding AttributeValueKey Per Variation

### 🎯 MANDATORY VERIFICATION CHECKPOINT: AttributeValueKey Mapping

> [!CAUTION]
> **CRITICAL CONCEPT:** When you call `DuplicateTestCaseDataVariation`, each duplicated variation receives its own **unique and distinct `AttributeValueKey`** (or `MicroflowParameterValueKey`) for every registered attribute/parameter.
>
> Type-specific setter tools (e.g. `SetStringAttributeValue`, `SetBooleanAttributeValue`, `SetStringMicroflowParameterValue`, etc.) **only accept `AttributeValueKey` (or `MicroflowParameterValueKey`) and the value** as parameters. They do **NOT** accept `TestCaseVariationKey`.
>
> Therefore, if you repeatedly call a setter tool using the base/template key, you will only overwrite Variation #1 (the template) over and over! To configure other variations, you **MUST** first fetch and target their unique, variation-specific keys.

### 🔄 Mandatory Key Extraction Workflow
1. ✅ **Enable & Build:** Enable variations, build steps, and register changing attributes as variation items.
2. ✅ **Duplicate:** Duplicate variations to generate all needed scenarios (returns `TestCaseVariationKey` for each).
3. ✅ **MANDATORY RETRIEVAL:** Call `GetTestCaseDataVariationsDetails(TestCaseKey)` to fetch the current JSON configuration.
4. ✅ **Map Keys:** Look inside the returned `TCVT_TestCaseVariations` list. Locate each variation by its key or name, navigate to its `ATVL_AttributeValues` list, and extract the unique `Key` corresponding to your attribute.
5. ✅ **Override:** Call setter tools (e.g. `SetStringAttributeValue`) passing the **variation-specific key** extracted in Step 4.

### 📋 Example Mapping Structure from `GetTestCaseDataVariationsDetails`
Below is an example structure returning two variations. Note how each variation has its own unique `Key` for the `"Subject"` attribute:

```json
{
  "TCVT_TestCaseVariations": [
    {
      "Key": 1288,
      "Name": "variation-1",
      "ATVL_AttributeValues": [
        {
          "Key": 6494,
          "ATBT_Attribute": {
            "Name": "Subject"
          }
        }
      ]
    },
    {
      "Key": 1289,
      "Name": "variation-2",
      "ATVL_AttributeValues": [
        {
          "Key": 6495,
          "ATBT_Attribute": {
            "Name": "Subject"
          }
        }
      ]
    }
  ]
}
```

**Setting Values:**
*   ❌ **WRONG:** Call `SetStringAttributeValue(6494, "Meeting Invitation")` for Variation #1, and call `SetStringAttributeValue(6494, "NON_EXISTENT")` for Variation #2 (this only repeatedly overwrites Variation #1's value!).
*   ✅ **CORRECT:** Call `SetStringAttributeValue(6494, "Meeting Invitation")` for Variation #1, and `SetStringAttributeValue(6495, "NON_EXISTENT")` for Variation #2.

### 🚨 MANDATORY SELF-CHECK
After setting all variation values, you **MUST** call `GetTestCaseDataVariationsDetails` again and verify:
1. Each variation shows its expected override value in the returned details.
2. For valid scenarios, Retrieve filter values match Create values.
3. For empty/null object scenarios, Retrieve filters use `"NON_EXISTENT"`.

---

## 📋 MATRIX FORMAT (MD Table)
Present variations inside the specifications (`ExpectedResult`) as a horizontal comparison table:
*   **Columns:** Represent Scenarios. You **MUST** use `#1`, `#2`, `#3`, etc., for numbering columns in the header (e.g., `#1 (valid-input)`, `#2 (invalid-email)`).
*   **Rows:** Represent Attributes/assertions.
*   **System Name Constraint:** The `#n` numbering prefix is strictly for visual table layout. The actual data variation names registered/created in the system **MUST NOT** include these `#n` prefixes or numbers (e.g. for `#2 (invalid-email)`, the actual variation name is `"invalid-email"`).

| Attribute / Step | #1 (valid-input) | #2 (invalid-email) | #3 (empty-fields) |
| :--- | :--- | :--- | :--- |
| **Name** | `John Doe` | `John Doe` | `""` |
| **Email** | `john@doe.com` | `invalid-email` | `""` |
| **Assert Success** | `True` | `False` | `False` |

---

## 📅 DYNAMIC DATETIME OFFSET BINDING
For dates, use relative offsets to prevent test decay. All 10 fields are strictly required by both the `SetCurrentDateTimeAttributeValue` and `SetCurrentDateTimeValueMicroflowParameterValue` schemas (set unused offsets to `0`):
*   `AttributeValueKey` (for attributes) or `MicroflowParameterValueKey` (for parameters)
*   `EnableOffset = true`
*   `OffsetYears`, `OffsetMonths`, `OffsetWeeks`, `OffsetDays`, `OffsetHours`, `OffsetMinutes`, `OffsetSeconds`, `OffsetMilliseconds`

---

## ⚠️ THE NULLIFY TRAP & THE EMPTY OBJECT WORKAROUND

### 1. The Nullify Trap (Numeric/DateTime)
Setters for numeric and datetime fields do not accept nulls or blanks.
*   **Correct Workaround:**
    1.  **Base variation:** Exclude the attribute (do NOT call `IncludeAttributeValueInTeststep`).
    2.  **Duplicate base:** Returns `NullVariationKey` which inherits the attribute's exclusion (resolving as `NULL` in the database).
    3.  **Specific Value Variation:** Call `IncludeAttributeValueInTeststep` + `SetAttribute...` strictly in the variation where the value is needed.

---

### 2. The Empty Object Workaround (Retrieve Filter Pattern)
MTA step bindings (SelectObjectForMicroflowParameter or `%SOMP%`) are global and static. They cannot be unset per-variation. To pass an empty/null object optionally, retrieve it via an XPath filter that varies to match nothing:

```
[Step 1: Create Object] ➔ [Step 2: Retrieve Object with XPath [Attr = %Variation_Filter%] ] ➔ [Step 3: Call Microflow (bind param to Step 2 Output) ]
```

### 🔧 Choosing the Retrieve Source Option: Teststep vs. Database

When implementing the Empty Object Retrieve Pattern, you have two ways to configure where the Retrieve step gets its data. However, **the Empty Object Pattern strictly REQUIRES `RetrieveOption = "Teststep"` to function correctly and robustly.**

#### **Option A: Retrieve from Teststep (MANDATORY for Empty Object Pattern)**
*   **How it works:** Explicitly binds the Retrieve step to the output of a specific upstream Create step in memory.
*   **Why it is required:** Ensures perfect transactional isolation, targeting the exact object instance created in that specific teststep, and allowing dynamic variation of empty/null states.
*   **Requirements:**
    1. Call `SetRetrieveSettingsOfTestStep` with `RetrieveOption = "Teststep"` and `RetrieveSet = "Head"`.
    2. Retrieve the select object key using `GetSelectObjectForRetrieveOfTeststep`.
    3. Bind it to the producer step using `SetTestStepOutputForSelectObjectForRetrieve(SelectObjectForRetrieveKey, TestStepOutputKey)`.
    4. *⚠️ Note on Parameter:* The parameter `TestStepOutputKey` **must be set to the parent `TestStepKey`** of the Create step (not any internal Entity value key).

#### **Option B: Retrieve from Database with Attribute Filter (Only for Non-Variation Single-Object Lookups)**
*   **How it works:** Retrieves the first object matching your filter criteria directly from the temporary in-memory database.
*   **When to use:** ONLY for simple non-variation lookups when your test run only has exactly **one** object of that entity type in memory, and you do not need conditional null/empty variations.
*   **❌ CRITICAL WARNING:** Do **NOT** use Option B when implementing any conditional empty/null variation patterns.

---

### ❌ CRITICAL ANTI-PATTERN: Using Database Retrieve for Empty Object Pattern

**Wrong:**
*   Setting `RetrieveOption = "Database"` with filter attributes to conditionally pass empty/null objects.

**Why this fails:**
*   Database retrieves do not support binding to specific upstream teststep outputs.
*   You cannot call `SetTestStepOutputForSelectObjectForRetrieve` to lock the transaction to a specific memory object.
*   It breaks the empty object filter logic when other objects of the same entity exist or are created during the suite run.

**Correct:**
*   Always use **`RetrieveOption = "Teststep"`** for empty object patterns to isolate and bind the retrieve operation to the producer teststep in memory.

---

> [!CAUTION]
> **🚨 MANDATORY STEP SEQUENCE: RETRIEVE STEP INITIALIZATION**
> Immediately after calling `CreateTestStepRetrieveObject`, you **MUST** call the configuration tools in this exact order. Skipping or reordering these tools will trigger runtime validation crashes:
> 1. ✅ **`SetRetrieveSettingsOfTestStep`** (Configure option, set, etc.) — ⚠️ **NEVER SKIP THIS STEP!**
> 2. ✅ **`GetSelectObjectForRetrieveOfTeststep`** & **`SetTestStepOutputForSelectObjectForRetrieve`** (To bind retrieve source to the upstream step output)
> 3. ✅ **`IncludeAttributeValueInTeststep`** (To add the filter attribute to the retrieve step)
> 4. ✅ **`SetAttribute*Value`** (To set the initial matching filter value)
> 5. ✅ **`AddAttributeValueAsVariationItem`** (Only if you are registering the filter attribute as a dynamic variation item)

> [!NOTE]
> For a complete, step-by-step 5-step tool call sequence, real-world example parameters, and detailed checklists implementing this workaround, see [api-helpers.md](api-helpers.md#empty-object-microflow-parameter-checklist) (Empty Object Microflow Parameter Checklist).

---

### 🎯 EMPTY OBJECT RETRIEVE PATTERN (Step-by-Step Recipe)
 
 **Goal:** Conditionally retrieve an object or return empty (null) across variations.
 
 **Critical Rules:**
 *   ⚠️ **Attribute Type Constraint:** You **MUST** use a **String** or **Integer** attribute as the filter key. **NEVER** use an **Enumeration** attribute (empty/non-matching enumerations do not filter correctly and cause runtime errors).
 *   ⚠️ **Synchronization and Registration Constraints:** 
     *   **Standard Pattern (With Dummy/Spare Filter Attribute):** The filter attribute **MUST** exist on both the Create and Retrieve steps with matching initial values (e.g., `"VALID_MATCH"`). Register **ONLY the Retrieve step's** filter attribute value key as a variation item. The Create step's value **must remain fixed and unregistered** across all variations.
     *   **Alternative Empty Object Pattern A (Same-Attribute):** The same semantic attribute (e.g. `Message`) is used for both test logic and filtering. Register **BOTH the Create step's attribute AND the Retrieve step's filter attribute** as separate variation items so they can both vary in coordination.
     *   **Alternative Empty Object Pattern B (Different-Attribute):** The Retrieve filter uses a different attribute than the Create primary test attribute. Register **BOTH the Create step's filter attribute AND the Retrieve step's filter attribute** as separate variation items and coordinate their values.
 
 #### 🔧 Correct Tool Call Sequence (Standard Pattern Example)
 
 ##### Step 1: Create Dummy Object with Fixed Filter
 *   Call `CreateTestStepCreateObject` (for entity `"MyModule.Order"`) ➔ Returns `TestStepKey: 100`.
 *   Call `IncludeAttributeValueInTeststep` (Step `100`, Attribute: `"OrderNumber"`) ➔ Returns `AttributeValueKey: 200`.
 *   Call `SetStringAttributeValue` (`200`, Value: `"VALID_MATCH"`). 
     *   *Constraint:* ⚠️ **This must remain fixed across all variations (do NOT register this as a variation item).**
 
 ##### Step 2: Create Retrieve Step (Retrieve from Memory) with Matching Filter
 *   Call `CreateTestStepRetrieveObject` (for entity `"MyModule.Order"`) with the `TestStepName` parameter set exactly to `"retrieve object from teststep"` ➔ Returns `TestStepKey: 101`.
 *   Call `SetRetrieveSettingsOfTestStep` (`101`, `RetrieveOption = "Teststep"`, `RetrieveSet = "Head"`) ➔ ⚠️ **Mandatory.**
 *   Call `GetSelectObjectForRetrieveOfTeststep` (`101`) ➔ Returns `SelectObjectForRetrieveKey: 300`.
 *   Call `SetTestStepOutputForSelectObjectForRetrieve` (`SelectObjectForRetrieveKey: 300`, `TestStepOutputKey = 100`).
 *   Call `IncludeAttributeValueInTeststep` (Step `101`, Attribute: `"OrderNumber"`) ➔ Returns `AttributeValueKey: 201`.
 *   Call `SetStringAttributeValue` (`201`, Value: `"VALID_MATCH"`) ➔ ⚠️ **MUST match Step 1 initial value.**
 
 ##### Step 3: Register Retrieve Attribute as Variation Item
 *   Call `AddAttributeValueAsVariationItem` (`AttributeValueKey: 201`) ➔ Returns dynamic variation key. 
     *   *Rule:* ⚠️ **Only register the Retrieve step's attribute, never the Create step's for this Standard Pattern.**
 
 ##### Step 4: Vary to Nullify (Scenario Variation `#2` - `empty-order`)
 *   On the duplicated variation key, call `SetStringAttributeValue` (`AttributeValueKey: 201`, Value: `"NON_EXISTENT"`).

*At runtime:*
*   **Variation #1 (valid-order):** Finds the dummy Order object in memory (since `"VALID_MATCH"` matches `"VALID_MATCH"`), successfully passing it downstream.
*   **Variation #2 (empty-order):** Fails to retrieve any object (since `"NON_EXISTENT"` does not match the dummy's `"VALID_MATCH"`), passing an empty reference downstream.

---

### 🎯 ALTERNATIVE EMPTY OBJECT PATTERNS (When No Dummy Attributes Available)

When the target entity has no spare/dummy attributes that can remain fixed across variations, use one of these alternative patterns:

#### **Alternative Empty Object Pattern A (Same-Attribute) (RECOMMENDED)**
Use the **same attribute** that varies in your test logic, but establish a neutral baseline value.

**Recipe:**
1. **Create Step:** Set attribute to a neutral/baseline value (e.g., `""` for strings, `0` for integers)
2. **Retrieve Step:** Filter on the **SAME attribute** with the same neutral value initially
3. **Register:** Register **BOTH** the Create step's attribute and the Retrieve step's filter attribute as separate variation items.
4. **Valid Variations:** Override **BOTH** Create and Retrieve to matching test values (e.g., `"Success"`)
5. **Empty Variation:** Override ONLY Retrieve to `"NON_EXISTENT"` (while Create can remain as a valid value or establish baseline)

**Example (Validation.Message):**
- Create: `Message = ""` (neutral baseline)
- Retrieve: Filter `Message = ""` (matches baseline)
- Register: Register both the Create step's message and the Retrieve filter message as variation items.
- Variation #1: Create `Message = "Success"`, Retrieve filter `Message = "Success"` → Found
- Variation #9: Create `Message = "Success"`, Retrieve filter `Message = "NON_EXISTENT"` → Not found (null)

✅ **Advantages:**
- Uses semantic attributes that relate to test logic
- Explicit value matching (no implicit null assumptions)
- More readable test specifications

⚠️ **Constraints:**
- Both Create and Retrieve must update the same attribute across variations
- Requires registering the attribute as a variation item on BOTH steps so they can vary in coordination

---

#### **Alternative Empty Object Pattern B (Different-Attribute) (USE WITH CAUTION)**
Use a **different attribute** for filtering that remains unset during creation.

**Recipe:**
1. **Create Step:** Set only the attributes needed for test logic (leave filter attribute unset)
2. **Retrieve Step:** Filter on a **DIFFERENT unset attribute** (e.g., an optional field)
3. **Register:** Only the Retrieve step's filter attribute as a variation item
4. **Valid Variations:** Use distinctive values that won't match null (e.g., `"Test Subject"`)
5. **Empty Variation:** Use `"NON_EXISTENT"`

**Example (EmailMessage.Subject vs From):**
- Create: `Subject = "Meeting Invitation"` (From remains unset/null)
- Retrieve: Filter `From = "Test Subject"` (doesn't match null) → Not found initially
- **Wait, this breaks!**

⚠️ **Critical Constraint:** This pattern requires the valid variations to use a value that **DOES match** the unset state:
- Create: `Subject = "Meeting Invitation"`, `From = null`
- Retrieve: Filter `From = null` is not supported in XPath

❌ **This pattern is fundamentally broken for null matching**

**🔧 CORRECTED Alternative Empty Object Pattern B (Different-Attribute) Recipe:**
1. **Create Step:** Set both test attribute AND filter attribute to matching values
2. **Retrieve Step:** Filter on a different attribute than the primary test attribute
3. Both attributes must vary together across scenarios

**Example (EmailMessage - Corrected):**
- Variation #1: Create `Subject = "Meeting"`, `From = "user1@test.com"` | Retrieve filter `From = "user1@test.com"` → Found
- Variation #8: Create `Subject = "Test"`, `From = "user8@test.com"` | Retrieve filter `From = "NON_EXISTENT"` → Not found

✅ **When to use:**
- When the entity has multiple string attributes available
- When you want to keep test logic attribute separate from filter logic

⚠️ **Disadvantages:**
- Requires two varying attributes instead of one
- Less intuitive than Alternative Empty Object Pattern A (Same-Attribute)
- Higher maintenance burden

---

### 🧭 CHOOSING THE RIGHT EMPTY OBJECT PATTERN

**Start Here:** Does your entity have a spare String/Integer attribute that isn't used in your test logic?

├─ ✅ **YES** → Use **Standard Pattern** (dummy attribute with `"VALID_MATCH"`)
│   └─ Cleanest separation of concerns
│
└─ ❌ **NO** → Answer: Will your test logic vary the attribute values across scenarios?
    │
    ├─ ✅ **YES** (e.g., testing different Subject values) 
    │   └─ Use **Alternative Empty Object Pattern A (Same-Attribute)** (same-attribute with neutral baseline)
    │       └─ Example: Validation.Message with baseline `""`
    │
    └─ ❌ **NO** (all valid scenarios use same value)
        └─ Can you use the same attribute for both test and filter?
            │
            ├─ ✅ **YES** → Use **Alternative Empty Object Pattern A (Same-Attribute)** with fixed value
            │
            └─ ❌ **NO** → Use **Alternative Empty Object Pattern B (Different-Attribute)**
                └─ ⚠️ Requires coordinating two attributes - use as last resort

---

### ❌ ANTI-PATTERNS

**Anti-Pattern 1: Using Unset Attribute Without Explicit Matching**

**Wrong:**
- Step 1: Create `EmailMessage` with `Subject = "Test"` (From remains unset)
- Step 2: Retrieve with filter `From = "Test Subject"` 
- Variation: Change retrieve filter to `From = "NON_EXISTENT"`

❌ **Why this fails:**
- Valid variations don't match either (From is null, not "Test Subject")
- Relies on XPath `[From = null]` behavior which is inconsistent
- Fragile if From gets a default value later

**Correct Alternative Empty Object Pattern B (Different-Attribute):**
- Step 1: Create with both `Subject = "Test"` AND `From = "user@test.com"`
- Step 2: Retrieve with filter `From = "user@test.com"`
- Both must vary together across scenarios

---

**Anti-Pattern 2: Using Enumeration Attributes as Retrieve Filters**

**Wrong (Using Enumerations):**
*   Step 1: Create `Order` with `Status` attribute (Enum) = `"Processing"`.
*   Step 2: Retrieve `Order` with `Status` attribute (Enum) = `""` (Empty string/blank).
*   ❌ **This fails!** Empty enumerations or invalid enumeration values are rejected by the Mendix runtime and do not filter memory retrieve collections correctly, causing execution errors.

**Correct (Using Strings or Integers):**
*   Step 1: Create `Order` with `OrderNumber` attribute (String) = `"VALID_MATCH"`.
*   Step 2: Retrieve `Order` with `OrderNumber` attribute (String) = `"VALID_MATCH"`.
*   Step 3: Vary retrieve filter value in variation `#2` to `"NON_EXISTENT"` ➔ Returns a clean empty (null) object.

---

### 📚 REAL-WORLD IMPLEMENTATION EXAMPLES

#### **Example 1: Email Validation Testing (Alternative Empty Object Pattern A)**
**Scenario:** Test email validation logic across empty/null/invalid inputs
**Challenge:** No dummy attributes available on Validation entity

**Solution:**
- Use `Validation.Message` as both test output AND filter
- Create: `Message = ""` (neutral baseline)
- Retrieve: Filter `Message = ""`
- Variations override both to test different scenarios

**Implementation:**
| Step | Variation #1 (valid) | Variation #9 (null-validation) |
| :--- | :--- | :--- |
| **Create Validation.Message** | `""` | `""` |
| **Retrieve Filter Message** | `""` | `"NON_EXISTENT"` |
| **Result** | Object found | Object not found (null passed to microflow) |

---

#### **Example 2: Multi-Attribute Coordination (Alternative Empty Object Pattern B)**
**Scenario:** Test microflow with multiple object parameters
**Challenge:** Testing both valid objects and null object combinations

**Solution:**
- Use different attributes for different object parameters
- EmailMessage: Use `Subject` for test logic, `From` for filtering
- Coordination: Both attributes vary together per scenario

**Implementation:**
| Variation | EmailMessage.Subject (Create) | EmailMessage.From (Create) | Retrieve Filter From | Result |
| :--- | :--- | :--- | :--- | :--- |
| **#1 valid** | `"Meeting"` | `"user1@test.com"` | `"user1@test.com"` | Found |
| **#8 null-emailmessage** | `"Test"` | `"user8@test.com"` | `"NON_EXISTENT"` | Not found |

⚠️ **Note:** This requires registering BOTH attributes as variation items and coordinating their values.

---

## 📐 STRICT MARKDOWN TABLE & STRUCTURAL LAYOUT RULES

To prevent parsing errors or markdown rendering layout breaks when variations are saved to the test case `ExpectedResult` field in MTA, you **MUST** adhere to these strict structural rules:

1. **Horizontal Matrix Layout:** Always design tables where **Columns represent Scenarios/Variations** (headers labeled as `#1 (scenario-name)`, `#2`, etc.) and **Rows represent Attributes/Assertions**. Never swap them (do NOT arrange scenarios as vertical rows).
2. **The 8-Column Limit:** Tables are strictly restricted to a maximum of **8 columns total** (1 row label/attribute column + up to 7 scenarios). Larger tables will overflow the MTA UI rendering window, truncating the visual data.
3. **The Table-Splitting Pattern (8+ Variations):** If your test design requires 8 or more scenario variations, you **MUST** split them into multiple, separate tables placed consecutively. Each table must retain the exact same vertical row labels (attributes/assertions) in the left column:
   
   **Table 1: Variations 1 to 7**
   | Attribute / Step | #1 (valid) | #2 (invalid) | #3 (empty) | #4 | #5 | #6 | #7 |
   | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
   | `Customer.Age` | `25` | `15` | `""` | ... | ... | ... | ... |
   
   **Table 2: Variations 8 to 10**
   | Attribute / Step | #8 | #9 | #10 |
   | :--- | :--- | :--- | :--- |
   | `Customer.Age` | `120` | ... | ... |

4. **Exact Separator Alignment:** The cell/column count in the separator row (`|:---|`) **MUST** match the header column count exactly. A single missing or extra cell in the separator will break the markdown rendering parser.

---

## 🏢 TEST SUITE DATA VARIATIONS

Test Suite Data Variations allow you to define global data matrices at the **TestSuite level**. All child test cases inside the suite run against these global suite variations. This enables powerful cross-case data-driven scenario runs.

The workflow for establishing Test Suite Data Variations symmetrically mirrors the TestCase variation workflow:

### 🔄 Programmatic 7-Step Workflow

1.  **Enable Suite Variations:** Call `EnableTestSuiteDataVariations(TestSuiteKey)` ➔ Returns a template `TestSuiteVariationKey`.
2.  **Configure Template Metadata:** Set the name and description for the template/primary variation (Variation #1):
    *   Call `TestSuiteDataVariationName(TemplateVariationKey, "variation-name")`.
    *   Call `TestSuiteDataVariationDescription(TemplateVariationKey, "Description of primary scenario...")`.
3.  **Register Variation Items:** For any step attribute or assertion that needs to vary across scenarios, register it as a suite variation item.
    *   *Step Attributes:* Call `AddTestSuiteVariationItemAttributeValue(TestSuiteKey, AttributeValueKey)` ➔ Returns a base `AttributeValueKey`.
    *   *Microflow Parameters:* Call `AddTestSuiteVariationItemMicroflowParameterValue(TestSuiteKey, MicroflowParameterValueKey)`.
    *   *Microflow Return Values:* Call `AddTestSuiteVariationItemAssertMicroflowReturnValue(TestSuiteKey, AssertMicroflowReturnValueCompareKey)`.
    *   *Object Attribute Comparisons:* Call `AddTestSuiteVariationItemAssertAttributeValueCompare(TestSuiteKey, AssertAttributeValueCompareKey)`.
    *   *Exceptions:* Call `AddTestSuiteVariationItemAssertException(TestSuiteKey, AssertExceptionKey)`.
    *   *Object Counts:* Call `AddTestSuiteVariationItemAssertObjectCount(TestSuiteKey, AssertObjectCountKey)`.
    *   *Validation Feedback Compare:* Call `AddTestSuiteVariationAssertValidationFeedbackCompare(AssertValidationFeedbackMessageCompareKey)` (or `AddTestSuiteVariationItemAssertValidationFeedbackMessageCompare`).
    *   *Validation Feedback Count:* Call `AddTestSuiteVariationAssertValidationFeedbackCount(AssertValidationFeedbackMessageCountKey)` (or `AddTestSuiteVariationItemAssertValidationFeedbackMessageCount`).
4.  **Duplicate Variations:** For each alternate scenario, call `DuplicateTestSuiteDataVariation(TestSuiteDataVariationKey)` ➔ Returns a new unique `TestSuiteVariationKey`.
5.  **Configure Duplicated Metadata:**
    *   Call `TestSuiteDataVariationName(NewTestSuiteVariationKey, Name)`.
    *   Call `TestSuiteDataVariationDescription(NewTestSuiteVariationKey, Description)`.
6.  **MANDATORY MAP RETRIEVAL:** Call `GetTestSuiteDataVariationsDetails(TestSuiteKey)` to retrieve the recursively expanded JSON tree.
7.  **Override Values Per Variation:** 
    *   Look inside the returned JSON tree from Step 6.
    *   Locate each variation and extract its **unique, variation-specific key** (e.g. `AttributeValueKey`, `AssertMicroflowReturnValueCompareKey`, etc.).
    *   Call the standard type-specific setter tools (e.g., `SetStringAttributeValue` or `SetDecimalAssertMicroflowReturnValueCompare`) passing the **variation-specific key** and override value.

> [!IMPORTANT]
> Just like with TestCases, you **MUST** use the unique, variation-specific keys extracted via `GetTestSuiteDataVariationsDetails` when overriding values for duplicated variations. Never call setters using the base template key, as that would continuously overwrite Variation #1 (the template).

### 🚫 Architectural Constraint: Mutual Exclusivity of Variation Types

> [!CAUTION]
> **STRICT ARCHITECTURAL CONSTRAINT:** A single test case can ONLY vary its data at **one level**—either the Test Suite level OR the local Test Case level. Items inside a single test case **can never be varied in both types of variations simultaneously.**
>
> *   **Local Variation Precedence & Scope Isolation:** If a testcase has local variations enabled (`EnableTestCaseDataVariations`), it is completely decoupled from the Test Suite's global variations. Its steps will **only** run against its local test case variation matrix, completely ignoring the suite-level variations. No Cartesian product expansion or overlapping parameter blending is supported.
> *   **Global Variation Scope:** Only test cases whose step attributes/assertions are explicitly registered at the Test Suite level (using `AddTestSuiteVariationItem*`) are driven by the Test Suite's global variations.

---

## 🔍 STATE_SMOKE_AUDIT: Data Variation Matrix Verification Workflow

During `STATE_SMOKE_AUDIT` (State 4), you **MUST** perform an itemized, cell-by-cell audit of all registered Data Variations against Section 7 (`Data Variation Matrix`) of the saved Execution Plan.

### 📋 Step-by-Step Audit Execution Protocol:
1. **Retrieve Saved Execution Plan:** Call `GetExecutionPlan(ExecutionPlanKey)` to obtain the approved Section 7 Data Variation Matrix.
2. **Retrieve Server Variation Details:**
   - For Test Case variations: Call `GetTestCaseDataVariationsDetails(TestCaseKey)`.
   - For Test Suite variations: Call `GetTestSuiteDataVariationsDetails(TestSuiteKey)`.
3. **Traverse the JSON Tree & Compare Every Item:**
   For every scenario/variation present in the JSON tree (`TCVT_TestCaseVariations` or `TSVT_TestSuiteVariations`):
   - **System Name & Description:** Verify `Name` and `Description` match the plan.
   - **Attribute Values (`ATVL_AttributeValues`):** Verify every attribute's target value matches the expected matrix cell value (including `"NON_EXISTENT"` for empty object patterns).
   - **Microflow Parameters (`MPVL_MicroflowParameterValues`):** Verify every parameter value matches the plan.
   - **Assert Return Values (`AMRV_AssertMicroflowReturnValues`):** Verify assert return values match expected outcomes.
   - **Assert Attribute Comparisons (`AAVC_AssertAttributeValueCompares`):** Verify comparison rules and target values.
   - **Assert Object Counts (`AOCN_AssertObjectCounts`):** Verify target counts match expected matrix values.
   - **Assert Exceptions (`AEXC_AssertExceptions`):** Verify exception comparison strings match expected error messages.
   - **Validation Feedback Messages (`AVFM_AssertValidationFeedbackMessages`):** Verify feedback message strings and target widget/attribute keys.
4. **Report Audit Results:** Record cell-by-cell pass/fail results in Section 1 (Plan Conformity Audit - Section 7) of the Post-Construction Smoke Audit Report. Any cell value mismatch or missing variation item MUST be reported and resolved before proceeding to execution (`STATE_RUN_ANALYZE`).



