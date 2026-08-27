# 📋 MTA Execution Diagnostics & Analysis Reference

This cheat-sheet provides a highly condensed, high-density summary of test execution trigger APIs, log diagnostics, and standard debugging blueprints.

---

## 🚀 Execution & Results Retrieval

Trigger tests and analyze results programmatically using these core tools:

| Action | MCP Tool | Purpose / Key Parameters |
| :--- | :--- | :--- |
| **Execute Configuration** | `ExecuteTestConfiguration` | Starts execution for an entire configuration key. |
| **Execute Suite** | `ExecuteTestSuite` | Starts execution for a specific test suite. |
| **Execute TestCase** | `ExecuteTestCase` | Runs a single test case immediately. |
| **Retrieve Results** | `RetrieveTestRunResults` | Pulls the active execution status, logs, and failure details. |

---

## 🩺 MTA Premium Diagnostic Blueprint

When analyzing a failed test run or parsing console logs, you **MUST** format your report to the user using this standardized diagnostic schema:

```markdown
### 🚨 Failed Run Diagnostic Report
- **Failing TestCase:** `ModuleName.TC_TestCaseName`
- **Failing Step:** Step #N (e.g. "Retrieve Object step")
- **Failure Category:** [e.g. Assertion Failure / Mendix Exception / Timeout]

#### 📄 Mendix Exception Log
```text
[Mendix error stack trace if available]
```

#### 🔍 Root Cause Analysis (RCA)
[A concise explanation of why the failure occurred, referencing state or data issues]

#### 🛠️ Surgical Fix Action
[An actionable, line-by-line recommendation to resolve the error]
```

---

## 🔍 Diagnostic & Analysis Elements

### 1. Recordings
Recordings capture chronological execution checkpoints. Access them using result-retrieval APIs to trace exactly which steps were reached before a crash.

### 2. Snapshots
MTA captures full database and memory state snapshots during runtime assertions. Compare snapshots between successful and failing runs to pinpoint unwanted side-effects.

### 3. Archive Checks
Review historic execution archives using `RetrieveTestRunResults` to isolate whether a failure is intermittent, environmental, or directly tied to a recent model revision push.
