"use client";

import { useEffect, useState } from "react";
import { formatRelativeTime } from "@/lib/relative-time";

const updateInterval = 30_000;

export function RelativeDate({ date }: { date: string }) {
	const [label, setLabel] = useState("");

	useEffect(() => {
		function updateLabel() {
			setLabel(formatRelativeTime(date));
		}

		updateLabel();
		const interval = window.setInterval(updateLabel, updateInterval);
		return () => window.clearInterval(interval);
	}, [date]);

	return (
		<time dateTime={date} className="relative-date" data-ready={Boolean(label)}>
			{label}
		</time>
	);
}
