import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    res.status(200).json({ message: "Rota válida" });
  } catch {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}
