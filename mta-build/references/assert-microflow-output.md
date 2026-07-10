# Assert on Microflow output

## Definition

An Assert on Microflow output formulates an expected result of the output value of a Microflow [Teststep](../Teststep) upon execution, 
if the microflow returns a literal value (String, Integer, Decimal, Boolean, Datetime or Enumeration).

If the microflow returns an Object or a List of Objects, it is currently only possible to define an [Assert on Object count](assert-object-count).

:::info Assert on Attribute
If the Microflow returns an Object, and you want to add an Assert on an Attribute of that Object, you have to add a [Retrieve teststep](../Teststep/retrieve), first.<br/>
Click on the <i class="fas fa-ellipsis"></i> button on the microflow Teststep and click "<i class="fal fa-plus-circle"></i> Retrieve output".
:::

It is possible to either define the result to have a single value, or a range that the value should be in. 

A Microflow Teststep can have zero or one Assert defined on the output.

When a Teststep uses [Data Variation](../datavariation) to manipulate Teststep input, the Assert can be applied as a [Data Variation Item](../datavariation-item-row) for each defined variation.

## Properties
| Name               | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Compare type       | The type of comparison to be made. <br />  - The 'Equals' / 'Not equals' type means that the value should exactly match (or not match, respectively) a single given value. <br />   - The 'Range' / 'Not range' type  means that the value should be within (or outside, respectively) the given boundaries. A 'Range' type is only applicable for Integer, Decimal or Datetime datatypes.  <br />   - The 'Greater than' / 'Greater than or equal to' means that the attribute value should be higher than (or include, respectively) the given value.  <br />   - The 'Less than' / 'Less than or equal to' means that the value should be lower than (or include, respectively) the given value.  <br /> |
| Value              | The expected value upon executing the test when the selected compare type is 'Equals'. If the asserted value is empty, the result must be empty in order for the assert to pass.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Min value          | The expected lower boundary of the value if the selected compare type is 'Range'.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Max value          | The expected higher boundary of the value if the selected compare type is 'Range'.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Trim string values | Used to be able trim String values for leading and trailing space characters before evaluating the result (only applicable for the String datatype).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

## Business rules

The following Assert Compare types are supported for the Mendix data types:


|                          | String                       | Integer                      | Decimal                      | Boolean                      | Datetime                     | Enumeration                  |
| ------------------------ | ---------------------------- | ---------------------------- | ---------------------------- | ---------------------------- | ---------------------------- | ---------------------------- |
| Equals                   | <i class="fas fa-check"></i> | <i class="fas fa-check"></i> | <i class="fas fa-check"></i> | <i class="fas fa-check"></i> | <i class="fas fa-check"></i> | <i class="fas fa-check"></i> |
| Does not equal           | <i class="fas fa-check"></i> | <i class="fas fa-check"></i> | <i class="fas fa-check"></i> | <i class="fas fa-check"></i> | <i class="fas fa-check"></i> | <i class="fas fa-check"></i> |
| Contains                 | <i class="fas fa-check"></i> |                              |                              |                              |                              |                              |
| Does not Contain         | <i class="fas fa-check"></i> |                              |                              |                              |                              |                              |
| Within Range             |                              | <i class="fas fa-check"></i> | <i class="fas fa-check"></i> |                              | <i class="fas fa-check"></i> |
| Outside of Range         |                              | <i class="fas fa-check"></i> | <i class="fas fa-check"></i> |                              | <i class="fas fa-check"></i> |
| Greater than             |                              | <i class="fas fa-check"></i> | <i class="fas fa-check"></i> |                              | <i class="fas fa-check"></i> |
| Greater than or Equal to |                              | <i class="fas fa-check"></i> | <i class="fas fa-check"></i> |                              | <i class="fas fa-check"></i> |
| Less than                |                              | <i class="fas fa-check"></i> | <i class="fas fa-check"></i> |                              | <i class="fas fa-check"></i> |
| Less than or Equal to    |                              | <i class="fas fa-check"></i> | <i class="fas fa-check"></i> |                              | <i class="fas fa-check"></i> |


## Actions on an Assert on Microflow output 

### Add an Assert on Microflow output 
- Open the [Test Configuration](../test-configuration) and [Test Suite](../test-suite) that you want to design.
- Select a [Microflow Teststep](../Teststep/microflow) where the [Microflow](../mendix-microflow) has a return value.
- Select Tab `Assert(s)`.
- Click `Manage asserts`.
- Click on the "<i class="fal fa-plus-circle"></i> Assert" button to add the Assert.

### Delete an Assert on Microflow output 
- Open the [Test Configuration](../test-configuration) and [Test Suite](../test-suite) that you want to design.
- Select a [Microflow Teststep](../Teststep/microflow) that has an Assert, marked with a colored `Assert` tag.
- Select Tab `Assert(s)`.
- Click `Manage asserts`.
- Click on the <i class="fal fa-trash-can"></i> button.

## Related topics
- [Assert Object Count](assert-object-count)
- [Teststep](../Teststep)

## Feedback?
Missing anything? [Let us know!](mailto:support@menditect.com)

Last updated: 19 january 2023