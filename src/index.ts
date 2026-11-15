// Types
import type { JalaliDate, JalaliFormatOptions, JalaliNormalizeOptions, JalaliOptions, JalaliWallParts } from './index.types'

class JalaliX extends Date {
	// Active IANA timezone id. Internal Date value remains a UTC instant.
	private timezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone

	private jalali: JalaliDate = {
		year: 1348,
		month: 10,
		day: 11,
		hours: 0,
		min: 0,
		sec: 0,
		ms: 0,
		isLeapYear: false
	}

	private isConverted = false
	private leapYearDivision = 0.24219858156
	private firstDayOfWeek = 6
	private dateLength = 86400000
	private weekDaysNames = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه شنبه', 'چهار شنبه', 'پنج شنبه', 'جمعه']
	private weekDaysLetters = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']
	private weekDaysGregorianNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
	private weekDaysGregorianLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
	private monthsNames = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']
	private monthsGregorianNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
	static persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
	static arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
	private am = 'ق.ظ.'
	private pm = 'ب.ظ.'
	private amGregorian = 'AM'
	private pmGregorian = 'PM'

	// Host IANA timezone (system local).
	private static hostTimezone(): string {
		return Intl.DateTimeFormat().resolvedOptions().timeZone
	}

	// Wall-clock parts of this instant in the active IANA timezone.
	private getWallParts(): JalaliWallParts {
		const parts = new Intl.DateTimeFormat('en-US', {
			timeZone: this.timezone,
			hourCycle: 'h23',
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric'
		}).formatToParts(this)

		const read = (type: Intl.DateTimeFormatPartTypes): number => {
			const value = parts.find(part => part.type === type)?.value
			return value !== undefined ? Number(value) : 0
		}

		let hour = read('hour')
		if (hour === 24) hour = 0

		return {
			year: read('year'),
			month: read('month'),
			day: read('day'),
			hour,
			minute: read('minute'),
			second: read('second'),
			ms: ((this.getTime() % 1000) + 1000) % 1000
		}
	}

	/**
	 * Maps a wall-clock datetime in the active timezone to a UTC millisecond instant.
	 * Iteratively adjusts using formatToParts so DST transitions converge.
	 */
	private wallToUtc(y: number, m: number, d: number, h: number, mi: number, s: number, ms: number): number {
		const want = Date.UTC(y, m - 1, d, h, mi, s)
		let utc = want

		for (let i = 0; i < 14; i++) {
			const parts = new Intl.DateTimeFormat('en-US', {
				timeZone: this.timezone,
				hourCycle: 'h23',
				year: 'numeric',
				month: 'numeric',
				day: 'numeric',
				hour: 'numeric',
				minute: 'numeric',
				second: 'numeric'
			}).formatToParts(new Date(utc))

			const read = (type: Intl.DateTimeFormatPartTypes): number => {
				const value = parts.find(part => part.type === type)?.value
				return value !== undefined ? Number(value) : 0
			}

			let hour = read('hour')
			if (hour === 24) hour = 0

			const got = Date.UTC(read('year'), read('month') - 1, read('day'), hour, read('minute'), read('second'))
			const diff = want - got
			if (diff === 0) break
			utc += diff
		}

		return Math.floor(utc / 1000) * 1000 + (((ms % 1000) + 1000) % 1000)
	}

	/**
	 * Converts the current Date to Jalali (Persian) calendar date in the active timezone.
	 * @returns The Jalali date object with year, month, day, hours, minutes, seconds, milliseconds, and isLeapYear.
	 */
	private toJalali(): JalaliDate {
		if (!this.isConverted) {
			const wall = this.getWallParts()
			const civilDay = Date.UTC(wall.year, wall.month - 1, wall.day) / this.dateLength
			const baseDay = Date.UTC(1970, 0, 1) / this.dateLength
			const diffDays = civilDay - baseDay

			this.jalali.year = 1348
			this.jalali.month = 10
			this.jalali.day = 11

			if (diffDays > 0)
				for (let i = 0; i < diffDays; i++) {
					this.jalali.day++

					if (this.jalali.month < 7 && this.jalali.day > 31) {
						this.jalali.month++
						this.jalali.day = 1
					} else if (this.jalali.month > 6 && this.jalali.month < 12 && this.jalali.day > 30) {
						this.jalali.month++
						this.jalali.day = 1
					} else if (this.jalali.month === 12) {
						const isLeapYear = this.checkLeapYear(this.jalali.year)

						if (isLeapYear && this.jalali.day > 30) {
							this.jalali.year++
							this.jalali.month = 1
							this.jalali.day = 1
						} else if (!isLeapYear && this.jalali.day > 29) {
							this.jalali.year++
							this.jalali.month = 1
							this.jalali.day = 1
						}
					}
				}
			else if (diffDays < 0) {
				for (let i = 0; i < -1 * diffDays; i++) {
					this.jalali.day--

					if (this.jalali.day < 1)
						if (this.jalali.month === 1) {
							this.jalali.year--
							this.jalali.month = 12

							const isLeapYear = this.checkLeapYear(this.jalali.year)
							this.jalali.day = isLeapYear ? 30 : 29
						} else if (this.jalali.month < 8) {
							this.jalali.month--
							this.jalali.day = 31
						} else if (this.jalali.month < 13) {
							this.jalali.month--
							this.jalali.day = 30
						}
				}
			}

			this.jalali.hours = wall.hour
			this.jalali.min = wall.minute
			this.jalali.sec = wall.second
			this.jalali.ms = wall.ms
			this.jalali.isLeapYear = this.checkLeapYear(this.jalali.year)
			this.isConverted = true
		}

		return this.jalali
	}

