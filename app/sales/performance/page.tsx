"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthGuard } from "@/components/auth-guard"
import { TrendingUp, Award, Target } from "lucide-react"

export default function PerformancePage() {
  return (
    <AuthGuard requiredRole="sales_executive">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Performance</h1>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                  <p className="text-3xl font-bold mt-2">₹45,000</p>
                  <p className="text-xs text-green-600 mt-1">+12% from last month</p>
                </div>
                <div className="p-3 rounded-lg bg-green-500/10 text-green-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Incentive Earned</p>
                  <p className="text-3xl font-bold mt-2">₹4,500</p>
                  <p className="text-xs text-blue-600 mt-1">5% commission rate</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10 text-blue-600">
                  <Award className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Target Progress</p>
                  <p className="text-3xl font-bold mt-2">75%</p>
                  <p className="text-xs text-purple-600 mt-1">₹60,000 target</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-500/10 text-purple-600">
                  <Target className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Details */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-sm">Total Orders</span>
                <span className="font-semibold">24</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-sm">Delivered Orders</span>
                <span className="font-semibold">22</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-sm">Pending Orders</span>
                <span className="font-semibold">2</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-sm">Average Order Value</span>
                <span className="font-semibold">₹1,875</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Customer Satisfaction</span>
                <span className="font-semibold">4.8/5</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  )
}
