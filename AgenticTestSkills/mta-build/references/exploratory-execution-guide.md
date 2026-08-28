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
   * **Mandatory Execution User Context Law:** All exploratory requests MUST include `"ExecutorUsername": "MxAdmin"` (or the active project execution user) and `"ApplySecurityExecutor": "NONE"` (or `"ALL"`). Omitting `ExecutorUsername` causes `java.lang.Exception: Executor Username or Executor UserRoles need to be given to create a user` from the Mendix runtime.
   * **Verified Entity Fixture Attribute Binding Law (`PAT-75` / `ANTI-29`):** All entity attribute names, data types, and associations used in `TCEX_RQ_AttributeValueRun` or entity creation steps MUST be verified against the domain model AST (`DESCRIBE ENTITY`) prior to compiling the payload. Prohibits assumed synthetic attributes (e.g., `Code`, `Id`, `Name`).
3. **Execute Tool:**
   Call `call_mcp_tool` with:
   * `ServerName`: `"MTA_plugin"`
   * `ToolName`: `"execute-testcase"`
   * `Arguments`: `{ "ExecutorUsername": "MxAdmin", "ApplySecurityExecutor": "NONE", "RollbackTcseAfterExecution": "Yes", "TCEX_RQ_TestStepRun": [ ... ] }`

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

> [!NOTE]
> **Exploratory vs. Persistent MTA Empty Object Bridge (`PAT-07`):**
> In local exploratory JSON (`TCEX_RQ`), passing empty/null objects is configured directly per parameter via `"UseEmptyObjectList": true`. 
> When promoting to or constructing on the persistent MTA Platform, parameter bindings are static; you **MUST** convert this to the **`PAT-07` Empty Object Retrieve Pattern** (`Retrieve Object` from upstream teststep with filter attribute set to `"NON_EXISTENT"` for empty object variations).



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

### Recipe E: Chained Single-Payload Matrix Execution Protocol (`PAT-66`, `PAT-73`, `PAT-74`, `ANTI-22`, `ANTI-27`, `ANTI-28`)
When Section 7 of an approved Execution Plan defines a Data Variation Matrix with $N$ rows (`VAR_01` through `VAR_0N`):

1. **Single-Payload Compilation Requirement (`PAT-73`, `ANTI-27`):**
   * The client agent **MUST NOT** invoke `MTA_plugin.execute-testcase` in multiple separate, sequential LLM turns (`ANTI-27`).
   * The agent **MUST** compile all $N$ data variations into **1 single `TCEX_RQ_TestStepRun` array** dispatched in **1 single `execute-testcase` tool call**, reducing round-trip latency from ~30s down to < 2s.

2. **Pre-Execution AST Conflict Audit Vectors (`PAT-74`, `ANTI-28`):**
   Before assembling the chained payload, the agent MUST inspect the target microflow AST (`DESCRIBE MICROFLOW`) for single-session conflict vectors:
   * **Vector 1 - Database XPath Queries & Aggregates:** Microflows executing XPath retrieves (`[Status = 'Active']`) or aggregate calculations (`COUNT`, `SUM`, `AVG`) from the database. *Mitigation:* Explicit intra-block deletion of seeded/committed records.
   * **Vector 2 - Unique Key & Duplicate Existence Checks:** Microflows validating uniqueness (e.g., `[LicensePlate = $Car/LicensePlate]`). *Mitigation:* Disjoint synthetic partitioning across blocks (`VAR-01-A`, `VAR-02-B`).
   * **Vector 3 - Singleton & App-Wide Configuration State:** Microflows modifying application-wide singleton objects. *Mitigation:* Ensure state is reset at the end of each block.
   * **Vector 4 - Non-Transactional External Side-Effects:** Microflows calling Java actions with unmanaged static JVM caches or external REST/SOAP endpoints. *Mitigation:* Trigger the Session Isolation Fallback Protocol (individual dispatches).

3. **Variation Block Assembly & Predecessor Scoping:**
   * Each variation row forms a self-contained **Variation Block** within the array with globally incrementing `SequenceNumber` and `Key` integers:
     * **Block 1 (`VAR_01`):** Step 1 (Seed `CarSize`), Step 2 (Seed `Car` associated to Step 1 via `TestStepRunKey_output: 1`), Step 3 (Call `SUB_car_calculate_freekilometers` referencing Step 2).
     * **Block 2 (`VAR_02`):** Step 4 (Seed `CarSize`), Step 5 (Seed `Car` associated to Step 4 via `TestStepRunKey_output: 4`), Step 6 (Call `SUB_car_calculate_freekilometers` referencing Step 5).
     * ...
     * **Block $N$ (`VAR_0N`):** Steps $3N-2$ through $3N$.

