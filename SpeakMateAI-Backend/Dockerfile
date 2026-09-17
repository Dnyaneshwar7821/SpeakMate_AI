# ==========================================
# Build Stage (When Render Root Directory is SpeakMateAI-Backend)
# ==========================================
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom and source code
COPY pom.xml .
COPY src ./src

# Build production JAR without running tests
RUN mvn clean package -DskipTests

# ==========================================
# Runtime Stage
# ==========================================
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy compiled JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Render injects PORT dynamically (default 9091 locally)
ENV PORT=9091
EXPOSE 9091

# Memory limits tuned for Render Starter/Free (512MB RAM) containers
ENTRYPOINT ["sh", "-c", "java -Xms128m -Xmx384m -XX:+UseSerialGC -XX:MaxMetaspaceSize=128m -Dserver.port=${PORT:-9091} -jar app.jar"]
