import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AuthCodeError() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Authentication Error</h1>
        <p className="text-muted-foreground">
          There was an error with your authentication. Please try again.
        </p>
        <Button asChild>
          <Link href="/auth/login">Try Again</Link>
        </Button>
      </div>
    </div>
  )
}
