import { NextRequest, NextResponse } from "next/server"

import { createClient } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const webhookData = await request.json()

    console.log("Belvo webhook received:", webhookData)

    // Verify webhook signature if needed (recommended for production)
    // const signature = request.headers.get('x-belvo-signature')

    const { event_type, data } = webhookData

    // Handle different webhook events
    switch (event_type) {
      case "historical_update":
        await handleHistoricalUpdate(data)
        break
      case "new_accounts_available":
      case "new_transactions_available":
      case "new_owners_available":
      case "new_bills_available":
      case "new_investments_available":
      case "new_investment_transactions_available":
        await handleNewDataAvailable(data)
        break
      case "openfinance_consent_expired":
      case "openfinance_consent_with_unrecoverable_resources":
      case "openfinance_consent_with_temporarily_unavailable_resources":
        await handleConsentIssues(data)
        break
      default:
        console.log(`Unhandled webhook event: ${event_type}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing Belvo webhook:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

async function handleHistoricalUpdate(data: any) {
  const { link_id, external_id } = data

  if (!external_id) {
    console.error("No external_id in webhook data")
    return
  }

  const supabase = await createClient()

  // Update last sync time for the bank connection
  if (link_id) {
    const { error: connectionError } = await supabase
      .from("bank_connections")
      .update({
        last_sync_at: new Date().toISOString(),
        status: "active",
      })
      .eq("link_id", link_id)

    if (connectionError) {
      console.error(
        "Error updating bank connection sync time:",
        connectionError
      )
    }
  }

  // Mark OpenFinance as connected for this user
  const { error } = await supabase
    .from("user_onboarding")
    .update({
      openfinance_connected: true,
      connection_date: new Date().toISOString(),
      belvo_link_id: link_id,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", external_id)

  if (error) {
    console.error("Error updating OpenFinance connection status:", error)
  } else {
    console.log(`OpenFinance connected for user ${external_id}`)
  }
}

async function handleNewDataAvailable(data: any) {
  const { link_id } = data

  // Handle new data available webhooks
  console.log("New data available:", data)

  if (link_id) {
    const supabase = await createClient()

    // Update last sync time for the bank connection
    const { error } = await supabase
      .from("bank_connections")
      .update({
        last_sync_at: new Date().toISOString(),
      })
      .eq("link_id", link_id)

    if (error) {
      console.error("Error updating bank connection sync time:", error)
    }
  }

  // You can implement additional logic here to fetch and process new data
}

async function handleConsentIssues(data: any) {
  const { link_id, external_id } = data

  if (!external_id) {
    console.error("No external_id in webhook data")
    return
  }

  const supabase = await createClient()

  // Mark the bank connection as inactive due to consent issues
  if (link_id) {
    const { error: connectionError } = await supabase
      .from("bank_connections")
      .update({
        status: "expired",
      })
      .eq("link_id", link_id)

    if (connectionError) {
      console.error("Error updating bank connection status:", connectionError)
    }
  }

  // Check if user has any other active connections
  const { data: activeConnections } = await supabase
    .from("bank_connections")
    .select("id")
    .eq("user_id", external_id)
    .eq("status", "active")

  // Mark OpenFinance as disconnected only if no active connections remain
  const { error } = await supabase
    .from("user_onboarding")
    .update({
      openfinance_connected: activeConnections && activeConnections.length > 0,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", external_id)

  if (error) {
    console.error("Error updating OpenFinance connection status:", error)
  } else {
    console.log(
      `Bank connection ${link_id} marked as expired for user ${external_id}`
    )
  }
}
