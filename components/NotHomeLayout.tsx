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
      <div className="sticky top-0 z-20 bg-neutral-900">
        <div className="w-160 mx-auto py-4 flex space-x-8 items-center justify-between">
          <Link href="/">
            <ProfileImage size="small" isInteractive />
          </Link>
          <Navbar />
        </div>
      </div>
      <div className="relative z-10 grid grid-cols-[1fr,min(640px,100%),1fr] gap-y-8 px-4 font-sans text-base text-neutral-100/90 xl:grid-cols-[1fr,minmax(auto,240px),min(640px,100%),minmax(auto,240px),1fr] xl:gap-x-9 xl:px-0 [&>*]:col-start-2 xl:[&>*]:col-start-3">
        {children}
      </div>
    </BaseLayout>
  )
}
