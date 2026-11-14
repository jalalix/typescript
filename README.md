# JalaliX

Jalali (Persian / Shamsi) calendar on top of the native `Date` object. TypeScript, no dependencies.

[![npm](https://img.shields.io/npm/v/@jalalix/typescript.svg)](https://www.npmjs.com/package/@jalalix/typescript)
[![license](https://img.shields.io/npm/l/@jalalix/typescript.svg)](./LICENSE)

```bash
npm install @jalalix/typescript
```

```ts
import JalaliX from '@jalalix/typescript'

const date = JalaliX.create('2025-02-25')

date.format('YYYY/MM/DD') // 1403/12/07
date.format('DD MMM YYYY', { persianDigits: true }) // ۰۷ اسفند ۱۴۰۳

JalaliX.parseJalali('1403/12/07').toISODate() // 2025-02-25
```

`toISODate()` uses wall-clock getters in the active timezone. Prefer it over `toISOString().slice(0, 10)` when you need a calendar date string.

## Timezone

Internal storage is always a **UTC Unix millisecond instant** plus an IANA timezone id. `setTimezone` is **instant-preserving**: the timestamp stays the same; only the zone (and therefore wall clock / Jalali day) changes.

```ts
const d = JalaliX.create(1740430800000) // 2025-02-25T00:30:00+03:30

const tehran = d.setTimezone('Asia/Tehran')
tehran.format('YYYY/MM/DD') // 1403/12/07
tehran.format('HH:mm') // 00:30

const utc = d.setTimezone('UTC')
utc.format('YYYY/MM/DD') // 1403/12/06
utc.format('HH:mm') // 21:00

tehran.getTime() === utc.getTime() // true
```

- **Aliases:** `utc` / `gmt` -> `UTC`; `local` / `default` / `system` -> host IANA from `Intl.DateTimeFormat().resolvedOptions().timeZone`.
- **Invalid zone** -> throws `Error`.
- Requires **Node 18+** or a modern browser with `Intl` IANA support. No dependencies. Does not use `navigator`.

```ts
JalaliX.create(new Date(), { timezone: 'Asia/Tehran' })
```

## Install

```bash
npm install @jalalix/typescript
```

```ts
import JalaliX from '@jalalix/typescript'
// or: const JalaliX = require('@jalalix/typescript')
```

## Usage

### create / format

```ts
const now = JalaliX.create(new Date(), { timezone: 'Asia/Tehran' })

now.format('YYYY/MM/DD')
now.format('WN، DD MMM YYYY')
now.format('YYYY/MM/DD', { persianDigits: true })
now.format('DD MMM YYYY', { calendar: 'gregorian' })
```

`format` also accepts the older positional form: `format(str, persianDigits?, gregorian?)`.

### parseJalali

```ts
JalaliX.parseJalali('1403/12/07')
JalaliX.parseJalali('۱۴۰۳-۱۲-۰۷ 14:30')
```

Named `parseJalali` because `Date` already has `parse`.

### toISODate

```ts
const d = JalaliX.create('2025-02-25T00:30:00+03:30')

d.toISODate() // 2025-02-25
d.toISODate('jalali') // 1403-12-07
```

### add / start / end

```ts
JalaliX.create('2025-02-25').addMonths(1).getStartOfMonth().format('YYYY/MM/DD')
```

### Persian digits

```ts
JalaliX.toPersian('1403/12/07') // ۱۴۰۳/۱۲/۰۷
JalaliX.fromPersian('۱۴۰۳/۱۲/۰۷') // 1403/12/07
```

## Months

This is easy to get wrong:

- `getMonth()` -> 1..12 (Farvardin = 1)
- `setMonth(m)` / `setFullYear(y, m)` -> 0..11, same as `Date` (Farvardin = 0)

```ts
const d = JalaliX.create(new Date())
d.setFullYear(1404, 0, 1) // 1 Farvardin 1404
d.getMonth() // 1
```

## Format tokens

| Token | |
|-|-|
| `YYYY` `YY` | year |
| `MMM` `MM` `M` | month name / number |
| `DD` `D` | day |
| `HH` `hh` `mm` `ss` | time |
| `A` `a` | meridiem (ق.ظ. / ب.ظ. or AM/PM) |
| `WN` `WL` | weekday name / letter |
| `w` `DDD` | week of year / day of year |
| `X` `x` | unix seconds / ms |

```ts
date.format('YYYY/MM/DD')
date.format('YYYY/MM/DD', { persianDigits: true })
date.format('DD MMM YYYY', { calendar: 'gregorian' })
```

## API

Static:

- `create(date, options?)` — timestamp, ISO string, or `Date`
- `parseJalali(str, options?)`
- `isValidDate(value)`
- `toPersian(str)` / `fromPersian(str)`
- `compare(a, b)` — true if `a` is before `b`

`options` is `{ timezone?: string }` (IANA id or alias; see [Timezone](#timezone)).

Instance (main ones):

- `format(...)`, `toISODate(calendar?)`
- `toString()`, `toDateString()`, `toLocaleDateString()`, `toLocaleTimeString()`
- `getFullYear()`, `getMonth()`, `getDate()`, `getDay()`, …
- `getHours` / `getMinutes` / `getSeconds` / `getMilliseconds` (wall time in active zone)
- `setFullYear`, `setMonth`, `setDate`, `setHours`, …
- `addYears`, `addMonths`, `addWeeks`, `addDays`
- `getStartOfYear` / `Month` / `Week` / `Day` and matching `getEndOf*`
- `clone()`, `setTimezone(tz)` (instant-preserving), `getTimezone()`

JalaliX extends `Date`, so you can pass it where a `Date` is expected.

Types are included. You can also import `JalaliOptions` and `JalaliFormatOptions`.

## Links

- https://www.npmjs.com/package/@jalalix/typescript
- https://jalalix.com
- https://github.com/jalalix/typescript
- [CHANGELOG.md](./CHANGELOG.md)

## License

MIT. Hossein Maklavani — https://maklavani.dev
