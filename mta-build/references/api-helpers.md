# MTA Backend Testing & API Helpers
**📍 You are here:** `references/api-helpers.md` | **🏠 Return to:** [MTA Core Skill](../SKILL.md)
*Metadata: Version 2.2 | Last Updated: 2026-06-26*

This reference contains the essential microflows, sequence steps, and entities of the `MenditectMtaCommons` module (which is a standard Mendix `.mxmodule` module) for REST/API, HTTP testing, variable scoping, and core backend object mapping.

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
Step 6: Assertions (Configured manually until relevant MCP tools become available)
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

### 4. Assertions Capabilities
> [!NOTE]
> **Programmatic Assertion Support:** MTA fully supports programmatic assertions using direct MCP tools. You can now programmatically configure:
> 1. **Microflow Return Value Assertions:** For scalar types (Strings, Integers, Decimals, DateTime, Enumeration) using `CreateAssertMicroflowReturnValue` and its respective setters.
> 2. **Object Count Assertions:** To verify the number of records returned or held in memory/database retrieves using `CreateAssertObjectCount` and `SetAssertObjectCountProperties`.
> 3. **Exception Assertions:** To verify whether microflow calls throw errors or finish successfully using `CreateAssertException` and `SetAssertExceptionProperties`.

---

## 🚫 CRITICAL API ANTI-PATTERNS
*   ❌ **Creating headers/params after request execution:** Executed HTTP requests are synchronous. Build and associate all header/query/body steps *before* calling `HTTP_ExecuteHttpRequest`.
*   ❌ **Using HTTP_AddHttpBodyString for JSON:** Fails to declare the `Content-Type: application/json` header. Always use `HTTP_AddHttpBodyJson` instead.

---

## 🧭 MENDIX ENTITY TAXONOMY & SPECIALIZED PROVIDER RULE

In the Mendix Domain Model, specialized child entities (e.g., `MenditectMxFrontendTestKit.MxTextBoxLocator`) inherit from generalized parent entities (e.g., `MenditectPlaywrightConnector.Locator`). However, MTA requires strict typing:
1. **The Specialized Provider Rule:** When mapping step outputs to microflow parameters (SelectObjectForMicroflowParameter or %SOMP%), you MUST use the provider microflow that returns the exact, specialized child entity (e.g., `Locate_MxWidget_TextBox`) rather than a generalized locator or parent provider.
2. **Instantiability Constraints:** Technical runtime handles representing live OS/browser resources (such as `Browser`, `BrowserContext`, `Page`, and `Locator` parents) **MUST NEVER** be statically created via `CreateTestStepCreateObject`. Calling `CreateTestStepCreateObject` on them is strictly prohibited and results in immediate compiler/runtime crashes. They must only be obtained via their respective lifecycle microflows (e.g., `Start_Frontend_Test_Locally`, `Create_BrowserContext`, `Create_Page`).


---

## 🛠️ MAIA BACKEND MODEL ANALYSIS PROTOCOL

To ensure 100% correct construction of backend microflow teststeps and dynamic data-driven assertions, you must leverage MAIA’s specialized model inspection tools (`ped_read_document`, `ped_get_schema`, and `oql_generate`) prior to composing tests.

### 1. Schema-Based Microflow Logic & Parameter Analysis
Before calling any microflow via `CreateMicroflowCallTestStep` (State 6 and State 7), you MUST analyze its exact signature and parameter structure to avoid data-binding crashes.
1. **Discover Parameter Types:** Use `ped_read_document` with `documentType = "Microflows$Microflow"` and the fully qualified microflow name (e.g., `Sales.SUB_CalculateTotal`) to fetch its definition.
2. **Inspect Parameter Schemas:** Check parameter types (such as Booleans, Integers, or Decimals) and associations. Use `ped_get_schema` with target element types to determine precise validation constraints and properties.
3. **Trace Decision Logic:** Map the internal activities (e.g., retrieves, loops, database commits, or nested microflow calls) by reading specific paths of the document with JSON pointers, such as `paths = ["/actionActivities", "/parameterObjectActivities"]` to construct accurate pre-conditions and post-conditions.

### 2. Domain Model & Entity Structuring (The OQL Generator)
When designing database queries for assertions, or mapping inheritance structures during object retrieves:
1. **Entity and Member Lookup:** Use `ped_read_document` with `documentType = "DomainModels$DomainModel"` to discover all member attributes, data types, and association ownerships for a specific module.
2. **Generate Database Queries:** Use `oql_generate` to analyze the domain model relationships and automatically generate complex database-level query specifications when designing retrieves for multiple associated records.
3. **Audit Inheritance Trees:** Analyze specialized child entities using `ped_get_schema` to ensure the **Specialized Provider Rule** is strictly followed when choosing provider microflows.

> [!NOTE]
> Utilizing MAIA's model inspection tools prevents runtime parameter mismatches, improves precision when mapping inheritance structures, and eliminates guess-work during complex multi-step data flow designs.

---

## 🔍 DATABASE OBJECT RETRIEVES & FILTERING (XPATH AND FILTERS)

To query and retrieve existing objects from the database within your test cases, use `CreateTestStepRetrieveObject` or `CreateTestStepRetrieveObjectByAssociation`. 

### 1. The Retrieve Filter Configuration Flow
To filter retrieve operations, you **MUST NOT** use standard `SetAttribute<Type>Value` tools. Instead, you **MUST** follow this canonical filtering sequence:
1. **Create the Retrieve step:** Call `CreateTestStepRetrieveObject` with the entity name (e.g., `Sales.Order`). This returns `TestStepKey`.
2. **Include the Attribute:** Call `IncludeAttributeInTeststep` with `TestStepKey` and the attribute name (e.g., `OrderStatus`). This returns `AttributeValueKey`.
3. **Set the Filter Comparison:** Call the specialized **`SetFilter<Type>AttributeValue`** or **`SetFilter<Type>AttributeValueRange`** tool (e.g., `SetFilterStringAttributeValue`) passing:
   - `AttributeValueKey`: The key from Step 2.
   - `FilterComparisonOperator`: The comparison operator (e.g., `Equals`, `NotEquals`, `Contains`, `NotContains` for Strings; range operators for numbers and Dates).
   - The filtering target value (e.g., `StringValue`, `DecimalValue`, etc.).

### 2. The 13 Specialized Retrieve Filter Tools:
Depending on the attribute data type, you **MUST** call the corresponding specialized filtering tool on the `AttributeValueKey`:
*   **String:** `SetFilterStringAttributeValue` (supports `Equals`, `NotEquals`, `Contains`, `NotContains`)
*   **Integer:** `SetFilterIntegerAttributeValue` / `SetFilterIntegerAttributeValueRange`
*   **Long:** `SetFilterLongAttributeValue` / `SetFilterLongAttributeValueRange`
*   **Decimal:** `SetFilterDecimalAttributeValue` / `SetFilterDecimalAttributeValueRange`
*   **Boolean:** `SetFilterBooleanAttributeValue`
*   **DateTime:** `SetFilterDateTimeAttributeValue` / `SetFilterDateTimeAttributeValueRange` / `SetFilterCurrentDateTimeAttributeValue` (supports offsets)
*   **AutoNumber:** `SetFilterAutoNumberAttributeValue` / `SetFilterAutoNumberAttributeValueRange`
*   **Enumeration:** `SetFilterEnumerationAttributeValue`
*   **HashString:** `SetFilterHashStringAttributeValue`

### 3. Core Database Retrieval Filtering Laws
*   **XPath Filter Simulation:** Attribute values and associations configured on a retrieve teststep act as **XPath filters** at runtime to select the target record.
*   **The "AND" Filtering Law:** When multiple associations and/or attribute filters are defined on a single retrieve step, they act as **AND** filters (meaning the retrieved object must satisfy *all* specified criteria).
*   **The Empty Filter Note:** If no attributes or associations are specified, the step will retrieve the first available record of that entity type in the database.

