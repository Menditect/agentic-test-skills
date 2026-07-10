---
sidebar_position: 29
---


# Test Setting 

## Definition

A Test Setting can be chosen to run a [Test Configuration](test-configuration). The Test Setting defines which [Application Instance(s)](application-instance) will be used during a [Test Run](test-run).
The user that is logged in determines which Test Setting is to be selected when Executing the Test Configuration, by setting one as a Preference.

:::info
Test Settings are only relevant when [executing Test Configurations from within MTA](test-configuration#execute-a-test-configuration).<br/>
When using MTA's [Public API](../api#post-execute-testconfiguration), an [Application Instance](application-instance) must be specified.
:::

## Properties

### Name
The name of the Test Setting.

### Preference
When yes, select this Test Setting to execute.

## Business rules

- There must be at least one Test Setting per Test Configuration.
- A Test Setting must be associated to exacly one Application Instance in order to Execute the Test Configuration.

## Actions on Test Setting 

### View Test Settings
- Navigate to the `Test configurations` page.
- Select the Test Configuration.
- Navigate to `Test settings`.

### Create a Test Setting
- Navigate to the `Test configurations` page.
- Select the Test Configuration.
- Navigate to `Test settings`.
- Click `Add`.

### Edit a Test Setting
- Navigate to the `Test configurations` page.
- Select the Test Configuration.
- Navigate to `Test settings`.
- Click on the <i class="fas fa-ellipsis"></i> button and choose `Edit`.

### Delete a Test Setting
- Navigate to the `Test configurations` page.
- Select the Test Configuration.
- Navigate to `Test settings`.
- Click on the <i class="fas fa-ellipsis"></i> button and choose `Delete`.

### Associate an Application Instance to a Test Setting
- Navigate to the `Test configurations` page.
- Select the Test Configuration.
- Navigate to `Test settings`.
- Click on `Select` for the Application you want to select an Instance for.

### Set a Test Setting as Preference
- Navigate to the `Test configurations` page.
- Select the Test Configuration.
- Navigate to `Test settings`.
- Click on `Set as my preference` on the Test Setting you want to use.

## Related topics
- [Application Instances](application-instance)
- [Test Configuration](test-configuration)
- [Test Run](test-run)
- [Test Suite](test-suite)

## Feedback?
Missing anything? [Let us know!](mailto:support@menditect.com)

Last updated 26 November 2025