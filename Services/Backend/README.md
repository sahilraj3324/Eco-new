# Eco Backend API

This is the backend API for the Eco project. The API is built with ASP.NET Core and uses SQL Server for data storage.

## Setup Instructions

### Prerequisites

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- SQL Server (see OS-specific instructions below)

### Setting Up SQL Server

#### Windows Users
1. Install [SQL Server Express](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
2. Install [SQL Server Management Studio (SSMS)](https://docs.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms)
3. Using SSMS, connect to your local SQL Server instance
4. Create a new database named `EcoSy`

#### macOS Users
1. Install Docker for Mac
2. Run SQL Server in Docker:
   ```
   docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourStrong!Passw0rd" -p 1433:1433 --name sql1 -d mcr.microsoft.com/mssql/server:2022-latest
   ```
3. Verify the container is running:
   ```
   docker ps
   ```

### Running the Application

1. Clone the repository
2. Navigate to the Backend directory
   ```
   cd Services/Backend
   ```
3. Restore packages
   ```
   dotnet restore
   ```
4. Apply migrations (first time only)
   ```
   dotnet tool install --global dotnet-ef
   dotnet ef database update --project Backend
   ```
5. Run the application
   ```
   dotnet run --project Backend
   ```
6. Open your browser and navigate to:
   ```
   http://localhost:5261
   ```

## API Documentation

API documentation is available via Swagger UI at the root URL when the application is running.

## Troubleshooting

### SQL Server Connection Issues

#### Windows Users
- Ensure SQL Server is running (check Services)
- Verify your Windows Authentication is working
- Check that the database exists

#### macOS Users
- Ensure Docker is running
- Verify the SQL Server container is running (`docker ps`)
- Test the connection: `docker exec -it sql1 /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "YourStrong!Passw0rd"`

### Entity Framework Migrations
If you encounter migration issues, try:
```
dotnet ef database drop --force --project Backend
dotnet ef database update --project Backend
```

### HTTPS Certificate Issues
If you have issues with HTTPS:
```
dotnet dev-certs https --clean
dotnet dev-certs https --trust
``` 