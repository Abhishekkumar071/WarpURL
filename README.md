# 🚀 WarpURL - Advanced URL Shortener Service

![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=java&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-F2F4F9?style=for-the-badge&logo=spring-boot)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

WarpURL is a highly scalable, production-ready URL Shortening API built with Spring Boot. It uses a highly efficient **Base62 Encoding Algorithm** to generate collision-free short URLs and provides deep time-series analytics for link clicks.

## 🎯 Objective
The primary goal of this project is to provide a fast, secure, and reliable way to shorten long URLs while tracking user engagement. It is designed keeping **Read-Heavy System Architecture** in mind, warping users to their destination instantly.

## ✨ Core Features
* **Stateless Security:** Secured with JWT (JSON Web Tokens) and Spring Security 6.x.
* **Collision-Free Hashing:** Utilizes Database ID to Base62 conversion, making duplicate short URLs mathematically impossible.
* **Time-Series Analytics:** Tracks click events along with timestamps to generate usage dashboards.
* **Containerized:** Fully Dockerized using Multi-Stage builds for optimized image sizes.
* **CORS Configured:** Ready to be consumed by any modern frontend (React, Next.js, Vue).

## 🛠️ System Architecture & Tech Stack
* **Backend Framework:** Java 17+ & Spring Boot 3.x
* **Database:** PostgreSQL (Relational mapping via Hibernate/Spring Data JPA)
* **Authentication:** Spring Security with custom JWT Filters
* **Build Tool:** Maven
* **Containerization:** Docker (Multi-stage Eclipse Temurin image)

---

## 🚀 Getting Started (Local Development)

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites
* Java Development Kit (JDK) 17 or higher
* PostgreSQL Database installed and running
* Maven (optional, wrapper included)

### 1. Clone the repository
```bash
git clone [https://github.com/Abhishekkumar071/WarpURL.git](https://github.com/Abhishekkumar071/WarpURL.git)
run backend: cd WarpURL-sb
run frontend: cd WarpURL-react (npm intall then npm run dev)

```
2. Database Setup
Create a blank database in your local PostgreSQL instance:

SQL
CREATE DATABASE url_shortener_db;
3. Configure Application Properties
Navigate to src/main/resources/application.properties and update your database credentials:

Properties
```
spring.datasource.url=jdbc:postgresql://localhost:5432/url_shortener_db
spring.datasource.username=YOUR_POSTGRES_USERNAME
spring.datasource.password=YOUR_POSTGRES_PASSWORD
```
# Set a strong 256-bit Base64 encoded secret for JWT
jwt.secret=1234567890abcdef1234567890abcdef
jwt.expiration=86400000
4. Run the Application
Use the Maven wrapper to build and run the application:

Bash
./mvnw spring-boot:run
The application will start on http://localhost:8080.

🐳 Running with Docker
If you don't want to install Java locally, you can run the application using the provided Dockerfile.

Bash
# Build the image
docker build -t warpurl-api .

# Run the container
docker run -p 8080:8080 warpurl-api

🔌 API Documentation
1. Authentication Endpoints (Public)

Method,Endpoint,Description,Request Body
POST,/api/auth/public/register,Register a new user,"{ ""username"": ""John"", ""email"": ""j@test.com"", ""password"": ""123"" }"
POST,/api/auth/public/login,Authenticate & get JWT,"{ ""username"": ""John"", ""password"": ""123"" }"
