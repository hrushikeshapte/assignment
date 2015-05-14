# assignment
Node JS MySQL

This is a simple program which involves NodeJS , MySQL and Socket IO.

The aim of this program is to make the user login to database entries with username and password. 
Once the user is logged in, he sees his profile. He can search other users, edit his profile information.
The information stored in profile is JSON and the goal of the assignment is to make search fast.

Socket IO will give a real time notification to all connected users once some user edits his profile.

Steps to Run

Import the database or create a new one with 
id int
username varchar
password varchar
profile text - in profile create fields country, phone and email.
created_at TIMEDATE
updated_at TIMEDATE

Navigate to folder.

npm install

node server.js

navigate on browser to localhost:8080