	/**
	 * Converts a Jalali date (wall clock in the active zone) to a UTC timestamp.
	 * @param jDate - The Jalali date object to convert.
	 * @returns The timestamp in milliseconds.
	 */
	private toGregorian(jDate: JalaliDate): number {
		const wall = this.getWallParts()
		const jalali = {
			year: 1348,
			month: 10,
			day: 11,
			hours: jDate.hours ?? wall.hour,
			min: jDate.min ?? wall.minute,
			sec: jDate.sec ?? wall.second,
			ms: jDate.ms ?? wall.ms,
			isLeapYear: false
		}

		let diffDays = 0

		if (jDate.year > 1348 || (jDate.year === 1348 && jDate.month >= 10) || (jDate.year === 1348 && jDate.month === 10 && jDate.day >= 11))
			for (let i = 0; i < Infinity; i++) {
				if (jalali.year === jDate.year && jalali.month === jDate.month && jalali.day === jDate.day) break

				diffDays++
				jalali.day++

				if (jalali.month < 7 && jalali.day > 31) {
					jalali.month++
					jalali.day = 1
				} else if (jalali.month > 6 && jalali.month < 12 && jalali.day > 30) {
					jalali.month++
					jalali.day = 1
				} else if (jalali.month === 12) {
					const isLeapYear = this.checkLeapYear(jalali.year)

					if (isLeapYear && jalali.day > 30) {
						jalali.year++
						jalali.month = 1
						jalali.day = 1
					} else if (!isLeapYear && jalali.day > 29) {
						jalali.year++
						jalali.month = 1
						jalali.day = 1
					}
				}
			}
		else if (jDate.year < 1348 || (jDate.year === 1348 && jDate.month < 10) || (jDate.year === 1348 && jDate.month === 10 && jDate.day < 11)) {
			for (let i = 0; i < Infinity; i++) {
				if (jalali.year === jDate.year && jalali.month === jDate.month && jalali.day === jDate.day) break

				diffDays--
				jalali.day--

				if (jalali.day < 1)
					if (jalali.month === 1) {
						jalali.year--
						jalali.month = 12

						const isLeapYear = this.checkLeapYear(jalali.year)
						jalali.day = isLeapYear ? 30 : 29
					} else if (jalali.month < 8) {
						jalali.month--
						jalali.day = 31
					} else if (jalali.month < 13) {
						jalali.month--
						jalali.day = 30
					}
			}
		}

		const hours = jDate.hours !== undefined ? jDate.hours : wall.hour
		const min = jDate.min !== undefined ? jDate.min : wall.minute
		const sec = jDate.sec !== undefined ? jDate.sec : wall.second
		const ms = jDate.ms !== undefined ? jDate.ms : wall.ms
		const wallAsUtc = diffDays * this.dateLength + (hours * 3600 + min * 60 + sec) * 1000 + ms
		const civil = new Date(wallAsUtc)

		return this.wallToUtc(
			civil.getUTCFullYear(),
			civil.getUTCMonth() + 1,
			civil.getUTCDate(),
			civil.getUTCHours(),
			civil.getUTCMinutes(),
			civil.getUTCSeconds(),
			civil.getUTCMilliseconds()
		)
	}

	/**
	 * Checks if the given Jalali year is a leap year.
	 * @param year - The Jalali year to check.
	 * @returns True if the year is a leap year, false otherwise.
	 */
	private checkLeapYear(year: number): boolean {
		if (year > 0) {
			const checkYear: number = (year + 2346) * this.leapYearDivision
			return checkYear - parseInt(checkYear.toString()) < this.leapYearDivision
		}

		return false
	}

	/**
	 * Resets the Jalali conversion state and recalculates from the base date.
	 * @returns The recalculated Jalali date.
	 */
	private reset(): JalaliDate {
		this.isConverted = false
		this.jalali.year = 1348
		this.jalali.month = 10
		this.jalali.day = 11

		return this.toJalali()
	}

	/**
	 * Pads a number with leading zero if it's a single digit.
	 * @param number - The number to pad.
	 * @returns The padded string (e.g., "05" for 5).
	 */
	private addZero(number: number): string {
		return `${number > -1 && number < 10 ? '0' : ''}${number}`
	}

	/**
	 * Returns the Persian name of a Jalali month.
	 * @param number - The month number (1-12).
	 * @returns The Persian month name (e.g., "فروردین").
	 */
	private getJalaliMonth(number: number): string {
		return this.monthsNames[number - 1]
	}

	/**
	 * Returns the English name of a Gregorian month.
	 * @param number - The month number (1-12).
	 * @returns The English month name (e.g., "January").
	 */
	private getGregorianMonth(number: number): string {
		return this.monthsGregorianNames[number - 1]
	}

	/**
	 * Gregorian weekday index (0=Sunday … 6=Saturday) for the wall date in the active zone.
	 */
	private getWallWeekday(): number {
		const wall = this.getWallParts()

		return new Date(Date.UTC(wall.year, wall.month - 1, wall.day)).getUTCDay()
	}

	/**
	 * Returns the day of the year (1-366) in Gregorian calendar (wall date in active zone).
	 * @returns The day of the year.
	 */
	private getGregorianDayOfYear(): number {
		const wall = this.getWallParts()
		const start = Date.UTC(wall.year, 0, 0)
		const civil = Date.UTC(wall.year, wall.month - 1, wall.day)

		return Math.round((civil - start) / this.dateLength)
	}

