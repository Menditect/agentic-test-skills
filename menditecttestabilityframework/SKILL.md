---
name: menditecttestabilityframework
description: "This skill enables the agent to design, implement, and review Mendix applications according to the **Menditect Testability Framework (MTF) v2.0**. By adhering to this skill, the agent ensures that all Mendix logic is modular, highly testable, robust, and maintains high standards of data quality and maintainability."
version: "2.0_1.3"
changes: "Wrapped description in double quotes to prevent YAML parsing issues."
---

# Skill: Menditect Testability Framework (MTF)

This skill enables the agent to design, implement, and review Mendix applications according to the **Menditect Testability Framework (MTF) v2.0**. By adhering to this skill, the agent ensures that all Mendix logic is modular, highly testable, robust, and maintains high standards of data quality and maintainability.

## Core Directives

When writing, refactoring, or reviewing Mendix code, you must strictly follow these five core directives:

1. **Design for Test (DFT)**: Prioritize testability and structure over ad-hoc implementation. Support a clear Testing Pyramid (Unit -> Component/Integration -> Functional UI) by writing small, isolated, single-purpose microflows.
2. **Apply Separation of Concerns (SoC)**: Partition your application horizontally into clear layers (Touchpoint Layer, App Logic Layer, and Domain Layer) and vertically into functional components (Mendix modules).
3. **Use Mendix-style Dependency Injection (DI)**: Avoid retrieving database objects or global settings deep within business logic. Separate data retrieval from business logic by fetching data at the process entry points and passing it as input parameters.
4. **Enforce Microflow Typologies**: Every microflow must belong to a predefined typology (e.g., `ACT_` Touchpoint, `ORC_` Orchestration, `OPR_` Operator, `GET_` Getter, `VAL_` Validation) with a strict responsibility and allowed call hierarchy.
5. **Enforce Transactional Atomicity and Consistency (ACID)**: Centralize all database writes and deletes in dedicated Committer (`CMT`) microflows, and execute server-side Invariant validations (`VAL`) within the `CMT` before any data is committed.

---

## Skill Components & Reference Guidelines

This skill is composed of the following detailed reference files located in the `skills/references/` directory:

*   **[Microflow Typologies](references/microflow_typologies.md)**: Details the exact responsibility, pattern, and allowed calling hierarchy for Touchpoint, Orchestration, and Unit microflows.
*   **[Naming Conventions](references/naming_conventions.md)**: Outlines the prefix-based naming rules for microflows, pages, variables, parameters, and entities (including four-letter codes).
*   **[Testable App Architecture](references/testable_app_architecture.md)**: Explains horizontal/vertical layering, public/private encapsulation, Depth-first vs. Breadth-first processing, and Mendix-style Dependency Injection (DI) patterns.
*   **[Data Quality & ACID Principles](references/data_quality_acid.md)**: Defines transactional scopes, invariant vs. variant rules, error handling limitations, and the Committer (`CMT`) pattern sequence.
*   **[Practical Developer Workflow](references/developer_workflow.md)**: Details the "Wishful Thinking" interface design process and the step-by-step Software Testing Pyramid implementation workflow.
*   **[TestLogger Integration](references/testlogger_integration.md)**: Outlines the configuration and usage of the TestLogger component, contextual probes, deduplication, logging boundaries, muting, and automated assertions.
*   **[Terms of Use](references/terms_of_use.md)**: Defines the terms governing your access and use of the Menditect Testability Framework, licensing obligations (Apache 2.0), user prohibited conduct, disclaimers, and EU Digital Services Act (DSA) points of contact.


---

## Agent Checklist for Mendix Code Reviews

Use this checklist to evaluate your own proposals or verify existing Mendix microflows:

- [ ] **Prefix Match?** Does the microflow name start with an approved prefix (e.g., `ACT_`, `ORC_`, `GET_`, `OPR_`, `VAL_`, `FTN_`, `CMT_`, `VAL_ORC_`) that matches its actual behaviour?
- [ ] **Single Responsibility?** If the microflow description requires the word "and", it is doing too much. Can it be divided into separate Units?
- [ ] **No Hidden Retrieves (DI)?** Is the microflow "asking" for the data it needs via input parameters instead of "looking" for it with retrieve activities?
- [ ] **Isolatable Unit?** Is a Unit microflow strictly isolated (i.e. does not call other microflows, with the sole exception of nested `GET_` calling another `GET_` or `FTN_` calling another `FTN_` of the exact same typology) so it is simple to unit test?
- [ ] **Allowed Calls?** Does the microflow follow the strict call hierarchy? (e.g., a Unit never calls an Orchestration; a Committer `CMT` never calls a data-mutating Operator `OPR`).
- [ ] **Encapsulated?** If this microflow is an internal implementation detail, is it marked as private (prefixed with an underscore, e.g. `_ORC_`)?
- [ ] **Centralized Commit?** Are there any database commits or deletes happening outside a dedicated `CMT_` microflow? If so, refactor them into a `CMT_` microflow.
- [ ] **Server-Side Validation?** Are Invariant validations (`VAL_`) executed in the `CMT` back-end layer before any commit is processed?
- [ ] **Return Values for Testability?** Do Unit and Touchpoint microflows have return values? Having a return value makes it much easier to assert on the returned outcome directly in unit tests or to pipe the output as input to downstream change or microflow parameter steps in MTA.
- [ ] **Safe Event Handlers?** If Before-Commit event handlers are implemented, are they used exclusively for Data Augmentation (e.g., timestamps/logging) and configured to **always return `true`**? Are business validations (`VAL_`) kept strictly out of event handlers?
- [ ] **Explicit Scope Pattern?** Is a clear, consistent transactional scope pattern (List-based, Main Object, or Helper NPE) declared and correctly managed through the `CMT_` execution sequence?
