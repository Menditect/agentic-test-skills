# Local Exploratory Test Execution & Telemetry Analysis Guide

This guide details how the assistant and developer execute local exploratory tests against the Mendix JVM using the `MTA_plugin.execute-testcase` tool, interpret runtime telemetry (`TCEX_RS`), and manage test promotion.

---

## 1. Execution Invocation & Pre-Flight Probing

To run an exploratory test directly on the active Mendix runtime without MTA platform database placement:

1. **Pre-Flight Probing:**
   * Confirm the local Mendix application is running.
   * Verify the endpoint `[RuntimeUrl]/plugin-mcp/` (e.g. `http://localhost:8081/plugin-mcp/`) is active and `MtaPluginModule.EnableMcpServer = true`.
   * *Fallback Rule:* If the endpoint is unreachable or `MTA_plugin` MCP server is offline, immediately notify the user and offer:
     * *Option 1:* Start the local Mendix app and enable `EnableMcpServer`.
     * *Option 2:* Fall back immediately to Option B (Direct Persistent MTA Test).
2. **Compile Request:** Convert the approved 8-field Chronological Step Sequence into the `TCEX_RQ` JSON structure.
3. **Execute Tool:**
   Call `call_mcp_tool` with:
   * `ServerName`: `"MTA_plugin"`
   * `ToolName`: `"execute-testcase"`
   * `Arguments`: `{ ...TCEX_RQ payload... }`

---

## 2. Core Exploratory Step Recipes

### Recipe A: Empty Parameter Boundary Test (`$Param == empty`)
When testing boundary branches where a microflow parameter is null or empty, set `UseEmptyObjectList: true` in `TCEX_RQ_MicroflowParameter` without providing a `TCEX_RQ_Smpr` input handle:
```json
{
  "TestStepType": "MicroflowCall",
  "TCEX_RQ_TestStepRunMfc": {
    "QualifiedName": "CarRentalModule.SUB_car_calculate_freekilometers",
    "TCEX_RQ_MicroflowParameter": [
      {
        "ParameterName": "Car",
        "DataType": "ObjectType",
        "EntityQualifiedName": "CarRentalModule.Car",
        "UseEmptyObjectList": true
      }
    ],
    "TCEX_RQ_MicroflowReturnType": { "DataType": "DecimalType" }
  }
}
```

### Recipe B: Pre-Seeded Database Retrieval Strategy
For testing microflows that require complex pre-existing domain graphs or associations (e.g. `Car` with `Car_CarSize`), retrieve an existing database entity using `Oact: Retrieve` and pipe its handle to the microflow via `TCEX_RQ_Smpr`:
```json
[
  {
    "Key": 1,
    "SequenceNumber": 1,
    "TestStepRunType": "Oact",
    "TCEX_RQ_TestStepRunOact": {
      "Action": "Retrieve",
      "EntityQualifiedName": "CarRentalModule.Car",
      "RetrieveOption": "From_database",
      "RetrieveSet": "Head"
    }
  },
  {
    "Key": 2,
    "SequenceNumber": 2,
    "TestStepRunType": "MicroflowCall",
    "TCEX_RQ_TestStepRunMfc": {
      "QualifiedName": "CarRentalModule.SUB_car_calculate_freekilometers",
      "TCEX_RQ_MicroflowParameter": [
        {
          "ParameterName": "Car",
          "DataType": "ObjectType",
          "EntityQualifiedName": "CarRentalModule.Car",
          "UseEmptyObjectList": false
        }
      ],
      "TCEX_RQ_MicroflowReturnType": { "DataType": "DecimalType" },
      "TCEX_RQ_Smpr": [
        {
          "ParameterName": "Car",
          "DataType": "ObjectType",
          "EntityQualifiedName": "CarRentalModule.Car",
          "TCEX_RQ_SmprValueRun": [{ "TestStepRunKey_output": 1 }]
        }
      ]
    }
  }
]
```

### Recipe C: In-Memory Object Creation
For creating standalone entity records in-memory:
```json
{
  "Key": 1,
  "SequenceNumber": 1,
  "TestStepRunType": "Oact",
  "TCEX_RQ_TestStepRunOact": {
    "Action": "Create",
    "EntityQualifiedName": "CarRentalModule.Car",
    "TCEX_RQ_EntityValueRun": {
      "TCEX_RQ_AttributeValueRun": [
        { "AttributeName": "BrandAndType", "DataType": "StringType_limited", "Value": "Test Model" },
        { "AttributeName": "LicensePlate", "DataType": "StringType_limited", "Value": "TEST-01" },
        { "AttributeName": "Fuel", "DataType": "EnumType", "Value": "Diesel" }
      ]
    }
  }
}
```

