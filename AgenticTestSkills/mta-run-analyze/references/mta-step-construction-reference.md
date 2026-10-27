# 📋 MTA Test Step Construction & Smoke Audit Reference (`STATE_CONSTRUCTION` & `STATE_SMOKE_AUDIT`)

This reference guide provides the complete technical specification for MTA Test Steps, Assertions, Frontend Generator Gates, the 5-Phase Layered Construction Protocol (`SKELETON_PROVISIONING`, `BATCH_INCLUSION`, `BATCH_BINDING`, `VARIATION_ALLOCATION`, `VARIATION_POPULATION`), Two-Tier Non-Destructive Step Recovery, and the 4-Phase Deterministic Smoke Audit (`AUDIT_VERIFICATION`).

---

## ⚡ Critical Boundary Rules (Golden Guardrails)

> [!IMPORTANT]
> ### 🚫 Guardrail 1: Step Lifecycle, Predecessor Chaining & Object Actions
> * **Step Lifecycle Management:** Create and configure test steps using `CreateObjectActionTestStep`, `CreateMicroflowCallTestStep`, `GenerateMicroflowCallTestStepLocatePage`, or `GenerateMicroflowCallTestStepLocateWidget`.
> * **3-Tier Predecessor Forward Chaining (`PAT-11`, `PAT-15`, `ANTI-44`):** MTA APIs default to prepending at Position 1 when `*BeforeKey = 0`. Always forward-chain `SetSequenceOfTestSuite`, `CreateTestCase(TestCaseBeforeKey)`, and `Create*TestStep(TestStepBeforeKey)` (`0` for item 1, `Item(N-1)Key` for item $N$). Parallel `SetSequenceOfTestStep` or `SetSequenceOfTestCase` calls are strictly prohibited (`ANTI-44`).
> * **Direct Initialization on Create Object Law (`PAT-06`, `ANTI-01`):** ALL initial attribute values and associations MUST be configured directly on `CreateObject` using `EditAttributeValue` and `CreateSelectObjectForAssociation` + `EditTestStepAssociation` (with `SOFA` bound on the owner entity per `ANTI-52`). Creating a consecutive `ChangeObjects` step is prohibited.

> [!IMPORTANT]
> ### 🚫 Guardrail 2: Mandatory Frontend Step Construction Gates (`PAT-64`, `PAT-119`, `ANTI-20`, `ANTI-79`)
> * **Closed Catalog (`PAT-05`, `PAT-64`, `ANTI-12`):** Drive UI interactions exclusively via `MenditectMxFrontendTestKit`.
> * **Generator Tools Mandate (`ANTI-79`):** Always call `GenerateMicroflowCallTestStepLocatePage` (passing clean `PageClassName = '<PageName>'`, never raw CSS `.mx-name-*`) for `Locate_MxPage`, and `GenerateMicroflowCallTestStepLocateWidget` for standard widgets. If a generator tool returns an error, **HALT** and ask the user—never fall back to `CreateMicroflowCallTestStep` for page or standard widget locators.
> * **Sub-Element Validation Message Exception (`PAT-119`, `ANTI-74`):** Only `Locate_MxWidget_[Widgetname]_ValidationMessage` sub-elements use `CreateMicroflowCallTestStep`, placed strictly after the UI event that triggers validation (`onChange` on leave/delay, `onEnterPress`, or submit button click), paired with `ASR_Is_Hidden_MxLocator` / `ASR_Is_Visible_MxLocator`, and annotated with a non-empty `TestStepDescription` (`PAT-12`).
> * **Playwright Defaults (`PAT-50`, `PAT-116`, `ANTI-65`):** Keep `LocalStartOptions.SlowMo` at `0 ms` / omitted by default (`PAT-116`, `ANTI-65`) and honor the user-confirmed Playwright conflict resolution (Option 1 Inherit, Option 2 Override, Option 3 New 3-Case Block per `PAT-50`).

---

## 🛠️ MTA Test Step Payloads & APIs (51-Tool MTA-ACCP)

### 1. Object Action Steps (`CreateObjectActionTestStep`)

