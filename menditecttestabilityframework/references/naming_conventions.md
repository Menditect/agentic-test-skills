# Naming Conventions

Consistent naming conventions make Mendix applications readable, maintainable, and discoverable. The Menditect Testability Framework structures names around the *purpose* and *typology* of the element.

---

## 1. Microflow Naming Conventions

The general microflow pattern is:
`[_]PREFIX_[SUBTYPE_]Entity_Name[_Context]_Action`

*   `[_]`: An optional leading underscore indicates a **Private** microflow (internal to its layer or module).
*   `PREFIX`: The capitalized capital-letter prefix of the Microflow Typology.
*   `SUBTYPE`: Optional capital-letter sub-classification to indicate specific triggers or details.
*   `Entity_Name`: The primary domain model entity involved (often abbreviated as a 4-letter code).
*   `Action`: A descriptive verb in lowercase describing the function of the microflow.

### Convention by Typology Category

#### Touchpoints
*   **Pattern**: `{TYPOLOGY PREFIX}_{touchpoint name}_{action}`
*   **Examples**:
    *   `ACT_order_newedit_save` (Action on `Order_NewEdit` page to save)
    *   `ACT_DS_order_get_orderlines` (Data source for order lines)
    *   `ACT_EVT_order_onleave` (Event-triggered on-leave action)

#### Orchestrations
*   **Pattern**: `{TYPOLOGY PREFIX}_{main object name}_{action}`
*   **Examples**:
    *   `ORC_order_process_subscription`
    *   `ORC_email_send_notification`
    *   `_ORC_order_set_amount` (Private sub-orchestrator)

#### Units
*   **Pattern**: `{TYPOLOGY PREFIX}_{main object/parameter}_{action/check}`
*   **Examples**:
    *   `FTN_email_format` (Formats email string)
    *   `GET_orderline_by_order` (Retrieves list of order lines)
    *   `OPR_order_create` (Creates order in memory)
    *   `VAL_order_start_before_end` (Validates start date precedes end date)

---

## 2. Common Sub-Typing Prefixes

Sub-typing is appended to the main prefix with an underscore:

*   `ACT_DS`: Identifies a data source microflow for a page.
*   `ACT_EVT`: Identifies page-event-triggered microflows (e.g., On Leave, On Change).
*   `ACT_ORC`: Identifies page-specific orchestration logic that is not generic enough for `ORC_`.
*   `ORC_CMT`: Distinguishes orchestration microflows that end in a call to a Committer (`CMT_`).
*   `GET_M`: Unit getter retrieving by association (from memory / **M**emory).
*   `GET_D`: Unit getter retrieving directly from the **D**atabase.

---

## 3. Four-Letter Entity Codes

To prevent microflow, variable, and parameter names from becoming excessively long, the framework encourages assigning each Entity a **four-letter uppercase code** (e.g., `ORDR` for `Order`, `CTMR` for `Customer`, `ODLN` for `OrderLine`).

When using entity codes, the codes replace the entity name in variables, parameters, and microflows:
*   Instead of: `GET_D_customer_by_order`
*   Use: `GET_D_ctmr_by_ordr`

This allows quick filtering in Mendix Studio Pro and makes names concise while preserving exact semantic context.

---

## 4. Other Naming Standards

### Pages
*   **Pattern**: `{Main_Entity}_{Operation_or_Context}`
*   **Examples**: `Customer_Overview`, `Order_NewEdit`, `Dashboard_Main`

### Entities
*   **Pattern**: Singular nouns in UpperCamelCase.
*   **Examples**: `Customer`, `OrderLine`, `Product`

### Variables & Parameters
Use camelCase starting with lowercase or the abbreviated four-letter entity code in uppercase:

| Variable Type | Format Standard | Standard Example | Four-Letter Code Example |
| :--- | :--- | :--- | :--- |
| **Single Entity Object** | Capitalized name | `Order` | `ORDR` |
| **Entity Object List** | Capitalized name + `_list` or lowercase 's' | `Order_list` | `ORDRs` |
| **Object Attribute** | Entity name + capitalized Attribute name | `orderStartdate` | `ordrStartdate` |
| **Primitives** | camelCase, lowercase start | `isValid`, `totalAmount` | `isValid`, `totalAmount` |
