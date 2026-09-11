# Build Stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY SpeakMateAI/pom.xml .
COPY SpeakMateAI/src ./src
RUN mvn clean package -DskipTests

# Runtime Stage
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

ENV PORT=9091
EXPOSE 9091

ENTRYPOINT ["java", "-Xms128m", "-Xmx256m", "-XX:+UseSerialGC", "-XX:MaxMetaspaceSize=128m", "-jar", "app.jar"]
