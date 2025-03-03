1. Session Storage : Only valid in current tab
2. Localstorage valid across all the tab

Roles: Admin, User, Reporting Manager : enum : admin,user,manager

User Home Screen:
User: Hi Avinash,  Date Picker: Date : 23 Feb 2024 Status: On Leave, On Half Day, Hours Completed , Hours Short: 3 Hrs 
Color coding for status will be On Leave , On half Day will be Yellow, Hours Completed will be Green, Hours Short will be red
Total Working Hour : 
Planned Hours : 
Actual Hours :

When No task: Show them a msg that : You have no task please plan your day by creating task of your own
This should be the screen for creating task with fields like this : 

Date |	Task |	Details |	Client |	Module	| Resource |	Type |	Sub Type |	Planned Hours Actual | Hours Spent
Dropdowns will be Client, Module, Resource, Type, Subtype
Date will be a datepicker
All the dropdown values will come from the API


Dashboard for User:
Date picker with date range and by default current Month Selected
Total Working Hours: 120 Total Actual Working Hours : 80 Hours Short: 20
Bar to Show Hours spent for Different Type and Subtype with drill option
Table view to Show Hours Spent for Client and Module


Dashboard for Admin / Manager

Date picker with date range and by default current Month Selected 
Dropdown for Employee to select by default all selected: Option for All And Reportees: By default reportees data

Total Working Hours: 120 Total Actual Working Hours : 80 Hours Short: 20
Bar to Show Hours spent for Different Type and Subtype with drill option
Table view to Show Hours Spent for Client and Module
Table view in sorted order of employee with less working hours
Employee with maximum Leaves table
Employee with Over - burden
Hours Bifuraction client wise


Configurations: Total Working Hours
