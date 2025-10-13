import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Extract error information from Belvo callback
    const errorCode = searchParams.get("error_code")
    const errorMessage = searchParams.get("error_message")
    const errorType = searchParams.get("error_type")
    const institutionId = searchParams.get("institution_id")
    const userId = searchParams.get("user_id")

    console.error("Belvo error callback received:", {
      errorCode,
      errorMessage,
      errorType,
      institutionId,
      userId,
      allParams: Object.fromEntries(searchParams.entries()),
    })

    // Log the error for monitoring/analytics
    // You can add additional error logging or alerting here

    // Build error URL with parameters
    const errorParams = new URLSearchParams()
    if (errorCode) errorParams.set("error_code", errorCode)
    if (errorMessage) errorParams.set("error_message", errorMessage)
    if (errorType) errorParams.set("error_type", errorType)
    if (institutionId) errorParams.set("institution_id", institutionId)

    const errorUrl = `${process.env.NEXT_PUBLIC_APP_URL}/belvo/error?${errorParams.toString()}`

    // Redirect to error page
    return NextResponse.redirect(errorUrl)
  } catch (error) {
    console.error("Error in Belvo error callback:", error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/belvo/error?error_code=PROCESSING_ERROR&error_message=Erro interno do servidor`
    )
  }
}
