import { NextRequest, NextResponse } from "next/server"

import { createClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the current user
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

    // Fetch user's bank connections
    const { data: connections, error } = await supabase
      .from("bank_connections")
      .select("*")
      .eq("user_id", user.id)
      .order("connected_at", { ascending: false })

    if (error) {
      console.error("Error fetching bank connections:", error)
      return NextResponse.json(
        { error: "Failed to fetch bank connections" },
        { status: 500 }
      )
    }

    return NextResponse.json({ connections })
  } catch (error) {
    console.error("Error in bank connections API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
