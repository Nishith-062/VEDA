import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

// Initialize i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    fallbackLng: "en", // default language
    resources: {
      en: {
        translation: {
          notLoggedIn: "Not Logged In",
          unknownRole: "Unknown role ❌",
          loginFailed: "Login failed ❌",
          educationBg: "Education background",
          vedaTitle: "Virtual Education Delivery Assistant",
          vedaSubtitle:
            "Learn, teach, and collaborate in one seamless platform.",
          welcomeBack: "Welcome Back",
          loginToContinue: "Login to continue to",
          emailPlaceholder: "Email address",
          passwordPlaceholder: "Password",
          login: "Login",
          loggingIn: "Logging in...",
          noAccount: "Don’t have an account?",
          signUp: "Sign up",
          offlineModeBanner: "⚠ Offline Mode: Showing only downloaded videos",
          studentDashboard: "Student Dashboard",
          dashboardSubtitle:
            "Join live classes and access your lecture library",
          liveClass: "Live Class",
          liveClassDescription:
            "Join instantly if your teacher has started a session",
          joinNow: "Join Now",
          downloadedLibrary: "Downloaded Library (Offline)",
          lectureCount: "{{count}} lecture",
          lectureCount_plural: "{{count}} lectures",
          noDownloadedLectures: "No downloaded lectures yet",
          onlineLibrary: "Online Library",
          noOnlineLectures: "📂 No online lectures available",
          watch: "Watch",
          download: "Download",
          downloading: "Downloading...",
          saved: "Saved",
          student: "Student",
          teacher: "Teacher",
          teacherDashboard: "Teacher Dashboard",
          teacherSubtitle:
            "Manage your lectures and host live classes seamlessly",
          uploadLecture: "Upload Lecture",
          uploadLectureDesc: "Add new recorded sessions to your library",
          lectureTitle: "Lecture Title",
          lectureTitlePlaceholder: "Enter lecture title",
          videoFile: "Video File",
          videoSelectPlaceholder: "Click to select or drag & drop your video(only .mp4 Supported)",
          uploadVideo: "Upload Video",
          uploading: "Uploading...",
          startLiveClass: "Start a Live Class",
          startLiveClassDesc:
            "Begin an interactive session that students can instantly join",
          goLiveNow: "Go Live Now",
          selectVideoError: "❌ Please select a video file to upload.",
          uploadSuccess: "✅ Upload successful!",
          uploadFailed: "❌ Upload failed: {{error}}",
          uploadError: "❌ Upload error: {{error}}",
          loginStudentGuest: "Login as Student Guest",
  loginTeacherGuest: "Login as Teacher Guest",
  loginAdminGuest: "Login as Admin Guest",
  loggingIn: "Logging in..."
        },
      },
      hi: {
        translation: {
        "notLoggedIn": "लॉग इन नहीं हुआ",
          unknownRole: "अज्ञात भूमिका ❌",
          loginFailed: "लॉगिन विफल ❌",
          educationBg: "शिक्षा पृष्ठभूमि",
          vedaTitle: "वर्चुअल एजुकेशन डिलीवरी असिस्टेंट",
          vedaSubtitle: "एक ही प्लेटफ़ॉर्म पर सीखें, सिखाएं और सहयोग करें।",
          welcomeBack: "फिर से स्वागत है",
          loginToContinue: "जारी रखने के लिए लॉगिन करें",
          emailPlaceholder: "ईमेल पता",
          passwordPlaceholder: "पासवर्ड",
          login: "लॉगिन",
          loggingIn: "लॉगिन हो रहा है...",
          noAccount: "खाता नहीं है?",
          signUp: "साइन अप",
          offlineModeBanner:
            "⚠ ऑफ़लाइन मोड: केवल डाउनलोड किए गए वीडियो दिखाए जा रहे हैं",
          studentDashboard: "छात्र डैशबोर्ड",
          dashboardSubtitle:
            "लाइव क्लास में शामिल हों और अपने लेक्चर लाइब्रेरी तक पहुँचें",
          liveClass: "लाइव क्लास",
          liveClassDescription:
            "यदि आपके शिक्षक ने सत्र शुरू किया है तो तुरंत शामिल हों",
          joinNow: "अभी शामिल हों",
          downloadedLibrary: "डाउनलोड की गई लाइब्रेरी (ऑफ़लाइन)",
          lectureCount: "{{count}} लेक्चर",
          lectureCount_plural: "{{count}} लेक्चर",
          noDownloadedLectures: "अभी तक कोई डाउनलोड किए गए लेक्चर नहीं हैं",
          onlineLibrary: "ऑनलाइन लाइब्रेरी",
          noOnlineLectures: "📂 कोई ऑनलाइन लेक्चर उपलब्ध नहीं है",
          watch: "देखें",
          download: "डाउनलोड करें",
          downloading: "डाउनलोड हो रहा है...",
          saved: "सहेजा गया",
          student: "छात्र",
          teacher: "शिक्षक",
          teacherDashboard: "शिक्षक डैशबोर्ड",
          teacherSubtitle:
            "अपने लेक्चर प्रबंधित करें और लाइव क्लास आसानी से होस्ट करें",
          uploadLecture: "लेक्चर अपलोड करें",
          uploadLectureDesc: "अपने लाइब्रेरी में नए रिकॉर्ड किए गए सत्र जोड़ें",
          lectureTitle: "लेक्चर का शीर्षक",
          lectureTitlePlaceholder: "लेक्चर का शीर्षक दर्ज करें",
          videoFile: "वीडियो फ़ाइल",
          videoSelectPlaceholder:
            "वीडियो चुनने के लिए क्लिक करें या ड्रैग & ड्रॉप करें (only .mp4 Supported)",
          uploadVideo: "वीडियो अपलोड करें",
          uploading: "अपलोड हो रहा है...",
          startLiveClass: "लाइव क्लास शुरू करें",
          startLiveClassDesc:
            "एक इंटरैक्टिव सत्र शुरू करें जिसमें छात्र तुरंत शामिल हो सकते हैं",
          goLiveNow: "अब लाइव जाएँ",
          selectVideoError: "❌ कृपया अपलोड करने के लिए वीडियो फ़ाइल चुनें।",
          uploadSuccess: "✅ सफलतापूर्वक अपलोड किया गया!",
          uploadFailed: "❌ अपलोड विफल: {{error}}",
          uploadError: "❌ अपलोड त्रुटि: {{error}}",
loginStudentGuest: "स्टूडेंट गेस्ट के रूप में लॉगिन करें",
loginTeacherGuest: "टीचर गेस्ट के रूप में लॉगिन करें",
loginAdminGuest: "एडमिन गेस्ट के रूप में लॉगिन करें",
loggingIn: "लॉगिन हो रहा है..."

        },
      },
    },
    interpolation: {
      escapeValue: false, // React already protects from XSS
    },
  });

export default i18n;
