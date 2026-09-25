# MTA Backend Testing & API Helpers
**📍 You are here:** `references/api-helpers.md` | **🏠 Return to:** [MTA Core Skill](../SKILL.md)
*Metadata: Version 3.0 | Last Updated: 2026-09-02*

This reference contains the essential microflows, sequence steps, and entities of the `MenditectMtaCommons` module (which is a standard Mendix `.mxmodule` module) for REST/API, HTTP testing, variable scoping, and core backend object mapping using the consolidated 51-tool MTA-ACCP MCP API (`/primitivetools/mcp`).

---

## 🏗️ DOMAIN MODEL ENTITY DIRECTORY

*   **`HttpRequest`**: `Method` (GET/POST/PUT/DELETE), `URI` (String), `Timeout` (Integer).
*   **`HttpHeader`**: `Name` (String). Associated with value (`HttpHeaderValue.Value`) and request.
*   **`HttpQueryParameter`**: `Name`, `Value` (String). Associated with request.
*   **`StringHttpBody`**: `Value` (String) representing raw text payloads.
*   **`HttpResponse`**: `StatusCode` (Integer). Returns execution results.

---

## 🔀 THE CANONICAL HTTP EXECUTION SEQUENCE

API teststeps MUST be built sequentially following the **Options-First Creation Protocol**:

```
Step 1: HTTP_CreateHttpRequest ➔ Returns $request
             │
             ├──► Step 2 (Optional): Append Headers/Params/Auth ➔ Input: $request
             ├──► Step 3 (Optional): Attach JSON/Body Payload  ➔ Input: $request
             │
Step 4: HTTP_ExecuteHttpRequest ➔ Input: $request, Returns $response
             │
Step 5: HTTP_GET_HttpResponseBodyString ➔ Input: $response, Returns $bodyString
             │
Step 6: Assertions (Configured programmatically via Assert tools)
```

---

## 📖 API MICROFLOW REFERENCE DIRECTORY

### 1. HTTP Construction & Execution (`HTTP_...`)
*   **`HTTP_CreateHttpRequest(Method, URI, Timeout)`** ➔ Returns `HttpRequest`. Instantiates request. Call this first.
*   **`HTTP_AddHttpHeader(HttpRequest, Name, Value)`** ➔ Appends HTTP headers (e.g. `Authorization`). Chain sequentially for multiples.
*   **`HTTP_AddHttpQueryParameter(HttpRequest, Name, Value)`** ➔ Appends query parameters to request URI.
*   **`HTTP_AddBasicAuth(HttpRequest, Username, Password)`** ➔ Injects Base64 Basic Auth header.
*   **`HTTP_AddHttpBodyJson(HttpRequest, JsonBody)`** ➔ Attaches body AND injects `Content-Type: application/json` header. **(Preferred)**
*   **`HTTP_ExecuteHttpRequest(HttpRequest)`** ➔ Returns `HttpResponse`. Synchronously executes request.
*   **`HTTP_GET_HttpResponseBodyString(HttpResponse)`** ➔ Returns `String`. Extracts response body as raw text.

### 2. Variable Scoping Helpers (`VAR_...`)
Bridges dynamic outputs to allow saving, isolating, and passing variables downstream:
*   **`VAR_String(Value)`** | **`VAR_Integer(Value)`** | **`VAR_Decimal(Value)`** | **`VAR_Boolean(Value)`** | **`VAR_DateTime(Value)`**

### 3. Session Tracing Utilities (`GET_...`)
Fetches runtime session state during execution:
*   **`GET_latestHttpResponse()`** ➔ Returns last response.
*   **`GET_latestError()`** ➔ Returns last caught error string.
*   **`GET_currentSession()`** / **`GET_currentUser()`** ➔ Fetches active session or user entity.

### 4. Assertions Capabilities & Comparison Operator Wire Format Reference

> [!IMPORTANT]
> **The Assertion & Filter Operator Law: Singular vs. Plural vs. Mixed Casing**
> You must strictly match the operator format required by each specific assertion and filter tool:
> 
> * **Rule of Thumb 1 (Singular Standard):** Entity attribute value comparisons (`EditAssertAttributeValueCompare`), microflow return value assertion edits (`EditAssertMicroflowReturnValueCompare`), and retrieve attribute filters (`EditAttributeValueFilter`) strictly use **Singular PascalCase** (`Equal`, `NotEqual`, `GreaterThan`, `GreaterThanOrEqual`, `LessThan`, `LessThanOrEqual`, `Contains`, `NotContains`, `StartsWith`, `EndsWith`).
> * **Rule of Thumb 2 (Plural Standard):** Creation of microflow return value assertions (`CreateAssertMicroflowReturnValue`) and validation feedback message assertions (`CreateAssertValidationFeedbackMessageCompare`, `EditAssertValidationFeedbackMessageCompare`) use **Plural PascalCase** (`Equals`, `NotEquals`, etc.).
> * **Rule of Thumb 3 (Mixed Casing Count Operators):** Object count assertions and validation message count assertions use a **mixed PascalCase / snake_case format** (`Equals`, `Greater_than`, `GreaterThanEqualTo`, `Less_than`, `LessThanEqualTo` — notice `Greater_than` and `Less_than` have underscores and lowercase `than`).

