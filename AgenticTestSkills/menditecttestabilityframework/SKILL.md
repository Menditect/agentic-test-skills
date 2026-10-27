---
name: menditecttestabilityframework
description: "Design and implement Mendix apps according to the Menditect Testability Framework MTF v2"
version: "2.0_1.9.0"
changes: "Added top-level State Dispatch Table (STATE_PATTERN_AUDIT, STATE_REFACTOR_PLANNING, STATE_TRANSACTION_ALIGN) and deduplicated reactive reference loading tables."
---

# Skill: Menditect Testability Framework (MTF v2.0)

This skill guides designing, implementing, refactoring, and reviewing Mendix applications according to the **Menditect Testability Framework (MTF) v2.0** so Mendix logic is modular, isolated, and directly testable in MTA.

---

## 🧭 State Dispatch Table (`STATE_BUILD_PLANNING` / `STATE_QA_ASSISTANCE`)

Track progress in the global State Header: `[State: STATE_BUILD_PLANNING | Temp State: <TEMP_STATE> | Active Skill: menditecttestabilityframework]` (or `STATE_QA_ASSISTANCE (Paused: <PRIOR_TEMP_STATE>)` on topic interrupts per `PAT-51`).

| `Temp State` | Entry Condition | Mandatory Actions & Self-Audit | Allowed Mutating Tools | Next State Transition |
| :--- | :--- | :--- | :--- | :--- |
| **`STATE_PATTERN_AUDIT`** | Reviewing existing Mendix microflows, naming prefixes, parameters, or call hierarchies | Audit microflow prefixes (`ACT_`, `ORC_`, `GET_`, `OPR_`, `VAL_`, `FTN_`, `CMT_`, `VAL_ORC_`), Dependency Injection (no hidden retrieves), and call hierarchy rules using the 11-point MTF Code Review Checklist | None (Read-only model inspection only) | `STATE_REFACTOR_PLANNING` or return to `mta-test-design` (`PLAN_STEP_1`) |
| **`STATE_REFACTOR_PLANNING`** | Resolving architectural debt (hidden retrieves, mixed responsibilities, untestable void flows) | Outline a refactoring blueprint using "Wishful Thinking" interface modeling, horizontal layering (Touchpoint, App Logic, Domain), and clear return values for MTA parameter piping | None during planning (or Studio Pro refactoring tools when explicitly instructed by user outside MTA test quarantine) | `STATE_TRANSACTION_ALIGN` or `mta-test-design` (`PLAN_STEP_1`) |
| **`STATE_TRANSACTION_ALIGN`** | Aligning database commits, deletes, or invariant validations with ACID rules | Centralize all commits/deletes into atomic Committer (`CMT_`) microflows, position server-side Invariant validations (`VAL_`) inside `CMT_` prior to commit, and declare transactional scope (List-based, Main Object, or Helper NPE) | None during audit (or Studio Pro refactoring tools when explicitly instructed by user) | Return to active MTA testing state |

---

## 🛠️ 5 Core Directives & 11-Point Code Review Checklist

### Core Directives:
1. **Design for Test (DFT):** Support the Testing Pyramid (Unit -> Component/Integration -> Functional UI) via small, single-purpose microflows with explicit return values.
2. **Separation of Concerns (SoC):** Partition horizontally into **Touchpoint (`ACT_`)**, **App Logic (`ORC_`, `OPR_`)**, and **Domain (`CMT_`, `VAL_`, `GET_`)** layers, and vertically into functional Mendix modules.
3. **Mendix-Style Dependency Injection (DI):** Fetch data at process entry points and pass objects as input parameters rather than retrieving database objects or global settings deep inside business logic.
4. **Strict Microflow Typologies:** Enforce typology prefixes (`ACT_`, `ORC_`, `GET_`, `OPR_`, `VAL_`, `FTN_`, `CMT_`, `VAL_ORC_`), private underscore encapsulation (`_ORC_`), and allowed call hierarchies.
5. **Transactional Atomicity & Consistency (ACID):** Centralize all database writes and deletes in dedicated Committer (`CMT_`) microflows and execute server-side Invariant validations (`VAL_`) inside `CMT_` before committing.

### 11-Point MTF Review & Pre-Response Self-Audit Checklist:
- [ ] **1. Prefix Match:** Does the microflow name start with an approved typology prefix matching its behavior?
- [ ] **2. Single Responsibility:** If the description requires *"and"*, split it into separate Unit microflows.
- [ ] **3. No Hidden Retrieves (DI):** Does the microflow ask for data via input parameters instead of database retrieve activities?
- [ ] **4. Isolatable Unit:** Is every Unit microflow isolated (calling no other microflows except nested `GET_ -> GET_` or `FTN_ -> FTN_`)?
- [ ] **5. Allowed Call Hierarchy:** Does the flow respect call hierarchy (e.g., Unit never calls Orchestration; `CMT_` never calls data-mutating `OPR_`)?
- [ ] **6. Encapsulation:** Are internal implementation flows prefixed with an underscore (`_ORC_`)?
- [ ] **7. Centralized Commit:** Are all database commits and deletes inside dedicated `CMT_` microflows?
- [ ] **8. Server-Side Validation:** Are Invariant validations (`VAL_`) executed inside `CMT_` before any write?
- [ ] **9. Return Values for Testability:** Do Unit and Touchpoint flows return values for direct MTA assertions and parameter piping?
- [ ] **10. Safe Event Handlers:** Are Before-Commit event handlers limited to Data Augmentation (always returning `true`) with zero business validations (`VAL_`)?
- [ ] **11. Explicit Transactional Scope:** Is a List-based, Main Object, or Helper NPE transactional scope consistently managed through `CMT_`?

---

## 📅 Strict Reactive Reference Loading Strategy

Do NOT load reference files preemptively; load strictly on-demand based on the user's focus:

| User Request Focus | Reference File (`references/`) | Summary of Contents |
| :--- | :--- | :--- |
| *Microflow prefixes, responsibilities & call hierarchy* | **[microflow_typologies.md](references/microflow_typologies.md)** | Touchpoint, Orchestration, and Unit typologies and allowed call graph |
| *Naming rules for variables, parameters, entities & modules* | **[naming_conventions.md](references/naming_conventions.md)** | Prefix naming rules and four-letter entity codes |
| *Dependency injection, horizontal/vertical layering & encapsulation* | **[testable_app_architecture.md](references/testable_app_architecture.md)** | Layering, public/private encapsulation, Depth-first vs Breadth-first, and DI |
| *Transactional scopes, commits & invariant validations* | **[data_quality_acid.md](references/data_quality_acid.md)** | ACID scopes, invariant vs variant rules, and `CMT_` sequence |
| *Testing pyramid, "Wishful Thinking" & developer workflow* | **[developer_workflow.md](references/developer_workflow.md)** | Interface-first design and step-by-step testing pyramid workflow |
| *Contextual logging probes, TestLogger & assertions* | **[testlogger_integration.md](references/testlogger_integration.md)** | TestLogger configuration, probes, deduplication, muting, and assertions |
| *Licensing terms, Apache 2.0 notices & DSA contacts* | **[terms_of_use.md](references/terms_of_use.md)** | Apache 2.0 license obligations, disclaimers, and EU DSA contact points |
