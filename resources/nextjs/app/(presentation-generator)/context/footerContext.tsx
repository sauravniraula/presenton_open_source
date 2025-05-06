import React, { createContext, useContext, useState, useEffect } from "react";
import { UserPreferencesService } from "../services/userPreferences";
import { supabase } from "@/utils/supabase/client";

interface FooterProperties {
  logoProperties: {
    showLogo: boolean;
    logoPosition: string;
    opacity: number;
    logoImage: {
      light: string;
      dark: string;
    };
  };
  logoScale: number;
  logoOffset: {
    x: number;
    y: number;
  };
  footerMessage: {
    showMessage: boolean;
    opacity: number;
    fontSize: number;
    message: string;
  };
}

interface FooterContextType {
  footerProperties: FooterProperties;
  setFooterProperties: (
    props: FooterProperties | ((prev: FooterProperties) => FooterProperties)
  ) => void;
  saveFooterProperties: (props: FooterProperties) => void;
  status: string;
}

const FooterContext = createContext<FooterContextType | null>(null);

export const FooterProvider: React.FC<{
  children: React.ReactNode;
  userId: string | null;
}> = ({ children, userId }) => {
  const [status, setStatus] = useState<string>("free");
  const [footerProperties, setFooterProperties] = useState<FooterProperties>({
    logoProperties: {
      showLogo: true,
      logoPosition: "left",
      opacity: 0.8,
      logoImage: {
        light: "",
        dark: "",
      },
    },
    logoScale: 1.0,
    logoOffset: {
      x: 1,
      y: 1,
    },
    footerMessage: {
      showMessage: false,
      opacity: 0.8,
      fontSize: 12,
      message: "",
    },
  });

  useEffect(() => {
    if (!userId) return;
    const statusOperation = async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .in("status", ["trialing", "active"])
        .eq("cancel_at_period_end", [false])
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (data) {
        await UserPreferencesService.setStatus(data.user_id, data.tier);
        setStatus(data.tier);
      }
    };
    statusOperation();
  }, [userId]);

  useEffect(() => {
    const getFooterProperties = async () => {
      if (userId) {
        const [footerData, statusData] = await Promise.all([
          UserPreferencesService.getFooterProperties(userId),
          UserPreferencesService.getStatus(userId),
        ]);

        if (footerData) {
          setFooterProperties(footerData);
        }
        if (statusData) {
          if (!status) {
            setStatus(statusData);
          }
        }
      }
    };
    getFooterProperties();
  }, [userId]);

  const saveFooterProperties = async (props: FooterProperties) => {
    if (userId) {
      await UserPreferencesService.saveFooterProperties(userId, props);
      setFooterProperties(props);
    }
  };

  return (
    <FooterContext.Provider
      value={{
        footerProperties,
        setFooterProperties,
        saveFooterProperties,
        status,
      }}
    >
      {children}
    </FooterContext.Provider>
  );
};

export const useFooter = () => {
  const context = useContext(FooterContext);
  if (!context) {
    throw new Error("useFooter must be used within a FooterProvider");
  }
  return context;
};