| Tool Name | Target Property | Allowed Operator Values |
| :--- | :--- | :--- |
| `CreateAssertMicroflowReturnValue` | `ComparisonOperator` | `"Equals"`, `"NotEquals"`, `"GreaterThan"`, `"GreaterThanOrEqual"`, `"LessThan"`, `"LessThanOrEqual"`, `"Contains"`, `"NotContains"`, `"StartsWith"`, `"EndsWith"` |
| `EditAssertMicroflowReturnValueCompare` | `ComparisonOperator` | `"Equal"`, `"NotEqual"`, `"GreaterThan"`, `"GreaterThanOrEqual"`, `"LessThan"`, `"LessThanOrEqual"`, `"Contains"`, `"NotContains"`, `"StartsWith"`, `"EndsWith"` |
| `CreateAssertValidationFeedbackMessageCompare` | `ComparisonOperator` | `"Equals"`, `"NotEquals"`, `"Contains"`, `"NotContains"` |
| `EditAssertValidationFeedbackMessageCompare` | `ComparisonOperator` | `"Equals"`, `"NotEquals"`, `"Contains"`, `"NotContains"` |
| `EditAssertAttributeValueCompare` | `ComparisonOperator` | `"Equal"`, `"NotEqual"`, `"GreaterThan"`, `"GreaterThanOrEqual"`, `"LessThan"`, `"LessThanOrEqual"`, `"Contains"`, `"NotContains"`, `"StartsWith"`, `"EndsWith"` |
| `EditAttributeValueFilter` | `FilterComparisonOperator` *(note name!)* | `"Equal"`, `"NotEqual"`, `"GreaterThan"`, `"GreaterThanOrEqual"`, `"LessThan"`, `"LessThanOrEqual"`, `"Contains"`, `"NotContains"`, `"StartsWith"`, `"EndsWith"` |
| `EditAssertObjectCount` | `ComparisonOperator` | `"Equals"`, `"Greater_than"`, `"GreaterThanEqualTo"`, `"Less_than"`, `"LessThanEqualTo"` |
| `CreateAssertValidationFeedbackMessageCount` | `ComparisonOperator` | `"Equals"`, `"Greater_than"`, `"GreaterThanEqualTo"`, `"Less_than"`, `"LessThanEqualTo"` |
| `EditAssertValidationFeedbackMessageCount` | `ComparisonOperator` | `"Equals"`, `"Greater_than"`, `"GreaterThanEqualTo"`, `"Less_than"`, `"LessThanEqualTo"` |

> [!CAUTION]
> **`CreateAssertObjectCount` does NOT accept `ComparisonOperator`!**  
> `CreateAssertObjectCount` only takes `TestStepKey`. The operator and expected count must be set in a subsequent call to `EditAssertObjectCount`.

#### Mendix Keyword Escape & Flag Formatting Law
Mendix runtime tools strictly differentiate between keyword-escaped flags, boolean strings, and action names:

1. **Keyword-Escaped Enums (Require Leading Underscore `_`):**
   * `ResumeExecutionAfterException`: Must be `"_Continue"` or `"Stop"`. Passing `"Continue"` will fail!
   * `BooleanValue`: Must be `"_True"` or `"_False"`.
   * `SetValueToEmpty`: Must be `"_True"` or `"_False"`.
   * `TrimStringValue`: Must be `"_True"` or `"_False"`.
   * `Highlight`: Must be `"_True"` or `"_False"`.
   * `IsGlobalWidget`: Must be `"_True"` or `"_False"`.

2. **Compound Action Enums (NO Underscore):**
   * `ActionFailedAssert`: Must be `"ContinueTestRun"` or `"StopTestRun"` (no underscore).

3. **TestCase Container Flags (Yes/No Strings):**
   * `RollbackTcseAfterExecution`: Must be `"Yes"` or `"No"`.
   * `ApplySecurity`: Must be `"Yes"` or `"No"`.

#### Cloned AssertObjectCount Default Invariant
When test case variations are cloned via `CreateTestCaseVariation`, cloned `AssertObjectCount` containers in newly minted variations default to `ExpectedObjectCount: 0`. If a scenario expects $\ge 1$ objects, you MUST explicitly call `EditAssertObjectCount(SetExpectedObjectCount)` with `ExpectedObjectCount: N`.

#### Numeric & Scalar Value Wire Formats (`EditAttributeValue`, `PAT-81`)
MTA requires strict parameter naming and data types when updating attribute values:
- **Integer / Long:** `EditAction="SetIntegerValue"` or `"SetLongValue"`, pass `IntegerLongValue: 123` (raw integer, **NOT** string `"123"`).
- **String:** `EditAction="SetStringValue"`, pass `StringValue: "text"`.
- **Boolean:** `EditAction="SetBooleanValue"`, pass `BooleanValue: "_True"` or `"_False"`.
- **Decimal:** `EditAction="SetDecimalValue"`, pass `DecimalValue: 12.50` (numeric decimal).
- **DateTime:** `EditAction="SetDateTimeValueWithSpecifiedDateTime"`, pass `SpecifiedDateTimeValue: "2026-09-09T12:00:00Z"`.
- **Piped Output Value:** `EditAction="SetTestStepOutputForSelectValueForValue"`, pass `TestStepOutputKey: ...`, `TestStepOutputAttributeName: "..."`.

#### Primitive Null / Empty Syntax
To set an attribute, parameter, or expected return value to empty (NULL) in `EditAttributeValue` or assertion comparison tools, pass `SetValueToEmpty: "_True"`.

