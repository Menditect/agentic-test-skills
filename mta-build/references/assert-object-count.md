# Assert on Object Count

## Definition

An Assert on Object count is defined on a [Teststep](../Teststep) and exists of making a comparison between the expected and actual list size of output objects of a Teststep upon test execution.

## Properties
| Name                  | Description                                                                                                                               |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Compare type          | The type of comparison to be made: either 'Equals', 'Greater-than' / 'Greater-than or equal to' or 'Less-than' / 'Less-than or equal to'. |
| Expected object count | The expected value of the attribute when executing the test.                                                                              |

## Business rules

Asserts on object count can be defined either on Retrieve Object Teststeps or on Microflow Teststeps that return a list of objects. 

## Actions on Assert on Object Count

### Add an Assert on Object Count
- Open the [Test Configuration](../test-configuration) and [Test Suite](../test-suite) that you want to design.
- Select a [Teststep](../Teststep/) that returns an Object or a List of Objects.
- Select Tab `Assert(s)`.
- Click `Manage asserts`.
- Select the `Object count` tab.
- Click on the "<i class="fal fa-plus-circle"></i> Assert" button to add the Assert.

### Delete an Assert on Object Count
- Open the [Test Configuration](../test-configuration) and [Test Suite](../test-suite) that you want to design.
- Select a [MTeststep](../Teststep/) that has an Assert, marked with a colored `Assert` tag.
- Select Tab `Assert(s)`.
- Click `Manage asserts`.
- Select the `Object count` tab.
- Click on the <i class="fal fa-trash-can"></i> button.

## Related topics
- [Assert Attribute](assert-attribute)
- [Teststep](../Teststep)

## Feedback?
Missing anything? [Let us know!](mailto:support@menditect.com)

Last updated: 19 january 2023