4. **Intra-Block Teardown & Disjoint Key Partitioning (State Isolation):**
   * **Disjoint Synthetic Keys:** Enforce unique identifiers per variation (e.g., `LicensePlate: "VAR-01-A"`, `LicensePlate: "VAR-02-B"`) so unique database constraints never collide across blocks.
   * **Intra-Block Deletion for Mutating Microflows:** If the microflow creates or commits database records, add an explicit `Oact: Delete` step (`TCEX_RQ_Sfdr: { "TestStepRunKey_output": <seed_key> }`) at the end of each variation block to ensure subsequent blocks query a clean database state.
   * **Pure / Calculation Microflows:** For pure calculation microflows (like pricing or kilometer calculations), seed objects exist ephemerally in the transaction without intermediate deletes.

5. **Session Isolation Fallback Protocol (`PAT-74`):**
   * If AST analysis detects non-transactional side-effects (e.g., unmanaged Java caches, external API mutations) or if runtime execution encounters cross-scenario contamination (where `VAR_01` passes but `VAR_02` fails due to persistent session state), the agent MUST halt chaining and execute each variation in an independent `execute-testcase` dispatch session.

6. **Global Transaction Rollback:**
   * Set `RollbackTcseAfterExecution: "Yes"` (or `"true"`), `ApplySecurityExecutor: "NONE"`, and `ExecutorUsername: "MxAdmin"`.

7. **Consolidated Telemetry Parsing & Matrix Reporting:**
   * Upon receiving the single `TCEX_RS` response, the agent maps each `MicroflowCall` step outcome and return value back to its respective `VAR_xx` scenario row.
   * Present the unified multi-scenario report (`PAT-61`) in a single final response.

> [!NOTE]
> **Frontend UI Automation Scope Notice:**
> Frontend UI tests drive browser sessions via Playwright and require the full locator maps, browser lifecycle management, and 3-case suites of the MTA Platform (Option B). They are not executed via `MTA_plugin.execute-testcase`. See `frontend-testing.md` for Frontend test construction.

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

## 4. Standard Exploratory Test Execution Report Format (`PAT-61`, `PAT-76`, `ANTI-30`)

All exploratory test executions (`MTA_plugin.execute-testcase`) MUST present their results using the standardized markdown format below. Per **`PAT-76`**, the agent MUST extract, compute, and render the complete **3-Part Performance & Benchmark Profile** (Wall-Clock Throughput, Operations Category Breakdown Table, and Per-Scenario Latency Table). Omitting concrete durations or using uncalculated placeholders is strictly prohibited (**`ANTI-30`**).

