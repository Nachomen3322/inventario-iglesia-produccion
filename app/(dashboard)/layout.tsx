import Sidebar from "@/components/layout/Sidebar";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import React from "react";
import AutoLogoutProvider from "@/components/providers/AutoLogoutProvider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <AutoLogoutProvider>
      <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
        {/* Sidebar estático a la izquierda */}
        <Sidebar />

        <div className="flex-1 flex flex-col h-full overflow-y-auto relative">
          {children}
        </div>
      </div>
    </AutoLogoutProvider>
  );
}
