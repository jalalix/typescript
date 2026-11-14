import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const JalaliX = require('../index.js')

const root = dirname(fileURLToPath(import.meta.url))
const golden = JSON.parse(readFileSync(join(root, '../testdata/golden.json'), 'utf8'))

let passed = 0

function check(name, cond, detail = '') {
	if (!cond) {
		console.error(`FAIL ${name}${detail ? ': ' + detail : ''}`)
		process.exitCode = 1
		return
	}

	console.log(`  ✓ ${name}`)
	passed++
}

function createFrom(spec) {
	if (spec.unixMs != null) {
		let d = JalaliX.create(spec.unixMs)

		if (spec.timezone) d = d.setTimezone(spec.timezone)

		return d
	}

	return JalaliX.create(spec.isoDate)
}

console.log('calendar')

for (const c of golden.calendar) {
	const d = createFrom(c.create)
	check(`${c.id} format`, d.format('YYYY/MM/DD') === c.expect.formatYYYYMMDD, d.format('YYYY/MM/DD'))
	check(`${c.id} iso g`, d.toISODate() === c.expect.toISODateGregorian)
	check(`${c.id} iso j`, d.toISODate('jalali') === c.expect.toISODateJalali)
}

console.log('parse')

for (const c of golden.parse) {
	const d = JalaliX.parseJalali(c.input)
	check(`${c.id} iso`, d.toISODate() === c.expect.toISODateGregorian)
	if (c.expect.formatYYYYMMDD) check(`${c.id} format`, d.format('YYYY/MM/DD') === c.expect.formatYYYYMMDD)
}

console.log('format')

for (const c of golden.format) {
	if (c.toPersian) {
		check('toPersian', JalaliX.toPersian(c.toPersian.input) === c.toPersian.expect)
		check('fromPersian', JalaliX.fromPersian(c.fromPersian.input) === c.fromPersian.expect)
		continue
	}

	const d = createFrom(c.create)
	check(c.id, d.format(c.pattern, c.options) === c.expect, d.format(c.pattern, c.options))
}

console.log('timezone')

for (const c of golden.timezone) {
	if (c.setTimezoneAlias) {
		const d = JalaliX.create(c.unixMs).setTimezone(c.setTimezoneAlias)
		check(c.id, d.getTimezone() === c.expectTimezone, d.getTimezone())
		continue
	}

	const d = JalaliX.create(c.unixMs).setTimezone(c.withTimezone)
	check(`${c.id} jalali`, d.format('YYYY/MM/DD') === c.expect.jalaliSlash)

	if (c.expect.jalaliIso) check(`${c.id} jalaliIso`, d.toISODate('jalali') === c.expect.jalaliIso)
	if (c.expect.wallGregorian) check(`${c.id} wallG`, d.toISODate() === c.expect.wallGregorian)

	check(`${c.id} h`, d.getHours() === c.expect.hours)
	check(`${c.id} m`, d.getMinutes() === c.expect.minutes)

	if (c.expect.getTime != null) check(`${c.id} instant`, d.getTime() === c.expect.getTime)
}

console.log('mutations')

for (const c of golden.mutations) {
	let d = createFrom(c.create)

	if (c.setFullYear) {
		d.setFullYear(c.setFullYear.year, c.setFullYear.month0, c.setFullYear.day)
		check(`${c.id} getMonth`, d.getMonth() === c.expect.getMonth)
		check(`${c.id} format`, d.format('YYYY/MM/DD') === c.expect.formatYYYYMMDD)
		continue
	}

	for (const op of c.ops) {
		if (op.startsWith('addMonths:')) d = d.addMonths(Number(op.split(':')[1]))
		else if (op === 'getStartOfMonth') d = d.getStartOfMonth()
	}

	check(c.id, d.format('YYYY/MM/DD') === c.expect.formatYYYYMMDD)
}

console.log(`\n${passed} assertions ok`)
