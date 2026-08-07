# MTA Unified Playbook: Core Rules & Checklist
**📍 You are here:** `references/core-playbook.md` | **🏠 Return to:** [MTA Core Skill](../SKILL.md)
*Metadata: Version 4.0 | Last Updated: 2026-08-07*

This playbook is the compacted, high-level workflow checklist and state transition master for MTA test construction. Exhaustive technical guidelines are delegated to targeted sub-manuals.

---

## 📅 WHEN TO LOAD THIS PLAYBOOK
*   **Always load at the start of ANY MTA-related request.**
*   Contains the core state machine, dual-track capability matrix, and step-chaining laws.

---

## 🚥 STATE MACHINE TRANSITION MASTER (5-STATE CONSOLIDATED MODEL)

You MUST progress through these workflow states. Rollback/revision paths are supported to handle modifications or failures:

| State | Allowed Destination | Transition Trigger / Action | HALT Required? | Direction |
| :--- | :--- | :--- | :--- | :--- |
| **`STATE_DISCOVERY`** (1) | `STATE_BUILD_PLANNING` (2) | Setup and target placement resolved (Test Configuration & Test Suite) | Yes (If placements not provided) | Forward |
| **`STATE_BUILD_PLANNING`** (2)| `STATE_CONSTRUCTION` (3) | Specifications and chronological execution plan approved & saved in MTA (retrieved `ExecutionPlanKey`) | **YES (All Modes)** | Forward |
| **`STATE_BUILD_PLANNING`** (2)| `STATE_DISCOVERY` (1) | User rejects specs/placement or requests structural changes | No | **Rollback** |
| **`STATE_CONSTRUCTION`** (3) | `STATE_SMOKE_AUDIT` (4) | Sequential step creation and binding completed on the server | No | Forward |
| **`STATE_CONSTRUCTION`** (3) | `STATE_BUILD_PLANNING` (2) | Sequential creation tools fail or `ExecutionPlanKey` is lost | Yes | **Rollback** |
| **`STATE_SMOKE_AUDIT`** (4) | `STATE_RUN_ANALYZE` (5) | Programmatic validation checks (`GetTestConstructionErrorsOfTestCase`) and rule conformity validated with 0 errors | **YES (All Modes)** | Forward |
| **`STATE_SMOKE_AUDIT`** (4) | `STATE_CONSTRUCTION` (3) | Audit reveals compilation or structural validation errors | Yes | **Rollback** |
| **`STATE_RUN_ANALYZE`** (5) | `STATE_CONSTRUCTION` (3) | Execution fails or requires adjustment of specific steps | No | **Rollback** |
| *Any State* | **`STATE_QA_ASSISTANCE`** | User asks tangent, conceptual question, or platform clarification | No | Out-of-Band |
| **`STATE_QA_ASSISTANCE`** | *Resumed State* | Tangent addressed; assistant **MUST HALT and ask for explicit user approval to resume** | **YES (Always)** | Resume |

---

## 🤖 DUAL-TRACK PERSISTENCE & EXECUTION MATRIX

To support both advanced runtimes with local write capabilities and memory-only chat assistants, the system operates on two distinct tracks:

| Operational Dimension | 🤖 Agentic Track (Write-Enabled) | 💬 Chat Track (Memory-Only) |
| :--- | :--- | :--- |
| **Active Condition** | File-writing & run tools present in tool schema. | No write/run tools found (restricted sandbox / chat UI). |
| **State Persistence** | Silently reads/writes to local `mta_state.json`. | Prepends State Header; user copy-pastes Compaction Block. |
| **Specification Approval** | Automatically saves specs with `SetTestCaseSpecifications`. | Outputs formatted spec markdown; user saves in MTA Web UI. |
| **Execution Plan Key** | Programmatically fetched and saved upon plan approval. | User retrieves `ExecutionPlanKey` from Web UI and pastes it. |
| **Step Construction** | Runs sequentially in background using direct MCP tools. | Generates step-by-step JSON payloads for user local execution. |
| **Smoke Auditing** | Automatically runs `GetTestConstructionErrorsOfTestCase`. | Instructs user to view Web UI errors and paste back findings. |
| **Chat Verbosity** | Ultra-clean. Zero session compaction blocks in chat. | Compaction blocks outputted at major state transitions. |

---

## 📋 THE 3-TEST CASE PATTERN FOR FRONTEND UI TESTS