```markdown
### 📊 MTA EXPLORATORY TEST EXECUTION REPORT

<details>
<summary><b>Execution Metadata & Environment Details</b></summary>

*   **Timestamp:** `[YYYY-MM-DD HH:mm:ss (Local Time)]`
*   **Run ID:** `[TCEX-YYYYMMDD-HHMMSS-XXXX]`
*   **Total Wall-Clock Execution Time:** `[X ms]` (computed from tool execution start/completion timestamps)
*   **Execution User:** `[Username / Roles]`
*   **Rollback Mode:** `Automatic (RollbackTcseAfterExecution = true)`
*   **Execution Throughput:** `[X.X steps/sec | Y ms per step]`

</details>

#### 1. Test Goal & Scope
*   **Goal of the Test:** `[Clear, business/technical description of what this exploratory test verified]`
*   **Target Component:** `[Target Microflow / Entity]`
*   **Category:** `Backend`

#### 2. Overall Result
*   **Status:** `[PASS | FAIL | ERROR]`
    *   `PASS`: All test steps, microflow executions, return values, and assertions succeeded.
    *   `FAIL`: One or more steps completed execution, but assertions failed (e.g. return value mismatch, object count mismatch, unexpected validation feedback).
    *   `ERROR`: An unhandled exception or runtime crash occurred during execution (e.g., NullPointerException, Java runtime exception).
*   **Summary Description:** `[High-level outcome statement]`

#### 3. Test Case Level Summary
| Aspect | Details |
| :--- | :--- |
| **Input** | `[Input entities, parameter values, or seeded state passed to the test]` |
| **Actual Output** | `[Actual returned value, object GUIDs, side-effects, or validation feedback returned]` |
| **Expected Result** | `[Expected return value, attributes, or expected validation state]` |

#### 4. Performance & Benchmark Profile (MANDATORY - PAT-76)

##### 4.1. Wall-Clock & Throughput Telemetry
*   **Total Wall-Clock Time:** `[X ms]`
*   **Total Steps Executed:** `[N steps across M scenarios]`
*   **Execution Throughput:** `[X.X steps/sec]`
*   **Average Step Duration:** `[Y.Y ms/step]`
*   **Database Transaction Overhead:** `[In-Memory Rollback (0 ms DB commit overhead) | Live Committed (Z ms DB commit overhead)]`

##### 4.2. Operations Breakdown by Step Category
| Operation Category | Step Count | Total Time (ms) | Time Share (%) | Avg Duration / Step |
| :--- | :-: | :-: | :-: | :-: |
| **Object Instantiation / Seeding (`Oact: Create`)** | `N` | `X ms` | `A%` | `Y.Y ms` |
| **Microflow Logic Execution (`MicroflowCall`)** | `N` | `X ms` | `B%` | `Y.Y ms` |
| **Assertions & Validations (`Assert*`)** | `N` | `X ms` | `C%` | `Y.Y ms` |
| **Intra-Block Teardown (`Oact: Delete`)** | `N` | `X ms` | `D%` | `Y.Y ms` |
| **Transaction Rollback Overhead** | `1` | `X ms` | `E%` | `Y.Y ms` |

##### 4.3. Per-Scenario Latency Breakdown
| Scenario Code | Scenario Description | Steps | Elapsed Latency | Status |
| :--- | :--- | :-: | :-: | :-: |
| `VAR_01` | `[Baseline / Nominal Scenario]` | `N` | `X ms` | `PASS` |
| `VAR_02` | `[Boundary / Edge Case]` | `N` | `X ms` | `PASS` |

#### 5. Error & Diagnostic Logs (Included on FAIL or ERROR)
*   **Exception Class / Type:** `[e.g. com.mendix.systemwideinterfaces.MendixRuntimeException]`
*   **Error Message:** `[Exact error message or assertion failure detail]`
*   **Stack Trace / Feedback:**
    ```text
    [Stack trace or error log details if present]
    ```
*   **Diagnostic Rationale:** `[Root cause explanation and suggested fix]`

<details>
<summary><b>Step Level Execution Breakdown & Latency Telemetry</b></summary>

| # | Step Name / Type | Input (Handles / Values) | Actual Output | Expected Result / Assertions | Result | Duration |
| :-: | :--- | :--- | :--- | :--- | :-: | -: |
| 1 | `[Oact: Create]` | `[Attributes...]` | `GUID: [123...]` | `Object instantiated` | `PASS` | `12 ms` |
| 2 | `[MicroflowCall: SUB_...]` | `Car = [Handle #1]` | `ReturnValue = '120.00'` | `ReturnValue == '120.00'` | `PASS` | `28 ms` |

</details>
```

## 5. Live Test Data Management & Seeding Engine (`PAT-68`, `ANTI-25`)

Beyond in-memory unit testing, `MTA_plugin.execute-testcase` functions as an ultra-fast, deterministic **Test Data Management (TDM) & Seeding Engine** for manual testing (both ad-hoc exploratory testing and structured feature manual testing).

By setting `RollbackTcseAfterExecution = "false"`, test steps commit their creations, mutations, and side-effects directly to the running Mendix application database, instantly establishing complex domain states without tedious manual form entry or disposable seed microflows (`ANTI-25`).

### 5.1. Rollback Mode Comparison & The Dual-Requirement Live Data Law

| Mode | `RollbackTcseAfterExecution` | Trailing Persist Step | Primary Use Case | Database Impact |
| :--- | :---: | :---: | :--- | :--- |
| **In-Memory Verification** | `"Yes"` (or `"true"`) | Not needed | Automated unit tests, microflow logic assertions, boundary checks. | Zero. Database transaction is rolled back upon completion. |
| **Safety Dry-Run Preview** | `"Yes"` (or `"true"`) | Optional | Pre-flight validation of complex data seeding recipes or mutating microflows (`PAT-69`). | Zero. Validates entity access, validations, and rules without altering data. |
| **Live Data Provisioning** | `"No"` (or `"false"`) | **Mandatory** (`PAT-21`) | Seeding manual test data, mutating state, preparing scenario data for manual testing. | Persistent. Commits all in-memory created/modified entities to database. |

> [!IMPORTANT]
> **The Dual-Requirement Law for Live Data Provisioning:**
> In Mendix, setting `RollbackTcseAfterExecution: "No"` alone is NOT sufficient for newly created or modified objects; uncommitted in-memory objects will be discarded when the execution thread terminates unless an explicit `Persist` step is executed. To ensure data is permanently written to the database for manual testing, you **MUST satisfy both requirements**:
> 1. Set `"RollbackTcseAfterExecution": "No"`.
> 2. Append a standalone batch `Persist` step (`{"Action": "Persist"}`) at the end of the object creation/modification block.

---

### 5.2. Standalone Batch `Persist` Step Protocol (`PAT-21`)

In `MTA_plugin.execute-testcase`, the `Persist` step operates as a **standalone parameterless batch commit action**:
* **No Target Entity Required:** Do NOT specify `EntityQualifiedName`.
* **No Handle Mappings Allowed:** Do NOT map input variable handles (`TCEX_RQ_Sfdr` or `TCEX_RQ_Sfcr`). Binding input handles to a `Persist` step causes a runtime error: `Cannot find executed TestStepRun with TestStepRunKey: X`.
* **Single Batch Commit (`PAT-21`):** A single trailing `Persist` step automatically commits **all uncommitted objects** created or changed across all preceding steps in that execution transaction.

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

---

### 5.3. Executor Context & Security Protocol for Local Execution

* **Mandatory Executor Identity:** The MTA plugin runtime requires an executor identity to instantiate the session context. Omitting the user throws:
  `java.lang.Exception: Executor Username or Executor UserRoles need to be given to create a user`.
* **Standard Local Testing Configuration:** For local exploratory testing and live data provisioning, use:
  ```json
  "ExecutorUsername": "MxAdmin",
  "ApplySecurityExecutor": "NONE"
  ```
  This creates the session context under the built-in Mendix administrative identity while bypassing entity access constraints to allow unhindered test data seeding.

---

### 5.4. Core Live Data Seeding Recipes

#### Recipe F: Live Entity Tree Seeding with Parent-Child Associations & Batch Persist (`TCEX_RQ_Sfar`, `PAT-21`)
Creates a complete domain graph (e.g. Customer -> Order -> OrderLine items) and commits all objects to the database via trailing batch `Persist`:

```json
{
  "ApplySecurityExecutor": "NONE",
  "ExecutorUsername": "MxAdmin",
  "RollbackTcseAfterExecution": "No",
  "TCEX_RQ_TestStepRun": [
    {
      "Key": 1,
      "SequenceNumber": 1,
      "TestStepRunType": "Oact",
      "ExecutionCondition": "None",
      "ResumeExecutionAfterException": "Stop",
      "TCEX_RQ_TestStepRunOact": {
        "Action": "Create",
        "EntityQualifiedName": "SalesModule.Customer",
        "TCEX_RQ_EntityValueRun": {
          "TCEX_RQ_AttributeValueRun": [
            { "AttributeName": "FullName", "DataType": "StringType_limited", "Value": "Jane Doe" },
            { "AttributeName": "CustomerTier", "DataType": "EnumType", "Value": "Gold" },
            { "AttributeName": "Email", "DataType": "StringType_limited", "Value": "jane.doe@example.com" }
          ]
        }
      }
    },
    {
      "Key": 2,
      "SequenceNumber": 2,
      "TestStepRunType": "Oact",
      "ExecutionCondition": "None",
      "ResumeExecutionAfterException": "Stop",
      "TCEX_RQ_TestStepRunOact": {
        "Action": "Create",
        "EntityQualifiedName": "SalesModule.Order",
        "TCEX_RQ_EntityValueRun": {
          "TCEX_RQ_AttributeValueRun": [
            { "AttributeName": "OrderNumber", "DataType": "StringType_limited", "Value": "ORD-MANUAL-001" },
            { "AttributeName": "OrderStatus", "DataType": "EnumType", "Value": "Open" },
            { "AttributeName": "OrderDate", "DataType": "DateTimeType", "Value": "2026-08-27T12:00:00.000Z" }
          ]
        },
        "TCEX_RQ_Sfar": [
          {
            "TestStepRunKey_output": 1,
            "AssociationName": "SalesModule.Order_Customer",
            "Operation": "set",
            "AssociationOwner": "_Default",
            "AssociationType": "Reference",
            "EntityParentQualifiedName": "SalesModule.Order",
            "EntityChildQualifiedName": "SalesModule.Customer"
          }
        ]
      }
    },
    {
      "Key": 3,
      "SequenceNumber": 3,
      "TestStepRunType": "Oact",
      "ExecutionCondition": "None",
      "ResumeExecutionAfterException": "Stop",
      "TCEX_RQ_TestStepRunOact": {
        "Action": "Persist"
      }
    }
  ]
}
```

#### Recipe G: Targeted Entity State Mutation (`TCEX_RQ_Sfcr`)
Retrieves an existing record by identifier or XPath constraint, applies state changes, and persists:

```json
{
  "ApplySecurityExecutor": "true",
  "ExecutorUsername": "demo_administrator",
  "RollbackTcseAfterExecution": "false",
  "TCEX_RQ_TestStepRun": [
    {
      "Key": 1,
      "SequenceNumber": 1,
      "TestStepRunType": "Oact",
      "TCEX_RQ_TestStepRunOact": {
        "Action": "Retrieve",
        "EntityQualifiedName": "SalesModule.Order",
        "RetrieveOption": "From_database",
        "RetrieveSet": "Head"
      }
    },
    {
      "Key": 2,
      "SequenceNumber": 2,
      "TestStepRunType": "Oact",
      "TCEX_RQ_TestStepRunOact": {
        "Action": "Change",
        "EntityQualifiedName": "SalesModule.Order",
        "TCEX_RQ_EntityValueRun": {
          "TCEX_RQ_AttributeValueRun": [
            { "AttributeName": "OrderStatus", "DataType": "EnumType", "Value": "Awaiting_Payment" }
          ]
        },
        "TCEX_RQ_Sfcr": [
          {
            "TestStepRunKey_output": 1
          }
        ]
      }
    }
  ]
}
```

#### Recipe H: User Account & Role Provisioning
Creates or configures a dedicated user account in `Administration.Account` / `System.User` with a specified password and user roles:

```json
{
  "ApplySecurityExecutor": "false",
  "ExecutorUsername": null,
  "RollbackTcseAfterExecution": "false",
  "TCEX_RQ_TestStepRun": [
    {
      "Key": 1,
      "SequenceNumber": 1,
      "TestStepRunType": "Oact",
      "TCEX_RQ_TestStepRunOact": {
        "Action": "Create",
        "EntityQualifiedName": "Administration.Account",
        "TCEX_RQ_EntityValueRun": {
          "TCEX_RQ_AttributeValueRun": [
            { "AttributeName": "Name", "DataType": "StringType_limited", "Value": "manual_tester_01" },
            { "AttributeName": "FullName", "DataType": "StringType_limited", "Value": "Manual Test User" },
            { "AttributeName": "Password", "DataType": "HashStringType", "Value": "TestPassword123!" },
            { "AttributeName": "Active", "DataType": "BooleanType", "Value": "true" }
          ]
        }
      }
    }
  ]
}
```

#### Recipe I: State-Transition Business Microflow Triggering
Executes complex business microflows directly on the Mendix runtime to advance domain state (e.g. `ACT_Order_SubmitForApproval` or `SUB_Invoice_Generate`):

```json
{
  "ApplySecurityExecutor": "true",
  "ExecutorUsername": "demo_administrator",
  "RollbackTcseAfterExecution": "false",
  "TCEX_RQ_TestStepRun": [
    {
      "Key": 1,
      "SequenceNumber": 1,
      "TestStepRunType": "Oact",
      "TCEX_RQ_TestStepRunOact": {
        "Action": "Retrieve",
        "EntityQualifiedName": "SalesModule.Order",
        "RetrieveOption": "From_database",
        "RetrieveSet": "Head"
      }
    },
    {
      "Key": 2,
      "SequenceNumber": 2,
      "TestStepRunType": "MicroflowCall",
      "TCEX_RQ_TestStepRunMfc": {
        "QualifiedName": "SalesModule.ACT_Order_SubmitForApproval",
        "TCEX_RQ_MicroflowParameter": [
          {
            "ParameterName": "Order",
            "DataType": "ObjectType",
            "EntityQualifiedName": "SalesModule.Order",
            "UseEmptyObjectList": false
          }
        ],
        "TCEX_RQ_Smpr": [
          {
            "ParameterName": "Order",
            "DataType": "ObjectType",
            "EntityQualifiedName": "SalesModule.Order",
            "TCEX_RQ_SmprValueRun": [{ "TestStepRunKey_output": 1 }]
          }
        ]
      }
    }
  ]
}
```

#### Recipe J: Batch Teardown & Targeted Data Cleanup (`PAT-21`, `ANTI-24`)
Deletes seeded test entities or user test data using retrieved object handles, strictly obeying domain model delete behavior and committing the deletions via a trailing `Persist` step:

```json
{
  "ApplySecurityExecutor": "NONE",
  "ExecutorUsername": "MxAdmin",
  "RollbackTcseAfterExecution": "No",
  "TCEX_RQ_TestStepRun": [
    {
      "Key": 1,
      "SequenceNumber": 1,
      "TestStepRunType": "Oact",
      "ExecutionCondition": "None",
      "ResumeExecutionAfterException": "Stop",
      "TCEX_RQ_TestStepRunOact": {
        "Action": "Retrieve",
        "EntityQualifiedName": "SalesModule.Order",
        "RetrieveOption": "From_database",
        "RetrieveSet": "All"
      }
    },
    {
      "Key": 2,
      "SequenceNumber": 2,
      "TestStepRunType": "Oact",
      "ExecutionCondition": "None",
      "ResumeExecutionAfterException": "Stop",
      "TCEX_RQ_TestStepRunOact": {
        "Action": "Delete",
        "EntityQualifiedName": "SalesModule.Order",
        "TCEX_RQ_Sfdr": [
          {
            "TestStepRunKey_output": 1
          }
        ]
      }
    },
    {
      "Key": 3,
      "SequenceNumber": 3,
      "TestStepRunType": "Oact",
      "ExecutionCondition": "None",
      "ResumeExecutionAfterException": "Stop",
      "TCEX_RQ_TestStepRunOact": {
        "Action": "Persist"
      }
    }
  ]
}
```

#### Recipe K: Multi-Entity Cascading Teardown with Topological Reverse-Dependency Ordering
When clearing multiple interrelated entities (e.g. `Booking`, `CarImage`, `Car`, `CarSize`, `Location`), order deletions from child/leaf entities to parent/root entities to satisfy Mendix delete constraint protections, committing all deletions in a single batch:

> [!TIP]
> **Topological Deletion Discovery via `mxcli`:**
> When constructing multi-entity teardown sequences, discover association delete rules by inspecting entity metadata:
> ```bash
> .\mxcli.bat -p "[MendixProject.mpr]" -c "SHOW ENTITY <Module.Entity>"
> ```
> Identify associations configured with *"Delete [Child] if [Parent] is deleted"* or *"Do not delete [Parent] if associated with [Child]"*. Always sequence `Delete` steps for Child/Leaf records *before* Parent/Root records to prevent runtime delete constraint exceptions.

```json
{
  "ApplySecurityExecutor": "NONE",
  "ExecutorUsername": "MxAdmin",
  "RollbackTcseAfterExecution": "No",
  "TCEX_RQ_TestStepRun": [
    {
      "Key": 1,
      "SequenceNumber": 1,
      "TestStepRunType": "Oact",
      "TCEX_RQ_TestStepRunOact": {
        "Action": "Retrieve",
        "EntityQualifiedName": "CarRentalModule.Booking",
        "RetrieveOption": "From_database",
        "RetrieveSet": "All"
      }
    },
    {
      "Key": 2,
      "SequenceNumber": 2,
      "TestStepRunType": "Oact",
      "TCEX_RQ_TestStepRunOact": {
        "Action": "Delete",
        "EntityQualifiedName": "CarRentalModule.Booking",
        "TCEX_RQ_Sfdr": [{ "TestStepRunKey_output": 1 }]
      }
    },
    {
      "Key": 3,
      "SequenceNumber": 3,
      "TestStepRunType": "Oact",
      "TCEX_RQ_TestStepRunOact": {
        "Action": "Retrieve",
        "EntityQualifiedName": "CarRentalModule.Car",
        "RetrieveOption": "From_database",
        "RetrieveSet": "All"
      }
    },
    {
      "Key": 4,
      "SequenceNumber": 4,
      "TestStepRunType": "Oact",
      "TCEX_RQ_TestStepRunOact": {
        "Action": "Delete",
        "EntityQualifiedName": "CarRentalModule.Car",
        "TCEX_RQ_Sfdr": [{ "TestStepRunKey_output": 3 }]
      }
    },
    {
      "Key": 5,
      "SequenceNumber": 5,
      "TestStepRunType": "Oact",
      "TCEX_RQ_TestStepRunOact": {
        "Action": "Retrieve",
        "EntityQualifiedName": "CarRentalModule.CarSize",
        "RetrieveOption": "From_database",
        "RetrieveSet": "All"
      }
    },
    {
      "Key": 6,
      "SequenceNumber": 6,
      "TestStepRunType": "Oact",
      "TCEX_RQ_TestStepRunOact": {
        "Action": "Delete",
        "EntityQualifiedName": "CarRentalModule.CarSize",
        "TCEX_RQ_Sfdr": [{ "TestStepRunKey_output": 5 }]
      }
    },
    {
      "Key": 7,
      "SequenceNumber": 7,
      "TestStepRunType": "Oact",
      "TCEX_RQ_TestStepRunOact": {
        "Action": "Persist"
      }
    }
  ]
}
```

> [!IMPORTANT]
> **Domain Model Delete Behavior Compliance in Cleanup Scripts:**
> In Mendix, deletions are subject to association delete behavior configured in the Domain Model:
> 1. **Prevent Delete Rules:** If an entity has association delete rules configured as *"Do not delete [Parent] object if associated with [Child] object(s)"*, attempting to delete the parent record directly will fail with a database delete constraint violation. The cleanup script MUST retrieve and delete referencing child records first (bottom-up cleanup) before deleting the parent.
> 2. **Cascade Delete Rules:** If an association has *"Delete [Child] object(s] as well"*, deleting the root entity automatically purges associated child records.
> 3. **Mandatory Batch Persist for Deletes:** In Mendix, deleted objects remain staged in transaction memory until committed. Cleanup scripts MUST append a trailing `Persist` step (`{"Action": "Persist"}`) to finalize the database deletion.

---

## 6. The 5-Pillar Strategy for Manual Test Data Tracking & Teardown

When testing manually, data is introduced via MTA seeding or direct user input in the browser. To prevent database pollution (`ANTI-24`), enforce this 5-pillar tracking and teardown protocol:

1. **Root Object Association Cascade**: Most manual tests start with a seeded root entity (e.g. `Customer`, `Order`, `Policy`). User actions in the UI create child records linked to this root. Deleting the root object (with Mendix Delete Cascade or recursive association delete) automatically purges all manual child records.
2. **Dedicated Test User & Owner Isolation (`System.owner`)**: The tester logs in with a dedicated test account (e.g. `manual_tester_01`). Teardown queries target records where `System.owner = '[TestUser]'` created during the session.
3. **Time-Window & Timestamp Delta (`createdDate >= T_start`)**: MTA records the session start timestamp $T_{start}$. Teardown queries target entities where `createdDate >= T_start`.
4. **Recommended Test Prefix Convention (`TEST-%` / `MANUAL-%`)**: In the Manual Test Plan instructions, the agent advises using standard prefixes for free-text fields. Teardown queries match these attributes.
5. **Interactive Cleanup Inspection (`PAT-69`)**: Before executing `Oact: Delete`, MTA runs a read-only retrieve query, displays a breakdown of discovered records to the user in chat, and deletes only upon explicit confirmation.

---

## 7. Standard Manual Testing Telemetry & Provisioning Report (`PAT-68`)

Whenever test data is seeded or modified for manual testing (`RollbackTcseAfterExecution = "false"`), the assistant MUST output the structured report below:

```markdown
### 📦 MTA MANUAL TEST DATA PROVISIONING REPORT

<details>
<summary><b>Execution Metadata & Environment Details</b></summary>

*   **Timestamp:** `[YYYY-MM-DD HH:mm:ss (Local Time)]`
*   **Execution User:** `[Username / Roles]`
*   **Total Wall-Clock Time:** `[X ms]`
*   **Rollback Mode:** `Persistent Commit (RollbackTcseAfterExecution = false + Trailing Batch Persist)`

</details>

#### 1. Provisioning Summary
*   **Target Feature / Scope:** `[Feature Name / Test Goal]`
*   **Status:** `Data Provisioned (Live Database Commit)`

#### 2. Provisioned Entity Inventory
| Entity Type | Record Identifier / Key | Key Attributes | Associated Entities |
| :--- | :--- | :--- | :--- |
| `SalesModule.Customer` | `Jane Doe (ID: 10021)` | `CustomerTier: Gold, Email: jane.doe@example.com` | - |
| `SalesModule.Order` | `ORD-MANUAL-001 (ID: 10022)` | `OrderStatus: Open, OrderDate: Today` | `Order_Customer -> Jane Doe` |

#### 3. Manual Testing Navigation & Access
*   **Direct Page / Navigation:** `[Module.Page_Name] (e.g., SalesModule.Order_Overview)`
*   **Login User / Role:** `manual_tester_01` (Password: `TestPassword123!`) / Role: `CustomerService`
*   **Search / Filter Value:** Search for `ORD-MANUAL-001` in the Order Number column.

#### 4. Step-by-Step Manual Verification Checklist
1. [ ] Log in as `manual_tester_01` and navigate to **Orders Overview**.
2. [ ] Open Order `ORD-MANUAL-001`. Verify customer tier displays **Gold** and 10% discount is pre-calculated.
3. [ ] Click **Add Order Line**, select product **Widget Pro**, and verify unit price applies discount.
4. [ ] Click **Submit Order**. Verify status changes to **Pending Approval**.

#### 5. Instant Teardown & Cleanup Manifest
*   To clean up all data created during this manual test session, reply:
    > *"Clean up test data for ORD-MANUAL-001"*

<details>
<summary><b>Step Level Execution Breakdown & Latency Telemetry</b></summary>

| # | Step Name / Type | Input (Handles / Values) | Actual Output | Expected Result / Assertions | Result | Duration |
| :-: | :--- | :--- | :--- | :--- | :-: | -: |
| 1 | `[Oact: Create]` | `[Attributes...]` | `GUID: [10021]` | `Object instantiated` | `PASS` | `10 ms` |
| 2 | `[Oact: Persist]` | `Batch commit uncommitted objects` | `Committed N records` | `Persisted to Database` | `PASS` | `18 ms` |

</details>
```

---

## 8. Two-Phase Manual Data Seeding & Cleanup Inspection (`PAT-69`)

To protect development databases from unintended corruption:
1. **Mutating Microflow Dry-Run**: When seeding data involves executing custom mutating microflows or batch updates, first run `execute-testcase` with `RollbackTcseAfterExecution = "true"`. If all validations and assertions pass, proceed to live commit (`Rollback = "false"`).
2. **Interactive Cleanup Review**: Before executing mass teardown, present the count and names of candidate records found, and require user confirmation before executing `Oact: Delete`.

---

## 9. Promotion to Persistent MTA Platform Test (`PAT-57`, `PAT-70`, `ANTI-16`)

### A. Automated Exploratory Test Promotion (`PAT-57`)
When an exploratory test executes and passes in-memory (`RollbackTcseAfterExecution = "true"`), the assistant MUST prompt the user to promote it:
> *"The exploratory test executed and passed in [X] ms with full rollback. Would you like to promote this test to a persistent test on the MTA Platform?"*

Upon confirmation, the test promotes directly 1:1 to a persistent Backend Test Case with Data Variations (**no structure selection needed**). The agent transitions directly to `mta-test-design` (`PLAN_STEP_2`) for the **Universal Iterative Placement Protocol** (Config -> Suite -> Case -> Gate 2 Sign-off), calls `SaveExecutionPlan` upon Gate 2 approval, and proceeds to `STATE_CONSTRUCTION` in `mta-build`.

---

### B. Data Script & Manual Scenario to MTA Conversion Protocol (`PAT-70`)
When a local live test data seeding script (`TCEX_RQ` executed with `Rollback = "false"`) or a Manual Test Plan (MTP) scenario is completed, the agent offers to convert the underlying seed data recipe into a persistent MTA Platform asset.

#### 🚨 Structure Selection & Universal Execution Plan Mandate (`PAT-43`, `PAT-70`, `ANTI-14`):
You are **strictly prohibited** from converting or constructing persistent MTA test cases from a data script without first prompting the user to select one of the **3 Data Provisioning Structure Choices**, generating an official **`# MTA EXECUTION PLAN SIGN-OFF`** (Gate 1), and resolving placement interactively via the **Universal Iterative Placement Protocol** (Gate 2).

#### The 3 Conversion Choices:
1. **Type 1: Standalone Data Seeding Test Case (Persistent Data Generator)**
   * *Generates:* A **Backend Execution Plan** (1-Case Data Generator).
   * *Step Sequence:* Entity creation and association linking steps, direct attribute bindings, trailing batch `Persist`.
   * *Teardown:* **NO teardown steps in this test case.** Seeded records remain in the database for subsequent manual testing, QA validation, or demo environments (`Rollback = No`).
   * *Section 6 (Playwright):* Marked as `Not Applicable (Backend Test)`.
2. **Type 2: Automated Backend Integration Suite (3-Case Backend Pattern)**
   * *Generates:* A **Backend Execution Plan** (3-Case Integration Lifecycle).
   * *Step Sequence:*
     * `Case 1 (Setup)`: Data script steps with `ExecutionCondition = "_Always"` and `ResumeExecutionAfterException = "_Continue"`.
     * `Case 2 (Backend Logic)`: Microflow execution and return value / state assertions mapped from `DESCRIBE MICROFLOW` (`PAT-71`).
     * `Case 3 (Teardown)`: Automatic cascading delete steps with `ExecutionCondition = "_Always"` and `ResumeExecutionAfterException = "_Continue"`.
   * *Section 6 (Playwright):* Marked as `Not Applicable (Backend Test)`.
3. **Type 3: Automated Frontend Test Suite (3-Case UI Pattern)**
   * *Generates:* A **Frontend Execution Plan** (3-Case UI Lifecycle).
   * *Step Sequence:*
     * `Case 1 (Setup)`: Data script steps with `ExecutionCondition = "_Always"` and `ResumeExecutionAfterException = "_Continue"`.
     * `Case 2 (Frontend UI Test)`: Playwright UI actions using verified `MenditectMxFrontendTestKit` microflows mapped from single-pass page AST discovery (`PAT-72`).
     * `Case 3 (Teardown)`: Automatic cascading delete steps with `ExecutionCondition = "_Always"` and `ResumeExecutionAfterException = "_Continue"`.
   * *Section 6 (Playwright):* Full **10-Setting Playwright Table** (Environment, Browser Type, Headless Mode, Viewport, Video, Trace, SlowMo, Timeout, Base URL, Execution User).

### Step-by-Step Conversion & Promotion Workflow:
1. **Prompt Structure Choice (Data Seeding Plans Only):** Prompt user to select Type 1, Type 2, or Type 3 structure.
2. **Draft Execution Plan (Gate 1):** Generate `# MTA EXECUTION PLAN SIGN-OFF` conforming to the selected option, including the 13-point Pre-Approval Quality Checklist.
3. **Iterative Gate 2 Placement Discovery:** In `mta-test-design` (`PLAN_STEP_2`), interactively scan and present available Test Configurations, then Test Suites, and propose Test Case Name(s) and Execution User in strict multi-turn sequential steps.
4. **Present Summary & Sign-Off (Gate 2):** In `mta-test-design` (`PLAN_STEP_3`), present Placement & Target Summary for user approval.
5. **Persist Execution Plan:** Upon Gate 2 approval, call `SaveExecutionPlan` on the MTA server to obtain `ExecutionPlanKey`. Check model revision currency (`PAT-36`).
6. **Transition to Construction:** Set State Header to `[State: STATE_CONSTRUCTION | Temp State: STEP_BUILDING | Active Skill: mta-build]`.
7. **Construct Server Assets:** Provision test cases and map each step to MTA Server tools (`CreateTestStepCreateObject`, `CreateMicroflowCallTestStep`, `Set*AttributeValue`, `SetTestStepOutputForSelectObjectFor*`). When data variations are present, strictly execute the variation lifecycle (`PAT-77`): call `EnableTestCaseDataVariations`, set template name and description (`TestCaseDataVariationName` + `TestCaseDataVariationDescription`), duplicate columns (`DuplicateTestCaseDataVariation`), set each duplicated variation's name and description (`TestCaseDataVariationName` + `TestCaseDataVariationDescription`), and reconcile matrix cell values (`PAT-54`).
8. **Save Keys:** Write all generated keys (`test_configuration.key`, `test_suite.key`, `test_cases[].key`, `execution_plan_key`) to `mta_state.json`.
9. **Transition to Smoke Audit:** Set State Header to `[State: STATE_SMOKE_AUDIT | Temp State: SMOKE_AUDITING | Active Skill: mta-build]` and execute `GetTestConstructionErrorsOfTestCase`. Verify all variation descriptions match Section 7 cell-by-cell (`PAT-77`).


