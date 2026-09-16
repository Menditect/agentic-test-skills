# Deterministic Horizontal Layered Construction SOP

**📍 Location:** `references/construction-sop.md` | **🏠 Parent:** [MTA Build Skill](../SKILL.md)  
*Patterns Enforced: `PAT-11`, `PAT-16`, `PAT-78`, `PAT-85`, `PAT-86`, `PAT-87`, `PAT-91`, `PAT-92`, `PAT-93`, `ANTI-05`, `ANTI-32`, `ANTI-39`, `ANTI-40`, `ANTI-44`*

This Standard Operating Procedure (SOP) governs the active construction of test cases, steps, assertions, and data variations on the Menditect Test Automation (MTA) platform.

---

## 🏗️ The 4-Phase Horizontal Construction Pipeline

To prevent transaction locks, avoid partial-state failures, and maximize throughput, active construction MUST proceed horizontally across all steps rather than vertically step-by-step (`ANTI-39`).

```
[Phase 1: Skeleton Provisioning] (Forward step chaining)
             │
[Phase 2A: Batch Inclusion] (Attributes, Filters, Assertions - 15-20 calls/turn)
             │
[Mid-Phase Bulk Sync] (Single GetTestCaseDetails call)
             │
[Phase 2B: Batch Binding] (Values, Parameters, Outputs, Descriptions - 15-20 calls/turn)
             │
[Phase 3: Variation Registration] (AddTestCaseVariationItem across all targets)
             │
[Phase 4: Upfront Column Provisioning & Bulk Chunked Population] (Scenarios 2..N)
```

---

### Phase 1: Sequential Step Pipeline (`Temp State: SKELETON_PROVISIONING`)
1. **Multi-Case Allocation:** In multi-case test suites (e.g., Frontend 3-Case lifecycle: Case 1 Setup with seeding + batch Persist, Case 2 Action, Case 3 Teardown with reverse deletes + batch Persist [`PAT-03`, `PAT-91`, `PAT-92`, `PAT-93`]), dispatch all planned `CreateTestCase` calls concurrently. Ensure `ExecutionUserKey` is resolved beforehand (`PAT-79`).
2. **Step Forward-Chaining:** Create empty steps in chronological order using predecessor chaining (`TestStepBeforeKey = PreviousStepKey`, `PAT-11`).
   - For the very first step in a test case, pass `TestStepBeforeKey = 0`.
     > [!WARNING]
     > **⚠️ `TestStepBeforeKey = 0` IS HEAD INSERTION ONLY:**
     > Passing `0` for `TestStepBeforeKey` in `CreateMicroflowCallTestStep`, `CreateObjectActionTestStep`, or `SetSequenceOfTestStep` **ALWAYS** places the step at **Position 1 (the absolute beginning / head)** of the test case. It **NEVER** appends to the end.
   - Steps in the same test case cannot be batched concurrently because each step requires its predecessor's generated key.
   - **Sequence Modification Serialization (`ANTI-44`):** If reordering steps or test cases after creation via `SetSequenceOfTestStep` or `SetSequenceOfTestCase`, you MUST execute these calls sequentially one-by-one across separate turns. Dispatching multiple sequence reordering calls in parallel causes uncommitted transaction race conditions on ordinal list positions in Mendix, resulting in scrambled step sequences. Wherever possible, construct steps forward in correct sequence order from the start (`PAT-11`) to eliminate the need for `SetSequenceOfTestStep` entirely.
   - **Deterministic Reverse-Order Re-indexing Pattern ($N \rightarrow 1$):** If an existing multi-step test case needs its sequence completely re-ordered, execute `SetSequenceOfTestStep(stepKey, 0)` in **reverse order** (from Step $N$ down to Step 1). This deterministically establishes the contiguous sequence $[1..N]$ without ordinal list collisions.
3. **Direct Output Binding:** For `ChangeObjects` and `DeleteObjects` steps, pass `TestStepOutputKey` directly into `CreateObjectActionTestStep` at creation time (`PAT-80`).

---

