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
	private weekDaysCharacters = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']
	private monthsNames = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']
	static persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
	private am = 'ق.ظ.'
	private pm = 'ب.ظ.'

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

	private checkLeapYear(year: number): boolean {
		if (year > 0) {
			const checkYear: number = (year + 2346) * this.leapYearDivision
			return checkYear - parseInt(checkYear.toString()) < this.leapYearDivision
		}

		return false
	}

	private reset(): JalaliDate {
		this.isConverted = false
		this.jalali.year = 1348
		this.jalali.month = 10
		this.jalali.day = 11

		return this.toJalali()
	}

	private addZero(number: number): string {
		return `${number > -1 && number < 10 ? '0' : ''}${number}`
	}

	private getJalaliMonth(number: number): string {
		return this.monthsNames[number - 1]
	}

	private getJalaliWeekDay(): string {
		return this.weekDaysNames[(this.getDay() + this.firstDayOfWeek) % 7]
	}

	private getUTCTimezone(): string {
		const dateString = super.toString()
		const timezoneMatch = dateString.match(/ GMT([0-9a-zA-Z\+\-\(\) ]+)/)

		return `${timezoneMatch && timezoneMatch.length > 1 ? ` GMT${timezoneMatch[1]}` : ''}`
	}

	private normalizeDate(date: number): number {
		return super.setDate(super.getDate() + date)
	}

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

	/** Returns a string representation of a date. The format of the string depends on the locale. */
	public toString(): string {
		const jDate = this.toJalali()

		return `${this.getJalaliWeekDay()} ${this.addZero(jDate.day)} ${this.getJalaliMonth(jDate.month)} ${this.addZero(jDate.year)} ${jDate.hours}:${this.addZero(
			jDate.min
		)}:${this.addZero(jDate.sec)}${this.getUTCTimezone()}`
	}

	/** Returns a date as a string value. */
	public toDateString(): string {
		const jDate = this.toJalali()

		return `${this.getJalaliWeekDay()} ${this.addZero(jDate.day)} ${this.getJalaliMonth(jDate.month)} ${this.addZero(jDate.year)}`
	}

	/** Returns a date as a string value appropriate to the host environment's current locale. */
	public toLocaleDateString(): string {
		const jDate = this.toJalali()

		return `${this.addZero(jDate.year)}/${this.addZero(jDate.month)}/${this.addZero(jDate.day)}`
	}

	/** Returns a time as a string value appropriate to the host environment's current locale. */
	public toLocaleTimeString(): string {
		const jDate = this.toJalali()

		return `${jDate.hours % 12}:${this.addZero(jDate.min)}:${this.addZero(jDate.sec)} ${this.getMeridiem()}`
	}

	/** Gets the year, using local time. */
	public getFullYear(): number {
		const jDate = this.toJalali()

		return jDate.year
	}

	/** Gets the month, using local time. */
	public getMonth(): number {
		const jDate = this.toJalali()

		return jDate.month
	}

	/** Gets the day-of-the-month, using local time. */
	public getDate(): number {
		const jDate = this.toJalali()

		return jDate.day
	}

	/** Gets the day of the week, using local time. */
	public getDay(): number {
		return (super.getDay() - this.firstDayOfWeek + 7 + 1) % 7
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

	public create(date: number | Date, options?: JalaliOptions): JalaliX {
		return new JalaliX(date)
	}

	public clone(): JalaliX {
		return new JalaliX(this.valueOf())
	}

	public static isValidDate(date: unknown): boolean {
		return date instanceof Date && !isNaN(Number(date))
	}

	public static toPersian(str: string): string {
		for (let i = 0; i <= 9; i++) str = str.replace(new RegExp(`${i}`, 'g'), this.persianNumbers[i])

		return str
	}

	public static compare(date: JalaliX, comparing: JalaliX): boolean {
		return date.getTime() < comparing.getTime()
	}

	public getTimezone(): string {
		return Intl.DateTimeFormat().resolvedOptions().timeZone
	}

	public getWeekOfYear(): number {
		const dayOfYear = this.getDayOfYear()

		// Find first day of year
		const d = new JalaliX(this.valueOf()).addDays(-1 * dayOfYear + 1)
		const dayOfWeek = d.getDayISO()

		let outout = Math.ceil((dayOfYear + dayOfWeek - 1) / 7)

		return outout
	}

	public getDayOfYear(): number {
		const jDate = this.toJalali()
		let output = jDate.day

		if (jDate.month < 7) output += (jDate.month - 1) * 31
		else if (jDate.month < 12) output += 186 + (jDate.month - 7) * 30
		else output += 336

		return output
	}

	public getDayISO(): number {
		return ((this.getDay() + 6) % 7) + 1
	}

	public getHoursISO(): number {
		const hours = this.getHours()

		return hours > 12 ? hours - 12 : hours
	}

	public getMeridiem(): string {
		const jDate = this.toJalali()

		return jDate.hours > 12 ? this.pm : this.am
	}

	public setTimezone(timezone: string): JalaliX {
		return new JalaliX(this.toLocaleString(undefined, { timeZone: timezone }))
	}

	public addDays(date: number): JalaliX {
		// Normalize date
		this.normalizeDate(date)

		// Reset
		this.reset()

		return this
	}

	public addMonths(month: number): JalaliX {
		let jDate = this.toJalali()

		// Normalize Jalali
		this.normalizeJalali(jDate, jDate.year, jDate.month + month, jDate.day)

		// Reset
		this.reset()

		return this
	}

	public addYears(year: number): JalaliX {
		let jDate = this.toJalali()

		// Normalize Jalali
		this.normalizeJalali(jDate, jDate.year + year, jDate.month, jDate.day)

		// Reset
		this.reset()

		return this
	}

	public format(str: string): string {
		let output = str

		// Year
		if (output.match(/YYYY/)) output = output.replace(/YYYY/g, this.getFullYear().toString())
		if (output.match(/YYY/)) output = output.replace(/YYY/g, this.getFullYear().toString().substring(1, 4))
		if (output.match(/YY/)) output = output.replace(/YY/g, this.getFullYear().toString().substring(2, 4))
		if (output.match(/Y/)) output = output.replace(/Y/g, this.getFullYear().toString().substring(3, 4))

		// Month
		if (output.match(/MMM/)) output = output.replace(/MMM/g, this.getJalaliMonth(this.getMonth()))
		if (output.match(/MM/)) output = output.replace(/MM/g, this.addZero(this.getMonth()))
		if (output.match(/M/)) output = output.replace(/M/g, this.getMonth().toString())

		// Week
		if (output.match(/W/)) output = output.replace(/W/g, this.addZero(this.getWeekOfYear()))
		if (output.match(/w/)) output = output.replace(/w/g, this.getWeekOfYear().toString())
		if (output.match(/E/)) output = output.replace(/E/g, this.getDayISO().toString())
		if (output.match(/e/)) output = output.replace(/e/g, this.getDay().toString())

		// Day
		if (output.match(/DDDD/)) output = output.replace(/DDDD/g, this.addZero(this.getDayOfYear()))
		if (output.match(/DDD/)) output = output.replace(/DDD/g, this.getDayOfYear().toString())
		if (output.match(/DD/)) output = output.replace(/DD/g, this.addZero(this.getDate()))
		if (output.match(/D/)) output = output.replace(/D/g, this.getDate().toString())

		// Hours
		if (output.match(/HH/)) output = output.replace(/HH/g, this.addZero(this.getHours()))
		if (output.match(/H/)) output = output.replace(/H/g, this.getHours().toString())
		if (output.match(/hh/)) output = output.replace(/hh/g, this.addZero(this.getHoursISO()))
		if (output.match(/h/)) output = output.replace(/h/g, this.getHoursISO().toString())

		// Minutes
		if (output.match(/mm/)) output = output.replace(/mm/g, this.addZero(this.getMinutes()))
		if (output.match(/m/)) output = output.replace(/m/g, this.getMinutes().toString())

		// Seconds
		if (output.match(/ss/)) output = output.replace(/ss/g, this.addZero(this.getSeconds()))
		if (output.match(/s/)) output = output.replace(/s/g, this.getSeconds().toString())

		// Milliseconds
		if (output.match(/sss/)) output = output.replace(/sss/g, this.getMilliseconds().toString())
		if (output.match(/SSS/)) output = output.replace(/SSS/g, this.getMilliseconds().toString())

		// Meridiem
		if (output.match(/A/)) output = output.replace(/A/g, this.getMeridiem())
		if (output.match(/a/)) output = output.replace(/a/g, this.getMeridiem())

		// Unix Timestamp
		if (output.match(/X/)) output = output.replace(/X/g, Math.floor(this.getTime() / 1000).toString())
		if (output.match(/x/)) output = output.replace(/x/g, this.getTime().toString())

		return output
	}
}

export default JalaliX
