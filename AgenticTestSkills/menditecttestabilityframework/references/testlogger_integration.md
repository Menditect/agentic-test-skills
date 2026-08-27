# TestLogger Helper Component

The **TestLogger Helper Component** provides a process-assurance layer by capturing the internal execution footprint of your application's logic. While standard testing verifies only final database outcomes, the TestLogger records the exact sequence of executed microflows and custom tags to detect "silent failures" (where a process succeeds superficially but silently bypasses a critical internal step, like a tax or compliance check).

---

## 1. Data Capturing & Probes

The TestLogger records a sequence of fully qualified microflow names and optional custom tags, forming an execution **TestPath**.

### 1.1 Probes
Developers insert a **Probe** (a call to the `ORC_tlog_set_testpath` microflow) at key locations in the application's logic.
Each probe is configurable with:
*   **Callstack Offset (Execution Context)**: Determines which microflow name in the current execution callstack to record:
    *   `0`: Records the current microflow (the one containing the probe).
    *   `1`: Records the parent microflow (the caller).
    *   `99` (or depth exceedance): Records the top-level entry microflow.
*   **Contextual Tags**: Custom strings appended to the logged entry to capture dynamic runtime business data (e.g., `"Customer Type: Gold"`, `"OrderID: 9383"`).

### 1.2 Probe Deduplication & Tag Merging
To keep recorded TestPaths clean and highly readable, the Probe automatically applies deduplication:
*   **Duplicate Suppression**: If a microflow name and tag are identical to the previous entry, the repetition is ignored.
*   **Tag Merging**: If a probe is called consecutively within the *same* microflow but with a *new* tag, the new tag is appended to the existing entry instead of creating a new line.

```
// Example resulting TestPath output:
SalesModule.GET_order_latest
SalesModule.OPR_order_create_by_customer, gold, 8393
```

---

## 2. Advanced Control Mechanisms

### 2.1 Logging Boundaries (`LoggingBoundary`)
In complex transactions, a call stack can grow extremely large. To isolate a specific sub-hierarchy of interest:
*   Pass the fully qualified name of the target branch (e.g., `OrderModule.ORC_ordr_set_quantity_and_amount`) to the `loggingBoundary` parameter of `ORC_tlog_start`.
*   The probe becomes context-aware: it will only record entries if the boundary microflow is present in the active callstack, ignoring probes in unrelated process branches to keep the path clean.

### 2.2 Muting the TestLogger
To temporarily suppress logging during specific test sequences (e.g., test setups or generic preparation steps), call `ORC_tlog_mute`. Re-enable logging afterward by calling `ORC_tlog_unmute`.

---

## 3. Best Practices for Probe Placement

> [!TIP]
> **Place Probes in Units, Not Orchestrations**: Always place TestLogger probes within **Unit microflows** (the lowest layer of data manipulation) rather than Orchestration microflows (`ORC_`).
>
> This ensures that process-layer refactoring (restructuring how orchestrations compose logic) will not break or invalidate your recorded regression test paths, so long as the underlying units of work being executed remain unchanged.

---

## 4. Test Case Automation in MTA

1.  **Initialize**: Call `ORC_tlog_start` at the start of your test case in Mendix Test Automation (MTA). This creates a `TLOG` object associated with the current user session.
2.  **Assert**: Review the recorded `TestPath` after a successful manual run. Add it as an **assertion** in MTA.
3.  **Regress**: In subsequent test runs, MTA will verify the internal execution footprint. Any unlogged deviations or missing steps will trigger a test failure, immediately identifying silent logic changes.
