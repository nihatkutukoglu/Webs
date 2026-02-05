import React, { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Phone,
  ExternalLink,
  Image as ImageIcon,
  X,
  ChefHat,
  Coffee,
  Pizza,
  Utensils,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Loader2,
  Megaphone,
  Edit3,
  Eye,
  Clock,
  Instagram,
  Star,
  Heart,
  Share2,
  Send,
  Bed,
  Tent,
  Camera,
  Palmtree,
  Wifi,
  Car,
  Snowflake,
  Tv,
  CheckCircle2,
  Trophy,
  Store,
  Scissors,
  Wrench,
  Zap,
  Key,
  Hammer,
  MessageCircle,
  Dices,
  Lightbulb,
  AlignLeft,
} from "lucide-react";

// Firebase Modülleri
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  updateDoc,
  increment,
  getDocs,
  where,
  limit,
  startAfter,
  Timestamp,
} from "firebase/firestore";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { db, auth, appId } from "./firebase";

// --- Akıllı Resim Bileşeni ---
const SmartImage = ({ src, alt, className, fallbackIcon }) => {
  const [imgState, setImgState] = useState("loading");

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
      {imgState === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-400">
          <Loader2 className="animate-spin w-6 h-6" />
        </div>
      )}
      {imgState === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-2 text-center bg-slate-100">
          {fallbackIcon || <ImageIcon size={24} className="mb-1 opacity-50" />}
          <span className="text-xs">Görsel Yüklenemedi</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${imgState === "loaded" ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setImgState("loaded")}
        onError={() => setImgState("error")}
      />
    </div>
  );
};

