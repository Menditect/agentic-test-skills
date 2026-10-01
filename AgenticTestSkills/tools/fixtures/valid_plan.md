# Execution Plan: TC_SampleValid

<details>
<summary><b>Test Plan Details & Tracking (Click to expand)</b></summary>

```yaml
plan_id: "TC_SampleValid-v1"
category: "Backend"
```

</details>

## 1. Purpose & Scope
*What this test verifies, why it matters, and how test data is isolated.*

## 2. Component Under Test
*The Mendix microflow or page being verified, including its inputs and expected return.*

## 3. Test Steps & Action Sequence
*The step-by-step sequence of object creation, actions, and assertions.*

<details>
<summary><b>View detailed step specifications (Click to expand)</b></summary>

| # | Case | Step Action & Target | Input Handle | Output Handle | Parameters, Bindings & Initial Values | Embedded Assertions | Exec Settings |
| :-: | :--: | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | Case 1 | `CreateObject` (`Sales.Order`) | - | `orderHandle` | `Amount = 100` | - | `None` / `Stop` |
| **2** | Case 1 | `CallMicroflow` (`Sales.ACT_Process`) | `orderHandle` | `resultHandle` | `Order = orderHandle` | `Assert result == true` | `None` / `Stop` |

</details>

## 4. Test Scenarios & Test Data
*The business situations to verify, with inputs and expected outcomes for each scenario.*

| # | Step Target | Scenario #1 (Regular) | Scenario #2 (VIP) |
| :---: | :--- | :--- | :--- |
| **0** | **Scenario Name** | Regular Customer | VIP Customer |
| **0** | **Scenario Description** | Standard verification | VIP discount verification |
| 1 | Step 1: `Order.Amount` | `100` | `200` |
| 2 | Step 2: Assert Return Value | `true` | `true` |

## 5. Quality & Compliance Checks
*Automated rules and best-practice checks validated before running or building.*

<details>
<summary><b>View automated quality checks (Click to expand)</b></summary>

* [x] **Check 1:** Verified
* [x] **Check 2:** Verified

</details>

## 6. Verification & Build Receipt
*Audit confirmation verifying that the constructed test matches this plan with zero errors.*
