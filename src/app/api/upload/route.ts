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

  // Limpa o nome do arquivo removendo caracteres especiais e espaços
  const cleanFileName = file.name
    .replace(/[^a-zA-Z0-9.-]/g, '_') // substitui caracteres especiais por _
    .replace(/\s+/g, '_') // substitui espaços por _
    .replace(/_+/g, '_'); // remove múltiplos _ consecutivos

  // Gera um nome único para o arquivo
  const filename = `${Date.now()}-${cleanFileName}`;
  const filePath = path.join(uploadDir, filename);

  // Converte o arquivo para buffer e salva no disco
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  // Retorna a URL relativa para o arquivo salvo
  const imageUrl = `/upload/${filename}`;

  console.log('✅ Arquivo salvo:', {
    originalName: file.name,
    cleanFileName,
    finalName: filename,
    url: imageUrl,
    path: filePath
  });

  return imageUrl;
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
