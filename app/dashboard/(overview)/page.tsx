import CardWrapper, { Card } from "@/app/ui/dashboard/cards";
import LatestInvoices from "@/app/ui/dashboard/latest-invoices";
import RevenueChart from "@/app/ui/dashboard/revenue-chart";
import { lusitana } from "@/app/ui/fonts";
import {
	CardSkeleton,
	LatestInvoicesSkeleton,
	RevenueChartSkeleton,
} from "@/app/ui/skeletons";
import { Suspense } from "react";
export default async function Page() {
	return (
		<main>
			<h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
				Dashboard
			</h1>
			<section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
				<Suspense fallback={<CardSkeleton/>}>
					<CardWrapper />
				</Suspense>
			</section>
			<section className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
				<Suspense fallback={<RevenueChartSkeleton />}>
					<RevenueChart />
				</Suspense>
				<Suspense fallback={<LatestInvoicesSkeleton />}>
					<LatestInvoices />
				</Suspense>
			</section>
		</main>
	);
}