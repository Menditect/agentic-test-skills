---
sidebar_position: 30
---


# Test Suite 


## Definition

A Test Suite is an executable part of a [Test Configuration](test-configuration) and consists of a collection of [Test Cases](test-case) that are intended to be used to test a software program to show that it has some specified set of behaviours.

The Test Suite is the second level of the 4-layer framework that is used in MTA. It allows for a Test Configurations to be split up into different functional or technical aspects of the tested software. It is possible to define [Data Variation](datavariation) on the Test Suite level. 

## Properties

### Key
The identifying number assigned by MTA that is used in the [MTA Public API](../api) endpoints.

### Name
The name of the Test Suite.

### Description
A description of the Test Suite.

### Status
Can be either `Changing` or `Ready`. If `Changing`, this means MTA is updating the Test Suite because the user applied a new revision. If `Ready`, this means the Test Suite can be configured.

### Execution condition

| Setting | Result                                                                                                                                                                                                                                                                       |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| None    | The Test Suite will be part of the [Test Run](test-run) if it, or the parent [Test Configuration](test-configuration), is executed, and does not stop due to an [Exception](teststep-exception).                                                                             |
| Skip    | The Test Suite will NOT be part of the Test Run if it, or the parent Test Configuration, is executed. Test Cases inside the Test Suite will also NOT be part of the Test Run, even if they are executed directly, and regardless of their own `Execution condition` setting. |
| Always  | The Test Suite will be part of the Test Run if it, or the parent Test Configuration, is executed, even if a Teststep in a previous Test Suite encounters an Exception.                                                                                                       |

## Business rules

The [revision](application-revision) of all Applications used in the Test Suite must match the ones used in the Test Configuration.

## Actions on Test Suite

### Create a new Test Suite
- Navigate to the Test configurations page in MTA and select the [Test Configuration](test-configuration) that you want to create the Test Suite in.
- Use the Add Test Suite button to create a new Test Suite.
- Enter a name and an optional description and choose "Save".

### Edit a Test Suite
- Find the Test Suite you want to edit.
- Use the <i class="fas fa-ellipsis"></i> button to open the menu.
- Use the <i class="fal fa-pencil"></i> button to edit the Test Suite.

### Configure a Test Suite
- Navigate to the Test configurations page in MTA and select the Test Configuration where you want to configure a Test Suite.
- Click anywhere in the row of the Test Suite you want to configure.

### Execute a Test Suite
- Use the Execute inside a Test Suite, to start a new [Test Run](test-run) with the `Test Suite` Level.
- Choose "Full output" to include all data values in the Test Run results. Not enabling "Full output" will finish the Test Run sooner, but will only include data values for teststeps that are used in other teststeps in the Test Run results.
- Choose a [Test Setting](test-setting) (the preferred Test Setting is pre-selected).

### Share a Test Suite

You can copy the URL to open a Test Suite directly from your browser's address bar. 

- Find the Test Suite you want to share.
- Use the <i class="fas fa-ellipsis"></i> button to open the menu.
- Click <i class="fal fa-share-nodes"></i> to copy the URL to the Test Suite to your clipboard.
- Paste `Ctrl+V` the URL anywhere to share it.

Note that after using a URL to open the Test Suite, each time you hit `F5` or `Ctrl+R` on your browser, you will end up on the same page, until you log out.

### Change the order of a Test Suite in a Test Configuration
- Navigate to the Test Configuration that the Test Suite is in.
- Click on <i class="fas fa-arrow-up"></i> or <i class="fas fa-arrow-down"></i> on the left of the title of the Test Suite to move it up or down.

### Duplicate a Test Suite
- Navigate to the Test configurations page in MTA and select the Test Configuration where you want to duplicate a Test Suite.
- Use the <i class="fas fa-ellipsis"></i> button on the Test Suite to open the menu.
- Click "<i class="fas fa-copy"></i> Duplicate".

### Copy a Test Suite from another Test Configuration

This action will Copy a Test Suite, from another Test Configuration, with the same linked [Applications](application).

- Navigate to the Test configurations page in MTA and select the Test Configuration where you want to Copy a Test Suite in.
- Click on `Copy from` to select a Test Suite from another Test Configuration.
- Click on `Copy` to copy the Test Suite.

### Import a Test Suite from another Test Configuration and Application

This action will Copy a Test Suite, from another Test Configuration, and with an [Application](application) that is not linked to the current Test Configuration.

MTA will detect elements such as Microflows and Entities, by matching them by fully qualified Mendix name. If any of the elements cannot be matched, the contents will not be copied.

- Navigate to the Test configurations page in MTA and select the Test Configuration where you want to Copy a Test Suite in.
- Click on `Import from` to select a Test Suite from another Test Configuration.
- Click on `Import` to copy the Test Suite.


### Delete a Test Suite
- Navigate to the Test configurations page in MTA and select the Test Configuration where you want to delete a Test Suite.
- Use the <i class="fas fa-ellipsis"></i> button to open the menu.
- Click <i class="fas fa-trash-alt"></i> on the Test Suite you want to delete.

Note that deleting a Test Suite is permanent. Individual Test Suites cannot be recovered.

## Related topics
- [Test case](test-case)
- [Test configuration](test-configuration)
- [Test run](test-run)

## Feedback?
Missing anything? [Let us know!](mailto:support@menditect.com)

Last updated 26 May 2026