| Step Type | `ObjectAction` Enum | Associated Configuration Tools | Core Validation / Behavior |
| :--- | :--- | :--- | :--- |
| **Create Object** | `"CreateObject"` | `EditAttributeValue`, `CreateSelectObjectForAssociation`, `EditTestStepAssociation` | Instantiates an entity in memory. Set all initial attributes and associations directly on this step (`PAT-06`). |
| **Change Object** | `"ChangeObjects"` | `SetTestStepOutputForSelectObjectForChange`, `EditAttributeValue` | Modifies attributes of an existing retrieved or created object (`PAT-80`). |
| **Retrieve Object** | `"RetrieveObjects"` | `EditTestStepRetrieve`, `EditAttributeValue`, `EditAttributeValueFilter` | Retrieves objects from database or teststep output (`OactRetrieveOption`). Include attributes via `EditAttributeValue`; configure filter values/ranges via `EditAttributeValueFilter` (`PAT-07`). |
| **Delete Object** | `"DeleteObjects"` | `SetTestStepOutputForSelectObjectForDelete` | Marks target objects for deletion (`PAT-80`, `PAT-95`). |
| **Persist** | `"Persist"` | *(Position chronologically after write/delete steps)* | Commits all uncommitted in-memory object changes to the database (`PAT-21`, `PAT-91`, `PAT-92`). |

### 2. Microflow Call Steps

| Step Type | MCP Creator Tool | Parameter & Value Configuration Tools | Core Validation / Behavior |
| :--- | :--- | :--- | :--- |
| **Microflow Call** | `CreateMicroflowCallTestStep` | `EditMicroflowObjectParameter`, `EditMicroflowParameterValue` | Executes a Mendix microflow (`ACT_*`, `ASR_*`, lifecycle, or backend microflow). Return values, exceptions, and side-effects can be asserted. |
| **Locate Page Step** | `GenerateMicroflowCallTestStepLocatePage` | Automated page context generation | Generates a frontend locator step for a Mendix page (`PageClassName = '<Page>'`, `ANTI-79`). |
| **Locate Widget Step** | `GenerateMicroflowCallTestStepLocateWidget` | Automated widget context generation | Generates a frontend locator step for a standard Mendix widget (`ANTI-79`). |

### 3. TestCase Container & Step Execution Settings (`EditTestCase` / `EditTestStep`)

| Target | Desired Setting | `EditAction` | Argument Name | Value Format & Rule |
| :--- | :--- | :--- | :--- | :--- |
| `EditTestCase` | Set Rollback | `"SetRollbackTestCaseAfterExecution"` | `RollbackTcseAfterExecution` | `"Yes"` (Backend unit tests) or `"No"` (Frontend 3-case suites & Live Data Seeding) |
| `EditTestCase` | Set Security | `"SetApplySecurity"` | `ApplySecurity` | `"Yes"` or `"No"` |
| `EditTestCase` | Set Delay | `"SetExecutionDelayInMilliseconds"` | `ExecutionDelayInMilliSeconds` | Number (ms) |
| `EditTestCase` | Exception Mode | `"SetResumeExecutionAfterException"` | `ResumeExecutionAfterException` | `"_Continue"` or `"Stop"` |
| `EditTestStep` | Step Condition | `"SetExecutionCondition"` | `ExecutionCondition` | `"Always"` (Frontend Setup/Teardown `PAT-18`), `"None"` (Backend/Seeding `PAT-17`, `ANTI-07`), or `"Skip"` (Decommissioned `[TO DELETE]` steps `PAT-115`) |
| `EditTestStep` | Step Resume Mode | `"SetResumeExecutionAfterException"` | `ResumeExecutionAfterException` | `"_Continue"` (Frontend Setup/Teardown `PAT-18`) or `"Stop"` (Backend/Seeding `PAT-17`) |

---

## 🔍 Assertions Reference (`PAT-08`, `PAT-14`, `ANTI-10`)

Attach all assertions as embedded children on the target `RetrieveObjects` or `MicroflowCall` step (`PAT-14`, `ANTI-10`):

1. **Attribute Compare (`CreateAssertAttributeValueCompare`):**
   * Resolve `AssertAttributeValueCompareKey` via single `GetTestCaseDetails` Mid-Phase Bulk Sync (`PAT-117`, `ANTI-39`).
   * Bind via `EditAssertAttributeValueCompare` (`ComparisonOperator`: `"Equal"`, `"NotEqual"`, `"GreaterThan"`, `"LessThan"`, `"Contains"`, etc.; `EditAction`: `"SetStringValue"`, `"SetIntegerValue"`, `"SetLongValue"`, `"SetDecimalValue"`, `"SetBooleanValue"`, `"SetDateTimeValueWithCurrentDateTime"`, etc.).
   * Data Variation: `AddTestCaseVariationItem(Action="AddAssertAttributeValueCompareTestCaseVariationItem", ObjectKey=AssertAttributeValueCompareKey)`.
