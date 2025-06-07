"use client";

import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { signIn, signOut, useSession, SessionProvider } from "next-auth/react";
import { useRouter } from "next/navigation";

type User = {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Update user state when session changes
  useEffect(() => {
    if (status === "loading") {
      setIsLoading(true);
      return;
    }

    if (session?.user) {
      const fetchUserRole = async () => {
        // If the role is missing, fetch it directly
        if (!session.user.role) {
          try {
            const response = await fetch("/api/auth/session");
            const data = await response.json();

            if (data.authenticated && data.user?.role) {
              console.log("Fetched role from API:", data.user.role);
              setUser({
                ...session.user,
                role: data.user.role,
              });
            } else {
              console.log("User authenticated but role not found", data);
              setUser(session.user);
            }
          } catch (error) {
            console.error("Failed to fetch user role:", error);
            setUser(session.user);
          }
        } else {
          setUser(session.user);
        }
        setIsLoading(false);
      };

      fetchUserRole();
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }, [session, status]);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      // Refresh page to update session
      router.refresh();

      // Note: Individual login pages should handle redirects based on user role
      // This is a fallback in case no redirect is explicitly handled
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);

    try {
      await signOut({ redirect: false });

      // Redirect to home page after logout
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up function
  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);

    try {
      // Call the signup API
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Registration failed");
      }

      // Automatically log in after successful registration
      await login(email, password);
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    signup,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthContextProvider>{children}</AuthContextProvider>
    </SessionProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