---

## 💾 DATABASE OBJECT MODIFICATION ACTIONS (CHANGE, DELETE, PERSIST)

To directly manipulate domain model objects in database or transaction memory and commit them within your test cases, you must use the specialized Change, Delete, and Persist tools.

### 1. Direct Initialization vs. The Change Object Pipeline

To set attribute values on a **newly created object**, you do NOT need a separate `Change Object` step. You can initialize them directly on the creation step itself.

#### Option A: Direct Initialization on Creation (Preferred for New Objects)
If you are creating an object and want to set its initial state immediately:
1. **Create the Object:** Call `CreateTestStepCreateObject` (returns `TestStepKey`).
2. **Include Attributes:** Call `IncludeAttributeValueInTeststep` directly on the creation step's `TestStepKey` to get `AttributeValueKey`.
3.  **Set Values:** Call type-specific setters (e.g., `SetStringAttributeValue`) on `AttributeValueKey`.

#### ⚙️ Complete List of Typed Attribute Setter Tools
When configuring included attributes on Create or Change steps, you **MUST** call the corresponding type-specific setter tool on the `AttributeValueKey` returned by `IncludeAttributeValueInTeststep`:
*   **`SetStringAttributeValue`**: Sets a Mendix String attribute.
*   **`SetIntegerAttributeValue`**: Sets a Mendix Integer attribute.
*   **`SetLongAttributeValue`**: Sets a Mendix Long attribute.
*   **`SetDecimalAttributeValue`**: Sets a Mendix Decimal attribute.
*   **`SetBooleanAttributeValue`**: Sets a Mendix Boolean attribute.
*   **`SetDateTimeAttributeValue`**: Sets a Mendix DateTime attribute to a specific timestamp.
*   **`SetCurrentDateTimeAttributeValue`**: Sets a Mendix DateTime attribute to the current runtime server timestamp.
*   **`SetEnumerationAttributeValue`**: Sets a Mendix Enumeration attribute (pass the technical Name of the enumeration value, NOT the caption).

> [!TIP]
> Always use direct initialization for new objects. It reduces teststeps, simplifies test cases, and runs faster.

#### Option B: The Change Object Pipeline (Required for Retrieved or Post-Creation Updates)
When you need to modify an object's state **later** in the test case (e.g., after a browser action or microflow has run) or when you are modifying an **existing retrieved object**, you MUST execute this exact sequence:
1. **Create the Change step:** Call `CreateTestStepChangeObject` with the entity's fully qualified name (e.g., `Sales.Order`). This returns `TestStepKey`.
2. **Retrieve the Select object:** Call `GetSelectObjectForChangeOfTestStep` with `TestStepKey` to get `SelectObjectForChangeKey`.
3. **Pipe the Target Object:** Call `SetTestStepOutputForSelectObjectForChange` with:
   * `SelectObjectForChangeKey`: The key returned in Step 2.
   * `TestStepOutputKey`: The parent `TestStepKey` of the Create or Retrieve step that produced the target object (e.g., the step that created or retrieved `Order`).
4. **Set Attribute Values (Optional):** To change specific attribute values, call `IncludeAttributeValueInTeststep` on the change `TestStepKey` to get `AttributeValueKey`, then call the type-specific setter tool (e.g., `SetStringAttributeValue`).

### 2. The Delete Object Pipeline (Symmetric Multi-Step Sequence)
To mark an object for deletion from the database, you MUST execute this exact sequence:
1. **Create the Delete step:** Call `CreateTestStepDeleteObject` with the entity's fully qualified name (e.g., `Sales.Order`). This returns `TestStepKey`.
2. **Retrieve the Select object:** Call `GetSelectObjectForDeleteOfTestStep` with `TestStepKey` to get `SelectObjectForDeleteKey`.
3. **Pipe the Target Object:** Call `SetTestStepOutputForSelectObjectForDelete` with:
   * `SelectObjectForDeleteKey`: The key returned in Step 2.
   * `TestStepOutputKey`: The parent `TestStepKey` of the Create or Retrieve step that produced the target object.
     * **Backend Seeding Optimization:** If the object was created using a backend setup step (e.g., `Create Object` seeding), you can reference its `Create Object` teststep key directly as the `TestStepOutputKey` **without retrieving it first**.
     * **Browser-Created Data Requirement:** If the object was created natively in the browser session via UI click/input actions, you **MUST** retrieve it first (using `CreateTestStepRetrieveObject` or a retrieve microflow) and reference that retrieve step key as the `TestStepOutputKey` to perform the delete.
     * **Mendix Domain Model Cascade Delete Guidance:** Before generating manual backend delete steps for associated child objects, you **MUST** first use the Mendix model analysis commands (e.g., via `.\mxcli.bat` or standard model-reading actions) to inspect the Domain Model and verify if cascade delete settings (e.g., delete child objects when parent is deleted) are already configured in Mendix. If cascade delete is natively enabled, do NOT create redundant teststeps to delete the children, as they are cleaned up automatically when the parent is deleted. If cascade delete is NOT enabled, you must explicitly create delete steps for both parent and child objects to avoid database pollution.

### 3. The Persist Step Framework (`CreateTestStepPersist`)
MTA operates in transactional memory. Changes, creations, and deletions are only pushed to the database and finalized once a **Persist** step is executed.

*   **Syntax:** Call `CreateTestStepPersist(TestCaseKey, TestStepBeforeKey)`. Note that selecting Persist automatically sets the name of the teststep to `"Persist"`. (If this is the absolute first teststep in the test case, pass `0` for `TestStepBeforeKey` in the tool call).
*   **Chronological Placement Rule:** Always insert the Persist step chronologically **after** the steps that perform the other object actions (Create, Change, Delete).
*   **Domain Model Events:** Configured domain model events (`Before Commit` and `After Commit` for committed objects; `Before Delete` and `After Delete` for deleted objects) are triggered natively for objects modified or deleted by the transaction.
*   **Domain Model Access:** Access rights are NOT checked during the Persist step execution, but are validated inside individual action steps (Create, Change, Delete).

#### 🚫 Single Persist Step Placement (No Per-Step Persisting)
When creating or deleting multiple objects in a single test case, you are **strictly prohibited** from placing a `Persist` step after every individual `Create` or `Delete` step. Doing so is an expensive anti-pattern that slows test execution and clutters the test design. Instead, follow these rules:
1. **Seeding Block:** Group all memory object creations and changes together, and call a single `Persist` step *exactly once* at the very end of the entire seeding block.
2. **Deletion Block:** Group all memory object deletions together, and call a single `Persist` step *exactly once* at the very end of the entire deletion block.
3. **Combined Seeding & Deletion:** If a single test case contains both a seeding block and a deletion block, call a single `Persist` step *once* at the end of the seeding block, and *once* at the end of the deletion block.
4. **Retrieval-Only Rule:** If you only use retrieve steps to fetch data for assertions or parameter-passing (without creating, changing, or deleting any data), a `Persist` step is completely unnecessary and **MUST** be omitted.

#### ⚙️ Teststep Execution Settings for Database Actions
Rules for configuring execution settings for backend data actions—including database seeding (Create, Change, and Persist), database retrievals, assertions, and cleanup (Delete and Persist)—depend on the test category:

1. **Frontend & Multi-Case Backend Integration Tests:**
   You **MUST** configure execution settings explicitly via `SetExecutionSettingsOfTestStep` according to these strict rules:
   * **Seeding and Teardown/Cleanup Steps (including Persist commits):**
     * `ExecutionCondition` = `"Always"` (to guarantee execution regardless of intermediate test failures, preventing database pollution).
     * `ResumeExecutionAfterException` = `"_Continue"` (note the leading underscore).
   * **Database Assertions & Retrievals:**
     * `ExecutionCondition` = `"Always"` (to guarantee the retrieve runs and reports database state on failure).
     * `ResumeExecutionAfterException` = `"Stop"` (to halt immediately if verification fails, while still capturing the state).

