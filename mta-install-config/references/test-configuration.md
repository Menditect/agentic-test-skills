---
sidebar_position: 27
---


# Test Configuration 



## Definition

A Test Configuration is an executable test script that describes which [Test Suites](test-suite) and which [Applications](application) will be/are tested. 

The Test Configuration is the highest or first level of the 4-layer framework that is used in MTA. 

## Properties

### Key
The identifying number assigned by MTA that is used in the [MTA Public API](../api) endpoints.

### Name
The name of the Test Configuration. The name will be displayed in the Test Configuration overview.

## Description
A description of the Test Configuration.


## Business rules

- The application revision of the [Test Suite](test-suite) must be equal to the application revision of the Test Configuration, with the same [Application](application) in order to be able to execute the Test Configuration.
- You can pin a maximum of two [Test Runs](test-run) per Test Configuration.

## Actions on Test Configuration

### View Test Configurations
- Navigate to the `Test configurations` page to view a list of all the Test Configurations in MTA.

### Add a Test Configuration
- Navigate to the `Test configurations` page. 
- Add a new Test Configuration and enter a Name and optional Description. 
- Select the [Applications](application) to test.
- Select the [Revision](application-revision) that you want to base your test on, for each selected Application.
- Select the [Instance](application-instance) where you want to execute your test, for each selected Application.

### Edit a Test Configuration

- Open or Select the Test Configuration that you want to edit.
- Use the Edit test configuration button on the bottom left to edit the Name and Description of the Test Configuration.

### Execute a Test Configuration

- Open or Select the Test Configuration that you want to execute.
- Use the Execute test configuration button on the bottom left, to start a new [Test Run](test-run).
- Choose `Coverage` to create a new [Coverage Calculation](coverage-calculation) after the Test Run was executed.
- Choose `Full output` to include all data values in the Test Run results. Not enabling `Full output` will finish the Test Run sooner, but will only include data values for teststeps that are used in other teststeps in the Test Run results.
- Choose a [Test Setting](test-setting) (the preferred Test Setting is pre-selected).
- Choose an [Execution scope](test-run#execution-scope).

### Export a Test Configuration to file

- Open or Select the Test Configuration that you want to export.
- Use the Export test configuration button on the bottom left, to download a Text file containing all design elements of a Test Configuration. 

Included in the file are: [Test Suites](test-suite), [Execution Users](execution-user) and [Coverage Goals](coverage-goal). 

Not included are: [Test Settings](test-setting), [Test Runs](test-run) and associated [Coverage Calculations](coverage-calculation).

:::info
The export function can be used to temporarily store, or migrate Test Configuration design data.<br/>
Do not use the export function for backup purposes. Export files are only valid for a single MTA version. If MTA is updated, the export file can no longer be imported.
:::

### Import a Test Configuration from file

- First, make sure that the Applications that exist in the Test Configuration you want to import, are [added to MTA](application#register-application-in-mta).
- Navigate to "Test Configurations" in the top menu.
- Click <i class="fas fa-ellipsis"></i> and then `Import Test Configuration`. 
- Select a file from your file system. 
- Click Import.

If the Import file is valid, MTA will open the imported Test Configuration, showing a progress page. As long as the import is running, you will not be able to edit anything inside the Test Configuration.

If the Import file was edited after it was downloaded, the import will fail.

### Share a Test Configuration

You can copy the URL to open a Test Configuration directly from your browser's address bar. 

- Find the Test Configuration you want to share.
- Use the <i class="fas fa-ellipsis"></i> button to open the menu.
- Click <i class="fal fa-share-nodes"></i> to copy the URL to the Test Configuration to your clipboard.
- Paste `Ctrl+V` the URL anywhere to share it.

Note that after using a URL to open the Test Configuration, each time you hit `F5` or `Ctrl+R` on your browser, you will end up on the same page, until you log out.

### Delete a Test Configuration
- Select the Test Configuration that you want to delete.
- Use the <i class="fal fa-trash-alt"></i> button to delete the Test Configuration.

### Recover a deleted Test Configuration
- Navigate to "Test Configurations" in the top menu.
- Click <i class="fas fa-ellipsis"></i> and then `Deleted test configurations`. 
- Click on `Recover` on the Test Configuration you want to restore.

Note that deleted Test Configuration will automatically be deleted permanently when 20 days are passed after the moment of deletion.

### Delete a Test Configuration permanently
- Navigate to "Test Configurations" in the top menu.
- Click <i class="fas fa-ellipsis"></i> and then `Deleted test configurations`. 
- Click on `Delete` on the Test Configuration you want to permanently delete.

### Restore previous revision of Test Suites in a Test Configuration

See [Snapshot](snapshot).

## Related topics
- [Test Run](test-run)
- [Test Suite](test-suite)

## Feedback?
Missing anything? [Let us know!](mailto:support@menditect.com)

Last updated 26 May 2026