const minute = 60_000;
const hour = 60 * minute;
const day = 24 * hour;
const month = 30 * day;
const year = 365 * day;

export function formatRelativeTime(date: string, now = Date.now()) {
	const difference = new Date(date).getTime() - now;
	const absoluteDifference = Math.abs(difference);
	const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

	if (absoluteDifference < minute) return "just now";
	if (absoluteDifference < hour) {
		return formatter.format(Math.round(difference / minute), "minute");
	}
	if (absoluteDifference < day) {
		return formatter.format(Math.round(difference / hour), "hour");
	}
	if (absoluteDifference < month) {
		return formatter.format(Math.round(difference / day), "day");
	}
	if (absoluteDifference < year) {
		return formatter.format(Math.round(difference / month), "month");
	}
	return formatter.format(Math.round(difference / year), "year");
}
