FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://0.0.0.0:8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
# copy the csproj where it actually lives
COPY backend/psctech-backend.csproj backend/
RUN dotnet restore backend/psctech-backend.csproj

# copy the rest of the repo, then move into backend
COPY . .
WORKDIR /src/backend
RUN dotnet publish psctech-backend.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet","psctech-backend.dll"]
