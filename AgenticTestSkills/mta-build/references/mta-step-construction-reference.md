# 📋 MTA Test Step Construction Reference Cheat-Sheet

This cheat-sheet provides a highly condensed, high-density technical summary of all MTA Test Steps, Assertions, and Boundary Rules. Use this as a fast-lookup guide during step construction.

---

## ⚡ Critical Boundary Rules (Golden Guardrails)

> [!IMPORTANT]
> ### 🚫 Guardrail 1: Configuration Deletes vs. Runtime Deletes
> *   **MTA Configuration Deletions (Manual):** Deleting test suites, test cases, or test steps in the MTA Portal is **not** supported via MCP tools. For these actions, you MUST use the blue-highlight manual workaround (`SetHighlightOfTestStep`).
> *   **AUT Object Deletions (Automated):** Deleting database records or objects *inside the App Under Test* is fully supported. Use **`CreateTestStepDeleteObject`**; this does NOT require manual highlights.

> [!IMPORTANT]
> ### 🚫 Guardrail 2: Validation Feedback Assertions
> *   **Backend/Microflow Tests:** Assert validation feedback at the **Test Case level** inside MTA.
> *   **Frontend/UI Tests:** Assert validation feedback shown in browser pages as standard UI text elements using regular frontend/Playwright locator assertions.

---

## 🛠️ MTA Test Step Payloads & APIs

### 1. Object Action Steps

| Step Type | MCP Creator Tool | Key Parameters / Payload | Core Validation / Behavior |
| :--- | :--- | :--- | :--- |
| **Microflow Call** | `CreateMicroflowCallTestStep` | `MicroflowName`, `ParameterValueBindings` | Calls a Mendix microflow. Return values can be asserted. |
| **Create Object** | `CreateTestStepCreateObject` | `EntityName`, `AttributeBindings` | Instantiates an entity inside the AUT database. |
| **Change Object** | `CreateTestStepChangeObject` | `SelectObjectStep`, `AttributeBindings` | Modifies attributes of a retrieved or created object. |
| **Retrieve Object** | `CreateTestStepRetrieveObject` | `EntityName`, `XpathConstraint`, `AssociationFilter` | Retrieves an object from the AUT database or memory. |
| **Delete Object** | `CreateTestStepDeleteObject` | `SelectObjectStep` | Deletes a test data object inside the AUT database. |
| **Persist Object** | `CreateTestStepPersist` | *(None / Standalone Batch Commit)* | Commits all uncommitted in-memory object changes to the database (PAT-21). |

---

## 🔍 Assertions Reference

### 1. Attribute Compare (`CreateAssertAttributeValueCompare`)
Compares the value of an attribute of a retrieved/created object against an expected value.
*   **Property Bindings:** Set compare operator (`Equals`, `Contains`, `StartsWith`, `NotEmpty`, `Empty`, etc.) using `SetAssertAttributeValueCompareProperties`.
*   **Data Variation:** Use `AddTestCaseVariationItemAssertAttributeValueCompare` to enable variations.

### 2. Exception Assertion (`CreateAssertException`)
Asserts that a Microflow Call step throws a specific error or exception.
*   **Properties:** Set exact expected exception message using `SetAssertExceptionProperties`.

### 3. Object Count Assertion (`CreateAssertObjectCount`)
Asserts that the number of objects retrieved or present in a list matches an expected integer.
*   **Properties:** Set target step reference and expected count range or value using `SetAssertObjectCountProperties`.

### 4. Microflow Return Value Assertion (`CreateAssertMicroflowReturnValue`)
Asserts that a microflow returns a value matching expected conditions.
*   **Properties:** Configure using type-specific setters (e.g. `SetDecimalAssertMicroflowReturnValueCompare`, `SetIntegerLongAssertMicroflowReturnValueCompare`).

---

## 🔄 Construction Workflow Sequence
1.  **Scope the TestCase:** Ensure configuration, suite, and name are aligned.
2.  **Add Chronological Steps:** Create steps in exact logical sequence.
3.  **Bind Assertions:** Bind assertions immediately to their corresponding target steps.
4.  **Verify Success:** Call `GetTestConstructionErrorsOfTestCase` immediately after building a step block to check for mapping or schema-binding errors.
