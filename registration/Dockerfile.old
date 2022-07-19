FROM ghcr.io/graalvm/graalvm-ce:ol7-java17-22.1.0 AS builder

ADD . /build
WORKDIR /build

# For SDKMAN to work we need unzip & zip
RUN yum install -y unzip zip

RUN \
    # Install SDKMAN
    curl -s "https://get.sdkman.io" | bash; \
    source "$HOME/.sdkman/bin/sdkman-init.sh"; \
    sdk install maven; \
    # Install GraalVM Native Image
    gu install native-image;

RUN source "$HOME/.sdkman/bin/sdkman-init.sh" && mvn --version

RUN native-image --version

RUN source "$HOME/.sdkman/bin/sdkman-init.sh" && mvn -B clean package -P native --no-transfer-progress


FROM oraclelinux:7-slim

RUN yum update -y && yum install -y curl

# Add Spring Boot Native app pesto to Container
COPY --from=builder "/build/target/pesto" pesto

# Fire up our Spring Boot Native app by default
CMD [ "sh", "-c", "./pesto -Dserver.port=$PORT" ]