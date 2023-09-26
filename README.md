# task_app
a task management app that has been created in nodejs
database used in this project is mysqlite3 there are apis created for create update delete and listing

create api

/tasks
eg:http://localhost:3000/tasks
in body select raw and as value give 
{
  "title": "Task 2",
  "status": "in progress"
}
use post request for this api

update api

/tasks/:id
eg:
http://localhost:3000/tasks/1
in body give

{
  "title": "Task 1",
  "status": "Closed"
}

use put request for this api

list api
/tasks

eg:
http://localhost:3000/tasks

use Get request to get all the tasks that has been saved

task metric api
/task-metrics
eg:
http://localhost:3000/task-metrics
use get request
It shows the count of open inprogress and completed tasks

delete api
/tasks/:id
eg:http://localhost:3000/tasks/1
Use delete request