import { create } from "zustand";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface Audit {
  id: string;
  user_id: string;
  url: string;
  screenshot_url: string;
  overall_score: number;
  status: "pending" | "analyzing" | "completed" | "failed";
  created_at: string;
  updated_at: string;
}

export interface AuditScore {
  id: string;
  audit_id: string;
  ux_score: number;
  accessibility_score: number;
  design_score: number;
  conversion_score: number;
  typography_score: number;
  mobile_score: number;
  trust_score: number;
}

export interface AuditIssue {
  id: string;
  audit_id: string;
  category: "ux" | "ui" | "accessibility" | "conversion" | "visual_hierarchy" | "typography" | "cta";
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  recommendation: string;
  x_percent: number;
  y_percent: number;
}

export interface AuditRecommendation {
  id: string;
  audit_id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  effort: "high" | "medium" | "low";
  category: string;
}

interface AuditState {
  audits: Audit[];
  scores: Record<string, AuditScore>;
  issues: Record<string, AuditIssue[]>;
  recommendations: Record<string, AuditRecommendation[]>;
  isLoading: boolean;
  
  fetchAudits: (userId: string) => Promise<void>;
  getAuditDetails: (auditId: string) => Promise<{
    audit: Audit | null;
    scores: AuditScore | null;
    issues: AuditIssue[];
    recommendations: AuditRecommendation[];
  }>;
  createAudit: (userId: string, url: string, screenshotBase64: string) => Promise<string>;
  saveAuditAnalysis: (
    auditId: string, 
    data: {
      overallScore: number;
      uxScore: number;
      accessibilityScore: number;
      designScore: number;
      conversionScore: number;
      typographyScore: number;
      mobileScore: number;
      trustScore: number;
      issues: Omit<AuditIssue, "id" | "audit_id">[];
      recommendations: Omit<AuditRecommendation, "id" | "audit_id">[];
      status?: "completed" | "failed";
    }
  ) => Promise<void>;
  deleteAudit: (auditId: string) => Promise<void>;
}

