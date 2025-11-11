export interface Room {
  floor: number;
  no: number;
  code: string;
}
export interface Month {
  name: string;
  days: number;
}

export const typeColors: Record<string, string> = {
  "AİLE": "#3182ce",    // Mavi
  "GENİŞ": "#38a169",   // Yeşil
  "SETLİ": "#805ad5",   // Mor
  "DOUBLE": "#dd6b20",  // Turuncu
  "TRIPLE": "#e53e3e",  // Kırmızı
  "TERASLI": "#718096", // Gri
};

export interface Person {
  firstName: string;
  lastName: string;
  birthDate: string; // "dd.mm.yyyy"
}

export interface Reservation {
    id: number;
    giris_tarihi: Date;
    isim: string;
    baslangic_tarihi: Date;
    bitis_tarihi: Date;
    gece_sayisi: number;
    pax: number;
    cocuk_sayisi: number;
    bebek_sayisi: number;
    ucret: string;
}