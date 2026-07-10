# Assert on Validation feedback

## Definition

An Assert on Validation feedback is used to evaluate [feedback messages](../feedback-message) shown as a result of "Validation feedback" actions in Microflows that are executed during a Test Run.
It is possible to evaluate the message text and/or the member that the message is shown on.  

Asserts on Validation feedback are defined on the [Test Case](../test-case) level. Test Cases can have zero, one or multiple Asserts on validation feedback.

Asserts on Validation feedback can be added to [Data Variation](../datavariation).


## Properties
| Name                | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Assert type         | The type of Validation feedback assert to be created. <br />  - Count: evaluates only the number of validation feedback messages upon execution. <br />  - Attribute-member: evaluates the message text of validation feedback shown on a certain attribute member. <br />  - Association-member: evaluates the message text of validation feedback shown on a certain association. <br />  - All-members: evaluates the message text of validation feedback regardless of the member or association.                                                                                                                                                                |
| Entity              | The entity that the Validation feedback is shown on. <br />  Only for Attribute-member and Association-member asserts.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Attribute           | The attribute member that the Validation feedback is shown on. <br />  Only for Attribute-member asserts.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Association         | The association that the Validation feedback is shown on. <br />  Only for Assocation-member asserts.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Quantifier          | Determines whether to match the given the message text for all Validation feedback messages, or that there should be at least one Validation feedback message that matches.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Comparison operator | The type of evaluation to perform. <br />  - The 'Equals' / 'Not equals' type means that the message text or message count should exactly match (or not match, respectively) a single given value. <br />   - The 'Contains' / 'Not contains' type means that the message text should contain (or not contain, respectively) the given value.  <br />   - The 'Greater than' / 'Greater than or equal to' means that the message count should be higher than (or include, respectively) the given value.  <br />   - The 'Less than' / 'Less than or equal to' means that the message count should be lower than (or include, respectively) the given value.  <br /> |
| Comparison string   | The (part of the) validation feedback message text to evaluate. <br />  Only for Attribute-member, All-members and Association-member asserts.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Comparison number   | The number of validation feedback messages to evaluate. <br /> Only for Count asserts.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |


## Actions on an Assert on Validation feedback 

### Add Count Assert 
- Open the [Test Configuration](../test-configuration) and [Test Suite](../test-suite) that you want to design.
- Select a [Test Case](../test-case).
- Select Tab `Assert(s)`.
- Click `Manage asserts`.
- Click on "<i class="fal fa-plus-circle"></i> Assert" to add the Assert.
- Choose "Count assert" for the Assert type.
- Select the Comparison operator and fill in the Comparison number.
- Save.
 
### Add Attribute-member Assert 
- Open the [Test Configuration](../test-configuration) and [Test Suite](../test-suite) that you want to design.
- Select a [Test Case](../test-case).
- Select Tab `Assert(s)`.
- Click `Manage asserts`.
- Click on "<i class="fal fa-plus-circle"></i> Assert" to add the Assert.
- Choose "Attribute-member" for the Assert type.
- Choose the Entity that the feedback message should occur on.
- Choose the Attribute that the feedback message should occur on.
- Select the Quantifier, Comparison operator and fill in the Comparison string.
- Save.

### Add Association-member Assert 
- Open the [Test Configuration](../test-configuration) and [Test Suite](../test-suite) that you want to design.
- Select a [Test Case](../test-case).
- Select Tab `Assert(s)`.
- Click `Manage asserts`.
- Click on "<i class="fal fa-plus-circle"></i> Assert" to add the Assert.
- Choose "Association-member" for the Assert type.
- Choose the Entity that the feedback message should occur on.
- Choose the Association that the feedback message should occur on.
- Select the Quantifier, Comparison operator and fill in the Comparison string.
- Save.

### Add All-members Assert 
- Open the [Test Configuration](../test-configuration) and [Test Suite](../test-suite) that you want to design.
- Select a [Test Case](../test-case).
- Select Tab `Assert(s)`.
- Click `Manage asserts`.
- Click on "<i class="fal fa-plus-circle"></i> Assert" to add the Assert.
- Choose "All-members" for the Assert type.
- Select the Quantifier, Comparison operator and fill in the Comparison string.
- Save.

### Delete an Assert on Validation feedback 

- Open the [Test Configuration](../test-configuration) and [Test Suite](../test-suite) that you want to design.
- Select a [Test Case](../test-case).
- Select Tab `Assert(s)`.
- Click `Manage asserts`.
- Click on <i class="fas fa-trash-alt"></i> to delete the assert.

## Related topics
- [Assert](../Assert/)
- [Test Case](../test-case)

## Feedback?
Missing anything? [Let us know!](mailto:support@menditect.com)

Last updated: 12 April 2023