	/**
	 * Returns the ISO week number of the year in Gregorian calendar (wall date in active zone).
	 * @returns The week number (1-53).
	 */
	private getGregorianWeekOfYear(): number {
		const wall = this.getWallParts()
		const d = new Date(Date.UTC(wall.year, wall.month - 1, wall.day))
		d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
		const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))

		return Math.ceil(((d.getTime() - yearStart.getTime()) / this.dateLength + 1) / 7)
	}

	/**
	 * Returns the English name of the day of the week.
	 * @returns The day name (e.g., "Monday").
	 */
	private getGregorianWeekDayName(): string {
		return this.weekDaysGregorianNames[this.getWallWeekday()]
	}

	/**
	 * Returns the first letter of the day of the week in English.
	 * @returns The day letter (e.g., "M" for Monday).
	 */
	private getGregorianWeekDayLetter(): string {
		return this.weekDaysGregorianLetters[this.getWallWeekday()]
	}

	/**
	 * Returns the Persian name of the day of the week.
	 * @returns The Persian day name (e.g., "شنبه").
	 */
	private getWeekDayName(): string {
		return this.weekDaysNames[(this.getDay() + this.firstDayOfWeek) % 7]
	}

	/**
	 * Returns the first letter of the day of the week in Persian.
	 * @returns The Persian day letter (e.g., "ش" for شنبه).
	 */
	private getWeekDayLetter(): string {
		return this.weekDaysLetters[(this.getDay() + this.firstDayOfWeek) % 7]
	}

	/**
	 * Extracts and returns the GMT offset string for the active timezone.
	 * @returns The timezone string (e.g., " GMT+0330").
	 */
	private getUTCTimezone(): string {
		const wall = this.getWallParts()
		const asUtc = Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute, wall.second, wall.ms)
		const offsetMin = Math.round((asUtc - this.getTime()) / 60000)
		const sign = offsetMin >= 0 ? '+' : '-'
		const abs = Math.abs(offsetMin)
		const hh = Math.floor(abs / 60)
		const mm = abs % 60

		return ` GMT${sign}${this.addZero(hh)}${this.addZero(mm)}`
	}

	/**
	 * Adjusts the date by adding the specified number of days (24h steps).
	 * @param date - The number of days to add (can be negative).
	 * @returns The result of setTime.
	 */
	private normalizeDate(date: number): number {
		return super.setTime(this.getTime() + date * this.dateLength)
	}

	/**
	 * Normalizes Jalali date components and sets the internal Date accordingly.
	 * @param jDate - The current Jalali date object.
	 * @param year - The target year.
	 * @param month - The target month (1-12).
	 * @param day - The target day of month.
	 * @returns The result of setTime.
	 */
	private normalizeJalali(jDate: JalaliDate, year: number, month: number, day: number): number {
		// Normalize month
		if (month < 1) {
			const yearDiff = Math.ceil((1 - month) / 12)
			year -= yearDiff
			month = 12 * yearDiff + month
		} else if (month > 12) {
			const yearDiff = Math.floor((month - 1) / 12)
			year += yearDiff
			month = month - 12 * yearDiff
		}

		// Check last day of month
		if (month > 6 && month < 12 && day > 30) day = 30
		else if (month === 12) {
			const isLeapYear = this.checkLeapYear(year)

			if (isLeapYear && day > 30) day = 30
			else if (!isLeapYear && day > 29) day = 29
		}

		return super.setTime(this.toGregorian({ ...jDate, ...{ year, month, day } }))
	}

	/**
	 * Normalizes timezone string to a standard format.
	 * Aliases: `default` / `local` / `system` -> host IANA; `utc` / `gmt` -> `UTC`.
	 * Otherwise validates with Intl and returns canonical IANA casing when available.
	 * @param timezone - The timezone string (e.g., "UTC", "local", "Asia/Tehran").
	 * @returns The normalized timezone string.
	 */
	private normalizeTimezone(timezone: string | undefined): string {
		if (timezone === undefined || timezone === null) return this.timezone

		const lowered = timezone.toLowerCase()

		if (lowered === 'default' || lowered === 'local' || lowered === 'system') return JalaliX.hostTimezone()
		if (lowered === 'utc' || lowered === 'gmt') return 'UTC'

		try {
			const resolved = new Intl.DateTimeFormat('en-US', { timeZone: timezone }).resolvedOptions().timeZone

			return resolved || timezone
		} catch {
			throw new Error(`Invalid IANA timezone: ${timezone}`)
		}
	}

	/**
	 * Returns a string representation of a date in Jalali format.
	 * @returns Full date string with weekday, day, month, year, and time.
	 */
	public toString(): string {
		const jDate = this.toJalali()

		return `${this.getWeekDayName()} ${this.addZero(jDate.day)} ${this.getJalaliMonth(jDate.month)} ${this.addZero(jDate.year)} ${jDate.hours}:${this.addZero(
			jDate.min
		)}:${this.addZero(jDate.sec)}${this.getUTCTimezone()}`
	}

	/**
	 * Returns a date as a string value (without time).
	 * @returns Date string with weekday, day, month, and year.
	 */
	public toDateString(): string {
		const jDate = this.toJalali()

		return `${this.getWeekDayName()} ${this.addZero(jDate.day)} ${this.getJalaliMonth(jDate.month)} ${this.addZero(jDate.year)}`
	}

	/**
	 * Returns a date as a string value in locale format (YYYY/MM/DD).
	 * @returns Locale-formatted date string.
	 */
	public toLocaleDateString(): string {
		const jDate = this.toJalali()

		return `${this.addZero(jDate.year)}/${this.addZero(jDate.month)}/${this.addZero(jDate.day)}`
	}

	/**
	 * Returns a time as a string value with meridiem.
	 * @returns Time string (e.g., "10:30:45 ق.ظ.").
	 */
	public toLocaleTimeString(): string {
		const jDate = this.toJalali()

		return `${jDate.hours % 12}:${this.addZero(jDate.min)}:${this.addZero(jDate.sec)} ${this.getMeridiem()}`
	}

	/**
	 * Gets the Jalali year.
	 * @returns The year (e.g., 1403).
	 */
	public getFullYear(): number {
		const jDate = this.toJalali()

		return jDate.year
	}

	/**
	 * Gets the Jalali month (1-12).
	 * @returns The month number.
	 */
	public getMonth(): number {
		const jDate = this.toJalali()

		return jDate.month
	}

	/**
	 * Gets the day of the month in Jalali calendar (1-31).
	 * @returns The day of the month.
	 */
	public getDate(): number {
		const jDate = this.toJalali()

		return jDate.day
	}

	/**
	 * Gets the day of the week (1=Saturday, 7=Friday in Jalali) for the wall date in the active zone.
	 * @returns The day number (1-7).
	 */
	public getDay(): number {
		return (this.getWallWeekday() - this.firstDayOfWeek + 7 + 1) % 7
	}

	// Gets the hours value (wall time in the active timezone).
	public getHours(): number {
		return this.getWallParts().hour
	}

	// Gets the minutes value (wall time in the active timezone).
	public getMinutes(): number {
		return this.getWallParts().minute
	}

	// Gets the seconds value (wall time in the active timezone).
	public getSeconds(): number {
		return this.getWallParts().second
	}

	// Gets the milliseconds value (same for all zones; kept for API symmetry).
	public getMilliseconds(): number {
		return ((this.getTime() % 1000) + 1000) % 1000
	}

	/**
	 * Sets the date and time value in the Date object.
	 * @param time A numeric value representing the number of elapsed milliseconds since midnight, January 1, 1970 GMT.
	 */
	public setTime(time: number): number {
		super.setTime(time)

		// Reset
		this.reset()

		return this.getTime()
	}

	/**
	 * Sets the milliseconds value using wall time in the active timezone.
	 * @param ms A numeric value equal to the millisecond value.
	 */
	public setMilliseconds(ms: number): number {
		const wall = this.getWallParts()
		super.setTime(this.wallToUtc(wall.year, wall.month, wall.day, wall.hour, wall.minute, wall.second, ms))
		this.reset()

		return this.getTime()
	}

	/**
	 * Sets the seconds value using wall time in the active timezone.
	 * @param sec A numeric value equal to the seconds value.
	 * @param ms A numeric value equal to the milliseconds value.
	 */
	public setSeconds(sec: number, ms?: number): number {
		const wall = this.getWallParts()
		super.setTime(this.wallToUtc(wall.year, wall.month, wall.day, wall.hour, wall.minute, sec, ms !== undefined ? ms : wall.ms))
		this.reset()

		return this.getTime()
	}

	/**
	 * Sets the minutes value using wall time in the active timezone.
	 * @param min A numeric value equal to the minutes value.
	 * @param sec A numeric value equal to the seconds value.
	 * @param ms A numeric value equal to the milliseconds value.
	 */
	public setMinutes(min: number, sec?: number, ms?: number): number {
		const wall = this.getWallParts()
		super.setTime(this.wallToUtc(wall.year, wall.month, wall.day, wall.hour, min, sec !== undefined ? sec : wall.second, ms !== undefined ? ms : wall.ms))
		this.reset()

		return this.getTime()
	}

	/**
	 * Sets the hour value using wall time in the active timezone.
	 * @param hours A numeric value equal to the hours value.
	 * @param min A numeric value equal to the minutes value.
	 * @param sec A numeric value equal to the seconds value.
	 * @param ms A numeric value equal to the milliseconds value.
	 */
	public setHours(hours: number, min?: number, sec?: number, ms?: number): number {
		const wall = this.getWallParts()
		super.setTime(
			this.wallToUtc(wall.year, wall.month, wall.day, hours, min !== undefined ? min : wall.minute, sec !== undefined ? sec : wall.second, ms !== undefined ? ms : wall.ms)
		)
		this.reset()

		return this.getTime()
	}

	/**
	 * Sets the numeric day-of-the-month value of the Date object using local time.
	 * @param date A numeric value equal to the day of the month.
	 */
	public setDate(date: number): number {
		const jDate = this.toJalali()

		// Normalize date
		this.normalizeDate(date - jDate.day)

		return this.getTime()
	}

	/**
	 * Sets the month value in the Date object using local time.
	 * @param month A numeric value equal to the month. The value for Farvardin is 0, and other month values follow consecutively.
	 * @param date A numeric value representing the day of the month. If this value is not supplied, the value from a call to the getDate method is used.
	 */
	public setMonth(month: number, date?: number): number {
		let jDate = this.toJalali()

		// Normalize Jalali
		this.normalizeJalali(jDate, jDate.year, month + 1, jDate.day)

		// Reset
		this.reset()

		// Normalize date
		if (date !== undefined) {
			jDate = this.toJalali()
			this.normalizeDate(date - jDate.day)

			// Reset
			this.reset()
		}

		return this.getTime()
	}

	/**
	 * Sets the year of the Date object using local time.
	 * @param year A numeric value for the year.
	 * @param month A zero-based numeric value for the month (0 for Farvardin, 11 for Esfand). Must be specified if numDate is specified.
	 * @param date A numeric value equal for the day of the month.
	 */
	public setFullYear(year: number, month?: number, date?: number): number {
		let jDate = this.toJalali()

		// Normalize Jalali (month may be 0 = Farvardin - do not use truthiness)
		this.normalizeJalali(jDate, year, month !== undefined ? month + 1 : jDate.month, jDate.day)

		// Reset
		this.reset()

		// Normalize date
		if (date !== undefined) {
			jDate = this.toJalali()
			this.normalizeDate(date - jDate.day)

			// Reset
			this.reset()
		}

		return this.getTime()
	}

	/**
	 * Creates a JalaliX instance from a Gregorian date value.
	 * @param date - The date value (timestamp, ISO string, or Date object).
	 * @param options - Optional configuration including timezone.
	 * @returns A new JalaliX instance.
	 */
	public static create(date: number | string | Date, options?: JalaliOptions): JalaliX {
		let output = new JalaliX(date)

		// Check Timezone
		if (options?.timezone) output = output.setTimezone(options.timezone)

		return output
	}

	/**
	 * Parses a Jalali date string into a JalaliX instance.
	 * Accepts `YYYY/MM/DD` or `YYYY-MM-DD`, optional time (`HH:mm` / `HH:mm:ss`), and Persian digits.
	 * Named `parseJalali` because `Date.parse` already exists on the base class.
	 * @param value - Jalali date string (e.g. "1403/12/07", "۱۴۰۳-۱۲-۰۷ 14:30").
	 * @param options - Optional configuration including timezone.
	 * @returns A new JalaliX instance.
	 */
	public static parseJalali(value: string, options?: JalaliOptions): JalaliX {
		const normalized = JalaliX.fromPersian(String(value)).trim()
		const match = normalized.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/)

		if (!match) throw new Error(`JalaliX.parseJalali: invalid Jalali date "${value}"`)

		const year = Number(match[1])
		const month = Number(match[2])
		const day = Number(match[3])
		const hours = Number(match[4] ?? 0)
		const minutes = Number(match[5] ?? 0)
		const seconds = Number(match[6] ?? 0)

		if (month < 1 || month > 12 || day < 1 || day > 31) throw new Error(`JalaliX.parseJalali: invalid Jalali date "${value}"`)

		const output = JalaliX.create(new Date(), options)
		output.setFullYear(year, month - 1, day)
		output.setHours(hours, minutes, seconds, 0)

		return output
	}

	/**
	 * Soft-normalizes loose query / form date inputs into a Gregorian `YYYY-MM-DD HH:mm:ss` string.
	 *
	 * Handles empty/sentinel values (`null`, `undefined`, `Invalid Date`, `NaN`), unix timestamps
	 * (seconds or milliseconds), Persian/Arabic digits, `/` `-` `.` separators, fractional seconds,
	 * optional `Z` / offset suffixes, and auto-detects Jalali vs Gregorian by year band:
	 * years in `jalaliYearMin…jalaliYearMax` (default `1…1899`) are treated as Jalali when the
	 * civil date is valid; otherwise Gregorian.
	 *
	 * Invalid or unrecognized values are returned cleaned (digits normalized) rather than throwing;
	 * sentinels and non-positive timestamps return `null`. Non-string / non-number values pass through.
	 * @param value - Raw query value (string, number, or anything else).
	 * @param options - Optional `{ timezone, jalaliYearMin, jalaliYearMax }`.
	 * @returns `null`, Gregorian `YYYY-MM-DD HH:mm:ss`, a digit-cleaned string, or the original value.
	 */
	public static normalizeQueryDate(value: unknown, options?: JalaliNormalizeOptions): unknown {
		const isInvalidDate = (typeof value === 'string' && (value.toLowerCase() === 'invalid date' || /nan/i.test(value))) || (typeof value === 'number' && Number.isNaN(value))

		if (value === null || value === undefined || value === 'null' || value === '' || value === 'undefined' || isInvalidDate) return null

		if (typeof value === 'number') return JalaliX.normalizeQueryTimestamp(value, options)

		if (typeof value === 'string') {
			const trimmed = value.trim()

			if (trimmed !== '' && /^[+-]?\d+(\.\d+)?$/.test(trimmed)) return JalaliX.normalizeQueryTimestamp(Number(trimmed), options)
		}

		if (typeof value !== 'string') return value

		const digits = JalaliX.fromPersian(value).replace(/(\d{2}:\d{2}:\d{2})\.\d+/, '$1')
		const match = digits.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?(?:Z|[+-]\d{2}:?\d{2})?)?/)

		if (!match) return digits

		const year = Number(match[1])
		const month = Number(match[2])
		const day = Number(match[3])
		const hour = Number(match[4] ?? 0)
		const minute = Number(match[5] ?? 0)
		const second = Number(match[6] ?? 0)

		const jalaliYearMin = options?.jalaliYearMin ?? 1
		const jalaliYearMax = options?.jalaliYearMax ?? 1899
		const pad2 = (n: number): string => String(n).padStart(2, '0')

		if (year >= jalaliYearMin && year <= jalaliYearMax && JalaliX.isValidJalaliCivilDate(year, month, day))
			try {
				const jalali = `${String(year).padStart(4, '0')}/${pad2(month)}/${pad2(day)} ${pad2(hour)}:${pad2(minute)}:${pad2(second)}`

				return JalaliX.parseJalali(jalali, options).format('YYYY-MM-DD HH:mm:ss', { calendar: 'gregorian' })
			} catch {
				// fall through to Gregorian / cleaned
			}

		if (JalaliX.isValidGregorianDate(year, month, day)) return `${String(year).padStart(4, '0')}-${pad2(month)}-${pad2(day)} ${pad2(hour)}:${pad2(minute)}:${pad2(second)}`

		return digits
	}

	/**
	 * Converts an int/float/numeric-string unix timestamp (seconds or ms) to a formatted Gregorian string.
	 * @param timestamp - Unix timestamp; values `> 9999999999` are treated as milliseconds.
	 * @param options - Optional `{ timezone }`.
	 * @returns Gregorian `YYYY-MM-DD HH:mm:ss`, or `null` for non-positive timestamps.
	 */
	private static normalizeQueryTimestamp(timestamp: number, options?: JalaliOptions): string | null {
		let ts = timestamp

		if (ts > 9999999999) ts = Math.floor(ts / 1000)
		if (ts <= 0) return null

		return JalaliX.create(ts * 1000, options).format('YYYY-MM-DD HH:mm:ss', { calendar: 'gregorian' })
	}

	// Whether `year/month/day` is a valid Jalali civil date (year >= 1).
	private static isValidJalaliCivilDate(year: number, month: number, day: number): boolean {
		if (year < 1 || month < 1 || month > 12 || day < 1) return false
		if (month <= 6) return day <= 31
		if (month <= 11) return day <= 30

		const checkYear = (year + 2346) * 0.24219858156
		const isLeap = checkYear - Math.trunc(checkYear) < 0.24219858156

		return day <= (isLeap ? 30 : 29)
	}

	// Whether `year/month/day` is a valid Gregorian civil date.
	private static isValidGregorianDate(year: number, month: number, day: number): boolean {
		if (month < 1 || month > 12 || day < 1) return false

		const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
		const daysInMonth = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

		return day <= daysInMonth[month - 1]
	}

	/**
	 * Checks if the given value is a valid Date.
	 * @param date - The value to check.
	 * @returns True if valid Date, false otherwise.
	 */
	public static isValidDate(date: unknown): boolean {
		return date instanceof Date && !isNaN(Number(date))
	}

	/**
	 * Converts Western numerals (0-9) to Persian numerals (۰-۹) in a string.
	 * @param str - The string containing numerals to convert.
	 * @returns The string with Persian numerals.
	 */
	public static toPersian(str: string): string {
		for (let i = 0; i <= 9; i++) str = str.replace(new RegExp(`${i}`, 'g'), this.persianNumbers[i])

		return str
	}

	/**
	 * Converts Persian (۰-۹) and Arabic-Indic (٠-٩) numerals to Western numerals (0-9) in a string.
	 * @param str - The string containing Persian or Arabic-Indic numerals.
	 * @returns The string with Western numerals.
	 */
	public static fromPersian(str: string): string {
		let output = str

		for (let i = 0; i <= 9; i++) {
			output = output.replace(new RegExp(this.persianNumbers[i], 'g'), String(i))
			output = output.replace(new RegExp(this.arabicNumbers[i], 'g'), String(i))
		}

		return output
	}

	/**
	 * Compares two JalaliX dates.
	 * @param date - The first date to compare.
	 * @param comparing - The second date to compare against.
	 * @returns True if date is before comparing, false otherwise.
	 */
	public static compare(date: JalaliX, comparing: JalaliX): boolean {
		return date.getTime() < comparing.getTime()
	}

	/**
	 * Creates a copy of this JalaliX instance (same instant and timezone).
	 * @returns A new JalaliX instance with the same timestamp and zone.
	 */
	public clone(): JalaliX {
		const output = new JalaliX(this.valueOf())
		output.timezone = this.timezone

		return output
	}

	/**
	 * Gets the active IANA timezone of this instance.
	 * @returns The IANA timezone string (e.g., "Asia/Tehran").
	 */
	public getTimezone(): string {
		return this.timezone
	}

	/**
	 * Gets the week number of the year in Jalali calendar.
	 * @returns The week number (1-53).
	 */
	public getWeekOfYear(): number {
		const dayOfYear = this.getDayOfYear()
		const dayOfWeek = new JalaliX(this.valueOf()).getStartOfYear().getDayISO()

		return Math.ceil((dayOfYear + dayOfWeek - 1) / 7)
	}

	/**
	 * Gets the day of the year in Jalali calendar (1-366).
	 * @returns The day of the year.
	 */
	public getDayOfYear(): number {
		const jDate = this.toJalali()
		let output = jDate.day

		if (jDate.month < 7) output += (jDate.month - 1) * 31
		else if (jDate.month < 12) output += 186 + (jDate.month - 7) * 30
		else output += 336

		return output
	}

	/**
	 * Gets the ISO day of the week (1=Monday, 7=Sunday).
	 * @returns The ISO day number (1-7).
	 */
	public getDayISO(): number {
		return ((this.getDay() + 6) % 7) + 1
	}

	/**
	 * Gets the hour in 12-hour format (1-12).
	 * @returns The hour in 12-hour format.
	 */
	public getHoursISO(): number {
		const hours = this.getHours()

		return hours > 12 ? hours - 12 : hours
	}

	/**
	 * Gets the meridiem (AM/PM) in Persian.
	 * @returns "ق.ظ." (before noon) or "ب.ظ." (after noon).
	 */
	public getMeridiem(): string {
		const jDate = this.toJalali()

		return jDate.hours > 12 ? this.pm : this.am
	}

	/**
	 * Returns AM or PM based on the hour in 12-hour format.
	 * @returns "AM" or "PM".
	 */
	private getGregorianMeridiem(): string {
		const hours = this.getHours()

		return hours >= 12 ? this.pmGregorian : this.amGregorian
	}

	/**
	 * Returns a new JalaliX set to the start of the Jalali year.
	 * @returns This instance modified to the first moment of the year.
	 */
	public getStartOfYear(): JalaliX {
		return this.addDays(-1 * this.getDayOfYear() + 1).getStartOfDay()
	}

	/**
	 * Returns a new JalaliX set to the start of the current month.
	 * @returns This instance modified to the first moment of the month.
	 */
	public getStartOfMonth(): JalaliX {
		return this.addDays(-1 * this.getDate() + 1).getStartOfDay()
	}

	/**
	 * Returns a new JalaliX set to the start of the current week (Monday).
	 * @returns This instance modified to the first moment of the week.
	 */
	public getStartOfWeek(): JalaliX {
		return this.addDays(-1 * this.getDayISO() + 1).getStartOfDay()
	}

	/**
	 * Returns a new JalaliX set to the start of the current day (00:00:00.000).
	 * @returns This instance modified to midnight.
	 */
	public getStartOfDay(): JalaliX {
		this.setHours(0, 0, 0, 0)

		return this
	}

	/**
	 * Returns a new JalaliX set to the end of the Jalali year (23:59:59.999).
	 * @returns This instance modified to the last moment of the year.
	 */
	public getEndOfYear(): JalaliX {
		const jDate = this.toJalali()

		// Find last day
		const lastDay = jDate.isLeapYear ? 366 : 365

		return this.addDays(lastDay - this.getDayOfYear()).getEndOfDay()
	}

	/**
	 * Returns a new JalaliX set to the end of the current month.
	 * @returns This instance modified to the last moment of the month.
	 */
	public getEndOfMonth(): JalaliX {
		const jDate = this.toJalali()

		// Find last day
		let lastDay = 31

		if (jDate.month > 6 && jDate.month < 12) lastDay = 30
		else if (jDate.month === 12) {
			if (jDate.isLeapYear) lastDay = 30
			else lastDay = 29
		}

		return this.addDays(lastDay - this.getDate()).getEndOfDay()
	}

	/**
	 * Returns a new JalaliX set to the end of the current week (Sunday).
	 * @returns This instance modified to the last moment of the week.
	 */
	public getEndOfWeek(): JalaliX {
		return this.addDays(7 - this.getDayISO()).getEndOfDay()
	}

	/**
	 * Returns a new JalaliX set to the end of the current day (23:59:59.999).
	 * @returns This instance modified to the last moment of the day.
	 */
	public getEndOfDay(): JalaliX {
		this.setHours(23, 59, 59, 999)

		return this
	}

	/**
	 * Creates a new JalaliX instance with the specified timezone.
	 * Instant-preserving: `getTime()` stays the same; only the zone id (and wall/Jalali display) changes.
	 * @param timezone - The timezone string (e.g., "UTC", "Asia/Tehran").
	 * @returns A new JalaliX instance in the specified timezone.
	 */
	public setTimezone(timezone: string | undefined): JalaliX {
		const output = new JalaliX(this.getTime())
		output.timezone = this.normalizeTimezone(timezone)

		return output
	}

	/**
	 * Adds the specified number of years to the date.
	 * @param year - The number of years to add (can be negative).
	 * @returns This instance modified.
	 */
	public addYears(year: number): JalaliX {
		let jDate = this.toJalali()

		// Normalize Jalali
		this.normalizeJalali(jDate, jDate.year + year, jDate.month, jDate.day)

		// Reset
		this.reset()

		return this
	}

	/**
	 * Adds the specified number of months to the date.
	 * @param month - The number of months to add (can be negative).
	 * @returns This instance modified.
	 */
	public addMonths(month: number): JalaliX {
		let jDate = this.toJalali()

		// Normalize Jalali
		this.normalizeJalali(jDate, jDate.year, jDate.month + month, jDate.day)

		// Reset
		this.reset()

		return this
	}

	/**
	 * Adds the specified number of weeks to the date.
	 * @param date - The number of weeks to add (can be negative).
	 * @returns This instance modified.
	 */
	public addWeeks(date: number): JalaliX {
		// Normalize date
		this.normalizeDate(date * 7)

		// Reset
		this.reset()

		return this
	}

	/**
	 * Adds the specified number of days to the date.
	 * @param date - The number of days to add (can be negative).
	 * @returns This instance modified.
	 */
	public addDays(date: number): JalaliX {
		// Normalize date
		this.normalizeDate(date)

		// Reset
		this.reset()

		return this
	}

	/**
	 * Returns a calendar date string using wall getters in the active timezone (no UTC shift from `toISOString()`).
	 * @param calendar - `"gregorian"` (default) -> `YYYY-MM-DD` Gregorian; `"jalali"` -> Jalali `YYYY-MM-DD`.
	 */
	public toISODate(calendar: 'jalali' | 'gregorian' = 'gregorian'): string {
		if (calendar === 'jalali') return this.format('YYYY-MM-DD')

		const wall = this.getWallParts()

		return `${wall.year}-${this.addZero(wall.month)}-${this.addZero(wall.day)}`
	}

	/**
	 * Formats the date according to the specified format string.
	 * Prefer `format(str, { calendar, persianDigits })`. Positional booleans remain supported:
	 * `format(str, persianDigits?, gregorian?)`.
	 * @param str - The format string (e.g., "YYYY/MM/DD", "DD MMM YYYY").
	 * @param persianOrOptions - Persian digits flag, or options object.
	 * @param gregorian - If true, uses Gregorian calendar (positional API only).
	 * @returns The formatted date string.
	 */
	public format(str: string, persianOrOptions?: boolean | JalaliFormatOptions, gregorian?: boolean): string {
		let persian = false
		let useGregorian = false

		if (typeof persianOrOptions === 'object' && persianOrOptions !== null) {
			persian = Boolean(persianOrOptions.persianDigits)
			useGregorian = persianOrOptions.calendar === 'gregorian'
		} else {
			persian = Boolean(persianOrOptions)
			useGregorian = Boolean(gregorian)
		}

		// Initialize placeholders
		const placeholders: string[] = []

		// Add placeholder
		const ph = (val: string): string => {
			const i = placeholders.length
			placeholders.push(val)

			return `\uE000${i}\uE001`
		}

		// Initialize output
		let output = str

		const wall = this.getWallParts()
		const year = useGregorian ? wall.year : this.getFullYear()
		const month = useGregorian ? wall.month : this.getMonth()
		const weekOfYear = useGregorian ? this.getGregorianWeekOfYear() : this.getWeekOfYear()
		const dayOfYear = useGregorian ? this.getGregorianDayOfYear() : this.getDayOfYear()
		const date = useGregorian ? wall.day : this.getDate()
		const monthName = useGregorian ? this.getGregorianMonth(month) : this.getJalaliMonth(month)
		const weekDayName = useGregorian ? this.getGregorianWeekDayName() : this.getWeekDayName()
		const weekDayLetter = useGregorian ? this.getGregorianWeekDayLetter() : this.getWeekDayLetter()
		const meridiem = useGregorian ? this.getGregorianMeridiem() : this.getMeridiem()
		const yearStr = year.toString()

		// Year
		if (output.match(/YYYY/)) output = output.replace(/YYYY/g, () => ph(yearStr))
		if (output.match(/YYY/)) output = output.replace(/YYY/g, () => ph(yearStr.slice(-3)))
		if (output.match(/YY/)) output = output.replace(/YY/g, () => ph(yearStr.slice(-2)))
		if (output.match(/Y/)) output = output.replace(/Y/g, () => ph(yearStr.slice(-1)))

		// Month
		if (output.match(/MMM/)) output = output.replace(/MMM/g, () => ph(monthName))
		if (output.match(/MM/)) output = output.replace(/MM/g, () => ph(this.addZero(month)))
		if (output.match(/M/)) output = output.replace(/M/g, () => ph(month.toString()))

		// Week
		if (output.match(/W/)) output = output.replace(/W/g, () => ph(this.addZero(weekOfYear)))
		if (output.match(/w/)) output = output.replace(/w/g, () => ph(weekOfYear.toString()))

		// Day of Week
		if (output.match(/DW/)) output = output.replace(/DW/g, () => ph(this.getDayISO().toString()))
		if (output.match(/dw/)) output = output.replace(/dw/g, () => ph((useGregorian ? this.getWallWeekday() || 7 : this.getDay()).toString()))
		if (output.match(/WN/)) output = output.replace(/WN/g, () => ph(weekDayName))
		if (output.match(/wn/)) output = output.replace(/wn/g, () => ph(weekDayName))
		if (output.match(/WL/)) output = output.replace(/WL/g, () => ph(weekDayLetter))
		if (output.match(/wl/)) output = output.replace(/wl/g, () => ph(weekDayLetter))

		// Day of Year
		if (output.match(/DDDD/)) output = output.replace(/DDDD/g, () => ph(this.addZero(dayOfYear)))
		if (output.match(/DDD/)) output = output.replace(/DDD/g, () => ph(dayOfYear.toString()))

		// Day
		if (output.match(/DD/)) output = output.replace(/DD/g, () => ph(this.addZero(date)))
		if (output.match(/D/)) output = output.replace(/D/g, () => ph(date.toString()))

		// Hours (wall time in active timezone)
		const hours = this.getHours()
		if (output.match(/HH/)) output = output.replace(/HH/g, () => ph(this.addZero(hours)))
		if (output.match(/H/)) output = output.replace(/H/g, () => ph(hours.toString()))

		// Hours ISO
		const hoursISO = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
		if (output.match(/hh/)) output = output.replace(/hh/g, () => ph(this.addZero(hoursISO)))
		if (output.match(/h/)) output = output.replace(/h/g, () => ph(hoursISO.toString()))

		// Minutes
		if (output.match(/mm/)) output = output.replace(/mm/g, () => ph(this.addZero(this.getMinutes())))
		if (output.match(/m/)) output = output.replace(/m/g, () => ph(this.getMinutes().toString()))

		// Seconds
		if (output.match(/ss/)) output = output.replace(/ss/g, () => ph(this.addZero(this.getSeconds())))
		if (output.match(/s/)) output = output.replace(/s/g, () => ph(this.getSeconds().toString()))

		// Milliseconds
		if (output.match(/sss/)) output = output.replace(/sss/g, () => ph(this.getMilliseconds().toString()))
		if (output.match(/SSS/)) output = output.replace(/SSS/g, () => ph(this.getMilliseconds().toString()))

		// Meridiem
		if (output.match(/A/)) output = output.replace(/A/g, () => ph(meridiem))
		if (output.match(/a/)) output = output.replace(/a/g, () => ph(meridiem))

		// Unix Timestamp
		if (output.match(/X/)) output = output.replace(/X/g, () => ph(Math.floor(this.getTime() / 1000).toString()))
		if (output.match(/x/)) output = output.replace(/x/g, () => ph(this.getTime().toString()))

		// Replace placeholders with actual values
		placeholders.forEach((val, i) => {
			output = output.replace(new RegExp(`\uE000${i}\uE001`, 'g'), () => val)
		})

		return persian ? JalaliX.toPersian(output) : output
	}
}

export default JalaliX

// CJS / Node ESM interop: `import JalaliX from '@jalalix/typescript'` resolves to the class
module.exports = JalaliX
module.exports.default = JalaliX
module.exports.__esModule = true