2. **Backend Unit Tests (Single-Case with Rollback enabled):**
   You **MUST NOT** explicitly configure execution settings for object action teststeps (Create, Change, Delete, Persist, Assert, Retrievals). Leave them to use their standard default settings (`ExecutionCondition` = `"None"`, `ResumeExecutionAfterException` = `"Stop"`). This avoids unnecessary steps and configuration complexity. Since the entire case database transaction rolls back automatically on failure, immediately skipping remaining steps upon any exception is correct and expected.

#### 🚨 Critical Persist Edge Cases & Workarounds (MUST FOLLOW):
1. **The Microflow Output Commitment Workaround:** If an object is created or returned by a microflow execution step, a subsequent `Persist` step *alone* will not commit it to the database.
   * *Workaround:* You **MUST** insert a dummy `Change Object` step targeting that object (without actually changing any of its members) immediately before the `Persist` step. This marks the object as "changed" on the client, which forces the Persist step to commit it.
2. **Change before Persist vs. Change after Persist (Inter-Case):**
   * *Allowed:* `Create Object` ➔ `Change Object in Microflow` ➔ `Persist` within the same Test Case. The object is committed with its changed state.
   * *Prohibited/Empty:* `Create Object` ➔ `Persist` in Case N ➔ (Next Test Case N+1) ➔ `Change Object in Microflow` ➔ `Persist`. Crossing case/transaction boundaries without an explicit Change step means the change inside the microflow will **NOT** be committed to the database.
3. **Associations across Cases:**
   * *Behavior:* Creating an association in memory (e.g. associating a new object with a database record) inside Case N without executing `Persist` before retrieving it in a subsequent Case results in an `EMPTY` association. Ensure `Persist` is called in the same test case where the association is defined.
4. **Omission of Persist for Retrieval-Only Flows:** If a test case or database action sequence only performs queries (`Retrieve` steps) to fetch data for assertions or upstream inputs, you are **strictly prohibited** from adding a `Persist` step. `Persist` is strictly a write-action (commit/delete) and serves no function for read-only queries.

---

## 🔗 THE OBJECT ASSOCIATION BLUEPRINT (3-STEP SEQUENCE)

When a teststep creates a database record using `CreateTestStepCreateObject` and needs to associate it with another record (either created or retrieved upstream), you **MUST** execute this exact 3-step sequence sequentially:

1. **Establish the Association Link:** Call `CreateSelectObjectForAssociation` with:
   * `AssociationName`: Fully qualified name of the Mendix association (e.g., `MyModule.Customer_Address`).
   * `TestStepKey`: The key of the step that created the base object (e.g., the step that created `Customer`).
   * *Returns:* `SelectObjectForAssociationKey` (the association link key).
2. **Set the Operation:** Call `SetOperationOfSelectObjectForAssociation` with:
   * `SelectObjectForAssociationKey`: The key returned in Step 1.
   * `Operation`: Use `"Add"`, `"Set"`, `"Remove"`, `"Clear"`, or `"Omit"`.
3. **Configure Target Value (Choose Option A or Option B):**
   * **Option A: Pipe the Target Object (To Set/Bind Reference):** Call `SetTestStepOutputForSelectObjectForAssociation` with:
     * `SelectObjectForAssociationKey`: The key from Step 1.
     * `TestStepOutputKey`: The output key of the **parent TestStep** that created/retrieved the target associated object (e.g., the parent `TestStepKey` returned by `CreateTestStepCreateObject` or `CreateTestStepRetrieveObject` for the `Address` object).
   * **Option B: Set the Association to Empty (To Clear Reference):** If you explicitly want to empty/clear the association link on the object, call **`SetEmptyValueOfSelectObjectForAssociation`** with:
     * `SelectObjectForAssociationKey`: The key from Step 1.

> [!IMPORTANT]
> **Parent TestStep Key vs. Nested EntityValue Key:**
> You **MUST** use the parent **TestStep Key** (e.g., `4916`) as the `TestStepOutputKey`, **NOT** the nested `ETVL_EntityValue.Key` (e.g., `2566`) from `GetObjectActionTestStepCreateObjectDetails`.
>
> *Example:*
> - Step `4916` (parent `TestStepKey`) creates a `Customer` object.
> - Step `4917` creates an `Order` object and defines the `Order_Customer` association on it.
> - To bind `Customer` to the association on `Order`:
>   * `SetTestStepOutputForSelectObjectForAssociation(SelectObjectForAssociationKey: 359, TestStepOutputKey: 4916)` ✅
>   * **DO NOT USE:** `TestStepOutputKey: 2566` (the internal `ETVL_EntityValue.Key`) ❌

> [!WARNING]
> * **Never skip Step 3:** Skipping Step 3 will silently ignore the association at runtime, causing database validation or business logic failures.
> * **Never use `EntityValueKey`:** Symmetrically to `AttributeValueKey`, you might feel tempted to use `EntityValueKey` for object/entity value parameters. This is a critical mistake as no such parameter exists in any MTA tool. Use `TestStepOutputKey` exclusively for bindings.

---

## ⚙️ MICROFLOW CALL TEST STEP PARAMETER SETTERS

When executing microflows via `CreateMicroflowCallTestStep` (State 6 & State 7), you must configure and bind input parameters. Call `GetMicroflowCallTestStepDetails(TestStepKey)` to retrieve the parameter keys, then call the appropriate typed setter tool:
*   **`SetStringMicroflowParameterValue`**: Binds a String microflow parameter.
*   **`SetBooleanMicroflowParameterValue`**: Binds a Boolean microflow parameter.
*   **`SetEnumerationMicroflowParameterValue`**: Binds an Enumeration microflow parameter (pass the technical value Name).
*   **`SetDateTimeMicroflowParameterValue`**: Binds a DateTime microflow parameter to a specific timestamp.
*   **`SetCurrentDateTimeMicroflowParameterValue`**: Binds a DateTime microflow parameter to the current runtime server timestamp.
*   **`SetDecimalMicroflowParameterValue`**: Binds a Decimal microflow parameter.
*   **`SetIntegerMicroflowParameterValue`**: Binds an Integer microflow parameter.
*   **`SetEmptyForSelectObjectForMicroflowParameter`**: Explicitly passes a null/empty object reference to an object parameter.
*   **`SetTestStepOutputForSelectObjectForMicroflowParameter`**: Pipes an upstream step's output (using its `TestStepKey`) into the microflow's object parameter.
*   **`SetInputTypeMicroflowParameterValueToTestStep`**: Sets the input type/source mapping for microflow parameter values.
*   **`GetSelectValueForValueByMicroflowParameterValue`**: Retrieves the select value for value mappings configured on a microflow parameter.
*   **`AddInputListForMicroflowParameter`**: Adds an additional input selection object for list-datatype microflow parameters.
*   **`RemoveInputListForMicroflowParameter`**: Removes an input selection object from list-datatype microflow parameters.
*   **`GetSelectObjectForMicroflowParameter`**: Retrieves all select object keys configured for a microflow parameter on a teststep.

> [!IMPORTANT]
> **State Isolation Rule:** These setters are strictly allowed to execute only inside **`[STATE_CONSTRUCTION]`** and **`[STATE_STEP_BINDING]`**. Calling them in discovery or high-level planning is prohibited.

---

## 🎯 MTA CORE MICROFLOW RETURN VALUE ASSERTIONS

For Backend testing, return values are verified by creating a typed assertion on the step key using this 2-step technical framework:

