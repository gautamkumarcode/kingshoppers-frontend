"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiCall } from "@/lib/auth"
import { AuthGuard } from "@/components/auth-guard"
import { useToast } from "@/hooks/use-toast"
import { WalletIcon, Plus, TrendingUp } from "lucide-react"

export default function WalletPage() {
  const { toast } = useToast()
  const [wallet, setWallet] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState("")
  const [adding, setAdding] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    fetchWallet()
  }, [])

  const fetchWallet = async () => {
    try {
      const response = await apiCall("/api/wallet")
      const data = await response.json()
      setWallet(data)
    } catch (error) {
      console.error("Failed to fetch wallet:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdding(true)

    try {
      const response = await apiCall("/api/wallet/add-money", {
        method: "POST",
        body: JSON.stringify({ amount: Number.parseFloat(amount) }),
      })

      if (!response.ok) {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.message || "Failed to add money",
          variant: "destructive",
        })
        return
      }

      const data = await response.json()
      setWallet(data.wallet)
      setAmount("")
      setShowAddForm(false)

      toast({
        title: "Success",
        description: "Money added to wallet successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add money",
        variant: "destructive",
      })
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <AuthGuard>
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8">My Wallet</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Wallet Balance */}
            <Card className="bg-gradient-to-br from-primary/20 to-accent/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Wallet Balance</p>
                    <p className="text-4xl font-bold text-primary mt-2">₹{wallet?.balance || 0}</p>
                  </div>
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <WalletIcon className="w-8 h-8 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent className="p-6 space-y-3">
                <Button className="w-full" onClick={() => setShowAddForm(!showAddForm)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Money
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Loyalty Points
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Add Money Form */}
          {showAddForm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Add Money to Wallet</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddMoney} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="1"
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={adding}>
                      {adding ? "Processing..." : "Add Money"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                      className="bg-transparent"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Transaction History */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              {wallet?.transactions && wallet.transactions.length > 0 ? (
                <div className="space-y-4">
                  {wallet.transactions.map((transaction: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center pb-4 border-b last:border-0">
                      <div>
                        <p className="font-semibold capitalize">{transaction.reason}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <p
                        className={`font-semibold ${transaction.type === "credit" ? "text-green-600" : "text-red-600"}`}
                      >
                        {transaction.type === "credit" ? "+" : "-"}₹{transaction.amount}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No transactions yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </AuthGuard>
  )
}
