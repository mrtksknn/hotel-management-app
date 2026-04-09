export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  isHighlighted?: boolean;
  badge?: string;
  colorScheme: string;
  delay: number;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "butik",
    name: "BUTİK",
    price: "2,499",
    description: "1 işletme ve 10-50 odaya sahip butik oteller için ideal başlangıç.",
    features: [
      "Maks. 50 Oda Yönetimi",
      "Temel Rezervasyon Takibi",
      "1 Yönetici Hesabı",
    ],
    buttonText: "14 Gün Dene",
    colorScheme: "blue",
    delay: 0
  },
  {
    id: "standart",
    name: "STANDART",
    price: "3,999",
    description: "2 işletme ve 50-100 oda arası oteller için tüm premium özellikler.",
    badge: "EN POPÜLER",
    isHighlighted: true,
    features: [
      "Maks. 100 Oda Yönetimi",
      "Kanban Check-in / Check-out",
      "5 Kullanıcıya Kadar",
      "Gelişmiş Dinamik İstatistik",
      "14 Saat Canlı Destek"
    ],
    buttonText: "Hemen Başla",
    colorScheme: "blue",
    delay: 1
  },
  {
    id: "premium",
    name: "PREMİUM",
    price: "9,999",
    description: "2+ işletme ve 100+ odaya sahip büyük oteller ve zincirler için sınırsız erişim.",
    features: [
      "Sınırsız Oda Kapasitesi",
      "Sınırsız Kullanıcı ve Alt Roller",
      "Temizlik Görevlisi Arayüzü",
      "Çoklu-Şube (Tenant) Desteği",
      "7/24 VIP Müşteri Temsilcisi"
    ],
    buttonText: "Müşteri Temsilcisine Ulaş",
    colorScheme: "blue",
    delay: 2
  }
];
