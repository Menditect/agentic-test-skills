# 📋 MTA Test Step Construction Reference Cheat-Sheet

This cheat-sheet provides a highly condensed, high-density technical summary of all MTA Test Steps, Assertions, and Boundary Rules using the consolidated 53-tool MTA-ACCP MCP API (`/primitivetools/mcp`). Use this as a fast-lookup guide during step construction.

---

## ⚡ Critical Boundary Rules (Golden Guardrails)

> [!IMPORTANT]
> ### 🚫 Guardrail 1: Step Lifecycle & Object Actions
> *   **Step Lifecycle Management:** Create and configure test steps using `CreateObjectActionTestStep` or `CreateMicroflowCallTestStep`. Sequence steps using `SetSequenceOfTestStep` or `MoveTestStepToOtherTestCase`.
> *   **AUT Object Actions (Automated):** Manipulating database records inside the App Under Test is performed via **`CreateObjectActionTestStep`** with `ObjectAction` in `{"CreateObject", "ChangeObjects", "RetrieveObjects", "DeleteObjects", "Persist"}`.
> *   **Direct Initialization on Create Object Law:** ALL initial attribute values and associations MUST be configured directly on the Create Object step using `EditAttributeValue` and `CreateSelectObjectForAssociation` + `EditTestStepAssociation`. Creating a subsequent Change Object step is prohibited [^PAT-06] [^ANTI-01].

> [!IMPORTANT]
> ### 🚫 Guardrail 2: Validation Feedback Assertions
> *   **Backend/Microflow Tests:** Assert validation feedback at the **Test Case level** using `CreateAssertValidationFeedbackMessageCompare` and `CreateAssertValidationFeedbackMessageCount`.
> *   **Frontend/UI Tests:** Assert validation feedback shown in browser pages as standard UI text elements using regular frontend/Playwright locator assertions (e.g., `ASR_Widget_Has_Text`).

---

## 🛠️ MTA Test Step Payloads & APIs (53-Tool MTA-ACCP)

### 1. Object Action Steps (`CreateObjectActionTestStep`)

| Step Type | `ObjectAction` Enum | Associated Configuration Tools | Core Validation / Behavior |
| :--- | :--- | :--- | :--- |
| **Create Object** | `"CreateObject"` | `EditAttributeValue`, `CreateSelectObjectForAssociation`, `EditTestStepAssociation` | Instantiates an entity in memory. Set all initial attributes and associations directly on this step. |
| **Change Object** | `"ChangeObjects"` | `SetTestStepOutputForSelectObjectForChange`, `EditAttributeValue` | Modifies attributes of an existing retrieved or created object. |
| **Retrieve Object** | `"RetrieveObjects"` | `EditTestStepRetrieve`, `EditAttributeValueFilter` | Retrieves objects from database or teststep output. Apply filters via `EditAttributeValueFilter`. |
| **Delete Object** | `"DeleteObjects"` | `SetTestStepOutputForSelectObjectForDelete` | Marks target objects for deletion. |
| **Persist** | `"Persist"` | *(Position chronologically after write/delete steps)* | Commits all uncommitted in-memory object changes to the database (PAT-21). |

### 2. Microflow Call Steps

| Step Type | MCP Creator Tool | Parameter & Value Configuration Tools | Core Validation / Behavior |
| :--- | :--- | :--- | :--- |
| **Microflow Call** | `CreateMicroflowCallTestStep` | `EditMicroflowObjectParameter`, `EditMicroflowParameterValue` | Executes a Mendix microflow. Return values, exceptions, and side-effects can be asserted. |
| **Locate Page Step** | `GenerateMicroflowCallTestStepLocatePage` | Automated page context generation | Generates a frontend locator step for a Mendix page. |
| **Locate Widget Step**| `GenerateMicroflowCallTestStepLocateWidget`| Automated widget context generation | Generates a frontend locator step for a specific widget. |

---

## 🔍 Assertions Reference

### 1. Attribute Compare (`CreateAssertAttributeValueCompare`)
Compares the value of an attribute of a retrieved, created, or modified object against an expected value.
*   **Resolution:** Call `GetTeststepDetails(TestStepKey)` to obtain `AssertAttributeValueCompareKey`.
*   **Property & Value Bindings:** Call `EditAssertAttributeValueCompare` with `AssertAttributeValueCompareKey`, `ComparisonOperator` (`"Equal"`, `"NotEqual"`, `"GreaterThan"`, `"LessThan"`, `"Contains"`, etc.), and `EditAction` (`"SetStringValue"`, `"SetIntegerValue"`, `"SetLongValue"`, `"SetDecimalValue"`, `"SetBooleanValue"`, `"SetDateTimeValueWithCurrentDateTime"`, etc.).
*   **Data Variation:** Register via `AddTestCaseVariationItem(Action="AddAssertAttributeValueCompareTestCaseVariationItem", ObjectKey=AssertAttributeValueCompareKey)`.

### 2. Exception Assertion (`CreateAssertException`)
Asserts that a Microflow Call step throws an expected exception or completes without exception.
*   **Resolution:** Call `GetTeststepDetails(TestStepKey)` to obtain `AssertExceptionKey`.
*   **Properties & Message:** Call `EditAssertException` with `AssertExceptionKey`:
    - `EditAction="SetExpectedResult"`, `ExpectedResult="RaisedException"` (or `"NoException"`).
    - `EditAction="SetComparisonString"`, `ComparisonString="Expected error substring"`.
