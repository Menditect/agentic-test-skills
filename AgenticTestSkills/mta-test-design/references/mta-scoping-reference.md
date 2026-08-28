# MTA Test Design & Scoping Reference

This cheat-sheet provides a highly condensed, high-density summary of test configuration scoping, coverage rules, and design handoff specifications.

---

## Test Suite & TestCase Scoping

Structure test containers cleanly within your application instance boundaries:

*   **Test Configurations:** Group your test suites under specific execution contexts (e.g. `Unit tests`, `Regression Suite`).
*   **Test Suites:** Segment test cases logically by module or functional domain (e.g. `SalesSuite`, `InventorySuite`).
*   **Test Cases:** Construct isolated, individual execution flows with a single, clear test responsibility (e.g. `TC_CreateOrder_Success`).

---

## Coverage Calibration

MTA allows you to target and measure test coverage metrics across Mendix microflows and nanoflows:

*   **Coverage Calculation:** Programmatically determined by analyzing the percentage of model elements executed during a test run.
*   **Coverage Goals:** Establish a target coverage percentage (e.g. 80%) for specific critical modules.
*   **Exclude Filters:** Exclude trivial or boilerplate microflows (e.g. helpers, custom login flows, or third-party marketplace dependencies) from your coverage denominator to keep metrics actionable.
*   **Coverage Exceptions:** Define specific, explicitly approved microflows that are exempted from target goals due to architectural constraints.

---

## Design Handoff Blueprint

When finishing the test scoping and design phase (`STATE_BUILD_PLANNING`), the agent formats the output as a formal **Execution Plan Blueprint** (`# MTA EXECUTION PLAN SIGN-OFF`) adhering to the uniform 8-section visual schema:

*   **Pre-Approval Quality Audit Banner & Checklist:** 3-tier status alert + expandable 13-point compliance checklist table (`[CHECK 1]` to `[CHECK 13]`).
1. **Section 1: State Compaction & Target Placement:** Collapsible `<details>` block with Session Compaction JSON block and target application metadata bullets.
2. **Section 2: Prompt & Input Log vs. MTA Skill Conflicts (MANDATORY):** Collapsible `<details>` block with conflict audit table and automatic skill corrections.
3. **Section 3: Test Case Scope & Dual-Risk Profile:** Structured markdown tables for Functional Specification Profile and Dual-Risk Alignment & Mitigation Profile.
4. **Section 4: Verified Model Elements & Testability Profile:** Structured markdown table of verified model elements (Microflow, Entity, Page, Widget, Navigation).
5. **Section 5: Chronological Step Sequence Plan:** Test case container settings (`RollbackTcseAfterExecution`, validation assertions) + clean **Step Sequence Matrix** overview table (zero in-cell HTML) + standalone collapsible step drilldowns (`<details><summary><b>Step N: ...</b></summary>`) containing the 8 uniform bullet properties.
6. **Section 6: Playwright / Browser Settings (10 Keys):** Collapsible `<details>` block with 10-key browser environment settings table (`open` for Frontend, closed/NA for Backend).
7. **Section 7: Data Variation Matrix & Metadata:** Structured horizontal $M \times N$ matrix table (max 8 columns) + collapsible Scenario Registration Metadata and Recipes block.
8. **Section 8: Applied Testing Patterns & Rationale:** Collapsible `<details>` block with Applied Testing Patterns & Architecture Laws table (`Applied Pattern`, `Target Step(s)`, `Law Citation`, `Applied Rationale`).

*   Read: [MTA Test Design Skill](../../mta-test-design/SKILL.md) | [MTA Master Pattern Index](mta-patterns-and-antipatterns-reference.md)
