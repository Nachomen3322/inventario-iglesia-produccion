import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "./db";
import { usuarios } from "./schema";
import { eq } from "drizzle-orm";

export async function getCurrentUserRole(): Promise<string> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = Number(session.user.id);
  const currentUser = await db.query.usuarios.findFirst({
    where: eq(usuarios.id_usuario, userId),
    with: { rol: true },
  });

  if (!currentUser) {
    redirect("/login");
  }

  return currentUser.rol.nombre_rol;
}
