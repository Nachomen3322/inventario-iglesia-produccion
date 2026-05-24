import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login", // Redirige aquí si no hay token válido
  },
});

export const config = {
  matcher: [
    // Protege todo el sistema excepto login, APIs, recursos estáticos y modelos de IA
    "/((?!login|api|_next/static|_next/image|favicon.ico|models).*)",
  ],
};
