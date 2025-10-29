"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function PendingApprovalPage() {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Registration Submitted</CardTitle>
        <CardDescription>Your B2B account is pending admin approval</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-accent/10 border border-accent rounded-lg p-4">
          <p className="text-sm">
            Thank you for registering! Your B2B account has been submitted for verification. Our admin team will review
            your GST documents and company details within 24-48 hours.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">What happens next?</h3>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>We'll verify your GST number and documents</li>
            <li>You'll receive an email once approved</li>
            <li>You can then login and start placing orders</li>
          </ul>
        </div>

        <Link href="/auth/login">
          <Button className="w-full">Back to Login</Button>
        </Link>
      </CardContent>
    </Card>
  )
}
