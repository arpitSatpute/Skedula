# Stage 1: Build application
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Cache maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code and build jar
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Production runtime
FROM eclipse-temurin:21-jre-alpine AS runtime

WORKDIR /app

# Create a secure non-root user and group
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy jar from build stage
COPY --from=build --chown=spring:spring /app/target/Skedula-*.jar app.jar

# Container-aware JVM options
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]

