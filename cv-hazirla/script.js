document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const analyzeBtn = document.getElementById("analyzeBtn");
  const newAnalysisBtn = document.getElementById("newAnalysisBtn");
  const inputSection = document.getElementById("inputSection");
  const reportSection = document.getElementById("reportSection");
  const loadingOverlay = document.getElementById("loadingOverlay");
  const cvInput = document.getElementById("cvInput");
  const jobInput = document.getElementById("jobInput");
  const cvCount = document.getElementById("cvCount");
  const jobCount = document.getElementById("jobCount");

  // Character Counters
  const updateCount = (input, display) => {
    display.textContent = `${input.value.length} Karakter`;
  };

  cvInput.addEventListener("input", () => updateCount(cvInput, cvCount));
  jobInput.addEventListener("input", () => updateCount(jobInput, jobCount));

  // Analyze Button Click
  analyzeBtn.addEventListener("click", () => {
    const cvText = cvInput.value.trim();
    const jobText = jobInput.value.trim();



    startAnalysis(cvText, jobText);
  });

  // New Analysis Button Click
  newAnalysisBtn.addEventListener("click", () => {
    reportSection.classList.add("hidden");
    inputSection.style.display = "block";
    window.scrollTo(0, 0);
  });

  // Copy Summary Button
  document
    .getElementById("copySummaryBtn")
    .addEventListener("click", function () {
      const text = document.getElementById("executiveSummaryText").innerText;
      navigator.clipboard.writeText(text).then(() => {
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fa-solid fa-check"></i> Kopyalandı';
        setTimeout(() => {
          this.innerHTML = originalText;
        }, 2000);
      });
    });

  // --- CORE LOGIC ---

  function startAnalysis(cv, job) {
    // Show Loading
    loadingOverlay.classList.add("active");

    // Simulate Processing Steps
    const steps = [
      "Metinler ayrıştırılıyor...",
      "Anahtar kelimeler çıkarılıyor...",
      "Semantik eşleştirme yapılıyor...",
      "STAR uyumluluğu kontrol ediliyor...",
      "Rapor oluşturuluyor...",
    ];

    let stepIndex = 0;
    const loadingText = document.getElementById("loadingText");

    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        loadingText.textContent = steps[stepIndex];
        stepIndex++;
      }
    }, 600);

    // Finish after 3 seconds
    setTimeout(() => {
      clearInterval(interval);
      loadingOverlay.classList.remove("active");
      showResults(cv, job);
    }, 3000);
  }

  function showResults(cv, job) {
    inputSection.style.display = "none";
    reportSection.classList.remove("hidden");

    // 1. Keyword Extraction & Scoring
    const analysis = analyzeKeywords(cv, job);

    // Update Score
    animateScore(analysis.score);
    document.getElementById("scoreVerdict").textContent = getVerdict(
      analysis.score
    );
    document.getElementById("scoreVerdict").style.color = getScoreColor(
      analysis.score
    );
    document.querySelector(".score-fill").style.stroke = getScoreColor(
      analysis.score
    );

    // Update Missing Keywords
    const missingContainer = document.getElementById("missingKeywords");
    missingContainer.innerHTML = "";
    if (analysis.missing.length === 0) {
      missingContainer.innerHTML =
        '<span class="tag" style="background:rgba(16,185,129,0.1); color:#10b981; border-color:rgba(16,185,129,0.2)">Tam Uyum! Eksik kelime bulunamadı.</span>';
    } else {
      analysis.missing.forEach((word) => {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = word;
        missingContainer.appendChild(tag);
      });
    }

    // 2. STAR Optimization
    generateStarOptimization(cv, analysis.keywords);

    // 3. Interview Questions
    generateInterviewQuestions(job);

    // 4. Red Flag Scanner
    detectRedFlags(job);

    // 5. 90-Day Plan
    generate90DayPlan(job);

    // 6. Follow-up Email
    generateFollowUpEmail(job);

    // 7. LinkedIn Message
    generateLinkedinMessage(job, analysis.score);

    // 8. Cliche Detector
    detectCliches(cv);

    // 9. Culture Decoder
    decodeCulture(job);

    // 10. Career Roadmap
    generateCareerRoadmap(cv, job, analysis.missing);

    window.scrollTo(0, 0);
  }

  // --- HELPER FUNCTIONS ---

  function analyzeKeywords(cv, job) {
    // Technical Keywords Whitelist (Expanded & Categorized)
    const techKeywords = new Set([
        // Languages
        'python', 'java', 'javascript', 'typescript', 'c#', 'c++', 'go', 'ruby', 'php', 'swift', 'kotlin', 'rust', 'sql', 'nosql', 'html', 'css', 'bash', 'shell', 'r', 'scala', 'perl', 'dart', 'assembly', 'matlab',
        // Frameworks & Libraries
        'react', 'angular', 'vue', 'next.js', 'node.js', 'django', 'flask', 'spring', 'boot', '.net', 'laravel', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn', 'keras', 'spark', 'hadoop', 'flutter', 'react native', 'express', 'fastapi', 'hibernate', 'entity framework', 'jquery', 'bootstrap', 'tailwind',
        // Tools & DevOps & Cloud
        'git', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'jenkins', 'jira', 'figma', 'postman', 'swagger', 'redis', 'mongodb', 'postgresql', 'mysql', 'oracle', 'elasticsearch', 'kafka', 'rabbitmq', 'linux', 'unix', 'ubuntu', 'nginx', 'apache', 'ansible', 'terraform', 'prometheus', 'grafana', 'splunk', 'circleci', 'gitlab', 'bitbucket',
        // Concepts & Methodologies
        'rest', 'api', 'graphql', 'mvc', 'mvvm', 'oop', 'solid', 'agile', 'scrum', 'kanban', 'ci/cd', 'tdd', 'bdd', 'microservices', 'serverless', 'cloud', 'big data', 'machine learning', 'ai', 'nlp', 'computer vision', 'data science', 'data engineering', 'etl', 'data warehouse', 'data lake', 'bi', 'tableau', 'power bi', 'sap', 'erp', 'crm', 'saas', 'paas', 'iaas', 'cyber security', 'blockchain', 'iot', 'robotics', 'algorithms', 'data structures', 'design patterns', 'system design', 'distributed systems'
    ]);

    // Aggressive Stop Words List (To filter out "iş", "gıda", "tanımı" etc.)
    const stopWords = new Set([
        've', 'ile', 'için', 'bir', 'bu', 'şu', 'o', 'de', 'da', 'ki', 'mi', 'mu', 'ama', 'fakat', 'lakin', 'ancak', 'veya', 'ya', 'hem', 'eğer', 'ise', 'diye', 'gibi', 'kadar', 'böyle', 'şöyle', 'neden', 'niçin', 'nasıl', 'ne', 'kim', 'hangi', 'her', 'tüm', 'bütün', 'bazı', 'birkaç', 'çok', 'az', 'daha', 'en', 'mü', 'mı', 'olan', 'olarak', 'yapmak', 'etmek', 'çalışmak', 'iş', 'görev', 'sorumluluk', 'tanım', 'tanımı', 'aranan', 'nitelik', 'nitelikler', 'genel', 'bizim', 'sizin', 'eden', 'büyük', 'küçük', 'yeni', 'eski', 'iyi', 'kötü', 'var', 'yok', 'sağlamak', 'oluşturmak', 'geliştirmek', 'takip', 'analiz', 'süreç', 'proje', 'ekip', 'takım', 'yönetim', 'destek', 'hizmet', 'müşteri', 'aday', 'başvuru', 'şirket', 'firma', 'kurum', 'departman', 'pozisyon', 'tecrübe', 'deneyim', 'yıl', 'mezun', 'üniversite', 'lisans', 'yüksek', 'derece', 'bilgi', 'beceri', 'yetkinlik', 'seviye', 'ileri', 'orta', 'başlangıç', 'ilgili', 'alakalı', 'konusunda', 'hakkında', 'üzerine', 'tarafından', 'sayesinde', 'amacıyla', 'yoluyla', 'halinde', 'durumunda', 'süresince', 'boyunca', 'içinde', 'dışında', 'arasında', 'üzerinde', 'altında', 'yanında', 'karşısında', 'önünde', 'arkasında', 'sonunda', 'başında', 'ortasında', 'kenarında', 'köşesinde', 'yakınında', 'uzağında', 'etrafında', 'çevresinde', 'civarında', 'yönünde', 'tarafında', 'kısmında', 'bölümünde', 'alanında', 'sahasında', 'sektöründe', 'piyasasında', 'pazarında', 'dünyasında', 'ortamında', 'bünyesinde', 'çatısı', 'gıda', 'tekstil', 'otomotiv', 'inşaat', 'sağlık', 'turizm', 'finans', 'bankacılık', 'eğitim', 'perakende', 'lojistik', 'enerji', 'telekom', 'medya', 'reklam', 'pazarlama', 'satış', 'insan', 'kaynakları', 'muhasebe', 'idari', 'teknik', 'mühendis', 'uzman', 'yetkili', 'sorumlu', 'müdür', 'direktör', 'başkan', 'yardımcı', 'stajyer', 'asistan', 'koordinatör', 'danışman', 'temsilci', 'eleman', 'personel', 'üye', 'ortak', 'sahip', 'kurucu', 'lider', 'yönetici', 'amir', 'şef', 'usta', 'çırak', 'kalfa', 'memur', 'işçi', 'çalışan', 'gönüllü', 'öğrenci', 'mezun', 'doktora', 'master', 'lisans', 'önlisans', 'lise', 'ilköğretim', 'okul', 'kolej', 'enstitü', 'fakülte', 'bölüm', 'sınıf', 'ders', 'kurs', 'sertifika', 'diploma', 'belge', 'rapor', 'sunum', 'toplantı', 'görüşme', 'mülakat', 'sınav', 'test', 'proje', 'ödev', 'tez', 'makale', 'yayın', 'kitap', 'dergi', 'gazete', 'bülten', 'blog', 'web', 'site', 'sayfa', 'link', 'adres', 'mail', 'telefon', 'adres', 'konum', 'yer', 'zaman', 'tarih', 'saat', 'gün', 'hafta', 'ay', 'yıl', 'dönem', 'süre', 'vakit', 'an', 'şimdi', 'sonra', 'önce', 'bugün', 'yarın', 'dün', 'sabah', 'öğle', 'akşam', 'gece', 'haftasonu', 'haftaiçi', 'bayram', 'tatil', 'izin', 'mesai', 'vardiya', 'nöbet', 'izinli', 'raporlu', 'hasta', 'sağlam', 'engelli', 'emekli', 'sigorta', 'maaş', 'ücret', 'prim', 'ikramiye', 'yan', 'hak', 'sosyal', 'yardım', 'yemek', 'yol', 'servis', 'lojman', 'kreş', 'spor', 'salon', 'havuz', 'sauna', 'masaj', 'kuaför', 'berber', 'terzi', 'kuru', 'temizleme', 'market', 'bakkal', 'kasap', 'manav', 'fırın', 'pastane', 'kafe', 'restoran', 'lokanta', 'büfe', 'kantin', 'çay', 'kahve', 'su', 'içecek', 'yiyecek', 'gıda', 'beslenme', 'diyet', 'sağlık', 'hastalık', 'tedavi', 'ilaç', 'doktor', 'hemşire', 'hasta', 'bakıcı', 'hastane', 'klinik', 'sağlık', 'ocağı', 'eczane', 'diş', 'göz', 'kulak', 'burun', 'boğaz', 'kalp', 'damar', 'cerrahi', 'dahiliye', 'ortopedi', 'fizik', 'tedavi', 'psikoloji', 'psikiyatri', 'nöroloji', 'dermatoloji', 'üroloji', 'jinekoloji', 'doğum', 'çocuk', 'bebek', 'yaşlı', 'kadın', 'erkek', 'insan', 'hayvan', 'bitki', 'doğa', 'çevre', 'iklim', 'hava', 'su', 'toprak', 'ateş', 'rüzgar', 'yağmur', 'kar', 'dolu', 'sis', 'bulut', 'güneş', 'ay', 'yıldız', 'gezegen', 'evren', 'uzay', 'dünya', 'ülke', 'şehir', 'il', 'ilçe', 'semt', 'mahalle', 'sokak', 'cadde', 'meydan', 'park', 'bahçe', 'orman', 'deniz', 'göl', 'nehir', 'dere', 'dağ', 'tepe', 'ova', 'yayla', 'vadi', 'kanyon', 'mağara', 'ada', 'yarımada', 'kıta', 'okyanus', 'kutup', 'çöl', 'buzul', 'volkan', 'deprem', 'sel', 'heyelan', 'çığ', 'fırtına', 'kasırga', 'hortum', 'tsunami', 'yangın', 'patlama', 'kaza', 'felaket', 'afet', 'kriz', 'sorun', 'problem', 'hata', 'yanlış', 'eksik', 'kusur', 'ayıp', 'suç', 'ceza', 'yasak', 'kural', 'kanun', 'yasa', 'yönetmelik', 'tüzük', 'genelge', 'tebliğ', 'karar', 'hüküm', 'emir', 'talimat', 'uyarı', 'ihtar', 'ihbar', 'şikayet', 'dava', 'mahkeme', 'hakim', 'savcı', 'avukat', 'polis', 'jandarma', 'asker', 'güvenlik', 'bekçi', 'zabıta', 'memur', 'devlet', 'hükümet', 'belediye', 'bakanlık', 'müdürlük', 'valilik', 'kaymakamlık', 'muhtarlık', 'elçilik', 'konsolosluk', 'dernek', 'vakıf', 'sendika', 'oda', 'birlik', 'federasyon', 'konfederasyon', 'kulüp', 'topluluk', 'grup', 'takım', 'ekip', 'kadro', 'heyet', 'komisyon', 'kurul', 'meclis', 'parlamento', 'senato', 'kongre', 'konferans', 'seminer', 'panel', 'forum', 'zirve', 'fuar', 'sergi', 'festival', 'şenlik', 'tören', 'kutlama', 'parti', 'davet', 'ziyaret', 'gezi', 'tur', 'tatil', 'seyahat', 'yolculuk', 'ulaşım', 'trafik', 'araç', 'araba', 'otobüs', 'minibüs', 'dolmuş', 'taksi', 'tren', 'metro', 'tramvay', 'vapur', 'gemi', 'uçak', 'helikopter', 'bisiklet', 'motosiklet', 'kamyon', 'tır', 'kamyonet', 'traktör', 'iş', 'makinesi', 'vinç', 'asansör', 'yürüyen', 'merdiven', 'bant', 'robot', 'makine', 'cihaz', 'alet', 'edevat', 'malzeme', 'eşya', 'ürün', 'mal', 'hizmet', 'meta', 'emtia', 'varlık', 'kaynak', 'sermaye', 'para', 'döviz', 'altın', 'gümüş', 'petrol', 'doğalgaz', 'elektrik', 'su', 'internet', 'telefon', 'televizyon', 'radyo', 'gazete', 'dergi', 'kitap', 'kütüphane', 'müze', 'tiyatro', 'sinema', 'konser', 'opera', 'bale', 'dans', 'müzik', 'resim', 'heykel', 'fotoğraf', 'video', 'film', 'dizi', 'belgesel', 'haber', 'spor', 'oyun', 'eğlence', 'hobi', 'sanat', 'kültür', 'edebiyat', 'tarih', 'coğrafya', 'felsefe', 'sosyoloji', 'psikoloji', 'mantık', 'matematik', 'fizik', 'kimya', 'biyoloji', 'astronomi', 'tıp', 'eczacılık', 'diş', 'hekimliği', 'veterinerlik', 'mühendislik', 'mimarlık', 'hukuk', 'iktisat', 'işletme', 'maliye', 'kamu', 'yönetimi', 'uluslararası', 'ilişkiler', 'siyaset', 'bilimi', 'iletişim', 'gazetecilik', 'halkla', 'ilişkiler', 'reklamcılık', 'radyo', 'televizyon', 'sinema', 'tasarım', 'grafik', 'moda', 'tekstil', 'endüstri', 'ürünleri', 'iç', 'mimarlık', 'peyzaj', 'mimarlığı', 'şehir', 've', 'bölge', 'planlama', 'gıda', 'ziraat', 'orman', 'su', 'ürünleri', 'maden', 'jeoloji', 'jeofizik', 'meteoroloji', 'harita', 'çevre', 'nükleer', 'enerji', 'sistemleri', 'biyomedikal', 'mekatronik', 'otomotiv', 'uçak', 'uzay', 'gemi', 'inşaatı', 'denizcilik', 'işletmeleri', 'güverte', 'makine', 'lojistik', 'ulaştırma', 'havacılık', 'pilotaj', 'sivil', 'hava', 'ulaştırma', 'işletmeciliği', 'turizm', 'otel', 'işletmeciliği', 'gastronomi', 'mutfak', 'sanatları', 'rekreasyon', 'spor', 'yöneticiliği', 'antrenörlük', 'beden', 'eğitimi', 'öğretmenliği', 'ilköğretim', 'okul', 'öncesi', 'özel', 'eğitim', 'yabancı', 'diller', 'türkçe', 'tarih', 'coğrafya', 'felsefe', 'sosyoloji', 'psikoloji', 'rehberlik', 've', 'psikolojik', 'danışmanlık', 'ilahiyat', 'islami', 'ilimler', 'dini', 'bilimler'
    ]);

    // Tokenize and clean
    const tokenize = (text) => text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g," ").split(/\s+/);
    
    const jobTokens = tokenize(job);
    const cvTokens = new Set(tokenize(cv));

    // Count frequency in Job
    const freqMap = {};
    let techMatchCount = 0;
    let totalTechInJob = 0;

    jobTokens.forEach(w => {
        // 1. Is it a known Tech Keyword?
        if (techKeywords.has(w)) {
            freqMap[w] = (freqMap[w] || 0) + 10; // High weight for tech
            totalTechInJob++;
        } 
        // 2. Is it NOT a stop word and looks significant?
        else if (!stopWords.has(w) && w.length > 2 && isNaN(w)) {
            // Only add non-tech words if they appear frequently enough to be "keywords"
            // But give them very low weight compared to tech
            freqMap[w] = (freqMap[w] || 0) + 1;
        }
    });

    // Sort by frequency
    const sortedKeywords = Object.keys(freqMap).sort((a, b) => freqMap[b] - freqMap[a]).slice(0, 15);

    // Check matches
    const missing = sortedKeywords.filter(w => !cvTokens.has(w));
    
    // Custom Scoring Logic
    // Calculate how many TECH keywords are present vs missing
    const jobTechKeywords = [...new Set(jobTokens.filter(t => techKeywords.has(t)))];
    const cvTechKeywords = new Set([...cvTokens].filter(t => techKeywords.has(t)));
    
    let techScore = 0;
    if (jobTechKeywords.length > 0) {
        const matchedTech = jobTechKeywords.filter(t => cvTechKeywords.has(t)).length;
        techScore = (matchedTech / jobTechKeywords.length) * 100;
    } else {
        // If no tech keywords found in job, fall back to general match
        const matches = sortedKeywords.length - missing.length;
        techScore = (matches / sortedKeywords.length) * 100;
    }

    let score = Math.floor(techScore);
    if (score < 40) score = 40; // Base floor
    if (score > 98) score = 98;

    return { score, missing, keywords: sortedKeywords };
  }

  function animateScore(target) {
    const scoreVal = document.getElementById("scoreValue");
    const scorePath = document.getElementById("scorePath");
    let current = 0;

    const interval = setInterval(() => {
      if (current >= target) {
        clearInterval(interval);
      } else {
        current++;
        scoreVal.textContent = current;
        scorePath.style.strokeDasharray = `${current}, 100`;
      }
    }, 20);
  }

  function getVerdict(score) {
    if (score >= 80) return "Mükemmel Uyum";
    if (score >= 60) return "Güçlü Aday";
    if (score >= 40) return "Geliştirilmeli";
    return "Zayıf Eşleşme";
  }

  function getScoreColor(score) {
    if (score >= 80) return "#10b981"; // Green
    if (score >= 60) return "#3b82f6"; // Blue
    if (score >= 40) return "#f59e0b"; // Orange
    return "#ef4444"; // Red
  }

  function generateStarOptimization(cv, keywords) {
    const container = document.getElementById("optimizationContainer");
    container.innerHTML = "";

    // Try to find bullet points or short sentences
    const lines = cv
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 20 && l.length < 150);

    // Pick 2 random lines or use defaults
    const selectedLines = [];
    if (lines.length >= 2) {
      selectedLines.push(lines[Math.floor(Math.random() * lines.length)]);
      let second = lines[Math.floor(Math.random() * lines.length)];
      while (second === selectedLines[0])
        second = lines[Math.floor(Math.random() * lines.length)];
      selectedLines.push(second);
    } else {
      selectedLines.push("Satış hedeflerini gerçekleştirdim.");
      selectedLines.push("Proje yönetiminde görev aldım.");
    }

    selectedLines.forEach((line) => {
      const item = document.createElement("div");
      item.className = "opt-item";

      // Mock transformation logic
      let improved = line;
      if (
        !improved.includes("%") &&
        !improved.includes("TL") &&
        !improved.includes("$")
      ) {
        improved += ` sonucunda departman verimliliğini %15 artırarak yıllık hedeflerin tutturulmasına doğrudan katkı sağladım.`;
      }

      // Make it sound more corporate
      improved = improved
        .replace("yaptım", "gerçekleştirdim")
        .replace("çalıştım", "faaliyet gösterdim");

      item.innerHTML = `
                <div class="opt-before">
                    <span class="label bad"><i class="fa-solid fa-xmark"></i> Mevcut İfade (Zayıf)</span>
                    <p class="opt-content">"${line}"</p>
                </div>
                <div class="opt-after">
                    <span class="label good"><i class="fa-solid fa-check"></i> STAR Revizyonu (Güçlü)</span>
                    <p class="opt-content improved">"${improved}"</p>
                </div>
            `;
      container.appendChild(item);
    });
  }

  function generateInterviewQuestions(job) {
    const techContainer = document.getElementById("technicalQuestions");
    const behContainer = document.getElementById("behavioralQuestions");

    // Dictionary for mock intelligence
    const questionBank = {
      yazılım: {
        q: "Kullandığınız en karmaşık tasarım deseni (Design Pattern) hangisiydi ve neden onu seçtiniz?",
        s: "Teknik derinliğini göster ama iş problemine odaklan.",
      },
      pazarlama: {
        q: "Düşük bütçeli bir kampanyada ROI'yi (Yatırım Getirisi) nasıl maksimize edersiniz?",
        s: "Veri odaklı karar alma sürecini vurgula.",
      },
      satış: {
        q: "Hayır cevabı aldığınız zorlu bir müşteriyi nasıl ikna edersiniz?",
        s: "Empati ve çözüm odaklı yaklaşımını öne çıkar.",
      },
      yönetim: {
        q: "Düşük performans gösteren bir ekibi nasıl motive edersiniz?",
        s: "Koçluk ve net hedef belirleme yetkinliğine değin.",
      },
      veri: {
        q: "Veri kalitesi sorunlarını nasıl tespit eder ve çözersiniz?",
        s: "Süreç ve otomasyon vurgusu yap.",
      },
    };

    // Detect domain
    let domain = "genel";
    const jobLower = job.toLowerCase();
    if (
      jobLower.includes("yazılım") ||
      jobLower.includes("developer") ||
      jobLower.includes("kod")
    )
      domain = "yazılım";
    else if (jobLower.includes("pazarlama") || jobLower.includes("marketing"))
      domain = "pazarlama";
    else if (jobLower.includes("satış") || jobLower.includes("sales"))
      domain = "satış";
    else if (jobLower.includes("yönetici") || jobLower.includes("müdür"))
      domain = "yönetim";
    else if (jobLower.includes("veri") || jobLower.includes("analist"))
      domain = "veri";

    // Technical Questions
    const tQ = questionBank[domain] || {
      q: "Bu pozisyondaki en büyük teknik zorluk sizce nedir ve nasıl üstesinden gelirsiniz?",
      s: "Sektör bilginizi ve problem çözme yeteneğinizi kanıtlayın.",
    };

    techContainer.innerHTML = `
            <div class="question-card">
                <span class="q-text">1. ${tQ.q}</span>
                <div class="strategy-box"><strong>💡 Altın Strateji:</strong> ${tQ.s}</div>
            </div>
            <div class="question-card">
                <span class="q-text">2. Sektördeki son gelişmeleri nasıl takip ediyorsunuz ve işinize nasıl entegre ediyorsunuz?</span>
                <div class="strategy-box"><strong>💡 Altın Strateji:</strong> Sürekli öğrenme (Continuous Learning) tutkunu göster.</div>
            </div>
        `;

    // Behavioral Questions
    behContainer.innerHTML = `
            <div class="question-card">
                <span class="q-text">1. Bir çalışma arkadaşınızla fikir ayrılığına düştüğünüz bir zamanı anlatın. Sonuç ne oldu?</span>
                <div class="strategy-box"><strong>💡 Altın Strateji:</strong> 'Çatışma' değil 'Fikir Çeşitliliği' olarak çerçevele. Profesyonelliği koru.</div>
            </div>
            <div class="question-card">
                <span class="q-text">2. Başarısız olduğunuz bir projeyi ve bundan ne öğrendiğinizi anlatın.</span>
                <div class="strategy-box"><strong>💡 Altın Strateji:</strong> Hatayı kabul et, alınan dersi ve sonraki başarıyı vurgula (Growth Mindset).</div>
            </div>
        `;
  }

  function detectRedFlags(job) {
      const container = document.getElementById('redFlagContainer');
      container.innerHTML = '';

      const flags = {
          'baskı altında': 'Toksik ve kaotik bir çalışma ortamı. Muhtemelen sürekli aciliyet var.',
          'biz bir aileyiz': 'Profesyonel sınırların ihlal edildiği, mesai saatlerinin belirsiz olduğu bir ortam.',
          'rekabetçi maaş': 'Piyasa ortalamasının altında veya şeffaf olmayan maaş politikası.',
          'esnek çalışma saatleri': '7/24 ulaşılabilir olmanızın beklendiği anlamına gelebilir.',
          'her işi yapan': 'Görev tanımının belirsiz olduğu ve tek kişiye 3 kişilik iş yükleneceği sinyali.',
          'dinamik ortam': 'Süreçlerin oturmadığı, sürekli değişen ve yorucu bir yapı.',
          'tutkulu': 'Düşük maaşı "iş sevgisiyle" telafi etmenizi bekleyen zihniyet.'
      };

      let foundCount = 0;
      const jobLower = job.toLowerCase();

      for (const [term, meaning] of Object.entries(flags)) {
          if (jobLower.includes(term)) {
              foundCount++;
              const card = document.createElement('div');
              card.className = 'red-flag-card';
              card.innerHTML = `
                  <span class="flag-term">"${term.toUpperCase()}"</span>
                  <p class="flag-meaning">${meaning}</p>
              `;
              container.appendChild(card);
          }
      }

      if (foundCount === 0) {
          container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--accent-green); font-size: 1.1rem;"><i class="fa-solid fa-shield-halved"></i> Temiz! İlan metninde belirgin bir "Red Flag" tespit edilmedi.</div>';
      }
  }

  function generate90DayPlan(job) {
      const container = document.getElementById('planContainer');
      
      // Basic logic to customize plan based on keywords
      const jobLower = job.toLowerCase();
      let focus = "Genel Adaptasyon";
      if (jobLower.includes('satış')) focus = "Müşteri Portföyü & Satış";
      else if (jobLower.includes('yazılım')) focus = "Kod Tabanı & Mimari";
      else if (jobLower.includes('yönetici')) focus = "Ekip Analizi & Strateji";

      const plan = [
          {
              period: "İLK 30 GÜN (Öğrenme & Analiz)",
              title: "Sünger Modu 🧽",
              items: [
                  "Şirket kültürünü, ürünleri ve mevcut süreçleri derinlemesine analiz edeceğim.",
                  "Kilit paydaşlarla (Stakeholders) birebir görüşmeler yapıp beklentileri netleştireceğim.",
                  `Mevcut ${focus} durumunu raporlayıp 'Hızlı Kazanım' (Quick Wins) fırsatlarını belirleyeceğim.`
              ]
          },
          {
              period: "30-60 GÜN (Katkı & İnşa)",
              title: "İlk Goller ⚽",
              items: [
                  "Belirlenen 'Hızlı Kazanım' projelerini hayata geçirip ilk somut çıktıları üreteceğim.",
                  "Süreçlerdeki verimsizlikleri tespit edip iyileştirme önerilerimi sunacağım.",
                  "Ekip içi iletişim ve işbirliği süreçlerine aktif katkı sağlamaya başlayacağım."
              ]
          },
          {
              period: "60-90 GÜN (Liderlik & Strateji)",
              title: "Tam Performans 🚀",
              items: [
                  "Artık otonom bir şekilde çalışarak, departman hedeflerine doğrudan etki edeceğim.",
                  "Uzun vadeli stratejik projelerin liderliğini üstleneceğim.",
                  "İlk çeyrek performansımı analiz edip, sonraki dönem için revize edilmiş bir yol haritası sunacağım."
              ]
          }
      ];

      container.innerHTML = plan.map(p => `
          <div class="plan-card">
              <span class="plan-period">${p.period}</span>
              <h4>${p.title}</h4>
              <ul class="plan-list">
                  ${p.items.map(i => `<li>${i}</li>`).join('')}
              </ul>
          </div>
      `).join('');
  }

  function generateFollowUpEmail(job) {
      const msgBox = document.getElementById('followUpEmail');
      
      let jobTitle = "Pozisyon";
      const lines = job.split('\n');
      if (lines.length > 0 && lines[0].length < 50) jobTitle = lines[0];

      const email = `Konu: Mülakat Teşekkür ve Devam Eden İlgim Hakkında - [Adınız Soyadınız] - ${jobTitle}

Sayın [Görüştüğünüz Kişinin Adı],

Dün/Bugün ${jobTitle} pozisyonu için ayırdığınız zaman ve paylaştığınız değerli bilgiler için çok teşekkür ederim.

Özellikle [Mülakatta Konuşulan Spesifik Bir Konu/Proje] hakkındaki vizyonunuz beni çok etkiledi. Bu görüşme, teknik yetkinliklerimin ve problem çözme yaklaşımımın, ekibinizin hedefleriyle ne kadar örtüştüğünü bir kez daha görmemi sağladı.

Şirketinizin büyüme yolculuğunda yer almak ve [Şirketin Bir Hedefi] konusuna katkı sağlamak için sabırsızlanıyorum.

Sürecin sonraki adımları hakkında haberlerinizi bekliyorum.

Saygılarımla,

[Adınız Soyadınız]
[Telefon Numaranız]
[LinkedIn Profiliniz]`;

      msgBox.innerText = email;

      document.getElementById('copyEmailBtn').addEventListener('click', function() {
          navigator.clipboard.writeText(email).then(() => {
              const originalText = this.innerHTML;
              this.innerHTML = '<i class="fa-solid fa-check"></i> Kopyalandı';
              setTimeout(() => { this.innerHTML = originalText; }, 2000);
          });
      });
  }

  function generateLinkedinMessage(job, score) {
      const msgBox = document.getElementById('linkedinMessage');
      
      // Extract company name if possible, else generic
      let company = "Şirketiniz";
      // Simple heuristic: look for "X şirketi" or assume it's in the first line
      
      const msg = `Merhaba [İsim],

${company} bünyesindeki açık pozisyonunuz için başvurumu ilettim. ${score > 70 ? 'Özellikle ilandaki teknik gereksinimlerle örtüşen deneyimimin' : 'Kariyer hedeflerim ve yetkinliklerimin'}, ekibinizin vizyonuyla güçlü bir uyum içinde olduğuna inanıyorum.

Müsaitliğinizde, bu pozisyona nasıl değer katabileceğimi kısaca konuşmaktan memnuniyet duyarım.

Saygılarımla,`;

      msgBox.innerText = msg;

      // Copy Button Logic
      document.getElementById('copyLinkedinBtn').addEventListener('click', function() {
          navigator.clipboard.writeText(msg).then(() => {
              const originalText = this.innerHTML;
              this.innerHTML = '<i class="fa-solid fa-check"></i> Kopyalandı';
              setTimeout(() => { this.innerHTML = originalText; }, 2000);
          });
      });
  }

  function detectCliches(cv) {
      const container = document.getElementById('clicheContainer');
      container.innerHTML = '';

      const cliches = {
          'takım oyuncusu': 'İşbirlikçi / Sinerji Odaklı',
          'çalışkan': 'Sonuç Odaklı / Disiplinli',
          'motive': 'İçsel Motivasyonu Yüksek',
          'dinamik': 'Hızlı Adapte Olan',
          'sorumluluk sahibi': 'İnisiyatif Alan',
          'iletişimi kuvvetli': 'Müzakere Yeteneği Güçlü',
          'hırslı': 'Başarı Odaklı',
          'yaratıcı': 'İnovatif Çözümler Üreten'
      };

      let foundCount = 0;
      const cvLower = cv.toLowerCase();

      for (const [bad, good] of Object.entries(cliches)) {
          if (cvLower.includes(bad)) {
              foundCount++;
              const card = document.createElement('div');
              card.className = 'cliche-card';
              card.innerHTML = `
                  <span class="cliche-word">${bad}</span>
                  <div class="cliche-arrow"><i class="fa-solid fa-arrow-down"></i> Yerine Bunu Kullan <i class="fa-solid fa-arrow-down"></i></div>
                  <span class="cliche-fix">${good}</span>
              `;
              container.appendChild(card);
          }
      }

      if (foundCount === 0) {
          container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--accent-green);"><i class="fa-solid fa-check-circle"></i> Harika! CV\'nizde klişe ifade bulunamadı.</div>';
      }
  }

  function decodeCulture(job) {
      const box = document.getElementById('cultureDecoder');
      const jobLower = job.toLowerCase();

      let cultureType = 'Kurumsal / Yapılandırılmış';
      let cultureClass = 'corporate';
      let desc = 'Bu şirket süreçlere, hiyerarşiye ve net tanımlanmış rollere önem veriyor. Risk almaktan ziyade, sürdürülebilirlik ve planlama ön planda.';
      let tip = 'Mülakatta "uyum", "süreç takibi" ve "uzun vadeli hedeflerden" bahset. Kurallara saygılı olduğunu hissettir.';

      // Startup signals
      const startupSignals = ['hızlı', 'esnek', 'dinamik', 'kaos', 'tutku', 'enerjik', 'büyüme', 'startup', 'girişim', 'rahat'];
      let signalCount = 0;
      startupSignals.forEach(s => { if (jobLower.includes(s)) signalCount++; });

      if (signalCount > 2) {
          cultureType = 'Startup / Hızlı Büyüme';
          cultureClass = 'startup';
          desc = 'Bu şirket hıza, esnekliğe ve inisiyatif almaya değer veriyor. "Kaos" ortamında kendi yolunu bulabilen, "iş tanımım değil" demeyen adaylar arıyorlar.';
          tip = 'Mülakatta "problem çözme", "hızlı adaptasyon" ve "kendi kendine öğrenme" yeteneklerini vurgula. Çok resmi olma, enerjik görün.';
      }

      box.innerHTML = `
          <span class="culture-tag ${cultureClass}">${cultureType}</span>
          <p class="culture-desc">${desc}</p>
          <div class="culture-tip">
              <strong><i class="fa-solid fa-lightbulb"></i> İçeriden Tüyo:</strong>
              ${tip}
          </div>
      `;
  }
  function generateCareerRoadmap(cv, job, missingKeywords) {
      // 1. Education Prescription
      const eduContainer = document.getElementById('educationContainer');
      const eduResources = {
          'python': { title: 'Python for Everybody (Coursera)', source: 'University of Michigan' },
          'java': { title: 'Java Programming Masterclass (Udemy)', source: 'Tim Buchalka' },
          'react': { title: 'Advanced React (Meta/Coursera)', source: 'Meta' },
          'aws': { title: 'AWS Certified Solutions Architect (Udemy)', source: 'Stephane Maarek' },
          'sql': { title: 'The Complete SQL Bootcamp (Udemy)', source: 'Jose Portilla' },
          'docker': { title: 'Docker Mastery (Udemy)', source: 'Bret Fisher' },
          'kubernetes': { title: 'Certified Kubernetes Administrator (Linux Foundation)', source: 'CNCF' },
          'agile': { title: 'Agile Crash Course (Udemy)', source: 'Agile Institute' },
          'machine learning': { title: 'Machine Learning Specialization (Coursera)', source: 'Andrew Ng' }
      };

      let eduHTML = '';
      const topMissing = missingKeywords.slice(0, 3); // Focus on top 3 missing
      
      if (topMissing.length === 0) {
          eduHTML = '<p class="audit-feedback" style="color:var(--accent-green)">Teknik yetkinlikleriniz bu ilan için oldukça yeterli görünüyor. Derinleşmek için "System Design" konularına odaklanabilirsiniz.</p>';
      } else {
          topMissing.forEach(keyword => {
              const res = eduResources[keyword] || { title: `${keyword.toUpperCase()} Masterclass`, source: 'Udemy / Coursera' };
              eduHTML += `
                  <div class="edu-item">
                      <span class="edu-title">${res.title}</span>
                      <div class="edu-source"><i class="fa-solid fa-link"></i> ${res.source}</div>
                  </div>
              `;
          });
      }
      eduContainer.innerHTML = eduHTML;

      // 2. Project Proposals
      const projContainer = document.getElementById('projectProposalContainer');
      const jobLower = job.toLowerCase();
      let domain = 'web';
      if (jobLower.includes('veri') || jobLower.includes('data')) domain = 'data';
      else if (jobLower.includes('mobil') || jobLower.includes('ios') || jobLower.includes('android')) domain = 'mobile';

      const projects = {
          'web': [
              {
                  title: 'E-Ticaret Analitik Dashboard',
                  tech: 'React, Node.js, PostgreSQL, Redis',
                  problem: 'Satış verilerinin anlık takibi ve stok optimizasyonu sorunu.',
                  cv: '• React ve Node.js kullanarak geliştirdiğim dashboard ile satış verilerini görselleştirip, stok maliyetlerini %15 düşüren bir simülasyon sundum.'
              },
              {
                  title: 'Task Yönetim SaaS (Microservices)',
                  tech: 'Docker, Kubernetes, Go/Node.js, RabbitMQ',
                  problem: 'Ölçeklenebilir mimari ve servisler arası asenkron iletişim.',
                  cv: '• Microservices mimarisiyle geliştirdiğim task yönetim uygulamasında, RabbitMQ ile asenkron iletişimi sağlayarak sistem yükünü %40 optimize ettim.'
              }
          ],
          'data': [
              {
                  title: 'Müşteri Kayıp (Churn) Tahmin Modeli',
                  tech: 'Python, Pandas, Scikit-Learn, XGBoost',
                  problem: 'Müşteri terk oranlarını önceden tespit edip önlem alma.',
                  cv: '• Geliştirdiğim Churn Prediction modeli ile %85 doğruluk oranı yakalayarak, riskli müşterilerin tespit edilmesini sağlayan bir pipeline kurdum.'
              },
              {
                  title: 'Otomatik ETL Pipeline',
                  tech: 'Apache Airflow, AWS S3, Redshift',
                  problem: 'Dağınık verilerin merkezi bir ambarda toplanması ve temizlenmesi.',
                  cv: '• Airflow kullanarak kurduğum ETL pipeline ile günlük 10GB veriyi işleyip, raporlama süreçlerini %60 hızlandıran bir otomasyon geliştirdim.'
              }
          ],
          'mobile': [
              {
                  title: 'Finansal Takip Uygulaması',
                  tech: 'Flutter/React Native, Firebase, Plaid API',
                  problem: 'Kişisel harcamaların kategorize edilmesi ve bütçe yönetimi.',
                  cv: '• Flutter ile geliştirdiğim, Firebase backend kullanan finans uygulaması, kullanıcıların harcama alışkanlıklarını analiz ederek tasarruf önerileri sunuyor.'
              },
              {
                  title: 'Artırılmış Gerçeklik (AR) Menü',
                  tech: 'Swift/Kotlin, ARKit/ARCore',
                  problem: 'Restoran menülerinin statik olması ve ürün deneyimi eksikliği.',
                  cv: '• AR teknolojisi kullanarak geliştirdiğim menü uygulaması, yemeklerin 3D modellerini masada görüntüleyerek sipariş deneyimini interaktif hale getirdi.'
              }
          ]
      };

      const selectedProjs = projects[domain] || projects['web'];
      projContainer.innerHTML = selectedProjs.map(p => `
          <div class="proj-card">
              <span class="proj-title">${p.title}</span>
              <div class="proj-detail"><strong>Teknolojiler:</strong> ${p.tech}</div>
              <div class="proj-detail"><strong>Problem:</strong> ${p.problem}</div>
              <div class="proj-cv-draft">${p.cv}</div>
          </div>
      `).join('');

      // 3. Project Audit
      const auditContainer = document.getElementById('projectAuditContainer');
      // Simple heuristic: check if CV mentions "proje" or "geliştirdim"
      if (cv.toLowerCase().includes('proje') || cv.toLowerCase().includes('geliştirdim')) {
          auditContainer.innerHTML = `
              <p class="audit-feedback">
                  CV'nizde projelerden bahsetmişsiniz, bu harika. Ancak bir <strong>Senior Tech Lead</strong> olarak şu eksikleri görüyorum:
                  <br><br>
                  1. <strong>Ölçek (Scale) Eksik:</strong> "Yaptım" demişsiniz ama kaç kullanıcı kullandı? Veri boyutu neydi? Trafik nasıldı? Bu detaylar eksik.
                  <br>
                  2. <strong>Mimari Kararlar:</strong> Neden SQL değil de NoSQL seçtiniz? Neden Monolith değil Microservices? Bu kararların gerekçesini (Trade-offs) belirtmemişsiniz.
                  <br>
                  3. <strong>Kod Kalitesi:</strong> GitHub linkiniz varsa, README dosyanızın "Kurulum" ve "Mimari Şema" içermesi şart. Test coverage (Test kapsamı) oranınızdan hiç bahsetmemişsiniz.
              </p>
          `;
      } else {
          auditContainer.innerHTML = `
              <p class="audit-feedback">
                  CV'nizde detaylandırılmış bir teknik proje göremedim. Senior roller için sadece iş deneyimi yetmez, <strong>GitHub</strong> üzerinde çalışan, kodu incelenebilir en az 2 proje olması kritik önem taşır. Yukarıdaki proje önerilerini mutlaka değerlendirin.
              </p>
          `;
      }

      // 4. Application Strategy
      const strategyContainer = document.getElementById('strategyContainer');
      strategyContainer.innerHTML = `
          <ul class="strategy-list">
              <li><strong>GitHub Profil Temizliği:</strong> Öne çıkan (Pinned) repolarınızın README dosyalarını bir ürün lansman sayfası gibi düzenleyin. Ekran görüntüleri ve GIF'ler ekleyin.</li>
              <li><strong>Vaka Analizi (Case Study):</strong> Başvuruya ek olarak, şirketin bir problemini (örn: web sitesi hızı, mobil uygulama UX'i) analiz eden 2 sayfalık mini bir rapor ekleyin. Bu sizi adayların %99'undan ayırır.</li>
              <li><strong>Teknik Blog Yazısı:</strong> "Bu projeyi yaparken ne öğrendim?" temalı bir Medium/LinkedIn makalesi yazın ve CV'nize linkleyin. İletişim becerinizi kanıtlar.</li>
              <li><strong>Networking:</strong> Şirketin mühendislik blogunu okuyun ve mülakatta "Geçen ay yazdığınız X makalesini okudum, Y teknolojisini kullanmanız ilgimi çekti" diyerek sohbeti başlatın.</li>
          </ul>
      `;
  }
});
