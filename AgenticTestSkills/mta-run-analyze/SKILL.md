---
name: mta-run-analyze
description: "Focuses on executing tests, retrieving test results, parsing logs, debugging runtime failures, performing static architecture audits, and explaining test case intent/logic to developers or testers (MTA v3.2). Trigger on keywords: MTA run, execute test, view results, why did it fail, debug test, analyze run, troubleshoot, get testsuites, get testcases, show steps, list suites, inspect test, verify structure, explain test case, how does this test work, understand test script, document test suite, audit step sequence, test execution timing, performance benchmarking metrics, telemetry analysis, and live test data teardown."
version: "4.8.5"
changes: "Updated promotion reverse-handoff bridge to enforce PAT-77 data variation container metadata and description persistence upon promotion."
---

# MTA Execution, Analysis, & Diagnostics Skill

🚨 **MANDATORY CROSS-SKILL REDIRECTION FOR VAGUE / FRESH REQUESTS** 🚨

> [!IMPORTANT]
> **If the user's request is vague, exploratory, indicates they are starting fresh, or asks for prompts/onboarding (e.g., "I want to test", "How to start", "Where do I begin", "Give me some prompts", or "Show me prompts"):**
> *   You **MUST** immediately stop using this `mta-run-analyze` skill.
> *   You **MUST** load and switch to the **`mta-test-design`** skill instead (`.agent/skills/mta-test-design/SKILL.md`).
> *   Follow the onboarding guide and starter prompts in `mta-test-design` to help the user design their test before building or running anything.

🚨 **CRITICAL MTA GUARDRAIL: READ-ONLY CONTEXT DISCOVERY & EXECUTION TOOL GATING** 🚨

> [!IMPORTANT]
> ### 🔍 READ-ONLY MTA `GET*` MCP TOOLS ALWAYS AUTHORIZED
> You are **ALWAYS authorized** to execute read-only MTA `Get*` MCP tools (e.g. `GetApplicationByName`, `GetTestConfigurationsForApplicationKey`, `GetTestSuites`, `GetTestCases`, `GetTestSteps`, `GetPages`, `GetWidgets`, `GetExecutionUsers`, `RetrieveTestRunResults`) at any time, including on the very first turn of a request. To build clickable MTA navigation links and resolve the MCP server endpoint (`[MtaUrl]/tools/mcp`), evaluate in order: (1) project-level `AGENTS.md` (`MTA Url`), (2) `mta_config.json` (`mta_base_url`), (3) `.vscode/settings.json` (`MTA_BASE_URL`), (4) `mta_state.json` (`mta_base_url`), or (5) prompt the user on turn 1.
> Use read-only MTA `Get*` tools freely in any state to build context, discover existing test structures, and present clear options to the user.

> [!IMPORTANT]
> ### ⚡ EXECUTION & MUTATING TOOL GATING
> You are strictly prohibited from executing **execution or mutating MTA tools** (e.g. `ExecuteTestSuite`, `ExecuteTestCase`, `ExecuteTestConfiguration`, `CreateTestCase`, `Set*`, etc.) on the first turn or during discovery until the target execution parameters (Configuration, Suite, or Case) are explicitly confirmed by the user.

---

### 🎯 Interactive Discovery Question Template
```markdown
**Active State:** `STATE_DISCOVERY`

Hello! I can help you run tests, retrieve execution logs, or explain and analyze existing test structures for your application **[AppName]**.

#### 1. Specify Test Placement (Starting Path):
*   **Direct Path:** Specify the Target Configuration and Suite name right now (e.g., *"Run Config 'Staging' and Suite 'Checkout'"* or *"Explain TestCase 'TC_VerifyPayment'"*).
*   **Scan Path (Explore):** Ask me to scan available Test Configurations so you can select one. (To save tokens, I will then scan Test Suites and Test Cases step-by-step as you select them).
```

---

## 🚫 CRITICAL DIAGNOSTIC & EXECUTION RULES

