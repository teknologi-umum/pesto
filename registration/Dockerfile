FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src
COPY ["Registration.csproj", "./"]
RUN dotnet restore "Registration.csproj"
COPY . .
WORKDIR "/src/"
RUN dotnet build "Registration.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Registration.csproj" -c Release -o /app/publish

FROM base AS final
RUN apt-get update && apt-get install -y curl gzip
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Registration.dll"]
