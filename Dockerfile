# ==========================================
# Build Stage
# ==========================================
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom.xml and download dependencies to optimize caching
COPY SpeakMateAI-Backend/pom.xml .
COPY SpeakMateAI-Backend/src ./src

# Package production executable JAR without running tests
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

# Memory and fast-boot limits tuned for Render Starter/Free (512MB RAM) containers
ENTRYPOINT ["sh", "-c", "java -Xms128m -Xmx384m -XX:+UseSerialGC -XX:MaxMetaspaceSize=128m -XX:+TieredCompilation -XX:TieredStopAtLevel=1 -Dserver.port=${PORT:-9091} -jar app.jar"]