You **MUST** strictly follow the Golden Rules defined in `references/core-playbook.md` at all times. Here is a brief checklist of active diagnostic boundaries:
1. **No conversational refusals**: Transition to `[STATE_QA_ASSISTANCE]` if the user asks conceptual, general, or educational questions.
2. **No raw Playwright bypasses**: Rely exclusively on Menditect Frontend Testkit.
3. **Strict State Isolation**: Output your concise chain of thought in the `🧠 Tool Execution Reasoning` format before every MTA tool call.
4. **Strict Direct Link Formatting**: Web links must follow `[MtaBaseUrl]/p/[ObjectType]/[Key]` exactly. Available `ObjectTypes`: `testconfiguration`, `testsuite`, `testcase`, `testrun`, `testsuiterun`, `testcaserun`.
5. **State File Key Resolution Law**: Before executing any persistent test case, test suite, or configuration on the MTA platform, check `mta_state.json` (if in Agentic Mode) or the Session Compaction Block (if in Chat Mode) to load the exact numeric `key` for the target test case (`test_cases[].key`), test suite (`test_suite.key`), or execution plan (`execution_plan_key`). If missing keys, use read-only discovery tools (`GetTestSuites`, `GetTestCases`) to locate the entity on the MTA server, and immediately persist them. *(Note: Local in-memory exploratory tests executed under `STATE_EXPLORATORY_EXECUTION` via `MTA_plugin.execute-testcase` are strictly EXEMPT from key requirements).*
6. **Pattern Audit & Auto-Registration Protocol**: When analyzing existing test cases or auditing step sequences in `STATE_QA_ASSISTANCE`, verify step patterns against `references/mta-patterns-and-antipatterns-reference.md` [^PAT-xx] [^ANTI-xx]. If a new pattern or anti-pattern is identified or learned, auto-register it in `mta-patterns-and-antipatterns-reference.md` and add footnote cross-references (`[^PAT-xx]` / `[^ANTI-xx]`) to related instruction lines across skill files.
7. **Pre-Flight Zero Construction Error Verification Law [^PAT-59] [^ANTI-18]**: Before calling `ExecuteTestCase`, `ExecuteTestSuite`, or `ExecuteTestConfiguration`, you **MUST** verify that `GetTestConstructionErrorsOfTestCase` returns **0 construction errors**. If construction errors exist on the server, you are **strictly prohibited** from invoking execution tools (`ANTI-18`). Halt immediately, report the exact construction errors to the user, and explain that execution cannot proceed until model revision synchronization or step binding issues are resolved.

---

## 📅 STRICT REACTIVE LOADING STRATEGY

To maximize token efficiency, **DO NOT load reference files preemptively**, except for `core-playbook.md` on the first active turn. Load other reference files **strictly on-demand** based on the request:

| User request mentions... | ...then load ONLY this file: |
| --- | --- |
| *MTA request startup, workflow states, transitions, or core rules* | **`references/core-playbook.md`** (Preemptive) |
| *Failing runs, runtime errors, log diagnostics, retry logic, or debugging* | **`references/troubleshooting.md`** |
| *Test structure hierarchy, suites/cases, 3-Case pattern, or setups/teardowns* | **`references/placement-and-lifecycle.md`** |
| *Unfamiliar technical acronyms, prefixes, or parameter glossary* | **`references/glossary.md`** |
| *Local exploratory testing, JVM telemetry, execute-testcase outputs* | **`references/exploratory-execution-guide.md`** |

---

## 🧭 MICRO-STATES (Within STATE_RUN_ANALYZE)
When active under the macro state `STATE_RUN_ANALYZE`, track your current micro-state using the Temp State property in the global State Header:

`[State: STATE_RUN_ANALYZE | Temp State: MICRO_STATE | Active Skill: mta-run-analyze]`

