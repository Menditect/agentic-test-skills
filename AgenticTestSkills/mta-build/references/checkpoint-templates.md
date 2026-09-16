# 🚦 MTA Checkpoint & Decision Card Templates Reference
**📍 Location:** `.agent/skills/mta-shared/references/checkpoint-templates.md`  
**🏠 Return to:** [MTA Test Design Skill](../../mta-test-design/SKILL.md) | [MTA Build Skill](../../mta-build/SKILL.md) | [MTA Run & Analyze Skill](../../mta-run-analyze/SKILL.md) | [Patterns Reference](mta-patterns-and-antipatterns-reference.md)  
*Metadata: Version 1.0.0 | Primary Audience: AI Coding Assistant (Antigravity, MAIA, Subagents)*

---

## 🎯 Purpose & Overview
This reference document serves as the **Single Source of Truth (SSOT) and canonical template catalog** for all user-facing decision cards, approval checkpoints, sealed receipts, and session compaction blocks used across the MTA skill lifecycle.

---

## 1. ⚡ Phase 0: Prior Plan Lineage Decision Card (`PAT-84`, `ANTI-38`)

When an existing Execution Plan (`EP_*.md`) targeting the same microflow or page is discovered in `${execution_plans_dir}/`:

```markdown
> [!NOTE]
> **Existing Execution Plan Detected (`PAT-84`)**
> * **Existing Plan ID:** `<TestCaseName>-v<revision>` ([`EP_<TestCaseName>.md`](file:///absolute/path/to/EP_<TestCaseName>.md))
> * **Status:** `<DRAFT | APPROVED | BUILT_AND_VERIFIED>` (Approved at: `<timestamp>`)
> * **AST Delta Summary:** `<1–2 line summary of detected changes between live Mendix AST and prior plan>`

### 🧭 Prior Plan Lineage Options

| Path | Action | Revision | When to Choose |
| :---: | :--- | :---: | :--- |
| **Path 0** | **Use Existing Plan As-Is** *(Fast-Path)* | `v<N>` | **Recommended when in-sync (0 AST delta).** Re-uses existing plan immediately without file edits or revision bumps. |
| **Path A** | **Evolve & Supersede** | `v<N+1>` | **Recommended when AST changed.** Updates test steps and variations to match new model logic, superseding prior revision. |
| **Path B** | **Branch Companion Case** | `v1` | Creates an independent companion test case (e.g. `<TestCaseName>_EdgeCases`) alongside the existing test case. |
| **Path C** | **Clean Slate** | `v1` | Discards prior plan context and designs a brand-new test case from scratch. |

> ❓ *Please select a lineage path (**0**, **A**, **B**, or **C**) to proceed.*
```

---

## 2. 🚦 Checkpoint 1: Test Plan Review & Execution Strategy Decision Cards (`PAT-43`, `PAT-60`, `PAT-82`, `PAT-89`, `ANTI-36`, `ANTI-41`)

Render the Executive Summary Box (~35 lines) and clickable file link in chat, followed by the appropriate Checkpoint 1 card below:

### Case 1: When Model Delta is Detected (Option B Blocked ➔ Option A Only)

