---
name: mta-run-analyze
description: "Focuses on executing tests, retrieving test results, parsing logs, debugging runtime failures, performing static architecture audits, and explaining test case intent/logic to developers or testers (MTA v3.2). Trigger on keywords: MTA run, execute test, view results, why did it fail, debug test, analyze run, troubleshoot, get testsuites, get testcases, show steps, list suites, inspect test, verify structure, explain test case, how does this test work, understand test script, document test suite, audit step sequence."
version: "4.2.4"
changes: "authorized read-only MTA Get tools and updated diagnostic rules"
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
> You are **ALWAYS authorized** to execute read-only MTA `Get*` MCP tools (e.g. `GetMtaUrl`, `GetApplicationByName`, `GetTestConfigurationsForApplicationKey`, `GetTestSuites`, `GetTestCases`, `GetTestSteps`, `GetPages`, `GetWidgets`, `GetExecutionUsers`, `RetrieveTestRunResults`) at any time, including on the very first turn of a request.
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
4. **Strict Direct Link Formatting**: Web links must follow `[MtaBaseUrl]/p/[ObjectType]/[Key]` exactly.

---

## 📅 STRICT REACTIVE LOADING STRATEGY

To maximize token efficiency, **DO NOT load reference files preemptively**, except for `core-playbook.md` on the first active turn. Load other reference files **strictly on-demand** based on the request:

| User request mentions... | ...then load ONLY this file: |
| --- | --- |
| *MTA request startup, workflow states, transitions, or core rules* | **`references/core-playbook.md`** (Preemptive) |
| *Failing runs, runtime errors, log diagnostics, retry logic, or debugging* | **`references/troubleshooting.md`** |
| *Test structure hierarchy, suites/cases, 3-Case pattern, or setups/teardowns* | **`references/placement-and-lifecycle.md`** |
| *Unfamiliar technical acronyms, prefixes, or parameter glossary* | **`references/glossary.md`** |

---

## 🧭 MICRO-STATES (Within STATE_RUN_ANALYZE)
When active under the macro state `STATE_RUN_ANALYZE`, track your current micro-state using the Temp State property in the global State Header:

`[State: STATE_RUN_ANALYZE | Temp State: MICRO_STATE | Active Skill: mta-run-analyze]`

### Run & Analyze Micro-States:
1.  `STATE_EXECUTION_VERIFY`: Triggering test executions (cases, suites, or configurations), polling results, pulling logs, and parsing errors.
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
2.  `STATE_QA_ASSISTANCE`: Explaining existing test scripts to developers/testers, analyzing step sequencing, verifying pattern compliance, or answering conceptual/general questions.

---

## 🔄 MCP Tool Description Context & Bridge Rule

> [!NOTE]
> **MTA Tool Context Mapping:**
> The MTA MCP tools and schemas refer to the "mta skill" or "MTA". Since we have split the monolithic `mta` skill into `mta-build` and `mta-run-analyze`, treat all tool schema references to "mta skill" as referring to these two specialized skills.
