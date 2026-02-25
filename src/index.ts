// Types
import type { JalaliDate, JalaliOptions } from './index.types'

class JalaliX extends Date {
	private jalali: JalaliDate = {
		year: 1348,
		month: 10,
		day: 11,
		hours: this.getHours(),
		min: this.getMinutes(),
		sec: this.getSeconds(),
		ms: this.getMilliseconds(),
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
	private am = 'ق.ظ.'
	private pm = 'ب.ظ.'
	private amGregorian = 'AM'
	private pmGregorian = 'PM'

	/**
	 * Converts the current Date to Jalali (Persian) calendar date.
	 * @returns The Jalali date object with year, month, day, hours, minutes, seconds, milliseconds, and isLeapYear.
	 */
	private toJalali(): JalaliDate {
		if (!this.isConverted) {
			// Midnight, January 1, 1970 GMT.
			const baseDate = new Date('1970-01-01')
			const diffDate = this.valueOf() - baseDate.valueOf()
			const diffDays = Math.floor(diffDate / this.dateLength)

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

			this.jalali.isLeapYear = this.checkLeapYear(this.jalali.year)
			this.isConverted = true
		}

		return this.jalali
	}

	/**
	 * Converts a Jalali date to Gregorian timestamp.
	 * @param jDate - The Jalali date object to convert.
	 * @returns The timestamp in milliseconds.
	 */
	private toGregorian(jDate: JalaliDate): number {
		const jalali = {
			year: 1348,
			month: 10,
			day: 11,
			hours: this.getHours(),
			min: this.getMinutes(),
			sec: this.getSeconds(),
			ms: this.getMilliseconds(),
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

		const outputTime =
			diffDays * this.dateLength + (super.getHours() * 3600 + (super.getMinutes() + super.getTimezoneOffset()) * 60 + super.getSeconds()) * 1000 + super.getMilliseconds()

		return outputTime
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
	 * Returns the day of the year (1-366) in Gregorian calendar.
	 * @returns The day of the year.
	 */
	private getGregorianDayOfYear(): number {
		const start = new Date(super.getFullYear(), 0, 0).getTime()

		return Math.ceil((this.getTime() - start) / this.dateLength)
	}

	/**
	 * Returns the ISO week number of the year in Gregorian calendar.
	 * @returns The week number (1-53).
	 */
	private getGregorianWeekOfYear(): number {
		const d = new Date(Date.UTC(super.getFullYear(), super.getMonth(), super.getDate()))
		d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
		const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))

		return Math.ceil(((d.getTime() - yearStart.getTime()) / this.dateLength + 1) / 7)
	}

	/**
	 * Returns the English name of the day of the week.
	 * @returns The day name (e.g., "Monday").
	 */
	private getGregorianWeekDayName(): string {
		return this.weekDaysGregorianNames[super.getDay()]
	}

	/**
	 * Returns the first letter of the day of the week in English.
	 * @returns The day letter (e.g., "M" for Monday).
	 */
	private getGregorianWeekDayLetter(): string {
		return this.weekDaysGregorianLetters[super.getDay()]
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
	 * Extracts and returns the UTC timezone string from the Date.
	 * @returns The timezone string (e.g., " GMT+0330").
	 */
	private getUTCTimezone(): string {
		const dateString = super.toString()
		const timezoneMatch = dateString.match(/ GMT([0-9a-zA-Z\+\-\(\) ]+)/)

		return `${timezoneMatch && timezoneMatch.length > 1 ? ` GMT${timezoneMatch[1]}` : ''}`
	}

	/**
	 * Adjusts the date by adding the specified number of days.
	 * @param date - The number of days to add (can be negative).
	 * @returns The result of setDate.
	 */
	private normalizeDate(date: number): number {
		return super.setDate(super.getDate() + date)
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
	 * @param timezone - The timezone string (e.g., "UTC", "local", "Asia/Tehran").
	 * @returns The normalized timezone string.
	 */
	private normalizeTimezone(timezone: string | undefined): string {
		if (timezone === undefined || timezone === null) return this.getTimezone()
		else {
			const lowered = timezone.toLowerCase()

			if (lowered === 'default') return this.getTimezone()
			else if (lowered === 'local' || lowered === 'system') return this.getTimezone()
			else if (lowered === 'utc' || lowered === 'gmt') return 'UTC'
			else return lowered
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
	 * Gets the day of the week (1=Saturday, 7=Friday in Jalali).
	 * @returns The day number (1-7).
	 */
	public getDay(): number {
		return (super.getDay() - this.firstDayOfWeek + 7 + 1) % 7
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
	 * Sets the milliseconds value in the Date object using local time.
	 * @param ms A numeric value equal to the millisecond value.
	 */
	public setMilliseconds(ms: number): number {
		super.setMilliseconds(ms)
		this.jalali.ms = ms

		return this.getTime()
	}

	/**
	 * Sets the seconds value in the Date object using local time.
	 * @param sec A numeric value equal to the seconds value.
	 * @param ms A numeric value equal to the milliseconds value.
	 */
	public setSeconds(sec: number, ms?: number): number {
		super.setSeconds(sec, ms)
		this.jalali.sec = sec

		if (ms) this.jalali.ms = ms

		return this.getTime()
	}

	/**
	 * Sets the minutes value in the Date object using local time.
	 * @param min A numeric value equal to the minutes value.
	 * @param sec A numeric value equal to the seconds value.
	 * @param ms A numeric value equal to the milliseconds value.
	 */
	public setMinutes(min: number, sec?: number, ms?: number): number {
		super.setMinutes(min, sec, ms)
		this.jalali.min = min

		if (sec) this.jalali.sec = sec
		if (ms) this.jalali.ms = ms

		return this.getTime()
	}

	/**
	 * Sets the hour value in the Date object using local time.
	 * @param hours A numeric value equal to the hours value.
	 * @param min A numeric value equal to the minutes value.
	 * @param sec A numeric value equal to the seconds value.
	 * @param ms A numeric value equal to the milliseconds value.
	 */
	public setHours(hours: number, min?: number, sec?: number, ms?: number): number {
		super.setHours(hours, min, sec, ms)
		this.jalali.hours = hours

		if (min) this.jalali.min = min
		if (sec) this.jalali.sec = sec
		if (ms) this.jalali.ms = ms

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
		if (date) {
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

		// Normalize Jalali
		this.normalizeJalali(jDate, year, month ? month + 1 : jDate.month, jDate.day)

		// Reset
		this.reset()

		// Normalize date
		if (date) {
			jDate = this.toJalali()
			this.normalizeDate(date - jDate.day)

			// Reset
			this.reset()
		}

		return this.getTime()
	}

	/**
	 * Creates a JalaliX instance from a date value.
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
	 * Compares two JalaliX dates.
	 * @param date - The first date to compare.
	 * @param comparing - The second date to compare against.
	 * @returns True if date is before comparing, false otherwise.
	 */
	public static compare(date: JalaliX, comparing: JalaliX): boolean {
		return date.getTime() < comparing.getTime()
	}

	/**
	 * Creates a copy of this JalaliX instance.
	 * @returns A new JalaliX instance with the same timestamp.
	 */
	public clone(): JalaliX {
		return new JalaliX(this.valueOf())
	}

	/**
	 * Gets the timezone of the system.
	 * @returns The IANA timezone string (e.g., "Asia/Tehran").
	 */
	public getTimezone(): string {
		return Intl.DateTimeFormat().resolvedOptions().timeZone
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
		const hours = super.getHours()

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
	 * @param timezone - The timezone string (e.g., "UTC", "Asia/Tehran").
	 * @returns A new JalaliX instance in the specified timezone.
	 */
	public setTimezone(timezone: string | undefined): JalaliX {
		return new JalaliX(this.toLocaleString(navigator.language ?? 'en', { timeZone: this.normalizeTimezone(timezone) }))
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
	 * Formats the date according to the specified format string.
	 * @param str - The format string (e.g., "YYYY/MM/DD", "DD MMM YYYY").
	 * @param gregorian - If true, uses Gregorian calendar; otherwise uses Jalali.
	 * @returns The formatted date string.
	 */
	public format(str: string, gregorian?: boolean): string {
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

		const year = gregorian ? super.getFullYear() : this.getFullYear()
		const month = gregorian ? super.getMonth() + 1 : this.getMonth()
		const weekOfYear = gregorian ? this.getGregorianWeekOfYear() : this.getWeekOfYear()
		const dayOfYear = gregorian ? this.getGregorianDayOfYear() : this.getDayOfYear()
		const date = gregorian ? super.getDate() : this.getDate()
		const monthName = gregorian ? this.getGregorianMonth(month) : this.getJalaliMonth(month)
		const weekDayName = gregorian ? this.getGregorianWeekDayName() : this.getWeekDayName()
		const weekDayLetter = gregorian ? this.getGregorianWeekDayLetter() : this.getWeekDayLetter()
		const meridiem = gregorian ? this.getGregorianMeridiem() : this.getMeridiem()
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
		if (output.match(/dw/)) output = output.replace(/dw/g, () => ph((gregorian ? super.getDay() || 7 : this.getDay()).toString()))
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

		// Hours
		const hours = super.getHours()
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

		return output
	}
}

export default JalaliX
