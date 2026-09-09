# Standardized AI-Generated Execution Plan Blueprint

**📍 Location:** `references/execution-plan-template.md` | **🏠 Parent:** [MTA Test Design Skill](../../mta-test-design/SKILL.md) / [MTA Build Skill](../../mta-build/SKILL.md)  
*Patterns Enforced: `PAT-12`, `PAT-34`, `PAT-43`, `PAT-44`, `PAT-60`, `PAT-65`, `PAT-77`, `PAT-82`, `PAT-84`, `PAT-88`, `PAT-89`, `ANTI-31`, `ANTI-32`, `ANTI-36`, `ANTI-41`*

This document defines the canonical layout and schema for an approved MTA Execution Plan (`EP_<TestCaseName>.md`). Both `mta-test-design` (during plan generation) and `mta-build` (during pre-construction ingestion and post-construction smoke auditing) MUST adhere to this exact specification.

The document structure consists of:
- **Execution Plan Metadata** (collapsible metadata block, `PAT-44`)
- **Pre-Approval Quality Audit Banner & Checklist** (top-level audit banner, direct navigation links table post-build, and collapsible 14-point checklist, `PAT-82`)
- **Sections 1 through 8** (the core specification and test configuration sections, enclosed in outer collapsible containers)
- **Section 9: MTA Build & Smoke Verification Receipt** (post-construction receipt block appended upon verification, `PAT-88`)

---

<details><summary><b>Execution Plan Metadata</b></summary>

```yaml
plan_id: "TC_CreateOrder-v1"
schema_version: "1.2.0"
supersedes_plan_id: null
revision: 1
status: "APPROVED"
approved_at: "2026-09-09T12:00:00Z"
approved_by: "marku"
approver_system_user: "marku"
built_at: null
builder_system_user: null
verified_at: null
verifier_system_user: null
target_configuration_key: null
target_suite_key: null
test_case_keys: []
```

</details>

# MTA EXECUTION PLAN SIGN-OFF

> [!NOTE]
> **Pre-Approval Quality Audit:** 14/14 checks executed (100% compliant)  
> **MTA Server Model Check:** Verified (All planned microflows, entities, and attributes exist in the MTA server)  
> **Category:** [Backend | Frontend]  
> *(Upon Smoke Audit completion, the following lines are appended directly without an empty line:)*  
> **Post-Construction Build & Smoke Audit:** `BUILT_AND_VERIFIED` (0 Discrepancies)  
> **Built By:** `[builder_system_user]` at `[built_at]` | **Verified By:** `[verifier_system_user]` at `[verified_at]`

### Direct MTA Web Navigation Links
*(Appended immediately beneath the top note upon successful smoke verification)*
| MTA Asset Type | Asset Name | Database Key | Direct MTA Web Link |
| :--- | :--- | :---: | :--- |
| **Test Configuration** | `[ConfigName]` | `[ConfigKey]` | [Open Configuration]([MtaBaseUrl]/p/testconfiguration/[ConfigKey]) |
| **Test Suite** | `[SuiteName]` | `[SuiteKey]` | [Open Suite]([MtaBaseUrl]/p/testsuite/[SuiteKey]) |
| **Test Case** | `[TestCaseName]` | `[TestCaseKey]` | [Open Test Case]([MtaBaseUrl]/p/testcase/[TestCaseKey]) |

<details>
<summary><b>Pre-Approval Quality Checklist (14 of 14 Checks Executed)</b></summary>

