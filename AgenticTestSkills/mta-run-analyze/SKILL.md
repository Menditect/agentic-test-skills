---
name: mta-run-analyze
description: "Focuses on executing tests, retrieving test results, parsing logs, debugging runtime failures, performing static architecture audits, and explaining test case intent/logic to developers or testers (MTA v3.2). Trigger on keywords: MTA run, execute test, view results, why did it fail, debug test, analyze run, troubleshoot, get testsuites, get testcases, show steps, list suites, inspect test, verify structure, explain test case, how does this test work, understand test script, document test suite, audit step sequence."
version: "4.4.0"
changes: "Added in-memory exploratory test runner via MTA Plugin MCP and result diagnostics."
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
5. **State File Key Resolution Law**: Before executing any persistent test case, test suite, or configuration on the MTA platform, check `mta_state.json` to load the exact numeric `key` for the target test case (`test_cases[].key`), test suite (`test_suite.key`), or execution plan (`execution_plan_key`). If `mta_state.json` is missing keys, use read-only discovery tools (`GetTestSuites`, `GetTestCases`) to locate the entity on the MTA server, and immediately update `mta_state.json`. *(Note: Local in-memory exploratory tests executed under `STATE_EXPLORATORY_EXECUTION` via `MTA_plugin.execute-testcase` are strictly EXEMPT from `mta_state.json` key requirements).*
6. **Pattern Audit & Auto-Registration Protocol**: When analyzing existing test cases or auditing step sequences in `STATE_QA_ASSISTANCE`, verify step patterns against `references/mta-patterns-and-antipatterns-reference.md` [^PAT-01..59] [^ANTI-01..18]. If a new pattern or anti-pattern is identified or learned, auto-register it in `mta-patterns-and-antipatterns-reference.md` and add footnote cross-references (`[^PAT-xx]` / `[^ANTI-xx]`) to related instruction lines across skill files.
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

1.  `STATE_EXPLORATORY_EXECUTION`: Running local in-memory exploratory tests directly against the Mendix JVM via `MTA_plugin.execute-testcase`.
    *   **Pre-Flight Probing & Fallback:** Verify that the local Mendix runtime is active and the `MTA_plugin` MCP endpoint is reachable. If unreachable, notify the user and offer fallback to Option B (Direct Persistent MTA Test).
    *   **Action:** Compile approved step sequence into `TCEX_RQ`, invoke `execute-testcase` with `RollbackTcseAfterExecution = "true"`.
    *   **Telemetry Evaluation:** Inspect `TCEX_RS` (durations, return values, `TCEX_RS_ValidationFeedback`, error traces).
    *   **Standard Result Presentation (`PAT-61`):** You **MUST** format the execution outcome using the standardized Exploratory Test Execution Report format:
        ```markdown
        ### 📊 MTA EXPLORATORY TEST EXECUTION REPORT

        #### 1. Test Goal & Scope
        *   **Goal of the Test:** `[Clear description of what this test verified]`
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
            *   `PASS`: All steps, microflows, return values, and assertions succeeded.
            *   `FAIL`: Steps executed, but assertions failed (return value / count / validation feedback mismatch).
            *   `ERROR`: Unhandled exception or runtime crash occurred (Java exception / runtime error).
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
               > 🚀 **Promotion Handoff Trigger**: Switched to `mta-test-design` (`PLAN_STEP_2`). Ready to interactively resolve Test Configuration, Test Suite, and Test Case placement (Gate 2), save the execution plan via `SaveExecutionPlan`, and proceed to `STATE_CONSTRUCTION`.

2.  `STATE_EXECUTION_VERIFY`: Triggering persistent MTA test executions (cases, suites, or configurations), polling results, pulling logs, and parsing errors.
    *   **🚨 THE AUTOMATED SELF-REPAIR PROTOCOL (CRITICAL):**
        If a test execution fails during runtime verification, you **MUST NOT** simply report the failure and wait. You **MUST** immediately initiate this automated self-repair loop in the same turn:
        1. **Auto-Retrieve logs:** Immediately call `RetrieveTestRunResults` (and `GetAssertExceptionByTestStep` / `GetAssertValidationFeedbackMessageCompareByTestCase` if applicable) to programmatically pull the failure receipt.
        2. **Run the 5-Step Reverse Tracer:** Analyze the 5 steps preceding the failing step in transaction memory to check if the error is a cascade from an upstream state modification or invalid validation.
        3. **Formulate the Surgical Fix:** Map the root cause to a precise, actionable modification (e.g., updating a specific input attribute, correcting date format casing, or unskipping a cascading provider).
        4. **Lock in Self-Repair State:** Update your State Header to: `[State: STATE_RUN_ANALYZE | Temp State: STATE_SELF_REPAIR | Active Skill: mta-run-analyze]`.
        5. **Format the Premium Diagnostic Blueprint:** You **MUST** format your diagnostic analysis using this exact standard markdown structure to present your diagnosis and halt for click-to-proceed approval:
        ```markdown
        ### 🚨 MTA RUN FAILURE DIAGNOSTIC & SELF-REPAIR PLAN
        *   **Failing Test Case:** `[TestCaseName]`
        *   **Failing Step Index:** `[StepNumber] - [StepName]`
        *   **Failure Category:** `[e.g., AssertMismatch | Timeout | ClassNotFound | NetworkError]`
        *   **Mendix Exception Log:** `[Exact log snippet or exception trace]`
        *   **Root Cause Analysis (RCA):** `[Concise, technical description pinpointed by the 5-Step Tracer]`
        *   **Proposed Surgical Fix:** `[The exact step edit or attribute correction required to fix the test]`
        ```
3.  `STATE_QA_ASSISTANCE`: Explaining existing test scripts to developers/testers, analyzing step sequencing, verifying pattern compliance, or answering conceptual/general questions.

---

## 🔄 MCP Tool Description Context & Bridge Rule

> [!NOTE]
> **MTA Tool Context Mapping:**
> The MTA MCP tools and schemas refer to the "mta skill" or "MTA". Since we have split the monolithic `mta` skill into `mta-build` and `mta-run-analyze`, treat all tool schema references to "mta skill" as referring to these two specialized skills.
