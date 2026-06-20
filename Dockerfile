FROM eclipse-temurin:17-jdk-jammy AS builder
WORKDIR /app
COPY . .
WORKDIR /app/backend
RUN apt-get update && apt-get install -y maven && \
    mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=builder /app/backend/target/*.jar app.jar
EXPOSE 8080
# Optimize memory for Render Free Tier (512MB limit)
ENTRYPOINT ["java", "-Xmx384m", "-Xms384m", "-XX:+UseSerialGC", "-jar", "app.jar"]



