# Execution Plan: TC_SampleInvalidAssoc

<details>
<summary><b>Test Plan Details & Tracking (Click to expand)</b></summary>

```yaml
plan_id: "TC_SampleInvalidAssoc-v1"
category: "Backend"
```

</details>

## 1. Purpose & Scope
## 2. Component Under Test
## 3. Test Steps & Action Sequence

| # | Case | Step Action & Target | Input Handle | Output Handle | Parameters, Bindings & Initial Values | Embedded Assertions | Exec Settings |
| :-: | :--: | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | Case 1 | `CreateObject` (`Sales.Order`) | - | `orderHandle` | `Amount = 100` | - | `None` / `Stop` |

## 4. Test Scenarios & Test Data

| # | Step Target | Scenario #1 | Scenario #2 |
| :---: | :--- | :--- | :--- |
| **0** | **Scenario Name** | Scen 1 | Scen 2 |
| **0** | **Scenario Description** | Desc 1 | Desc 2 |
| 1 | Step 1: Order.Amount | 100 | 200 |
| 2 | Association Assigned (Order_Customer) | Yes | No |

## 5. Quality & Compliance Checks