### Recipe D: In-Memory Creation with Associated Entities (`TCEX_RQ_Sfar`)
When creating multiple entities in-memory and binding them via association in exploratory mode without database pre-seeding:
1. Step 1 (`Oact: Create`): Create the child target object (e.g. `CarRentalModule.CarSize`).
2. Step 2 (`Oact: Create`): Create the parent object (e.g. `CarRentalModule.Car`) and attach `TCEX_RQ_Sfar` referencing Step 1's `Key` via `TestStepRunKey_output`.
3. Step 3 (`MicroflowCall`): Pass Step 2's `Key` directly to the microflow via `TCEX_RQ_Smpr`.

```json
[
  {
    "Key": 25401,
    "SequenceNumber": 1,
    "TestStepRunType": "Oact",
    "ExecutionCondition": "None",
    "ResumeExecutionAfterException": "Stop",
    "TCEX_RQ_TestStepRunOact": {
      "Action": "Create",
      "EntityQualifiedName": "CarRentalModule.CarSize",
      "TCEX_RQ_EntityValueRun": {
        "TCEX_RQ_AttributeValueRun": [
          { "AttributeName": "FreeKilometersBase", "DataType": "IntegerType", "Value": "0" }
        ]
      }
    }
  },
  {
    "Key": 25402,
    "SequenceNumber": 2,
    "TestStepRunType": "Oact",
    "ExecutionCondition": "None",
    "ResumeExecutionAfterException": "Stop",
    "TCEX_RQ_TestStepRunOact": {
      "Action": "Create",
      "EntityQualifiedName": "CarRentalModule.Car",
      "TCEX_RQ_EntityValueRun": {
        "TCEX_RQ_AttributeValueRun": [
          { "AttributeName": "Fuel", "DataType": "EnumType", "Value": "Petrol" }
        ]
      },
      "TCEX_RQ_Sfar": [
        {
          "TestStepRunKey_output": 25401,
          "AssociationName": "CarRentalModule.Car_CarSize",
          "AssociationOwner": "_Default",
          "AssociationType": "Reference",
          "EntityParentQualifiedName": "CarRentalModule.Car",
          "EntityChildQualifiedName": "CarRentalModule.CarSize",
          "Operation": "set"
        }
      ]
    }
  },
  {
    "Key": 25403,
    "SequenceNumber": 3,
    "TestStepRunType": "MicroflowCall",
    "ExecutionCondition": "None",
    "ResumeExecutionAfterException": "Stop",
    "TCEX_RQ_TestStepRunMfc": {
      "QualifiedName": "CarRentalModule.SUB_car_calculate_freekilometers",
      "TCEX_RQ_Smpr": [
        {
          "ParameterName": "Car",
          "DataType": "ObjectType",
          "EntityQualifiedName": "CarRentalModule.Car",
          "TCEX_RQ_SmprValueRun": [{ "TestStepRunKey_output": 25402 }]
        }
      ],
      "TCEX_RQ_MicroflowReturnType": { "DataType": "DecimalType" }
    }
  }
]
```

