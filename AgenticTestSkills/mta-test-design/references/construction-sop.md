# Deterministic Horizontal Layered Construction SOP

**📍 Location:** `references/construction-sop.md` | **🏠 Parent:** [MTA Build Skill](../SKILL.md)  
*Patterns Enforced: `PAT-11`, `PAT-16`, `PAT-78`, `PAT-85`, `PAT-86`, `PAT-87`, `PAT-91`, `PAT-92`, `PAT-93`, `PAT-109`, `PAT-110`, `PAT-115`, `PAT-117`, `ANTI-05`, `ANTI-32`, `ANTI-39`, `ANTI-40`, `ANTI-44`, `ANTI-59`, `ANTI-64`, `ANTI-66`*

This Standard Operating Procedure (SOP) governs the active construction of test cases, steps, assertions, and data variations on the Menditect Test Automation (MTA) platform.

---

## 🚫 Strict Prohibition of Existing Suite Reverse-Engineering & Anchoring (`ANTI-66`)

Once Gate 1 (Execution Plan) and Gate 2 (Placement) are approved, the agent is **STRICTLY PROHIBITED** from querying existing or historical test suites (`GetTestSuiteDetails`, `GetTestCaseDetails`, `GetTeststepDetails`) to reverse-engineer or copy step parameters, locators, date formats, or step sequences (`ANTI-66`).

### Why Existing Suite Anchoring Fails:
* **Legacy Bugs & Format Conflicts:** Historical test suites frequently contain outdated locators, deprecated parameter patterns, or conflicting localization settings (e.g. copying `MM/dd/yyyy` from an old US-formatted suite, overwriting the correct `dd-MM-yyyy` specified in the approved Execution Plan).
* **Massive Token & Roundtrip Waste:** Querying foreign test suites wastes dozens of roundtrips and tens of thousands of tokens inspecting irrelevant test structures.
* **Violation of Single Source of Truth (`PAT-71`):** The approved `EP_*.md` file is the sole authoritative specification. During `STATE_CONSTRUCTION`, all step types, names, attributes, parameters, locators, and formats MUST be read exclusively from the approved `EP_*.md` file. Zero queries to other test suites are permitted.

---

## 🏗️ The 4-Phase Horizontal Construction Pipeline

To prevent transaction locks, avoid partial-state failures, and maximize throughput, active construction MUST proceed horizontally across all steps rather than vertically step-by-step (`ANTI-39`).

```
[Phase 1: Skeleton Provisioning] (Forward step chaining)
             │
[Phase 2A: Batch Inclusion] (Attributes, Filters, Assertions - 15-20 calls/turn)
             │
[Mid-Phase Bulk Sync: PAT-117] (Single GetTestCaseDetails call)
             │
[Phase 2B: Batch Binding] (Values, Parameters, Outputs, Descriptions - 15-20 calls/turn)
             │
[Phase 3: Variation Registration] (AddTestCaseVariationItem across all targets)
             │
[Phase 4: Upfront Column Provisioning & Bulk Chunked Population] (Scenarios 2..N)
```

---

### Phase 1: Sequential Step Pipeline (`Temp State: SKELETON_PROVISIONING`)
1. **Multi-Case Allocation (`RULE_3_CASE_SUITE_MAPPING`, `PAT-03`, `PAT-44`):**
   - In multi-case test suites (e.g., Frontend 3-Case lifecycle: Case 1 Setup with seeding + batch Persist, Case 2 Action, Case 3 Teardown with reverse deletes + batch Persist [`PAT-03`, `PAT-91`, `PAT-92`, `PAT-93`]), create exactly 3 distinct Test Cases inside the target Test Suite:
     1. `EP_<Name> - Case 1: Setup`
     2. `EP_<Name> - Case 2: Playwright Execution`
     3. `EP_<Name> - Case 3: Teardown`
   - Shunting all steps into a single monolithic test case is strictly prohibited.
   - Dispatch all planned `CreateTestCase` calls concurrently with pre-resolved `ExecutionUserKey` (`PAT-79`).
