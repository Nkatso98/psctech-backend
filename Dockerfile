FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://0.0.0.0:8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# 1) Copy the project file exactly where it lives
COPY backend/psctech-backend.csproj backend/

# 2) Restore using the project path
RUN dotnet restore "backend/psctech-backend.csproj"

# 3) Copy the full source and publish from inside backend
COPY . .
WORKDIR /src/backend
RUN dotnet publish "psctech-backend.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "psctech-backend.dll"]