### Recipe E: Frontend UI Exploratory Test
For exploratory execution of Frontend tests, all operations are standard Java microflows executed sequentially:
```json
[
  {
    "Key": 1,
    "SequenceNumber": 1,
    "TestStepRunType": "Oact",
    "TCEX_RQ_TestStepRunOact": {
      "Action": "Create",
      "EntityQualifiedName": "CarRentalModule.Customer",
      "TCEX_RQ_EntityValueRun": {
        "TCEX_RQ_AttributeValueRun": [
          { "AttributeName": "FullName", "DataType": "StringType_limited", "Value": "Test User" }
        ]
      }
    }
  },
  {
    "Key": 2,
    "SequenceNumber": 2,
    "TestStepRunType": "MicroflowCall",
    "TCEX_RQ_TestStepRunMfc": {
      "QualifiedName": "MenditectFrontendTestkit.Start_MxFrontend_Test_With_Login",
      "TCEX_RQ_MicroflowParameter": [
        { "ParameterName": "Username", "DataType": "StringType", "StringValue": "demo_administrator" },
        { "ParameterName": "Password", "DataType": "StringType", "StringValue": "1" },
        { "ParameterName": "Browser", "DataType": "EnumType", "EnumValue": "Chromium" }
      ],
      "TCEX_RQ_MicroflowReturnType": { "DataType": "BooleanType" }
    }
  },
  {
    "Key": 3,
    "SequenceNumber": 3,
    "TestStepRunType": "MicroflowCall",
    "TCEX_RQ_TestStepRunMfc": {
      "QualifiedName": "MenditectFrontendTestkit.ACT_Set_TextBox_Value",
      "TCEX_RQ_MicroflowParameter": [
        { "ParameterName": "WidgetName", "DataType": "StringType", "StringValue": "textBox_FullName" },
        { "ParameterName": "Value", "DataType": "StringType", "StringValue": "Test User" }
      ],
      "TCEX_RQ_MicroflowReturnType": { "DataType": "BooleanType" }
    }
  },
  {
    "Key": 4,
    "SequenceNumber": 4,
    "TestStepRunType": "MicroflowCall",
    "TCEX_RQ_TestStepRunMfc": {
      "QualifiedName": "MenditectFrontendTestkit.ASR_Widget_Has_Text",
      "TCEX_RQ_MicroflowParameter": [
        { "ParameterName": "WidgetName", "DataType": "StringType", "StringValue": "textBox_FullName" },
        { "ParameterName": "ExpectedText", "DataType": "StringType", "StringValue": "Test User" }
      ],
      "TCEX_RQ_MicroflowReturnType": { "DataType": "BooleanType" }
    }
  },
  {
    "Key": 5,
    "SequenceNumber": 5,
    "TestStepRunType": "MicroflowCall",
    "TCEX_RQ_TestStepRunMfc": {
      "QualifiedName": "MenditectFrontendTestkit.Close_Browser_Session",
      "TCEX_RQ_MicroflowReturnType": { "DataType": "BooleanType" }
    }
  }
]
```

---

## 3. Telemetry Interpretation (`TCEX_RS`)

When `execute-testcase` completes, the response contains deep runtime execution details:

```json
{
  "OverallResult": "Executed",
  "ResultDescription": "Execution passed with 0 failures.",
  "TCEX_RS_TestStepRun": [
    {
      "TestStepType": "Oact",
      "Result": "Passed",
      "DurationMs": 14,
      "TCEX_RS_TestStepRunOact": {
        "MxObjectGUID": "12345678901234",
        "Attributes": {
          "FullName": "Alice Smith"
        }
      }
    },
    {
      "TestStepType": "MicroflowCall",
      "Result": "Passed",
      "DurationMs": 28,
      "TCEX_RS_TestStepRunMfc": {
        "MicroflowName": "ACT_RentalOrder_CalculateTotal",
        "ReturnValue": "250.00",
        "TCEX_RS_ValidationFeedback": []
      }
    }
  ]
}
```

### Telemetry Assertions & Verification:
* **Microflow Return Value Assertion:** Inspect `TCEX_RS_TestStepRunMfc.ReturnValue` to assert that calculations, totals, or statuses match expected outcomes.
* **Side-Effect Verification:** Inspect `TCEX_RS_TestStepRunOact.Attributes` to verify modified attributes on input objects.
* **Validation Feedback Assertion:** Verify `TCEX_RS_ValidationFeedback` array length is `0` for valid runs, or contains the expected member feedback string for negative test cases (`PAT-10`).

---

## 4. Standard Exploratory Test Execution Report Format (`PAT-61`)

All exploratory test executions (`MTA_plugin.execute-testcase`) MUST present their results using the standardized markdown format below:

```markdown
### 📊 MTA EXPLORATORY TEST EXECUTION REPORT

#### 1. Test Goal & Scope
*   **Goal of the Test:** `[Clear, business/technical description of what this exploratory test verified]`
*   **Target Component:** `[Target Microflow / Entity / Page]`
*   **Category:** `[Backend | Frontend]`

#### 2. Execution Metadata
*   **Timestamp:** `[YYYY-MM-DD HH:mm:ss (Local Time)]`
*   **Run ID:** `[TCEX-YYYYMMDD-HHMMSS-XXXX]`
*   **Duration:** `[X ms]`
*   **Execution User:** `[Username / Roles]`
*   **Rollback Mode:** `Automatic (RollbackTcseAfterExecution = true)`

#### 3. Overall Result
*   **Status:** `[PASS | FAIL | ERROR]`
    *   `PASS`: All test steps, microflow executions, return values, and assertions succeeded.
    *   `FAIL`: One or more steps completed execution, but assertions failed (e.g. return value mismatch, object count mismatch, unexpected validation feedback).
    *   `ERROR`: An unhandled exception or runtime crash occurred during execution (e.g., NullPointerException, Java runtime exception).
*   **Summary Description:** `[High-level outcome statement]`

#### 4. Test Case Level Summary
| Aspect | Details |
| :--- | :--- |
| **Input** | `[Input entities, parameter values, or seeded state passed to the test]` |
| **Actual Output** | `[Actual returned value, object GUIDs, side-effects, or validation feedback returned]` |
| **Expected Result** | `[Expected return value, attributes, or expected validation state]` |

#### 5. Step Level Execution Breakdown
| # | Step Name / Type | Input (Handles / Values) | Actual Output | Expected Result / Assertions | Result | Duration |
| :-: | :--- | :--- | :--- | :--- | :-: | -: |
| 1 | `[Oact: Create]` | `[Attributes...]` | `GUID: [123...]` | `Object instantiated` | `PASS` | `12 ms` |
| 2 | `[MicroflowCall: SUB_...]` | `Car = [Handle #1]` | `ReturnValue = '120.00'` | `ReturnValue == '120.00'` | `PASS` | `28 ms` |

#### 6. Error & Diagnostic Logs (Included on FAIL or ERROR)
*   **Exception Class / Type:** `[e.g. com.mendix.systemwideinterfaces.MendixRuntimeException]`
*   **Error Message:** `[Exact error message or assertion failure detail]`
*   **Stack Trace / Feedback:**
    ```text
    [Stack trace or error log details if present]
    ```
*   **Diagnostic Rationale:** `[Root cause explanation and suggested fix]`
```

---

## 5. Promotion to Persistent MTA Platform Test (`PAT-57`, `ANTI-16`)

When an exploratory test passes and verifies the target logic, the assistant MUST prompt the user to promote it:

> "This exploratory test has passed and verified the behavior. Would you like to **promote** this test to a permanent test case on the MTA Server for automated regression and CI/CD?"

### Step-by-Step Promotion Workflow:
1. **Transition to Placement Discovery:**
   * Update State Header: `[State: STATE_BUILD_PLANNING | Temp State: PLAN_STEP_2 | Active Skill: mta-test-design]`
   * Output the **Reverse State Compaction Block (Promotion Bridge Restore)**:
     ```markdown
     ### 💾 MTA STATE COMPACTION BLOCK (PROMOTION BRIDGE RESTORE)
     <!-- Copy and paste this block into a new chat session if switching environments. -->
     ```json
     {
       "MtaState": "STATE_BUILD_PLANNING",
       "TempState": "PLAN_STEP_2",
       "TargetConfig": null,
       "TargetSuite": null,
       "TestCase": "[ApprovedTestCaseName]",
       "Category": "[Backend | Frontend]",
       "MtaBaseUrl": "[MtaBaseUrl]",
       "ExecutionPlanKey": null,
       "Context": "Promoting verified exploratory test for [Components Under Test] to persistent MTA suite. Proceed to Gate 2 placement."
     }
     ```
     ```
   * Trigger Handoff to `mta-test-design` to run Gate 2 discovery.
2. **Resolve Gate 2 Placement:** In `mta-test-design` (`PLAN_STEP_2`), interactively scan and present available Test Configurations, Test Suites, and propose Test Case Name to the user.
3. **Present Summary & Sign-Off (Gate 2):** In `mta-test-design` (`PLAN_STEP_3`), present the Placement & Target Summary for user approval.
4. **Persist Execution Plan:** Upon Gate 2 approval, call `SaveExecutionPlan(ExecutionPlanJson: "...")` on the MTA server to obtain `ExecutionPlanKey`. Check model revision currency (`PAT-36`).
5. **Transition to Construction:** Set State Header to `[State: STATE_CONSTRUCTION | Temp State: STEP_BUILDING | Active Skill: mta-build]`.
6. **Construct Server Assets:** Provision `CreateTestCase` and map each `TCEX_RQ` step to MTA Server tools (`CreateTestStepCreateObject`, `CreateMicroflowCallTestStep`, `Set*AttributeValue`, `SetTestStepOutputForSelectObjectFor*`).
7. **Save Keys:** Write all generated keys (`test_configuration.key`, `test_suite.key`, `test_cases[].key`, `execution_plan_key`) to `mta_state.json`.
8. **Transition to Smoke Audit:** Set State Header to `[State: STATE_SMOKE_AUDIT | Temp State: SMOKE_AUDITING | Active Skill: mta-build]` and execute `GetTestConstructionErrorsOfTestCase`.

