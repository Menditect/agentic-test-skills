# MTA Plugin MCP Server Specification & Bidirectional Schema Mapping

This reference document defines the complete technical schema of the `MTA_plugin` MCP tool (`execute-testcase`) and its bidirectional mapping to the MTA Execution Plan schema and central MTA Server construction tools.

---

## 1. Overview & Protocol

The `MTA_plugin` MCP server runs inside the Mendix runtime JVM via the MTA Plugin module:
* **Endpoint URL:** `[RuntimeUrl]/plugin-mcp/` (e.g., `http://localhost:8081/plugin-mcp/`)
* **Transport:** Streamable HTTP / Server-Sent Events (SSE) with JSON-RPC 2.0
* **Module Constants:**
  * `MtaPluginModule.EnableMcpServer` (`Boolean`): Activates or disables the endpoint.
  * `MtaPluginModule.McpServerAccessToken` (`String`): Optional Bearer token (`Authorization: Bearer [Token]`).
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
| `ApplySecurityExecutor` | `string` (`"true"` / `"false"`) | Yes | Whether entity access and microflow security rules apply to the test context. |
| `ExecutorUsername` | `string` / `null` | No | Target Mendix username to execute the test under. |
| `RollbackTcseAfterExecution` | `string` (`"true"` / `"false"`) | Yes | If `"true"`, all database modifications roll back automatically when the test finishes. |
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
  * `DataType`: `"StringType_limited"`, `"StringType_unlimited"`, `"IntegerType"`, `"LongType"`, `"DecimalType"`, `"BooleanType"`, `"DateTimeType"`, `"EnumType"`, `"AutoNumberType"`, `"HashStringType"`.
  * `Value`: String representation of the scalar value.

* **Association Binding via `TCEX_RQ_Sfar` (Select For Association Run):**
  * Placed directly on `TCEX_RQ_TestStepRunOact` (sibling to `TCEX_RQ_EntityValueRun`).
  * `TestStepRunKey_output`: Numeric integer `Key` of the earlier test step that produced the associated object (e.g. `25401`).
  * `AssociationName`: Fully qualified association name (e.g. `"CarRentalModule.Car_CarSize"`).
  * `AssociationOwner`: `"_Default"` (or `"_Both"`).
  * `AssociationType`: `"Reference"` (or `"ReferenceSet"`).
  * `EntityParentQualifiedName`: Parent entity qualified name (e.g. `"CarRentalModule.Car"`).
  * `EntityChildQualifiedName`: Child entity qualified name (e.g. `"CarRentalModule.CarSize"`).
  * `Operation`: `"set"` (or `"add"`, `"remove"`).

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

## 5. Frontend Test Compatibility & 3-Case Promotion Mapping

Frontend UI tests also compile into `TCEX_RQ_TestStepRun` because all Frontend Testkit operations (`Start_MxFrontend_Test_*`, `ACT_*`, `ELO_*`, `ASR_*`, `Close_Browser_Session`) are standard Mendix Java microflows:

* **In Exploratory Mode (`execute-testcase`):**
  Executed as a single unified array (Seeding -> Browser Launch -> Page Actions -> Assertions -> Browser Close -> DB Rollback).
* **When Promoted to MTA (`SaveExecutionPlan` + `CreateTestCase`):**
  The unified step sequence is mapped into the canonical 3-TestCase suite structure:
  1. `_01_Setup`: Seeding `Oact` steps and `Start_MxFrontend_Test_*` (`ExecutionCondition = "_Always"`).
  2. `_02_Action`: UI navigation, inputs, clicks, and page assertions (`ExecutionCondition = "None"`).
  3. `_03_Teardown`: `Close_Browser_Session` and database `Delete` steps (`ExecutionCondition = "_Always"`).