---

## 🚫 CRITICAL API ANTI-PATTERNS
*   ❌ **Creating headers/params after request execution:** Executed HTTP requests are synchronous. Build and associate all header/query/body steps *before* calling `HTTP_ExecuteHttpRequest`.
*   ❌ **Using HTTP_AddHttpBodyString for JSON:** Fails to declare the `Content-Type: application/json` header. Always use `HTTP_AddHttpBodyJson` instead.

---

## 🧭 MENDIX ENTITY TAXONOMY & SPECIALIZED PROVIDER RULE

In the Mendix Domain Model, specialized child entities (e.g., `MenditectMxFrontendTestKit.MxTextBoxLocator`) inherit from generalized parent entities (e.g., `MenditectPlaywrightConnector.Locator`). However, MTA requires strict typing:
1. **The Specialized Provider Rule:** When mapping step outputs to microflow parameters (`EditMicroflowObjectParameter`), you MUST use the provider microflow that returns the exact, specialized child entity (e.g., `Locate_MxWidget_TextBox`) rather than a generalized locator or parent provider.
2. **Instantiability Constraints:** Technical runtime handles representing live OS/browser resources (such as `Browser`, `BrowserContext`, `Page`, and `Locator` parents) **MUST NEVER** be statically created via `CreateObjectActionTestStep(ObjectAction="CreateObject")`. Creating them directly is strictly prohibited and results in immediate compiler/runtime crashes. They must only be obtained via their respective lifecycle microflows (e.g., `Start_Frontend_Test_Locally`, `Create_BrowserContext`, `Create_Page`).

---

## 🔍 PRE-CONSTRUCTION MODEL-TO-MTA SCHEMA AUDIT (PAT-82, ANTI-36)

Before creating persistent test suites, test cases, or test steps in MTA (or when assessing whether an exploratory test can be promoted directly to MTA), you **MUST** run a schema audit using `GetAppModelData` comparing the synchronized MTA model against local Mendix AST (`mxcli`).

*   **Trial-and-Error Building Prohibition (`ANTI-36`):** You are strictly prohibited from attempting to build steps or relying on step creation errors (`Entity not found`, `Microflow not found`) to discover model discrepancies. The schema audit via `GetAppModelData` MUST always be performed first before dispatching any persistent creation tools.
*   **Audit Entities & Attributes:**
    `GetAppModelData(RetrieveAction="RetrieveEntityByApplicationAndTestConfiguration", EntityQualifiedName="Sales.Order")`
    Verifies that the entity and all attributes referenced in steps and data variations exist in MTA.
*   **Audit Microflow Signatures:**
    `GetAppModelData(RetrieveAction="RetrieveMicroflowByApplicationAndTestConfiguration", MicroflowQualifiedName="Sales.SUB_ProcessOrder")`
    Verifies microflow existence, parameter names, types, and return values.
*   **Audit Enumerations:**
    `GetAppModelData(RetrieveAction="RetrieveEnumerationByApplicationAndTestConfiguration", EnumerationQualifiedName="Sales.OrderStatus")`
    Verifies enumeration keys and allowed values.
*   **Audit Pages & Widgets:**
    `GetAppModelData(RetrieveAction="RetrievePagesByApplicationAndTestConfiguration")` and `GetAppModelData(RetrieveAction="RetrieveWidgetsByPage", PageQualifiedName="Sales.Order_Overview")`
    Verifies page existence and widget identifiers for locator mapping.
*   **Synchronization Gate:** If any model element planned in the Execution Plan is missing or outdated in MTA, **HALT** construction. Inform the user that MTA requires an updated model revision synchronization before proceeding.

---

## 🔍 DATABASE OBJECT RETRIEVES & FILTERING (XPATH AND FILTERS)

To query and retrieve existing objects from the database within your test cases, use `CreateObjectActionTestStep` with `ObjectAction="RetrieveObjects"`.

### 1. The Retrieve Configuration & Filtering Flow
To configure memory or database retrieves and apply attribute filters:

1. **Create the Step:**
   `CreateObjectActionTestStep(TestCaseKey, ObjectAction="RetrieveObjects", EntityQualifiedName="Sales.Order", TestStepName="Retrieve Order")`
2. **Configure Retrieve Mode (Memory vs Database):**
   * For Memory:
     `EditTestStepRetrieve(TestStepKey, EditAction="SetRetrieveOption", RetrieveOption="Teststep")`
     `EditTestStepRetrieve(TestStepKey, EditAction="SetRetrieveSet", RetrieveSet="Head")`
     `EditTestStepRetrieve(TestStepKey, EditAction="SetTestStepForRetrieveByTeststep", TestStepOutputKey=ProviderStepKey)`
   * For Database:
     `EditTestStepRetrieve(TestStepKey, EditAction="SetRetrieveOption", RetrieveOption="Database")`
     `EditTestStepRetrieve(TestStepKey, EditAction="SetRetrieveSet", RetrieveSet="Head" | "All")`
3. **Include Filter Attributes (CRITICAL RULE):**
   > [!IMPORTANT]
   > Always call **`EditAttributeValue`** (NOT `EditAttributeValueFilter`) to include attributes on Retrieve steps:
   > `EditAttributeValue(TestStepKey=..., AttributeName="...", EditAction="IncludeAttribute")`
   > `EditAttributeValueFilter` is strictly for updating filter values/ranges on database retrieves after inclusion, never for `IncludeAttribute`.
