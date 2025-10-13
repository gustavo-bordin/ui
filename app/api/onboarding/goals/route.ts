import { NextRequest, NextResponse } from "next/server"

import { createClient } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const { userId, answers } = await request.json()

    if (!userId || !answers) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Define question mappings for better data structure
    const questionMappings: Record<
      string,
      { question: string; answers: Record<string, string> }
    > = {
      priority: {
        question: "Qual sua maior prioridade financeira agora?",
        answers: {
          pay_debts: "Pagar dívidas",
          emergency_fund: "Guardar uma reserva de emergência",
          daily_expenses: "Controlar gastos do dia-a-dia",
        },
      },
      tracking: {
        question: "Você costuma acompanhar seus gastos mensalmente?",
        answers: {
          regular_tracking: "Sim, eu já faço isso regularmente",
          sometimes_tracking: "Às vezes, mas não com disciplina",
          never_tracking: "Não, quase nunca",
        },
      },
      spending_pattern: {
        question:
          "Como você gasta mais: despesas fixas ou gastos inesperados / supérfluos?",
        answers: {
          high_fixed_costs: "Tenho muitos custos fixos altos",
          impulse_spending:
            "Gasto demais com supérfluos ou coisas extras sem planejar",
          both_equal: "Os dois igualmente",
        },
      },
    }

    // Convert answers to onboarding_responses format
    const responsesData = Object.entries(answers).map(
      ([questionId, answerId]) => {
        const mapping = questionMappings[questionId]
        return {
          user_id: userId,
          question_id: questionId,
          answer_id: answerId,
          question_text: mapping?.question || questionId,
          answer_text: mapping?.answers[answerId as string] || answerId,
        }
      }
    )

    // Insert user goals
    const { data, error } = await supabase
      .from("user_goals")
      .insert(responsesData)

    if (error) {
      console.error("Error inserting onboarding responses:", error)
      return NextResponse.json(
        { error: "Failed to save answers" },
        { status: 500 }
      )
    }

    // Update current_step to 3 (step 2 completed, moving to step 3)
    const { error: onboardingError } = await supabase
      .from("user_onboarding")
      .upsert(
        {
          user_id: userId,
          current_step: 3,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      )

    if (onboardingError) {
      console.error("Error updating onboarding step:", onboardingError)
      // Don't fail the request, just log the error
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error in goals API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
