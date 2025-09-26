import Link from "next/link"

export function ComponentsList() {
  // Since we removed Fumadocs, this component is simplified
  // You can add your own component list here if needed
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-x-8 lg:gap-x-16 lg:gap-y-6 xl:gap-x-20">
      <Link
        href="/dashboard"
        className="text-lg font-medium underline-offset-4 hover:underline md:text-base"
      >
        Dashboard
      </Link>
    </div>
  )
}
