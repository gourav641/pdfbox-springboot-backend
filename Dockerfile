# Stage 1: Build the Spring Boot application
# Uses a JDK image from Eclipse Temurin for compilation.
FROM eclipse-temurin:17-jdk-focal AS builder

# Set the working directory inside the container for the build stage.
WORKDIR /app

# Copy the Gradle wrapper and its directory.
# This allows you to use the Gradle wrapper (gradlew) inside the container.
COPY gradlew .
COPY gradle gradle

# Copy the build configuration files.
# build.gradle: Main build script.
# settings.gradle: Defines multi-project builds if applicable.
COPY build.gradle settings.gradle .

# Copy the source code.
# The `src` directory contains your Java source files, resources, etc.
COPY src src

# Make the Gradle wrapper script executable.
RUN chmod +x gradlew

# Build the Spring Boot application into an executable JAR.
# `bootJar` task creates the executable JAR.
# `-x test` skips running tests during the Docker build, which speeds up the build process.
# This assumes your main JAR will be named `Billing-0.0.1-SNAPSHOT.jar` based on your
# build.gradle `group` and `version`.
RUN ./gradlew bootJar -x test

# Stage 2: Create the final, lightweight runtime image
# Uses a JRE image from Eclipse Temurin, which is much smaller than a JDK image.
FROM eclipse-temurin:17-jre-focal

# Set the working directory inside the container for the runtime stage.
WORKDIR /app

# Copy the executable JAR from the builder stage to the final image.
# The JAR is copied from `/app/build/libs/Billing-0.0.1-SNAPSHOT.jar` in the builder stage
# and renamed to `app.jar` in the current stage for simplicity.
COPY --from=builder /app/build/libs/Billing-0.0.1-SNAPSHOT.jar app.jar

# Expose the port on which your Spring Boot application will listen.
# Based on your application.properties, this is 9090.
EXPOSE 8081

# Define the command to run your application when the container starts.
# `java -jar app.jar` executes the Spring Boot application.
# Spring Boot automatically picks up the `server.port` from application.properties
# and will also respect the `PORT` environment variable set by Render if it's different.
ENTRYPOINT ["java", "-jar", "app.jar"]
