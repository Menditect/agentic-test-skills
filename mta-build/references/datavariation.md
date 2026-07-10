---
sidebar_position: 15
---


# Datavariations

## Definition

Datavariations are used to execute the same test multiple times, but each time with different values for Attributes and Asserts. To change the value of an Attribute or Assert per Test Run, it needs to be explicitly included in the Datavariations. An included Attribute or Assert is referred to in the MTA Documentation as a [Datavariation Item Row](datavariation-item-row).

Datavariations can be defined on the [Test Suite](test-suite) or [Test Case](test-case) level. The choice whether to apply Datavariation, and on which level (Test Case or Test Suite), is made on a Test Case.

When applying Test Case level Datavariations, each [Datavariation Column](datavariation-column) results in a new execution of the Test Case. An executed Test Case is referred to as a Test Case Run.

When applying Test Suite level Datavariations, each [Datavariation Column](datavariation-column) results in a new execution of the entire Test Suite. An executed Test Suite is referred to as a Test Suite Run.

Applying both levels of Datavariations in the same Test Suite results in a multiplication of Test Case Runs for Test Cases with Test Case level Datavariations.

:::note
It is also possible to [execute only one Datavariation Column](#execute-a-variation).
:::

## Business rules

- It is **not possible** to delete a [Datavariation Column](datavariation-column) if there is only one.
- It **is possible** to delete all [Datavariation Item Rows](datavariation-item-row). Executing the Test Case or Test Suite will then only run once.

## Actions on Datavariations

### Navigate to Test Suite Datavariations

Everywhere throughout the Test Configuration or Test Run, click the <font color="#1799DE"><i class="fas fa-table"></i></font> to navigate to the Test Suite Datavariations.

### Navigate to Test Case Datavariations

Everywhere throughout the Test Suite or Test Suite Run, click the <font color="#1799DE"><i class="fas fa-table-rows"></i></font> to navigate to the Test Case Datavariations.

### Migrate Test Suite Data Variation to Test Case Data Variation
- Click on <i class="fas fa-ellipsis"></i> on the top right of the Data Variaton page.
- Click on `Move to test case data variation`.
- Select the Test Case that you want to migrate from Test Suite Data Variation to Test Case Data Variation.

### Migrate Test Case Data Variation to Test Suite Data Variation
- Click on <i class="fas fa-ellipsis"></i> on the top right of the Data Variaton popup.
- Click on `Move to test suite data variation`.
- Confirm.
  
### Remove all Test Suite Data Variation
To completely remove all Data Variation Items and also remove all Data Variations:
- Click on <i class="fas fa-ellipsis"></i> on the top right of the Data Variaton page.
- Click on `Disable test suite data variations`.

Note: if you already deleted all [Datavariation Item Rows](datavariation-item-row), you will not get a confirmation message.

### Remove all Test Case Data Variation
To completely remove all Data Variation Items and also remove all Data Variations:
- Click on <i class="fas fa-ellipsis"></i> on the top right of the Data Variaton popup.
- Click on `Disable test case data variations`.

Note: if you already deleted all [Datavariation Item Rows](datavariation-item-row), you will not get a confirmation message.

The page will close.

### Execute a Variation
- Open the Test Suite data variation page or Test Case data variation popup.
- Click on the column you want to delete, for instance the column labeled *# 2*. 
- Click on `Execute variation`
- Choose `Coverage` to create a new [Coverage Calculation](coverage-calculation) after the Test Run was executed.
- Choose `Full output` to include all data values in the Test Run results. Not enabling `Full output` will finish the Test Run sooner, but will only include data values for teststeps that are used in other teststeps in the Test Run results.
- Choose a [Test Setting](test-setting) (the preferred Test Setting is pre-selected).

## Related topics
- [Assert](Assert)
- [Data Variation Items](datavariation-item-row)
- [Test Run](test-run)
- [Test Suite](test-suite)


## Feedback?
Missing anything? [Let us know!](mailto:support@menditect.com)

Last updated 27 November 2025