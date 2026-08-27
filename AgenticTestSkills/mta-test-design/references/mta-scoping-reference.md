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

When finishing the test scoping and design phase (`STATE_BUILD_PLANNING`), the agent formats the output as a formal **Execution Plan Blueprint** adhering to the uniform 8-section schema:

1. **Section 1: Test Case Metadata & Target Placement** (Category, Placement, Execution User, Playwright Settings)
2. **Section 2: Prompt & Input Log vs. MTA Skill Conflicts (MANDATORY)** (Explicit audit of prompt against MTA Skill Laws)
3. **Section 3: Scope, Purpose & Risk Alignment** (Functional Purpose, Technical Risk, Business Risk, Pyramid Level)
4. **Section 4: Verified Model Elements & MTF Testability Check** (Entities, Microflows, Pages/Widgets)
5. **Section 5: Chronological Teststep Execution Sequence** (Uniform 8-field schema per step)
6. **Section 6: Playwright / Browser Settings (10 Keys)** (Playwright browser configuration on suite / setup case)
7. **Section 7: Data Variation Matrix & Metadata** (Consolidated scenarios, $M \times N$ matrix, horizontal max 8-column layout)
8. **Section 8: Applied Testing Patterns & Rationale** (Citation of canonical `PAT-xx` / `ANTI-xx` IDs and rationale)

*   👉 **Read:** [MTA Test Design Skill](../../mta-test-design/SKILL.md) | [MTA Master Pattern Index](mta-patterns-and-antipatterns-reference.md)