### Phase 2A: Bulk Attribute Inclusion & Assertions (`Temp State: BATCH_INCLUSION`)
Once all step keys are resolved, batch-dispatch the following tools concurrently across ALL steps in the test case:
- `EditAttributeValue(EditAction="IncludeAttribute", TestStepKey=..., AttributeName=...)` for all attributes across all Create Object and Retrieve steps (never use `EditAttributeValueFilter` for inclusion).
- `EditTestStepRetrieve(RetrieveOption=...)` to configure retrieve mode.
- Embedded assertions: `CreateAssertMicroflowReturnValue` (using plural `"Equals"`), `CreateAssertObjectCount`, `CreateAssertValidationFeedbackMessageCompare`, `CreateAssertValidationFeedbackMessageCount`, and `CreateAssertException`.

> **Safe Batch Sizing:** Group calls into safe batches of **15 to 20 tool calls per turn** (`ANTI-32`). For large test cases, chunk across sequential turns while remaining within `BATCH_INCLUSION`.

---

### Mid-Phase Bulk Sync
Execute `GetTestCaseDetails(TestCaseKey)` (or `GetTestSuiteDetails`) to capture all newly generated `AttributeValueKey`s, retrieve filter keys, and assertion keys across all steps.
> [!TIP]
> **Targeted Step Details vs Full Dumps:** When inspecting or configuring a specific step (e.g. a Microflow Call step to obtain `SelectObjectForMicroflowParameterKey`), call **`GetTeststepDetails(TestStepKey)`**. This returns < 1 KB directly in context, completely avoiding disk-dump truncation (`output.txt`).

---

### Phase 2B: Bulk Value Binding & Configuration (`Temp State: BATCH_BINDING`)
With keys resolved from the sync, batch-dispatch the following tools concurrently across ALL steps:
- Attribute value setters: `EditAttributeValue` (`SetStringValue`, `SetIntegerValue`, `SetDateTime*`, `SetTestStepOutputForSelectValueForValue`, passing raw numeric integers for `IntegerLongValue` per `PAT-81`).
- Retrieve attribute filter setters: `EditAttributeValueFilter` (`SetStringValue`, `SetIntegerValue`, `SetBooleanValue`, `SetDateTime*`, `SetEnumerationValue`, passing `AttributeValueKey`, `FilterComparisonOperator`, and value).
- Association bindings: `CreateSelectObjectForAssociation` and `EditTestStepAssociation`.
- Microflow parameters: `EditMicroflowParameterValue` (literals) and `EditMicroflowObjectParameter` (piped object variables).
- Assertions configuration: Call typed comparison setters. Use PLURAL `"Equals"` for `EditAssertMicroflowReturnValueCompare`, `EditAssertObjectCount`, `EditAssertValidationFeedbackMessageCompare`, and `EditAssertValidationFeedbackMessageCount`; use singular `"Equal"` for `EditAssertAttributeValueCompare` and `EditAttributeValueFilter`.
- Step descriptions & pattern annotations: `EditTestStep(EditAction="SetDescription")` with `[Pattern: <Name> - <Rationale>]` (`PAT-12`).
- Step execution settings: `EditTestStep` with `ExecutionCondition` (`"Always"`, `"Skip"`, `"None"`) and `ResumeExecutionAfterException` (`"_Continue"`, `"Stop"` — note: `"Stop"` has NO leading underscore).

> **Strict 4-Step Partial Failure Handling:** Because MTA MCP tools do not support server-side atomic transactions, if an individual call fails within a batch, do NOT abort the build or discard earlier steps. Follow the 4-step recovery flow:
> 1. *Halt:* Stop executing subsequent batches immediately upon any tool error.
> 2. *Isolate:* Parse the MCP error response to extract the specific failed key (`TestStepKey`, `AttributeValueKey`, or `TestCaseVariationKey`) and the failing parameter.
> 3. *Surgically Correct:* Re-run only that specific failed setter tool with corrected arguments.
> 4. *Verify & Resume:* Confirm step integrity via `GetTeststepDetails(TestStepKey)` or `GetTestCaseDetails(TestCaseKey)` before resuming the remaining batches.

---

### Phase 3: Upfront Variation Registration (`Temp State: VARIATION_REGISTRATION`)
1. Enable variations on the test case: `AddTestCaseVariationItem(Action="EnableTestCaseDatavariation")`.
2. Concurrently dispatch **ALL** planned `AddTestCaseVariationItem` calls across all variation columns in safe batches (15-20 calls per turn).
   - *SSOT Lock:* Every variation item registered MUST match Section 7 of the approved Execution Plan 1:1. Zero unapproved additions or improvisations allowed (`ANTI-32`).

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
