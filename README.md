# JalaliX - TypeScript

A lightweight, type-safe Jalali (Persian/Shamsi) calendar library for JavaScript and TypeScript. JalaliX extends the native `Date` object and provides full support for the Persian calendar alongside Gregorian formatting.

## Installation

```bash
npm install @jalalix/typescript
```

## Quick Start

```typescript
import JalaliX from '@jalalix/typescript'

// Create from current date
const now = JalaliX.create(new Date())

// Format as Jalali date
console.log(now.format('YYYY/MM/DD'))
// Output: 1403/12/06

// Format with Persian numerals
console.log(now.format('YYYY/MM/DD', false, true))
// Output: ۱۴۰۳/۱۲/۰۶

// Format as Gregorian
console.log(now.format('DD MMM YYYY', true))
// Output: 25 February 2025
```

## Documentation

### Static Methods

#### `JalaliX.create(date, options?)`

Creates a JalaliX instance from a date value.

| Parameter | Type | Description |
|-|-|-|
| date | `number \| string \| Date` | Timestamp, ISO string, or Date object |
| options | `{ timezone?: string }` | Optional timezone configuration |

**Example:**

```typescript
JalaliX.create('2025-02-25')
// Creates instance for 25 Feb 2025

JalaliX.create(1708819200000)
// Creates instance from timestamp

JalaliX.create(new Date(), { timezone: 'Asia/Tehran' })
// Creates instance in Tehran timezone
```

---

#### `JalaliX.isValidDate(date)`

Checks if a value is a valid Date.

**Example:**

```typescript
JalaliX.isValidDate(new Date())
// Output: true

JalaliX.isValidDate('invalid')
// Output: false
```

---

#### `JalaliX.toPersian(str)`

Converts Western numerals (0-9) to Persian numerals (۰-۹).

**Example:**

```typescript
JalaliX.toPersian('1403/12/06')
// Output: ۱۴۰۳/۱۲/۰۶

JalaliX.toPersian('Page 42')
// Output: Page ۴۲
```

---

#### `JalaliX.compare(date, comparing)`

Compares two JalaliX dates. Returns `true` if the first date is before the second.

**Example:**

```typescript
const d1 = JalaliX.create('2025-01-01')
const d2 = JalaliX.create('2025-12-31')

JalaliX.compare(d1, d2)
// Output: true
```

---

### Instance Methods

#### `toString()`

Returns full date string with weekday, day, month, year, and time in Jalali.

**Example:**

```typescript
JalaliX.create('2025-02-25').toString()
// Output: "دوشنبه 06 اسفند 1403 0:00:00 GMT+0330"
```

---

#### `toDateString()`

Returns date without time in Jalali.

**Example:**

```typescript
JalaliX.create('2025-02-25').toDateString()
// Output: "دوشنبه 06 اسفند 1403"
```

---

#### `toLocaleDateString()`

Returns date in YYYY/MM/DD format.

**Example:**

```typescript
JalaliX.create('2025-02-25').toLocaleDateString()
// Output: "1403/12/06"
```

---

#### `toLocaleTimeString()`

Returns time with meridiem.

**Example:**

```typescript
JalaliX.create('2025-02-25T14:30:00').toLocaleTimeString()
// Output: "2:30:00 ب.ظ."
```

---

#### `format(str, gregorian?, persian?)`

Formats the date using tokens. Supports both Jalali and Gregorian calendars.

| Parameter | Type | Default | Description |
|-|-|-|-|
| str | `string` | - | Format string with tokens |
| gregorian | `boolean` | `false` | Use Gregorian calendar |
| persian | `boolean` | `false` | Convert digits to Persian numerals |

**Format Tokens:**

| Token | Description | Example (Jalali) | Example (Gregorian) |
|--|-|-|-|
| `YYYY` | Full year | 1403 | 2025 |
| `YY` | Short year | 03 | 25 |
| `MMM` | Month name | اسفند | February |
| `MM` | Month (padded) | 12 | 02 |
| `M` | Month | 12 | 2 |
| `DD` | Day (padded) | 06 | 25 |
| `D` | Day | 6 | 25 |
| `HH` | Hour 24h (padded) | 14 | 14 |
| `H` | Hour 24h | 14 | 14 |
| `hh` | Hour 12h (padded) | 02 | 02 |
| `h` | Hour 12h | 2 | 2 |
| `mm` | Minutes (padded) | 30 | 30 |
| `ss` | Seconds (padded) | 45 | 45 |
| `A` / `a` | Meridiem | ق.ظ. / ب.ظ. | AM / PM |
| `WN` / `wn` | Weekday name | دوشنبه | Tuesday |
| `WL` / `wl` | Weekday letter | د | T |
| `w` | Week of year | 49 | 9 |
| `DDD` | Day of year | 342 | 56 |
| `X` | Unix timestamp (seconds) | 1740412800 | 1740412800 |
| `x` | Unix timestamp (ms) | 1740412800000 | 1740412800000 |

