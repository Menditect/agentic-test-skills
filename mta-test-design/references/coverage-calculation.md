---
sidebar_position: 11
---

# Coverage Calculation

## Definition

A Coverage Calculation is a representation of the code coverage of one moment in time. It represents the coverage percentage of [Microflows](mendix-microflow) that were executed, out of all included microflows for the associated [Coverage Goal](coverage-goal).  This Coverage Goal is **calculated** and stored as a Coverage Calculation, whenever a test is executed, "Coverage" was selected when starting the Test Run, and Coverage Goals exist. 

A Coverage Calculation can be associated to a [Test Configuration](test-configuration), or to an [Application](application).


## Properties

### CalculationDate  
The date and time when the [Coverage Goal](coverage-goal) was calculated.          

### App revision     
The [Application Revision](application-revision) that was used to evaluate and calculate the Coverage Goal.            

### Total \#          
The total number of microflows in the App revision.              

### Excluded \#       
The number of microflows that was excluded after evaluating the Coverage Goal.     

### Included \#       
The number of microflows that was included after evaluating the Coverage Goal, <br/> and used to calculate the Coverage Goal.            

### Executed excl. \# 
The number of microflows that were executed but not included in the Coverage Goal. 

### Executed incl. \# 
The number of microflows that were executed and included in the Coverage Goal.     

### Not executed \#   
The number of microflows that were not executed. 

### Coverage %       
The coverage percentage (Executed incl devided by Included).     

### Trend %          
The absolute difference in coverage percentage of this Calculation, <br/> compared to the previous Calculation for the same Coverage Goal. 




## Business rules
- A Coverage Calculation will only be created when executing a full [Test Configuration](test-configuration) and with "Coverage" enabled.
- A Coverage Calculation will only be created for [Test Runs](test-run) where the result is "Passed".
- A Coverage Calculation on an Application will be created for Test Runs in all Test Configurations that are included in the associated [Coverage Goal](coverage-goal), and only for Test Configurations on the latest [Application Revision](application-revision) found in these Test Configurations.
- A Coverage Calculation for Test Runs that were deleted, will only show Coverage % and Trend %. Other properties are no longer available then.
- For any [Application](application), only details for the 2 most recent Coverage Calculations will be kept in the cleanup process.
- Additionally, for any Application, the latest Coverage Calculation will also be kept, if the calculation was performed for a subset of included Test Configurations.
- For any Test Configuration, details of the Coverage Calculations will be kept if the associated Test Runs are not yet deleted.

## Actions on a Coverage Calculation

### View Coverage Calculations on an Application
- [View Coverage Goals on an Application](coverage-goal#view-coverage-goals-on-an-application)
- Click `Calculated`.

### View Coverage Calculations on an Application Revision
- [View downloaded Application revisions for an Application](application-revision#view-application-revisions)
- Select the Application Revision to view the Calculated Goals for.
- Click on <i class="fal fa-umbrella"></i>.

### View Coverage Calculations on a Test Configuration
- [View Coverage Goals on a Test Configuration](coverage-goal#view-coverage-goals-on-a-test-configuration)
- Click `Calculated`.

### View Coverage Calculations on a Test Run
- [View Test Runs](test-run#view-test-runs)
- Select the Test Run to view the Calculated Goals for.
- Click on <i class="fal fa-umbrella"></i>.

## Related topics
- [Coverage Goal](coverage-goal)
- [Application](application)
- [Test Configuration](test-configuration)


## Feedback?
Missing anything? [Let us know!](mailto:support@menditect.com)

Last updated 27 November 2025