// --- Yardımcı Fonksiyon: Resim Sıkıştırma (Base64) ---
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800; // Maksimum genişlik 800px
        const scaler = MAX_WIDTH / img.width;

        // Sadece resim büyükse küçült
        const width = scaler < 1 ? MAX_WIDTH : img.width;
        const height = scaler < 1 ? img.height * scaler : img.height;

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // JPEG olarak sıkıştır (0.6 kalite - iyi denge)
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.6);
        resolve(compressedDataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

// --- Bandırmaspor Destek Şeritleri ---
// --- Bandırmaspor Destek Şeridi (Dijital Atkı) ---
const BandirmaSporBanner = () => (
  <div className="w-full h-9 bg-gradient-to-r from-[#6d0c15] via-[#800f1a] to-[#6d0c15] text-white flex items-center justify-center relative overflow-hidden shadow-sm">
    {/* Dekoratif Çizgiler */}
    <div className="absolute left-0 top-0 bottom-0 w-4 bg-white/10 -skew-x-12 transform -translate-x-2"></div>
    <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/10 -skew-x-12 transform translate-x-2"></div>

    {/* İçerik */}
    <div className="flex items-center gap-3 animate-pulse-slow">
      <img
        src="/bandirmaspor.png"
        className="h-6 w-auto drop-shadow-md"
        alt="Bandırmaspor"
      />
      <span className="text-[10px] md:text-xs font-black tracking-[0.2em] uppercase drop-shadow-sm select-none">
        Şehrin Gururu <span className="text-white/80">BANDIRMASPOR</span>
      </span>
      <img
        src="/bandirmaspor.png"
        className="h-6 w-auto drop-shadow-md"
        alt="Bandırmaspor"
      />
    </div>
  </div>
);

// --- Gezi Verileri (Seed Data) ---
const GEZI_DATA = [
  {
    name: "Atatürk Parkı",
    type: "travel",
    category: "Park",
    description:
      "Bandırma'nın kalbinde, limanın hemen yanı başında yer alan bu devasa park, şehrin en önemli nefes alma noktalarından biridir. 1930'lu yıllarda Atatürk'ün talimatıyla eski bir mezarlık alanının dönüştürülmesiyle oluşturulmuştur. 3.5 dönümlük yapay göleti, gölet kenarında keyifli vakit geçirebileceğiniz çay bahçeleri, çocuk oyun alanları ve konser etkinliklerine ev sahipliği yapan amfisiyle hem gündüz hem gece yaşayan bir merkezdir. Özellikle gün batımında Bandırma Körfezi manzarası büyüleyicidir.",
    entryFee: "Ücretsiz",
    localTip:
      "Akşam saatlerinde ışıklandırmalarla gölet manzarası çok daha etkileyici oluyor, fotoğraf makinenizi unutmayın.",
    venueImageUrl:
      "https://images.unsplash.com/photo-1596326233512-42da6b00c62e?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Malta Parkı",
    type: "travel",
    category: "Park",
    description:
      "Bandırma'nın 100 dönümlük devasa yaşam kompleksi. Malta Deresi Vadisi'nde konumlanan bu park, sadece bir yeşil alan değil, aynı zamanda bir sosyal yaşam merkezidir. İçerisinde yürüyüş ve bisiklet parkurları, biyolojik göletler, seyir terasları ve amfi tiyatro bulunur. Şehrin gürültüsünden uzaklaşmak isteyenler için doğayla iç içe, huzurlu bir kaçış noktasıdır.",
    entryFee: "Ücretsiz",
    localTip:
      "Parkur oldukça uzun, rahat yürüyüş ayakkabılarınızı giyin ve temiz havanın tadını çıkarın.",
    venueImageUrl: "/malta-parki.jpg",
  },
  {
    name: "General Balcı Çamlığı",
    type: "travel",
    category: "Park",
    description:
      "Paşakonak Mahallesi'nde yer alan ve eskiden askeri alan olan bu çamlık, şimdi halka açık bir oksijen deposu. Yüksek çam ağaçlarının gölgesinde serinleyebileceğiniz, tartan pistinde koşu ve yürüyüş yapabileceğiniz harika bir rekreasyon alanı. İçerisindeki spor sahaları (tenis, basketbol) ve çocuk parklarıyla her yaştan ziyaretçiye hitap ediyor. Şehir içinde orman havası almak isteyenler için birebir.",
    entryFee: "Ücretsiz",
    localTip:
      "Sabah erken saatlerde gelirseniz, çam kokusu eşliğinde spor yapan yerlilere katılabilirsiniz.",
    venueImageUrl: "/general-balci.png",
  },
  {
    name: "Dutlimanı Sahili",
    type: "travel",
    category: "Sahil",
    description:
      "Merkeze yaklaşık 8 km mesafede, adını bir zamanlar kıyısındaki dut ağaçlarından alan sakin bir balıkçı köyü sahili. Marmara Denizi'nin en temiz kıyılarından birine sahip olan Dutliman, özellikle gün batımı manzarası ve sakinliğiyle bilinir. Kalabalıktan uzak, denizin ve sessizliğin tadını çıkarmak, piknik yapmak veya sadece kafa dinlemek isteyenler için gizli bir cennet.",
    entryFee: "Ücretsiz",
    localTip:
      "Yanınızda kamp sandalyenizi ve termosta çayınızı götürün, gün batımını buradan izlemek bir terapi gibidir.",
    venueImageUrl: "/dutliman.png",
  },
  {
    name: "Livatya Sahili",
    type: "travel",
    category: "Sahil",
    description:
      "Bandırma'nın popüler sahil yürüyüş rotalarından biri. Yürüyüş yolları, oturma alanları ve deniz kenarındaki dinlenme noktalarıyla hem spor yapanların hem de deniz havası almak isteyenlerin uğrak yeri. Yakın çevresindeki market ve kafeler sayesinde ihtiyaçlarınızı kolayca karşılayabilir, deniz kenarında keyifli bir mola verebilirsiniz.",
    entryFee: "Ücretsiz",
    localTip:
      "Rüzgarlı havalarda dalgaların sesi eşliğinde yürüyüş yapmak çok dinlendiricidir.",
    venueImageUrl: "/livatya.png",
  },
  {
    name: "Aşk Köprüsü",
    type: "travel",
    category: "Sahil",
    description:
      "Bandırma sahil bandında denize doğru uzanan, kırmızı korkuluklarıyla ikonikleşmiş bir yürüyüş yolu ve mendirek. Çiftlerin üzerine kilit asarak aşklarını ölümsüzleştirdikleri bu köprü, 'Aşk Köprüsü' olarak anılır. İstanbul Boğaz Köprüsü'nü andıran mimarisiyle turistlerin fotoğraf çektirmek için sıraya girdiği, denizin ortasında yürüyor hissi veren romantik bir durak.",
    entryFee: "Ücretsiz",
    localTip:
      "En güzel fotoğraflar köprünün en ucunda, arkanızda uçsuz bucaksız deniz ve Bandırma silueti varken çekilir.",
    venueImageUrl: "/ask-koprusu.png",
  },
  {
    name: "Son Kurşun Anıtı",
    type: "travel",
    category: "Tarihi",
    description:
      "Kurtuluş Savaşı'nın son çatışmalarının yaşandığı ve zaferin kesinleştiği Ayyıldız Tepe'de yükselen gurur abidesi. 17 Eylül 1922'de düşmana atılan son kurşunun ve bu uğurda şehit düşen kahramanların anısına dikilmiştir. 25 metre yüksekliğindeki anıt, çatılmış silahları andıran formuyla zaferi ve barışı simgeler. Tepeden tüm Bandırma ve körfez manzarası ayaklarınızın altındadır.",
    entryFee: "Ücretsiz",
    localTip:
      "Anıta çıkarken yokuşu göze alın; zirvedeki panoramik Bandırma manzarası ve manevi atmosfer buna fazlasıyla değer.",
    venueImageUrl: "/son-kursun.jpg",
  },
  {
    name: "Edincik Tarihi Evleri",
    type: "travel",
    category: "Tarihi",
    description:
      "Bandırma'ya 8 km uzaklıktaki Edincik, Osmanlı sivil mimarisinin en güzel örneklerini barındıran yaşayan bir tarih müzesidir. Arnavut kaldırımlı dar sokakları, cumbalı, renkli ahşap evleri ve tarihi çınarlarıyla sizi 19. yüzyıla götürür. Fotoğraf tutkunları için her köşesi ayrı bir kare sunan bu belde, aynı zamanda zeytinciliği ile meşhurdur.",
    entryFee: "Ücretsiz",
    localTip:
      "Sokakları gezdikten sonra köy meydanındaki kahvelerde bir çay için ve yerlilerle sohbet edin. Edincik mantısı bulursanız mutlaka deneyin.",
    venueImageUrl: "/edincik.png",
  },
  {
    name: "Bandırma Arkeoloji Müzesi",
    type: "travel",
    category: "Müze",
    description:
      "Bölgenin zengin tarihine ışık tutan hazine sandığı. Kyzikos Antik Kenti ve Daskyleion Ören Yeri kazılarından çıkarılan paha biçilemez eserlere ev sahipliği yapar. Pers ve Roma dönemlerine ait heykeller, mezar stelleri, takılar ve seramikler burada sergilenir. Müze bahçesindeki açık hava sergisi de en az içerisi kadar etkileyicidir.",
    entryFee: "Ücretsiz",
    localTip:
      "Pazartesi günleri kapalıdır. Özellikle Daskyleion'dan çıkan Pers dönemi kabartmaları dünyada eşsizdir, kaçırmayın.",
    venueImageUrl: "/arkeoloji-muzesi.png",
  },
  {
    name: "Manyas Kuş Cenneti",
    type: "travel",
    category: "Park",
    description:
      "Dünya çapında üne sahip, 'A Sınıfı Avrupa Diploması' ödüllü bir doğa harikası. Afrika'dan Avrupa ve Asya'ya göç eden milyonlarca kuşun mola ve üreme noktasıdır. Tepeli pelikanlar, karabataklar, kaşıkçılar ve balıkçıllar gibi 266 farklı kuş türüne ev sahipliği yapar. Milli park içindeki gözetleme kulesinden kuşların doğal yaşamını dürbünle izlemek, doğa severler için unutulmaz bir deneyimdir.",
    entryFee: "Ücretli",
    localTip:
      "En yoğun kuş popülasyonunu görmek için Nisan-Mayıs aylarını tercih edin. Yanınızda mutlaka dürbün getirin.",
    venueImageUrl: "/manyas.png",
  },
  {
    name: "Kyzikos Antik Kenti",
    type: "travel",
    category: "Tarihi",
    description:
      "Kapıdağ Yarımadası'nın kıstağında yer alan, antik dünyanın en önemli metropollerinden biri. Bir zamanlar 'Dünyanın 8. Harikası' olarak aday gösterilen devasa Hadrian Tapınağı'nın kalıntılarına ev sahipliği yapar. Roma döneminde sanat, kültür ve mimaride zirveye ulaşmış bu kentin amfitiyatrosu, sütun başlıkları ve tapınak temelleri, geçmişin ihtişamını fısıldar.",
    entryFee: "Ücretsiz",
    localTip:
      "Kalıntılar geniş bir alana yayılmış durumda, rahat ayakkabılar giyin. Özellikle Hadrian Tapınağı'nın devasa sütun parçaları şaşırtıcı büyüklükte.",
    venueImageUrl: "/kyzikos.jpg",
  },
  {
    name: "Daskyleion Ören Yeri",
    type: "travel",
    category: "Tarihi",
    description:
      "Manyas Gölü kıyısındaki Ergili Köyü yakınlarında bulunan, Anadolu'daki Pers hakimiyetinin en önemli merkezlerinden biri. MÖ 5. yüzyılda Pers Satraplık (Valilik) merkezi olan bu antik kent, hem Frig hem Lidya izlerini taşır. Dünyada Zerdüşt tapınağının bulunduğu ender yerlerden biridir. Kazılarda bulunan Pers ve Frig yazıtları, tarihe ışık tutmaktadır.",
    entryFee: "Ücretli",
    localTip:
      "Tarihe ilginiz varsa burası bir açık hava okulu gibidir. Göl manzarası eşliğinde antik kenti gezmek ayrı bir keyif.",
    venueImageUrl: "/daskyleion.png",
  },
];

const TravelFeedItem = ({
  venue,
  isAdmin,
  handleEdit,
  handleDelete,
  handleVenueClick,
  favorites,
  toggleFavorite,
  toggleLike,
}) => {
  return (
    <div
      onClick={() => handleVenueClick(venue)}
      className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 mb-6 group cursor-pointer active:scale-[0.99] transition-transform"
    >
      {/* Büyük Görsel */}
      <div className="relative h-64 w-full">
        <SmartImage
          src={venue.venueImageUrl}
          className="w-full h-full object-cover"
          alt={venue.name}
          fallbackIcon={<Palmtree size={48} className="text-slate-300" />}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>

        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={(e) => toggleFavorite(e, venue.id)}
            className={`p-2 rounded-full backdrop-blur-md transition-all shadow-lg ${favorites.includes(venue.id) ? "bg-red-500/90 text-white" : "bg-white/30 text-white hover:bg-white/50"}`}
          >
            <Heart
              size={20}
              fill={favorites.includes(venue.id) ? "currentColor" : "none"}
            />
          </button>
        </div>

        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wide">
              {venue.category}
            </span>
            {venue.entryFee && (
              <span className="bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded border border-white/20">
                {venue.entryFee}
              </span>
            )}
          </div>
          <h3 className="text-2xl font-bold leading-tight shadow-black drop-shadow-md">
            {venue.name}
          </h3>
          {venue.localTip && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-orange-200 mt-1">
              <Star size={12} className="fill-orange-200" />
              <span>{venue.localTip}</span>
            </div>
          )}
        </div>
      </div>

      {/* İçerik Kısmı */}
      <div className="p-5">
        <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-4">
          {venue.description || "Bu mekan için henüz açıklama girilmemiş."}
        </p>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          {/* Konum Butonu */}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.name + " Bandırma")}`}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-blue-600 font-bold text-sm hover:underline"
          >
            <MapPin size={16} /> Haritada Gör
          </a>

          <div className="flex items-center gap-3 text-slate-400 text-sm">
            <div className="flex items-center gap-1">
              <Eye size={16} /> {venue.viewCount || 0}
            </div>
            {isAdmin && (
              <div className="flex gap-2 border-l border-slate-200 pl-3">
                <button
                  onClick={(e) => handleEdit(e, venue)}
                  className="text-slate-400 hover:text-blue-500"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={(e) => handleDelete(e, venue.id)}
                  className="text-slate-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Ana Uygulama Bileşeni ---
export default function BandırmaMenuApp() {
  const [user, setUser] = useState(null);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [venueToEdit, setVenueToEdit] = useState(null);

  const [activeAppTab, setActiveAppTab] = useState("food"); // 'food' | 'hotel' | 'travel'
  const [showOpenOnly, setShowOpenOnly] = useState(false);

  // --- Yardımcı: Mekan Açık mı? ---
  const isVenueOpen = (v) => {
    if (!v.openingTime || !v.closingTime) return true; // Belirtilmemişse varsayılan açık say

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [openH, openM] = v.openingTime.split(":").map(Number);
    const [closeH, closeM] = v.closingTime.split(":").map(Number);

    let start = openH * 60 + openM;
    let end = closeH * 60 + closeM;

    // Eğer kapanış saati açılıştan küçükse (Örn: 10:00 - 02:00), kapanışı ertesi güne taşı (+24 saat)
    if (end < start) end += 24 * 60;

    // Eğer şu anki saat açılıştan küçükse (Örn: Saat 01:00 ve mekan 10:00'da açılıyor),
    // ama mekan gece yarısını geçip kapanıyorsa (Kapanış > 24*60),
    // o zaman şu anki saati de "gece yarısından sonraki saat" olarak düşün (+24 saat)
    let checkTime = currentMinutes;

    // Örnek Senaryo: Saat 01:00 (60 dk). Mekan 10:00-02:00 açık.
    // start=600, end=1560 (02:00 + 24h).
    // Normalde 60, 600-1560 aralığında değil.
    // Ama 60 < 600 olduğu için, checkTime'a 24 saat ekle -> 1500.
    // Şimdi 1500, 600-1560 aralığında mı? EVET.
    if (end >= 24 * 60 && checkTime < start) {
      checkTime += 24 * 60;
    }

    return checkTime >= start && checkTime < end;
  };

  // --- Yardımcı: Rastgele Mekan Seç (Ne Yesem?) ---
  const handleRandomPick = () => {
    if (filteredVenues.length === 0) return alert("Listede hiç mekan yok!");

    // Hafif bir animasyon efekti için loading
    setLoading(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * filteredVenues.length);
      const randomVenue = filteredVenues[randomIndex];
      setSelectedVenue(randomVenue);
      setLoading(false);
      // İsteğe bağlı: Konfetili bir alert veya modal başlığı
    }, 800);
  };

  // Kategori Listeleri
  const CATEGORY_DATA = {
    food: ["Tümü", "Restoran", "Kafe", "Fast Food", "Tatlı", "Bar", "Meyhane"],
    hotel: ["Tümü", "Otel", "Apart", "Pansiyon", "Kamp Alanı"],
    travel: ["Tümü", "Park", "Müze", "Tarihi", "Sahil", "Eğlence"],
    esnaf: [
      "Tümü",
      "Berber",
      "Kuaför",
      "Kasap",
      "Manav",
      "Tesisatçı",
      "Elektrikçi",
      "Çilingir",
      "Terzi",
      "Kırtasiye",
      "Çiçekçi",
      "Nakliye",
    ],
    events: [
      "Tümü",
      "Konser",
      "Parti",
      "Tiyatro",
      "Stand-up",
      "Festival",
      "Atölye",
    ],
  };

  const currentCategories = CATEGORY_DATA[activeAppTab];

  // Yönetici Kontrolü: Kullanıcı var mı VE Anonim değil mi?
  const isAdmin = user && !user.isAnonymous;

  // --- Auth ve Veri ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Giriş hatası:", error);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // --- GELİŞMİŞ VERİ ÇEKME (Performans & Kota Dostu) ---
  const fetchVenues = async (isLoadMore = false) => {
    if (!user) return;

    // Eğer yeni bir tab/sekme yüklüyorsak ve arama yapmıyorsak önbelleğe bak
    if (!isLoadMore) {
      setHasMore(true);
      setLastDoc(null);

      // Cache Kontrolü (1 Saatlik Önbellek)
      const cacheKey = `bandirma_venues_v2_${activeAppTab}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < 1000 * 60 * 60) {
            // 1 saat
            setVenues(data);
            setLoading(false);
            console.log("Veriler önbellekten yüklendi ⚡");
            return;
          }
        } catch (e) {
          localStorage.removeItem(cacheKey);
        }
      }
      setLoading(true);
      setVenues([]);
    } else {
      setLoadingMore(true);
    }

    try {
      // Query Oluşturma
      const constraints = [
        where("type", "==", activeAppTab),
        // orderBy("createdAt", "desc"), // Index hatası verileri gizlediği için geçici olarak kapattık
        limit(20),
      ];

      if (isLoadMore && lastDoc) {
        constraints.push(startAfter(lastDoc));
      }

      const q = query(
        collection(db, "artifacts", appId, "public", "data", "venues"),
        ...constraints,
      );

      const snapshot = await getDocs(q);
      const newVenues = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // State Güncelleme (Deduplication / Çift Kayıt Önleme)
      if (isLoadMore) {
        setVenues((prev) => {
          const existingIds = new Set(prev.map((v) => v.id));
          const filteredNew = newVenues.filter((v) => !existingIds.has(v.id));
          return [...prev, ...filteredNew];
        });
      } else {
        setVenues(newVenues);
        // Cache Güncelle
        localStorage.setItem(
          `bandirma_venues_v2_${activeAppTab}`,
          JSON.stringify({
            data: newVenues,
            timestamp: Date.now(),
          }),
        );
      }

      // Pagination Takibi
      if (snapshot.docs.length > 0) {
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      }

      // Eğer gelen veri 20'den azsa, listenin sonuna geldik demektir.
      if (snapshot.docs.length < 20) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Veri çekme hatası:", error);
      // Index hatası varsa kullanıcıyı uyaralım (geçici çözüm)
      if (error.code === "failed-precondition") {
        console.warn(
          "Lütfen Firebase Konsolunda Index oluşturun. Hata detayındaki linki kullanın.",
        );
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Sekme değişince verileri çek
  useEffect(() => {
    fetchVenues(false);
  }, [user, activeAppTab]);

  // --- Veri Tabanı Onarım (Admin) ---
  const fixDatabase = async () => {
    if (
      !confirm(
        "Tüm mekanlar taranıp kategorilerine göre türleri (food/hotel/travel) düzeltilecek. Bu işlem yanlış yerde çıkan mekanları düzeltir. Onaylıyor musunuz?",
      )
    )
      return;

    setLoading(true);
    try {
      const q = query(
        collection(db, "artifacts", appId, "public", "data", "venues"),
      );
      const snapshot = await getDocs(q);

      let updatedCount = 0;
      const updatePromises = snapshot.docs.map(async (docSnap) => {
        const v = docSnap.data();

        let correctType = "food"; // Varsayılan

        // Kategorisine bakarak doğru tipini bul
        if (["Otel", "Apart", "Pansiyon", "Kamp Alanı"].includes(v.category))
          correctType = "hotel";
        else if (
          ["Park", "Müze", "Tarihi", "Sahil", "Eğlence"].includes(v.category)
        )
          correctType = "travel";
        else if (
          [
            "Berber",
            "Kuaför",
            "Kasap",
            "Manav",
            "Tesisatçı",
            "Elektrikçi",
            "Çilingir",
            "Terzi",
            "Kırtasiye",
            "Çiçekçi",
            "Nakliye",
          ].includes(v.category)
        )
          correctType = "esnaf";
        else if (
          [
            "Konser",
            "Parti",
            "Tiyatro",
            "Stand-up",
            "Festival",
            "Atölye",
          ].includes(v.category)
        )
          correctType = "events";

        // Eğer mevcut type yanlışsa güncelle
        if (v.type !== correctType) {
          updatedCount++;
          await updateDoc(
            doc(db, "artifacts", appId, "public", "data", "venues", docSnap.id),
            { type: correctType },
          );
        }
      });

      await Promise.all(updatePromises);

      // Tüm cache'leri temizle
      localStorage.clear();

      alert(
        `${updatedCount} mekanın türü düzeltildi! ✅\nSayfa yenileniyor...`,
      );
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Hata: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Tüm Puan ve Yorumları Sıfırlama (Admin) ---
  const wipeData = async () => {
    if (
      !confirm(
        "DİKKAT! 🚨\n\nBu işlem:\n1. Tüm mekanların puanlarını (rating) sıfırlar.\n2. Veritabanındaki yorumları de-aktif eder (görünmez yapar veya siler).\n3. LocalStorage'daki fake yorumları siler.\n\nBu işlem geri alınamaz! Emin misiniz?",
      )
    )
      return;

    setLoading(true);
    try {
      // 1. Mekan Puanlarını Sıfırla
      const venueQ = query(
        collection(db, "artifacts", appId, "public", "data", "venues"),
      );
      const venueSnap = await getDocs(venueQ);

      const resetPromises = venueSnap.docs.map((d) =>
        updateDoc(
          doc(db, "artifacts", appId, "public", "data", "venues", d.id),
          {
            ratingTotal: 0,
            ratingCount: 0,
          },
        ),
      );
      await Promise.all(resetPromises);

      // 2. Yorumları Temizle (Büyük bir koleksiyonu silmek client-side zordur, o yüzden kısa yoldan 'comments' koleksiyonunu boşaltmaya çalışalım)
      // Not: Gerçek silme işlemi için cloud function gerekir ama burada client-side döngü ile yapacağız (az veri olduğu varsayımıyla)
      const commentQ = query(
        collection(db, "artifacts", appId, "public", "data", "comments"),
      );
      const commentSnap = await getDocs(commentQ);
      const deletePromises = commentSnap.docs.map((d) => deleteDoc(d.ref));
      await Promise.all(deletePromises);

      // 3. Yerel Veriyi Sil
      localStorage.clear();

      alert(
        "Temizlik Tamamlandı! 🧹\nTüm puanlar 0landı ve yorumlar silindi.\nSayfa yenileniyor...",
      );
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Hata: " + e.message);
      setLoading(false);
    }
  };

  // --- Favori Yönetimi (LocalStorage) ---
  const [favorites, setFavorites] = useState([]);
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("favorites") || "[]");
    setFavorites(saved);
  }, []);

  const toggleFavorite = (e, venueId) => {
    e.stopPropagation();
    let newFavs;
    if (favorites.includes(venueId)) {
      newFavs = favorites.filter((id) => id !== venueId);
    } else {
      newFavs = [...favorites, venueId];
    }
    setFavorites(newFavs);
    localStorage.setItem("favorites", JSON.stringify(newFavs));
  };

  const handleShare = async (venue) => {
    const shareData = {
      title: venue.name,
      text: `${venue.name} - Bandırma Menü'de incele!`,
      url: window.location.href, // Gerçekte deep link olabilir
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        alert("Panoya kopyalandı!");
      }
    } catch (err) {}
  };

  // --- İş Mantığı ---
  const isImageUrl = (url) => {
    if (!url) return false;
    if (url.startsWith("data:image")) return true;
    return url.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i) != null;
  };

  const getOpenStatus = (openTime, closeTime) => {
    if (!openTime || !closeTime) return null;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [openH, openM] = openTime.split(":").map(Number);
    const [closeH, closeM] = closeTime.split(":").map(Number);

    let start = openH * 60 + openM;
    let end = closeH * 60 + closeM;

    // Gece yarısını geçiyorsa (örn: 10:00 - 02:00)
    if (end < start) end += 24 * 60;

    // Şu anki saat gece yarısından sonraysa ve kapanış ertesi günse (örn 01:00 ise ve yer 02:00'de kapanıyorsa)
    let current = currentMinutes;
    if (current < start && end > 24 * 60) current += 24 * 60;

    const isOpen = current >= start && current < end;
    return {
      isOpen,
      text: isOpen ? "AÇIK" : "KAPALI",
      color: isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700",
    };
  };

  const handleVenueClick = async (venue) => {
    setSelectedVenue(venue);
    try {
      if (user) {
        const ref = doc(
          db,
          "artifacts",
          appId,
          "public",
          "data",
          "venues",
          venue.id,
        );
        updateDoc(ref, { viewCount: increment(1) }).catch((e) =>
          console.log("Analitik hatası:", e),
        );
      }
    } catch (e) {}
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Silmek istediğinize emin misiniz?")) return;

    try {
      await deleteDoc(
        doc(db, "artifacts", appId, "public", "data", "venues", id),
      );

      // 1. UI'dan sil
      setVenues((prev) => {
        const newVal = prev.filter((v) => v.id !== id);

        // 2. Cache'den de sil (Yoksa yenileyince geri gelir!)
        const cacheKey = `bandirma_venues_v2_${activeAppTab}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          parsed.data = newVal; // Cache'deki veriyi güncelle
          localStorage.setItem(cacheKey, JSON.stringify(parsed));
        }

        return newVal;
      });
    } catch (error) {
      console.error("Silme hatası:", error);
      alert("Silinemedi: " + error.message);
    }
  };

  const handleEdit = (e, venue) => {
    e.stopPropagation();
    setVenueToEdit(venue);
    setShowAddModal(true);
  };

  const seedGeziData = async () => {
    if (
      !confirm(
        "Mevcut gezi verileri silinip yenileri yüklenecek. Onaylıyor musunuz?",
      )
    )
      return;
    try {
      setLoading(true);

      // 1. Önce mevcut 'travel' tipindeki verileri bul ve sil
      const q = query(
        collection(db, "artifacts", appId, "public", "data", "venues"),
        where("type", "==", "travel"),
      );
      const querySnapshot = await getDocs(q);

      const deletePromises = querySnapshot.docs.map((doc) =>
        deleteDoc(doc.ref),
      );
      await Promise.all(deletePromises);
      console.log(`${deletePromises.length} eski gezi kaydı silindi.`);

      // 2. Yeni verileri ekle
      const batchPromises = GEZI_DATA.map((data) => {
        return addDoc(
          collection(db, "artifacts", appId, "public", "data", "venues"),
          {
            ...data,
            createdAt: serverTimestamp(),
            viewCount: 0,
            ratingTotal: 0,
            ratingCount: 0,
          },
        );
      });
      await Promise.all(batchPromises);

      // State'i güncellemek için sayfayı yenilemeye gerek yok, onSnapshot zaten dinliyor ama biz yine de loading'i kapatalım
      alert(
        "Tüm gezi verileri başarıyla güncellendi! 🌴\nSayfa yenileniyor...",
      );
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Hata: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const addSpecificCoffeeShops = async () => {
    if (!confirm("Tönas, Green Pub ve Öztaylan eklenecek. Onaylıyor musunuz?"))
      return;
    setLoading(true);
    try {
      const SHOPS = [
        {
          name: "TÖNAS PASTANE + CAFE",
          type: "food",
          category: "Tatlı",
          description:
            "Bandırma'nın köklü pastanelerinden. Özel gün pastaları, taze kurabiyeler ve kahvaltı seçenekleriyle meşhur.",
          address: "Paşakent, Bandırma", // Tam adres eklenebilir
          venueImageUrl:
            "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800",
          menuLink: "https://menu.tonas.com.tr/",
          ratingTotal: 45,
          ratingCount: 10,
        },
        {
          name: "Green Pub",
          type: "food",
          category: "Bar",
          description:
            "Canlı müzik performansları, zengin içecek menüsü ve atıştırmalıklarıyla Bandırma gece hayatının nabzını tutan mekan.",
          address: "Bandırma Sahil",
          venueImageUrl:
            "https://images.unsplash.com/photo-1514362545857-3bc16549766b?auto=format&fit=crop&q=80&w=800",
          menuLink: "https://www.menuongo.com/qr-menu/green-pub",
          ratingTotal: 46,
          ratingCount: 15,
        },
        {
          name: "Öztaylan Sütevi",
          type: "food",
          category: "Tatlı",
          description:
            "Bandırma denince akla gelen ilk tatlıcı. Höşmerim başta olmak üzere sütlü tatlılarıyla bir efsane.",
          address: "Bandırma Merkez",
          venueImageUrl:
            "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&q=80&w=800",
          menuLink: "https://menum.co/oztaylansutevi",
          ratingTotal: 49,
          ratingCount: 42,
        },
      ];

      const promises = SHOPS.map((shop) =>
        addDoc(collection(db, "artifacts", appId, "public", "data", "venues"), {
          ...shop,
          createdAt: serverTimestamp(),
          viewCount: 0,
        }),
      );

      await Promise.all(promises);

      // Cache temizle
      localStorage.removeItem(`bandirma_venues_v2_food`);
      alert("Yeni mekanlar (Tönas, Green Pub, Öztaylan) eklendi! 🍰🍺");

      // Listeyi yenile
      setLastDoc(null);
      setVenues([]);
      setHasMore(true);
      fetchVenues(false);
    } catch (e) {
      console.error(e);
      alert("Hata: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredVenues = venues.filter((venue) => {
    // Ekstra Güvenlik: Sekme ile uyuşmayan verileri gizle (Veritabanı düzelene kadar)
    if (venue.type !== activeAppTab) return false;

    const matchesCategory =
      selectedCategory === "Tümü" || venue.category === selectedCategory;
    const matchesSearch =
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (venue.description &&
        venue.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesOpen = !showOpenOnly || isVenueOpen(venue);

    return matchesCategory && matchesSearch && matchesOpen;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-24 md:pb-10 relative overflow-x-hidden">
      <BandirmaSporBanner />

      {/* 1. Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-200 safe-top">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              className="w-12 h-12 rounded-xl shadow-md object-cover"
              alt="Bizim Bandırma Logo"
            />
            <div>
              <h1 className="font-bold text-lg leading-none text-slate-800">
                Bizim Bandırma
              </h1>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mt-1">
                Şehrin Lezzet ve Gezi Rehberi
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {isAdmin && activeAppTab === "food" && (
              <button
                onClick={addSpecificCoffeeShops}
                className="p-2 bg-slate-900 text-white rounded-full hover:bg-slate-700"
                title="Özel Kahvecileri Ekle"
              >
                <Coffee size={18} />
              </button>
            )}
            {isAdmin && activeAppTab === "travel" && (
              <button
                onClick={seedGeziData}
                className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100"
                title="Gezi Verilerini Yükle"
              >
                <Plus size={18} />
              </button>
            )}
            {/* Veri Onarım Butonu (Böcek İlacı ikonu ile) */}
            {isAdmin && (
              <button
                onClick={fixDatabase}
                className="p-2 bg-yellow-50 text-yellow-600 rounded-full hover:bg-yellow-100"
                title="Veri Türlerini Onar"
              >
                <CheckCircle2 size={18} />
              </button>
            )}
            {isAdmin && (
              <button
                onClick={wipeData}
                className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100"
                title="Tüm Puan ve Yorumları Sıfırla"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button
              onClick={() =>
                isAdmin ? signOut(auth) : setShowLoginModal(true)
              }
              className={`p-2 rounded-full transition-all active:scale-95 ${isAdmin ? "bg-red-50 text-red-600 ring-2 ring-red-100" : "text-slate-300 hover:text-slate-500"}`}
            >
              {isAdmin ? <Unlock size={18} /> : <Lock size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* 1.5. Ana Mod Seçimi (Tab Menu) */}
      <div className="bg-white border-b border-slate-100 sticky top-16 z-20 shadow-sm">
        <div className="max-w-md mx-auto grid grid-cols-5 pb-2">
          {" "}
          {/* 5. kolon eklendi */}
          <button
            onClick={() => setActiveAppTab("food")}
            className={`flex flex-col items-center gap-1.5 py-3 border-b-2 transition-colors ${activeAppTab === "food" ? "border-orange-500 text-orange-600" : "border-transparent text-slate-400"}`}
          >
            <Utensils
              size={activeAppTab === "food" ? 24 : 20}
              className="transition-all"
            />
            <span
              className={`text-xs font-bold ${activeAppTab === "food" ? "opacity-100" : "opacity-70"}`}
            >
              Yeme-İçme
            </span>
          </button>
          <button
            onClick={() => setActiveAppTab("hotel")}
            className={`flex flex-col items-center gap-1.5 py-3 border-b-2 transition-colors ${activeAppTab === "hotel" ? "border-blue-500 text-blue-600" : "border-transparent text-slate-400"}`}
          >
            <Bed
              size={activeAppTab === "hotel" ? 24 : 20}
              className="transition-all"
            />
            <span
              className={`text-xs font-bold ${activeAppTab === "hotel" ? "opacity-100" : "opacity-70"}`}
            >
              Konaklama
            </span>
          </button>
          <button
            onClick={() => setActiveAppTab("travel")}
            className={`flex flex-col items-center gap-1.5 py-3 border-b-2 transition-colors ${activeAppTab === "travel" ? "border-green-500 text-green-600" : "border-transparent text-slate-400"}`}
          >
            <Palmtree
              size={activeAppTab === "travel" ? 24 : 20}
              className="transition-all"
            />
            <span
              className={`text-xs font-bold ${activeAppTab === "travel" ? "opacity-100" : "opacity-70"}`}
            >
              Gezi
            </span>
          </button>
          {/* Yeni Esnaf Sekmesi */}
          <button
            onClick={() => setActiveAppTab("esnaf")}
            className={`flex flex-col items-center gap-1.5 py-3 border-b-2 transition-colors ${activeAppTab === "esnaf" ? "border-purple-500 text-purple-600" : "border-transparent text-slate-400"}`}
          >
            <Store
              size={activeAppTab === "esnaf" ? 24 : 20}
              className="transition-all"
            />
            <span
              className={`text-xs font-bold ${activeAppTab === "esnaf" ? "opacity-100" : "opacity-70"}`}
            >
              Esnaf
            </span>
          </button>
          {/* Yeni Etkinlik Sekmesi */}
          <button
            onClick={() => setActiveAppTab("events")}
            className={`flex flex-col items-center gap-1.5 py-3 border-b-2 transition-colors ${activeAppTab === "events" ? "border-pink-500 text-pink-600" : "border-transparent text-slate-400"}`}
          >
            <Megaphone
              size={activeAppTab === "events" ? 24 : 20}
              className="transition-all"
            />
            <span
              className={`text-xs font-bold ${activeAppTab === "events" ? "opacity-100" : "opacity-70"}`}
            >
              Etkinlik
            </span>
          </button>
        </div>
      </div>

      {/* 2. Filtreleme Alanı */}
      <div className="max-w-md mx-auto px-4 pt-4 pb-2 space-y-4 bg-slate-50">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-orange-500 transition-colors" />
          <input
            type="text"
            placeholder="Ne yemek istersin?"
            className="w-full pl-10 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 shadow-sm transition-all text-base placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {/* Kategori Filtreleme (Yatay Scroll) & Şu An Açık */}
        <div className="sticky top-[138px] z-10 bg-slate-50 py-2 border-b border-slate-200/60 backdrop-blur-sm bg-slate-50/90">
          <div className="flex items-center gap-2 px-4 overflow-x-auto no-scrollbar pb-1">
            {/* Şu An Açık Toggle - Sadece Food ve Esnaf için anlamlı */}
            {(activeAppTab === "food" || activeAppTab === "esnaf") && (
              <button
                onClick={() => setShowOpenOnly(!showOpenOnly)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${showOpenOnly ? "bg-green-600 text-white border-green-600 shadow-md shadow-green-200" : "bg-white text-slate-500 border-slate-200"}`}
              >
                <Clock size={14} />
                {showOpenOnly ? "Sadece Açıklar" : "Şu An Açık"}
              </button>
            )}

            <div className="w-[1px] h-6 bg-slate-300 mx-1 flex-shrink-0"></div>

            {currentCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${selectedCategory === cat ? "bg-slate-800 text-white border-slate-800 shadow-lg shadow-slate-200 scale-105" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Mekan Listesi */}
      <main className="max-w-md mx-auto px-4 mt-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <Loader2 className="animate-spin text-orange-500" size={32} />
            <span className="text-sm font-medium">Mekanlar yükleniyor...</span>
          </div>
        ) : filteredVenues.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white rounded-3xl border border-dashed border-slate-200 mx-2">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Search size={24} />
            </div>
            <h3 className="font-bold text-slate-700">Mekan Bulunamadı</h3>
            <p className="text-sm text-slate-400 mt-1 mb-4">
              Aramanızla eşleşen mekan yok veya veriler güncelleniyor.
            </p>

            {/* Veri Kurtarma Butonları (Sadece Admin) */}
            {isAdmin && (
              <div className="flex flex-col gap-2 mt-2">
                <button
                  onClick={fixDatabase}
                  className="bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-xs font-bold border border-orange-100 hover:bg-orange-100 transition-colors"
                >
                  Veritabanı Onar (Admin)
                </button>
                <button
                  onClick={wipeData}
                  className="bg-red-50 text-red-600 px-4 py-2 rounded-full text-xs font-bold border border-red-100 hover:bg-red-100 transition-colors"
                >
                  🧹 Tüm Puan/Yorumları Sıfırla
                </button>
              </div>
            )}
          </div>
        ) : (
          <div
            className={
              activeAppTab === "travel" ? "space-y-6" : "grid grid-cols-1 gap-4"
            }
          >
            {filteredVenues.map((venue) =>
              activeAppTab === "travel" ? (
                <TravelFeedItem
                  key={venue.id}
                  venue={venue}
                  isAdmin={isAdmin}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                  handleVenueClick={handleVenueClick}
                  favorites={favorites}
                  toggleFavorite={toggleFavorite}
                />
              ) : (
                <div
                  key={venue.id}
                  onClick={() => handleVenueClick(venue)}
                  className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex gap-4 active:scale-[0.99] transition-transform cursor-pointer relative overflow-hidden group"
                >
                  {/* Kampanya Rozeti (Liste görünümünde) */}

                  <div className="relative w-24 h-24 flex-shrink-0">
                    <SmartImage
                      src={venue.venueImageUrl || venue.logoUrl}
                      className="w-full h-full rounded-xl bg-slate-50 object-cover"
                      alt={venue.name}
                      fallbackIcon={
                        <ChefHat size={24} className="text-slate-300" />
                      }
                    />
                    {/* Favori Butonu (Kart) */}
                    <button
                      onClick={(e) => toggleFavorite(e, venue.id)}
                      className={`absolute top-1 right-1 p-1.5 rounded-full shadow-sm backdrop-blur-sm transition-all ${favorites.includes(venue.id) ? "bg-red-500 text-white" : "bg-white/70 text-slate-400 hover:text-red-500"}`}
                    >
                      <Heart
                        size={14}
                        fill={
                          favorites.includes(venue.id) ? "currentColor" : "none"
                        }
                      />
                    </button>
                    {/* Mekan fotosu varsa logoyu overlay yap */}
                    {venue.venueImageUrl && venue.logoUrl && (
                      <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full border-2 border-white shadow-sm bg-white overflow-hidden p-0.5 z-10">
                        <img
                          src={venue.logoUrl}
                          className="w-full h-full object-cover rounded-full"
                          alt="logo"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-slate-800 text-lg leading-tight truncate pr-2">
                        {venue.name}
                      </h3>
                      {isAdmin && (
                        <div className="flex gap-1 -mt-1 -mr-1">
                          <button
                            onClick={(e) => handleEdit(e, venue)}
                            className="text-blue-400 hover:text-blue-600 p-1.5 bg-blue-50 rounded-lg"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, venue.id)}
                            className="text-red-400 hover:text-red-600 p-1.5 bg-red-50 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                    {venue.campaignText && (
                      <div className="w-full mt-1 mb-1">
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm"
                          style={{
                            backgroundColor: venue.campaignColor || "#ef4444",
                          }}
                        >
                          <Megaphone size={10} /> {venue.campaignText}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-sm text-orange-600 font-medium">
                        {venue.category}
                      </p>
                      {venue.type === "hotel" && venue.pricePerNight && (
                        <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                          ₺{venue.pricePerNight}
                        </span>
                      )}
                      {venue.ratingCount > 0 && (
                        <div className="flex items-center gap-0.5 text-[10px] font-bold text-slate-600 bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-100">
                          <Star
                            size={10}
                            className="text-yellow-500 fill-yellow-500"
                          />
                          <span>
                            {(venue.ratingTotal / venue.ratingCount).toFixed(1)}
                          </span>
                          <span className="text-slate-400 font-normal">
                            ({venue.ratingCount})
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5">
                      <MapPin
                        size={14}
                        className="flex-shrink-0 text-slate-400"
                      />
                      <span className="truncate">
                        {venue.address || "Bandırma"}
                      </span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <span
                        className={`text-[10px] font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 flex items-center gap-1.5 border border-slate-200`}
                      >
                        {isImageUrl(venue.menuUrl) ? (
                          <>
                            <ImageIcon size={10} /> MENÜ GÖRSELİ
                          </>
                        ) : (
                          <>
                            <ExternalLink size={10} /> WEB LİNKİ
                          </>
                        )}
                      </span>
                      {venue.viewCount > 0 && (
                        <span className="text-[10px] px-2 py-1 rounded-md bg-green-50 text-green-700 border border-green-100">
                          {venue.viewCount} görüntülenme
                        </span>
                      )}
                    </div>

                    {/* Saat ve Instagram (Kart Alt Bilgi) */}
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-50">
                      {venue.openingTime && venue.closingTime ? (
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-slate-400" />
                          <span className="text-[10px] font-medium text-slate-500">
                            {venue.openingTime} - {venue.closingTime}
                          </span>
                          {(() => {
                            const status = getOpenStatus(
                              venue.openingTime,
                              venue.closingTime,
                            );
                            return (
                              status && (
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${status.color}`}
                                >
                                  {status.text}
                                </span>
                              )
                            );
                          })()}
                        </div>
                      ) : (
                        <div />
                      )}

                      {venue.instagramUrl && (
                        <a
                          href={venue.instagramUrl}
                          target="_blank"
                          onClick={(e) => e.stopPropagation()}
                          className="text-pink-600 hover:text-pink-700 p-1 bg-pink-50 rounded-full"
                        >
                          <Instagram size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        )}

        {/* Yükle Butonu (Pagination) */}
        {!loading &&
          hasMore &&
          filteredVenues.length > 0 &&
          !searchTerm &&
          selectedCategory === "Tümü" && (
            <div className="flex justify-center mt-6 pb-6">
              <button
                onClick={() => fetchVenues(true)}
                disabled={loadingMore}
                className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-full shadow-sm text-sm font-bold flex items-center gap-2 hover:bg-slate-50 active:scale-95 disabled:opacity-50 transition-all"
              >
                {loadingMore ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Plus size={16} />
                )}
                {loadingMore ? "Yükleniyor..." : "Daha Fazla Mekan Gör"}
              </button>
            </div>
          )}
      </main>

      {/* Ne Yesem? FAB (Herkes İçin) */}
      <button
        onClick={handleRandomPick}
        className="fixed bottom-24 right-5 bg-white text-orange-600 p-3.5 rounded-full shadow-xl border-2 border-orange-100 hover:scale-110 transition-all z-30 active:scale-95 flex items-center gap-2 group"
      >
        <Dices
          size={24}
          className="group-hover:rotate-180 transition-transform duration-500"
        />
        <span className="font-bold text-xs max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
          Ne Yesem?
        </span>
      </button>

      {/* FAB (Admin) */}
      {isAdmin && (
        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-6 right-6 bg-slate-900 text-white p-4 rounded-full shadow-xl shadow-slate-900/30 hover:scale-110 transition-all z-40 active:bg-slate-800"
        >
          <Plus size={24} />
        </button>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}

      {/* --- RESPONSIVE FULL SCREEN MODAL (Kampanya Destekli) --- */}
      {selectedVenue && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full h-[100dvh] sm:h-auto sm:max-h-[85vh] sm:max-w-2xl sm:rounded-3xl flex flex-col relative shadow-2xl animate-slide-up overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white z-10 safe-top">
              <div>
                <h2 className="font-bold text-xl text-slate-800">
                  {selectedVenue.name}
                </h2>
                {selectedVenue.phone && (
                  <a
                    href={`tel:${selectedVenue.phone}`}
                    className="flex items-center gap-1.5 text-sm text-slate-500 mt-0.5 hover:text-orange-600 active:text-orange-700"
                  >
                    <div className="bg-green-100 p-1 rounded-full text-green-700">
                      <Phone size={12} />
                    </div>
                    <span>{selectedVenue.phone}</span>
                  </a>
                )}

                {/* Detay Modal - Instagram Butonu */}
                {selectedVenue.instagramUrl && (
                  <a
                    href={selectedVenue.instagramUrl}
                    target="_blank"
                    className="flex items-center gap-1.5 text-sm text-pink-600 font-bold hover:text-pink-700 bg-pink-50 px-2 py-1 rounded-full transition-colors"
                  >
                    <Instagram size={14} /> Instagram
                  </a>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    toggleFavorite(e, selectedVenue.id);
                  }}
                  className={`p-2.5 rounded-full transition-all active:scale-95 ${favorites.includes(selectedVenue.id) ? "bg-red-50 text-red-500" : "bg-slate-100 text-slate-400"}`}
                >
                  <Heart
                    size={20}
                    fill={
                      favorites.includes(selectedVenue.id)
                        ? "currentColor"
                        : "none"
                    }
                  />
                </button>
                <button
                  onClick={() => handleShare(selectedVenue)}
                  className="p-2.5 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-600 transition-colors active:scale-95"
                >
                  <Share2 size={20} />
                </button>
                <button
                  onClick={() => setSelectedVenue(null)}
                  className="p-2.5 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-600 transition-colors active:scale-95"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Konaklama İçin Özel Fiyat ve Arama Alanı */}
              {selectedVenue.type === "hotel" &&
                selectedVenue.pricePerNight && (
                  <div className="mx-4 mt-2 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs text-blue-600 font-semibold mb-0.5">
                        Gecelik Konaklama
                      </div>
                      <div className="text-xl font-bold text-blue-800">
                        ₺{selectedVenue.pricePerNight}
                      </div>
                    </div>
                    {selectedVenue.phone && (
                      <a
                        href={`tel:${selectedVenue.phone}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow hover:bg-blue-700 active:scale-95"
                      >
                        <Phone size={16} /> Bilgi Alıp Ara
                      </a>
                    )}
                  </div>
                )}
            </div>

            {/* Modal Content - REKLAM KATMANI BURADA */}
            <VenueDetailContent
              venue={selectedVenue}
              isImageUrl={isImageUrl}
              appId={appId}
              db={db}
              isAdmin={isAdmin}
            />
          </div>
        </div>
      )}

      {/* Mekan Ekleme Modalı (Gelişmiş Kampanya Editörü) */}
      {showAddModal && (
        <AddVenueModal
          onClose={() => {
            setShowAddModal(false);
            setVenueToEdit(null);
          }}
          appId={appId}
          db={db}
          venueToEdit={venueToEdit}
          setVenues={setVenues}
          activeAppTab={activeAppTab}
        />
      )}
    </div>
  );
}

// --- Mekan Detayı ve Yorum Alanı ---
function VenueDetailContent({ venue, isImageUrl, appId, db, isAdmin }) {
  const [tab, setTab] = useState("menu"); // 'menu' | 'comments'
  const [comments, setComments] = useState([]);
  const [showCommentForm, setShowCommentForm] = useState(false);

  // Yorum Silme (Admin)
  const handleDeleteComment = async (commentId, rating) => {
    if (!confirm("Bu yorumu silmek istediğinize emin misiniz?")) return;

    try {
      // Yorumu sil
      await deleteDoc(
        doc(db, "artifacts", appId, "public", "data", "comments", commentId),
      );

      // Mekan puanını güncelle (düşür)
      const ref = doc(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "venues",
        venue.id,
      );
      await updateDoc(ref, {
        ratingTotal: increment(-rating),
        ratingCount: increment(-1),
      });

      alert("Yorum silindi.");
    } catch (error) {
      console.error("Silme hatası:", error);
      alert("Yorum silinirken hata oluştu.");
    }
  };

  // Yorumları Çek
  useEffect(() => {
    const q = query(
      collection(db, "artifacts", appId, "public", "data", "comments"),
      orderBy("createdAt", "desc"),
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      // Sadece bu mekana ait yorumları filtrele (Client-side filtering for simplicity)
      const firestoreComments = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((c) => c.venueId === venue.id);

      // Yerel (Local Storage) Yorumları Çek
      let localComments = [];
      try {
        const localData = localStorage.getItem(`local_comments_${venue.id}`);
        if (localData) localComments = JSON.parse(localData);
      } catch (e) {}

      // İkisini Birleştir (Yeniden eskiye)
      const allComments = [...localComments, ...firestoreComments].sort(
        (a, b) => {
          // Timestamp sorting (local has .seconds, firestore has .seconds)
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        },
      );

      setComments(allComments);
    });
    return () => unsubscribe();
  }, [venue.id]);

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-slate-50 relative touch-auto">
      {/* Tab Header */}
      <div className="flex border-b border-slate-200 bg-white">
        <button
          onClick={() => setTab("menu")}
          className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${tab === "menu" ? "border-orange-500 text-orange-600" : "border-transparent text-slate-500"}`}
        >
          {venue.type === "food" ? "Menü & Bilgi" : "Hakkında"}
        </button>
        <button
          onClick={() => setTab("comments")}
          className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${tab === "comments" ? "border-orange-500 text-orange-600" : "border-transparent text-slate-500"}`}
        >
          Yorumlar ({venue.ratingCount || 0})
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* TAB 1: MENÜ */}
        {tab === "menu" && (
          <div className="min-h-full pb-20">
            {/* Mekan Görseli */}
            {venue.venueImageUrl && (
              <div className="w-full h-48 relative shrink-0">
                <img
                  src={venue.venueImageUrl}
                  className="w-full h-full object-cover"
                  alt="Mekan"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent pointer-events-none" />
              </div>
            )}

            {/* EDİTÖRÜN NOTU (Varsa Burada Göster) */}
            {venue.adminNote && (
              <div className="mx-4 mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl relative overflow-hidden">
                <div className="absolute -right-4 -top-4 opacity-10 rotate-12">
                  <Lightbulb size={100} className="text-yellow-600" />
                </div>
                <div className="flex gap-3 relative z-10">
                  <div className="mt-1">
                    <Lightbulb
                      className="text-yellow-600 fill-yellow-600 animate-pulse"
                      size={20}
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-yellow-800 text-sm mb-1">
                      Bizim Bandırma Tavsiyesi
                    </h4>
                    <p className="text-sm text-yellow-900 font-medium leading-relaxed">
                      "{venue.adminNote}"
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Menü Görseli (Eğer 'travel' değilse göster) */}
            {venue.type !== "travel" && (
                <>
                {/* Çoklu Menü Desteği */}
                {venue.menuUrls && venue.menuUrls.length > 0 ? (
                    <div className="flex flex-col gap-2 relative">
                        {venue.campaignText && (
                            <div className="text-white p-3 text-center font-bold text-sm shadow-md animate-pulse sticky top-0 z-10" style={{ backgroundColor: venue.campaignColor || "#ef4444" }}>
                              <Megaphone size={16} className="inline mr-2 animate-bounce" />
                              {venue.campaignText}
                            </div>
                         )}
                         {venue.menuUrls.map((url, idx) => (
                             <img key={idx} src={url} alt={`Menü ${idx+1}`} className="w-full h-auto object-contain mx-auto" loading="lazy" />
                         ))}
                    </div>
                ) : (
                    /* Fallback: Eski Tekil Menü */
                    isImageUrl(venue.menuUrl || venue.menuLink) ? (
                        <div className="relative">
                          {venue.campaignText && (
                            <div className="text-white p-3 text-center font-bold text-sm shadow-md animate-pulse" style={{ backgroundColor: venue.campaignColor || "#ef4444" }}>
                              <Megaphone size={16} className="inline mr-2 animate-bounce" />
                              {venue.campaignText}
                            </div>
                          )}
                          <img 
                            src={venue.menuUrl || venue.menuLink} 
                            alt="Menü" 
                            className="w-full h-auto object-contain mx-auto"
                           onError={(e) => { e.target.style.display = "none"; }}
                         />
                      </div>
                    ) : null
                )}
                </>
            )}

            {/* METİN MENÜ GÖSTERİMİ (YENİ) */}
            {venue.menuText && (
               <div className="px-4 py-4 bg-white border-t border-slate-100">
                  <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm">
                    <AlignLeft size={16} className="text-orange-500" /> Menü Listesi
                  </h3>
                  <div className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-medium">
                     {venue.menuText}
                  </div>
               </div>
            )}

            {/* WEB SİTESİ LİNKİ BUTONU (Sadece geçerli bir web linki ise göster) */}
            {(() => {
               const effectiveLink = venue.menuLink || (!isImageUrl(venue.menuUrl) ? venue.menuUrl : '');
               // Basit bir URL doğrulama: http, https veya www ile başlamalı ve boş olmamalı
               const isValidWebLink = effectiveLink && (effectiveLink.startsWith('http') || effectiveLink.startsWith('www'));
               
               if (isValidWebLink) {
                 const finalHref = effectiveLink.startsWith('www') ? `https://${effectiveLink}` : effectiveLink;
                 return (
                   <div className="p-4 bg-slate-50 border-t border-slate-100 mt-2 mx-4 rounded-xl border">
                      <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-700 shadow-sm shrink-0">
                            <ExternalLink size={20} />
                         </div>
                         <div className="flex-1">
                            <div className="font-bold text-slate-800 text-sm">Web Menüsü</div>
                            <p className="text-xs text-slate-500">Mekanın kendi web sitesini ziyaret et.</p>
                         </div>
                         <a 
                            href={finalHref} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800"
                         >
                            Siteye Git
                         </a>
                      </div>
                   </div>
                 );
               }
               return null;
            })()}


            {/* GEZİ AÇIKLAMASI (Sadece Travel) */}
            {venue.type === "travel" && venue.description && (
              <div className="px-6 py-6 bg-white">
                <h3 className="font-bold text-lg mb-2">Hakkında</h3>
                <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">
                  {venue.description}
                </p>

                {/* Giriş Ücreti vb. Bilgiler */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {venue.entryFee && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="text-xs text-slate-400 font-bold uppercase mb-1">
                        Giriş
                      </div>
                      <div className="font-bold text-slate-800">
                        {venue.entryFee}
                      </div>
                    </div>
                  )}
                  {venue.localTip && (
                    <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                      <div className="text-xs text-orange-400 font-bold uppercase mb-1">
                        İpucu
                      </div>
                      <div className="font-bold text-orange-800 text-sm whitespace-normal">
                        {venue.localTip}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Galeri */}
            {venue.gallery && venue.gallery.length > 0 && (
              <div className="px-4 py-6 bg-white border-t border-slate-100 mt-4">
                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <ImageIcon size={18} className="text-orange-500" /> Mekan
                  Fotoğrafları
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {venue.gallery.map((img, idx) => (
                    <div
                      key={idx}
                      className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200"
                      onClick={() => window.open(img, "_blank")}
                    >
                      <img
                        src={img}
                        className="w-full h-full object-cover"
                        alt={`Galeri ${idx + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Konaklama İmkanları Listesi */}
            {venue.amenities && venue.amenities.length > 0 && (
              <div className="px-4 py-6 bg-white border-t border-slate-100">
                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-green-600" /> Sunulan
                  İmkanlar
                </h3>
                <div className="flex flex-wrap gap-2">
                  {venue.amenities.map((item) => (
                    <span
                      key={item}
                      className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg border border-slate-200 flex items-center gap-1.5"
                    >
                      {item === "Wi-Fi" && <Wifi size={12} />}
                      {item === "Otopark" && <Car size={12} />}
                      {item === "Klima" && <Snowflake size={12} />}
                      {item === "TV" && <Tv size={12} />}
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: YORUMLAR */}
        {tab === "comments" && (
          <div className="p-4 pb-24">
            {/* Puan Özeti (Varsa) */}
            {venue.ratingCount > 0 ? (
              <div className="bg-white p-4 rounded-2xl border border-slate-200 mb-4 flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-slate-800 flex items-center gap-1">
                    {(venue.ratingTotal / venue.ratingCount).toFixed(1)}{" "}
                    <Star
                      size={24}
                      className="text-yellow-400 fill-yellow-400"
                    />
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    {venue.ratingCount} Değerlendirme
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex mb-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={12}
                        className={
                          s <= Math.round(venue.ratingTotal / venue.ratingCount)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-slate-200"
                        }
                      />
                    ))}
                  </div>
                  <div className="text-xs text-orange-600 font-bold">
                    Harika!
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200 mb-4">
                <Star size={32} className="mx-auto mb-2 opacity-20" />
                <div className="text-sm">Henüz değerlendirme yok.</div>
              </div>
            )}

            {/* Yorum Listesi */}
            <div className="space-y-3">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-bold text-slate-800 text-sm">
                          {/* İsim Gizleme (Maskeleme) */}
                          {comment.userName
                            .split(" ")
                            .map((n, i) =>
                              i < 2
                                ? n[0] + "*".repeat(n.length > 1 ? 4 : 0)
                                : "",
                            )
                            .join(" ")}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          Onaylı Ziyaretçi{" "}
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                      </div>

                      {/* Admin Silme Butonu */}
                      {isAdmin && (
                        <button
                          onClick={() =>
                            handleDeleteComment(comment.id, comment.rating)
                          }
                          className="bg-red-50 text-red-500 p-1.5 rounded-full hover:bg-red-100 transition-colors"
                          title="Yorumu Sil"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <div className="flex bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-100">
                      {[...Array(comment.rating)].map((_, i) => (
                        <Star
                          key={i}
                          size={10}
                          className="text-yellow-500 fill-yellow-500"
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    "{comment.text}"
                  </p>
                </div>
              ))}
            </div>

            {/* Floating Button */}
            <div className="fixed bottom-24 right-6 z-20">
              <button
                onClick={() => setShowCommentForm(true)}
                className="bg-slate-900 text-white px-5 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-transform"
              >
                <Edit3 size={18} /> Yorum Yap
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-100 safe-bottom">
        <div className="flex gap-2 justify-center">
          <button
            className="flex-1 bg-slate-100 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-200"
            onClick={() => window.location.reload()}
          >
            Kapat
          </button>

          {/* WhatsApp Sipariş Butonu */}
          {venue.phone && venue.type === "food" && (
            <a
              href={`https://wa.me/90${venue.phone.replace(/[^0-9]/g, "").slice(-10)}?text=Merhaba, ${venue.name} menünüzden sipariş vermek istiyorum.`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 bg-green-500 text-white py-3 rounded-xl text-sm font-bold hover:bg-green-600 flex items-center justify-center gap-2 shadow-lg shadow-green-200"
            >
              <MessageCircle size={18} /> Sipariş
            </a>
          )}

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.name + " Bandırma")}`}
            target="_blank"
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <MapPin size={16} /> Yol Tarifi
          </a>
        </div>
      </div>

      {showCommentForm && (
        <AddCommentModal
          venue={venue}
          onClose={() => setShowCommentForm(false)}
          appId={appId}
          db={db}
        />
      )}
    </div>
  );
}

// --- Yorum Ekleme Modalı (Direkt Kayıt - SMS Yok) ---
function AddCommentModal({ venue, onClose, appId, db }) {
  const [data, setData] = useState({
    name: "",
    phone: "",
    rating: 5,
    text: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitComment = async (e) => {
    e.preventDefault();
    if (!data.name || data.name.length < 3)
      return alert("Lütfen geçerli bir isim giriniz.");
    if (!data.phone || data.phone.length < 10)
      return alert("Lütfen geçerli bir telefon giriniz.");
    if (!data.text) return alert("Lütfen yorumunuzu yazınız.");

    setIsSubmitting(true);
    try {
      await addDoc(
        collection(db, "artifacts", appId, "public", "data", "comments"),
        {
          venueId: venue.id,
          userName: data.name,
          phone: data.phone, // Gizli kalabilir
          rating: parseInt(data.rating),
          text: data.text,
          createdAt: serverTimestamp(),
        },
      );

      // Mekan puanını güncelle (Yetki hatası olsa bile yorumu başarılı say)
      try {
        const ref = doc(
          db,
          "artifacts",
          appId,
          "public",
          "data",
          "venues",
          venue.id,
        );
        await updateDoc(ref, {
          ratingTotal: increment(parseInt(data.rating)),
          ratingCount: increment(1),
        });
      } catch (ratingError) {
        console.warn(
          "Mekan puanı güncellenemedi (Muhtemelen yetki kısıtlaması):",
          ratingError,
        );
      }

      alert("Yorumunuz başarıyla eklendi!");
      onClose();
    } catch (err) {
      console.error("Yorum gönderme hatası (DB):", err);

      // FALLBACK: Local Storage'a Kaydet
      try {
        const localComment = {
          id: "local_" + Date.now(),
          venueId: venue.id,
          userName: data.name,
          phone: data.phone,
          rating: parseInt(data.rating),
          text: data.text,
          createdAt: { seconds: Date.now() / 1000 }, // Firestore timestamp formatı taklidi
          isLocal: true,
        };

        const key = `local_comments_${venue.id}`;
        const existing = JSON.parse(localStorage.getItem(key) || "[]");
        localStorage.setItem(key, JSON.stringify([localComment, ...existing]));

        alert(
          "⚠️ Veritabanı izni olmadığı için yorumunuz SADECE BU CİHAZDA saklandı. (Demo Modu)",
        );
        onClose();
      } catch (localErr) {
        alert("Yorum kaydedilemedi: " + err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-white flex flex-col animate-slide-up">
      <div className="p-4 border-b border-slate-100 flex items-center gap-3">
        <button onClick={onClose}>
          <X size={24} className="text-slate-400" />
        </button>
        <h3 className="font-bold text-lg">Yorum Yap</h3>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        <form onSubmit={submitComment} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Adınız Soyadınız
            </label>
            <input
              required
              className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              placeholder="Örn: Ahmet Yılmaz"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              İsminiz maskelenerek (Örn: A**** Y*****) gösterilecektir. Telefon
              numaranız gizli kalacaktır.
            </p>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Telefon Numaranız
            </label>
            <input
              type="tel"
              required
              className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none"
              value={data.phone}
              onChange={(e) => setData({ ...data, phone: e.target.value })}
              placeholder="05XX XXX XX XX"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Puanınız
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setData({ ...data, rating: star })}
                  className={`p-2 rounded-lg transition-colors ${data.rating >= star ? "text-yellow-400 bg-yellow-50 ring-2 ring-yellow-200" : "text-slate-300 bg-slate-100"}`}
                >
                  <Star
                    size={32}
                    fill={data.rating >= star ? "currentColor" : "none"}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Yorumunuz
            </label>
            <textarea
              required
              className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none h-32"
              value={data.text}
              onChange={(e) => setData({ ...data, text: e.target.value })}
              placeholder="Deneyiminizden bahsedin..."
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold mt-4 flex justify-center"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Yorumu Gönder"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- Kampanya Destekli Mekan Ekleme Formu ---
function AddVenueModal({
  onClose,
  appId,
  db,
  venueToEdit,
  setVenues,
  activeAppTab,
}) {
  const [formData, setFormData] = useState({
    name: "",
    type: "food",
    category: "Restoran",
    address: "",
    phone: "",
    description: "", // Açıklama eklendi
    openingTime: "",
    closingTime: "",
    instagramUrl: "",
    pricePerNight: "",
    menuUrl: "",
    logoUrl: "",
    venueImageUrl: "",
    gallery: [],
    amenities: [], // İmkanlar listesi
    campaignText: "",
    campaignColor: "#ef4444",
    entryFee: "",
    localTip: "", // Gezi için alanlar
    adminNote: "", // Editörün Notu
  });

  const CATEGORY_DATA = {
    food: ["Restoran", "Kafe", "Fast Food", "Tatlı", "Bar", "Meyhane"],
    hotel: ["Otel", "Apart", "Pansiyon", "Kamp Alanı"],
    travel: ["Park", "Müze", "Tarihi", "Sahil", "Eğlence"],
    events: ["Konser", "Parti", "Tiyatro", "Stand-up", "Festival", "Atölye"],
    esnaf: [
      "Berber",
      "Kuaför",
      "Kasap",
      "Manav",
      "Tesisatçı",
      "Elektrikçi",
      "Çilingir",
      "Terzi",
      "Kırtasiye",
      "Çiçekçi",
      "Nakliye",
    ],
  };

  useEffect(() => {
    // Kategori değiştiğinde otomatik ilkini seç
    if (
      CATEGORY_DATA[formData.type] &&
      !CATEGORY_DATA[formData.type].includes(formData.category)
    ) {
      setFormData((prev) => ({
        ...prev,
        category: CATEGORY_DATA[formData.type][0],
      }));
    }
  }, [formData.type]);
  const [isCampaignMode, setIsCampaignMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (venueToEdit) {
      setFormData({
        name: venueToEdit.name || "",
        type: venueToEdit.type || "food",
        category: venueToEdit.category || "Restoran",
        address: venueToEdit.address || "",
        phone: venueToEdit.phone || "",
        pricePerNight: venueToEdit.pricePerNight || "",
        openingTime: venueToEdit.openingTime || "",
        closingTime: venueToEdit.closingTime || "",
        instagramUrl: venueToEdit.instagramUrl || "",
        // Eski 'menuUrl' alanı artık geçici input için, ana veri değil.
        menuUrl: "", 
        menuText: venueToEdit.menuText || "", // Yeni metin menü alanı
        // Eğer kayıtlı bir menuUrl varsa ve resim değilse, onu menuLink'e taşı.
        menuLink: venueToEdit.menuLink || (venueToEdit.menuUrl && !venueToEdit.menuUrl.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i) ? venueToEdit.menuUrl : '') || '',
        
        // Eğer kayıtlı bir menuUrl varsa ve resimse, menuUrls'e ekle (eski veriyi koru)
        menuUrls:
          venueToEdit.menuUrls ||
          (venueToEdit.menuUrl && venueToEdit.menuUrl.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i) ? [venueToEdit.menuUrl] : []),
          
        logoUrl: venueToEdit.logoUrl || "",
        venueImageUrl: venueToEdit.venueImageUrl || "",
        gallery: venueToEdit.gallery || [],
        amenities: venueToEdit.amenities || [],
        campaignText: venueToEdit.campaignText || "",
        campaignColor: venueToEdit.campaignColor || "#ef4444",
        adminNote: venueToEdit.adminNote || "",
      });
      if (venueToEdit.campaignText) {
        setIsCampaignMode(true);
      }
    }
  }, [venueToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Veriyi Hazırla
      const finalData = {
        ...formData,
        // Eski alan için backward compatibility:
        // Eğer resim varsa ilkini koy, yoksa web linkini koy.
        menuUrl:
          formData.menuUrls && formData.menuUrls.length > 0
            ? formData.menuUrls[0]
            : (formData.menuLink || ""),
        createdAt: serverTimestamp(),
        viewCount: venueToEdit ? venueToEdit.viewCount : 0,
      };

      if (!isCampaignMode) {
        delete finalData.campaignText;
        delete finalData.campaignColor;
      }

      let docId;
      if (venueToEdit) {
        docId = venueToEdit.id;
        await updateDoc(
          doc(db, "artifacts", appId, "public", "data", "venues", docId),
          finalData,
        );
      } else {
        const docRef = await addDoc(
          collection(db, "artifacts", appId, "public", "data", "venues"),
          finalData,
        );
        docId = docRef.id;
      }

      // STATE VE CACHE GÜNCELLEME (Anlık Yansıtma)
      const newVenueObj = {
        id: docId,
        ...finalData,
        createdAt: { seconds: Date.now() / 1000 },
      };

      setVenues((prev) => {
        let newList;
        if (venueToEdit) {
          newList = prev.map((v) =>
            v.id === docId ? { ...v, ...newVenueObj } : v,
          );
        } else {
          newList = [newVenueObj, ...prev];
        }

        // Cache'i de güncelle
        const cacheKey = `bandirma_venues_v2_${activeAppTab}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            parsed.data = newList;
            localStorage.setItem(cacheKey, JSON.stringify(parsed));
            console.log("Cache güncellendi.");
          } catch (e) {}
        }

        return newList;
      });

      onClose();
      alert("İşlem başarılı! ✅");
    } catch (error) {
      console.error(error);
      alert("Hata oluştu: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dosya Seçme İşleyicisi
  const handleFileChange = async (e, field) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      // Çoklu resim alanları
      if (field === "gallery" || field === "menuUrls") {
        const newImages = await Promise.all(
          files.map((file) => compressImage(file)),
        );
        setFormData((prev) => ({
          ...prev,
          [field]: [...(prev[field] || []), ...newImages],
        }));
      } else {
        // Tekil dosya
        const compressedBase64 = await compressImage(files[0]);
        setFormData((prev) => ({ ...prev, [field]: compressedBase64 }));
      }
    } catch (error) {
      console.error("Resim işleme hatası:", error);
      alert("Resim yüklenirken bir hata oluştu.");
    } finally {
      setUploading(false);
    }
  };

  const removeGalleryImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  };

  const removeMenuImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      menuUrls: (prev.menuUrls || []).filter((_, i) => i !== index),
    }));
  };

  const toggleAmenity = (amenity) => {
    setFormData((prev) => {
      const current = prev.amenities || [];
      if (current.includes(amenity)) {
        return { ...prev, amenities: current.filter((a) => a !== amenity) };
      } else {
        return { ...prev, amenities: [...current, amenity] };
      }
    });
  };

  const HOTEL_AMENITIES = [
    "Wi-Fi",
    "Otopark",
    "Kahvaltı Dahil",
    "Klima",
    "TV",
    "7/24 Resepsiyon",
    "Sıcak Su",
    "Deniz Manzarası",
    "Havuz",
    "Spor Salonu",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl p-0 shadow-2xl animate-slide-up max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-6 pb-2 flex justify-between items-center bg-white border-b border-slate-100">
          <h2 className="text-xl font-bold">
            {venueToEdit ? "Mekanı Düzenle" : "Yeni Mekan Oluştur"}
          </h2>
          <button
            onClick={onClose}
            className="bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Menü */}
        <div className="flex border-b border-slate-100 bg-slate-50">
          <button
            onClick={() => setActiveTab("details")}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${activeTab === "details" ? "text-slate-900 border-b-2 border-slate-900 bg-white" : "text-slate-400"}`}
          >
            <Edit3 size={16} /> Genel Bilgiler
          </button>
          <button
            onClick={() => setActiveTab("campaign")}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${activeTab === "campaign" ? "text-orange-600 border-b-2 border-orange-600 bg-orange-50" : "text-slate-400"}`}
          >
            <Megaphone size={16} /> Kampanya & Reklam
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="overflow-y-auto p-6 flex-1">
          <form id="venueForm" onSubmit={handleSubmit} className="space-y-4">
            {/* TAB 1: GENEL BİLGİLER */}
            <div className={activeTab === "details" ? "block" : "hidden"}>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                  Mekan Detayları
                </label>

                {/* Tür Seçimi */}
                <div className="flex gap-2 mb-2 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "food" })}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${formData.type === "food" ? "bg-white shadow text-slate-900" : "text-slate-400"}`}
                  >
                    Yeme-İçme
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "hotel" })}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${formData.type === "hotel" ? "bg-white shadow text-blue-700" : "text-slate-400"}`}
                  >
                    Konaklama
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "travel" })}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${formData.type === "travel" ? "bg-white shadow text-green-700" : "text-slate-400"}`}
                  >
                    Gezi
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "esnaf" })}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${formData.type === "esnaf" ? "bg-white shadow text-purple-700" : "text-slate-400"}`}
                  >
                    Esnaf
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "events" })}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${formData.type === "events" ? "bg-white shadow text-pink-700" : "text-slate-400"}`}
                  >
                    Etkinlik
                  </button>
                </div>

                <input
                  required
                  placeholder="Mekan Adı"
                  className="w-full border-slate-200 rounded-xl p-3 bg-slate-50 mb-2 focus:ring-2 focus:ring-orange-500 outline-none"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <div className="flex gap-2">
                  <select
                    className="w-1/2 border-slate-200 rounded-xl p-3 bg-slate-50 outline-none"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    {CATEGORY_DATA[formData.type].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <input
                    placeholder="Tel No"
                    className="w-1/2 border-slate-200 rounded-xl p-3 bg-slate-50 outline-none"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>

                {/* KONAKLAMA İÇİN FİYAT ALANI */}
                {formData.type === "hotel" && (
                  <div className="mt-2 space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                        Gecelik Fiyat (₺)
                      </label>
                      <input
                        type="number"
                        placeholder="Örn: 2500"
                        className="w-full border-blue-200 rounded-xl p-3 bg-blue-50 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-900"
                        value={formData.pricePerNight}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pricePerNight: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                        Otel İmkanları
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {HOTEL_AMENITIES.map((amenity) => (
                          <button
                            key={amenity}
                            type="button"
                            onClick={() => toggleAmenity(amenity)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                              (formData.amenities || []).includes(amenity)
                                ? "bg-blue-600 text-white border-blue-600 shadow-md transform scale-105"
                                : "bg-white text-slate-500 border-slate-200 hover:border-blue-300"
                            }`}
                          >
                            {amenity}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* EDİTÖRÜN NOTU ALANI (YENİ) */}
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 mt-2">
                  <label className="block text-sm font-bold text-yellow-800 mb-2 flex items-center gap-2">
                    <Lightbulb size={16} /> Editörün Notu (Bizim Tavsiyemiz)
                  </label>
                  <textarea
                    className="w-full p-3 rounded-lg border border-yellow-200 outline-none text-sm min-h-[80px]"
                    placeholder="Örn: Gitmeden önce rezervasyon yapın, akşam üstü gün batımı harika..."
                    value={formData.adminNote}
                    onChange={(e) =>
                      setFormData({ ...formData, adminNote: e.target.value })
                    }
                  />
                  <p className="text-[10px] text-yellow-600 mt-1">
                    Bu not mekan detayında en üstte dikkat çekici şekilde
                    görünür.
                  </p>
                </div>

                {/* Yeni Alanlar: Saat ve Instagram */}
                <div className="flex gap-2 mt-2">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                      Çalışma Saatleri
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="time"
                        className="w-full border-slate-200 rounded-xl p-2 bg-slate-50 text-sm md:text-base outline-none"
                        value={formData.openingTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            openingTime: e.target.value,
                          })
                        }
                      />
                      <span className="text-slate-400">-</span>
                      <input
                        type="time"
                        className="w-full border-slate-200 rounded-xl p-2 bg-slate-50 text-sm md:text-base outline-none"
                        value={formData.closingTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            closingTime: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                      Instagram Linki
                    </label>
                    <div className="relative">
                      <Instagram
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        placeholder="https://instagram.com/..."
                        className="w-full pl-9 pr-3 py-3 border-slate-200 rounded-xl bg-slate-50 text-sm outline-none"
                        value={formData.instagramUrl}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            instagramUrl: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-4">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                  Görseller
                </label>

                {/* Menü Görseli Seçimi */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-700 block mb-2">
                    Menü Görselleri (Çoklu Seçim)
                  </span>

                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {/* Yüklenmiş Menü Resimleri */}
                    {formData.menuUrls && formData.menuUrls.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                          <img src={img} className="w-full h-full object-cover" alt="Menü" />
                          <button type="button" onClick={() => removeMenuImage(idx)} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-lg shadow-md opacity-80 hover:opacity-100">
                            <X size={12} />
                          </button>
                        </div>
                      ))}

                    {/* Dosya Yükleme Butonu */}
                    <label className="cursor-pointer bg-white border border-dashed border-slate-300 hover:border-orange-500 text-slate-400 aspect-square rounded-lg flex flex-col items-center justify-center gap-1 transition-colors hover:bg-orange-50">
                      <ImageIcon size={20} />
                      <span className="text-[10px] text-center">{uploading ? '...' : 'Ekle'}</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFileChange(e, "menuUrls")} />
                    </label>
                  </div>
                  
                   {/* Manuel Resim Linki Ekleme */}
                   <div className="flex gap-2">
                     <input
                       placeholder="Görsel linki ekle..."
                       className="flex-1 border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-orange-500 outline-none text-slate-500"
                       value={formData.menuUrl || ''} 
                       onChange={(e) => setFormData({...formData, menuUrl: e.target.value})}
                     />
                     <button 
                       type="button"
                       onClick={() => {
                          if(!formData.menuUrl) return;
                          setFormData(prev => ({
                             ...prev,
                             menuUrls: [...(prev.menuUrls || []), prev.menuUrl],
                             menuUrl: ''
                          }));
                       }}
                       className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 rounded-lg text-xs font-bold"
                     >
                       Ekle
                     </button>
                   </div>

                   {/* AYRI WEB SİTESİ LİNKİ ALANI */}
                   <div className="mt-4 pt-4 border-t border-slate-200">
                      <label className="text-xs font-bold text-slate-700 block mb-2">Menü Web Sitesi Linki (QR Link)</label>
                      <div className="flex gap-2 relative">
                         <ExternalLink size={16} className="absolute left-3 top-2.5 text-slate-400" />
                         <input 
                           placeholder="https://menu.com/..." 
                           className="w-full pl-9 pr-3 py-2 border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500"
                           value={formData.menuLink || ''}
                           onChange={e => setFormData({...formData, menuLink: e.target.value})}
                         />
                      </div>
                      <p className="text-[9px] text-slate-400 mt-1">Eğer bir web siteniz veya QR menünüz varsa buraya linkini yapıştırın. Detay sayfasında buton olarak görünecektir.</p>
                   </div>
                   
                   {/* METİN MENÜ ALANI (YENİ) */}
                   <div className="mt-4 pt-4 border-t border-slate-200">
                      <label className="text-xs font-bold text-slate-700 block mb-2">Menü İçeriği (Yazı olarak)</label>
                      <textarea 
                         placeholder="Örn: 
Çorbalar: Mercimek (50₺), Ezogelin (50₺)
Ana Yemekler: Adana Kebap (250₺), Köfte (230₺)
Tatlılar: Sütlaç (80₺)..." 
                         className="w-full p-3 border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500 min-h-[150px]"
                         value={formData.menuText || ''}
                         onChange={e => setFormData({...formData, menuText: e.target.value})}
                      />
                      <p className="text-[9px] text-slate-400 mt-1">Menünüzü yazı olarak girmek veya resimlere ek bilgi eklemek için bu alanı kullanabilirsiniz.</p>
                   </div>
                </div>

                {/* Logo ve Kapak Görseli Yan Yana */}
                <div className="flex gap-3">
                  {/* Logo */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex-1">
                    <span className="text-xs font-bold text-slate-700 block mb-2">
                      Logo
                    </span>

                    {formData.logoUrl ? (
                      <div className="relative w-16 h-16 mx-auto mb-2">
                        <img
                          src={formData.logoUrl}
                          className="w-full h-full object-cover rounded-lg border border-slate-200"
                          alt="Logo"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, logoUrl: "" })
                          }
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-0.5 rounded-full shadow-md"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer bg-white border border-dashed border-slate-300 hover:border-orange-500 text-slate-400 py-3 rounded-lg text-xs text-center transition-colors flex flex-col items-center justify-center h-16">
                        <div className="mb-1">
                          <ImageIcon size={14} />
                        </div>
                        <span>Logo Seç</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, "logoUrl")}
                        />
                      </label>
                    )}
                  </div>

                  {/* Mekan Fotoğrafı */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex-1">
                    <span className="text-xs font-bold text-slate-700 block mb-2">
                      Kapak Fotosu
                    </span>

                    {formData.venueImageUrl ? (
                      <div className="relative w-full h-16 mb-2">
                        <img
                          src={formData.venueImageUrl}
                          className="w-full h-full object-cover rounded-lg border border-slate-200"
                          alt="Kapak"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, venueImageUrl: "" })
                          }
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-0.5 rounded-full shadow-md"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer bg-white border border-dashed border-slate-300 hover:border-orange-500 text-slate-400 py-3 rounded-lg text-xs text-center transition-colors flex flex-col items-center justify-center h-16">
                        <div className="mb-1">
                          <ImageIcon size={14} />
                        </div>
                        <span>Foto Seç</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, "venueImageUrl")}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Galeri (Çoklu Fotoğraf) */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mt-4">
                  <span className="text-xs font-bold text-slate-700 block mb-2">
                    Galeri (Ekstra Fotoğraflar)
                  </span>

                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {/* Yüklenmiş Resimler */}
                    {formData.gallery &&
                      formData.gallery.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group"
                        >
                          <img
                            src={img}
                            className="w-full h-full object-cover"
                            alt="Galeri"
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(idx)}
                            className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-lg shadow-md opacity-80 hover:opacity-100"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}

                    {/* Ekleme Butonu */}
                    <label className="cursor-pointer bg-white border border-dashed border-slate-300 hover:border-orange-500 text-slate-400 aspect-square rounded-lg flex flex-col items-center justify-center gap-1 transition-colors hover:bg-orange-50">
                      <Plus size={20} />
                      <span className="text-[10px]">Ekle</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileChange(e, "gallery")}
                      />
                    </label>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Birden fazla fotoğraf seçebilirsiniz.
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <textarea
                  placeholder="Adres detayı..."
                  className="w-full border-slate-200 rounded-xl p-3 bg-slate-50 outline-none"
                  rows="2"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
            </div>

            {/* TAB 2: KAMPANYA EDİTÖRÜ */}
            <div className={activeTab === "campaign" ? "block" : "hidden"}>
              <div className="flex items-center justify-between mb-4 bg-orange-50 p-3 rounded-xl border border-orange-100">
                <span className="text-sm font-bold text-orange-800">
                  Kampanya Modu
                </span>
                <button
                  type="button"
                  onClick={() => setIsCampaignMode(!isCampaignMode)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${isCampaignMode ? "bg-orange-500" : "bg-slate-300"}`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${isCampaignMode ? "left-7" : "left-1"}`}
                  />
                </button>
              </div>

              {isCampaignMode ? (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                      Kampanya Metni
                    </label>
                    <input
                      placeholder="Örn: Öğrencilere %15 İndirim!"
                      className="w-full border-orange-200 rounded-xl p-3 bg-white focus:ring-2 focus:ring-orange-500 outline-none text-lg font-medium"
                      value={formData.campaignText}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          campaignText: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                      Banner Rengi
                    </label>
                    <div className="flex gap-2">
                      {[
                        "#ef4444",
                        "#f97316",
                        "#3b82f6",
                        "#10b981",
                        "#8b5cf6",
                      ].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, campaignColor: color })
                          }
                          className={`w-10 h-10 rounded-full border-2 transition-all ${formData.campaignColor === color ? "border-slate-800 scale-110 shadow-md" : "border-transparent opacity-70 hover:opacity-100"}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* LIVE PREVIEW BOX */}
                  <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden bg-slate-100">
                    <div className="bg-white border-b border-slate-200 px-3 py-1 text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <Eye size={12} /> CANLI ÖNİZLEME
                    </div>
                    <div className="relative aspect-video bg-white flex items-center justify-center overflow-hidden">
                      {/* Simüle Edilmiş Menü */}
                      {formData.menuUrl ? (
                        <img
                          src={formData.menuUrl}
                          className="w-full h-full object-cover opacity-80"
                          alt="Preview"
                        />
                      ) : (
                        <div className="text-slate-300 flex flex-col items-center">
                          <ImageIcon size={32} />
                          <span className="text-xs mt-1">Görsel Seçilmedi</span>
                        </div>
                      )}

                      {/* Kampanya Overlay */}
                      {formData.campaignText && (
                        <div
                          className="absolute top-0 w-full p-2 text-center text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
                          style={{ backgroundColor: formData.campaignColor }}
                        >
                          <Megaphone size={14} /> {formData.campaignText}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400">
                  <Megaphone size={48} className="mx-auto mb-2 opacity-20" />
                  <p>
                    Bu mekan için özel bir kampanya veya duyuru eklemek
                    isterseniz yukarıdan modu açın.
                  </p>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Modal Footer (Sabit) */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <button
            type="submit"
            form="venueForm"
            disabled={isSubmitting}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                {" "}
                <Loader2 className="animate-spin" /> Kaydediliyor...{" "}
              </>
            ) : (
              <>
                {" "}
                {venueToEdit
                  ? "Değişiklikleri Kaydet"
                  : isCampaignMode
                    ? "Kampanyalı Mekanı Kaydet"
                    : "Mekanı Kaydet"}{" "}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Yönetici Giriş Modalı ---
function LoginModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onClose();
    } catch (err) {
      setError("Giriş başarısız. Bilgileri kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-scale-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Yönetici Girişi</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              E-posta
            </label>
            <input
              type="email"
              required
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Şifre
            </label>
            <input
              type="password"
              required
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 active:scale-[0.98] transition-all flex justify-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
}
