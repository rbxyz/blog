import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function saveFile(file: File): Promise<string> {
  // Define o diretório de uploads
  const uploadDir = path.join(process.cwd(), "public", "upload");
  if (!fs.existsSync(uploadDir)) { 
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Gera um nome único para o arquivo
  const filename = `${Date.now()}-${file.name}`;
  const filePath = path.join(uploadDir, filename);

  // Converte o arquivo para buffer e salva no disco
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  // Retorna a URL relativa para o arquivo salvo
  return `/upload/${filename}`;
}

export async function POST(req: Request) {
  try {
    // Usa o método nativo para parsear o FormData
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    const imageUrl = await saveFile(file);
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Error uploading file" }, { status: 500 });
  }
}
