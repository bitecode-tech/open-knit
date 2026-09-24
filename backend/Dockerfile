# syntax=docker/dockerfile:1.10

FROM amazoncorretto:21-alpine3.18 AS build

WORKDIR /app

COPY gradlew .
COPY gradle gradle
COPY settings.gradle build.gradle ./
COPY modules/_common/build.gradle modules/_common/build.gradle
COPY modules/identity/build.gradle modules/identity/build.gradle
COPY modules/document/build.gradle modules/document/build.gradle
COPY modules/ocr/build.gradle modules/ocr/build.gradle
COPY modules/payment/build.gradle modules/payment/build.gradle
COPY modules/transaction/build.gradle modules/transaction/build.gradle
COPY modules/wallet/build.gradle modules/wallet/build.gradle
COPY modules/ai/build.gradle modules/ai/build.gradle

RUN chmod +x ./gradlew
RUN --mount=type=cache,target=/root/.gradle,sharing=locked ./gradlew --no-daemon --build-cache help

COPY src src
COPY modules modules

RUN --mount=type=cache,target=/root/.gradle,sharing=locked ./gradlew --no-daemon --build-cache --parallel bootJar -x test

FROM amazoncorretto:21-alpine3.18 AS runner

WORKDIR /app
RUN apk add --no-cache wget curl
COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
