import { create } from "zustand";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
}

interface AuthState {
  user: UserProfile | null;
  session: any | null;
  isLoading: boolean;
  isMock: boolean;
  initialize: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  loginWithGoogle: () => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isMock: false,

  initialize: async () => {
    set({ isLoading: true });

    if (!isSupabaseConfigured()) {
      // Run in Mock mode
      const mockSession = localStorage.getItem("auditai_mock_session");
      if (mockSession) {
        try {
          const parsed = JSON.parse(mockSession);
          set({
            user: parsed.user,
            session: parsed.session,
            isMock: true,
            isLoading: false,
          });
          return;
        } catch (e) {
          localStorage.removeItem("auditai_mock_session");
        }
      }
      set({ user: null, session: null, isMock: true, isLoading: false });
      return;
    }

    try {
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch profile
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        set({
          session,
          user: profile ? {
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name || "",
            avatar_url: profile.avatar_url || "",
          } : {
            id: session.user.id,
            email: session.user.email || "",
            full_name: session.user.user_metadata?.full_name || "",
            avatar_url: session.user.user_metadata?.avatar_url || "",
          },
          isMock: false,
        });
      } else {
        set({ user: null, session: null, isMock: false });
      }

      // Listen for auth state changes
      supabase.auth.onAuthStateChange(async (event, currentSession) => {
        if (currentSession?.user) {
          // If session exists, load or build user profile
          const { data: profile } = await supabase
            .from("users")
            .select("*")
            .eq("id", currentSession.user.id)
            .single();

          set({
            session: currentSession,
            user: profile ? {
              id: profile.id,
              email: profile.email,
              full_name: profile.full_name || "",
              avatar_url: profile.avatar_url || "",
            } : {
              id: currentSession.user.id,
              email: currentSession.user.email || "",
              full_name: currentSession.user.user_metadata?.full_name || "",
              avatar_url: currentSession.user.user_metadata?.avatar_url || "",
            },
          });
        } else {
          set({ user: null, session: null });
        }
      });
    } catch (error) {
      console.error("Auth initialization error:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async (email, password, fullName) => {
    if (get().isMock) {
      // Mock Sign up
      const mockId = Math.random().toString(36).substring(2, 15);
      const mockUser: UserProfile = {
        id: mockId,
        email,
        full_name: fullName,
        avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(fullName)}`,
      };
      const sessionData = {
        user: mockUser,
        session: { access_token: "mock-jwt-token", expires_in: 3600 },
      };
      localStorage.setItem("auditai_mock_session", JSON.stringify(sessionData));
      
      // Store list of audits mock in local storage
      localStorage.setItem(`auditai_audits_${mockId}`, JSON.stringify([]));

      set({ user: mockUser, session: sessionData.session });
      return { error: null };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(fullName)}`,
          },
        },
      });

      if (error) return { error: error.message };
      return { error: null };
    } catch (e: any) {
      return { error: e.message || "An unexpected error occurred." };
    }
  },

  login: async (email, password) => {
    if (get().isMock) {
      // Mock Login
      const fullName = email.split("@")[0];
      const capitalizedName = fullName.charAt(0).toUpperCase() + fullName.slice(1);
      const mockUser: UserProfile = {
        id: "mock-user-id",
        email,
        full_name: capitalizedName,
        avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(capitalizedName)}`,
      };
      const sessionData = {
        user: mockUser,
        session: { access_token: "mock-jwt-token", expires_in: 3600 },
      };
      localStorage.setItem("auditai_mock_session", JSON.stringify(sessionData));
      
      set({ user: mockUser, session: sessionData.session });
      return { error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error: error.message };
      return { error: null };
    } catch (e: any) {
      return { error: e.message || "An unexpected error occurred." };
    }
  },

  loginWithGoogle: async () => {
    if (get().isMock) {
      // Mock Google Login
      const mockUser: UserProfile = {
        id: "mock-google-user",
        email: "google.user@example.com",
        full_name: "Google Explorer",
        avatar_url: "https://api.dicebear.com/7.x/adventurer/svg?seed=google",
      };
      const sessionData = {
        user: mockUser,
        session: { access_token: "mock-google-jwt-token", expires_in: 3600 },
      };
      localStorage.setItem("auditai_mock_session", JSON.stringify(sessionData));
      set({ user: mockUser, session: sessionData.session });
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) return { error: error.message };
      return { error: null };
    } catch (e: any) {
      return { error: e.message || "An unexpected error occurred." };
    }
  },

  logout: async () => {
    if (get().isMock) {
      localStorage.removeItem("auditai_mock_session");
      set({ user: null, session: null });
      return;
    }

    try {
      await supabase.auth.signOut();
      set({ user: null, session: null });
    } catch (e) {
      console.error("Logout error:", e);
    }
  },
}));
