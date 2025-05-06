export type SubscriptionTier = "free" | "standard" | "premium";

export interface SubscriptionLimit {
  maxExports: number;
  maxSlides: number;
  maxVideoDuration: number; // in minutes
  maxAIPresentations: number;
  maxFileSize: number; // in MB
  hasWatermark: boolean;
  hasAvatar: boolean;
  price: number; // in dollars
  avatarVideoDuration: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  tier: SubscriptionTier;
  limits: SubscriptionLimit;
  features: string[];
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for trying out our features",
    tier: "free",
    limits: {
      maxExports: 5,
      maxSlides: 100,
      maxVideoDuration: 5,
      maxAIPresentations: 5,
      maxFileSize: 100, // max file size in MB
      hasWatermark: true,
      hasAvatar: false,
      price: 0,
      avatarVideoDuration: 0,
    },
    features: [
      "5 Exports",
      "8 Slides per presentation",
      "5 AI-generated videos",
      "15MB file upload limit",
      "Basic animations",
      "Watermarked exports",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    description: "Great for regular users",
    tier: "standard",
    limits: {
      maxExports: 100000000,
      maxSlides: 10000000000,
      maxVideoDuration: 10000000000,
      maxAIPresentations: 10000000000,
      maxFileSize: 10000000000,
      hasWatermark: false,
      hasAvatar: true,
      price: 4.99,
      avatarVideoDuration: 100000,
    },
    features: [
      "10 Exports per month",
      "15 Slides per presentation",
      "10-minute Avatar video",
      "10 AI-generated Presentations",
      "25 MB file upload limit",
      "No watermark",
      "Priority support",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    description: "Best for power users",
    tier: "premium",
    limits: {
      maxExports: 100000000,
      maxSlides: 100000000,
      maxVideoDuration: 100000000,
      maxAIPresentations: 100000000,
      maxFileSize: 100000000,
      hasWatermark: false,
      hasAvatar: true,
      price: 50,
      avatarVideoDuration: 100000000,
    },
    features: [
      "25 Exports per month",
      "25 Slides per presentation",
      "25-minute video duration",
      "Avatar support",
      "25 AI-generated Presentations",
      "35 MB file upload limit",
      "No watermark",
      "Priority support",
    ],
  },
];
