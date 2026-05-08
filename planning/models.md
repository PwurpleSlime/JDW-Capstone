## Table `parents`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `created_at` | `timestamptz` |  |
| `firstName` | `text` |  |
| `lastName` | `text` |  Nullable |
| `phone` | `text` |  |
| `email` | `text` |  Unique |
| `affiliation` | `text` |  |


## Table `children`

Child Items of a parent

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `created_at` | `timestamptz` |  |
| `parentId` | `int8` |  |
| `firstName` | `text` |  |
| `lastName` | `text` |  Nullable |
| `dob` | `text` |  Nullable |
| `requestedHours` | `text` |  |
| `startDate` | `text` |  |
| `immunizationStatus` | `text` |  |
