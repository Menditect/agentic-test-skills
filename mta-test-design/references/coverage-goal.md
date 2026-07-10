---
sidebar_position: 14
---

# Coverage Goal

## Definition

A Coverage Goal defines which microflows should at least be executed, when a **specific collection of tests** is executed. Microflows that are included in the goal, will count towards the coverage percentage in the [Coverage Calculation](coverage-calculation). 

To define the microflows usage in Coverage Calculation, a Coverage Goal can have one or more [Exclude Filters](coverage-exclude-filter). Microflows in the Mendix System module are always excluded from coverage calculation.

A Coverage Goal can be defined on a [Test Configuration](test-configuration), or on an [Application](application). When defining on a Test Configuration, create the **specific collection of tests**, by including [Test Suites](test-suite). When defining on an Application, create the **specific collection of tests**, by including [Test Configurations](test-configuration).


## Properties

### Name
The name of the coverage goal.

### Exclude Filters
The [Exclude Filters](coverage-exclude-filter) that determine the Coverage Goal.

### Test Suites
Defines which [Test Suites](test-suite) are included when calculating the Coverage Goal<br/> (only applicable for a Coverage Goal on a Test Configuration) 

### Test Configurations
Defines which [Test Configurations](test-configuration) are included when calculating the Coverage Goal<br/> (only applicable for a Coverage Goal on an Application)

## Business rules

- On a Coverage Goal that is defined on an Application, it is only possible to determine which microflows will be included based on the Exclude Filters, if at least 1 Test Configuration is included. 
- If no Test Configurations are included on a Coverage Goal that is defined on an Application, the Exclude Filters cannot be changed.
- Not including any Test Suites or Test Configurations on a Coverage Goal, will always lead to a 0 % coverage percentage.
- Defining Exclude Filters leading to 0 microflows being included in the Coverage Goal, will always lead to a 0 % coverage percentage.

## Actions on a Coverage Goal

:::info
After creating an Application or Test Configuration, a default Coverage Goal is created without Exclude Filters, <br/>including all microflows in the revision.
:::

### View Coverage Goals on an Application
- Navigate to the "Applications" page to view all Applications that are used in MTA.
- Select an [Application](application) by clicking on the tile.
- Navigate to `Coverage Goals`.

### View Coverage Goals on a Test Configuration
- Navigate to the "Test configurations" page to view a list of all the Test Configurations in MTA.
- Select a [Test Configuration](test-configuration) by clicking on the tile.
- Navigate to `Coverage Goals`.

### Change Included Test Configurations on a Coverage Goal
- Open the list of Coverage Goals for the Application.
- Click `Edit` in the `Test configurations included for coverage calculation` element on the right side.
- Select Test Configurations to include.
- Save.

### Change Included Test Suites on a Coverage Goal
- Open the list of Coverage Goals for the Test Configuration.
- Click `Edit` in the `Test suites included for coverage calculation` element on the right side.
- Select Test Suites to include.
- Save.

### Add a Coverage Goal
- Open the list of Coverage Goals for the Application or Test Configuration.
- Click `Add` to add a Coverage Goal.
- Select the Application if not yet pre-selected.
- Enter a name for the Coverage Goal.
- Save.

### Edit the name of a Coverage Goal
- Open the list of Coverage Goals for the Application or Test Configuration.
- Click <i class="fas fa-ellipsis"></i> on the Coverage Goal you want to edit.
- Select `Edit`.
- Change the name of the Coverage Goal.
- Save.

### Calculate a Coverage Goal

To calculate a Coverage Goal and create a new [Coverage Calculation](coverage-calculation), [execute a Test Configuration](test-configuration#execute-a-test-configuration) and enable `Coverage`.

### Copy name of a Coverage Goal
- Open the list of Coverage Goals for the Application or Test Configuration.
- Click <i class="fas fa-ellipsis"></i> on the Coverage Goal you want to edit.
- Select `Copy`.

### Delete a Coverage Goal
- Open the list of Coverage Goals for the Application or Test Configuration.
- Click <i class="fas fa-ellipsis"></i> on the Coverage Goal you want to delete.
- Select `Delete`.
- Confirm.

## Related topics
- [Coverage Calculation](coverage-calculation)
- [Coverage Exclude Filter](coverage-exclude-filter)
- [Application](application)
- [Test Configuration](test-configuration)

## Feedback?
Missing anything? [Let us know!](mailto:support@menditect.com)

Last updated 27 November 2025