// Types
import type { JalaliDate } from './index.types'

class JalaliX extends Date {
	jalali: JalaliDate = {
		year: 1348,
		month: 10,
		day: 11,
		hours: this.getHours(),
		min: this.getMinutes(),
		sec: this.getSeconds(),
		ms: this.getMilliseconds(),
		isLeapYear: false
	}

	isConverted = false
	leapYearDivision = 0.24219858156
	firstDayOfWeek = 6
	dateLength = 86400000
	weekDays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه شنبه', 'چهار شنبه', 'پنج شنبه', 'جمعه']
	months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']
	persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
	am = 'ق.ظ'
	pm = 'ب.ظ'

	public toJalali(): JalaliDate {
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
		return this.months[number - 1]
	}

	private getJalaliWeekDay(): string {
		return this.weekDays[(this.getDay() + this.firstDayOfWeek) % 7]
	}

	private getTimezone(): string {
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
		)}:${this.addZero(jDate.sec)}${this.getTimezone()}`
	}

	/** Returns a date as a string value. */
	public toDateString(): string {
		const jDate = this.toJalali()

		return `${this.getJalaliWeekDay()} ${this.addZero(jDate.day)} ${this.getJalaliMonth(jDate.month)} ${this.addZero(jDate.year)}`
	}

	/** Returns a value as a string value appropriate to the host environment's current locale. */
	public toLocaleString(): string {
		const jDate = this.toJalali()

		return `${this.addZero(jDate.year)}/${this.addZero(jDate.month)}/${this.addZero(jDate.day)} ${jDate.hours % 12}:${this.addZero(jDate.min)}:${this.addZero(jDate.sec)} ${
			jDate.hours > 12 ? this.pm : this.am
		}`
	}

	/** Returns a date as a string value appropriate to the host environment's current locale. */
	public toLocaleDateString(): string {
		const jDate = this.toJalali()

		return `${this.addZero(jDate.year)}/${this.addZero(jDate.month)}/${this.addZero(jDate.day)}`
	}

	/** Returns a time as a string value appropriate to the host environment's current locale. */
	public toLocaleTimeString(): string {
		const jDate = this.toJalali()

		return `${jDate.hours % 12}:${this.addZero(jDate.min)}:${this.addZero(jDate.sec)} ${jDate.hours > 12 ? this.pm : this.am}`
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

	public toPersian(str: string): string {
		for (let i = 0; i <= 9; i++) str = str.replace(new RegExp(`${i}`, 'g'), this.persianNumbers[i])

		return str
	}

	public format(str: string): string {
		let output = str

		// Year
		output = output.replace(/YYYY/g, this.getFullYear().toString())
		output = output.replace(/YYY/g, this.getFullYear().toString().substring(1, 4))
		output = output.replace(/YY/g, this.getFullYear().toString().substring(2, 4))
		output = output.replace(/Y/g, this.getFullYear().toString().substring(3, 4))

		// Month
		output = output.replace(/MM/g, this.addZero(this.getMonth()))
		output = output.replace(/M/g, this.getMonth().toString())

		// Day
		output = output.replace(/DD/g, this.addZero(this.getDate()))

		// Time
		output = output.replace(/HH/g, this.addZero(this.getHours()))
		output = output.replace(/mm/g, this.addZero(this.getMinutes()))
		output = output.replace(/sss/g, this.getMilliseconds().toString())
		output = output.replace(/ss/g, this.addZero(this.getSeconds()))

		return output
	}
}

export default JalaliX