| # | Check Name | Rule Citation | Scope & Compliance Verification | Status |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **Frontend Split Law** | `PAT-18`, `PAT-03` | Verifies Case 1 Setup (`_Always`), Case 2 Execute, Case 3 Teardown (`_Always`) | `PASS` / `NA` |
| **2** | **TestCase Container Formatting & Execution User** | `PAT-11`, `PAT-10`, `PAT-79` | Rollback & Validation Feedback at TestCase level; `EXUS_ExecutionUser` explicitly assigned | `PASS` |
| **3** | **Backend-First Direct Piping Deletes** | `PAT-20`, `PAT-16` | Backend-created objects deleted via direct handle piping without redundant retrieves | `PASS` / `NA` |
| **4** | **Setup Portability** | `PAT-28`, `PAT-41` | Relative logical launch paths used (`/index.html`) rather than absolute host URLs | `PASS` / `NA` |
| **5** | **Explicit Filter Attributes, Input Handles & Variation Matrix** | `PAT-07`, `PAT-19`, `PAT-27`, `PAT-54`, `PAT-77`, `ANTI-08`, `ANTI-11`, `ANTI-31` | Retrieve handles specified; NULL variations use explicit attribute filters; max 8 cols; variation names and descriptions defined (`PAT-77`, `ANTI-31`) | `PASS` |
| **6** | **Embedded Step Assertions & Output Object Count** | `PAT-08`, `PAT-06`, `ANTI-03` | Assert Object Count / Value compares embedded in producer steps; no standalone steps | `PASS` |
| **7** | **Mandatory Page & Widget Discovery** | `PAT-35`, `PAT-67`, `ANTI-23` | `GetAppModelData` (Pages/Widgets) or `DESCRIBE PAGE/SNIPPET/ENTITY` executed; exhaustive widget inventory | `PASS` / `NA` |
| **8** | **Uniform 8-Field Step Sequence Schema** | `PAT-12`, `PAT-34` | All test steps strictly adhere to uniform 8-field schema in exact field order | `PASS` |
| **9** | **Frontend Execution Plan Quality Protocol** | `PAT-41`..`PAT-53`, `PAT-67`, `ANTI-23` | 8-point frontend verification (seed data, multiple seed items, navigation, scalar piping) | `PASS` / `NA` |
| **10** | **Dual-Track Execution Strategy Explicit Declaration** | `PAT-60`, `PAT-62` | Option A vs Option B declared for Backend; Option B Persistent MTA declared for Frontend | `PASS` |
| **11** | **Backend Exploratory Single-Payload Plan Blueprint** | `PAT-63`, `PAT-75`, `ANTI-29` | Verifies Backend exploratory flow with complete JSON blueprint, ExecutorUsername default, and verified domain attributes (`PAT-75`) | `PASS` / `NA` |
| **12** | **Frontend UI to Backend Microflow Substitution Prohibition** | `ANTI-20` | Verifies UI actions drive browser via TestKit microflows, not domain microflows | `PASS` / `NA` |
| **13** | **Closed Catalog Frontend Testkit Verification** | `PAT-64`, `ANTI-21` | All Frontend steps strictly use verified microflows from closed catalogs | `PASS` / `NA` |
| **14** | **MTA Server Model Check** | `PAT-82`, `ANTI-36` | Plan drafted at local model level (`mxcli`). Parity audit via `GetAppModelData` verifies all planned microflows, entities, and attributes exist in the MTA server. If mismatch/stale: Option B is blocked, and plan is restricted to Option A (Exploratory Testing Only) | `PASS` |

</details>

<details>
<summary><b>1. State Compaction & Target Placement</b></summary>

### MTA STATE COMPACTION BLOCK (SESSION RESTORE)
<!-- Copy and paste this block into a new chat session to instantly restore your conversational state. -->
```json
{
  "MtaState": "[STATE_CONSTRUCTION for Option B | STATE_RUN_ANALYZE for Option A]",
  "TempState": "[SKELETON_PROVISIONING for Option B | STATE_EXPLORATORY_EXECUTION for Option A]",
  "TargetConfig": "[UserSelectedTestConfig for Option B | null for Option A]",
  "TargetSuite": "[UserSelectedTestSuite for Option B | null for Option A]",
  "TestCase": "[UserSelectedTestCaseName]",
  "Category": "[Backend | Frontend]",
  "MtaBaseUrl": "[RetrievedUrl]",
  "ExecutionPlanFile": "[Path to local .md file for Option B | null for Option A]",
  "ExecutionPlanKey": null,
  "Context": "[Execution Plan approved for Components Under Test | Backend Exploratory Plan ready for in-memory execution]"
}
```

*   **Target Application:** `[AppName]`
*   **Execution Strategy / Target Mode:** `[Option A: Local Exploratory Test (MTA_plugin - Fast In-Memory Feedback) | Option B: Direct Persistent MTA Test (MTA Server - Full Placement & CI/CD)]`
*   **Target Configuration:** `[UserSelectedTestConfig | Pending Checkpoint 2 for Option B | Bypassed for Option A]`
*   **Target Suite:** `[UserSelectedTestSuite | Pending Checkpoint 2 for Option B | Bypassed for Option A]`
*   **Test Case Name:** `[UserSelectedTestCaseName]`
*   **MTA Category:** `[Backend | Frontend]`
*   **Execution User (`EXUS_ExecutionUser`):** `[UserSelectedExecutionUser, e.g., MxAdmin | Pending Checkpoint 2 for Option B | Bypassed for Option A]`

