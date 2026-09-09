# MTA Data Variations Master Guide
**📍 You are here:** `references/data-variations.md` | **🏠 Return to:** [MTA Core Skill](../SKILL.md)
*Metadata: Version 6.0 | Last Updated: 2026-09-02*

This reference defines the sequence, parameters, and naming rules for creating data-driven test scenarios (variations) in MTA using the consolidated 53-tool MTA-ACCP API (`/primitivetools/mcp`).

> [!TIP]
> **⚡ SPEED OPTIMIZATION: Headless Backend Case for Frontend Variations**
> If you have extensive data-driven variations (e.g., testing 5+ input validation or calculation scenarios on a form), do **NOT** run them all via browser screens. Doing so is extremely slow and fragile.
> Instead, create a separate **Backend Test Case** to execute those variations directly and headlessly via the underlying microflows. Keep the Frontend UI testcase restricted to a **single "Happy Path"** to verify widget rendering and wiring. (See [placement-and-lifecycle.md](placement-and-lifecycle.md) for full architecture and trade-offs).

---

## 👥 TERMINOLOGY: "TEMPLATE VARIATION" VS. "VARIATION #1"

To prevent any confusion between system-generated defaults and our logical test designs, make sure you understand the following terminology:
1. **Template Variation (System Default):** This is the baseline, default variation that is automatically created by the system when variations are enabled. It serves as the container for all standard steps and their base settings.
2. **Variation #1 (Logical Primary Scenario):** This is our human-designed label for the primary scenario in the spec table. In the MTA system, **Variation #1 corresponds directly to the Template Variation itself**. Therefore, you do NOT duplicate a new variation for "Scenario #1 / Variation #1". Any setters/overrides you apply to the base/template keys directly update the primary scenario. You call `CreateTestCaseVariation` or `CreateTestSuiteVariation` for downstream scenarios (e.g., Scenario #2, Scenario #3, etc.).

---

## 🔒 SESSION ISOLATION ARCHITECTURE: PERSISTENT MTA RUNS VS. EXPLORATORY TESTING

Understanding how MTA executes data variations across execution modes is critical for state management:

1. **Persistent MTA Execution (`ExecuteTest` / MTA Platform):**
   * **Independent Sessions Per Variation:** When running persistent test cases with data variations on the MTA platform, **each test case data variation runs in its own independent session**.
   * Runtime state, in-memory objects, and transaction contexts are completely isolated per variation.
   * There is zero risk of state leakage between variations: Scenario #1's records or mutations cannot pollute Scenario #2.
2. **Local Exploratory Execution (`MTA_plugin.execute-testcase` / Option A):**
   * **Chained Single-Payload Optimization (`PAT-73`, `PAT-74`):** When you combine multiple data variations into **one single large JSON payload** (`TCEX_RQ_TestStepRun` array) to achieve sub-second execution (< 1s), all variation blocks in that single payload run sequentially within that **single, shared session/transaction**.
   * *The Chaining Constraint:* In this specific single-payload exploratory mode, uncleaned records or mutated state from `VAR_01` can collide with `VAR_02`. This is why `PAT-74` (Exploratory Single-Session Conflict Detection & Isolation) requires auditing for AST conflict vectors, using intra-block deletions, or disjoint synthetic keys.
   * *Individual Dispatch:* If exploratory variations are executed in separate individual tool calls, each dispatch runs in its own session.

---

## 🚨 MANDATORY VARIATION METADATA (NAME & DESCRIPTION) RULE (`PAT-77`)

