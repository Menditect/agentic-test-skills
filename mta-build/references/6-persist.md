# Persist

## Definition

With this [Teststep](.), Objects from a Create or Change Object Teststep that is positioned previously in the same Test Case, are **committed** to the database, and Objects from a Delete Object Teststep that is positioned previously in the same Test Case, are **deleted** from the database.

Domain model events (Before and After Commit), if configured, are triggered for Objects that are committed.

Domain model events (Before and After Delete), if configured, are triggered for Objects that are deleted.

## Domain model Access

Domain model access rights are not checked during Persist, but in the other teststep types.

## Actions

### Add a Persist Teststep

To add a Persist step, select Persist as the Action when creating a Teststep. Note that when selecting Persist, the name of the Teststep will be set to "Persist" automatically.

Make sure to always insert the Persist Teststep after the Teststeps that perform other Object actions. 

A persist step will store all objects created or changed after the previous Persist Teststep in the same Test Case, or since the start of the Test Case. 

A persist step will delete all objects that are marked as deleted after the previous Persist Teststep in the same Test Case, or since the start of the Test Case. 

It is possible to have multiple Persist Teststeps in the same Test Case. However, if there is a technical error while executing the Test Case, the entire transaction for that Test Case is always rolled back.

:::note edge cases
- Microflows: An object that is created by a **microflow** (as the output parameter), will not be committed to the database if you add only a Persist Teststep. To commit using MTA, put a [Change Object](change) Teststep before the Persist Teststep, that changes the object created by the Microflow Teststep (without actually changing any of the members).
- Change before Persist: Create Object Teststep -> Change Object in Microflow -> Persist:<br/>The Object is **Changed**
- Change after Persist: Create Object Teststep -> Persist -> Next Test Case -> Change Object in Microflow -> Persist:<br/>The Object is **Created**, NOT Changed
- Associations: Create Object associated to Object in Database -> Next Test Case -> Retrieve Created Object:<br/>The Object is **EMPTY**
:::


## Feedback?
Missing anything? [Let us know!](mailto:support@menditect.com)

Last updated 27 November 2025