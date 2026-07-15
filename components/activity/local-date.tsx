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

export function LocalDate({
	date,
	fallback,
}: {
	date: string;
	fallback: string;
}) {
	const [label, setLabel] = useState(fallback);
	const [title, setTitle] = useState(fallback);
	const [ready, setReady] = useState(false);

	useEffect(() => {
		const parsed = new Date(date);
		const frame = window.requestAnimationFrame(() => {
			setLabel(formatAbsoluteDate(parsed));
			setTitle(formatAbsoluteDate(parsed));
			setReady(true);
		});

		return () => window.cancelAnimationFrame(frame);
	}, [date]);

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
