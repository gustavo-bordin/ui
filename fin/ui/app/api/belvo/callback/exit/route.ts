import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Extract parameters from Belvo callback
    const reason = searchParams.get("reason") || "user_cancelled"
    const userId = searchParams.get("user_id")

    console.log("Belvo exit callback received:", {
      reason,
      userId,
      allParams: Object.fromEntries(searchParams.entries()),
    })

    // Log the exit event for analytics/monitoring
    // You can add additional logging or analytics tracking here

    // Redirect to exit page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/belvo/exit?reason=${encodeURIComponent(reason)}`
    )
  } catch (error) {
    console.error("Error in Belvo exit callback:", error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/belvo/exit?reason=system_error`
    )
  }
}
