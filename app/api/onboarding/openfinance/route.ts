import { NextRequest, NextResponse } from "next/server"

import { createClient } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const { userId, connected } = await request.json()

    if (!userId || typeof connected !== "boolean") {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Update user onboarding status and current_step to 5 (step 4 completed, onboarding done)
    const { data, error } = await supabase.from("user_onboarding").upsert({
      user_id: userId,
      openfinance_connected: connected,
      connection_date: connected ? new Date().toISOString() : null,
      current_step: 5,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error updating OpenFinance status:", error)
      return NextResponse.json(
        { error: "Failed to update OpenFinance status" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error in OpenFinance API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