To ensure that all data variations can be identified, understood, and audited in the MTA dashboard, you **MUST** configure both the Name and Description for **every single variation** you create (`PAT-77`), including the baseline Template Variation (Variation #1) and any created columns ($2..N$). Leaving variation descriptions empty or unpersisted is strictly prohibited (`ANTI-31`).

For **each** variation (both the template and duplicated ones):
1.  **Set Name:** Call `EditTestCaseVariation(TestCaseVariationKey, EditAction="SetName", Name=...)`.
    *   *Format:* Lowercase alphanumeric with hyphens (e.g. `"standard-case"`, `"invalid-age-negative"`).
2.  **Set Description (MANDATORY - DO NOT FORGET):** Call `EditTestCaseVariation(TestCaseVariationKey, EditAction="SetDescription", Description=...)`.
    *   *Requirement:* Provide a complete, clear, and professional description explaining the exact functional scenario, inputs, and expected outcomes verified by this variation (e.g., `"Verifies that a registration with age 17 fails with validation error."`).

This metadata is **mandatory for all workflows**. Failing to set names and descriptions for all variations is a severe quality violation (`ANTI-31`).

---

## 🏗️ DATA VARIATIONS CONSTRUCTION PROTOCOL (PAT-54, PAT-78, PAT-85, PAT-86, PAT-87, ANTI-32, ANTI-40)

With the 53-tool primitive API, calling `CreateTestCaseVariation` duplicates the column structure with **empty item values** instead of duplicating previous values (`ANTI-11`). To maximize build efficiency and eliminate conversational latency, the construction protocol operates across 4 horizontal sub-phases:

> [!IMPORTANT]
> **Zero Disconnect SSOT Invariant (`ANTI-32`):** The variation items registered via `AddTestCaseVariationItem` **MUST strictly match** Section 7 of the approved Execution Plan. You are **strictly prohibited** from improvising or adding any attribute, parameter, retrieve filter, or assertion to the variation matrix that is not explicitly declared as a variation item in Section 7 of the approved plan.

### Step 1: Baseline Variation Item Registration (1 Turn Batch Inclusion)
1. Build all baseline test steps and configure baseline properties/assertions (`Phase 1 & Phase 2`).
2. Enable variations via `AddTestCaseVariationItem` (`Action="EnableTestCaseDatavariation"`, `TestCaseKey=...`).
3. **⚡ Bulk Registration (`ANTI-32`):** Dispatch **ALL** planned item registration calls concurrently in safe chunks of 15 to 20 tool calls per turn using `AddTestCaseVariationItem` (strictly matching Section 7):
   * Attribute values: `Action="AddAttributeValueTestCaseVariationItem"`, `ObjectKey=AttributeValueKey`.
   * Microflow parameters: `Action="AddMicroflowParameterValueTestCaseVariationItem"`, `ObjectKey=MicroflowParameterValueKey`.
   * Attribute compare assertions: `Action="AddAssertAttributeValueCompareTestCaseVariationItem"`, `ObjectKey=AssertAttributeValueCompareKey`.
   * Return value assertions: `Action="AddAssertMicroflowReturnValueCompareTestCaseVariationItem"`, `ObjectKey=AssertMicroflowReturnValueCompareKey`.
   * Exception assertions: `Action="AddAssertExceptionTestCaseVariationItem"`, `ObjectKey=AssertExceptionKey`.
   * Object count assertions: `Action="AddAssertObjectCountTestCaseVariationItem"`, `ObjectKey=AssertObjectCountKey`.
4. Maintain an in-memory index dictionary mapping `ItemIndex -> {StepKey, Entity, AttributeOrAssertName, ItemType}` to prepare for deterministic key resolution.

### Step 2: Upfront Bulk Column Provisioning (`PAT-86`, `ANTI-40`)
1. **Concurrently Provision All Columns in 1 Turn:** Call `CreateTestCaseVariation(TestCaseKey)` for ALL remaining scenarios ($2..N$) in **1 single turn**.
   * *Anti-Pattern Prohibited (`ANTI-40`):* Do NOT create columns one-by-one or halt between columns to query keys or edit cells.
2. Immediately apply `PAT-77`: call `EditTestCaseVariation` with `EditAction="SetName"` and `EditAction="SetDescription"` for Variation #1 and all Variations $2..N$. Batch all name and description setters in safe chunks (max 15-20 per turn).

### Step 3: Single Matrix Schema Snapshot (`PAT-86`)
1. Call `GetTestCaseDetails(TestCaseKey)` **EXACTLY ONCE** after all columns #2..#N are provisioned.
2. This single call returns the complete, updated tree of all variation containers and their cloned item keys across the entire matrix.

### Step 4: Deterministic Cloned Cell Key Indexing (`PAT-87`)
1. When MTA clones variation items for a new column, the elements in `ATVL_AttributeValues`, `AOBC_AssertObjectCounts`, and `AMRC_AssertMcfwReturnValueCompares` strictly follow the **1-to-1 registration sequence** of `TCVI_TestCaseVariationItems`.
2. Correlate cloned keys in-memory by indexing them against the registered variation items list:
   * Item index $k$ on Scenario #1 directly corresponds to item index $k$ on Scenario #2, Scenario #3, etc.
   * Prohibit calling `GetTeststepDetails` or intermediate discovery endpoints to look up cloned cell keys (`PAT-87`, `ANTI-40`).

### Step 5: Safe Chunked Matrix Cell Population (`PAT-85`, `PAT-86`, `ANTI-32`)
1. Group all cell overrides across all variations ($2..N$) into safe batches of **15 to 20 tool calls per turn** (`ANTI-32`):
   * **Input Overrides:** Call `EditAttributeValue` (or `EditMicroflowParameterValue`).
   * **Assertion Overrides:** Call `EditAssert*` (`EditAssertMicroflowReturnValueCompare`, `EditAssertAttributeValueCompare`, `EditAssertObjectCount`, etc.).
   * **Empty / Null Values:** When a variation requires setting a cell to empty or NULL, pass `SetValueToEmpty = "_True"`.
   * **Cloned Object Count Invariant:** All cloned `AssertObjectCount` containers default to `ExpectedObjectCount: 0`. For any variation expecting $\ge 1$ objects, `EditAssertObjectCount(SetExpectedObjectCount)` MUST be explicitly called.
2. In case of any individual call error, isolate the failed setter and retry surgically without aborting the batch.

### Step 6: Post-Construction Smoke Audit (`STATE_SMOKE_AUDIT`)
1. Run `STATE_SMOKE_AUDIT` compiler verification via `GetTestCaseDetails`.
2. Verify exactly zero unfilled variation items exist across the entire scenario matrix.
3. **Zero Disconnect Verification:** Verify that zero unapproved variation items, attributes, filters, or assertions exist beyond what was declared in Section 7 and Section 5.

---

## 📅 DYNAMIC DATETIME OFFSET BINDING

For dates, use relative offsets to prevent test decay via `EditAttributeValue` or `EditMicroflowParameterValue`:
*   `EditAction = "SetDateTimeValueWithCurrentDateTimeWithOffset"`
*   Required parameters: `CurrentDateTimeOffsetDays`, `CurrentDateTimeOffsetHours`, `CurrentDateTimeOffsetMinutes`, etc.

---

## 🎯 EMPTY OBJECT PATTERN: QUICK DECISION GUIDE (`PAT-07`)

**Q: Do you need to conditionally pass null/empty objects to a microflow across variations?**

✅ **YES** ➔ You **MUST** use the **Empty Object Retrieve Pattern** with **Retrieve from Teststep**!

**Step-by-Step Recipe with the 53-Tool Primitive API:**
1. **Create Object Step:** Call `CreateObjectActionTestStep(ObjectAction="CreateObject")` for the base entity.
2. **Bind Initial Attributes:** Call `EditAttributeValue` to set the filtering attribute (e.g., `OrderNumber = "VALID_MATCH"`).
3. **Retrieve Object Step:** Call `CreateObjectActionTestStep(ObjectAction="RetrieveObjects")`.
4. **Link Retrieve to Teststep:** Call `EditTestStepRetrieve(TestStepKey, EditAction="SetRetrieveOption", RetrieveOption="Teststep")` and `EditTestStepRetrieve(TestStepKey, EditAction="SetTestStepForRetrieveByTeststep", TestStepOutputKey=Step1Key)` to bind it to Step 1's memory output.
5. **Set Retrieve Filter:** Call `EditAttributeValueFilter` to filter on the same attribute (`OrderNumber = "VALID_MATCH"`).
6. **Register Variation Item:** Call `AddTestCaseVariationItem` (`Action="AddAttributeValueTestCaseVariationItem"`, `ObjectKey=AttributeValueKey`) on the **Create Object step's attribute value**.
7. **Populate Variations:**
    *   **Valid scenario:** Set Create step attribute value to `"VALID_MATCH"`. (Object matches Retrieve filter, returns object).
    *   **Null/Empty scenario:** Set Create step attribute value to `"NON_EXISTENT"`. (Object fails Retrieve filter, memory returns null/empty).
8. **Bind Microflow Parameter:** Bind the microflow input parameter directly to the **Retrieve step output**, never the Create step.

❌ **NEVER** use `RetrieveOption = "Database"` for this pattern.
❌ **NEVER** bind a microflow parameter directly to a Create step when implementing the empty object pattern.

