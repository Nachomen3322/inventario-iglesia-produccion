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
    <header className="sticky top-0 z-30 flex justify-between items-center bg-white h-16 pl-14 pr-4 md:px-8 border-b border-gray-200 w-full shadow-sm">
      <h1 className="text-lg md:text-xl font-bold text-gray-800 truncate">
        {title}
      </h1>
      <div className="flex flex-col items-end shrink-0 ml-4">
        <span className="text-sm font-medium text-gray-900 hidden sm:block">
          {userName}
        </span>
        <span className="text-sm font-medium text-gray-900 sm:hidden">
          {userName.split(" ")[0]}
        </span>{" "}
        <span className="text-xs text-gray-500 capitalize">{nombreRol}</span>
      </div>
    </header>
  );
}
