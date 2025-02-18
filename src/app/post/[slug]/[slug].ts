import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;

  if (typeof slug !== "string") {
    return res.status(400).json({ error: "Slug inválido" });
  }

  try {
    const post = await prisma.post.findUnique({
        where: {slug}
    });

          if (!post) {
      return res.status(404).json({ error: "Post não encontrado" });
    }

    return res.status(200).json(post);
  } catch (error) {
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}
