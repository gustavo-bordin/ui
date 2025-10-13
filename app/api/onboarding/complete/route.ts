import { NextRequest, NextResponse } from "next/server"

import { createClient } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

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

    // Mark onboarding as complete
    const { data, error } = await supabase.from("user_onboarding").upsert({
      user_id: userId,
      has_completed_onboarding: true,
      current_step: 5,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error completing onboarding:", error)
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })
      return NextResponse.json(
        { error: "Failed to complete onboarding", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error in complete onboarding API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
