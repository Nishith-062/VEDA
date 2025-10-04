import { Check, X } from "lucide-react";
import { 
  Headphones, 
  Wifi, 
  Download, 
  Smartphone, 
  Bell, 
  Languages 
} from "lucide-react";

// ✅ Feature Badge (icon + title + subtitle)
const FeatureBadge = ({ icon: Icon, title, subtitle }) => {
  return (
    <div className="flex flex-col items-center text-center bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-4 rounded-2xl shadow-md hover:bg-white/20 transition w-full">
      <Icon className="h-6 w-6 text-blue-300 mb-2" />
      <span className="font-semibold text-sm">{title}</span>
      <p className="text-xs text-white/70 mt-1">{subtitle}</p>
    </div>
  );
};

// ✅ Comparison Table (with short explanations)
export const ComparisonTable = () => {
  const features = [
    { 
      name: "Works on 3G", 
      youtube: { val: false, text: "Video buffers" }, 
      zoom: { val: false, text: "Needs WiFi" }, 
      veda: { val: true, text: "Audio-first (25MB/hr)" } 
    },
    { 
      name: "Offline Access", 
      youtube: { val: false, text: "Premium only" }, 
      zoom: { val: false, text: "Not supported" }, 
      veda: { val: true, text: "Full offline playback" } 
    },
    { 
      name: "Data (1 hr class)", 
      youtube: { val: "~300MB", text: "480p video" }, 
      zoom: { val: "~600MB", text: "HD video" }, 
      veda: { val: "~25MB", text: "Audio Only" } 
    },
    { 
      name: "Regional Language UI", 
      youtube: { val: false, text: "English only" }, 
      zoom: { val: false, text: "English only" }, 
      veda: { val: true, text: "Hindi + local support" } 
    },
  ];

  return (
    <div className="mt-8 bg-white/5 backdrop-blur-md rounded-xl border border-white/20 p-6 shadow-lg animate-fade-in">
      <h3 className="text-lg font-semibold text-white mb-4 text-center">
        Why Choose VEDA? 🚀
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/20 text-white/70">
              <th className="text-left py-2 px-2 font-medium">Feature</th>
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
  const features = [
    { icon: Headphones, title: "Audio First", subtitle: "90% less data than video" },
    { icon: Wifi, title: "Adaptive Bitrate", subtitle: "No buffering on weak networks" },
    { icon: Download, title: "Offline Access", subtitle: "Download once, learn anytime" },
    { icon: Smartphone, title: "PWA Support", subtitle: "Install like an app, no Play Store" },
    { icon: Bell, title: "Push Notifications", subtitle: "Get instant class alerts" },
    { icon: Languages, title: "Hindi UI", subtitle: "Learn in your own language" },
  ];

  return (
    <div className="relative h-full flex flex-col justify-center px-4 sm:px-6 lg:px-12 overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />

      {/* Content */}
      <div className="relative z-10 space-y-12 max-w-4xl mx-auto">
        {/* Headline */}
        <div className="space-y-4 text-center md:text-left animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
            Built for Bharat 🌍
          </h1>
          <p className="text-lg md:text-xl text-white/90 font-medium">
            A lightweight, offline-first classroom platform that works even on 2G.
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
