import { supabase } from "@/utils/supabase/client";
import { ThemeColors } from "../store/themeSlice";

export interface ThemePreference {
  name: string;
  colors: ThemeColors;
}

export const UserPreferencesService = {
  async saveTheme(userId: string, theme: ThemePreference) {
    const { error } = await supabase.from("user-preferences").upsert(
      {
        id: userId,
        theme: theme,
      },
      { onConflict: "id" }
    );

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }
  },
  async saveFooterProperties(userId: string, footerProperties: any) {
    try {
      const { error } = await supabase.from("user-preferences").upsert(
        {
          id: userId,
          footer_properties: footerProperties,
        },
        { onConflict: "id" }
      );

      if (error) throw error;
    } catch (error) {
      console.error("Error saving footer properties:", error);
      throw error;
    }
  },

  async setStatus(userId: string, status: string) {
    try {
      const { error } = await supabase.from("user-preferences").upsert({
        id: userId,
        status: status,
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error saving status", error);
      throw error;
    }
  },
  async getStatus(userId: string) {
    try {
      const { data, error } = await supabase
        .from("user-preferences")
        .select("status")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;
      return data?.status;
    } catch (error) {
      console.error("error getting status ", error);
      throw error;
    }
  },
  async getFooterProperties(userId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from("user-preferences")
        .select("footer_properties")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;
      return data?.footer_properties || null;
    } catch (error) {
      console.error("Error getting footer properties:", error);
      throw error;
    }
  },

  async getTheme(userId: string): Promise<ThemePreference | null> {
    const { data, error } = await supabase
      .from("user-preferences")
      .select("theme")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }
    return data?.theme || null;
  },
};
