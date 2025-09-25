## Using Mock Data
```C#
foreach (var e in EventCatalog.EventRepository.Events)
{
    Console.WriteLine($"{e.Title} on {e.Date:d}");
}
```