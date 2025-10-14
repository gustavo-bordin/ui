import { NextRequest, NextResponse } from "next/server"

import { createClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify user authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("Authentication error:", authError)
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      )
    }

    // Ensure the authenticated user matches the userId
    if (user.id !== userId) {
      return NextResponse.json(
        { error: "Unauthorized: User ID mismatch" },
        { status: 403 }
      )
    }

    // Check OpenFinance connection status from user_onboarding table
    const { data, error } = await supabase
      .from("user_onboarding")
      .select("openfinance_connected, connection_date")
      .eq("user_id", userId)
      .single()

    if (error) {
      console.error("Error fetching connection status:", error)
      return NextResponse.json(
        { error: "Failed to check connection status" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      connected: data?.openfinance_connected || false,
      connection_date: data?.connection_date,
    })
  } catch (error) {
    console.error("Error in OpenFinance status API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