2. **Exception Assertion (`CreateAssertException`):**
   * Bind via `EditAssertException` (`EditAction="SetExpectedResult"`, `ExpectedResult="RaisedException"` or `"NoException"`; `EditAction="SetComparisonString"`, `ComparisonString="..."`).
   * Data Variation: `AddTestCaseVariationItem(Action="AddAssertExceptionTestCaseVariationItem", ObjectKey=AssertExceptionKey)`.
3. **Object Count Assertion (`CreateAssertObjectCount`, `PAT-08`):**
   * Bind via `EditAssertObjectCount` (`EditAction="SetExpectedObjectCount"`, `ExpectedObjectCount=1`; `EditAction="SetComparisonOperator"`, `ComparisonOperator="Equals"`, `"Greater_than"`, `"GreaterThanEqualTo"`, `"Less_than"`, `"LessThanEqualTo"`).
   * Data Variation: `AddTestCaseVariationItem(Action="AddAssertObjectCountTestCaseVariationItem", ObjectKey=AssertObjectCountKey)`.
4. **Microflow Return Value Assertion (`CreateAssertMicroflowReturnValue`):**
   * **Operator Asymmetry:** `CreateAssertMicroflowReturnValue` requires plural PascalCase (`"Equals"`, `"NotEquals"`, `"GreaterThan"`, `"GreaterThanOrEqual"`, `"LessThan"`, `"LessThanOrEqual"`, `"Contains"`, `"NotContains"`, `"StartsWith"`, `"EndsWith"`), whereas `EditAssertMicroflowReturnValueCompare` strictly requires singular PascalCase (`"Equal"`, `"NotEqual"`, etc.).
   * Data Variation: `AddTestCaseVariationItem(Action="AddAssertMicroflowReturnValueCompareTestCaseVariationItem", ObjectKey=AssertMicroflowReturnValueCompareKey)`.
5. **Validation Feedback Message Assertions (Backend Test Case Level, `PAT-10`):**
   * `CreateAssertValidationFeedbackMessageCompare` + `EditAssertValidationFeedbackMessageCompare` (operators: plural `"Equals"`, `"NotEquals"`, `"Contains"`, `"NotContains"`).
   * `CreateAssertValidationFeedbackMessageCount` + `EditAssertValidationFeedbackMessageCount` (operators: plural `"Equals"`, `"Greater_than"`, `"GreaterThanEqualTo"`, `"Less_than"`, `"LessThanEqualTo"`).

---

## 🔄 5-Phase Layered Construction Protocol (`STATE_CONSTRUCTION`)

### Step 0: Pre-Construction Governance, Drift & Server Check (`PAT-35`, `PAT-36`, `PAT-43`, `PAT-44`, `PAT-82`, `PAT-89`, `PAT-95`, `PAT-106`, `PAT-118`, `PAT-123`, `PAT-124`, `ANTI-36`, `ANTI-56`, `ANTI-80`)
1. Run `node tools/mta-lint.mjs pre-build "${execution_plans_dir}/EP_<TestCaseName>.md"` to verify:
   * `status === "APPROVED"` and `approved_by != null` in a prior turn (`SAME_TURN_APPROVAL_BLOCKED`).
   * `.mta-gate-ledger.json` contains both Phase 1 (`DRAFT_LINTED` / `AUTO_APPROVED_EXEC`) and Phase 2 (`PLACEMENT_STAGED`) receipts.
   * `target_configuration_key > 0` and `target_suite_key > 0` (or `"NEW_SUITE"` when creating a new suite).
   * For `category: "Frontend"`, `playwright_browser`, `playwright_execution_mode`, `playwright_slow_mo_ms`, and `frontend_options_confirmed_by_user: true` are populated.
2. When promoting an offline draft (`PAT-89`), archive v1 to `${execution_plans_dir}/archive/` and increment `revision`. When promoting a locked bug reproduction plan (`PAT-124`) where Section 3 wiring was updated for `PAT-123` suite reuse, run `node tools/mta-lint.mjs lock <plan.md> --reseal-wiring` before `pre-build`.
3. Bypass `GetAppModelData` if transitioning directly from `STATE_BUILD_PLANNING` where Check 14 passed; run `GetAppModelData` only on cold session restore or post-outage promotion. Intercept 401/403/connection errors with the `PAT-95` Sanitized Layered Return Message.