</details>

<details>
<summary><b>2. Prompt & Input Log vs. MTA Skill Conflicts (MANDATORY)</b></summary>

*(Explicitly audits the user prompt or raw input log against official MTA Skill Laws. Any conflicts, anti-patterns, or sub-optimal patterns in the user prompt/input are highlighted alongside their automatic skill corrections).*

| # | User Prompt / Input Payload Element | MTA Skill Law Violation | Applied Automatic Correction |
| :-: | :--- | :--- | :--- |
| **1** | `[Specify element from prompt/JSON log]` | `[Specify exact MTA Skill Law violated]` | `[Specify how the Execution Plan automatically corrected it]` |

*(If no conflicts exist between the user prompt/input and MTA Skill Laws, state explicitly: "No conflicts detected. The prompt and input requirements align 100% with official MTA Skill Laws.")*

</details>

<details>
<summary><b>3. Test Case Scope & Dual-Risk Profile</b></summary>

### Functional Specification Profile
| Specification Property | Detail / Value |
| :--- | :--- |
| **Test Case Identifier** | `[ModuleName].TC_[Unit/Int/UI]_[ElementName]_[Scenario]` |
| **Primary Objective** | `[Clear statement of what the test case verifies and what risk it mitigates]` |
| **Preconditions** | `[Prerequisites, environmental state, or seeded data required prior to execution]` |
| **Expected Result** | `[Clear description of expected outcomes, return values, and assertions]` |
| **Authentication Scope** | `[NA (Backend) | With Login (username/password) | Without Login (Anonymous)]` |
| **Recommended MTF Level** | `[Unit Test (Backend) | Integration Test (Backend) | Functional UI Test (Frontend)]` |

### Dual-Risk Alignment & Mitigation Profile
| Risk Category | Evaluated Risk Profile & Severity | Applied Mitigation Strategy |
| :--- | :--- | :--- |
| **Technical Risk** | `[e.g., ACID & Database Integrity Violation]` *(Severity: High)* | `[e.g., In-memory execution with explicit rollback and atomic count verification]` |
| **Business Risk** | `[e.g., Calculation Accuracy & Financial Leakage]` *(Severity: Critical)* | `[e.g., Boundary value variation matrix validating strict decimal precision thresholds]` |

</details>

<details>
<summary><b>4. Verified Model Elements & Testability Profile</b></summary>

| Model Type | Component Name | Verified Attributes, Values & Roles |
| :--- | :--- | :--- |
| **Microflow** | `[ModuleName].[MicroflowName]` | `[Business logic summary, inputs -> outputs]` |
| **Entity** | `[ModuleName].[EntityName]` | `[Attribute1] (Type), [Attribute2] (Type), [Attribute3] (Enum: Val1, Val2)` |
| **Page** *(Frontend)* | `[ModuleName].[PageName]` | Page Key: `[PageKey]`, Layout Context: `[LayoutGrid / DataView]` |
| **Widget** *(Frontend)* | `[WidgetName]` | Type: `[Button / TextBox / DropDown]`, Action / Operator: `[ACT_Click / ELO_SetText]` |

</details>

<details>
<summary><b>5. Chronological Step Sequence Plan</b></summary>

### Test Case Container Settings: `[TestCaseName]`
*   **Rollback After Execution:** `RollbackTcseAfterExecution = Yes` (or `No`)
*   **Validation Feedback Assertions (Backend Microflow Tests Only):**
  *   *Compare Member:* `[Target Member, Operator, Comparison String (or NotEquals "__NO_VALIDATION_MESSAGE__" for happy paths)]`
  *   *Message Count:* `Equals 0` *(Happy Path)*

### Step Sequence Matrix

| Step # | Case | Step Type | Target Element / Action | Input Source | Output Handle | Exec Settings | Description & Pattern Rationale |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | Case 1 | `Create Object` | `[ModuleName].[EntityName]` | Memory | `[Step1_Output]` | `None` / `_Stop` | Direct Initialization on Create Object [^PAT-06] |
| **2** | Case 1 | `Retrieve Object` | `[ModuleName].[EntityName]` | Database | `[Step2_Retrieved]` | `None` / `_Stop` | Explicit Filter & Count Assertion [^PAT-07], [^PAT-08] |
| **3** | Case 1 | `Microflow Call` | `[ModuleName].[MicroflowName]` | `[Step1_Output]` | `[Step3_Result]` | `None` / `_Stop` | Business Process Execution & Assertion [^PAT-09] |
| **4** | Case 1 | `Delete Object & Persist` | `[Step1_Output]` | `[Step1_Output]` | `N/A` | `Always` / `_Continue` | Direct Piping Backend Delete [^PAT-20] |

