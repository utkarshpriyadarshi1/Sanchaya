# Installation Guide

This guide provides step-by-step instructions for setting up the e-Dastavej system on your local machine.

## Prerequisites
- JDK 11 or higher
- Apache Maven
- PostgreSQL
- Node.js and npm

## Steps

### 1. Clone the Repository
First, clone the repository to your local machine using Git:
```bash
git clone https://github.com/your-username/e-Dastavej.git
cd e-Dastavej
```

### 2. Create a PostgreSQL Database
Create a new PostgreSQL database for the project:
```sql
CREATE DATABASE file_management;
```

### 3. Update Application Properties
Update the `application.properties` file located in `src/main/resources` with your PostgreSQL database configurations:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/file_management
spring.datasource.username=edastavej
spring.datasource.password=edastavej
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.show-sql=true
```

### 4. Install Frontend Dependencies and Build
Navigate to the project root directory and run the following commands to install frontend dependencies and build the assets:
```bash
npm install
npx webpack --config webpack.config.js
```

### 5. Build the Project
Use Maven to build the project:
```bash
mvn clean install
```

### 6. Deploy the WAR File
Deploy the generated WAR file (`target/e-Dastavej.war`) to your favorite servlet container (e.g., Tomcat).

### 7. Access the Application
Open your web browser and navigate to:
```
http://localhost:8080/e-Dastavej
```

Congratulations! You have successfully set up the e-Dastavej system.