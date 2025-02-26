# e-Dastavej

## Overview
This project is a file management system built using Spring MVC. It allows users to upload, search, and manage files. The system supports different user roles like public, clerk, staff, assistant, manager, and admin with varying levels of security.

## Features
- File upload
- File search with filters
- User and role management
- Category and subcategory management
- Admin dashboard

## Documentation
- [Installation Guide](docs/INSTALLATION.md)
- [Usage Guide](docs/USAGE.md)
- [Contributing Guide](docs/CONTRIBUTING.md)
- [Security Guidelines](docs/SECURITY.md)

## Technologies Used
- Spring MVC
- JSP
- Hibernate
- PostgreSQL
- Spring Security
- Bootstrap
- Webpack

## Getting Started
### Prerequisites
- JDK 11 or higher
- Apache Maven
- PostgreSQL
- Node.js and npm

### Setup
1. Clone the repository:
    ```bash
    git clone https://github.com/your-username/e-Dastavej.git
    cd e-Dastavej
    ```

2. Create a PostgreSQL database:
    ```sql
    CREATE DATABASE file_management;
    ```

3. Update `application.properties` with your database configurations:
    ```properties
    spring.datasource.url=jdbc:postgresql://localhost:5432/file_management
    spring.datasource.username=edastavej
    spring.datasource.password=edastavej
    spring.jpa.hibernate.ddl-auto=update
    spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
    spring.jpa.show-sql=true
    ```

4. Install frontend dependencies and build:
    ```bash
    npm install
    npx webpack --config webpack.config.js
    ```

5. Build the project:
    ```bash
    mvn clean install
    ```


    This project setup includes:

A pom.xml file for Maven dependencies.
Application properties for PostgreSQL configuration.
Webpack configuration for bundling JavaScript and CSS files, including Bootstrap.
Basic Spring Boot application setup with a home controller and Thymeleaf template.
Entity classes for Role, User, Category, SubCategory, and File.
To get started with this project, follow these steps:

Clone the repository or create a new directory and initialize it as a git repository.
Create a PostgreSQL database named edastavej and update the application.properties file with your database credentials.
Install Node.js and npm if you haven't already, and run npm install to install Webpack and Bootstrap.
Build the project using Maven with the command mvn clean install.
Run the Spring Boot application with the command mvn spring-boot:run.
Access the application at http://localhost:8080.

6. Deploy the WAR file to your favorite servlet container (e.g., Tomcat).

7. Access the application at `http://localhost:8080/e-Dastavej`.

## License
This project is licensed under the MIT License.