4. **Set Filter Value:**
   * On memory retrieves: Call `EditAttributeValue` (`SetStringValue`, `SetEnumerationValue`, etc.).
   * On database retrieves with complex ranges/operators: Call `EditAttributeValueFilter` with `FilterComparisonOperator` and target value.


#### 🔧 SOP: Constructing In-Memory Retrieve Steps (`PAT-07`)
When creating a step to retrieve an in-memory object from a predecessor step:
1. **Create Step:**
   Call `CreateObjectActionTestStep(ObjectAction="RetrieveObjects", EntityQualifiedName="...", TestStepName="...")`.
2. **Configure Retrieve Option to Memory / Teststep:**
   Call `EditTestStepRetrieve`:
   ```json
   {
     "TestStepKey": <RetrieveStepKey>,
     "EditAction": "SetRetrieveOption",
     "RetrieveOption": "From_memory_database"
   }
   ```
   And bind predecessor output:
   ```json
   {
     "TestStepKey": <RetrieveStepKey>,
     "EditAction": "SetTestStepForRetrieveByTeststep",
     "TestStepOutputKey": <ProducerStepKey>
   }
   ```
3. **Include & Configure Attribute Filters (`PAT-07`):**
   - **Include Attribute:** `EditAttributeValue(EditAction="IncludeAttribute", AttributeQualifiedName="...")`
   - **Set Filter:** `EditAttributeValueFilter(FilterComparisonOperator="Equal", StringValue="...", EnumerationValue="...")`

---

### 2. Supported Filter Types in `EditAttributeValueFilter`:
The `EditAttributeValueFilter` tool is used to configure filter values and comparison ranges on database retrieves (after inclusion via `EditAttributeValue`):
*   `"SetStringValue"` (supports singular `Equal`, `NotEqual`, `Contains`, `NotContains`, `StartsWith`, `EndsWith`; for empty, pass `SetValueToEmpty="_True"`)
*   `"SetIntegerValue"` / `"SetMinimumAndMaximumIntegerValues"`
*   `"SetLongValue"` / `"SetMinimumAndMaximumLongValues"`
*   `"SetDecimalValue"` / `"SetMinimumAndMaximumDecimalValues"`
*   `"SetBooleanValue"`
*   `"SetDateTimeValueWithCurrentDateTime"` / `"SetDateTimeValueWithCurrentDateTimeWithOffset"` / `"SetDateTimeValueWithSpecifiedDateTime"` / `"SetMinimumAndMaximumDateTimeValues"`
*   `"SetAutoNumberValue"` / `"SetMinimumAndMaximumAutoNumberValues"`
*   `"SetEnumerationValue"`
*   `"SetHashStringValue"`
*   `"SetTestStepOutputForSelectValueForValue"` (dynamic scalar piping)

### 3. Core Database Retrieval Filtering Laws
*   **XPath Filter Simulation:** Attribute values and associations configured on a retrieve teststep act as **XPath filters** at runtime to select the target record.
*   **The "AND" Filtering Law:** When multiple associations and/or attribute filters are defined on a single retrieve step, they act as **AND** filters (meaning the retrieved object must satisfy *all* specified criteria).
*   **The Empty Filter Note:** If no attributes or associations are specified, the step will retrieve the first available record of that entity type in the database.

---

## 💾 DATABASE OBJECT MODIFICATION ACTIONS (CREATE, CHANGE, DELETE, PERSIST)

To directly manipulate domain model objects in database or transaction memory and commit them within your test cases, use `CreateObjectActionTestStep`.

### 1. Direct Initialization vs. The Change Object Pipeline

To set attribute values and associations on a **newly created object**, you MUST initialize them directly on the creation step itself. Creating a separate `Change Object` step immediately following a `Create Object` step to configure initial attributes or associations is strictly **PROHIBITED** (anti-pattern [^PAT-06] [^ANTI-01]).

#### Option A: Direct Attribute & Association Initialization on Creation (Mandatory for New Objects)
If you are creating an object and want to set its initial state immediately:
1. **Create the Object:** Call `CreateObjectActionTestStep(TestCaseKey, ObjectAction="CreateObject", EntityQualifiedName="Sales.Order", TestStepName="Create Order")` (returns string `"Teststep key: <Key>"`).
2. **Stage 1 (Include Attributes):** Call `EditAttributeValue(TestStepKey=CreatedStepKey, AttributeName="OrderDate", EditAction="IncludeAttribute")`. Repeat for all required attributes.
3. **Stage 2 (Resolve Keys):** Call `GetTeststepDetails(CreatedStepKey)` to obtain the newly generated `AttributeValueKey`s.
4. **Stage 3 (Batch Set Values in 1 Turn):** Dispatch `EditAttributeValue` calls in parallel in a single turn:
   - `AttributeValueKey`: Target attribute key.
   - `EditAction`: The typed setter action (e.g., `"SetStringValue"`, `"SetIntegerValue"`, `"SetDateTimeValueWithCurrentDateTimeWithOffset"`, `"SetEnumerationValue"`).
   - The value argument (e.g., `StringValue="ORD-100"`, `EnumerationValue="Pending"`).
