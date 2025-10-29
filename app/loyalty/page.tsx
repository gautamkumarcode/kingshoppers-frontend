"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiCall } from "@/lib/auth"
import { AuthGuard } from "@/components/auth-guard"
import { useToast } from "@/hooks/use-toast"
import { Gift, Star, TrendingUp } from "lucide-react"

export default function LoyaltyPage() {
  const { toast } = useToast()
  const [loyalty, setLoyalty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [redeeming, setRedeeming] = useState(false)

  useEffect(() => {
    fetchLoyalty()
  }, [])

  const fetchLoyalty = async () => {
    try {
      const response = await apiCall("/api/loyalty")
      const data = await response.json()
      setLoyalty(data)
    } catch (error) {
      console.error("Failed to fetch loyalty:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRedeemPoints = async (points: number) => {
    setRedeeming(true)

    try {
      const response = await apiCall("/api/loyalty/redeem", {
        method: "POST",
        body: JSON.stringify({ points }),
      })

      if (!response.ok) {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.message || "Failed to redeem points",
          variant: "destructive",
        })
        return
      }

      const data = await response.json()

      toast({
        title: "Success",
        description: `Redeemed ${points} points for ₹${data.cashbackAmount}`,
      })

      fetchLoyalty()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to redeem points",
        variant: "destructive",
      })
    } finally {
      setRedeeming(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  const tiers = [
    { name: "Regular", minPoints: 0, benefits: ["Standard shipping", "Email support"] },
    { name: "Bronze", minPoints: 500, benefits: ["Free shipping", "Priority support", "5% discount"] },
    { name: "Silver", minPoints: 2000, benefits: ["Free shipping", "24/7 support", "10% discount", "Early access"] },
    { name: "Gold", minPoints: 5000, benefits: ["Free shipping", "VIP support", "15% discount", "Exclusive deals"] },
  ]

  return (
    <AuthGuard>
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8">Loyalty Program</h1>

          {/* Current Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Points */}
            <Card className="bg-gradient-to-br from-primary/20 to-accent/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Loyalty Points</p>
                    <p className="text-4xl font-bold text-primary mt-2">{loyalty?.loyaltyPoints || 0}</p>
                  </div>
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <Gift className="w-8 h-8 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tier */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Tier</p>
                    <p className="text-3xl font-bold mt-2">{loyalty?.tier}</p>
                  </div>
                  <div className="p-4 bg-yellow-500/10 rounded-lg">
                    <Star className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cashback Value */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Cashback Value</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">₹{loyalty?.loyaltyPoints || 0}</p>
                  </div>
                  <div className="p-4 bg-green-500/10 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Redeem Options */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Redeem Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[100, 250, 500, 1000].map((points) => (
                  <Button
                    key={points}
                    variant="outline"
                    className="flex flex-col items-center gap-2 h-auto py-4 bg-transparent"
                    onClick={() => handleRedeemPoints(points)}
                    disabled={redeeming || (loyalty?.loyaltyPoints || 0) < points}
                  >
                    <span className="text-lg font-bold">{points}</span>
                    <span className="text-xs text-muted-foreground">₹{points}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tier Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>Tier Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {tiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={`p-4 rounded-lg border-2 ${loyalty?.tier === tier.name ? "border-primary bg-primary/5" : "border-border"}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-lg">{tier.name}</p>
                        <p className="text-sm text-muted-foreground">{tier.minPoints}+ points</p>
                      </div>
                      {loyalty?.tier === tier.name && (
                        <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">Current</span>
                      )}
                    </div>
                    <ul className="space-y-1">
                      {tier.benefits.map((benefit, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </AuthGuard>
  )
}