All Frontend tests **MUST** adhere strictly to this session-isolated 3-Test Case architecture. Because the backend transaction session and the client browser session are completely unshared, setup data must be committed in Case 1 before the browser starts in Case 2. Any data created natively by the browser session must be cleaned up in Case 2 itself, and Setup data must be deleted in Case 3:

```
1. CASE 1: SETUP (ExecutionCondition = "Always", ResumeExecutionAfterException = "_Continue")
   ├─► Start Playwright (Local, Server, or Azure options) ➔ Returns Browser Context Output
   ├─► Backend Setup / Data Seeding: Create & Change objects (Seeding Setup Data)
   └─► Single Persist (Always, _Continue): Commit Setup Data to DB so the browser can see it

2. CASE 2: EXECUTION (ExecutionCondition = "None", ResumeExecutionAfterException = "Stop")
   ├─► A. UI EXECUTION & VERIFICATION (None, Stop): Starts frontend session, acts, asserts, and Stop_MxFrontendTest.
   ├─► B. BACKEND UI CLEANUP: Retrieve UI-Created Data (using maximum context, e.g. unique identifiers), and Delete Object.
   └─► C. Single Persist (Always, _Continue): Commit deletions of UI-created data

3. CASE 3: TEARDOWN (ExecutionCondition = "Always", ResumeExecutionAfterException = "_Continue")
   ├─► Backend Teardown / Cleanup (Always, _Continue): Delete Case 1 Setup Data (piped via TestStepOutputKey)
   ├─► Single Persist (Always, _Continue): Commit Teardown deletions
   └─► Teardown_Playwright ➔ Closes browser context safely
```

### 🔀 Multi-Case Suite Architecture
If there are multiple frontend execution cases between Setup (Case 1) and Teardown (Case N):
1. **Consolidated Seeding (Case 1):** Create and commit **all** setup data for all execution cases inside Case 1 in a single, clean seeding block, followed by a single `Persist` step. Ensure data for different testcases is isolated and uniquely prefixed to maintain test idempotency.
2. **Consolidated Teardown (Case N):** Pipe all setup object keys from Case 1 directly to Case N's `Delete Object` steps using cross-case step output piping and commit with a single `Persist` step.
3. **Local UI Cleanup (Cases 2, 3, etc.):** Each execution test case remains strictly responsible for retrieving, deleting, and committing any data created by its own frontend browser clicks before it exits.

---

## 📋 COMPACTED STATE-BY-STATE OPERATIONAL CHECKLIST

To maintain lightweight, fast execution context windows during test generation, the full detailed checklists are split into separate on-demand guides. **Load and read only the file corresponding to your active macro state:**

### Setup, Onboarding, and Specification Checklist (State 1-2)
*   **Active States:** `STATE_DISCOVERY` (1), `STATE_BUILD_PLANNING` (2).
*   👉 **Read and Follow:** [MTA Setup & Specifications Approval Guide](spec-setup-guide.md)

### Step Build, Construction, and Smoke Audit Checklist (State 3-5)
*   **Active States:** `STATE_CONSTRUCTION` (3), `STATE_SMOKE_AUDIT` (4), `STATE_RUN_ANALYZE` (5), `STATE_QA_ASSISTANCE` (Out-of-Band).
*   👉 **Read and Follow:** [MTA Build, Construction, & Audit Guide](build-construction-guide.md)
*   👉 **Read:** [MTA Glossary & Syntax Map](glossary.md)

---

## 📋 CANONICAL EXECUTION CONDITIONS & MATRIX

To ensure complete clarity, prevent compilation errors, and guarantee database cleanliness, all execution conditions, delay settings, rollback defaults, and cascading dependency laws are isolated in a dedicated manual.

### 🧭 High-Level Summary of Execution Rules:
*   **Boilerplate Cases:** Case 1 (Setup) and Case 3 (Teardown) are set to `"Always"` execution with `"_Continue"` exception handling.
*   **Boilerplate & Backend Steps:** Options object creation, browser startup steps, data seeding (Create, Persist), and data teardown (Delete, Persist) steps are set to `"Always"` execution and `"_Continue"` exception handling.
*   **Standard Steps:** Standard UI interactions and assertions are set to `"None"` execution and `"Stop"` exception handling.
*   **Rollback Defaults:** `RollbackTcseAfterExecution` is set to `"No"` by default for all test cases, except for Backend Unit Tests (consisting of a single microflow execution) where it is set to `"Yes"`.
*   **Cascading Laws:** Execution condition `"Always"` cascades backward to providers. Execution condition `"Skip"` cascades forward to consumers.

