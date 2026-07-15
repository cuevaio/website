import type { ReactNode } from "react";
import { GrainOverlay } from "@/components/grain-overlay";
import { ShaderBackground } from "@/components/shader-background";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";

export function SitePageShell({
	children,
	currentPath,
}: {
	children: ReactNode;
	currentPath?: string;
}) {
	return (
		<main className="page-shell">
			<ShaderBackground />
			<GrainOverlay />

			<div className="page-shell-inner">
				<SiteNav currentPath={currentPath} />

				<section className="mx-auto flex w-full max-w-[44rem] flex-1 px-5 pb-20 pt-8 md:px-6 md:pt-12">
					<div className="w-full">{children}</div>
				</section>

				<SiteFooter />
			</div>
		</main>
	);
}