5. **Set Associations:** Call `CreateSelectObjectForAssociation(TestStepKey, AssociationQualifiedName="Sales.Order_Customer")`, then call `EditTestStepAssociation(SelectObjectForAssociationKey, EditAction="SetTestStepOutput", TestStepOutputKey=CustomerStepKey)` to link the target associated object.

#### ⚙️ Supported `EditAction` Operations in `EditAttributeValue`:
*   `"IncludeAttribute"` / `"ExcludeAttribute"` (requires `TestStepKey` and `AttributeName`)
*   `"SetStringValue"`: Sets a Mendix String attribute (requires `AttributeValueKey`, `StringValue`).
*   `"SetIntegerValue"` / `"SetLongValue"`: Sets Integer or Long attributes (requires `AttributeValueKey`, `IntegerLongValue`).
*   `"SetDecimalValue"`: Sets a Decimal attribute (requires `AttributeValueKey`, `DecimalValue`).
*   `"SetBooleanValue"`: Sets a Boolean attribute (requires `AttributeValueKey`, `BooleanValue` in `["_True", "_False"]`).
*   `"SetDateTimeValueWithSpecifiedDateTime"`: Sets a specific ISO timestamp (requires `AttributeValueKey`, `SpecifiedDateTimeValue`).
*   `"SetDateTimeValueWithCurrentDateTime"` / `"SetDateTimeValueWithCurrentDateTimeWithOffset"`: Sets runtime server timestamp with optional day/hour/minute offsets.
*   `"SetEnumerationValue"`: Sets an Enumeration attribute (pass technical Name in `EnumerationValue`).
*   `"SetTestStepOutputForSelectValueForValue"`: Pipes dynamic scalar value from upstream output (`TestStepOutputKey`, `TestStepOutputAttributeName`).

#### Option B: The Change Object Pipeline (Required for Retrieved or Post-Creation Updates - PAT-80)
When modifying an object's state **later** in the test case or modifying an **existing retrieved object**:
1. **Create the Change step:** Call `CreateObjectActionTestStep(TestCaseKey, ObjectAction="ChangeObjects", EntityQualifiedName="Sales.Order", TestStepName="Change Order Status", TestStepOutputKey=ProducerStepKey, TestStepBeforeKey=...)`.
   *(Mandatory Binding: `TestStepOutputKey` MUST be passed directly at creation time per `PAT-80`. Calling an unbound step creation followed by `SetTestStepOutputForSelectObjectForChange` is an anti-pattern `ANTI-34`).*
2. **Set Attribute Values:** Include attributes via `EditAttributeValue(..., EditAction="IncludeAttribute")`, query `GetTeststepDetails`, and batch-set values via `EditAttributeValue` on `AttributeValueKey` in Turn 3.

### 2. The Delete Object Pipeline (Direct Output Binding - PAT-80, PAT-92, PAT-95)
To mark an object for deletion from the database:
1. **Create the Delete step:** Call `CreateObjectActionTestStep(TestCaseKey, ObjectAction="DeleteObjects", EntityQualifiedName="Sales.Order", TestStepName="Delete Order", TestStepOutputKey=ProducerStepKey, TestStepBeforeKey=...)`.
   *(Mandatory Binding: `TestStepOutputKey` MUST be passed directly at creation time per `PAT-80`. Calling an unbound step creation followed by `SetTestStepOutputForSelectObjectForDelete` is an anti-pattern `ANTI-34`).*
2. **Setup Seeding Optimization (Direct Cross-Case Piping - PAT-92, PAT-95):** If the object was created using a setup/seeding step (e.g. in Case 1 Setup), reference its creation teststep key directly as `TestStepOutputKey` **without retrieving it first from the database**. Even across different test cases within the same test suite, MTA preserves output handles across the entire suite session!
   ```json
   // Example: Case 3 Teardown deleting an object created in Case 1 Setup
   {
     "TestCaseKey": 4567, // Case 3: Teardown
     "ObjectAction": "DeleteObjects",
     "EntityQualifiedName": "Sales.Order",
     "TestStepName": "Delete Seeded Order",
     "TestStepOutputKey": 1234 // Key of Case 1 Step: "Create Order" (Direct Cross-Case Piping!)
   }
   ```
3. **Browser-Created Data Requirement:** If the object was created natively in the browser session via UI actions in Case 2, retrieve it first using an explicit synthetic attribute filter (e.g., `'TEST_'` prefix) and reference that retrieve step key as `TestStepOutputKey`.
4. **Reverse Dependency Order Deletion (PAT-93):** Always sequence delete steps in reverse association dependency order ($\text{Leaf / Child} \rightarrow \text{Intermediate} \rightarrow \text{Root}$).
5. **Cascade Delete Check:** Check if cascade delete is natively enabled in Mendix before creating manual delete steps for associated child objects.

### 3. The Persist Step Framework (`ObjectAction="Persist"`)
MTA operates in transactional memory. Changes, creations, and deletions are only pushed to the database and finalized once a **Persist** step is executed.

*   **Syntax:** Call `CreateObjectActionTestStep(TestCaseKey, ObjectAction="Persist", TestStepName="Persist Changes", TestStepBeforeKey=...)`.
*   **Chronological Placement Rule:** Always insert the Persist step chronologically **after** the steps that perform write/delete actions.
*   **Domain Model Events:** `Before Commit` / `After Commit` and `Before Delete` / `After Delete` are triggered natively during Persist execution.

