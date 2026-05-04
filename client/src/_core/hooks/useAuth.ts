import { useCallback, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

// Simulamos un usuario administrador válido para saltarnos OAuth
const mockUser = {
  id: "user_admin",
  name: "Administrador",
  email: "admin@webdisponible.com",
};

export function useAuth(options?: UseAuthOptions) {
  // Siempre devolvemos que los datos ya cargaron correctamente (isLoading: false)
  const meQuery = useMemo(() => ({
    data: mockUser,
    isLoading: false,
    isError: false,
    error: null,
    status: "success" as const,
    refetch: async () => ({ data: mockUser }),
  }), []);

  const logoutMutation = useMemo(() => ({
    mutateAsync: async () => {},
    isLoading: false,
  }), []);

  const logout = useCallback(async () => {
    console.log("Cerrando sesión simulada...");
    window.location.href = "/";
  }, []);

  return {
    user: mockUser,
    isAuthenticated: true, // Esto le dice al frontend que ya estás dentro
    isLoading: false,
    logout,
    logoutMutation,
    meQuery,
  };
}