```markdown
---

## 🚦 CHECKPOINT 1: TEST PLAN REVIEW & EXECUTION STRATEGY

> [!WARNING]
> **MTA Server Model Check:** Out of Sync — Persistent MTA Building Blocked (`ANTI-36`)  
> One or more planned elements do not exist in the active MTA server revision.
>
> 💡 **Automate Model Updates on Every Commit:**  
> If you want MTA to automatically update its model revision whenever you commit, you can subscribe your Test Configuration to your git branch. Expand the setup guide below for step-by-step instructions.

<details>
<summary><b>MTA Branch Subscription Setup Guide (Automate Model Sync on Every Git Commit)</b></summary>

Subscribing to a branch in MTA allows it to automatically poll for new commits on that branch and download new revisions in the background, keeping your test suite synchronized with zero manual effort.  
Official documentation: [Menditect Branch Subscription Guide](https://documentation.menditect.com/mta/branch-subscription).

#### How to set it up in the MTA Web UI:
1. **Navigate to:** `Test configurations` in the MTA Web application.
2. **Select:** Your target Test Configuration (e.g., `Test`).
3. **Open:** `App revisions`.
4. **Click:** The ellipsis menu (`...`) next to the Application and select **Subscribe to branch**.
5. **Choose Branch:** Select your active branch (e.g., `main` or your current feature branch).
6. **Polling Frequency:** Set to `High` (recommended during active development sprints) or `Medium`.
7. **Enable Auto-Adapt:** Check **Adapt automatically: Latest application revision** to make sure test suites automatically adapt to downloaded revisions.
8. **Save:** Save the configuration. MTA will now automatically track and apply all future git commits.

</details>

### 🔍 Model Discrepancy Summary

| Inspected Element | Local AST (`mxcli`) | MTA Server Revision | Parity Status | Impact |
| :--- | :--- | :--- | :--- | :--- |
| `[Element Qualified Name]` | Verified Present | **Not Found on Server** | **MISMATCH** | Causes immediate step creation failure (`ANTI-36`) on MTA |

### 🧭 Execution Strategy Availability

| Strategy Option | Target Environment | Status | Description |
| :--- | :--- | :---: | :--- |
| **Option A: Local Exploratory Test** | Local App (`MTA_plugin`) | **`ACTIVE`** | **1-Click In-Memory Execution.** Runs all scenarios in `< 1s` with `Rollback = Yes`. Zero database pollution, instant feedback. |
| **Option B: Persistent MTA Test** | MTA Server Platform | **`BLOCKED`** | **Temporarily Disabled.** Blocked until project model is synchronized (via [Branch Subscription](https://documentation.menditect.com/mta/branch-subscription) or manual upload). |

### 💬 Decision Required:
> **Do you approve this Execution Plan for immediate local execution?**
> - **[Yes, Execute Option A]** ➔ Dispatches local in-memory exploratory test (`< 1s` execution).
> - **[Adjust Plan]** ➔ Make changes to test steps, assertions, or data variations first.
> - **[Sync MTA First]** ➔ Set up [Branch Subscription](https://documentation.menditect.com/mta/branch-subscription) or trigger a manual model upload so Option B can be unlocked.

> [!WARNING]
> **Local Runtime Unreachable Fallback:**
> If the local application is not running or the `MTA_plugin` endpoint (`http://localhost:8080/primitivetools/mcp`) is unreachable:
> 1. Start the local Mendix application from Studio Pro (or run `mendix-cli` / start local server).
> 2. Alternatively, commit your local changes and sync MTA ([Branch Subscription](https://documentation.menditect.com/mta/branch-subscription) or manual upload) to unblock Option B.
> 3. You can still review, refine, and store the Execution Plan locally (`EP_<TestCaseName>.md`) in `STATE_BUILD_PLANNING` without requiring an active application runtime.

---
```

---

### Case 2: When Model Parity is 100% In-Sync (Dual Options Available)

```markdown
---

## 🚦 CHECKPOINT 1: TEST PLAN REVIEW & EXECUTION STRATEGY

> [!NOTE]
> **MTA Server Model Check:** Verified (`PAT-82`)  
> All planned microflows, entities, and attributes exist in the MTA server.

### 🧭 Choose Your Execution Strategy

| Strategy Option | Target Environment | Speed | Execution Profile |
| :--- | :--- | :---: | :--- |
| **Option A: Local Exploratory Test** | Local App (`MTA_plugin`) | `< 1s` | In-memory exploratory execution with automatic database rollback (`Rollback = Yes`). Zero database pollution, instant feedback. |
| **Option B: Persistent MTA Test** | MTA Server Platform | `~15s` | Persistent test asset creation on MTA server for CI/CD pipelines, team collaboration, and long-term regression suites. |

### 💬 Decision Required:
> **Do you approve this Execution Plan? If so, which execution route would you like to take?**
> - **Reply "A"** ➔ Run immediate local exploratory execution via `MTA_plugin`.
> - **Reply "B"** ➔ Proceed to Checkpoint 2 (Placement & Target Configuration) to build persistent test cases in MTA.
> - **Reply "Adjust"** ➔ Modify test steps, assertions, or data variations first.

---
```

---

### Case 3: For Standalone Data Seeding Plans (`EP_Seed_<Entity>.md` / `Rollback = No`)

```markdown
---

## 🚦 CHECKPOINT 1: TEST PLAN REVIEW & EXECUTION STRATEGY

> [!NOTE]
> **Data Seeding Plan Check:** Verified (`PAT-70`, `PAT-82`)  
> Target entities, initial attributes, associations, and permutation variations verified against domain model.

### 🧭 Choose Your Execution Strategy

| Strategy Option | Target Environment | Speed | Execution Profile |
| :--- | :--- | :---: | :--- |
| **Option A: Local Direct Seeding** | Local App (`MTA_plugin`) | `< 1s` | Direct JVM execution with `Rollback = No` and trailing batch `Persist`. Populates database immediately in 1 turn without scanning server placement. |
| **Option B: Persistent MTA Platform Seeding** | MTA Server Platform | `~15s` | Constructs a reusable 1-case Data Generator test case on the MTA Server (`Rollback = No`, trailing `Persist`, no teardown) for CI/CD or team pipelines. |

### 💬 Decision Required:
> **Do you approve this Data Seeding Plan? If so, which execution route would you like to take?**
> - **Reply "A"** ➔ Execute local direct seeding immediately via `MTA_plugin` (zero server scanning, 1-turn execution).
> - **Reply "B"** ➔ Proceed to Checkpoint 2 (Placement & Target Configuration) to construct persistent test case in MTA.
> - **Reply "Adjust"** ➔ Modify entity attributes, associations, or variation counts first.

---
```

---

### Frontend UI Tests Policy Notice (`PAT-62`)
For Frontend UI tests (`Category == Frontend`), tests route exclusively to **Option B (Persistent MTA Platform)**:
> *"Please review the proposed Frontend Execution Plan above. Frontend UI tests require MTA Platform locator mapping, Playwright settings, and 3-case suite lifecycle management. Therefore, they are constructed directly on the MTA Platform (Option B). Once approved, we will proceed to Checkpoint 2 (Confirm Test Suite Placement & Settings)."*

---

## 3. 🚦 Checkpoint 2: Confirm Test Suite Placement & Settings Box (`PAT-43`, `PAT-79`)

```markdown
## 🚦 CHECKPOINT 2: CONFIRM TEST SUITE PLACEMENT & SETTINGS

> 📍 **PLACEMENT & TARGET SUMMARY**
> * **Application Name:** `[AppName]`
> * **Target Test Configuration:** `[UserSelectedTestConfig]`
> * **Target Test Suite:** `[UserSelectedTestSuite]`
> * **Test Case Name:** `[UserSelectedTestCaseName]`
> * **Execution User:** `[UserSelectedExecutionUser, e.g. MxAdmin]`
> * **MTA Category:** `[Backend | Frontend]`
> * **Browser Settings (Frontend):** `[Environment / Mode / Browser Type / Viewport]`
>
> ❓ *Please confirm if this target placement and settings summary is correct so I can save the execution plan and proceed to test construction.*
```

---

## 4. 📄 Collapsible Execution Plan Metadata Header & Sealed Receipts (`PAT-44`, `PAT-88`)

### Collapsible Metadata YAML Block (Schema v1.2.0)
Prepend this block to the top of `${execution_plans_dir}/EP_<TestCaseName>.md`:

```markdown
<details><summary><b>Execution Plan Metadata</b></summary>

```yaml
plan_id: "<TestCaseName>-v<revision>"
schema_version: "1.2.0"
supersedes_plan_id: "<TestCaseName>-v<old_revision> | null"
revision: 1
status: "APPROVED"
approved_at: "<ISO 8601 Timestamp, e.g. 2026-09-08T16:11:41+02:00>"
approved_by: "<UserEmailOrName>"
approver_system_user: "<OSUsername>"
build_started_at: null
built_at: null
builder_system_user: null
verified_at: null
verifier_system_user: null
test_case_name: "<TestCaseName>"
target_configuration: "<TargetConfig>"
target_configuration_key: null
target_suite: "<TargetSuite>"
target_suite_key: null
test_case_keys: []
category: "<Backend | Frontend>"
```

</details>
```

### Sealed Receipt Notifications

#### Fresh Creation (Revision 1):
```markdown
📄 **Execution Plan Stored & Sealed:**
• **Plan ID:** `<TestCaseName>-v1` (Revision 1)
• **File Location:** [`EP_<TestCaseName>.md`](file:///absolute/path/to/menditect-output/execution-plans/EP_<TestCaseName>.md)
• **Relative Path:** `menditect-output/execution-plans/EP_<TestCaseName>.md`
• **Approved At:** `<ISO 8601 Timestamp>`
• **Approved By:** `<approved_by>` (`<approver_system_user>`)
• **Status:** Approved (Gate 1 & Gate 2) & Sealed to Workspace
```

#### Revision / Superseding Prior Plan:
```markdown
📄 **Execution Plan Stored & Sealed:**
• **Plan ID:** `<TestCaseName>-v<N>` (Revision <N>)
• **Supersedes:** `<TestCaseName>-v<old_revision>` (Version history tracked in Git)
• **Active Plan:** [`EP_<TestCaseName>.md`](file:///absolute/path/to/menditect-output/execution-plans/EP_<TestCaseName>.md)
• **Approved At:** `<ISO 8601 Timestamp>`
• **Approved By:** `<approved_by>` (`<approver_system_user>`)
• **Status:** Approved (Gate 1 & Gate 2) & Sealed to Workspace
```

---

## 5. 💾 Chat-Only Session Compaction JSON Block (`PAT-44`)

When file-writing tools are unavailable (Chat Mode), output this block at the end of the sign-off response:

```markdown
<details><summary><b>💾 MTA Session Compaction Block (Chat-Only Restore)</b></summary>

```json
{
  "MtaState": "STATE_CONSTRUCTION",
  "TempState": "SKELETON_PROVISIONING",
  "TargetConfig": "<TargetConfigKey>",
  "TargetSuite": "<TargetSuiteKey>",
  "TestCase": "<TestCaseName>",
  "Category": "<Backend | Frontend>",
  "ExecutionPlanFile": "chat-context",
  "ExecutionPlanId": "<TestCaseName>-v<revision>",
  "ExecutionPlanStatus": "APPROVED",
  "ExecutionPlanApprovedAt": "<ISO 8601 Timestamp>",
  "ExecutionPlanApprovedBy": "<approved_by>",
  "ExecutionPlanRevision": <revision>,
  "ExecutionPlanSupersedesId": "<supersedes_id | null>",
  "Context": "<Short summary of approved test case>"
}
```

</details>

---

## 6. 🔍 Checkpoint 3: Post-Construction Smoke Audit Report (`PAT-59`, `PAT-88`)

Output this structured report upon completing step construction and batch binding in `STATE_SMOKE_AUDIT`:

```markdown
### 🔍 Post-Construction Smoke Audit Report

> [!NOTE]
> **Audit Status:** ✅ PASS (0 Compiler Errors, 0 Step Discrepancies)  
> **Target:** `<TestConfigurationName>` / `<TestSuiteName>` / `<TestCaseName>`  
> **Execution Plan:** [`EP_<TestCaseName>.md`](file:///absolute/path/to/menditect-output/execution-plans/EP_<TestCaseName>.md) (Sealed: `BUILT_AND_VERIFIED`)

#### 1. Mandatory 1-to-1 Step Reconciliation (`PAT-59`)
| Case # | Planned Step Name / Action | Built MTA Step Key | Status |
| :--- | :--- | :--- | :--- |
| Case 1 | LocalStartOptions | Step 6501 | ✅ MATCH |
| Case 1 | Start_Frontend_Test_Locally | Step 6502 | ✅ MATCH |
| Case 1 | Create Seed Object (<Entity>) | Step 6503 | ✅ MATCH |
| Case 1 | Persist Seed Data | Step 6504 | ✅ MATCH |
| Case 2 | StartMxFrontendTestOptions | Step 6510 | ✅ MATCH |
| Case 2 | Navigate to Page | Step 6511 | ✅ MATCH |
| Case 2 | Stop_MxFrontendTest | Step 6520 | ✅ MATCH |
| Case 3 | Teardown Playwright | Step 6522 | ✅ MATCH |
| Case 3 | Retrieve runtime <Entity> | Step 6523 | ✅ MATCH |
| Case 3 | Delete runtime <Entity> | Step 6524 | ✅ MATCH |
| Case 3 | Delete Seeded <Entity> | Step 6525 | ✅ MATCH |
| Case 3 | Persist Deletions | Step 6526 | ✅ MATCH |

#### 2. Compiler & Server Validation (`GetTestCaseDetails`)
* **Construction Errors:** 0 errors reported by MTA compiler.
* **Variation Matrix:** Verified cell-by-cell ($M \times N$ matrix matches Section 7).
* **Execution Topologies & Settings:** Verified (`ExecutionCondition` & `ResumeExecutionAfterException` conform to `PAT-17`/`PAT-18`).

#### 3. Direct MTA Web Navigation Links
| Level | Name | Direct Link |
| :--- | :--- | :--- |
| **Test Configuration** | `<ConfigName>` | [`<ConfigName>`]([MtaBaseUrl]/p/testconfiguration/<ConfigKey>) |
| **Test Suite** | `<SuiteName>` | [`<SuiteName>`]([MtaBaseUrl]/p/testsuite/<SuiteKey>) |
| **Test Case(s)** | `<TestCaseName>` | [`<TestCaseName>`]([MtaBaseUrl]/p/testcase/<CaseKey>) |

---

### 🚀 Checkpoint 3 Decision Card
All steps and variations have been verified on the server with 0 errors and 0 discrepancies.

**Would you like to execute the test suite now (`STATE_RUN_ANALYZE`)?**
* **Option 1:** Execute Test Suite Now (`STATE_RUN_ANALYZE`)
* **Option 2:** Inspect Test in MTA Web UI First
```
```
