import { NextRequest, NextResponse } from "next/server"

import { createClient } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const { userId, cpf } = await request.json()

    if (!userId || !cpf) {
      return NextResponse.json(
        { error: "Missing userId or cpf" },
        { status: 400 }
      )
    }

    // Validate CPF format (should be 11 digits)
    if (!/^\d{11}$/.test(cpf)) {
      return NextResponse.json(
        { error: "Invalid CPF format" },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error("Authentication error:", authError)
      return NextResponse.json(
        { error: "User not authenticated", details: authError?.message },
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

    // Store CPF in user_onboarding table
    const { data, error } = await supabase
      .from("user_onboarding")
      .upsert({
        user_id: userId,
        cpf: cpf,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      console.error("Error saving CPF:", error)
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      return NextResponse.json(
        { error: "Failed to save CPF", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error in CPF API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
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

    // Get CPF from user_onboarding table
    const { data, error } = await supabase
      .from("user_onboarding")
      .select("cpf")
      .eq("user_id", userId)
      .single()

    if (error) {
      console.error("Error fetching CPF:", error)
      return NextResponse.json(
        { error: "CPF not found" },
        { status: 404 }
      )
    }

    if (!data?.cpf) {
      return NextResponse.json(
        { error: "CPF not found for this user" },
        { status: 404 }
      )
    }

    return NextResponse.json({ cpf: data.cpf })
  } catch (error) {
    console.error("Error in CPF GET API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}