import { seo } from "@/lib/seo"
import { ProfileImage } from "@/ui/ProfileImage"
import { NextSeo } from "next-seo"
import React from "react"

import { BaseLayout, Navbar } from "@/components"

const Home = () => {
  return (
    <>
      <NextSeo noindex={true} {...seo} />
      <main className="w-160 mx-auto py-16">
        <div className="flex space-x-8 mb-4">
          <ProfileImage size="large" />

          <div className="my-auto">
            <h1 className="font-medium text-3xl">Anthony Cueva </h1>
            <h2 className="font-light text-lg text-neutral-400">
              Frontend Engineer
            </h2>
          </div>
        </div>

        <p className="mt-7 text-xl text-neutral-100/90 sm:mt-9">
          {seo.description}
        </p>

        <div className="flex justify-between items-center sticky top-0 bg-neutral-900 py-2">
          <Navbar />
          <h1>
            <span className="opacity-80">cuev</span>
            <span className="opacity-50">antn</span>
          </h1>
        </div>

        <div className="flex flex-col space-y-6 mt-8">
          <p>
            I'm a web developer based in Peru. I'm interested in web frameworks,
            user/dev experience, and serverless databases.
          </p>
          <p>
            I'm currently building Apprendamos, a social networking platform.
            Also, I'm working on an ecommerce platform for my local business:
            Fitpeak.
          </p>
          <p>
            Previously, I worked at Hunter Lojack, where I helped in the
            FullStack Web Development team. Before that, I created Check Your
            Wallet, a web app that helps you keep track of your finances.
          </p>
          <p>
            I'm always looking for opportunities to grow as a developer and work
            on innovative projects.
          </p>
        </div>
      </main>
    </>
  )
}

Home.getLayout = (page: any) => {
  return <BaseLayout>{page}</BaseLayout>
}

export default Home