### Step 1: Create the Base Assertion
First, instantiate the assertion block on your microflow step:
Call `CreateAssertMicroflowReturnValue` with:
* `TestStepKey`: The key of the microflow call teststep.
* `AMRC_ComparisonOperator`: The comparison operator enum value (e.g., `"Equals"`, `"NotEquals"`, `"GreaterThan"`, `"LessThan"`, `"Contains"`).
* `ASRT_ActionFailedAssert`: The behavior on assertion failure (must be either `"ContinueTestRun"` or `"StopTestRun"`). **Default: `"ContinueTestRun"`**. Do NOT set to `"StopTestRun"` unless explicitly instructed by the user.
* *Returns:* `AssertMicroflowReturnValueCompareKey` (referred to as `AssertCompareKey` in code).

### Step 2: Configure Type-Specific Assertion Constraints
MTA uses specialized helper tools to process typed assertions. Depending on the Mendix return data type of your microflow, you **MUST** call the corresponding configuration tool on the `AssertCompareKey` returned in Step 1:

| Mendix Return Type | Typed Assertion Tool to Call | Key Parameters & Description |
| :--- | :--- | :--- |
| **Boolean** | `SetBooleanAssertMicroflowReturnValueCompare` | `ComparisonOperator` (`"Equals"`/`"NotEquals"`), `BooleanValue` (boolean). |
| **DateTime** | `SetDateTimeAssertMicroflowReturnValueCompare`<br>`SetDateTimeAssertMicroflowReturnValueCompareRange` | `ValueDateTimeOption` (`"CurrentDateTime"`/`"SpecifiedDate"`), `ValueSpecifiedDateTime` (ISO string), offset parameters, and range limits. |
| **Decimal** | `SetDecimalAssertMicroflowReturnValueCompareCompare` | `ComparisonOperator`, `DecimalValue` (exact). For range operators, use `MinimumDecimalValue` and `MaximumDecimalValue`. |
| **Enumeration** | `SetEnumerationAssertMicroflowReturnValueCompare` | `ComparisonOperator` (`"Equals"`/`"NotEquals"`), `EnumerationValue` *(Use technical Value Name, NOT Caption)*. |
| **Integer / Long** | `SetIntegerLongAssertMicroflowReturnValueCompare` | `ComparisonOperator`, `IntegerLongValue` (exact). For range operators, use `MinimumIntegerLongValue` and `MaximumIntegerLongValue`. |
| **String** | `SetStringAssertMicroflowReturnValueCompare` | `ComparisonOperator`, `SetStringValue` (boolean), `StringValue` (string), `SetTrimStringValue` (boolean), `TrimStringValue` (boolean). |

### Overriding Assertions in Data Variations
If your test case has data variations enabled, you can override expected assertion outcomes for different scenarios:
1. **Register Assertion as Variation Item:** Call `AddTestCaseVariationItemAssertMicroflowReturnValue` with `AssertMicroflowReturnValueCompareKey`.
2. **Configure Scenario Values per Variation:** For each duplicated variation, call the appropriate type-specific setter tool (e.g. `SetDecimalAssertMicroflowReturnValueCompareCompare`) with that variation's specific assertion key (retrieved via `GetTestCaseDataVariationsDetails`).

---

## 🎯 OBJECT ATTRIBUTE VALUE COMPARISON ASSERTIONS (AALC)

For asserting and verifying individual attributes of a Mendix Object (created, modified, or retrieved in an upstream teststep), you **MUST** use the Assert Attribute Value Compare (AALC) framework.

### State Validation Rule
These tools are strictly allowed to execute only inside **`[STATE_CONSTRUCTION]`**, **`[STATE_STEP_BINDING]`**, and **`[STATE_ASSERT_CONSTRUCTION]`**. Calling them in discovery or high-level planning is prohibited.

### The 3-Step Programmatic Assertion Sequence
To programmatically assert an object's attribute value, execute the following three steps:

#### Step 1: Create the Assertion
First, instantiate the assertion on the target test step:
Call `CreateAssertAttributeValueCompare` with:
*   `TestStepKey`: The key of the step that retrieved, created, or changed the target object.
*   `AttributeName`: The fully qualified or relative attribute name (e.g. `"Status"`, `"TotalAmount"`).
*   *Returns:* `AssertAttributeValueCompareKey` (referred to as `AalcKey`).

#### Step 2: Configure Properties
Set standard assertion properties:
Call `SetAssertAttributeValueCompareProperties` with:
*   `AssertAttributeValueCompareKey`: Your `AalcKey`.
*   `ActionFailedAssert`: The failure behavior (must be `"ContinueTestRun"` or `"StopTestRun"`). **Default: `"ContinueTestRun"`**.

#### Step 3: Configure Type-Specific Expected Values
Call the appropriate type-specific configuration setter tool on your `AalcKey`:

| Attribute Datatype | Setter Tool to Call | Key Parameters & Description |
| :--- | :--- | :--- |
| **Boolean** | `SetBooleanAssertAttributeValueCompare` | `AssertAttributeValueCompareKey`, `ComparisonOperator` (`"Equals"` / `"NotEquals"`), `BooleanValue` (boolean) |
| **Enumeration** | `SetEnumerationAssertAttributeValueCompare` | `AssertAttributeValueCompareKey`, `ComparisonOperator` (`"Equals"` / `"NotEquals"`), `EnumerationValue` *(Technical Value Name, NOT Caption)* |
| **HashString** | `SetHashStringAssertAttributeValueCompare` | `AssertAttributeValueCompareKey`, `ComparisonOperator` (`"Equals"` / `"NotEquals"`), `HashStringValue` (string) |
| **String / StringLimited / StringUnlimited** | `SetStringAssertAttributeValueCompare` | `AssertAttributeValueCompareKey`, `ComparisonOperator` (`"Equals"`, `"NotEquals"`, `"Contains"`, `"NotContains"`), `SetStringValue` (`True`), `StringValue`, `SetTrimStringValue` (`True`/`False`), `TrimStringValue` |
| **Integer** | `SetIntegerAssertAttributeValueCompare`<br>`SetIntegerAssertAttributeValueCompareRange` | `IntegerValue` for exact matches. `MinimumIntegerValue` and `MaximumIntegerValue` for range comparisons (`"Range"` / `"NotRange"`). |
| **Long** | `SetLongAssertAttributeValueCompare`<br>`SetLongAssertAttributeValueCompareRange` | `LongValue` for exact matches. `MinimumLongValue` and `MaximumLongValue` for range comparisons. |
| **Decimal** | `SetDecimalAssertAttributeValueCompare`<br>`SetDecimalAssertAttributeValueCompareRange` | `DecimalValue` for exact matches. `MinimumDecimalValue` and `MaximumDecimalValue` for range comparisons. |
| **DateTime** | `SetDateTimeAssertAttributeValueCompare`<br>`SetDateTimeAssertAttributeValueCompareRange` | `ValueDateTimeOption` (`"CurrentDateTime"` or `"SpecifiedDate"`), `ValueSpecifiedDateTime` (ISO 8601 string), `EnableOffset` (boolean), along with various offset parameters (`OffsetDays`, `OffsetHours`, etc.) and range limits. |
| **CurrentDateTime** | `SetCurrentDateTimeAssertAttributeValueCompare` | Set current dateTime assertions with active offsets (`OffsetDays`, `OffsetHours`, `OffsetMinutes`, etc.) and comparison operators. |
| **AutoNumber** | `SetAutoNumberAssertAttributeValueCompare`<br>`SetAutoNumberAssertAttributeValueCompareRange` | `AutoNumberValue` for exact matches. `MinimumAutoNumberValue` and `MaximumAutoNumberValue` for range comparisons. |

