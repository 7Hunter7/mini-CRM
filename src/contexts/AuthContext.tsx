import { createContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import type { Profile } from "../types/database";
import type { Session } from "@supabase/supabase-js";

export interface AuthContextType {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      setSession(currentSession);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!session?.user) {
      // Используем асинхронный вызов, чтобы не ловить ошибку synchronous setState
      Promise.resolve().then(() => {
        if (cancelled) return;
        setProfile(null);
        setLoading(false);
      });
      return () => {
        cancelled = true;
      };
    }

    supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) console.error("Profile fetch error:", error);
        setProfile((data as Profile) || null);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session]);

  return (
    <AuthContext.Provider value={{ session, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