2. **Predecessor Anchor Sequencing Semantics (`RULE_SEQUENCING_SEMANTICS`, `ANTI-44`):**
   - `SetSequenceOfTestCase(TestCaseKey, TestCaseBeforeKey)` places `TestCaseKey` **AFTER** `TestCaseBeforeKey`. Pass `TestCaseBeforeKey = 0` to set `TestCaseKey` as Position 1.
   - **Canonical 3-Case Ordering Recipe:**
     1. `SetSequenceOfTestCase(TestCaseKey=C1, TestCaseBeforeKey=0)` -> C1 is Position 1.
     2. `SetSequenceOfTestCase(TestCaseKey=C2, TestCaseBeforeKey=C1)` -> C2 is Position 2 (after C1).
     3. `SetSequenceOfTestCase(TestCaseKey=C3, TestCaseBeforeKey=C2)` -> C3 is Position 3 (after C2).
   - Always verify sequence using `GetTestSuiteDetails` and confirm `SequenceNumber`: C1 -> 1, C2 -> 2, C3 -> 3.
3. **High-Level Widget Generator Priority (`RULE_USE_WIDGET_GENERATORS`, `PAT-64`):**
   - For all Playwright widget locator steps targeting standard Mendix widgets (`TextBox`, `DropDown`, `DatePicker`, `ReferenceSelector`, `Button`, `CheckBox`, `RadioButtons`, `ComboBox`, etc.), use the dedicated MTA generator tool **`GenerateMicroflowCallTestStepLocateWidget`** (or **`GenerateMicroflowCallTestStepLocatePage`**).
   - Low-level manual parameter editing loops (`CreateMicroflowCallTestStep` -> `GetTeststepDetails` -> `EditMicroflowParameterValue` -> `EditMicroflowObjectParameter`) are strictly prohibited for standard widget locators.
4. **Step Forward-Chaining:** Create empty steps in chronological order using predecessor chaining (`TestStepBeforeKey = PreviousStepKey`, `PAT-11`).
   - For the very first step in a test case, pass `TestStepBeforeKey = 0`.
     > [!WARNING]
     > **⚠️ `TestStepBeforeKey = 0` IS HEAD INSERTION ONLY:**
     > Passing `0` for `TestStepBeforeKey` in `CreateMicroflowCallTestStep`, `CreateObjectActionTestStep`, or `SetSequenceOfTestStep` **ALWAYS** places the step at **Position 1 (the absolute beginning / head)** of the test case. It **NEVER** appends to the end.
   - Steps in the same test case cannot be batched concurrently because each step requires its predecessor's generated key.
   - **Sequence Modification Serialization (`ANTI-44`):** If reordering steps or test cases after creation via `SetSequenceOfTestStep` or `SetSequenceOfTestCase`, you MUST execute these calls sequentially one-by-one across separate turns. Dispatching multiple sequence reordering calls in parallel causes uncommitted transaction race conditions on ordinal list positions in Mendix, resulting in scrambled step sequences. Wherever possible, construct steps forward in correct sequence order from the start (`PAT-11`) to eliminate the need for `SetSequenceOfTestStep` entirely.
   - **Deterministic Reverse-Order Re-indexing Pattern ($N \rightarrow 1$):** If an existing multi-step test case needs its sequence completely re-ordered, execute `SetSequenceOfTestStep(stepKey, 0)` in **reverse order** (from Step $N$ down to Step 1). This deterministically establishes the contiguous sequence $[1..N]$ without ordinal list collisions.
5. **Direct Output Binding:** For `ChangeObjects` and `DeleteObjects` steps, pass `TestStepOutputKey` directly into `CreateObjectActionTestStep` at creation time (`PAT-80`).

---

