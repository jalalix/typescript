import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
const JalaliX = require('../index.js')

const fixtures = JSON.parse(readFileSync(join(__dirname, '../testdata/timezone.json'), 'utf8'))

let passed = 0
let failed = 0

function assert(condition, message) {
	if (condition) {
		passed++
		console.log(`  ✓ ${message}`)
	} else {
		failed++
		console.error(`  ✗ ${message}`)
	}
}

function assertEqual(actual, expected, message) {
	assert(actual === expected, `${message} (got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)})`)
}

console.log('timezone fixtures')

for (const testCase of fixtures.cases) {
	console.log(`\n${testCase.id}`)

	if (testCase.setTimezoneAlias) {
		const d = JalaliX.create(testCase.unixMs).setTimezone(testCase.setTimezoneAlias)
		assertEqual(d.getTimezone(), testCase.expectTimezone, `alias ${testCase.setTimezoneAlias} -> ${testCase.expectTimezone}`)
		continue
	}

	const d = JalaliX.create(testCase.unixMs, { timezone: testCase.withTimezone })
	assertEqual(d.getTimezone(), testCase.withTimezone, `timezone is ${testCase.withTimezone}`)
	assertEqual(d.format('YYYY/MM/DD'), testCase.jalaliSlash, `Jalali date ${testCase.jalaliSlash}`)
	assertEqual(d.format('HH:mm'), testCase.wallTime.slice(0, 5), `wall time ${testCase.wallTime.slice(0, 5)}`)
	assertEqual(d.toISODate('jalali'), testCase.jalaliIso, `Jalali ISO ${testCase.jalaliIso}`)
	assertEqual(d.toISODate('gregorian'), testCase.wallGregorian, `Gregorian wall ${testCase.wallGregorian}`)

	const [hh, mm] = testCase.wallTime.split(':').map(Number)
	assertEqual(d.getHours(), hh, `getHours() === ${hh}`)
	assertEqual(d.getMinutes(), mm, `getMinutes() === ${mm}`)
}

console.log('\nsetTimezone instant-preserving')

{
	const ms = 1740430800000
	const a = JalaliX.create(ms, { timezone: 'Asia/Tehran' })
	const b = a.setTimezone('UTC')
	assertEqual(a.getTime(), ms, 'Tehran getTime unchanged')
	assertEqual(b.getTime(), a.getTime(), 'setTimezone keeps getTime()')
	assertEqual(a.format('YYYY/MM/DD'), '1403/12/07', 'Tehran Jalali day')
	assertEqual(b.format('YYYY/MM/DD'), '1403/12/06', 'UTC Jalali day')
	assertEqual(a.getHours(), 0, 'Tehran hours')
	assertEqual(a.getMinutes(), 30, 'Tehran minutes')
	assertEqual(b.getHours(), 21, 'UTC hours')
	assertEqual(b.getMinutes(), 0, 'UTC minutes')
}

console.log('\nalias utc -> UTC')

{
	const d = JalaliX.create(1740484800000).setTimezone('utc')
	assertEqual(d.getTimezone(), 'UTC', 'getTimezone() is UTC')
}

console.log('\ninvalid IANA throws')

{
	let threw = false

	try {
		JalaliX.create(Date.now()).setTimezone('Mars/Olympus')
	} catch (error) {
		threw = error instanceof Error
	}

	assert(threw, 'invalid zone throws Error')
}

console.log('\nhost-local golden: create(2025-02-25)')

{
	const d = JalaliX.create('2025-02-25')
	assertEqual(d.format('YYYY/MM/DD'), '1403/12/07', "create('2025-02-25') -> 1403/12/07")
}

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)