### Overriding Attribute Assertions in Data Variations
If your test case has data variations enabled, you can promote individual attribute assertions to the variation matrix to test multiple data scenarios:
1. **Promote Assertion:** Call `AddTestCaseVariationItemAssertAttributeValueCompare` with your `AalcKey`.
2. **Set Scenario Values:** Call the type-specific setter tool (e.g. `SetStringAssertAttributeValueCompare`) passing the specific variation's assertion key retrieved via `GetTestCaseDataVariationsDetails`.

> [!TIP]
> To inspect existing included attribute assertions on a step, call `GetAssertAttributeValueComparesOfTeststep(TestStepKey)`.

---

## 🎯 MEMORY RETRIEVE PATTERNS FOR ASSERTING COMPLEX OBJECTS & MODIFICATIONS

Direct microflow return value assertions (`CreateAssertMicroflowReturnValue`) are strictly limited to scalar types (String, Boolean, Integer, Long, Decimal, DateTime, Enumeration). They **cannot** directly inspect or assert individual attributes of a complex **Object or List of Objects** returned or modified by a microflow.

To assert on attributes of complex objects, you **MUST** use the Memory Retrieve Assertion Pattern.

---

### 🧭 THE CANONICAL OBJECT ASSERTION PATTERN (CLEAN RETRIEVE)

For **all single objects** (whether returned directly by a microflow, modified in-place, or created natively in a browser session and retrieved from the database), you **MUST ALWAYS** use a **Clean Retrieve** step (with no filters) and perform assertions downstream.

