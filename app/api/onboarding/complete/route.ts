import { NextRequest, NextResponse } from "next/server"

import { createClient } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const supabase = createClient()

    // Mark onboarding as complete
    const { data, error } = await supabase.from("user_onboarding").upsert({
      user_id: userId,
      has_completed_onboarding: true,
      current_step: 3,
      completed_steps: [1, 2, 3],
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error completing onboarding:", error)
      return NextResponse.json(
        { error: "Failed to complete onboarding" },
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