**Example:**

```typescript
const date = JalaliX.create('2025-02-25T14:30:45')

date.format('YYYY/MM/DD')
// Output: "1403/12/06"

date.format('DD MMM YYYY HH:mm')
// Output: "06 اسفند 1403 14:30"

date.format('YYYY/MM/DD', false, true)
// Output: "۱۴۰۳/۱۲/۰۶"

date.format('DD MMM YYYY', true)
// Output: "25 February 2025"

date.format('WN, DD MMM YYYY HH:mm A', true)
// Output: "Tuesday, 25 February 2025 02:30 PM"
```

---

#### `getFullYear()` / `getMonth()` / `getDate()`

Gets Jalali year, month (1-12), or day of month.

**Example:**

```typescript
const date = JalaliX.create('2025-02-25')

date.getFullYear()
// Output: 1403

date.getMonth()
// Output: 12

date.getDate()
// Output: 6
```

---

#### `getDay()`

Gets day of week (1=Saturday, 7=Friday in Jalali).

**Example:**

```typescript
JalaliX.create('2025-02-25').getDay()
// Output: 2 (دوشنبه / Tuesday)
```

---

#### `getDayISO()`

Gets ISO day of week (1=Monday, 7=Sunday).

**Example:**

```typescript
JalaliX.create('2025-02-25').getDayISO()
// Output: 2
```

---

#### `getWeekOfYear()` / `getDayOfYear()`

Gets week number (1-53) or day of year (1-366).

**Example:**

```typescript
JalaliX.create('2025-02-25').getWeekOfYear()
// Output: 49

JalaliX.create('2025-02-25').getDayOfYear()
// Output: 342
```

---

#### `getMeridiem()`

Gets meridiem in Persian (ق.ظ. or ب.ظ.).

**Example:**

```typescript
JalaliX.create('2025-02-25T09:00:00').getMeridiem()
// Output: "ق.ظ."

JalaliX.create('2025-02-25T14:00:00').getMeridiem()
// Output: "ب.ظ."
```

---

#### `getTimezone()`

Gets the system timezone (IANA format).

**Example:**

```typescript
JalaliX.create(new Date()).getTimezone()
// Output: "Asia/Tehran"
```

---

#### `clone()`

Creates a copy of the instance.

**Example:**

```typescript
const original = JalaliX.create('2025-02-25')
const copy = original.clone()
```

---

#### `setDate(date)` / `setMonth(month, date?)` / `setFullYear(year, month?, date?)`

Sets the date components. Month is 0-based (0=Farvardin, 11=Esfand).

**Example:**

```typescript
const date = JalaliX.create('2025-02-25')

date.setDate(15)
// Sets day to 15

date.setMonth(0)
// Sets to Farvardin (month 1)

date.setFullYear(1404, 0, 1)
// Sets to 1 Farvardin 1404
```

---

#### `setTime(time)` / `setHours(h, m?, s?, ms?)` / `setMinutes(m, s?, ms?)` / `setSeconds(s, ms?)` / `setMilliseconds(ms)`

Sets time components. Works like native Date methods.

---

#### `addYears(n)` / `addMonths(n)` / `addWeeks(n)` / `addDays(n)`

Adds time to the date (negative values subtract). Mutates and returns the instance.

**Example:**

```typescript
JalaliX.create('2025-02-25').addDays(7).format('YYYY/MM/DD')
// Output: "1403/12/13"

JalaliX.create('2025-02-25').addMonths(-1).format('YYYY/MM/DD')
// Output: "1403/11/06"
```

---

#### `getStartOfYear()` / `getStartOfMonth()` / `getStartOfWeek()` / `getStartOfDay()`

Returns the instance set to the start of the given period (00:00:00.000).

**Example:**

```typescript
JalaliX.create('2025-02-25T14:30:00').getStartOfDay().format('HH:mm:ss')
// Output: "00:00:00"

JalaliX.create('2025-02-25').getStartOfMonth().format('DD MMM')
// Output: "01 اسفند"
```

---

#### `getEndOfYear()` / `getEndOfMonth()` / `getEndOfWeek()` / `getEndOfDay()`

Returns the instance set to the end of the given period (23:59:59.999).

**Example:**

```typescript
JalaliX.create('2025-02-25T14:30:00').getEndOfDay().format('HH:mm:ss')
// Output: "23:59:59"
```

---

#### `setTimezone(timezone)`

Creates a new JalaliX instance in the specified timezone.

**Example:**

```typescript
JalaliX.create('2025-02-25T12:00:00').setTimezone('UTC').format('HH:mm')
// Output: "08:30" (if local is Asia/Tehran, UTC+3:30)
```
