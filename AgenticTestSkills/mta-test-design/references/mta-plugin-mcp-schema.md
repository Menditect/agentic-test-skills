# MTA Plugin MCP Server Specification & Bidirectional Schema Mapping

This reference document defines the complete technical schema of the `MTA_plugin` MCP tool (`execute-testcase`) and its bidirectional mapping to the MTA Execution Plan schema and central MTA Server construction tools.

---

## 1. Overview & Protocol

The `MTA_plugin` MCP server runs inside the Mendix runtime JVM via the MTA Plugin module:
* **Endpoint URL:** `[RuntimeUrl]/plugin-mcp/` (e.g., `http://localhost:8081/plugin-mcp/`)
* **Transport:** Streamable HTTP / Server-Sent Events (SSE) with JSON-RPC 2.0
* **Module Constants:**
  * `MtaPluginModule.EnableMcpServer` (`Boolean`): Activates or disables the endpoint.
  * `MtaPluginModule.McpServerAccessToken` (`String`): Bearer token (`Authorization: Bearer [Token]`). Optional on localhost, **mandatory on remote/cloud environments** (min 32+ characters / 256-bit entropy).
* **Tool Name:** `execute-testcase`

---

## 2. Technical Schema of `execute-testcase`

### 2.1. Request Structure (`TCEX_RQ`)

```json
{
  "ApplySecurityExecutor": "true",
  "ExecutorUsername": "demo_administrator",
  "RollbackTcseAfterExecution": "true",
  "TCEX_RQ_ExecutorUserRoles": ["Administrator"],
  "TCEX_RQ_TestStepRun": [
    {
      "Key": 1,
      "SequenceNumber": 1,
      "TestStepRunType": "Oact",
      "ExecutionCondition": "None",
      "ResumeExecutionAfterException": "Stop",
      "TCEX_RQ_TestStepRunOact": {
        "Action": "Create",
        "EntityQualifiedName": "CarRentalModule.Customer",
        "RetrieveOption": "From_database",
        "RetrieveSet": "Head",
        "TCEX_RQ_EntityValueRun": {
          "TCEX_RQ_AttributeValueRun": [
            {
              "AttributeName": "FullName",
              "DataType": "StringType_limited",
              "Value": "Alice Smith"
            }
          ]
        }
      }
    }
  ]
}
```

#### Top-Level Request Properties:

| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `ApplySecurityExecutor` | `string` (`"NONE"` / `"true"` / `"false"`) | Yes | Whether entity access and microflow security rules apply to the test context. `"NONE"` or `"false"` bypasses security; `"true"` enforces entity access. |
| `ExecutorUsername` | `string` / `null` | No | Target Mendix username to execute the test under (e.g. `"MxAdmin"` or specific test user). |
| `RollbackTcseAfterExecution` | `string` (`"true"` / `"false"`) | Yes | If `"true"` (or `"Yes"`), all database modifications roll back automatically when the test finishes (exploratory testing). If `"false"` (or `"No"`), data modifications are retained when followed by a `Persist` step (live data seeding). *(Note: Central MTA server tool `SetExecutionSettingsOfTestCase` uses `"Yes"` / `"No"`).* |
| `TCEX_RQ_ExecutorUserRoles` | `array[string]` | No | Array of Mendix user role names to assign to the test execution context. |
| `TCEX_RQ_TestStepRun` | `array[object]` | Yes | Chronological sequence of test steps to execute. |

---

### 2.2. Step Types in `TCEX_RQ_TestStepRun`

#### Step Type 1: Object Action (`Oact`)
Used for `Create`, `Retrieve`, `Change`, `Delete`, and `Persist`.

```json
{
  "Key": 25402,
  "SequenceNumber": 2,
  "TestStepRunType": "Oact",
  "ExecutionDelayInMs": 0,
  "ResumeExecutionAfterException": "Stop",
  "ExecutionCondition": "None",
  "TCEX_RQ_TestStepRunOact": {
    "EntityQualifiedName": "CarRentalModule.Car",
    "Action": "Create",
    "RetrieveOption": "From_database",
    "RetrieveSet": "Head",
    "TCEX_RQ_EntityValueRun": {
      "TCEX_RQ_AttributeValueRun": [
        {
          "AttributeName": "Fuel",
          "Value": "Petrol",
          "DataType": "EnumType"
        }
      ]
    },
    "TCEX_RQ_Sfar": [
      {
        "TestStepRunKey_output": 25401,
        "AssociationName": "CarRentalModule.Car_CarSize",
        "Operation": "set",
        "AssociationOwner": "_Default",
        "AssociationType": "Reference",
        "EntityParentQualifiedName": "CarRentalModule.Car",
        "EntityChildQualifiedName": "CarRentalModule.CarSize"
      }
    ]
  }
}
```

