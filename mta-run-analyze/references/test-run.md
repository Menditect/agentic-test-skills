---
sidebar_position: 28
---


# Test Run 

## Definition

The Test Run contains the results of an executed [Test Case](test-case), [Test Suite](test-suite) or [Test Configuration](test-configuration).

The results are stored in subsequent Test Suite runs, Test Case runs and Teststep runs.

Regardless of the Level of a Test Run, Test Suite runs, Test Case runs and Teststep runs are always created.

## Properties

### Key
The identifying number assigned by MTA that is used in the [MTA Public API](../api) endpoints.

### Application Instances 
The [Application Instances](application-instance) that were used to execute the Test Run on.

### Application Revisions 
The [Application Revisions](application-revision) that were used to execute the Test Run on.

### Start date
The moment when the Test Run was started. 

### Full output 
Determines if the test was executed with "Full output" enabled. Recognizable by the <i class="fal fa-memo-circle-info"></i> icon. 

### Pinned
If a Test Run is pinned by a user it will not be deleted overnight. Recognizable by the <i class="fas fa-thumbtack"></i> icon.

### Result
The test result (<font color="#5ec065"> <i class="fas fa-check"></i> </font> 'Passed' or <font color="#d30d2e"> <i class="fas fa-times"></i> </font> 'Failed'). 

### Execution Scope

| Setting          | Result                                                                                                                                 |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| All              | The Test Run was executed normally.                                                                                                    |
| Failed only      | Only Test Cases that had not <font color="#5ec065"> <i class="fas fa-check"></i> Passed</font> in the previous Test Run were executed. |
| Changed only     | Only Test Cases (or Teststeps inside) that were changed since the previous Test Run were executed.                                     |
| Changed & failed | Combination of both options.                                                                                                           |

Note that Test Cases with Teststeps that provide data are always executed. See also [Teststep dependencies](Teststep#view-teststep-dependencies).

When choosing `Changed only`:
- only changes that were made *in MTA* are considered, not revision changes (in the Mendix model in Studio pro).
- only changes that may affect the [result](#result) of the [Test Run](test-run) are considered.
- if a change is made in a Teststep or Test Case *without* [Datavariation](datavariation), the corresponding [Test Case](test-case) will be included.
- if a change is made in a Teststep or Test Case *with* Datavariation that affects *all variations*, they will all be included.
- if a change is made in a Teststep or Test Case *with* Datavariation that affects only a *specific variation*, only that specific variation will be included.


### Level 
The level from which the test was executed, if not Test Configuration ('Test Suite' or 'Test Case') 

### Status
This indicates if the test is running or not; can be 'Running' or 'Finished'. 

### Retention period
Only applicable for Test Runs triggered through the [Public API](../api). <br/>Sets the amount of days, after which the Test Run is permanently deleted. 

### Trace files
A collection of [Playwright Traces](frontend-glossary#tracefile) in the Test Suite Run.

## Business rules
- You can [pin](#pin-a-test-run) a maximum of two Test Runs per [Test Configuration](test-configuration).

## Actions on Test Run

### View Test Runs
- Navigate to the `Test configurations` page.
- Select the Test Configuration you want to view Test Runs for.
- Navigate to `Test runs`.

### View Test Suite Run

A Test Suite run is an executed [Test Suite](test-suite) in a Test Run.

- View Test Runs.
- Select the Test Run you want to view the results for.
- Click `Results` on the right side of the page, for the executed [Test Suite](test-suite).

### View Test Case Run

A Test Suite run is an executed [Test Case](test-case) in a Test Suite Run.

- View Test Suite Run.
- Select the Test Case run on the left side of the page, to view the results for.

### View Teststep Run

A Teststep run is an executed [Teststep](Teststep/) in a Test Case Run.

- View Test Case Run.
- Select the Teststep run in the middle of the page, to view the results for.

:::note 
For each Teststep run that has output, you can click on that output, to view in which teststep(s) it was used. <br/>
For each Teststep run that has input, you can click on the input, to view which teststep provided the input.
:::

### Create a new Test Run
- To create a new Test Run, execute a [Test Case](test-case), [Test Suite](test-suite) or [Test Configuration](test-configuration).

### Delete a Test Run
- Navigate to the `Test configurations` page.
- Select the Test Configuration you want to view Test Runs for.
- Navigate to `Test runs`.
- Click <i class="fal fa-trash-can"></i> for the Test run you want to delete.

#### Cleanup of manually-executed Test Runs
In a Test Configuration, only the last two executed Test Runs are persisted overnight, plus a maximum of two pinned Test Runs. The rest is cleaned up. Read the [Pin a Test Run](#pin-a-test-run) section in this page for more information.

#### Cleanup of API-triggered Test Runs 
For Test Runs that are executed through the [Public API](../api#post-execute-testconfiguration), instead of this, the Retention period applies. The date on which the Test Run will be deleted, is visible in the `Test runs` page.

#### Persisted dashboard data
If a Test Run is cleaned up, the following information about the Test Run is stored for the statistics on the dashboard page:
- start date
- result (Pas, Fail, Error)
- number of testcaseruns OK
- number of testcaseruns NOK
- number of testcaseruns not executed
- per Test Case run: Test Case name, application, environment, revision, Test Run result

### Pin a Test Run
Pinning a Test Run will prevent it from being cleaned up overnight.
- Navigate to the Test Run overview in MTA under Test Run.
- Click on <i class="fas fa-thumbtack"></i> next to the Test Run you want to keep.

## Related topics
- [Test Run](test-run)
- [Test Case](test-case)
- [Test Suite](test-suite)
- [Test Configuration](test-configuration)

## Feedback?
Missing anything? [Let us know!](mailto:support@menditect.com)

Last updated 26 November 2025