*   **Data Variation:** Register via `AddTestCaseVariationItem(Action="AddAssertExceptionTestCaseVariationItem", ObjectKey=AssertExceptionKey)`.

### 3. Object Count Assertion (`CreateAssertObjectCount`)
Asserts that the number of objects retrieved or present in a list matches an expected integer.
*   **Resolution:** Call `GetTeststepDetails(TestStepKey)` to obtain `AssertObjectCountKey`.
*   **Properties:** Call `EditAssertObjectCount` with `AssertObjectCountKey`:
    - `EditAction="SetExpectedObjectCount"`, `ExpectedObjectCount=1`.
    - `EditAction="SetComparisonOperator"`, `ComparisonOperator="Equals"` (or `"Greater_than"`, `"GreaterThanEqualTo"`, `"Less_than"`, `"LessThanEqualTo"`).
*   **Data Variation:** Register via `AddTestCaseVariationItem(Action="AddAssertObjectCountTestCaseVariationItem", ObjectKey=AssertObjectCountKey)`.

### 4. Microflow Return Value Assertion (`CreateAssertMicroflowReturnValue`)
Asserts that a microflow returns a value matching expected conditions.
*   **Resolution:** Call `GetTeststepDetails(TestStepKey)` to obtain `AssertMicroflowReturnValueCompareKey`.
*   **Creation vs. Edit Operators:** `CreateAssertMicroflowReturnValue` requires plural `"Equals"`, whereas `EditAssertMicroflowReturnValueCompare` strictly requires singular `"Equal"`, `"NotEqual"`, `"GreaterThan"`, `"GreaterThanOrEqual"`, `"LessThan"`, `"LessThanOrEqual"`, `"Contains"`, `"NotContains"`, `"StartsWith"`, `"EndsWith"`.
*   **Properties:** Call `EditAssertMicroflowReturnValueCompare` with `AssertMicroflowReturnValueCompareKey`, `ComparisonOperator` (singular `"Equal"`, `"NotEqual"`, etc.), `EditAction` (`"SetStringValue"`, `"SetIntegerLongValue"`, `"SetBooleanValue"`, `"SetDecimalValue"`, etc.), and target value.
*   **Data Variation:** Register via `AddTestCaseVariationItem(Action="AddAssertMicroflowReturnValueCompareTestCaseVariationItem", ObjectKey=AssertMicroflowReturnValueCompareKey)`.

### 5. Validation Feedback Message Assertions (Backend Only)
*   **Message Compare:** `CreateAssertValidationFeedbackMessageCompare` (TestCaseKey, MemberType, AttributeName, ComparisonOperator=`"Equals"`, Quantifier, ComparisonString) + `EditAssertValidationFeedbackMessageCompare` (operators: plural `"Equals"`, `"NotEquals"`, `"Contains"`, `"NotContains"`).
*   **Message Count:** `CreateAssertValidationFeedbackMessageCount` (TestCaseKey, ComparisonOperator=`"Equals"`, ComparisonNumber) + `EditAssertValidationFeedbackMessageCount` (operators: plural `"Equals"`, `"Greater_than"`, `"GreaterThanEqualTo"`, `"Less_than"`, `"LessThanEqualTo"`).

---

## 🔄 Construction Workflow: Deterministic 4-Phase Protocol (PAT-78, ANTI-32)
1.  **Scope & Plan Gating:** Ensure test configuration, test suite, and test case name are aligned (Gate 1 & Gate 2 approvals), and the approved Execution Plan is saved locally or verified in chat context (`PAT-44`).
2.  **Phase 1: Sequential Step Pipeline (`SKELETON_PROVISIONING`):**
    * Concurrently dispatch `CreateTestCase` for all cases (`PAT-79`).
    * Create steps one-by-one in exact forward sequence using `CreateObjectActionTestStep` or `CreateMicroflowCallTestStep` (strictly sequential predecessor chaining; parallel step creation is banned).
    * Pass `TestStepOutputKey` directly into `CreateObjectActionTestStep` for `ChangeObjects` and `DeleteObjects` (`PAT-80`).
3.  **Phase 2: Step & Assertion Configuration (`BATCH_BINDING`):**
    * Inspect created step keys via `GetTestCaseDetails`.
    * Concurrently dispatch ALL independent attribute values (`EditAttributeValue`), parameter bindings (`EditMicroflowParameterValue`, `EditMicroflowObjectParameter`), assertion configurations (`CreateAssert*`), dedicated outputs (`SetTestStepOutputFor*`), and step settings in a **single turn** (`PAT-81`). Single-call loops are strictly prohibited (`ANTI-32`).
4.  **Phase 3: Variation Item Registration (`VARIATION_REGISTRATION`):**
    * **Zero Disconnect SSOT Invariant:** Registered items MUST strictly match Section 7 of the approved plan. Zero unapproved additions allowed.
    * Concurrently dispatch ALL planned `AddTestCaseVariationItem` calls in a **single turn**.
5.  **Phase 4: Variation Column Population (`VARIATION_POPULATION`):**
    * For each variation column created via `CreateTestCaseVariation`, configure the entire column in **EXACTLY 1 turn** (dispatch all cell edits, `SetName`, and `SetDescription` concurrently).
6.  **Smoke Audit (`STATE_SMOKE_AUDIT`):**
    * Concurrently dispatch all `GetTestCaseDetails` queries in a **single turn**.
    * Verify clean retrievals, single persist placements, zero unfilled variation cells, and **zero unapproved additions** before concluding construction.
