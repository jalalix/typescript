// Types
export type JalaliDate = {
	year: number
	month: number
	day: number
	hours: number
	min: number
	sec: number
	ms: number
	isLeapYear: boolean
}

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
	am = 'قبل از ظهر'
	pm = 'بعد از ظهر'

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

							if (isLeapYear) console.log(this.jalali.year)
						} else if (this.jalali.month > 1 && this.jalali.month < 8) {
							this.jalali.month--
							this.jalali.day = 31
						} else if (this.jalali.month > 7 && this.jalali.month < 13) {
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

	private toGregorian(date: JalaliDate): number {
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

		let output = (date.hours * 24 + date.min * 60 + date.sec) * 1000 + date.ms

		if (date.year > 1348 || (date.year === 1348 && date.month >= 10) || (date.year === 1348 && date.month === 10 && date.day >= 11))
			for (let i = 0; i < Infinity; i++) {
				if (jalali.year === date.year && jalali.month === date.month && jalali.day === date.day) break

				jalali.day++
				output += this.dateLength

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
		else if (date.year < 1348) {
		}

		return super.setTime(output)
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
		return this.weekDays[this.getDay() - 1]
	}

	private getTimezone(): string {
		const dateString = super.toString()
		const timezoneMatch = dateString.match(/ GMT([0-9a-zA-Z\+\-\(\) ]+)/)

		return `${timezoneMatch && timezoneMatch.length > 1 ? ` GMT${timezoneMatch[1]}` : ''}`
	}

	/** Returns a string representation of a date. The format of the string depends on the locale. */
	public toString(): string {
		const jDate = this.toJalali()

		return `${this.getJalaliWeekDay()} ${this.addZero(jDate.year)} ${this.getJalaliMonth(jDate.month)} ${this.addZero(jDate.day)} ${jDate.hours}:${this.addZero(
			jDate.min
		)}:${this.addZero(jDate.sec)}${this.getTimezone()}`
	}

	/** Returns a date as a string value. */
	public toDateString(): string {
		const jDate = this.toJalali()

		return `${this.getJalaliWeekDay()} ${this.addZero(jDate.year)} ${this.getJalaliMonth(jDate.month)} ${this.addZero(jDate.day)}`
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
		return (super.getDay() - this.firstDayOfWeek + 1 + 7) % 7
	}

	/**
	 * Sets the numeric day-of-the-month value of the Date object using local time.
	 * @param date A numeric value equal to the day of the month.
	 */
	public setDate(date: number): number {
		const jDate = this.toJalali()
		const output = this.toGregorian({ ...jDate, ...{ day: date } })

		// Reset
		this.reset()

		return output
	}

	/**
	 * Sets the month value in the Date object using local time.
	 * @param month A numeric value equal to the month. The value for January is 0, and other month values follow consecutively.
	 * @param date A numeric value representing the day of the month. If this value is not supplied, the value from a call to the getDate method is used.
	 */
	public setMonth(month: number, date?: number): number {
		const jDate = this.toJalali()
		const diffMonth = super.getMonth() + (month - jDate.month)
		let output = super.setDate(diffMonth)

		if (date) {
			const diffDate = super.getDate() + (date - jDate.day)
			output = super.setDate(diffDate)
		}

		// Reset
		this.reset()

		return output
	}

	/**
	 * Sets the year of the Date object using local time.
	 * @param year A numeric value for the year.
	 * @param month A zero-based numeric value for the month (0 for January, 11 for December). Must be specified if numDate is specified.
	 * @param date A numeric value equal for the day of the month.
	 */
	// public setFullYear(year: number, month?: number, date?: number): number {}

	/** Returns a date as a string value in ISO format. */
	// public toISOString(): string {}

	/** Used by the JSON.stringify method to enable the transformation of an object's data for JavaScript Object Notation (JSON) serialization. */
	// public toJSON(key?: any): string {}
}

export default JalaliX
