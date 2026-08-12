import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Excluye `admin` (y `api`): viven fuera de [locale] y no deben recibir
  // prefijo de idioma. Sin esto, /admin se redirige a /es/admin (inexistente).
  matcher: ["/", "/(es|en)/:path*", "/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