### Detailed Step Configurations & Assertions

<details>
<summary><b>Step 1: Create Object ([ModuleName].[EntityName])</b></summary>

*   **1. Step Type:** `Create Object`
*   **2. Target / Action:** `[Fully qualified Entity Name, e.g. Billing.Customer]`
*   **3. Input Source / Handles:** `N/A (Memory instantiation)`
*   **4. Output Variable Handle:** `[Step1_Output]`
*   **5. Parameters & Initial Values:** `[Initial Attributes: Attribute = Value | Initial Associations: Association = Target Handle]`
*   **6. Embedded Step Assertions:** `None (Embedded assertions are strictly prohibited on Create Object steps)`
*   **7. Execution Settings:** `ExecutionCondition = "None"`, `ResumeExecutionAfterException = "_Stop"`
*   **8. Step Description & Rationale:** `[Pattern: Direct Initialization on Create Object [^PAT-06] - Sets initial attributes directly on creation]`

</details>

<details>
<summary><b>Step 2: Retrieve Object ([ModuleName].[EntityName])</b></summary>

*   **1. Step Type:** `Retrieve Object`
*   **2. Target / Action:** `[Entity Name] (Method: Database / Teststep / By Association | Range: First / All)`
*   **3. Input Source / Handles:** `[N/A for Database | Predecessor Handle for Teststep / Association]`
*   **4. Output Variable Handle:** `[Step2_Retrieved]`
*   **5. Parameters & Filters:** `[Filter Criteria: Explicit Attribute Name, Operator, Value / 'NON_EXISTENT']`
*   **6. Embedded Step Assertions:** `Assert Object Count == [Equals 1 (or N for lists)]`, `Assert Attribute Value: [Attribute Operator Value]`
*   **7. Execution Settings:** `ExecutionCondition = "None"`, `ResumeExecutionAfterException = "_Stop"`
*   **8. Step Description & Rationale:** `[Pattern: Explicit Attribute Filter Query & Count Assertion [^PAT-07], [^PAT-08]]`

</details>

<details>
<summary><b>Step 3: Microflow Call ([ModuleName].[MicroflowName])</b></summary>

*   **1. Step Type:** `Microflow Call`
*   **2. Target / Action:** `[Fully qualified Microflow Name]`
*   **3. Input Source / Handles:** `[Parameter = Source Handle / Value]`
*   **4. Output Variable Handle:** `[Step3_Result]` (if non-void)
*   **5. Parameters & Bindings:** `Pipe: [Step1_Output], [Step2_Retrieved]`
*   **6. Embedded Step Assertions:** `Assert Return Value == [Expected Return Value]`, `Assert Validation Feedback Count == 0`
*   **7. Execution Settings:** `ExecutionCondition = "None"`, `ResumeExecutionAfterException = "_Stop"`
*   **8. Step Description & Rationale:** `[Pattern: Business Process Execution & Direct Return Assertion [^PAT-09]]`

</details>

<details>
<summary><b>Step 4: Delete Object & Persist ([Step1_Output])</b></summary>

*   **1. Step Type:** `Delete Object & Persist`
*   **2. Target / Action:** `[Step1_Output] (Direct handle piping used for backend-created objects)`
*   **3. Input Source / Handles:** `[Step1_Output]`
*   **4. Output Variable Handle:** `N/A`
*   **5. Parameters & Bindings:** `None`
*   **6. Embedded Step Assertions:** `None`
*   **7. Execution Settings:** `ExecutionCondition = "Always"`, `ResumeExecutionAfterException = "_Continue"`
*   **8. Step Description & Rationale:** `[Pattern: Direct Piping Backend Delete [^PAT-20]]`

</details>

</details>

<details>
<summary><b>6. Playwright / Browser Settings</b></summary>

