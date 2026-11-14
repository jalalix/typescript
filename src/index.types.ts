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

export type JalaliOptions = {
	timezone?: string
}

export type JalaliFormatOptions = {
	/** Use Gregorian calendar instead of Jalali. Default: false */
	calendar?: 'jalali' | 'gregorian'
	/** Convert digits to Persian numerals (۰-۹). Default: false */
	persianDigits?: boolean
}

export type JalaliWallParts = {
	year: number
	month: number
	day: number
	hour: number
	minute: number
	second: number
	ms: number
}