* **Attributes (`TCEX_RQ_EntityValueRun.TCEX_RQ_AttributeValueRun`):**
  * `AttributeName`: Attribute name in the domain model.
  * `DataType` and Canonical Serialization Formats:
    * `"DateTimeType"`: **Strict ISO-8601 UTC timestamp with millisecond precision**: `yyyy-MM-dd'T'HH:mm:ss.SSS'Z'` (e.g., `"2022-05-15T00:00:00.000Z"`, `"2026-08-27T14:30:00.000Z"`). *Do NOT use local formats, offset-less strings, or "CurrentDateTime" in raw TCEX_RQ payloads.*
    * `"DecimalType"`: Numeric string with period decimal separator (e.g., `"45.00"`, `"1250.75"`).
    * `"IntegerType"` / `"LongType"`: Digits string (e.g., `"5"`, `"1000"`).
    * `"BooleanType"`: Lowercase boolean string (`"true"` / `"false"`).
    * `"EnumType"`: Exact enum key/caption name without module prefix (e.g., `"Small"`, `"Petrol"`).
    * `"StringType_limited"` / `"StringType_unlimited"`: String literal.
    * `"AutoNumberType"`: Read-only generated long.
    * `"HashStringType"`: Plain text string to hash.
  * `Value`: String representation conforming strictly to the above data type format.

* **Association Binding via `TCEX_RQ_Sfar` (Select For Association Run):**
  * Placed directly on `TCEX_RQ_TestStepRunOact` (sibling to `TCEX_RQ_EntityValueRun`).
  * `TestStepRunKey_output`: Numeric integer `Key` of the earlier test step that produced the associated object (e.g. `25401`).
  * `AssociationName`: Fully qualified association name (e.g. `"CarRentalModule.Car_CarSize"`).
  * `AssociationOwner`: `"_Default"` (or `"_Both"`).
  * `AssociationType`: `"Reference"` (or `"ReferenceSet"`).
  * `EntityParentQualifiedName`: Parent entity qualified name (e.g. `"CarRentalModule.Car"`).
  * `EntityChildQualifiedName`: Child entity qualified name (e.g. `"CarRentalModule.CarSize"`).
  * `Operation`: `"set"` (or `"add"`, `"remove"`).

* **Action: `"Persist"` (Standalone Batch Commit Step) (`PAT-21`):**
  * Used to commit all uncommitted in-memory objects to the database in a single batch (especially when `RollbackTcseAfterExecution: "No"`).
  * Does **NOT** require `EntityQualifiedName`.
  * Do **NOT** attach `TCEX_RQ_Sfdr` or `TCEX_RQ_Sfcr` handles (attaching handles causes runtime lookup failures).
  * JSON Example:
    ```json
    {
      "Key": 12,
      "SequenceNumber": 12,
      "TestStepRunType": "Oact",
      "ExecutionCondition": "None",
      "ResumeExecutionAfterException": "Stop",
      "ExecutionDelayInMs": 0,
      "TCEX_RQ_TestStepRunOact": {
        "Action": "Persist"
      }
    }
    ```

* **Step Piping / Object Handles:**
  * `TCEX_RQ_Sfcr`: Select Object for Change (references earlier step `Key` via `TestStepRunKey_output`).
  * `TCEX_RQ_Sfdr`: Select Object for Delete (references earlier step `Key` via `TestStepRunKey_output`).
  * `TCEX_RQ_Sfrr`: Select Object for Retrieve (association or memory retrieve).
  * `TCEX_RQ_Sfar`: Select Object for Association binding.
  * `TCEX_RQ_Svvr`: Select Value for Value (dynamic scalar piping).

#### Step Type 2: Microflow Call (`MicroflowCall`)