| Setting Key | Default / Selected Value | All Available Alternative Options |
| :--- | :--- | :--- |
| **1. Browser Environment** | `Locally` | `Playwright Server`, `Azure Workspaces` |
| **2. Browser Type** | `Chromium` | `Firefox`, `WebKit` |
| **3. Execution Mode** | `Headless` | `Headed` (Visual browser window) |
| **4. Viewport Dimensions** | `1280 x 720` | `1920 x 1080`, `1366 x 768`, `375 x 812` (Mobile), Custom |
| **5. Target Base URL / Path** | `http://localhost:8080/index.html` | Custom URL string or relative launch path |
| **6. Action Delay (SlowMo)** | `0 ms` (Server) / `100 ms` (Local) | Custom delay in milliseconds |
| **7. Default Timeout** | `30,000 ms` | `15,000 ms`, `60,000 ms`, Custom timeout in ms |
| **8. Tracing (Trace)** | `true` (Enabled) | `false` (Disabled) |
| **9. Browser Locale** | System Default (`en-US`) | `nl-NL`, `de-DE`, `fr-FR`, or valid BCP-47 tag |
| **10. Virtual Timezone ID** | System Default (`Europe/Amsterdam`) | `UTC`, `America/New_York`, `Asia/Tokyo`, or valid IANA ID |

*(For Backend tests, state: "NA (Backend Unit/Integration Test — executes in memory with zero browser overhead)")*

</details>

<details>
<summary><b>7. Data Variation Matrix & Metadata</b></summary>

> [!IMPORTANT]
> **Zero Disconnect SSOT Invariant:** Every attribute, parameter, retrieve filter, and assertion intended to be varied across scenarios **MUST be exhaustively declared** in the matrix rows below. In accordance with the Zero Disconnect Between Plan and Build Law, any attribute, parameter, or assertion NOT explicitly declared in this table is strictly prohibited from being registered as a variation item or varied during build time (`STATE_CONSTRUCTION`).

### Data Variation Matrix
#### Table 1: Scenarios #1 to #7 (Primary Scenarios)
| Attribute / Step | #1 (variation-name-1) | #2 (variation-name-2) | #3 (variation-name-3) |
| :--- | :--- | :--- | :--- |
| **`Entity.FilterAttribute`** | `'VALID_VAL'` | `'NON_EXISTENT'` | `'VALID_VAL'` |
| **`Entity.TestAttribute`** | `100` | `100` | `0` |
| **Assert Return Value** | `ExpectedVal1` | `empty` | `0` |

<details>
<summary><b>Scenario Registration Metadata & Variation Recipes</b></summary>

*   **Variation #1 (`variation-name-1`):** *Description:* `[Inputs and expected outcomes]`
*   **Variation #2 (`variation-name-2`):** *Description:* `[Inputs and expected outcomes]`

</details>

</details>

<details>
<summary><b>8. Applied Testing Patterns & Rationale</b></summary>

| Applied Testing Pattern | Target Step(s) | Architecture Law Citation | Applied Rationale & Risk Prevention |
| :--- | :--- | :--- | :--- |
| **Direct Initialization on Create Object** | Step 1 | `PAT-06`, `ANTI-01` | Initial attributes set directly on creation step, preventing unnecessary Change Object steps |
| **Retrieve Output Object Count Assertion** | Step 2 -> Step 3 | `PAT-08`, `ANTI-03` | Verifies database query count immediately before passing handle to downstream step, preventing silent null pointers |
| **Backend-First Direct Piping Delete** | Step 10 | `PAT-20`, `PAT-16` | Deletes created handle directly without redundant database retrieve queries |

</details>

<details>
<summary><b>9. MTA Build & Smoke Verification Receipt</b></summary>

### Smoke Audit Results & Verification Details (0 Discrepancies)

| Audit Item | Verification Target | Status | Details |
| :--- | :--- | :-: | :--- |
| **Plan ID Alignment** | `[plan_id]` | `PASS` | Matches approved execution plan ID |
| **Revision Integrity** | Rev `[revision]` | `PASS` | No uncommitted plan drift |
| **Test Case Placement** | `[TestCaseName]` (Key: `[TestCaseKey]`) | `PASS` | Verified under Suite `[SuiteKey]` and Config `[ConfigKey]` |
| **Step Sequence Audit** | Steps 1..N | `PASS` | Verified 1:1 match with Section 5 sequence and settings |
| **Variation Items Audit** | Matrix Items | `PASS` | Zero unapproved additions, names/descriptions persisted |
| **MTA Compiler Validation** | Server Validation Engine | `PASS` | 0 compilation errors, 0 warnings |
| **Platform Quality Check** | 10 MTA Quality Laws | `PASS` | 100% compliant with MTA architecture standards |

</details>
