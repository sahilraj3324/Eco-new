# Developer Configuration Reference

## Automatic Connection String Detection

The application now automatically detects which developer's machine it's running on and uses the appropriate connection string. **No manual configuration needed!**

## Database Connection Strings

### Sahil's Machine (DESKTOP-A2CPUB1)
```
Server=DESKTOP-A2CPUB1\\SQLEXPRESS;Database=Ecocys6;Trusted_Connection=True;MultipleActiveResultSets=true;
```

### Bevan's Machine (VANQUISHER)
```
Server=VANQUISHER\\SQLEXPRESS;Database=Ecocys6;Trusted_Connection=True;MultipleActiveResultSets=true;
```

### Shivu's Machine (SHIVUUU)
```
Server=SHIVUUU\\SQLEXPRESS;Database=Ecocys6;Trusted_Connection=True;MultipleActiveResultSets=true;
```

## How It Works

The application automatically:
1. Detects the computer name using `Environment.MachineName`
2. Maps the machine name to the appropriate connection string
3. Uses the correct database connection without any manual intervention

## Current Machine Mapping

| Machine Name | Connection String Used | Developer |
|--------------|----------------------|-----------|
| DESKTOP-A2CPUB1 | SahilConnection | Sahil |
| VANQUISHER | BevanConnection | Bevan |
| SHIVUUU | ShivuConnection | Shivu |
| Any Other | DefaultConnection | Fallback |

## Adding New Developers

When adding a new developer:
1. Get their computer name (run `echo %COMPUTERNAME%` in cmd)
2. Add their connection string to `appsettings.Development.json`
3. Update the `GetConnectionStringForCurrentMachine()` method in `Program.cs`

Example:
```csharp
return machineName switch
{
    "DESKTOP-A2CPUB1" => "SahilConnection",
    "VANQUISHER" => "BevanConnection", 
    "SHIVUUU" => "ShivuConnection",
    "NEW-DEV-MACHINE" => "NewDevConnection",  // Add new developer here
    _ => "DefaultConnection"
};
```

## Alternative Detection Methods

If you prefer username detection instead of machine name:

```csharp
private static string GetConnectionStringForCurrentUser()
{
    string userName = Environment.UserName.ToUpper();
    
    return userName switch
    {
        "SAHIL" => "SahilConnection",
        "BEVAN" => "BevanConnection",
        "SHIVU" => "ShivuConnection",
        _ => "DefaultConnection"
    };
}
```

## Environment Variables (Still Available)

You can still override using environment variables:
```bash
set ConnectionStrings__DefaultConnection="your-connection-string-here"
```

Or in PowerShell:
```powershell
$env:ConnectionStrings__DefaultConnection="your-connection-string-here"
```

## Testing Your Setup

To verify which connection string is being used, check the console output when the application starts. You can add this to Program.cs for debugging:

```csharp
Console.WriteLine($"Using machine: {Environment.MachineName}");
Console.WriteLine($"Selected connection: {connectionStringKey}");
``` 