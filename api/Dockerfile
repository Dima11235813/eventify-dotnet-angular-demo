# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj files and restore dependencies
COPY ["EventManagement.sln", "./"]
COPY ["src/Domain/EventManagement.Domain.csproj", "src/Domain/"]
COPY ["src/Application/EventManagement.Application.csproj", "src/Application/"]
COPY ["src/Infrastructure/EventManagement.Infrastructure.csproj", "src/Infrastructure/"]
COPY ["src/Presentation/EventManagement.Presentation.csproj", "src/Presentation/"]
COPY ["EventManagement.Tests/EventManagement.Tests.csproj", "EventManagement.Tests/"]

RUN dotnet restore

# Copy everything else and build
COPY . .
WORKDIR "/src/src/Presentation"
RUN dotnet build "EventManagement.Presentation.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "EventManagement.Presentation.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

EXPOSE 80
EXPOSE 443

ENTRYPOINT ["dotnet", "EventManagement.Presentation.dll"]