```json
{
  "Key": 25403,
  "SequenceNumber": 3,
  "TestStepRunType": "MicroflowCall",
  "ExecutionCondition": "None",
  "ResumeExecutionAfterException": "Stop",
  "TCEX_RQ_TestStepRunMfc": {
    "QualifiedName": "CarRentalModule.ACT_RentalOrder_CalculateTotal",
    "TCEX_RQ_MicroflowParameter": [
      {
        "ParameterName": "RentalOrder",
        "DataType": "ObjectType",
        "EntityQualifiedName": "CarRentalModule.RentalOrder",
        "UseEmptyObjectList": false
      }
    ],
    "TCEX_RQ_Smpr": [
      {
        "ParameterName": "RentalOrder",
        "DataType": "ObjectType",
        "EntityQualifiedName": "CarRentalModule.RentalOrder",
        "TCEX_RQ_SmprValueRun": [
          {
            "TestStepRunKey_output": 25402
          }
        ]
      }
    ],
    "TCEX_RQ_MicroflowReturnType": {
      "DataType": "DecimalType"
    }
  }
}
```

* **Microflow Parameter Properties:**
  * `ParameterName`: Name of the microflow parameter.
  * `DataType`: `"ObjectType"`, `"StringType"`, `"IntegerType"`, `"DecimalType"`, `"BooleanType"`, `"DateTimeType"`, `"EnumType"`, `"ListType"`.
  * `EntityQualifiedName`: Entity type name when `DataType` is `"ObjectType"` or `"ListType"`.
  * `UseEmptyObjectList`: Set to `true` to pass a null/empty object reference into the parameter for boundary testing (omit `TCEX_RQ_Smpr`).
  * `TCEX_RQ_Smpr`: Array of parameter object handles referencing previous step outputs (`TestStepRunKey_output`).

---

### 2.3. Response Structure (`TCEX_RS`)

```json
{
  "OverallResult": "Executed",
  "ResultDescription": "Test execution completed successfully.",
  "ResultStacktrace": null,
  "TCEX_RS_TestStepRun": [
    {
      "TestStepType": "MicroflowCall",
      "Result": "Passed",
      "DurationMs": 42,
      "TCEX_RS_TestStepRunMfc": {
        "MicroflowName": "ACT_RentalOrder_CalculateTotal",
        "ReturnValue": "250.00",
        "TCEX_RS_ValidationFeedback": []
      }
    }
  ]
}
```

* `OverallResult`: `"Executed"`, `"Fail"`, `"ERROR"`, `"NotExecuted"`.
* `ResultDescription`: Pass/fail message or root-cause description.
* `ResultStacktrace`: Java exception trace on error.
* `TCEX_RS_TestStepRun`: Array of per-step execution reports with runtime telemetry.
* `TCEX_RS_ValidationFeedback`: Validation feedback messages generated during execution (entity, member, validation message).

---

## 3. Bidirectional Mapping: `TCEX_RQ_TestStepRun` <-> MTA Execution Plan

| TCEX_RQ Element | 8-Field Execution Plan Element | MTA Server Tool (Construction) |
| :--- | :--- | :--- |
| `Oact` (`Action: "Create"`) | `Create Object` | `CreateTestStepCreateObject` |
| `Oact` (`Action: "Retrieve"`) | `Retrieve Object` | `CreateTestStepRetrieveObject` |
| `Oact` (`Action: "Change"`) | `Change Object` | `CreateTestStepChangeObject` |
| `Oact` (`Action: "Delete"`) | `Delete Object` | `CreateTestStepDeleteObject` |
| `Oact` (`Action: "Persist"`) | `Persist` | `CreateTestStepPersist` |
| `MicroflowCall` | `Call Microflow` | `CreateMicroflowCallTestStep` |
| `TCEX_RQ_EntityValueRun` (Attribute) | Parameters & Attribute Values | `Set*AttributeValue` / `IncludeAttributeInTeststep` |
| `TCEX_RQ_EntityValueRun` (Assoc) | Parameters & Attribute Values | `CreateSelectObjectForAssociation` |
| `TCEX_RQ_Smpr` / `TCEX_RQ_Sfrr` | Output Handles / Input Sources | `SetTestStepOutputForSelectObjectFor*` |
| `TCEX_RQ_Svvr` | Scalar Value Piping | `SetOutputForSelectValueForValue` |
| `TCEX_RS_ValidationFeedback` | Validation Feedback Assertions | `CreateAssertValidationFeedbackMessageCompare` |

---

## 4. Authoring Steps for Instant Compatibility

