import xata from "xata"
import type { NextApiRequest, NextApiResponse } from "next"
import { z } from "zod"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const slug = z.string().parse(req.query.slug)

    switch (req.method) {
      case "GET": {
        const post = await xata.Post.filter({ slug })
          .select(["views"])
          .getFirst()

        res.json(post?.views || 1)
        break
      }

      case "POST": {
        const post0 = await xata.Post.filter({ slug })
          .select(["id", "views"])
          .getFirst()

        let post1
        if (post0) {
          post1 = await xata.Post.update(post0.id, {
            views: post0.views + 1,
          })
        } else {
          post1 = await xata.Post.create({
            slug,
            views: 1,
          })
        }

        res.json(post1?.views || 1)
        break
      }

      default: {
        res.setHeader("Allow", ["GET", "POST"])
        res.status(405).send("Method Not Allowed")
      }
    }
  } catch (err: any) {
    console.error(err.message)

    res.status(500).json({
      statusCode: 500,
      message: err.message,
    })
  }
}