### Phase 1: `SKELETON_PROVISIONING` (`PAT-03`, `PAT-11`, `PAT-47`, `PAT-79`, `ANTI-44`, `ANTI-79`)
* Create or select the target Test Suite (`CreateTestSuite`, `SetSequenceOfTestSuite`) and immediately backfill `"NEW_SUITE"` with the numeric `target_suite_key > 0` in `EP_*.md` and `mta_state.json` (`PAT-47`).
* For 3-Case Frontend suites (`PAT-03`), execute the **Option 3B Case-by-Case Loop** ($i = 1..M$): complete Phase 1 -> Phase 2A (`BATCH_INCLUSION`) -> Single `GetTestCaseDetails` Sync (`PAT-117`) -> Phase 2B (`BATCH_BINDING`) for Case 1 (`Setup`) before starting Case 2 (`Action`), so upstream `TestStepOutputKey` handles are resolved in memory.
* Create steps sequentially in forward order (`TestStepBeforeKey = 0` for Step 1, `Step(N-1)Key` for Step $N$).

### Phase 2A: `BATCH_INCLUSION` & Mid-Phase Bulk Sync (`PAT-08`, `PAT-14`, `PAT-117`, `ANTI-10`, `ANTI-32`, `ANTI-39`)
* Concurrently dispatch all `EditAttributeValue(IncludeAttribute)`, `EditTestStepRetrieve(SetRetrieveOption)`, `CreateAssert*` (Field 6 embedded assertions), and `AddTestCaseVariationItem(EnableTestCaseDatavariation)` (when Scenarios $\ge 2$) in batches of 15–20 calls per turn (`ANTI-32`).
* **Mid-Phase Bulk Sync (`PAT-117`, `ANTI-39`):** Call `GetTestCaseDetails(TestCaseKey)` **EXACTLY ONCE** at the end of `BATCH_INCLUSION` to retrieve all generated `AttributeValueKey`, `TestStepOutputKey`, `SelectObjectForRetrieveKey`, and `Assert*Key` handles in a single round-trip. Never call `GetTeststepDetails` in a loop across steps (`ANTI-39`).

### Phase 2B: `BATCH_BINDING` (`PAT-06`, `PAT-07`, `PAT-12`, `PAT-17`, `PAT-18`, `PAT-48`, `PAT-49`, `PAT-53`, `PAT-92`, `PAT-110`, `PAT-119`, `ANTI-32`, `ANTI-52`, `ANTI-59`)
* Concurrently bind all initial and filter values (`EditAttributeValue`, `EditAttributeValueFilter` respecting domain string lengths `PAT-53`), associations (`CreateSelectObjectForAssociation` + `EditTestStepAssociation` on the owner entity `ANTI-52`), microflow parameters (`EditMicroflowParameterValue`, `EditMicroflowObjectParameter`), assertion operators/values (`EditAssert*`), execution settings (`EditTestStep`), pattern descriptions (`PAT-12`, `PAT-119`), and 1:1 Section 4 variation items (`AddTestCaseVariationItem` per `PAT-110`, `ANTI-59`) in batches of 15–20 calls per turn.
* **4-Step Partial Batch Failure Recovery (`PAT-49`):** If a setter call in a batch fails: (1) Halt subsequent batches, (2) Isolate the failed key/parameter from the MCP error, (3) Surgically re-run only the failed setter (max 1 retry before halting for schema drift), and (4) Verify via `GetTeststepDetails`/`GetTestCaseDetails` before resuming.
* **Two-Tier Non-Destructive Step Recovery (`PAT-115`, `ANTI-64`):** Prefer Tier 1 non-destructive `ExcludeAttribute` or setter overwrite. If a step is hard-locked (Tier 2, max 1 step per container), set `ExecutionCondition = "Skip"`, `Highlight = "_True"`, prefix `[TO DELETE]` to `TestStepName`, annotate `[Pattern: PAT-DEPRECATE-STEP (PAT-115) ...]`, insert the replacement step via `TestStepBeforeKey`, and include the Manual Cleanup Recommendation box (`ANTI-64`).

### Phase 3: `VARIATION_ALLOCATION` (`PAT-77`, `PAT-86`, `PAT-87`, `ANTI-31`, `ANTI-77`)
* When Scenarios $\ge 2$, verify `TCVI_TestCaseVariationItems.length == plannedItems.length`.
* Concurrently dispatch all `CreateTestCaseVariation` calls for Scenarios $2..N$ in a single turn (`PAT-86`, `ANTI-77`), persist `Name` (`VAR_01_...`) and non-empty `Description` on all scenario columns `#1..#N` via `EditTestCaseVariation` (`PAT-77`, `ANTI-31`), and capture a single `GetTestCaseDetails` snapshot (`PAT-87`).

