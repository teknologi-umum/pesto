FROM eclipse-temurin:17-jdk-alpine AS builder

ADD target/pesto-registration.jar pesto-registration.jar
ENTRYPOINT [ "java", "-jar", "-Dserver.port=8080", "pesto-registration.jar"]
EXPOSE 8080