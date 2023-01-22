import Link from "next/link"
import Navbar from "@/components/Navbar"
import { BaseLayout } from "."
import { ProfileImage } from "@/ui/ProfileImage"

export default function NotHomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <BaseLayout>
      <div className="col-start-2 col-end-3 sticky top-0 z-20 bg-neutral-900 py-4 flex space-x-8 items-center justify-between">
        <Link href="/">
          <ProfileImage size="small" isInteractive />
        </Link>
        <Navbar />
      </div>
      {children}
    </BaseLayout>
  )
}