1.  `STATE_EXPLORATORY_EXECUTION`: Running local exploratory tests and data seeding directly against the Mendix JVM for Backend Microflows and domain logic via `MTA_plugin.execute-testcase`.
    *   **The 6 Universal MTA Plugin Execution Principles:** (1) Targeted Cluster Discovery (`mxcli` batch queries for all entities/flows), (2) Mandatory Execution User Context (`ExecutorUsername: "MxAdmin"` / `ApplySecurityExecutor: "NONE"`), (3) Verified Entity Fixture Attribute Binding (`PAT-75`, `ANTI-29`), (4) Canonical Data Type Serialization (strict ISO-8601 UTC `yyyy-MM-dd'T'HH:mm:ss.SSS'Z'` for `DateTimeType`, typed scalars, bare enums), (5) Explicit Object Topology & Handle Binding (`TCEX_RQ_Sfar` / `TCEX_RQ_Sfcr`), (6) Execution Mode Governance (`RollbackTcseAfterExecution = "Yes"` with NO trailing `Persist` step by default for exploratory tests to guarantee zero database pollution, or `RollbackTcseAfterExecution = "No"` with a trailing batch `Persist` step for live test data seeding per `PAT-68`).
    *   **Pre-Flight Probing & Fallback:** Verify that the local Mendix runtime is active and the `MTA_plugin` MCP endpoint is reachable. If unreachable, notify the user and offer fallback to Option B (Direct Persistent MTA Test).
    *   **Chained Single-Payload Matrix Assembly & Exhaustive Execution (`PAT-66`, `PAT-73`, `PAT-74`, `PAT-75`, `ANTI-22`, `ANTI-27`, `ANTI-28`, `ANTI-29`):**
        *   *Zero-CLI Re-Query Law:* Pre-compile all variation blocks directly from Section 7 of the approved Execution Plan. Do **NOT** re-run any CLI or model inspection commands during execution.
        *   *Single-Payload Execution Law (`PAT-73`, `ANTI-27`):* When Section 7 defines multiple variations (`VAR_01` through `VAR_0N`), compile all variations into **1 single `TCEX_RQ_TestStepRun` array** dispatched in **1 single `execute-testcase` tool call** with `"ExecutorUsername": "MxAdmin"`, `"ApplySecurityExecutor": "NONE"`, `"RollbackTcseAfterExecution": "Yes"` (or `"true"`), NO trailing `Persist` step, and verified entity attribute members (`PAT-75`). Invoking `execute-testcase` across multiple sequential agent turns is strictly **PROHIBITED** (`ANTI-27`). For explicit test data seeding (`PAT-68`), `"RollbackTcseAfterExecution": "No"` with a trailing batch `Persist` step is applied.
        *   *Pre-Execution AST Conflict Audit (`PAT-74`, `ANTI-28`):* Audit microflow AST for potential single-session conflict vectors: (1) Database XPath queries or aggregate calculations (`COUNT`, `SUM`); (2) Unique constraint / duplicate existence checks; (3) Singleton entity mutations; (4) Non-transactional external side-effects (Java caches / REST APIs).
        *   *Intra-Block Teardown & Disjoint Keys:* For microflows that create or commit database records, insert an intra-block `Delete` step (`TCEX_RQ_Sfdr`) after each microflow call and enforce disjoint synthetic keys across blocks (`VAR01-xxx`, `VAR02-xxx`) to guarantee 100% database isolation under the existing plugin schema.
        *   *Session Isolation Fallback Protocol (`PAT-74`):* If unmanaged external side-effects or persistent cross-scenario contamination is detected, immediately fall back to dispatching each variation as an independent `execute-testcase` session.
        *   *Pure Calculation Microflows:* For calculation microflows with no commits, chain object instantiations and microflow calls sequentially in the single array.
    *   **High-Speed Telemetry Evaluation & Mandatory Benchmark Profile (`PAT-76`, `ANTI-30`):** Compute concrete wall-clock execution duration from tool start/end timestamps and extract `Passed`, `ExecutionDurationInMs`, and `TestStepRunResult` items from `TCEX_RS` for each variation in memory. You **MUST** compute and render the complete **3-Part Performance & Benchmark Profile** (Wall-Clock Throughput, Operations Category Breakdown Table, and Per-Scenario Latency Table). Omitting concrete durations or using uncalculated placeholders is strictly **PROHIBITED** (`ANTI-30`).
    *   **Standard Result Presentation (`PAT-61`, `PAT-76`):** You **MUST** format the execution outcome using the standardized Exploratory Test Execution Report format (aggregating all executed variations in the matrix):
        ```markdown
        ### 📊 MTA EXPLORATORY TEST EXECUTION REPORT

        <details>
        <summary><b>Execution Metadata & Environment Details</b></summary>

        *   **Timestamp:** `[YYYY-MM-DD HH:mm:ss (Local Time)]`
        *   **Run ID:** `[TCEX-YYYYMMDD-HHMMSS-XXXX]`
        *   **Total Wall-Clock Execution Time:** `[X ms]` (computed from tool execution start/completion timestamps)
        *   **Execution User:** `[Username / Roles]`
        *   **Rollback Mode:** `[Retained in Database (RollbackTcseAfterExecution = No) | Automatic (RollbackTcseAfterExecution = Yes)]`
        *   **Execution Throughput:** `[X.X steps/sec | Y ms per step]`

        </details>

        #### 1. Test Goal & Scope
        *   **Goal of the Test:** `[Clear description of what this test verified]`
        *   **Target Component:** `[Target Microflow / Entity / Page]`
        *   **Category:** `[Backend | Frontend]`

        #### 2. Overall Result
        *   **Status:** `[PASS | FAIL | ERROR]`
            *   `PASS`: All steps, microflows, return values, and assertions succeeded.
            *   `FAIL`: Steps executed, but assertions failed (return value / count / validation feedback mismatch).
            *   `ERROR`: Unhandled exception or runtime crash occurred (Java exception / runtime error).
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
    *   **Promotion Prompt & Reverse-Handoff Protocol (`PAT-57`):**
        *   If the run passes, prompt the user:
            > *"The exploratory test executed and passed in [X] ms with full rollback. Would you like to promote this test to a persistent test on the MTA Platform?"*
        *   **If User Confirms Promotion:**
            1. Update State Header: `[State: STATE_BUILD_PLANNING | Temp State: PLAN_STEP_2 | Active Skill: mta-test-design]`
            2. Output the **Reverse State Compaction Block (Promotion Bridge Restore)**:
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
            3. Instruct the user/agent:
               > 🚀 **Promotion Handoff Trigger**: Switched to `mta-test-design` (`PLAN_STEP_2`). Ready to interactively resolve Test Configuration, Test Suite, and Test Case placement (Gate 2), save the execution plan via `SaveExecutionPlan`, and proceed to `STATE_CONSTRUCTION` with full variation container metadata and description persistence (`PAT-77`).

2.  `STATE_LIVE_DATA_PROVISIONING`: Executing live test data provisioning and teardown for manual testing via `MTA_plugin.execute-testcase` (`RollbackTcseAfterExecution = "No"`).
    *   **Targeted Cluster Discovery Protocol:** For data provisioning, inspect all target entities and mandatory associations in a single batched `mxcli` call. Omit optional attributes unless explicitly requested.
    *   **Dual-Requirement Persistence Law (`PAT-21`):** In-memory creations/mutations are only committed to the database when BOTH (1) `RollbackTcseAfterExecution: "No"` is set, and (2) a standalone batch `Persist` step (`{"Action": "Persist"}`) is appended to the end of the step sequence. The `Persist` step is parameterless and MUST NOT have `EntityQualifiedName` or `TCEX_RQ_Sf*` handle mappings.
    *   **Local Executor Context Protocol:** Standard local execution context requires `ExecutorUsername: "MxAdmin"` combined with `ApplySecurityExecutor: "NONE"` to satisfy runtime user identity while bypassing entity access constraints for unhindered seeding.
    *   **Direct Execution Protocol (`PAT-69`):** Execute live data seeding and business microflows directly with `Rollback = "No"` and trailing batch `Persist` by default (committing records directly to the local database without requiring preliminary dry-run loops, unless explicit rollback is requested).
    *   **Data Script Conversion Bridge (`PAT-70`):** After live test data provisioning completes, prompt the user with the explicit 3-choice menu:
        > *"Live test data provisioning completed. Would you like to convert this data setup script into a persistent MTA Platform asset?"*
        > *   **1. Standalone Data Seeding Test Case:** Single persistent test case to generate and keep this data in the database (no teardown).
        > *   **2. Automated Frontend Test Suite (3-Case UI Pattern):** Case 1 (Setup/Seed) + Case 2 (Playwright UI interactions) + Case 3 (Teardown Cleanup).
        > *   **3. Automated Backend Integration Suite (3-Case Backend Pattern):** Case 1 (Setup/Seed) + Case 2 (Microflow calls & assertions) + Case 3 (Teardown Cleanup).
        *   **Promotion Reverse-Handoff Protocol:** Upon the user selecting an option, transition to `mta-test-design` (`[State: STATE_BUILD_PLANNING | Temp State: PLAN_STEP_1 | Active Skill: mta-test-design]`) to draft the formal `# MTA EXECUTION PLAN SIGN-OFF` corresponding to the chosen profile. Direct construction without an approved Execution Plan (Gate 1) and Placement Summary (Gate 2) is strictly **PROHIBITED** (`PAT-43`, `ANTI-14`).

