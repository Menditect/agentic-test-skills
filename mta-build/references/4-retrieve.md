# Retrieve Object

## Definition

With this [Teststep](.) type, objects can be retrieved from database or memory and used in subsequent Teststeps. Values entered for attributes and associations will be converted into an XPATH expression and subsequently filter the list of objects retrieved. Also objects that are output from previous teststeps can be filtered. 

## Entity Access

### Security applied

If the [Test Case](../test-case) that this teststep is in, has Apply Security enabled, the "Path to User" XPath constraint (if specified) on the Entity is evaluated to determine which objects are included. If there is no XPath constraint, all objects are included.

`Member rights` are ignored: for all objects, all attribute values will be shown, **regardless of specified Read/Write Entity Access**.

### Security not applied

If the [Test Case](../test-case) that this teststep is in, does not have Apply Security enabled, all objects are included.

## Add a Retrieve Object(s) teststep
- Navigate to the Test Suite and move the mouse to the position you want to create a Teststep in.
- Click <i class="fal fa-plus-circle"></i> and Click `Teststep: Retrieve object(s)` to add a Retrieve Teststep.
- Select an entity. You can search by name.

## Retrieve using
- Select either `Database`, `Association` or `Teststep`.

### Database
This will retrieve persisted objects from the database.

### Association
This will retrieve objects in memory that were created in the same Test Case, or exist in the database. You must select a previous Teststep that provides one associated object. 

### Teststep
This will retrieve objects returned from a previous Teststep. You must select a previous Teststep. 

A quicker way to retrieve from a previous Teststep is this:
- Navigate to the Test Suite and select the Test Case that you want to create a Teststep in.
- Click on the <i class="fas fa-ellipsis"></i> button on the Teststep that returns the object(s) that you want to change
- Choose  `Teststep: Retrieve output`

## Set filter values

:::info
Binary attributes are not supported by MTA.
:::

### Set Fixed value
- Click `Add attributes` to set attributes to filter on, or `Edit values` to change values for existing attributes.
- Select one or more attributes.
- For each attribute, choose an Operator (see below for the complete list).
- Enter or select value(s) to be used as a filter on the attribute.

Note: For datetime values you can either specify a date, or calculate the date with an offset from the current datetime.

The following Operators are supported for the Mendix data types:

|                          | String                       | Integer                      | Decimal                      | Boolean                      | Datetime                     | Enumeration                  |
| ------------------------ | ---------------------------- | ---------------------------- | ---------------------------- | ---------------------------- | ---------------------------- | ---------------------------- |
| Equals                   | <i class="fas fa-check"></i> | <i class="fas fa-check"></i> | <i class="fas fa-check"></i> | <i class="fas fa-check"></i> | <i class="fas fa-check"></i> | <i class="fas fa-check"></i> |
| Does not equal           | <i class="fas fa-check"></i> | <i class="fas fa-check"></i> | <i class="fas fa-check"></i> | <i class="fas fa-check"></i> | <i class="fas fa-check"></i> | <i class="fas fa-check"></i> |
| Contains                 | <i class="fas fa-check"></i> |                              |                              |                              |                              |                              |
| Does not Contain         | <i class="fas fa-check"></i> |                              |                              |                              |                              |                              |
| Within Range             |                              | <i class="fas fa-check"></i> | <i class="fas fa-check"></i> |                              | <i class="fas fa-check"></i> |                              |
| Outside of Range         |                              | <i class="fas fa-check"></i> | <i class="fas fa-check"></i> |                              | <i class="fas fa-check"></i> |                              |
| Greater than             |                              | <i class="fas fa-check"></i> | <i class="fas fa-check"></i> |                              | (Use Range)                  |                              |
| Greater than or Equal to |                              | <i class="fas fa-check"></i> | <i class="fas fa-check"></i> |                              | (Use Range)                  |                              |
| Less than                |                              | <i class="fas fa-check"></i> | <i class="fas fa-check"></i> |                              | (Use Range)                  |                              |
| Less than or Equal to    |                              | <i class="fas fa-check"></i> | <i class="fas fa-check"></i> |                              | (Use Range)                  |                              |


### Use the value from a former Teststep to set the Attribute filter
- Click `Edit values` and select `Teststep`.
- Select the Teststep and (if the Teststep returns an Object) find the Attribute that should provide the value.


### Assign associations
- Click `Add associations` to set associations to filter on.
- Select one or more associations.
- Select an operator: either `Set` (the default), or `Add` / `Remove` (both only available for many-to-many associations).
- Using `Edit`, Select a previous Teststep, or add a Create/Retrieve Teststep that provides one associated object. You can also set the association to `EMPTY`.
- For many-to-many associations, you can add additional lines.

## Feedback?
Missing anything? [Let us know!](mailto:support@menditect.com)

Last updated 27 May 2026