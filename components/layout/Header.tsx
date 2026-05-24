import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface HeaderProps {
  title: string;
}

export async function Header({ title }: HeaderProps) {
  const session = await getServerSession(authOptions);

  const userName = session?.user?.name || "Usuario Desconocido";
  const nombreRol = session?.user?.role || "Sin Rol";

  return (
    <header className="flex justify-between items-center bg-white h-16 px-8 border-b border-gray-200 sticky top-0 z-10">
      <h1 className="text-xl font-bold text-gray-800">{title}</h1>
      <div className="flex flex-col items-end">
        <span className="text-sm font-medium text-gray-900">{userName}</span>
        <span className="text-xs text-gray-500 capitalize">{nombreRol}</span>
      </div>
    </header>
  );
}