#### 🚫 Single Persist Step Placement (No Per-Step Persisting)
1. **Seeding Block:** Group all object creations/changes together, and call a single `Persist` step *exactly once* at the very end of the seeding block.
2. **Deletion Block:** Group all object deletions together, and call a single `Persist` step *once* at the end of the deletion block.
3. **Retrieval-Only Rule:** If you only use retrieve steps to fetch data for assertions or parameter-passing, a `Persist` step is completely unnecessary and **MUST** be omitted.

#### ⚙️ Teststep Execution Settings for Database Actions (`EditTestStep`)
Configure execution settings via `EditTestStep`:
1. **Frontend & Multi-Case Backend Tests:**
   * **Seeding & Cleanup Steps:** `EditAction="SetExecutionCondition"` with `ExecutionCondition="Always"`, and `EditAction="SetResumeExecutionAfterException"` with `ResumeExecutionAfterException="_Continue"` [^PAT-03] [^PAT-18].
   * **Database Assertions & Retrievals:** `ExecutionCondition="Always"`, `ResumeExecutionAfterException="Stop"`.
2. **Backend Unit Tests (Single-Case with Rollback):**
   * Standard defaults (`ExecutionCondition="None"`, `ResumeExecutionAfterException="Stop"`).

---

## 🔗 THE OBJECT ASSOCIATION BLUEPRINT

When a teststep creates a database record and needs to associate it with another record (either created or retrieved upstream):

1. **Establish the Association Link:** Call `CreateSelectObjectForAssociation` with:
   * `TestStepKey`: The key of the step that created or changed the base object.
   * `AssociationQualifiedName`: Fully qualified name of the association (e.g., `Sales.Order_Customer`).
   * *Returns:* Confirmation string containing `SelectObjectForAssociationKey`.
2. **Configure Target Value:** Call `EditTestStepAssociation` with:
   * `SelectObjectForAssociationKey`: The key returned in Step 1.
   * `EditAction`: `"SetTestStepOutput"` (to bind reference) or `"SetInputToEmpty"` (to empty reference).
   * `TestStepOutputKey`: The parent `TestStepKey` of the step that produced the associated object (required when `EditAction="SetTestStepOutput"`).

---

## ⚙️ MICROFLOW CALL TEST STEP PARAMETER SETTERS

When executing microflows via `CreateMicroflowCallTestStep`:
1. **Create Microflow Step:** Call `CreateMicroflowCallTestStep(TestCaseKey, MicroflowQualifiedName="Sales.SUB_CalculateTotal", TestStepName="Calculate Total", TestStepBeforeKey=...)` ➔ Returns `"Teststep key: <Key>"`.
2. **Resolve Parameter Keys:** Call `GetTeststepDetails(TestStepKey)` to obtain each parameter's `MicroflowParameterValueKey` or `SelectObjectForMicroflowParameterKey`.
3. **Batch Configure Parameters in 1 Turn:**
   - **Object/List Parameters:** Call `EditMicroflowObjectParameter` with:
     - `SelectObjectForMicroflowParameterKey`: The parameter selector key.
     - `EditAction`: `"SetTestStepOutput"` (with `TestStepOutputKey`) or `"SetInputToEmpty"` (to pass null).
   - **Primitive/Scalar Values:** Call `EditMicroflowParameterValue` with:
     - `MicroflowParameterValueKey`: The parameter value key.
     - `EditAction`: `"SetStringValue"`, `"SetBooleanValue"`, `"SetIntegerLongValue"`, `"SetDecimalValue"`, `"SetEnumerationValue"`, `"SetDateTimeValueWithCurrentDateTime"`, or `"SetTestStepOutputForSelectValueForValue"`.
   - **Dynamic Scalar Value Piping (`SetTestStepOutputForSelectValueForValue`):** To pipe a primitive attribute value (e.g., `Name`, `Description`, `Code`) from an upstream creation step (even from an earlier test case like Case 1 Setup) into a UI microflow parameter (e.g. `Value` on `ACT_Fill_TextInput_Input`, `OptionLabel` on `ACT_SelectOption_DropDown_Select_By_Label`, `Text` on `ELO_Filter_*_by_Text`, or `ExpectedValue` on `ACT_Assert_ElementText_Equal`):
     ```json
     {
       "MicroflowParameterValueKey": 8901,
       "EditAction": "SetTestStepOutputForSelectValueForValue",
       "TestStepOutputKey": 1234, // Key of Case 1 Step: "Create Customer" (Direct Cross-Case Piping!)
       "TestStepOutputAttributeName": "Name" // Attribute to pipe dynamically
     }
     ```

---

## 🎯 MTA CORE MICROFLOW RETURN VALUE ASSERTIONS

