# Data Quality & ACID Principles

While the Mendix platform handles Isolation (I) and Durability (D) out of the box, developers are responsible for implementing **Atomicity (A)** and **Consistency (C)**. The Menditect Testability Framework establishes strict patterns to safeguard these transactional guarantees.

---

## 1. Atomicity: The Transactional Scope

Atomicity guarantees that database modifications are **"all or nothing."** All object creations, modifications, and deletions within a transaction must succeed together, or all must be rolled back.

To manage this, we introduce the concept of a **Scope**—a collection of all mutated objects in a single business transaction.

### 1.1 List-Based Scope Details
In this pattern, lists of modified objects are passed through the microflow hierarchy and committed together at the end. To implement it correctly:

*   **Scope Creation**:
    1.  **Touchpoint Microflows**: For objects created or changed directly by user input, the Touchpoint initializes an empty list and adds the mutated object.
    2.  **Top Orchestration Microflows**: For objects modified later by internal logic (e.g., in `OPR_` or `CON_` layers), the Top Orchestration initializes empty list variables.
    *   The combination of these lists forms the complete transactional scope.
*   **Preventing Duplicate Objects**: If an object is updated and added to a list multiple times, the list will contain duplicate references, causing inconsistent commits.
    *   *Solution*: Implement a dedicated `add to scope` helper microflow for each entity that removes any previous instance of that object from the list before adding the updated version.
*   **Naming Convention**: Always prefix or suffix scope parameters with a distinct name like `<entityname>_toCommit` or `<entityname>_toDelete` to distinguish them from standard parameters.
*   **Processing Options**:
    *   **Option A (Separate Lists)**: Maintain distinct parameter lists for objects to be committed vs. deleted.
    *   **Option B (Single List)**: Use one consolidated list, but add a `MutationType` attribute (Boolean or Enumeration) to the objects to indicate whether to Create, Update, or Delete.

### 1.2 Targeted Rollbacks
When a business validation fails, only "non-touchpoint" changes (the lists created by the Top Orchestrations) should be rolled back.
*   **Preserve Touchpoint Changes**: Mutated objects representing direct user input (on the list initialized by the Touchpoint) must be preserved in memory (not rolled back) to ensure that the user's initial screen inputs are not lost on failure.

---

## 2. Consistency: Invariant vs. Variant Rules

Consistency ensures that every transaction successfully moves the system from one valid state to another valid state. We categorize business validations into two types:

### 2.1 Invariant Validations (Data Integrity)
*   **Definition**: Rules that must *always* hold true, regardless of context or time (e.g., `Order_Amount` must be $\ge$ €100).
*   **Implementation**: Done via Validation (`VAL_`) unit microflows.
*   **Enforcement**: Must be executed by the Committer (`CMT_`) right before committing objects to the database. Even if called early in touchpoints for UI feedback, the CMT remains the authoritative gatekeeper.

### 2.2 Variant Validations (Process Validation)
*   **Definition**: Context-dependent rules that confirm an action is valid *at the moment of execution* (e.g., "The customer must have a valid credit card *when placing an order*").
*   **Implementation**: Evaluated inside Orchestration (`ORC_`) flows using standard decision activities or Rule (`RULE_`) microflows.

---

## 3. Why Error Handlers Fail as Data Integrity Tools

Developers sometimes attempt to use Mendix Error Handlers around database commit actions to catch validation failures and handle rollbacks. **This is a severe architectural anti-pattern.**

Standard error handling mechanisms prove inadequate for data validation due to two fundamental conflicts:

1.  **Feedback Suppression (Native Rollback)**: Re-throwing an error via an Error Event successfully rolls back the database and memory context. However, it blinds the user by suppressing "pink" field highlighting and helpful error messages, replacing them with a generic, unhelpful system exception.
2.  **State Synchronization (Dirty/Destroyed State)**: Catching an error with standard End Events or Custom without Rollback preserves the UI but forces synchronization of dirty states to the Client Cache, contaminating the browser. Furthermore, if manual rollback actions are applied, any uncommitted objects are destroyed in memory, rendering the UI unresponsive.

> [!IMPORTANT]
> **Conclusion**: Error handlers are a technical safety net for technical recovery, NOT a business validation tool.
>
> To achieve data integrity without sacrificing user experience, you must isolate validation from the transaction commit cycle. Always execute server-side validations (`VAL_`) within the Committer (`CMT_`) *before* triggering any Mendix database commit actions.

---

## 4. Committer Pattern (CMT)

The Committer (`CMT`) microflow typology is the **single point of database interaction** for saving or deleting objects.

### Standard CMT Execution Sequence
A standard Committer pattern must strictly execute these five steps in order:

```mermaid
graph TD
    S1[1. Retrieve Scope Objects] --> S2[2. Validate Scope: Execute Invariant VALs]
    S2 -->|Fail| S4[4. Guarantee Rollback]
    S2 -->|Success| S3[3. Execute Database Action: Commit/Delete]
    S3 --> S5[5. Clean up & Persist]
```

1.  **Retrieve Scope Objects**: Collect all mutated objects belonging to the transaction scope (relevant for Main Object and Helper NPE scopes).
2.  **Validate Scope**: Invoke all relevant Invariant Validation (`VAL_`) microflows.
3.  **Execute Database Action**: Perform the native Mendix Commit or Delete actions on the scope objects.
4.  **Guarantee Rollback**: If validation fails or the database action encounters an error, rollback all objects that are not directly manipulated by the UI page parameter to revert changes in memory.
5.  **Persist & Cleanup**: Finalize any post-transaction requirements and delete/clean up any Non-Persistent Helper Objects.
