import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const JalaliX = require('../index.js')

let passed = 0
let failed = 0

function assertEqual(actual, expected, message) {
	if (actual === expected) {
		passed++
		console.log(`  ✓ ${message}`)
	} else {
		failed++
		console.error(`  ✗ ${message} (got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)})`)
	}
}

console.log('Arabic-Indic + Persian digits -> fromPersian')

assertEqual(JalaliX.fromPersian('۱۴۰۳/۱۲/۰۷'), '1403/12/07', 'fromPersian: Persian digits')
assertEqual(JalaliX.fromPersian('١٤٠٣/١٢/٠٧'), '1403/12/07', 'fromPersian: Arabic-Indic digits')
assertEqual(JalaliX.fromPersian('۱٤۰٣/۱٢/۰٧'), '1403/12/07', 'fromPersian: mixed Persian + Arabic-Indic digits')

console.log('\nparseJalali dot separator')

assertEqual(JalaliX.parseJalali('1403.12.07').toISODate(), '2025-02-25', 'parseJalali: dot separator')

console.log('\nnormalizeQueryDate sentinels + timestamps')

assertEqual(JalaliX.normalizeQueryDate(null), null, 'null -> null')
assertEqual(JalaliX.normalizeQueryDate(undefined), null, 'undefined -> null')
assertEqual(JalaliX.normalizeQueryDate('null'), null, "'null' -> null")
assertEqual(JalaliX.normalizeQueryDate(''), null, "'' -> null")
assertEqual(JalaliX.normalizeQueryDate('undefined'), null, "'undefined' -> null")
assertEqual(JalaliX.normalizeQueryDate('Invalid Date'), null, "'Invalid Date' -> null")
assertEqual(JalaliX.normalizeQueryDate('NaN'), null, "'NaN' -> null")
assertEqual(JalaliX.normalizeQueryDate(NaN), null, 'NaN -> null')
assertEqual(JalaliX.normalizeQueryDate(0), null, '0 -> null')
assertEqual(JalaliX.normalizeQueryDate(-1), null, '-1 -> null')

{
	const seconds = 1740430800 // 2025-02-24 21:00:00 UTC / 2025-02-25 00:30:00 Tehran

	assertEqual(JalaliX.normalizeQueryDate(seconds, { timezone: 'UTC' }), '2025-02-24 21:00:00', 'unix seconds (UTC)')
	assertEqual(JalaliX.normalizeQueryDate(seconds * 1000, { timezone: 'Asia/Tehran' }), '2025-02-25 00:30:00', 'unix ms (Tehran)')
	assertEqual(JalaliX.normalizeQueryDate(String(seconds), { timezone: 'UTC' }), '2025-02-24 21:00:00', 'unix seconds as string (UTC)')
}

console.log('\nnormalizeQueryDate Jalali vs Gregorian year band')

assertEqual(JalaliX.normalizeQueryDate('1403/12/07', { timezone: 'UTC' }), '2025-02-25 00:00:00', 'Jalali slash date')
assertEqual(JalaliX.normalizeQueryDate('۱۴۰۳-۱۲-۰۷ 14:30:00', { timezone: 'UTC' }), '2025-02-25 14:30:00', 'Persian digits + dash + time')
assertEqual(JalaliX.normalizeQueryDate('2025.02.25'), '2025-02-25 00:00:00', 'Gregorian dot date')
assertEqual(JalaliX.normalizeQueryDate('2025-02-25 12:30:45.123Z'), '2025-02-25 12:30:45', 'fractional seconds + Z stripped')
assertEqual(JalaliX.normalizeQueryDate('not-a-date'), 'not-a-date', 'unrecognized string passes through cleaned')

assertEqual(JalaliX.normalizeQueryDate('1200/01/01', { timezone: 'UTC' }) !== null, true, '1200 is within default Jalali band')
assertEqual(JalaliX.normalizeQueryDate('1800/01/01', { timezone: 'UTC' }) !== null, true, '1800 is within default Jalali band')

assertEqual(JalaliX.normalizeQueryDate('2025-01-01'), '2025-01-01 00:00:00', 'Gregorian year stays Gregorian by default')
assertEqual(
	JalaliX.normalizeQueryDate('2025-01-01', { timezone: 'UTC', jalaliYearMin: 1, jalaliYearMax: 3000 }) !== '2025-01-01 00:00:00',
	true,
	'overriding jalaliYearMax treats 2025 as Jalali'
)

console.log('\nnormalizeQueryDate non-string / non-number pass-through')

{
	const obj = { a: 1 }
	const arr = [1, 2, 3]

	assertEqual(JalaliX.normalizeQueryDate(obj), obj, 'object passes through unchanged')
	assertEqual(JalaliX.normalizeQueryDate(arr), arr, 'array passes through unchanged')
	assertEqual(JalaliX.normalizeQueryDate(true), true, 'boolean passes through unchanged')
}

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)