### Phase 2A: Bulk Attribute Inclusion & Assertions (`Temp State: BATCH_INCLUSION`)
Once all step keys are resolved, batch-dispatch the following tools concurrently across ALL steps in the test case:
- `EditAttributeValue(EditAction="IncludeAttribute", TestStepKey=..., AttributeName=...)` for all attributes across all Create Object and Retrieve steps (never use `EditAttributeValueFilter` for inclusion).
- `EditTestStepRetrieve(RetrieveOption=...)` to configure retrieve mode.
- Embedded assertions: `CreateAssertMicroflowReturnValue` (using plural `"Equals"`), `CreateAssertObjectCount` (mandatory on all retrieve steps piping output to downstream consumers per `PAT-08` / `ANTI-03`), `CreateAssertValidationFeedbackMessageCompare`, `CreateAssertValidationFeedbackMessageCount`, and `CreateAssertException`.

> **Safe Batch Sizing:** Group calls into safe batches of **15 to 20 tool calls per turn** (`ANTI-32`). For large test cases, chunk across sequential turns while remaining within `BATCH_INCLUSION`.

---


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

### Mid-Phase Bulk Sync: Single Bulk Sync per Test Case (`PAT-117`)

To eliminate the sequential `CreateStep -> GetTeststepDetails -> EditParam` anti-pattern (`ANTI-32`, `ANTI-39`), you MUST enforce a single `GetTestCaseDetails` bulk sync per test case during Phase 2 (`PAT-117`).

#### 🔄 Execution Flow:
1. **Phase 1 (Skeleton Chaining):** Chain all empty steps in the testcase sequentially (`TestStepBeforeKey = prevStepKey`, `PAT-11`, `PAT-16`).
2. **Phase 2A (Attribute Inclusion & Retrieve Options):** Dispatch all `EditAttributeValue(IncludeAttribute)` and `EditTestStepRetrieve` calls in concurrent batches of 15–20 calls/turn (`ANTI-32`).
3. **Mid-Phase Bulk Sync (Single Call, `PAT-117`):** Call `GetTestCaseDetails(TestCaseKey)` **EXACTLY ONCE** to capture all server-assigned `AttributeValueKey`, `SelectObjectForMicroflowParameterKey`, and `MicroflowParameterValueKey` IDs across all steps in the testcase.
   > [!CAUTION]
   > **Sequential `GetTeststepDetails` Loop Ban (`PAT-117`, `ANTI-32`):**
   > Calling `GetTeststepDetails` in a loop across individual steps to discover parameter, locator, or attribute keys is **STRICTLY PROHIBITED**. Doing so degrades throughput into an excruciating 90+ turn sequential slog. Parse the single `GetTestCaseDetails` response in memory to extract all step keys at once.
4. **Phase 2B (Concurrent Batch Binding):** Parse the keys in memory and batch all `EditMicroflowObjectParameter`, `EditMicroflowParameterValue`, and `EditAttributeValue` setter calls concurrently in safe chunks of 15–20 calls/turn.

---

### Phase 2B: Bulk Value Binding & Configuration (`Temp State: BATCH_BINDING`)
With keys resolved from the sync, batch-dispatch the following tools concurrently across ALL steps:
- Attribute value setters: `EditAttributeValue` (`SetStringValue`, `SetIntegerValue`, `SetDateTime*`, `SetTestStepOutputForSelectValueForValue`, passing raw numeric integers for `IntegerLongValue` per `PAT-81`).
- Retrieve attribute filter setters: `EditAttributeValueFilter` (`SetStringValue`, `SetIntegerValue`, `SetBooleanValue`, `SetDateTime*`, `SetEnumerationValue`, passing `AttributeValueKey`, `FilterComparisonOperator`, and value).
- Association bindings: `CreateSelectObjectForAssociation` and `EditTestStepAssociation`.
- Microflow parameters: `EditMicroflowParameterValue` (literals) and `EditMicroflowObjectParameter` (piped object variables).
- Assertions configuration: Call typed comparison setters. Use singular `"Equal"` for `EditAssertMicroflowReturnValueCompare`, `EditAssertAttributeValueCompare`, and `EditAttributeValueFilter` (`FilterComparisonOperator`); use plural `"Equals"` for `CreateAssertMicroflowReturnValue`, `EditAssertValidationFeedbackMessageCompare`, and `EditAssertValidationFeedbackMessageCount`; use mixed format (`Equals`, `Greater_than`, `GreaterThanEqualTo`, `Less_than`, `LessThanEqualTo`) for `EditAssertObjectCount`.
- Step descriptions & pattern annotations: `EditTestStep(EditAction="SetDescription")` with `[Pattern: <Name> - <Rationale>]` (`PAT-12`).
- Step execution settings: `EditTestStep` with `ExecutionCondition` (`"Always"`, `"Skip"`, `"None"`) and `ResumeExecutionAfterException` (`"_Continue"`, `"Stop"` — note: `"Stop"` has NO leading underscore).