For backend testing, return values are verified using:
1. **Create Base Assertion:** Call `CreateAssertMicroflowReturnValue(TestStepKey=..., ComparisonOperator="Equals", ActionFailedAssert="ContinueTestRun"|"StopTestRun")` ➔ Returns string confirmation. Note that `TestStepKey`, `ComparisonOperator`, and `ActionFailedAssert` are all mandatory upon creation.
2. **Resolve Assertion Key:** Call `GetTeststepDetails(TestStepKey)` to retrieve `AssertMicroflowReturnValueCompareKey`.
3. **Configure Expected Value:** Call `EditAssertMicroflowReturnValueCompare` with:
   - `AssertMicroflowReturnValueCompareKey`: Key resolved in Step 2.
   - `ComparisonOperator`: `"Equals"` (or `"NotEquals"`, `"GreaterThan"`, etc. - **MANDATORY**: You MUST pass `ComparisonOperator` in the same call as `EditAction`; calling value setters like `SetDecimalValue` or `SetStringValue` without passing `ComparisonOperator` throws `Cannot set ... because the given ComparisonOperator is not valid`!).
   - `EditAction`: `"SetStringValue"`, `"SetBooleanValue"`, `"SetIntegerLongValue"`, `"SetDecimalValue"`, `"SetEnumerationValue"`, `"SetDateTimeValueWithCurrentDateTime"`, `"SetDateTimeValueWithSpecifiedDateTime"`, etc.
   - Target expected value arguments (e.g., `StringValue="Success"` or `IntegerLongValue=100`, per `PAT-81`).

---

## 🎯 OBJECT ATTRIBUTE VALUE COMPARISON ASSERTIONS

To assert attributes of an object (created, modified, or retrieved):
1. **Create the Assertion:** Call `CreateAssertAttributeValueCompare(TestStepKey, AttributeName="Status")` ➔ Returns string confirmation.
2. **Resolve Assertion Key:** Call `GetTeststepDetails(TestStepKey)` to retrieve `AssertAttributeValueCompareKey`.
3. **Configure Expected Value:** Call `EditAssertAttributeValueCompare` with:
   - `AssertAttributeValueCompareKey`: Key resolved in Step 2.
   - `ComparisonOperator`: `"Equal"`, `"NotEqual"`, `"GreaterThan"`, `"GreaterThanOrEqual"`, `"LessThan"`, `"LessThanOrEqual"`, `"Contains"`, `"NotContains"`, `"StartsWith"`, `"EndsWith"`.
   - `EditAction`: `"SetStringValue"`, `"SetIntegerValue"`, `"SetLongValue"`, `"SetDecimalValue"`, `"SetBooleanValue"`, `"SetEnumerationValue"`, `"SetDateTimeValueWithCurrentDateTime"`, etc.
   - Expected value parameters (e.g., `StringValue="Completed"`).

---

## 🎯 OBJECT COUNT ASSERTIONS

To assert on the count of records returned by a microflow or clean retrieve:
1. **Create Count Assertion:** Call `CreateAssertObjectCount(TestStepKey)` ➔ Returns string confirmation.
2. **Resolve Assertion Key:** Call `GetTeststepDetails(TestStepKey)` to retrieve `AssertObjectCountKey`.
3. **Configure Expected Count & Operator:** Call `EditAssertObjectCount` with:
   - `AssertObjectCountKey`: Key resolved in Step 2.
   - `EditAction`: `"SetExpectedObjectCount"` (with `ExpectedObjectCount=1`).
   - `EditAction`: `"SetComparisonOperator"` (with `ComparisonOperator="Equals"`, `"Greater_than"`, `"GreaterThanEqualTo"`, `"Less_than"`, `"LessThanEqualTo"`).

---

## 🚫 EXCEPTION ASSERTIONS

To assert expected exceptions or error handling on a microflow call:
1. **Create Exception Assertion:** Call `CreateAssertException(TestStepKey)` ➔ Returns string confirmation.
2. **Resolve Assertion Key:** Call `GetTeststepDetails(TestStepKey)` to retrieve `AssertExceptionKey`.
3. **Configure Exception Boundaries:** Call `EditAssertException` with:
   - `AssertExceptionKey`: Key resolved in Step 2.
   - `EditAction="SetExpectedResult"` with `ExpectedResult="RaisedException"` (or `"NoException"`).
   - `EditAction="SetComparisonString"` with `ComparisonString="Expected error text"` (substring match).

---

## 🎯 TESTCASE-LEVEL VALIDATION FEEDBACK ASSERTIONS (BACKEND ONLY)

> [!IMPORTANT]
> MTA TestCase-level Validation Feedback assertions apply **EXCLUSIVELY to Backend Microflow unit/integration tests**. In Frontend UI tests, validation is asserted via DOM widget text assertions.

1. **Validation Feedback Compare:**
   - Call `CreateAssertValidationFeedbackMessageCompare(TestCaseKey, MemberType="Attribute", AttributeName="Email", ModuleName="Sales", EntityName="Order", ComparisonOperator="Equals", Quantifier="AtLeastOne", ComparisonString="Invalid email format")`.
   - To edit later: Query `GetTestCaseDetails(TestCaseKey)` $\rightarrow$ call `EditAssertValidationFeedbackMessageCompare(AssertValidationFeedbackMessageCompareKey, EditAction="SetComparisonString", ComparisonString=...)`. To update the comparison operator, call with `EditAction="SetComparisonOperator"` and `ComparisonOperator` (`"Equals"`, `"NotEquals"`, `"Contains"`, `"NotContains"`).
2. **Validation Feedback Count:**
   - Call `CreateAssertValidationFeedbackMessageCount(TestCaseKey, ComparisonOperator="Equals", ComparisonNumber=1)`.
   - To edit later: Query `GetTestCaseDetails(TestCaseKey)` $\rightarrow$ call `EditAssertValidationFeedbackMessageCount(AssertValidationFeedbackMessageCountKey, EditAction="SetComparisonNumber", ComparisonNumber=...)`. To update the count comparison operator, call with `EditAction="SetComparisonOperator"` and `ComparisonOperator` (`"Equals"`, `"Greater_than"`, `"GreaterThanEqualTo"`, `"Less_than"`, `"LessThanEqualTo"`).