#### **Rules of the Clean Retrieve Pattern:**
1. **No Filters on Retrieve (Memory or Database):** The retrieve step (`CreateTestStepRetrieveObject` with `RetrieveOption = "Teststep"` or `RetrieveOption = "Database"`) **MUST remain completely clean**—you must configure **ZERO** attribute filters or association filters on the retrieve step itself. ⚠️ **STRICT PROHIBITION:** Zero filters are allowed on retrieves used for assertions. See [troubleshooting.md#Pattern-G](troubleshooting.md#Pattern-G) for the decision matrix and the root cause explanation of silent assertion failure hiding.
2. **Provider Linking (For Memory):**
   - **Direct Return:** If the microflow returns the object directly, link the retrieve step to the **microflow execution step**'s output (`TestStepOutputKey = MicroflowStepKey`).
   - **In-Place Modification:** If the microflow modifies a parameter object in-place (returns void or a different type), link the retrieve step to the **original provider step** that created or retrieved the object before the microflow execution (`TestStepOutputKey = OriginalProviderStepKey`).
3. **Downstream Assertions:** Assertions on the retrieved object's count and individual attributes can be performed completely programmatically downstream. Use `CreateAssertObjectCount` to verify the object was successfully retrieved, and use `CreateAssertAttributeValueCompare` (AALC) along with its type-specific setters to programmatically verify individual attribute values (e.g. `Status = "Completed"`), removing any need for manual configuration via the MTA Web UI.

> [!CAUTION]
> **Why we DO NOT add filters to assertion retrieves (Memory or Database):**
> If you add attribute filters (e.g., `ReferenceNumber = "CLAIM-HAPPY-001"`) directly to the retrieve step of an object you wish to assert on, the retrieve step itself will execute as an XPath filter query. If the assertion fails (e.g., the claim wasn't saved, or has the wrong reference number), the retrieve step itself will fail with a cryptic "Object not found" error. This completely hides the actual database state and values, making debugging extremely difficult. Using a clean retrieve and programmatic downstream assertions on object count and attributes ensures explicit, highly readable assertion results.

---

### 🎯 THE LIST FILTERING PATTERN (FILTERED SUBSET RETRIEVE)

While single-object assertions require clean retrieves, configuring attribute filters and associations on a retrieve step is **extremely powerful** when dealing with **lists of objects**. You **MUST ONLY** configure attribute filters or associations on a retrieve step (Memory or Database) if:
1. **Source is a List:** The target source in memory (preceding step) or the database contains a list/collection of objects.
2. **Filtering for Assertions:** You want to isolate, count, or perform assertions on a specific, filtered subset of that list.

*At runtime:*
*   **XPath Filter Simulation:** The configured attributes and associations act as precise XPath criteria to extract only matching records.
*   **Verification Strategy:** This lets you query the database/memory, filter out unrelated records, and then assert on the filtered list (e.g., asserting that the filtered list has a specific size of `1`, or that certain attributes of the remaining objects match expectations). This is highly efficient and the correct way to utilize filters.

---

### 🔧 DIRECT OBJECT COUNT ASSERTION ON MICROFLOWS (PREFERRED METHOD FOR LIST COUNTS)

If a microflow `Sales.GetPendingOrders` returns a List of `Order` objects, and you want to assert that the list contains exactly `3` records:

1. **Execute the Microflow:**
   Call `CreateMicroflowCallTestStep` (executes `Sales.GetPendingOrders`) ➔ Returns `TestStepKey: 400`.

2. **Directly Assert Returned Object Count:**
   Verify the size of the returned list directly on the microflow call step without creating any intermediate retrieve steps:
   - Call `CreateAssertObjectCount(TestStepKey = 400)` ➔ Returns `AssertObjectCountKey: 700`.
   - Call `SetAssertObjectCountProperties` with:
     - `AssertObjectCountKey`: `700`
     - `ComparisonOperator`: `"Equals"`
     - `ExpectedObjectCount`: `3`
     - `ActionFailedAssert`: `"ContinueTestRun"` (🚨 **CRITICAL RULE:** The default behavior for failed assertions is to continue execution. Only stop execution if explicitly requested in the prompt or by the user).

---

### 🔧 THE 6-STEP TOOL CALL SEQUENCE FOR SINGLE OBJECT ASSERTIONS (WITH OBJECT COUNT VERIFICATION)

If a microflow `Sales.ProcessOrder` returns an `Order` object, and you want to assert that its `Status` is `"Completed"` and `TotalAmount` is `150.00`:

1. **Execute the Microflow (The Provider):**
   Call `CreateMicroflowCallTestStep` (executes `Sales.ProcessOrder`) ➔ Returns `TestStepKey: 400`.

2. **Create the Clean Memory Retrieve Step:**
   Call `CreateTestStepRetrieveObject` with:
   - `EntityQualifiedName`: `"Sales.Order"`
   - `TestStepName`: MUST be set exactly to `"retrieve object from teststep"`
   - *Returns:* `TestStepKey: 401`.

3. **Configure Settings to Retrieve from Memory:**
   Call `SetRetrieveSettingsOfTestStep` with:
   - `TestStepKey`: `401`
   - `RetrieveOption`: `"Teststep"` (specifies retrieving from a preceding teststep's output in memory)
   - `RetrieveSet`: `"All"` (🚨 **CRITICAL RULE:** Avoid setting `RetrieveSet = "Head"` on retrieve steps used for asserting. Always retrieve the full set and verify the count downstream!)

4. **Link the Retrieve to the Microflow Output:**
   - Call `GetSelectObjectForRetrieveOfTeststep` (`401`) ➔ Returns `SelectObjectForRetrieveKey: 800`.
   - Call `SetTestStepOutputForSelectObjectForRetrieve` with:
     - `SelectObjectForRetrieveKey`: `800`
     - `TestStepOutputKey`: 400 (links the retrieve step directly to the microflow execution step 400 in memory).

5. **Programmatically Assert Object Count (MANDATORY DOWNSTREAM INPUT BEST PRACTICE):**
   Verify that exactly `1` object (or expected count $N$ for lists) was successfully returned/retrieved before downstream step consumption:
   - *Best Practice Rule:* Whenever an object/list retrieved or returned by a microflow is consumed by a downstream step, an `Assert Object Count` step MUST be created immediately following the producer step to prevent downstream silent null pointer exceptions.
   - Call `CreateAssertObjectCount(TestStepKey = 401)` ➔ Returns `AssertObjectCountKey: 700`.
   - Call `SetAssertObjectCountProperties` with:
     - `AssertObjectCountKey`: `700`
     - `ComparisonOperator`: `"Equals"`
     - `ExpectedObjectCount`: `1` (or N for list inputs)
     - `ActionFailedAssert`: `"ContinueTestRun"` (🚨 **CRITICAL RULE:** The default behavior for failed assertions is to continue execution. Only stop execution if explicitly requested in the prompt or by the user).

6. **Programmatically Assert Attributes Downstream (AALC):**
   - Keep retrieve step `401` completely clean of filters (do **NOT** call `IncludeAttributeValueInTeststep`).
   - Programmatically assert that the retrieved `Order` has `Status = "Completed"`:
     1. **Create the Attribute Assertion:** Call `CreateAssertAttributeValueCompare` with:
        - `TestStepKey`: `401` (refers to the clean retrieve step)
        - `AttributeName`: `"Status"`
        - *Returns:* `AssertAttributeValueCompareKey: 900` (referred to as `AalcKey`).
     2. **Configure Assertion Properties:** Call `SetAssertAttributeValueCompareProperties` with:
        - `AssertAttributeValueCompareKey`: `900`
        - `ActionFailedAssert`: `"ContinueTestRun"` (🚨 **CRITICAL RULE:** Always continue test execution on failed assertions).
     3. **Configure Expected Value:** Call `SetStringAssertAttributeValueCompare` with:
        - `AssertAttributeValueCompareKey`: `900`
        - `ComparisonOperator`: `"Equals"`
        - `SetStringValue`: `True`
        - `StringValue`: `"Completed"`
        - `SetTrimStringValue`: `True`
        - `TrimStringValue`: `False`
   - Repeat the 3-step sequence for other attributes (e.g. `TotalAmount`) using the appropriate typed setter tool on step `401`.




---

## 🔧 EMPTY OBJECT MICROFLOW PARAMETER CHECKLIST

> [!NOTE]
> This checklist implements the empty object logic. For the high-level decision guides, quick-decision matrices, and alternative coordination patterns (Same-Attribute vs. Different-Attribute) across data matrices, see [data-variations.md](data-variations.md#empty-object-pattern-quick-decision-guide).

When a microflow has object parameters that should sometimes be null across variations (such as when dummy/spare fields cannot be used):

- [ ] **Step N: Create object** with attribute `X` = baseline value (e.g. `Subject = "Meeting Invitation"`).
- [ ] **Step N+1: Retrieve from Teststep** (NOT Database!).
- [ ] **Configure:** Call `SetRetrieveSettingsOfTestStep` with `RetrieveOption = "Teststep"` and `RetrieveSet = "Head"`.
- [ ] **Link:** Call `SetTestStepOutputForSelectObjectForRetrieve(SelectKey, TestStepOutputKey = Step N Key)`.
- [ ] **Include Filter:** Include filter attribute `X` on the retrieve step using `IncludeAttributeValueInTeststep`.
- [ ] **Register BOTH:** Call `AddAttributeValueAsVariationItem` for BOTH the Create step's attribute `X` value key AND the Retrieve step's filter attribute `X` value key.
- [ ] **Step N+2: Call microflow**, and bind its parameter to the **Step N+1 retrieve output** (NOT Step N Create output!).
- [ ] **Variations:** For valid runs, set BOTH keys to matching values (e.g., `"Meeting Invitation"`). For null/empty scenarios, set Retrieve filter value key to `"NON_EXISTENT"` (leaving Create as `"Meeting Invitation"`).

---

### 📚 REAL-WORLD IMPLEMENTATION EXAMPLES

#### **Example 1: Email Validation Testing (In-Place Parameter Modification)**

**Scenario:** Microflow `VAL_EmailMessage_Subject` validates an `EmailMessage` and updates a `Validation` object's attributes (`IsValid`, `Message`). No direct return value (returns void).

**Complete Step-by-Step Tool Calling Sequence:**

1.  **Create the EmailMessage Object:**
    *   *Tool Call:* `CreateTestStepCreateObject(EntityQualifiedName="MyModule.EmailMessage", TestStepName="Create EmailMessage", TestCaseKey=100)`
    *   *Returns:* `TestStepKey: 101`
2.  **Create the Validation Object:**
    *   *Tool Call:* `CreateTestStepCreateObject(EntityQualifiedName="MyModule.Validation", TestStepName="Create Validation", TestStepBeforeKey=101, TestCaseKey=100)`
    *   *Returns:* `TestStepKey: 102`
3.  **Execute the Microflow (Performs In-Place Modification):**
    *   *Tool Call:* `CreateMicroflowCallTestStep(MicroflowQualifiedName="MyModule.VAL_EmailMessage_Subject", TestStepName="Call VAL_EmailMessage_Subject", TestStepBeforeKey=102, TestCaseKey=100)`
    *   *Returns:* `TestStepKey: 103`
    *   *(Downstream steps bind parameters of 103: EmailMessage to Step 101, Validation to Step 102).*
4.  **Create the Retrieve Step:**
    *   *Tool Call:* `CreateTestStepRetrieveObject(EntityQualifiedName="MyModule.Validation", TestStepName="retrieve object from teststep", TestStepBeforeKey=103, TestCaseKey=100)`
    *   *Returns:* `TestStepKey: 104`
5.  **Set Retrieve Settings to Teststep Mode (MANDATORY FIRST SETTING STEP):**
    *   *Tool Call:* `SetRetrieveSettingsOfTestStep(TestStepKey=104, RetrieveOption="Teststep", RetrieveSet="All")`
    *   *Note:* This step registers the select object for retrieve on the server. Do NOT call `GetSelectObjectForRetrieveOfTeststep` before this setting call! (Avoid `"Head"` since we are retrieving this object to run downstream assertions).
6.  **Retrieve the Select Object Key:**
    *   *Tool Call:* `GetSelectObjectForRetrieveOfTeststep(TestStepKey=104)`
    *   *Returns:* `SelectObjectForRetrieveKey: 801`
7.  **Link the Retrieve Step to the Original Producer Step (NOT the Microflow Step):**
    *   *Tool Call:* `SetTestStepOutputForSelectObjectForRetrieve(SelectObjectForRetrieveKey=801, TestStepOutputKey=102)`
    *   *⚠️ WARNING:* Since the microflow returned void, Step 103 does not output an object. We link back to **Step 102** (the original Create step of the Validation object) because that's the object modified in-place by reference in Step 103.
8.  **Add Assertions:** Add downstream assertion steps to check the attributes of Step 104.

**Why this is correct:**
- The microflow modifies the `Validation` object in-place.
- Clean retrieve (Step 4) is linked to the **original provider step** (Step 2/102) because that step created the object being modified by reference.
- No filters are used on Step 4. Assertions are done downstream.

---

#### **Example 2: Order Processing (Direct Object Return)**

**Scenario:** Microflow `ProcessOrder` processes payment and returns an `Order` object directly. Assert that `Status = "Completed"`.

**Complete Step-by-Step Tool Calling Sequence:**

1.  **Execute the Microflow (Returns the Object Directly):**
    *   *Tool Call:* `CreateMicroflowCallTestStep(MicroflowQualifiedName="MyModule.ProcessOrder", TestStepName="Call ProcessOrder", TestCaseKey=200)`
    *   *Returns:* `TestStepKey: 201`
2.  **Create the Retrieve Step:**
    *   *Tool Call:* `CreateTestStepRetrieveObject(EntityQualifiedName="MyModule.Order", TestStepName="retrieve object from teststep", TestStepBeforeKey=201, TestCaseKey=200)`
    *   *Returns:* `TestStepKey: 202`
3.  **Set Retrieve Settings to Teststep Mode (MANDATORY FIRST SETTING STEP):**
    *   *Tool Call:* `SetRetrieveSettingsOfTestStep(TestStepKey=202, RetrieveOption="Teststep", RetrieveSet="All")`
4.  **Retrieve the Select Object Key:**
    *   *Tool Call:* `GetSelectObjectForRetrieveOfTeststep(TestStepKey=202)`
    *   *Returns:* `SelectObjectForRetrieveKey: 802`
5.  **Link the Retrieve Step to the Microflow Step Output:**
    *   *Tool Call:* `SetTestStepOutputForSelectObjectForRetrieve(SelectObjectForRetrieveKey=802, TestStepOutputKey=201)`
    *   *Note:* Since the microflow returns the object directly, we link directly to the microflow execution step (**Step 201**).
6.  **Add Assertions:** Add downstream assertion steps to check the attributes of Step 202.

**Why this is correct:**
- The microflow returns the object directly, so the retrieve step is linked to the **microflow execution step** (Step 1/201).
- No filters are used on Step 2. Assertions are done downstream.

---

#### **Example 3: Order Item List Check (Filtered Subset Retrieve)**

**Scenario:** Microflow `GetOrderItems` returns a list of OrderItems. Assert that there is at least one item with `Sku = "SKU123"`.

**Implementation:**
1. Step 1: `CreateMicroflowCallTestStep` ➔ `GetOrderItems()` (returns List of OrderItem) ➔ Returns `TestStepKey: 500`
2. Step 2: `CreateTestStepRetrieveObject` ➔ Retrieve OrderItem **from Step 500** with filter:
   - Include `Sku` attribute ➔ Set value `"SKU123"`
   - `RetrieveSet = "All"`
3. Step 3+: Assert that the retrieved filtered subset is not empty.

**Why this is correct:**
- The provider step outputs a **List** of objects.
- We configure an attribute filter (`Sku = "SKU123"`) to define an assertion on only that filtered subset of the list.

---

## 🔀 DYNAMIC SCALAR VALUE PIPING (THE SELECT VALUE FOR VALUE PATTERN)

MTA step bindings typically link entire objects downstream. However, when you need to pass **individual scalar values** (like a String, Integer, Decimal, or DateTime) returned or held by an upstream step into a downstream step's attribute or parameter, you **MUST** use the **Select Value for Value Pattern**.

### 🔧 The 3-Step Tool Call Sequence

To pipe a scalar value from Step A (the provider) to Step B (the consumer):

1. **Configure Consumer Input Type:**
   Set the input type of Step B's target attribute or microflow parameter to `"teststep"` (via `SetInputTypeAttributeValueToTestStep` or `SetInputTypeMicroflowParameterValueToTestStep`).
2. **Retrieve the Configuration Key:**
   Call `GetSelectValueForValueByAttributeValue` or `GetSelectValueForValueByMicroflowParameterValue` to obtain the unique `SelectValueForValueKey` for that input.
3. **Bind the Dynamic Value:**
   Call `SetOutputForSelectValueForValue` using that key to connect the output of Step A (`TestStepOutputKey`).
   * **If Step A returns a direct literal/scalar:** Passing `TestStepOutputKey` is sufficient (`AttributeName` can be left blank or empty).
   * **If Step A returns an Object:** You **MUST** supply the `AttributeName` parameter to specify which property of the object to extract (e.g., `"Email"`).

---

### 💡 High-Value Use Cases

#### Use Case A: Piping Microflow Return Values for Dynamic Test Suite Variables
You can execute custom business logic microflows to calculate a value at runtime and pipe it into downstream parameters or variable assignments:
1. **Calculate the value (Step 100):** Call `CreateMicroflowCallTestStep` executing `MyFirstModule.SUB_CalculateDaysBetween` ➔ Returns `TestStepKey: 100` (representing an Integer output).
2. **Set Input Type on Downstream Parameter (Step 101):** Call `SetInputTypeMicroflowParameterValueToTestStep` on Step 101's input parameter `ExpectedDays`.
3. **Get Select Key:** Call `GetSelectValueForValueByMicroflowParameterValue` ➔ Returns `SelectValueForValueKey: 900`.
4. **Bind calculated integer:** Call `SetOutputForSelectValueForValue` with:
   * `SelectValueForValueKey`: `900`
   * `TestStepOutputKey`: `100`
   * `AttributeName`: `""` (since `SUB_CalculateDaysBetween` returns a direct scalar Integer, no attribute name is needed!)

#### Use Case B: Piping Retrieved Database Attributes into Frontend Steps
In Frontend UI tests, you can retrieve a record from the database, extract one of its attributes, and pipe it directly as input to a Playwright action step (e.g., typing a retrieved Order ID into a search textbox):
1. **Retrieve the Record (Step 200):** Call `CreateTestStepRetrieveObject` for `Sales.Order` ➔ Returns `TestStepKey: 200`.
2. **Set Input Type on UI Action Step (Step 201):** Suppose Step 201 calls `ACT_Fill_TextBox_Input` with parameter `Value`. Call `SetInputTypeMicroflowParameterValueToTestStep` on the `Value` parameter.
3. **Get Select Key:** Call `GetSelectValueForValueByMicroflowParameterValue` on the parameter ➔ Returns `SelectValueForValueKey: 901`.
4. **Bind order attribute:** Call `SetOutputForSelectValueForValue` with:
   * `SelectValueForValueKey`: `901`
   * `TestStepOutputKey`: `200`
   * `AttributeName`: `"OrderNumber"` (extracts the `OrderNumber` string from the retrieved `Sales.Order` object in memory and pipes it directly into the text field!).

#### Use Case C: Cross-Application Data Piping (Multi-App Test Suites)
In multi-app test configurations, the `SelectValueForValue` pattern can bridge dynamic data (such as security tokens, generated codes, or customer records) across cases belonging to **entirely different applications** within the same test execution context:
1. **Application A (Step 300):** An upstream teststep in Application A generates or retrieves an active `Account` object ➔ Returns `TestStepKey: 300`.
2. **Application B (Step 400):** A downstream step in Application B (e.g., executing an integration check) has a parameter `ExternalAccountCode` requiring the account's unique code.
3. **Cross-Boundary Binding:** Set the input type of Step `400`'s parameter to `"teststep"`, fetch its `SelectValueForValueKey`, and call `SetOutputForSelectValueForValue` with:
   * `TestStepOutputKey`: `300` (referencing App A's step key)
   * `AttributeName`: `"AccountCode"` (extracts the code from Application A's object and seamlessly pipes it as a string argument into Application B's step).

#### Use Case D: Centralized Static Configuration (Maintainability Piping)
To optimize test suite maintenance and prevent copy-paste duplication of static test parameters (such as a default test email address, target usernames, or static validation thresholds), define these values once in a single, early setup step, and distribute them to downstream actions and assertions:
1. **Define the Value (Step 10):** Create a setup object or retrieve a configuration record (e.g., `LocalStartOptions` or a custom configuration object) and set its `DefaultEmail` attribute to `"testuser@example.com"` ➔ Returns `TestStepKey: 10`.
2. **Set Input Type on Downstream Consumer (Step 50):** Suppose Step 50 is an action step `ACT_Fill_TextBox_Input` with parameter `Value`. Call `SetInputTypeMicroflowParameterValueToTestStep` on the `Value` parameter.
3. **Get Select Key:** Call `GetSelectValueForValueByMicroflowParameterValue` on the parameter ➔ Returns `SelectValueForValueKey: 950`.
4. **Pipe the Centralized Value:** Call `SetOutputForSelectValueForValue` with:
   * `SelectValueForValueKey`: `950`
   * `TestStepOutputKey`: `10` (the provider step)
   * `AttributeName`: `"DefaultEmail"` (pipes `"testuser@example.com"` into the form input).
5. **Set Input Type on Downstream Assertion (Step 80):** Suppose Step 80 is an assertion step that verifies the email label in the UI. Call `SetInputTypeMicroflowParameterValueToTestStep` on its expected value parameter, get its unique `SelectValueForValueKey`, and call `SetOutputForSelectValueForValue` pointing to Step 10's output.
* *Why this is powerful:* If the email ever changes (e.g. to `"updateduser@example.com"`), you only need to modify Step 10's set attribute step. Both Step 50 (the action) and Step 80 (the assertion) will automatically update, guaranteeing 100% synchronized data state.

---

## 🚫 EXCEPTION ASSERTIONS (MICROFLOW ERROR BOUNDARIES)

When testing error handling, transactional rollbacks, or input validations, you can programmatically verify whether a direct microflow execution finishes successfully or raises an expected error.

### 🔧 The 3-Step Exception Assertion Sequence

To assert exception conditions on a microflow call (Step A):

1. **Create the Assert Exception:**
   Call `CreateAssertException(TestStepKey = A)` ➔ Returns `AssertExceptionKey: 500`.

2. **Configure Exception Properties:**
   Call `SetAssertExceptionProperties` to define the error verification boundaries:
   * `AssertExceptionKey`: `500`
   * `ExpectedResult`: `"RaisedException"` (asserts that Step A throws an error) or `"NoException"` (asserts that Step A executes successfully without failing).
   * `ActionFailedAssert`: `"ContinueTestRun"` (**Default**; continues run on failure) or `"StopTestRun"` (aborts run on failure). Do NOT set to `"StopTestRun"` unless explicitly requested.
   * `ComparisonString`: Specify the exact technical error message substring you expect (e.g., `"Duplicate username not allowed"`). Only used when `ExpectedResult = "RaisedException"`.
   * `ActionWithComparisonString`: Set to `"Set"` (compares against `ComparisonString`), `"Reset"` (clears string), or `"Omit"` (ignores string comparison).

3. **In-sequence Execution:**
   The assertion is bound directly to Step A. If Step A fails with a matching exception, the step executes as "passed". If it fails with a different exception, or succeeds when an exception was expected, the step executes as "failed".

---

## 🛠️ PROGRAMMATIC ATTRIBUTE EXCLUSION

During step cleanup, test refactoring, or dynamic data matrix restructuring in `STATE_CONSTRUCTION`, you can programmatically remove attribute parameters or query filters.

### 🔧 Exclude Attribute Value Action
Call `ExcludeAttributeFromTestStep(AttributeValueKey)` with the target key to exclude.

This tool functions across two distinct use cases with model-wide symmetry:
1. **Object Mutation Steps (Create/Change Object):** Completely removes/deletes a set attribute value, returning that attribute's value parameter to empty/undefined on the step.
2. **Retrieve Steps (Retrieve Object):** Removes an attribute-based XPath filter query constraint from the retrieve step, letting you dynamically expand search scopes or revert a filtered retrieve back to a clean retrieve.

---

## 🛠️ VERIFYING SIDE-EFFECTS OF VOID MICROFLOWS

When a microflow under test returns no parameters (Void), a simple `AssertException` is highly limited. To build a robust test, you must assert its **side effects**:

1.  **Retrieve After Microflow Call:** Add a `Retrieve Object` step (or count) immediately after the `Microflow Call` step targeting the entity that the microflow (or its sub-flows) was designed to create, update, or associate.
2.  **Assert Attributes/Counts:** Use attribute assertions (`SetStringAttributeValue`, `SetIntegerAttributeValue`, etc.) or count assertions (`CreateAssertObjectCount`) on that retrieve step to verify that values were correctly calculated or populated.
3.  **Sub-Microflow Complexity:** If the void microflow calls sub-microflows, deep-dive into those sub-flows to locate the exact entities being written or modified, as the logic is much harder to trace automatically.
4.  **Refactoring for Testability:** Highly recommend that the developer refactor the microflow to return a value (such as a status boolean or the created object) to make it directly testable.
5.  **Exemption for Setups/Teardowns:** These checks and warnings are not required if the void microflow is executed purely as a setup or teardown data utility.
6.  **Exception Only as a Last Resort:** Only use an exception assertion if the microflow has zero side effects and operates purely as a state check or utility logic.

---

## 🎯 TESTCASE-LEVEL VALIDATION FEEDBACK ASSERTIONS

MTA supports asserting validation feedback messages at the **TestCase level** (rather than inside a single teststep) because validation feedback represents an aggregate, client-side/session state resulting from executing a transaction.

You can configure two types of validation assertions directly on a `TestCaseKey`:

### 1. Validation Feedback Compare (`CreateAssertValidationFeedbackMessageCompare`)
This tool checks the content of a validation message on a specific entity member (attribute or association).

*   **Step 1: Create Compare Assertion:** Call `CreateAssertValidationFeedbackMessageCompare` with:
    *   `TestCaseKey`: The key of the parent test case.
    *   `ModuleName` / `EntityName`: Fully qualified entity identifier (e.g., `"Sales"`, `"Order"`).
    *   `MemberType`: `"Attribute"`, `"Association"`, or `"All"`.
    *   `AttributeName`: Required if `MemberType` is `"Attribute"`.
    *   `AsociationName`: *(Note spelling: single 's'!)* Required if `MemberType` is `"Association"`.
    *   `ComparisonOperator`: `"Equals"`, `"NotEquals"`, `"Contains"`, or `"NotContains"`.
    *   `ComparisonString`: The expected validation message text.
    *   `Quantifier`: `"ForAll"` or `"AtLeastOne"`.
    *   *Returns:* `AssertValidationFeedbackMessageCompareKey` (referred to as `VfCompareKey` in code).
*   **Step 2: Configure Properties:** Call `SetAssertValidationFeedbackMessageCompareProperties` to update/manage thresholds, failure behaviors (`"ContinueTestRun"` or `"StopTestRun"`), or clear message criteria via `ActionWithComparisonString` (`"Set"`, `"Reset"`, or `"Omit"`).

### 2. Validation Feedback Count (`CreateAssertValidationFeedbackMessageCount`)
This tool verifies the total number of validation feedback messages generated during test case execution.

*   **Step 1: Create Count Assertion:** Call `CreateAssertValidationFeedbackMessageCount` with:
    *   `TestCaseKey`: The parent test case.
    *   `ComparisonOperator`: `"Equals"`, `"Greater_than"`, `"GreaterThanEqualTo"`, `"Less_than"`, or `"LessThanEqualTo"`. *(Note: Case-sensitive underscores in "Greater_than" and "Less_than"!)*
    *   `ComparisonNumber`: The expected count threshold.
    *   *Returns:* `AssertValidationFeedbackMessageCountKey` (referred to as `VfCountKey` in code).
*   **Step 2: Configure Properties:** Call `SetAssertValidationFeedbackMessageCountProperties` to update/manage the comparison number, operator, or failed action behaviors.

> [!TIP]
> To retrieve existing validation feedback message count assertions on a test case, call `GetAssertValidationFeedbackMessageCountByTestCase(TestCaseKey)`.

### 🔄 Overriding Validation Assertions in Data Variations
Validation feedback assertions can be integrated directly into TestCase or TestSuite variation matrices:
*   **For Compare Assertions:** Call `AddTestCaseVariationAssertValidationFeedbackCompare` or `AddTestSuiteVariationAssertValidationFeedbackCompare` to promote the assertion to the matrix, then override expected validation messages per scenario using `SetAssertValidationFeedbackMessageCompareProperties`.
*   **For Count Assertions:** Call `AddTestCaseVariationAssertValidationFeedbackCount` or `AddTestSuiteVariationAssertValidationFeedbackCount` to promote, then configure varying thresholds per scenario using `SetAssertValidationFeedbackMessageCountProperties`.