3.  `STATE_EXECUTION_VERIFY`: Triggering persistent MTA test executions (cases, suites, or configurations), polling results, pulling logs, and parsing errors.
    *   **🚨 THE AUTOMATED SELF-REPAIR PROTOCOL (CRITICAL):**
        If a test execution fails during runtime verification, you **MUST NOT** simply report the failure and wait. You **MUST** immediately initiate this automated self-repair loop in the same turn:
        1. **Auto-Retrieve logs:** Immediately call `RetrieveTestRunResults` (and `GetAssertExceptionByTestStep` / `GetAssertValidationFeedbackMessageCompareByTestCase` if applicable) to programmatically pull the failure receipt.
        2. **Perform a Cognitive Reverse Trace:** Analyze the transaction memory of the 5 steps preceding the failing step to check if the error is a cascade from an upstream state modification or invalid validation.
        3. **Formulate the Surgical Fix:** Map the root cause to a precise, actionable modification (e.g., updating a specific input attribute, correcting date format casing, or unskipping a cascading provider).
        4. **Lock in Self-Repair State:** Update your State Header to: `[State: STATE_RUN_ANALYZE | Temp State: STATE_SELF_REPAIR | Active Skill: mta-run-analyze]`.
        5. **Format the Premium Diagnostic Blueprint:** You **MUST** format your diagnostic analysis using this exact standard markdown structure to present your diagnosis and halt for click-to-proceed approval:
        ```markdown
        ### 🚨 MTA RUN FAILURE DIAGNOSTIC & SELF-REPAIR PLAN
        *   **Failing Test Case:** `[TestCaseName]`
        *   **Failing Step Index:** `[StepNumber] - [StepName]`
        *   **Failure Category:** `[e.g., AssertMismatch | Timeout | ClassNotFound | NetworkError]`
        *   **Mendix Exception Log:** `[Exact log snippet or exception trace]`
        *   **Root Cause Analysis (RCA):** `[Concise, technical description pinpointed by the Cognitive Reverse Trace]`
        *   **Proposed Surgical Fix:** `[The exact step edit or attribute correction required to fix the test]`
        ```
4.  `STATE_QA_ASSISTANCE`: Out-of-band QA assistance and conceptual consulting (`PAT-51`). Explaining existing test scripts to developers/testers, analyzing step sequencing, auditing pattern compliance against `references/mta-patterns-and-antipatterns-reference.md`, answering conceptual/general questions, or conducting MTF architecture reviews. When the user's inquiry is resolved, prompt the user with a direct question asking for approval to return to the active task (e.g. `STATE_CONSTRUCTION` or `STATE_BUILD_PLANNING`).

---

## 🔄 MCP Tool Description Context & Bridge Rule

> [!NOTE]
> **MTA Tool Context Mapping:**
> The MTA MCP tools and schemas refer to the "mta skill" or "MTA". Since we have split the monolithic `mta` skill into `mta-build` and `mta-run-analyze`, treat all tool schema references to "mta skill" as referring to these two specialized skills.
