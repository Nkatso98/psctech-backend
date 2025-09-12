# ---------- Build stage ----------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# copy everything and restore/publish
COPY . .
RUN dotnet restore
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# ---------- Runtime stage ----------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
# EXPOSE is informational; Render sets PORT at runtime
EXPOSE 8080

COPY --from=build /app/publish ./

# Bind Kestrel to Render's dynamic PORT (expand at runtime via bash)
ENTRYPOINT ["/bin/bash","-lc","dotnet psctech-backend.dll --urls http://0.0.0.0:$PORT"]
