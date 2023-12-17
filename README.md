# Intro to Java project 

## Project structure

```
├── Odap_Backend/Odap/src/main/java/com/example/odap : backend spring boot application
│   ├── controller              : The core part providing backend service
│   ├── entity                  : database tables
│   ├── exception               : exceptions
│   ├── Interceptor             : Interceptor that checks admin and authentication status
│   ├── request                 : data request frontend sends to backend
│   ├── response                : data response backend sends to frontend
|   ├── service				    : User services, including password encrypt
|   ├── resources			    : application properties
├── frontend/code/src           : frontend react application
│   ├── components              : components on webpage
│   ├── pages              		: components of each page 
├── datasets				    : sample datasets we provide 
```

## How to run the project



##### Step 1: Unzip the project

##### Step 2: Fill in the MySQL database configure information

```shell
spring.datasource.url=jdbc:mysql://localhost:3306/$your_DB_name$
spring.datasource.username=$your_DB_username$
spring.datasource.password=$your_DB_password$
myapp.upload-dir=$your_upload_dir$  // this folder is for saving audio or image datasets
```

##### Step 3: Run the backend

You can create an new project with ``Odap_backend/Odap`` using IntelliJ IDEA, and click on ``run`` to run the backend.

##### Step 4: Run the frontend

You can go to ``Odap_frontend/code``  and type in 

```shell
npm install
npm start
```

to install dependencies and run the react frontend.

##### Step 5: Play with our app! 

You can upload the provided datasets, or create your own datasets in similar data organization and format.

The admin user is auto-registered and hardcoded in our code: 

```
username: admin
password: 123456
```

admin can see user list and delete users. We currently do not allow admin to delete datasets.

## Advanced topics we've implemented

#### 1. Spring framework

The entire backend is created based on Spring boot framework. We utilized a lot of features of springboot, including conponents like spring web, http, pageRequest, and so on.

#### 2. Security

First, the password of user is encrypted by <Insert>

Second, we implemented interceptors to enhance the security of platform data, one for preventing non-admin user see user list and delete user, and the other for preventing users who are not logged in from accessing the data platform.

#### 3. Database 

For the implementation of database operations, we initially adopted the Hibernate provided by the Spring framework to automatically create tables, and utilized Spring Data JPA to generate CRUD methods . This is a common implementation practice. However, as professor specified on the evening of December 14th that we are required to manually write database queries, we attempted to change all database operations to <Insert Specific Implementation>, while retaining only the table creation feature of Hibernate. You can refer to our `repository` folder to see the implementation.

Due to the extensive yet repetitive nature of database operations in this project, and considering that the requirement was specified just three days before the deadline, coupled with the fact that we were in the midst of final exam reviews and short on time, and since these operations are quite similar, we decided to only change the data operations for <insert two tables' worth of data to use……>, rather than converting all database operations to hand-written SQL. We believe that this approach could demonstrates our understanding of Java database connections and operations, thereby fulfilling the "Database" advanced topic requirement.