---

## 🔄 DATA VARIATION INTEGRATION & BATCH REGISTRATION (PAT-86, PAT-87, ANTI-40)

To register items and configure Data Variation matrices efficiently:
1. **Enable Variations:** Call `AddTestCaseVariationItem(TestCaseKey, Action="EnableTestCaseDatavariation")` (or `AddTestSuiteVariationItem` with `Action="EnableTestSuiteDatavariation"`).
2. **Bulk Item Registration (Phase 3):** Concurrently dispatch item registration calls in safe batches (15-20 per turn) using `AddTestCaseVariationItem` / `AddTestSuiteVariationItem`:
   - Attribute Value: `Action="AddAttributeValueTestCaseVariationItem"`, `ObjectKey=AttributeValueKey`.
   - Microflow Parameter Value: `Action="AddMicroflowParameterValueTestCaseVariationItem"`, `ObjectKey=MicroflowParameterValueKey`.
   - Assert Attribute Compare: `Action="AddAssertAttributeValueCompareTestCaseVariationItem"`, `ObjectKey=AssertAttributeValueCompareKey`.
   - Assert Return Value: `Action="AddAssertMicroflowReturnValueCompareTestCaseVariationItem"`, `ObjectKey=AssertMicroflowReturnValueCompareKey`.
   - Assert Exception: `Action="AddAssertExceptionTestCaseVariationItem"`, `ObjectKey=AssertExceptionKey`.
   - Assert Object Count: `Action="AddAssertObjectCountTestCaseVariationItem"`, `ObjectKey=AssertObjectCountKey`.
   - Assert Feedback Message Compare: `Action="AddAssertValidationFeedbackMessageCompareTestCaseVariationItem"`, `ObjectKey=AssertValidationFeedbackMessageCompareKey`.
   - Assert Feedback Message Count: `Action="AddAssertValidationFeedbackMessageCountTestCaseVariationItem"`, `ObjectKey=AssertValidationFeedbackMessageCountKey`.
3. **Upfront Bulk Column Creation (Step 4.1 - PAT-86):** Call `CreateTestCaseVariation(TestCaseKey)` (or `CreateTestSuiteVariation(TestSuiteKey)`) for ALL remaining scenarios ($2..N$) concurrently in 1 single turn.
4. **Set Variation Names & Descriptions (PAT-77):** Batch `EditTestCaseVariation(SetName)` and `EditTestCaseVariation(SetDescription)` calls across all variations.
5. **Single Snapshot & Deterministic Indexing (Steps 4.2 & 4.3 - PAT-86, PAT-87):** Call `GetTestCaseDetails(TestCaseKey)` once to retrieve all cloned variation container and item keys, mapping them directly against registration sequence without extra queries.
6. **Safe Chunked Cell Population (Step 4.4 - PAT-85, PAT-86):** Concurrently dispatch cell overrides in safe batches (max 15-20 calls per turn) using `EditAttributeValue`, `EditMicroflowParameterValue`, or `EditAssert*` (with `SetValueToEmpty="_True"` for empty cells and explicit `SetExpectedObjectCount` for cloned count assertions).

---

## 📜 STANDARDIZED TOOL RETURN CONTRACTS & CONFIRMATIONS

MTA MCP tools return standardized confirmation strings or formatted identifiers upon successful execution:

| Tool Category | Tool Name | Success Confirmation / Return String Format |
| :--- | :--- | :--- |
| **Containers** | `CreateTestSuite` | `"TestSuiteKey: <Key>"` |
| | `CreateTestCase` | `"TestCaseKey: <Key>"` |
| | `CreateExecutionUser` | `"ExecutionUserKey: <Key>"` |
| | `EditExecutionUser` | `"Username has been successfully set"` |
| | `SetSequenceOfTestSuite` | `"The sequence is set for test suit"` |
| | `SetSequenceOfTestCase` | `"The sequence is set for test case"` |
| **Step Lifecycle** | `CreateObjectActionTestStep` | `"Teststep key: <Key>"` |
| | `CreateMicroflowCallTestStep` | `"Teststep key: <Key>"` |
| | `SetSequenceOfTestStep` | `"The sequence is set for teststep"` |
| | `MoveTestStepToOtherTestCase` | `"The teststep is moved to the target test case"` |
| **Bindings & Outputs** | `SetTestStepOutputForSelectObjectForChange` | `"TeststepOutput has been set for SelectObjectForChange"` |
| | `SetTestStepOutputForSelectObjectForDelete` | `"TeststepOutput has been set for SelectObjectForDelete"` |
| **Assertions** | `CreateAssertAttributeValueCompare` | `"AssertAttributeValueCompareKey: <Key>"` (or object key payload) |
| | `CreateAssertMicroflowReturnValue` | `"AssertMicroflowReturnValueKey: <Key>"` |
| | `CreateAssertException` | `"AssertExceptionKey: <Key>"` |
| | `CreateAssertObjectCount` | `"AssertObjectCountKey: <Key>"` |
| **Execution** | `ExecuteTest` | String containing `TestRunKey` and `TestRunExecutionId` |