When drafting the 8-field Chronological Step Sequence during `STATE_BUILD_PLANNING`:
1. Use standard fully-qualified entity and microflow names (e.g. `Billing.Invoice`, `Billing.ACT_Invoice_CalculateTax`).
2. Clearly declare output handles (e.g., `[#1.Customer]`, `[#2.Invoice]`) so they map directly to `TestStepRunKey_output` in `TCEX_RQ` and handle outputs on the MTA server.
3. Configure `ExecutionCondition = "_Always"` and `ResumeExecutionAfterException = "_Continue"` for setup and teardown steps.
4. Keep exploratory test payloads self-contained with setup data and microflow calls so they can run with zero server-side pre-conditions.

---

## 5. Scope & Frontend vs. Backend Construction

* **Backend Exploratory Testing (`execute-testcase`):**
  Executed as a self-contained in-memory array of `Oact` and `MicroflowCall` steps with automatic database rollback (`RollbackTcseAfterExecution: "true"`). Ideal for instant microflow verification, business logic testing, boundary checks, and data variations.
* **Frontend UI Automation (Option B - Persistent MTA Platform):**
  Frontend UI tests drive Playwright browser instances and require locator maps, browser lifecycle management, and execution users provided by the MTA Platform. Frontend tests are constructed directly on the MTA Platform as a 3-case suite:
  1. `_01_Setup`: Database seeding `Oact` steps and browser launch (`ExecutionCondition = "_Always"`).
  2. `_02_Action`: UI navigation, inputs, clicks, and widget assertions.
  3. `_03_Teardown`: Browser shutdown (`Stop_MxFrontendTest` with `ExecutionCondition = "_Always"`) and cleanup.

---

## 6. The 5 Universal MTA Plugin Execution Principles

Every interaction with `MTA_plugin.execute-testcase` must adhere to these five universal principles regardless of whether the goal is testing a microflow, provisioning test data, or clearing records:

1. **Targeted Cluster Discovery (`mxcli`):**
   * Inspect all required elements (Microflows, Input Entities, Associated Entities, and Return Types) in a single batched `mxcli` query. Never query components in sequential 1-by-1 loops.
2. **Canonical Data Type Serialization:**
   * Strictly format attribute and parameter values per Section 2.2 specifications (especially ISO-8601 UTC `yyyy-MM-dd'T'HH:mm:ss.SSS'Z'` for `DateTimeType`).
3. **Explicit Object Topology & Handle Binding:**
   * Use `TCEX_RQ_Sfar` on create/change steps to wire associations in-memory using `TestStepRunKey_output`. Order creation from root/independent parents to dependent children.
4. **Single-Pass Blueprint Construction:**
   * Assemble complete end-to-end lifecycles (Fixtures -> Actions -> Assertions -> Cleanup) into a single cohesive JSON payload executed in one round-trip.
5. **Execution Mode Governance (Rollback vs Persist Policy):**
   * **Exploratory & Verification Tests:** `RollbackTcseAfterExecution: "Yes"`, no trailing `Persist` step. Pure in-memory execution.
   * **Live Data Seeding & Teardown:** `RollbackTcseAfterExecution: "No"`, mandatory trailing `Persist` step (`Action: "Persist"`).

---

## 7. Troubleshooting & Error Remediation

| Symptom / Stacktrace | Root Cause | Remediation |
| :--- | :--- | :--- |
| `java.text.ParseException: Unparseable date: "..."` | `DateTimeType` attribute value is not formatted in ISO-8601 UTC format. | Reformat the date string to `yyyy-MM-dd'T'HH:mm:ss.SSS'Z'` (e.g. `"2022-05-15T00:00:00.000Z"`). |
| `java.lang.Exception: Executor Username or Executor UserRoles need to be given` | Missing executor identity in top-level payload. | Provide `"ExecutorUsername": "MxAdmin"` and `"ApplySecurityExecutor": "NONE"`. |
| `Association ... cannot be set / NullPointerException` | `TCEX_RQ_Sfar` references an invalid `TestStepRunKey_output` or uninstantiated parent. | Verify that `TestStepRunKey_output` matches the exact integer `Key` of the earlier creation step. |
| `Delete failed: Object is referenced by other object(s)` | Attempted to delete a parent entity with active child associations under protected delete behavior. | Query associations in reverse dependency order and delete child records (e.g., `Booking`, `CarImage`) before deleting parent records (`Car`, `CarSize`). |
| Database changes not visible after run | Missing batch persist step under `Rollback: "No"`. | Append a parameterless `{"Action": "Persist"}` step to the end of the `TCEX_RQ_TestStepRun` array (`PAT-21`). |

