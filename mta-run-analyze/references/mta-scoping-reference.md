# 📋 MTA Test Design & Scoping Reference

This cheat-sheet provides a highly condensed, high-density summary of test configuration scoping, coverage rules, and design handoff specifications.

---

## 📐 Test Suite & TestCase Scoping

Structure test containers cleanly within your application instance boundaries:

*   **Test Configurations:** Group your test suites under specific execution contexts (e.g. `Unit tests`, `Regression Suite`).
*   **Test Suites:** Segment test cases logically by module or functional domain (e.g. `SalesSuite`, `InventorySuite`).
*   **Test Cases:** Construct isolated, individual execution flows with a single, clear test responsibility (e.g. `TC_CreateOrder_Success`).

---

## 📊 Coverage Calibration

MTA allows you to target and measure test coverage metrics across Mendix microflows and nanoflows:

*   **Coverage Calculation:** Programmatically determined by analyzing the percentage of model elements executed during a test run.
*   **Coverage Goals:** Establish a target coverage percentage (e.g. 80%) for specific critical modules.
*   **Exclude Filters:** Exclude trivial or boilerplate microflows (e.g. helpers, custom login flows, or third-party marketplace dependencies) from your coverage denominator to keep metrics actionable.
*   **Coverage Exceptions:** Define specific, explicitly approved microflows that are exempted from target goals due to architectural constraints.

---

## 🎯 Design Handoff Blueprint

When finishing the test-design scoping phase (`STATE_PROMPT_GENERATION`), you **MUST** format the output as a clean, standardized, and build-ready handoff prompt for `mta-build`:

```markdown
### 📋 MTA Test Case Specification & Handoff
- **MTA Configuration:** `Configuration Name`
- **MTA Test Suite:** `Test Suite Name`
- **MTA Test Case:** `TC_TestCaseName`
- **Verified Entities:** `ModuleName.EntityName`
- **Scoping Profile:** [High/Medium/Low Risk]

#### 🎬 Chronological Step Specifications
1.  **Step 1:** [Detail action and target, e.g. "Create Object of ModuleName.Order"]
2.  **Step 2:** [Detail action, e.g. "Call Microflow ModuleName.ACT_CalculateTotal"]
3.  **Step 3:** [Detail assert, e.g. "Assert attribute Total equals 100.0"]
```
