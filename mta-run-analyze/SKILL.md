---
name: mta-run-analyze
description: "Focuses on executing tests, retrieving test results, parsing logs, debugging runtime failures, performing static architecture audits, and explaining test case intent/logic to developers or testers (MTA v3.2). Trigger on keywords: MTA run, execute test, view results, why did it fail, debug test, analyze run, troubleshoot, get testsuites, get testcases, show steps, list suites, inspect test, verify structure, explain test case, how does this test work, understand test script, document test suite, audit step sequence."
version: "3.2_2.2"
changes: "added platform-agnostic cross-skill redirection rules for vague or onboarding requests"
---

# MTA Execution, Analysis, & Diagnostics Skill

🚨 **MANDATORY CROSS-SKILL REDIRECTION FOR VAGUE / FRESH REQUESTS** 🚨

> [!IMPORTANT]
> **If the user's request is vague, exploratory, indicates they are starting fresh, or asks for prompts/onboarding (e.g., "I want to test", "How to start", "Where do I begin", "Give me some prompts", or "Show me prompts"):**
> *   You **MUST** immediately stop using this `mta-run-analyze` skill.
> *   You **MUST** load and switch to the **`mta-test-design`** skill instead (`.agent/skills/mta-test-design/SKILL.md`).
> *   Follow the onboarding guide and starter prompts in `mta-test-design` to help the user design their test before building or running anything.

🚨 **CRITICAL MTA GUARDRAIL: STOP AND ENFORCE INTERACTIVE DISCOVERY** 🚨

> [!IMPORTANT]
> ### ⚡ POWER-USER GUARDRAIL BYPASS EXCEPTION
> You are permitted to bypass the first-turn HALT and the interactive discovery template if and ONLY if the user's initial prompt explicitly and unambiguously specifies **ALL THREE** of the following parameters:
> 1. The **Test Configuration** name or key (e.g., `"in mta-trial-2"` or `"use config 106"`)
> 2. The **Test Suite** name or key (e.g., `"in suite 'Unit tests'"` or `"suite 225"`)
> 3. The **Test Case** name or placement (e.g., `"create test case 'TC_ValidateLogin'"`)

On the very first turn of a **brand-new Conversation ID** (defined strictly as having no prior MTA activity, state, or parameters recorded in the current session's chat history or compaction resumption summary), you are strictly prohibited from executing **ANY tools of any kind** (including Mendix model analysis commands or other MTA tools), **except** for loading this skill and `references/core-playbook.md` and calling `GetMtaUrl`.

You **MUST** adhere to the following strict chronological order of operations on the first turn of a brand-new Conversation ID:
1. Load this MTA skill and `references/core-playbook.md`.
2. Execute `GetMtaUrl` to retrieve the active workspace's MTA Base URL.
3. Present the interactive discovery question template with the retrieved URL.

---

### 🎯 Interactive Discovery Question Template
```markdown
**Active State:** `STATE_DISCOVERY`

Hello! I can help you run tests, retrieve execution logs, or explain and analyze existing test structures for your application **[AppName]**.

#### 1. Specify Test Placement (Starting Path):
*   **Direct Path:** Specify the Target Configuration and Suite name right now (e.g., *"Run Config 'Staging' and Suite 'Checkout'"* or *"Explain TestCase 'TC_VerifyPayment'"*).
*   **Scan Path (Explore):** Ask me to scan and list all available Test Configurations, Test Suites, or Test Cases so we can explore.
```

---

## 🚫 THE 10 CRITICAL MTA RED LINES (GOLDEN RULES)

You **MUST** strictly follow the 10 Golden Rules defined in `references/core-playbook.md` at all times. Here is a brief checklist of active diagnostic boundaries:
1. **No conversational refusals**: Transition to `[STATE_QA_ASSISTANCE]` if the user asks conceptual, general, or educational questions.
2. **No raw Playwright bypasses**: Rely exclusively on Menditect Frontend Testkit.
3. **Strict State Isolation**: Output your concise chain of thought in the `🧠 Tool Execution Reasoning` format before every tool call.
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

## 🧭 WORKFLOW STATES (THE STATE MACHINE - STATE 8 & QA_ASSISTANCE)

This skill manages runtime execution, post-run logs, failure analysis, static audits, and developer onboarding tutorials. Transition through these states as described in **`references/core-playbook.md`**:

8.  `[STATE_EXECUTION_VERIFY]`: Triggering test executions (cases, suites, or configurations), polling results, pulling logs, and parsing errors.
    *   **MTA Premium Diagnostic Blueprint (CRITICAL):**
        Whenever a test run execution fails during `[STATE_EXECUTION_VERIFY]`, you **MUST** retrieve and parse the logs, then format your diagnostic analysis using this exact standard markdown structure (do not use ad-hoc layouts):
        ```markdown
        ### 🚨 MTA RUN FAILURE DIAGNOSTIC
        *   **Failing Test Case:** `[TestCaseName]`
        *   **Failing Step Index:** `[StepNumber] - [StepName]`
        *   **Failure Category:** `[e.g., AssertMismatch | Timeout | ClassNotFound | NetworkError]`
        *   **Mendix Exception Log:** `[Exact log snippet or exception trace]`
        *   **Root Cause Analysis (RCA):** `[Concise, technical description of why the step failed]`
        *   **Surgical Fix Action:** `[The exact action, step refactoring, or parameter adjustment required to fix the test]`
        ```
-   `[STATE_QA_ASSISTANCE]`: Explaining existing test scripts to developers/testers, analyzing step sequencing, verifying pattern compliance, or answering conceptual questions.

---

## 🔄 MCP Tool Description Context & Bridge Rule

> [!NOTE]
> **MTA Tool Context Mapping:**
> The MTA MCP tools and schemas refer to the "mta skill" or "MTA". Since we have split the monolithic `mta` skill into `mta-build` and `mta-run-analyze`, treat all tool schema references to "mta skill" as referring to these two specialized skills.