> **Strict 4-Step Partial Failure Handling:** Because MTA MCP tools do not support server-side atomic transactions, if an individual call fails within a batch, do NOT abort the build or discard earlier steps. Follow the 4-step recovery flow:
> 1. *Halt:* Stop executing subsequent batches immediately upon any tool error.
> 2. *Isolate:* Parse the MCP error response to extract the specific failed key (`TestStepKey`, `AttributeValueKey`, or `TestCaseVariationKey`) and the failing parameter.
> 3. *Surgically Correct:* Re-run only that specific failed setter tool with corrected arguments.
> 4. *Verify & Resume:* Confirm step integrity via `GetTeststepDetails(TestStepKey)` or `GetTestCaseDetails(TestCaseKey)` before resuming the remaining batches.

#### 🔧 Step Decommissioning & Failure Recovery Protocol (`PAT-DEPRECATE-STEP` / `PAT-115`, `ANTI-64`)
Because MTA does not expose a `DeleteTestStep` MCP tool, when a test step is misconfigured, corrupted, rendered redundant, or blocked by an irreversible parameter lock (e.g. `ErrorNr: 21` when an incompatible locator was bound to an action), attempting to delete it via arbitrary scripts or leaving an un-executable step in the active execution pipeline is strictly prohibited (`ANTI-64`). Agents MUST follow the **3-Step Decommissioning Protocol (`PAT-115`)**:
1. **Neutralize Step Execution:** Call `EditTestStep` to set `ExecutionCondition = "Skip"` (or `"None"` if `"Skip"` is unsupported).
2. **Rename & Annotate Step:** Call `EditTestStep` to prepend `[TO DELETE]` to `TestStepName` (e.g. `[TO DELETE] Step 3 - ACT_SelectOption_DropDown`) and set `Description` explaining the decommission rationale:
   `[Pattern: PAT-DEPRECATE-STEP (PAT-115) - Decommissioned due to locator type mismatch. Manual deletion recommended via MTA UI]`.
3. **Provision Replacement Step:** Create the correct replacement step forward-chained from the proper predecessor (`PAT-11`) and bind correct parameters.
4. **Reconcile Checkpoint 3 & Audit:** When completing construction, include a **Manual Cleanup Recommendation** box in the Smoke Audit receipt informing the user of the deprecated steps for clean deletion in Studio Pro.

---

### Phase 3: Upfront Variation Registration (`Temp State: VARIATION_REGISTRATION`)
1. Enable variations on the test case: `AddTestCaseVariationItem(Action="EnableTestCaseDatavariation")`.
2. Concurrently dispatch **ALL** planned `AddTestCaseVariationItem` calls across all variation columns in safe batches (15-20 calls per turn).
   - *SSOT Lock & Target-Bound Schema (`PAT-110`, `ANTI-32`, `ANTI-59`):* Every variation item registered MUST match Section 7 of the approved Execution Plan 1:1, binding directly to concrete test step target elements (`AttributeValueKey`, `AssertMicroflowReturnValueCompareKey`, or Filter attribute). Zero unapproved additions, conceptual boolean flags, or improvisations allowed (`ANTI-32`, `ANTI-59`).

---

### Phase 4: Upfront Column Provisioning & Bulk Chunked Population (`Temp State: VARIATION_POPULATION`)
Enforce `PAT-86`, `PAT-87`, and `ANTI-40`:

1. **Step 4.1 (Bulk Allocation):** Concurrently dispatch `CreateTestCaseVariation(TestCaseKey)` for ALL remaining scenarios ($2..N$) in 1 single turn (`PAT-86`). Collect returned keys directly in sequence ($K_2..K_N$) and ignore MTA internal descending `Number` assignments.
2. **Step 4.2 (Matrix Snapshot):** Execute 1 single `GetTestCaseDetails(TestCaseKey)` to capture all cloned variation container and cell keys.
3. **Step 4.3 (Streamlined In-Memory Mapping & Reasoning):**
   In your tool execution reasoning block (`🧠 Tool Execution Reasoning`), state the scenario batch being updated (e.g., `Populating Batch 1: Scenarios 2–4 with Keys 1646, 1645, 1644`). Do NOT render giant multi-column markdown tables in chat before dispatching calls; this keeps response sizes compact and eliminates stream interruptions.
   *Deterministic In-Memory Indexing:* Map cloned cell keys directly in-memory against `TCVI_TestCaseVariationItems` list order without intermediate `GetTeststepDetails` roundtrips (`PAT-87`, `ANTI-40`).

4. **Step 4.4 (Batch by Scenario / Column):**
   Dispatch cell updates **Scenario-by-Scenario (Column-by-Column)**:
   - Group cell updates by scenario in sequential order. You may batch multiple scenarios per turn up to the safe batch limit of 15 to 20 tool calls per turn (`ANTI-32`), provided scenario column order is maintained and all mapped keys match the upfront CoT mapping table.
   - Container metadata (`EditTestCaseVariation`), attribute overrides, parameter overrides, and assertion overrides should be completed for a scenario before advancing to the next.
   - For null/empty values, use `SetValueToEmpty="_True"`.
   - Cloned `AssertObjectCount` containers default to `0`; call `EditAssertObjectCount(SetExpectedObjectCount)` with `ExpectedObjectCount: N` for scenarios expecting $\ge 1$ objects.
   - Limit calls to safe batches of 15 to 20 calls per turn (`ANTI-32`).
---

## 🔍 Phase 4: Post-Construction Smoke Verification & Audit SOP

> [!CRITICAL]
> **Semantic Compliance Invariant:**
> In MTA, `0 Construction Errors` (`TCER_TestConstructionErrors`) only proves Mendix syntactic validity; it does NOT prove plan compliance. The agent must never declare a smoke pass without performing the **Mandatory 5-Point Semantic Audit**.

#### Mandatory 5-Point Semantic Audit Checklist:
1. **Retrieve Option & Predecessor Handle Binding (`PAT-07`, `PAT-80`):**
   - For all in-memory `RetrieveObjects` steps, assert `OactRetrieveOption == "From_memory_database"` (or `"By_teststep"`).
   - Assert `SOFR_SelectObjectForRetrieve.TestStepOutputKey` is explicitly bound to the producer step key.
2. **Retrieve Attribute Filters (`PAT-07`):**
   - If the plan specifies scalar filters on Retrieve steps (e.g., `Size == 'Small'`, `LicensePlate == 'TST-001'`), verify that `ATVL_AttributeValues` contains the filter attribute with `FilterComparisonOperator: "Equal"`.
3. **Association Ownership (`PAT-06`, `ANTI-52`):**
   - Verify that `SOFA_SelectObjectForAssociations` is bound on the owner entity and references the retrieved object handle.
4. **Data Variation Item Count & Target Parity (`PAT-19`, `PAT-78`):**
   - Assert that the number of items in `TCVI_TestCaseVariationItems` equals the number of planned variation items in Section 7 of the Execution Plan.
   - Assert each item maps to the correct target (`AttributeValueKey`, `AssertMicroflowReturnValueCompareKey`, or Filter attribute).
5. **Cell-by-Cell Variation Matrix Parity (`PAT-107`, `ANTI-57`):**
   - Verify that all scenario names, descriptions, overridden values, and empty/null flags (`SetValueToEmpty: "_True"`, `'NONE'`) match Section 7 cell-by-cell.

