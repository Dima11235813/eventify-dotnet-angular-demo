`IEnumerable<T>` is the fundamental LINQ target in .NET, so you get access to a **rich set of query operators** once you bring the LINQ extensions into scope (`using System.Linq;`).
These are *extension methods* defined in `System.Linq.Enumerable`, not instance methods on the interface itself, but they’re what you typically use in day-to-day code.

Below is a categorized list of the most important built-in operators you can call on something like
`IEnumerable<EventDto>`.

---

## 1️⃣ Filtering & Element Selection

| Method                              | Purpose                                                            |
| ----------------------------------- | ------------------------------------------------------------------ |
| **Where**                           | Filters based on a predicate (`.Where(e => e.MaxCapacity > 100)`). |
| **OfType<T>**                       | Filters elements of a given type.                                  |
| **Distinct / DistinctBy (.NET 6+)** | Removes duplicates (optionally by key).                            |
| **Skip / Take**                     | Pagination (skip N, take N).                                       |
| **SkipWhile / TakeWhile**           | Conditional skipping/taking until predicate fails.                 |
| **ElementAt / ElementAtOrDefault**  | Index-based retrieval.                                             |
| **First / FirstOrDefault**          | First element with optional predicate.                             |
| **Last / LastOrDefault**            | Last element with optional predicate.                              |
| **Single / SingleOrDefault**        | Exactly one element (throws if not 1).                             |
| **DefaultIfEmpty**                  | Supplies a default if sequence is empty.                           |

---

## 2️⃣ Projection (Transforming)

| Method         | Purpose                                                    |
| -------------- | ---------------------------------------------------------- |
| **Select**     | Map each item to something else (`.Select(e => e.Title)`). |
| **SelectMany** | Flatten nested collections.                                |
| **Zip**        | Combine two sequences pairwise.                            |

---

## 3️⃣ Ordering & Grouping

| Method                          | Purpose                    |
| ------------------------------- | -------------------------- |
| **OrderBy / OrderByDescending** | Sort ascending/descending. |
| **ThenBy / ThenByDescending**   | Secondary sort keys.       |
| **Reverse**                     | Reverse the sequence.      |
| **GroupBy**                     | Group elements by key.     |

---

## 4️⃣ Aggregation & Quantifiers

| Method                        | Purpose                                                              |
| ----------------------------- | -------------------------------------------------------------------- |
| **Any**                       | Returns `true` if any element matches (or if sequence is non-empty). |
| **All**                       | Returns `true` if every element matches.                             |
| **Count / LongCount**         | Number of elements (optionally with predicate).                      |
| **Sum / Min / Max / Average** | Numeric aggregates.                                                  |
| **Aggregate**                 | Custom accumulation/fold.                                            |

---

## 5️⃣ Set Operations

| Method                        | Purpose                                        |
| ----------------------------- | ---------------------------------------------- |
| **Union / UnionBy (.NET 6+)** | Set union (distinct elements).                 |
| **Intersect / IntersectBy**   | Set intersection.                              |
| **Except / ExceptBy**         | Set difference.                                |
| **SequenceEqual**             | Checks if two sequences are elementwise equal. |
| **Concat**                    | Simple concatenation (no distinct).            |

---

## 6️⃣ Generation & Conversion

| Method                      | Purpose                                                                        |
| --------------------------- | ------------------------------------------------------------------------------ |
| **ToList / ToArray**        | Materialize the query.                                                         |
| **ToDictionary / ToLookup** | Create keyed collections.                                                      |
| **AsEnumerable**            | Treat something as `IEnumerable<T>` (remove provider-specific query features). |
| **Empty<T>()**              | Returns an empty sequence.                                                     |
| **Range / Repeat**          | Generate numeric or repeated-element sequences.                                |

---

### Example

```csharp
using System.Linq;

IEnumerable<EventDto> events = GetEvents();

var bigFutureEvents =
    events
        .Where(e => e.MaxCapacity > 100 && e.Date > DateTimeOffset.Now)
        .OrderBy(e => e.Date)
        .Select(e => new { e.Title, e.Date });
```

This combines **filtering**, **ordering**, and **projection** in a single fluent chain.

---

### Key Takeaway

The power of `IEnumerable<T>` lies in **LINQ extension methods in `System.Linq`**.
Bring `using System.Linq;` into scope, and you can compose rich, declarative pipelines with operators like **Any, All, Where, Select, GroupBy, Aggregate, DistinctBy**, and many more.