### Phase 4: `VARIATION_POPULATION` (`PAT-54`, `PAT-102`, `ANTI-11`, `ANTI-32`, `ANTI-77`)
* Emit the compact CoT key map (`Scenario #K [VarKey]: { Target: ItemKey }`) and reconcile every $(i, j)$ cell across all columns in batches of 15–20 calls per turn (`PAT-54`, `ANTI-11`, `ANTI-32`, `ANTI-77`).
* Omit setter calls on cloned empty/NULL cells (`PAT-102`) or bind `'NON'`/`'NONE'` sentinels (`PAT-07`).

---

## 🔍 Phase 5: Native 4-Phase Deterministic Smoke Audit (`STATE_SMOKE_AUDIT` / `AUDIT_VERIFICATION`)

Before transitioning to `STATE_RUN_ANALYZE`, execute the **5-Point Semantic Audit** and the **4-Phase Deterministic Smoke Audit** (`PAT-59`, `PAT-80`, `PAT-88`, `PAT-107`, `ANTI-57`):

1. **5-Point Semantic Audit Checklist:**
   * **Point 1 (`OactRetrieveOption` & `SOFR`):** Retrieve-from-teststep steps have `OactRetrieveOption == "Teststep"` and `SelectObjectForRetrieve` bound to the upstream `TestStepOutputKey` (`PAT-07`, `PAT-80`).
   * **Point 2 (`ATVL` Filters):** Retrieve steps have `Equal` filter values bound on the target filter attribute (`PAT-07`).
   * **Point 3 (`SOFA` Owner Associations):** Associations are bound on the owning entity step (`PAT-06`, `ANTI-52`).
   * **Point 4 (`TCVI` Parity):** `TCVI_TestCaseVariationItems` count and targets match Section 4 rows 1:1 (`PAT-19`, `PAT-78`, `PAT-110`).
   * **Point 5 (`TCVA` Cell Parity):** Every $(i, j)$ cell in `TCVA_TestCaseVariationValues` matches Section 4 (`PAT-102`, `PAT-107`, `ANTI-57`).
2. **Automated CLI Audit Execution:**
   * Call `GetTestCaseDetails(TestCaseKey)` (1 case per turn for multi-case suites) and save the **verbatim, unmodified** JSON response to `scratch/server_case_<Key1>.json`.
   * Run:
     ```bash
     node tools/mta-lint.mjs audit "${execution_plans_dir}/EP_<TestCaseName>.md" "scratch/server_case_<Key1>.json" ["scratch/server_case_<Key2>.json" ...]
     ```
   * Verifies: **Phase 1** Step Ledger Reconciliation (`INCOMPLETE_BUILD_DISCREPANCY`), **Phase 2** Variation Item Registration (`MISSING_DATA_VARIATION_DISCREPANCY`), **Phase 3** Scenario Metadata & Descriptions (`MISSING_DATA_VARIATION_METADATA`, `PAT-77`, `ANTI-31`), and **Phase 4** $M \times N$ Cell Parity & `TCER_TestConstructionErrors == 0` (`CELL_VALUE_PARITY_DISCREPANCY`).
3. **Post-Build Receipt & 2-Cycle Circuit Breaker (`PAT-46`, `PAT-88`):**
   * On 0 discrepancies, update `EP_<TestCaseName>.md` (`status: "BUILT_AND_VERIFIED"`, `build_started_at`, `built_at`, `verified_at`, `target_configuration_key`, `target_suite_key`, `test_case_keys`), populate Section 6 with the 4 audit tables, sync `mta_state.json`, and output the Smoke Audit Summary with clickable MTA web links (`[MtaBaseUrl]/p/[ObjectType]/[Key]`, `PAT-46`).
   * Allow at most 2 rollback repair cycles to `STATE_CONSTRUCTION`. If the 2nd cycle fails, **HALT** and present the 3-choice Circuit Breaker: (1) *Revise Execution Plan* (`PLAN_STEP_1B`), (2) *Targeted Manual Construction Fix* (`BATCH_INCLUSION`/`BATCH_BINDING`), or (3) *Retain Draft & Abort Build*.
