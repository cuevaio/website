"use client";

import { useEffect, useState } from "react";

function formatAbsoluteDate(date: Date) {
	return new Intl.DateTimeFormat("en", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
		timeZoneName: "short",
	}).format(date);
}

function formatRelativeDate(date: Date) {
	const difference = date.getTime() - Date.now();
	const absoluteDifference = Math.abs(difference);
	const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

	if (absoluteDifference < 60_000) return "just now";
	if (absoluteDifference < 3_600_000) {
		return formatter.format(Math.round(difference / 60_000), "minute");
	}
	if (absoluteDifference < 86_400_000) {
		return formatter.format(Math.round(difference / 3_600_000), "hour");
	}
	if (absoluteDifference < 2_592_000_000) {
		return formatter.format(Math.round(difference / 86_400_000), "day");
	}
	if (absoluteDifference < 31_536_000_000) {
		return formatter.format(Math.round(difference / 2_592_000_000), "month");
	}
	return formatter.format(Math.round(difference / 31_536_000_000), "year");
}

export function LocalDate({
	date,
	fallback,
	relative = false,
}: {
	date: string;
	fallback: string;
	relative?: boolean;
}) {
	const [label, setLabel] = useState(fallback);
	const [title, setTitle] = useState(fallback);
	const [ready, setReady] = useState(false);

	useEffect(() => {
		const parsed = new Date(date);
		function updateDate() {
			setLabel(
				relative ? formatRelativeDate(parsed) : formatAbsoluteDate(parsed),
			);
			setTitle(formatAbsoluteDate(parsed));
			setReady(true);
		}

		updateDate();
		if (!relative) return;

		const interval = window.setInterval(updateDate, 60_000);
		return () => window.clearInterval(interval);
	}, [date, relative]);

	return (
		<time
			dateTime={date}
			title={title}
			className="local-date"
			data-ready={ready}
			suppressHydrationWarning
		>
			{label}
		</time>
	);
}