// Pre-seeded high quality mock audits for demo sandbox
const getMockSeedData = (userId: string): Audit[] => [
  {
    id: "mock-audit-1",
    user_id: userId,
    url: "https://shop-flow.vercel.app/checkout",
    screenshot_url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80",
    overall_score: 68,
    status: "completed",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-audit-2",
    user_id: userId,
    url: "https://saas-billing.com/pricing",
    screenshot_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    overall_score: 85,
    status: "completed",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-audit-3",
    user_id: userId,
    url: "https://app-auth-demo.xyz/signup",
    screenshot_url: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=800&q=80",
    overall_score: 94,
    status: "completed",
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const mockScores: Record<string, AuditScore> = {
  "mock-audit-1": {
    id: "ms-1",
    audit_id: "mock-audit-1",
    ux_score: 64,
    accessibility_score: 60,
    design_score: 72,
    conversion_score: 65,
    typography_score: 75,
    mobile_score: 70,
    trust_score: 72,
  },
  "mock-audit-2": {
    id: "ms-2",
    audit_id: "mock-audit-2",
    ux_score: 88,
    accessibility_score: 80,
    design_score: 86,
    conversion_score: 82,
    typography_score: 92,
    mobile_score: 85,
    trust_score: 84,
  },
  "mock-audit-3": {
    id: "ms-3",
    audit_id: "mock-audit-3",
    ux_score: 95,
    accessibility_score: 92,
    design_score: 96,
    conversion_score: 90,
    typography_score: 98,
    mobile_score: 95,
    trust_score: 94,
  },
};

const mockIssues: Record<string, AuditIssue[]> = {
  "mock-audit-1": [
    {
      id: "mi-1-1",
      audit_id: "mock-audit-1",
      category: "cta",
      severity: "critical",
      title: "Checkout CTA sits below the fold",
      description: "The primary 'Complete Purchase' button is pushed entirely out of the first view frame on 1080p desktop layouts.",
      recommendation: "Reduce structural margins above the checkout summary table to slide checkout triggers above 700px vertical.",
      x_percent: 78.5,
      y_percent: 88.0,
    },
    {
      id: "mi-1-2",
      audit_id: "mock-audit-1",
      category: "accessibility",
      severity: "critical",
      title: "Low contrast ratio on footer links",
      description: "Footer privacy links measure a contrast ratio of 1.8:1 against the dark background, failing accessibility standards.",
      recommendation: "Change text color from #555555 to #A0A0A0 to satisfy WCAG AA contrast ratio of 4.5:1.",
      x_percent: 50.0,
      y_percent: 94.5,
    },
    {
      id: "mi-1-3",
      audit_id: "mock-audit-1",
      category: "ux",
      severity: "warning",
      title: "Excessive input fields in checkout form",
      description: "Asking for middle names and secondary phone numbers increases checkout friction and form abandonment rates.",
      recommendation: "Move optional fields to a post-purchase account setup step or remove them entirely.",
      x_percent: 25.0,
      y_percent: 45.0,
    },
  ],
  "mock-audit-2": [
    {
      id: "mi-2-1",
      audit_id: "mock-audit-2",
      category: "cta",
      severity: "warning",
      title: "Secondary CTA rivals primary weight",
      description: "The 'Book a Call' outline button uses a thick bright accent that competes visually with the solid 'Sign Up Now' button.",
      recommendation: "Reduce 'Book a Call' to a simple text link with chevron, or dim the border border color to muted grey.",
      x_percent: 54.0,
      y_percent: 28.5,
    },
    {
      id: "mi-2-2",
      audit_id: "mock-audit-2",
      category: "typography",
      severity: "warning",
      title: "Small body text on mobile layout",
      description: "Paragraph fonts wrap tightly and shrink to 11px on responsive viewports, hindering readability.",
      recommendation: "Apply min-width text sizes of 14px to responsive body styles.",
      x_percent: 15.0,
      y_percent: 62.0,
    },
  ],
  "mock-audit-3": [
    {
      id: "mi-3-1",
      audit_id: "mock-audit-3",
      category: "conversion",
      severity: "info",
      title: "Add social proof signals under button",
      description: "The signup screen has high layout scores but lacks immediate reassurance elements like trust badges or developer counts.",
      recommendation: "Include a short line 'Trusted by 5,000+ developers' directly underneath the email field.",
      x_percent: 50.0,
      y_percent: 68.0,
    },
  ],
};

const mockRecommendations: Record<string, AuditRecommendation[]> = {
  "mock-audit-1": [
    {
      id: "mr-1-1",
      audit_id: "mock-audit-1",
      title: "Restructure form input layouts",
      description: "Convert a double-column input grid to a single vertical column structure to reduce layout confusion and form speed completion.",
      impact: "high",
      effort: "medium",
      category: "UX/UI Structure",
    },
    {
      id: "mr-1-2",
      audit_id: "mock-audit-1",
      title: "Apply WCAG contrast checks in build",
      description: "Set up contrast variables in Tailwind configs to lock typography pairings to verified accessible states.",
      impact: "high",
      effort: "low",
      category: "Accessibility",
    },
  ],
  "mock-audit-2": [
    {
      id: "mr-2-1",
      audit_id: "mock-audit-2",
      title: "Establish strong typographic scale",
      description: "Align headers to a strict 1.25x scale to prevent sizing clashes across pricing cells.",
      impact: "medium",
      effort: "low",
      category: "Typography",
    },
  ],
  "mock-audit-3": [
    {
      id: "mr-3-1",
      audit_id: "mock-audit-3",
      title: "Introduce Google OAuth option",
      description: "Providing a single-click auth button reduces signup barriers by 25-40% based on conversion benchmarks.",
      impact: "high",
      effort: "medium",
      category: "Conversion Rate",
    },
  ],
};

export const useAuditStore = create<AuditState>((set, get) => ({
  audits: [],
  scores: {},
  issues: {},
  recommendations: {},
  isLoading: false,

  fetchAudits: async (userId) => {
    set({ isLoading: true });

    if (!isSupabaseConfigured()) {
      // Load mock items
      const mockKey = `auditai_mock_audits_${userId}`;
      let cached = localStorage.getItem(mockKey);
      if (!cached) {
        const seed = getMockSeedData(userId);
        localStorage.setItem(mockKey, JSON.stringify(seed));
        cached = JSON.stringify(seed);
      }
      
      const list = JSON.parse(cached);
      set({ 
        audits: list, 
        isLoading: false,
        scores: { ...mockScores, ...get().scores },
        issues: { ...mockIssues, ...get().issues },
        recommendations: { ...mockRecommendations, ...get().recommendations }
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("audits")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({ audits: data || [] });
    } catch (e) {
      console.error("Error fetching audits:", e);
    } finally {
      set({ isLoading: false });
    }
  },

  getAuditDetails: async (auditId) => {
    // If it's a mock audit or Supabase isn't configured, get from local states
    const isMockAudit = auditId.startsWith("mock-") || !isSupabaseConfigured();

    if (isMockAudit) {
      const audit = get().audits.find((a) => a.id === auditId) || null;
      const score = mockScores[auditId] || get().scores[auditId] || null;
      const iss = mockIssues[auditId] || get().issues[auditId] || [];
      const rec = mockRecommendations[auditId] || get().recommendations[auditId] || [];
      return { audit, scores: score, issues: iss, recommendations: rec };
    }

    try {
      // Fetch Audit
      const { data: audit, error: auditError } = await supabase
        .from("audits")
        .select("*")
        .eq("id", auditId)
        .single();
      
      if (auditError) throw auditError;

      // Fetch Scores
      const { data: scores } = await supabase
        .from("audit_scores")
        .select("*")
        .eq("audit_id", auditId)
        .single();

      // Fetch Issues
      const { data: issues } = await supabase
        .from("audit_issues")
        .select("*")
        .eq("audit_id", auditId);

      // Fetch Recommendations
      const { data: recommendations } = await supabase
        .from("audit_recommendations")
        .select("*")
        .eq("audit_id", auditId);

      return {
        audit,
        scores: scores || null,
        issues: issues || [],
        recommendations: recommendations || [],
      };
    } catch (e) {
      console.error("Error loading audit detail:", e);
      return { audit: null, scores: null, issues: [], recommendations: [] };
    }
  },

  createAudit: async (userId, url, screenshotBase64) => {
    const isMock = !isSupabaseConfigured();
    const newId = isMock ? `mock-audit-${Math.random().toString(36).substring(2, 9)}` : undefined;

    if (isMock) {
      const newAudit: Audit = {
        id: newId!,
        user_id: userId,
        url,
        // In mock mode, we use the base64 string directly for screen preview
        screenshot_url: screenshotBase64,
        overall_score: 0,
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockKey = `auditai_mock_audits_${userId}`;
      const cached = localStorage.getItem(mockKey);
      const currentList: Audit[] = cached ? JSON.parse(cached) : [];
      const updatedList = [newAudit, ...currentList];
      localStorage.setItem(mockKey, JSON.stringify(updatedList));

      // Temporarily write screenshots mock to localStorage
      try {
        localStorage.setItem(`auditai_screenshot_${newId}`, screenshotBase64);
      } catch (e) {
        console.warn("Storage quota full. Screenshot URL fallbacks applied.");
      }

      set((state) => ({ audits: [newAudit, ...state.audits] }));
      return newId!;
    }

    // Supabase Mode
    try {
      // 1. Upload base64 image to Supabase storage bucket `screenshots`
      const buffer = Buffer.from(screenshotBase64.split(",")[1], "base64");
      const fileName = `${userId}/${Date.now()}.png`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("screenshots")
        .upload(fileName, buffer, {
          contentType: "image/png",
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("screenshots")
        .getPublicUrl(fileName);

      // 2. Insert into audits table
      const { data: audit, error: insertError } = await supabase
        .from("audits")
        .insert({
          user_id: userId,
          url,
          screenshot_url: publicUrl,
          status: "pending",
        })
        .select()
        .single();

      if (insertError) throw insertError;
      
      set((state) => ({ audits: [audit, ...state.audits] }));
      return audit.id;
    } catch (e: any) {
      console.error("Failed to insert audit:", e);
      if (e && typeof e === "object") {
        console.error("Database Error Details:", {
          message: e.message || "Unknown error",
          details: e.details || "No details",
          hint: e.hint || "No hint",
          code: e.code || "No code",
        });
      }
      throw new Error(e.message || "Database insert failure.");
    }
  },

  saveAuditAnalysis: async (auditId, data) => {
    const isMockAudit = auditId.startsWith("mock-") || !isSupabaseConfigured();

    if (isMockAudit) {
      // Mock save
      set((state) => {
        const updatedAudits = state.audits.map((a) => {
          if (a.id === auditId) {
            return {
              ...a,
              overall_score: data.overallScore,
              status: data.status || "completed",
              updated_at: new Date().toISOString(),
            };
          }
          return a;
        });

        // Save back list
        const activeUser = state.audits[0]?.user_id || "mock-user-id";
        localStorage.setItem(`auditai_mock_audits_${activeUser}`, JSON.stringify(updatedAudits));

        // Format and append mock items
        const newScoreId = `ms-${Math.random().toString(36).substring(2, 9)}`;
        mockScores[auditId] = {
          id: newScoreId,
          audit_id: auditId,
          ux_score: data.uxScore,
          accessibility_score: data.accessibilityScore,
          design_score: data.designScore,
          conversion_score: data.conversionScore,
          typography_score: data.typographyScore,
          mobile_score: data.mobileScore,
          trust_score: data.trustScore,
        };

        mockIssues[auditId] = data.issues.map((i, idx) => ({
          ...i,
          id: `mi-${auditId}-${idx}`,
          audit_id: auditId,
        })) as AuditIssue[];

        mockRecommendations[auditId] = data.recommendations.map((r, idx) => ({
          ...r,
          id: `mr-${auditId}-${idx}`,
          audit_id: auditId,
        })) as AuditRecommendation[];

        return {
          audits: updatedAudits,
          scores: { ...state.scores, [auditId]: mockScores[auditId] },
          issues: { ...state.issues, [auditId]: mockIssues[auditId] },
          recommendations: { ...state.recommendations, [auditId]: mockRecommendations[auditId] },
        };
      });
      return;
    }

    // Real Supabase save
    try {
      // 1. Update Audit Status & Overall Score
      await supabase
        .from("audits")
        .update({
          overall_score: data.overallScore,
          status: data.status || "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", auditId);

      // 2. Insert Scores
      await supabase.from("audit_scores").insert({
        audit_id: auditId,
        ux_score: data.uxScore,
        accessibility_score: data.accessibilityScore,
        design_score: data.designScore,
        conversion_score: data.conversionScore,
        typography_score: data.typographyScore,
        mobile_score: data.mobileScore,
        trust_score: data.trustScore,
      });

      // 3. Insert Issues
      if (data.issues.length > 0) {
        const issuesToInsert = data.issues.map((iss) => ({
          audit_id: auditId,
          category: iss.category,
          severity: iss.severity,
          title: iss.title,
          description: iss.description,
          recommendation: iss.recommendation,
          x_percent: iss.x_percent,
          y_percent: iss.y_percent,
        }));
        await supabase.from("audit_issues").insert(issuesToInsert);
      }

      // 4. Insert Recommendations
      if (data.recommendations.length > 0) {
        const recsToInsert = data.recommendations.map((rec) => ({
          audit_id: auditId,
          title: rec.title,
          description: rec.description,
          impact: rec.impact,
          effort: rec.effort,
          category: rec.category,
        }));
        await supabase.from("audit_recommendations").insert(recsToInsert);
      }
    } catch (e) {
      console.error("Database save analysis error:", e);
    }
  },

  deleteAudit: async (auditId) => {
    const isMockAudit = auditId.startsWith("mock-") || !isSupabaseConfigured();

    if (isMockAudit) {
      set((state) => {
        const updatedList = state.audits.filter((a) => a.id !== auditId);
        const activeUser = state.audits[0]?.user_id || "mock-user-id";
        localStorage.setItem(`auditai_mock_audits_${activeUser}`, JSON.stringify(updatedList));

        // Clean mock caches
        delete mockScores[auditId];
        delete mockIssues[auditId];
        delete mockRecommendations[auditId];
        localStorage.removeItem(`auditai_screenshot_${auditId}`);

        return { audits: updatedList };
      });
      return;
    }

    try {
      const { error } = await supabase.from("audits").delete().eq("id", auditId);
      if (error) throw error;
      set((state) => ({ audits: state.audits.filter((a) => a.id !== auditId) }));
    } catch (e) {
      console.error("Error deleting audit:", e);
    }
  },
}));
