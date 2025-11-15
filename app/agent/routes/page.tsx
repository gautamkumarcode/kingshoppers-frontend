"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, MapPin, Navigation } from "lucide-react";

export default function RoutesPage() {
	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-3xl font-bold">Routes</h1>
				<Button>
					<Navigation className="w-4 h-4 mr-2" />
					Start Navigation
				</Button>
			</div>

			{/* Today's Route Summary */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">
									Total Deliveries
								</p>
								<p className="text-3xl font-bold mt-2">8</p>
							</div>
							<div className="p-3 rounded-lg bg-blue-500/10 text-blue-600">
								<MapPin className="w-6 h-6" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Completed</p>
								<p className="text-3xl font-bold mt-2">5</p>
							</div>
							<div className="p-3 rounded-lg bg-green-500/10 text-green-600">
								<CheckCircle className="w-6 h-6" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Pending</p>
								<p className="text-3xl font-bold mt-2">3</p>
							</div>
							<div className="p-3 rounded-lg bg-orange-500/10 text-orange-600">
								<Clock className="w-6 h-6" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Est. Distance</p>
								<p className="text-3xl font-bold mt-2">32 km</p>
							</div>
							<div className="p-3 rounded-lg bg-purple-500/10 text-purple-600">
								<Navigation className="w-6 h-6" />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Route Map Placeholder */}
			<Card>
				<CardHeader>
					<CardTitle>Today's Route</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-96 bg-muted rounded-lg flex items-center justify-center">
						<div className="text-center">
							<MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
							<p className="text-muted-foreground">
								Route map will be displayed here
							</p>
							<p className="text-sm text-muted-foreground mt-2">
								Integration with Google Maps or similar service
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Delivery Stops */}
			<Card>
				<CardHeader>
					<CardTitle>Delivery Stops</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{[1, 2, 3].map((stop) => (
							<div
								key={stop}
								className="flex items-start gap-4 pb-4 border-b last:border-0">
								<div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
									{stop}
								</div>
								<div className="flex-1">
									<p className="font-semibold">Order #KS{1000 + stop}</p>
									<p className="text-sm text-muted-foreground">
										123 Main Street, City Name - 400001
									</p>
									<p className="text-sm text-muted-foreground">
										Customer: John Doe • ₹2,500
									</p>
								</div>
								<Button size="sm" variant="outline">
									<Navigation className="w-4 h-4 mr-2" />
									Navigate
								</Button>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
