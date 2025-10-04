import { Check, X } from "lucide-react";
import {
  Headphones,
  Wifi,
  Download,
  Smartphone,
  Bell,
  Languages,
} from "lucide-react";
import { useTranslation } from "react-i18next";

// ✅ Feature Badge
const FeatureBadge = ({ icon: Icon, title, subtitle }) => {
  return (
    <div className="flex flex-col items-center text-center bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-4 rounded-2xl shadow-md hover:bg-white/20 transition w-full">
      <Icon className="h-6 w-6 text-blue-300 mb-2" />
      <span className="font-semibold text-sm">{title}</span>
      <p className="text-xs text-white/70 mt-1">{subtitle}</p>
    </div>
  );
};

// ✅ Comparison Table
export const ComparisonTable = () => {
  const { t } = useTranslation();

  const features = [
    {
      name: t("worksOn3G"),
      youtube: { val: false, text: t("youtubeVideoBuffers") },
      zoom: { val: false, text: t("zoomNeedsWifi") },
      veda: { val: true, text: t("vedaAudioFirst") },
    },
    {
      name: t("offlineAccess"),
      youtube: { val: false, text: t("youtubePremiumOnly") },
      zoom: { val: false, text: t("zoomNotSupported") },
      veda: { val: true, text: t("vedaFullOffline") },
    },
    {
      name: t("data1hr"),
      youtube: { val: "~300MB", text: t("youtube480pVideo") },
      zoom: { val: "~600MB", text: t("zoomHDVideo") },
      veda: { val: "~25MB", text: t("vedaAudioOnly") },
    },
    {
      name: t("regionalLanguageUI"),
      youtube: { val: false, text: t("youtubeEnglishOnly") },
      zoom: { val: false, text: t("zoomEnglishOnly") },
      veda: { val: true, text: t("vedaHindiLocal") },
    },
  ];

  return (
    <div className="mt-8 bg-white/5 backdrop-blur-md rounded-xl border border-white/20 p-6 shadow-lg animate-fade-in">
      <h3 className="text-lg font-semibold text-white mb-4 text-center">
        {t("whyChooseVeda")}
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/20 text-white/70">
              <th className="text-left py-2 px-2 font-medium">{t("feature")}</th>
              <th className="text-center py-2 px-2 font-medium">YouTube</th>
              <th className="text-center py-2 px-2 font-medium">Zoom</th>
              <th className="text-center py-2 px-2 font-bold text-blue-300">VEDA</th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, index) => (
              <tr
                key={index}
                className="border-b border-white/10 last:border-0 hover:bg-white/5 transition-colors"
              >
                <td className="py-3 px-2 text-white font-medium">{feature.name}</td>

                {/* YouTube */}
                <td className="text-center py-3 px-2">
                  {typeof feature.youtube.val === "boolean" ? (
                    feature.youtube.val ? (
                      <Check className="h-5 w-5 text-green-400 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-red-400 mx-auto" />
                    )
                  ) : (
                    <span className="text-white/70">{feature.youtube.val}</span>
                  )}
                  <p className="text-[10px] text-white/50 mt-1">{feature.youtube.text}</p>
                </td>

                {/* Zoom */}
                <td className="text-center py-3 px-2">
                  {typeof feature.zoom.val === "boolean" ? (
                    feature.zoom.val ? (
                      <Check className="h-5 w-5 text-green-400 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-red-400 mx-auto" />
                    )
                  ) : (
                    <span className="text-white/70">{feature.zoom.val}</span>
                  )}
                  <p className="text-[10px] text-white/50 mt-1">{feature.zoom.text}</p>
                </td>

                {/* VEDA */}
                <td className="text-center py-3 px-2 font-semibold text-blue-300">
                  {typeof feature.veda.val === "boolean" ? (
                    feature.veda.val ? (
                      <Check className="h-5 w-5 text-green-400 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-red-400 mx-auto" />
                    )
                  ) : (
                    <span>{feature.veda.val}</span>
                  )}
                  <p className="text-[10px] text-white/70 mt-1">{feature.veda.text}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ✅ Hero Section
export const HeroSection = () => {
  const { t } = useTranslation();

  const features = [
    { icon: Headphones, title: t("audioFirst"), subtitle: t("audioFirstDesc") },
    { icon: Wifi, title: t("adaptiveBitrate"), subtitle: t("adaptiveBitrateDesc") },
    { icon: Download, title: t("offlineAccess"), subtitle: t("offlineAccessDesc") },
    { icon: Smartphone, title: t("pwaSupport"), subtitle: t("pwaSupportDesc") },
    { icon: Bell, title: t("pushNotifications"), subtitle: t("pushNotificationsDesc") },
    { icon: Languages, title: t("hindiUI"), subtitle: t("hindiUIDesc") },
  ];

  return (
    <div className="relative h-full flex flex-col justify-center px-4 py-1 sm:px-6 lg:px-12 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />

      {/* Content */}
      <div className="relative z-10 space-y-12 max-w-4xl mx-auto">
        {/* Headline */}
        <div className="space-y-4 text-center md:text-left animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
            {t("vedaTitle")}
          </h1>
          <p className="text-lg md:text-xl text-white/90 font-medium">
            {t("vedaSubtitle")}
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureBadge
              key={index}
              icon={feature.icon}
              title={feature.title}
              subtitle={feature.subtitle}
            />
          ))}
        </div>

        {/* Comparison Table */}
        <ComparisonTable />
      </div>
    </div>
  );
};
