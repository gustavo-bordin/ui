import { NextRequest, NextResponse } from "next/server"

import { createClient } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const { userId, step } = await request.json()

    if (!userId || typeof step !== "number") {
      return NextResponse.json(
        { error: "Missing userId or step" },
        { status: 400 }
      )
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

    // Update current_step
    const { data, error } = await supabase.from("user_onboarding").upsert(
      {
        user_id: userId,
        current_step: step,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    )

    if (error) {
      console.error("Error updating step:", error)
      return NextResponse.json(
        { error: "Failed to update step" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error in step API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