👉 **Read the complete manual here:** [MTA Execution Settings Manual](execution-settings.md)

---

## 🏆 MTA GOLDEN RULES & TEST DESIGN

To prevent sequence corruption, maintain clean naming, and build robust dynamic piping, all core test construction laws, variable piping patterns, and lifecycle cleanup best practices are isolated in a dedicated manual.

### 🧭 High-Level Summary of Golden Rules:
1.  **The Predecessor Chaining Law:** Elements (steps, cases, or suites) must be created in chronological forward order. For the absolute first element in an empty container, you **MUST** pass `0` for the predecessor parameter (e.g. `TestStepBeforeKey = 0`). Concurrent/parallel step creation or sequence modifications are strictly banned.
2.  **Zero Data in Step Names:** Describe *what* the step does, not *which* data it uses. Use the template: `[Action] [WidgetType] '[FieldDescriptor]' [Input/Button]`.
3.  **Proactive Output Piping:** Always pipe outputs from preceding teststeps (locators, objects, primitive attributes) directly into subsequent steps to maximize dynamic test maintenance and avoid hardcoding values.
4.  **Modular Setup & Teardown Isolation:** Isolate data seeding and teardown actions in setup/teardown cases, keeping core test flows clean.
5.  **Test Case Session Boundaries:** Objects kept in memory can only be shared within the same test case. Passing objects across cases requires persisting them to the database.

👉 **Read the complete manual here:** [MTA Golden Rules & Test Design Manual](golden-rules.md)

---

## 🏃 CONCRETE END-TO-END EXAMPLE: "Create a login validation test"

1.  **`STATE_DISCOVERY`**: Agent performs Mendix model audit or user setup scans. Placement is resolved to suite `UserManagement`.
2.  **`STATE_BUILD_PLANNING`**: Agent conducts the interactive planning loop. Gathers placement, setup environment details, drafts sequential step plans, performs the Pre-Approval Self-Audit, and presents the Execution Plan. User responds: *"Approve"*. The Execution Plan is saved in MTA and `ExecutionPlanKey` is returned.
3.  **`STATE_CONSTRUCTION`**: Sequentially calls step creation and binding tools on the server, using predecessor chain linking.
4.  **`STATE_SMOKE_AUDIT`**: Performs both structural checks and runs programmatic validations (`GetTestConstructionErrorsOfTestCase`). Generates and prints the Post-Construction Smoke Audit Report. User approves.
5.  **`STATE_RUN_ANALYZE`**: Executes the test suite run, parses results, and presents findings.

---

## 🔍 THE 3-SECOND PRE-RESPONSE SELF-AUDIT (MANDATORY)

Before outputting your response or executing any tool call, mentally verify these eight questions to guarantee absolute compliance with the MTA skill:
1. **Did I check my active track?** I MUST identify whether I am running on the **Agentic Track** or **Chat Track** based on available tools.
2. **Did I announce the current state?** I MUST have `Active State: [STATE_NAME]` printed at the very start of my response.
3. **If halting, did I announce the destination?** If I am halting for input, I MUST have `Next Destination State: [NEXT_STATE_NAME]` printed at the top.
4. **Did I output my Chain of Thought block?** If I am calling any MTA MCP tool, I MUST have the `> 🧠 **Tool Execution Reasoning:**` block printed *immediately before* the tool call block.
5. **Did I let the user choose the category?** I MUST have obtained the explicit choice of **Backend** vs **Frontend** during discovery/scoping and not assumed it on my own.
6. **Did I strictly format my MTA direct links?** Check that links strictly conform to the singular, lowercase, `/p/`-inclusive structure (e.g. `[BaseUrl]/p/testcase/[Key]`) with zero pluralization or trailing paths.
7. **Did I verify the ExecutionPlanKey?** If entering `STATE_CONSTRUCTION` or `STATE_SMOKE_AUDIT`, I MUST verify that a valid non-empty `ExecutionPlanKey` is present in the active state metadata/compaction block/filesystem state.
8. **Did I run the Pre-Execution Smoke Audit?** Before completing `STATE_CONSTRUCTION`, I MUST run the compact checklist (verifying `Mendix_URL` is populated, setup/options/seeding steps are set to `"Always"` and `"_Continue"`, browser page is piped, and no unbound parameters) AND execute `GetTestConstructionErrorsOfTestCase` on the server to programmatically verify that zero validation or compiler errors exist.
