import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type ViewingProfile = {
  id: string;
  user_id: string;
  name: string;
  avatar_url: string;
  language: string;
  maturity_rating: "kids" | "teen" | "adult";
  is_kids: boolean;
};

type AuthCtx = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  activeProfile: ViewingProfile | null;
  setActiveProfile: (p: ViewingProfile | null) => void;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

const ACTIVE_KEY = "cv:activeProfileId";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeProfile, setActiveProfileState] = useState<ViewingProfile | null>(null);

  const setActiveProfile = (p: ViewingProfile | null) => {
    setActiveProfileState(p);
    if (p) localStorage.setItem(ACTIVE_KEY, p.id);
    else localStorage.removeItem(ACTIVE_KEY);
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (!s) setActiveProfileState(null);
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  // Restore active profile when user changes
  useEffect(() => {
    if (!user) return;
    const savedId = localStorage.getItem(ACTIVE_KEY);
    if (!savedId) return;
    supabase
      .from("viewing_profiles")
      .select("*")
      .eq("id", savedId)
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setActiveProfileState(data as ViewingProfile);
      });
  }, [user]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setActiveProfile(null);
  };

  return (
    <Ctx.Provider value={{ session, user, loading, activeProfile, setActiveProfile, signOut }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
};
