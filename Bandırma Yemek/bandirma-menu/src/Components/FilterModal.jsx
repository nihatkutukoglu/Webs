
import React from "react";
import {
  Wine,
  Heart,
  CheckCircle2,
  Sunset,
  Users,
  SlidersHorizontal,
  X,
  Check,
  Music,
  BookOpen,
  PartyPopper,
  Armchair,

  Tv,
  Trees,
  Moon,
  Bike,
  Briefcase,
  PawPrint,
  Building2,
  Waves,
  Coffee,
  Car,
  Snowflake,
} from "lucide-react";

// --- Filtreleme Modalı ---
function FilterModal({
  onClose,
  showAlcoholOnly,
  setShowAlcoholOnly,
  showDateSpotOnly,
  setShowDateSpotOnly,
  showBoycottFriendlyOnly,
  setShowBoycottFriendlyOnly,
  showViewOnly,
  setShowViewOnly,
  showFamilyFriendlyOnly,
  setShowFamilyFriendlyOnly,
  showLiveMusicOnly,
  setShowLiveMusicOnly,
  showStudyFriendlyOnly,
  setShowStudyFriendlyOnly,
  showHangoutSpotOnly,
  setShowHangoutSpotOnly,
  showMatchDaySpotOnly,
  setShowMatchDaySpotOnly,
  showCelebrationSpotOnly,
  setShowCelebrationSpotOnly,
  showOutdoorOnly,
  setShowOutdoorOnly,
  showLateNightOnly,
  setShowLateNightOnly,
  showDeliveryOnly,
  setShowDeliveryOnly,
  // Otel Props
  activeAppTab = "food", // Varsayılan değer
  showBeachfrontOnly,
  setShowBeachfrontOnly,
  showPoolOnly,
  setShowPoolOnly,
  showBreakfastIncluded,
  setShowBreakfastIncluded,
  showParkingOnly,
  setShowParkingOnly,
  showACOnly,
  setShowACOnly,
  showPetFriendlyOnly,
  setShowPetFriendlyOnly,
  showBusinessFriendlyOnly,
  setShowBusinessFriendlyOnly,
  showCentralOnly,
  setShowCentralOnly,
}) {
  // Filtre Seçenekleri Verisi
  const allFilters = [
    // --- Food / Genel ---
    {
      id: "alcohol",
      label: "Alkollü Mekan",
      icon: <Wine size={20} className="text-purple-500" />,
      color: "bg-purple-50 text-purple-700",
      state: showAlcoholOnly,
      setState: setShowAlcoholOnly,
      visibleOn: ["food", "events"],
    },
    {
      id: "date",
      label: "Date Mekanı",
      icon: <Heart size={20} className="text-pink-500" />,
      color: "bg-pink-50 text-pink-700",
      state: showDateSpotOnly,
      setState: setShowDateSpotOnly,
      visibleOn: ["food"],
    },
    {
      id: "boycott",
      label: "Boykot Dostu",
      icon: <CheckCircle2 size={20} className="text-green-500" />,
      color: "bg-green-50 text-green-700",
      state: showBoycottFriendlyOnly,
      setState: setShowBoycottFriendlyOnly,
      visibleOn: ["food", "esnaf"],
    },
    {
      id: "view",
      label: "Manzaralı",
      icon: <Sunset size={20} className="text-blue-500" />,
      color: "bg-blue-50 text-blue-700",
      state: showViewOnly,
      setState: setShowViewOnly,
      visibleOn: ["food", "hotel"],
    },
    {
      id: "family",
      label: "Aile Yeri",
      icon: <Users size={20} className="text-orange-500" />,
      color: "bg-orange-50 text-orange-700",
      state: showFamilyFriendlyOnly,
      setState: setShowFamilyFriendlyOnly,
      visibleOn: ["food", "hotel", "travel"],
    },
    {
      id: "liveMusic",
      label: "Canlı Müzik",
      icon: <Music size={20} className="text-red-500" />,
      color: "bg-red-50 text-red-700",
      state: showLiveMusicOnly,
      setState: setShowLiveMusicOnly,
      visibleOn: ["food", "events"],
    },
    {
      id: "study",
      label: "Ders Çalışmaya Uygun",
      icon: <BookOpen size={20} className="text-teal-500" />,
      color: "bg-teal-50 text-teal-700",
      state: showStudyFriendlyOnly,
      setState: setShowStudyFriendlyOnly,
      visibleOn: ["food"],
    },
    {
      id: "hangout",
      label: "Agalarla Oturmalık",
      icon: <Armchair size={20} className="text-indigo-500" />,
      color: "bg-indigo-50 text-indigo-700",
      state: showHangoutSpotOnly,
      setState: setShowHangoutSpotOnly,
      visibleOn: ["food"],
    },
    {
      id: "match",
      label: "Maç İzlemelik",
      icon: <Tv size={20} className="text-green-600" />,
      color: "bg-green-50 text-green-700",
      state: showMatchDaySpotOnly,
      setState: setShowMatchDaySpotOnly,
      visibleOn: ["food"],
    },
    {
      id: "celebration",
      label: "Kutlama Mekanı",
      icon: <PartyPopper size={20} className="text-yellow-500" />,
      color: "bg-yellow-50 text-yellow-700",
      state: showCelebrationSpotOnly,
      setState: setShowCelebrationSpotOnly,
      visibleOn: ["food", "events"],
    },
    {
      id: "outdoor",
      label: "Bahçeli / Açık Alan",
      icon: <Trees size={20} className="text-emerald-500" />,
      color: "bg-emerald-50 text-emerald-700",
      state: showOutdoorOnly,
      setState: setShowOutdoorOnly,
      visibleOn: ["food", "hotel"],
    },
    {
      id: "latenight",
      label: "Gece Açık (Geç Saat)",
      icon: <Moon size={20} className="text-slate-600" />,
      color: "bg-slate-100 text-slate-700",
      state: showLateNightOnly,
      setState: setShowLateNightOnly,
      visibleOn: ["food"],
    },
    {
      id: "delivery",
      label: "Paket Servis Var",
      icon: <Bike size={20} className="text-blue-500" />,
      color: "bg-blue-50 text-blue-700",
      state: showDeliveryOnly,
      setState: setShowDeliveryOnly,
      visibleOn: ["food"],
    },
    // --- Hotel Filtreleri ---
    {
      id: "beachfront",
      label: "Denize Sıfır",
      icon: <Waves size={20} className="text-blue-600" />,
      color: "bg-blue-50 text-blue-700",
      state: showBeachfrontOnly,
      setState: setShowBeachfrontOnly,
      visibleOn: ["hotel"],
    },
    {
      id: "pool",
      label: "Havuzlu",
      icon: <Waves size={20} className="text-cyan-500" />,
      color: "bg-cyan-50 text-cyan-700",
      state: showPoolOnly,
      setState: setShowPoolOnly,
      visibleOn: ["hotel"],
    },
    {
      id: "breakfast",
      label: "Kahvaltı Dahil",
      icon: <Coffee size={20} className="text-orange-500" />,
      color: "bg-orange-50 text-orange-700",
      state: showBreakfastIncluded,
      setState: setShowBreakfastIncluded,
      visibleOn: ["hotel"],
    },
    {
      id: "parking",
      label: "Otopark Var",
      icon: <Car size={20} className="text-slate-600" />,
      color: "bg-slate-100 text-slate-700",
      state: showParkingOnly,
      setState: setShowParkingOnly,
      visibleOn: ["hotel", "food"],
    },
    {
      id: "ac",
      label: "Klimalı",
      icon: <Snowflake size={20} className="text-sky-500" />,
      color: "bg-sky-50 text-sky-700",
      state: showACOnly,
      setState: setShowACOnly,
      visibleOn: ["hotel"],
    },
    {
      id: "pet",
      label: "Evcil Hayvan Dostu",
      icon: <PawPrint size={20} className="text-amber-600" />,
      color: "bg-amber-50 text-amber-700",
      state: showPetFriendlyOnly,
      setState: setShowPetFriendlyOnly,
      visibleOn: ["hotel", "food"],
    },
    {
      id: "business",
      label: "İş Seyahati (Fatura)",
      icon: <Briefcase size={20} className="text-slate-700" />,
      color: "bg-slate-100 text-slate-800",
      state: showBusinessFriendlyOnly,
      setState: setShowBusinessFriendlyOnly,
      visibleOn: ["hotel"],
    },
    {
      id: "central",
      label: "Merkezi Konum",
      icon: <Building2 size={20} className="text-indigo-600" />,
      color: "bg-indigo-50 text-indigo-700",
      state: showCentralOnly,
      setState: setShowCentralOnly,
      visibleOn: ["hotel"],
    },
  ];

  // Aktif Taba Göre Filtrele
  const filters = allFilters.filter(
    (f) => !f.visibleOn || f.visibleOn.includes(activeAppTab),
  );

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl animate-slide-up scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white z-10 pb-4 flex justify-between items-center mb-2 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <SlidersHorizontal size={18} /> Filtrele
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2 pt-2">
          {filters.map((filter) => (
            <div
              key={filter.id}
              onClick={() => filter.setState(!filter.state)}
              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all active:scale-[0.98] ${
                filter.state
                  ? "border-slate-800 bg-slate-50"
                  : "border-slate-100 hover:border-slate-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${filter.color}`}>
                  {filter.icon}
                </div>
                <span
                  className={`font-semibold text-sm ${
                    filter.state ? "text-slate-900" : "text-slate-600"
                  }`}
                >
                  {filter.label}
                </span>
              </div>
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                  filter.state
                    ? "bg-slate-800 border-slate-800"
                    : "border-slate-300"
                }`}
              >
                {filter.state && <Check size={12} className="text-white" />}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all active:scale-[0.98]"
        >
          Sonuçları Göster
        </button>
      </div>
    </div>
  );
}

export default FilterModal;
