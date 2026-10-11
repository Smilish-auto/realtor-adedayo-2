export type VideoSlide = { id: string; videoUrl: string; poster: string; title: string; caption: string };

export type Property = {
  id: string; slug: string; title: string; location: string; city: string; type: "Land" | "House";
  price: number; priceLabel: string; size: string; tag: string; image: string; description: string; status: string;
  developer: string; sellerRole: string; documentation: string; paymentPlan: string; titleType: string; estate: string;
  bedrooms?: number; bathrooms?: number; features: string[]; published: boolean;
};

export type Step = { title: string; text: string };
export type LocationCard = { num: string; title: string; sub: string; cta: string; image: string; city: string };

export type Chatbot = {
  enabled: boolean; webhookUrl: string; title: string; subtitle: string; greeting: string;
  placeholder: string; position: "right" | "left"; offlineMessage: string; launcherLabel: string;
};

export type SiteSettings = {
  brand: { mark: string; name1: string; name2: string; tagline: string; announcement: string };
  seo: { title: string; description: string };
  theme: { navy: string; royal: string; accent: string };
  hero: {
    eyebrow: string; headlinePre: string; headlineEm: string; copy: string; ctaLabel: string; ctaSecondary: string;
    proofTitle: string; proofText: string; autoplaySeconds: number; videos: VideoSlide[];
  };
  search: { kicker: string; title: string; caption: string };
  propertiesSection: {
    kicker: string; title: string; titleEm: string; description: string; helpLink: string; priceCaption: string;
    note: string; modalWarning: string; developerNote: string;
  };
  properties: Property[];
  locations: { kicker: string; title: string; titleEm: string; description: string; items: LocationCard[] };
  process: { kicker: string; title: string; titleEm: string; description: string; cta: string; steps: Step[] };
  diaspora: { kicker: string; title: string; titleEm: string; text: string; cta: string };
  contact: {
    kicker: string; title: string; titleEm: string; text: string; assurance: string; formTitle: string; submitLabel: string;
    successTitle: string; successText: string; consentText: string; legal: string; whatsappNumber: string; whatsappLabel: string;
  };
  footer: { text: string; bottomLeft: string; bottomRight: string };
  // PRIVATE: never sent to the browser
  notifications: { leadEmail: string; fromEmail: string; subjectPrefix: string; leadWebhookUrl: string };
  chatbot: Chatbot;
};

export type PublicSettings = Omit<SiteSettings, "notifications" | "chatbot"> & {
  chatbot: Omit<Chatbot, "webhookUrl">; // `enabled` already means "enabled AND webhook configured"
};

export type Lead = { id: string; name: string; phone: string; email: string; timeline: string; message: string; createdAt: string };
