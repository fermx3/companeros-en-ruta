import { redirect } from 'next/navigation';

/**
 * Página raíz que redirige a login para que el usuario se autentique
 * La lógica de redirección por roles se maneja después del login
 */
export default function HomePage() {
  // Redirigir siempre a login para que el sistema maneje la autenticación correctamente
  redirect('/login');
}
