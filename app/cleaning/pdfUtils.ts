import jsPDF from 'jspdf';
import { CleaningTask } from '@/services/cleaningService';

/**
 * Türkçe karakterleri PDF'de gösterilebilir hale getirir
 * jsPDF'in varsayılan fontu Türkçe karakterleri desteklemediği için
 * karakterleri İngilizce karşılıklarına dönüştürür
 */
const encodeText = (text: string): string => {
    const turkishMap: { [key: string]: string } = {
        'ğ': 'g',
        'Ğ': 'G',
        'ü': 'u',
        'Ü': 'U',
        'ş': 's',
        'Ş': 'S',
        'ı': 'i',
        'İ': 'I',
        'ö': 'o',
        'Ö': 'O',
        'ç': 'c',
        'Ç': 'C'
    };

    return text.split('').map(char => turkishMap[char] || char).join('');
};

/**
 * Temizlik planını PDF olarak oluşturur ve indirir
 */
export const generateCleaningPlanPDF = (
    tasks: CleaningTask[],
    date: Date,
    hotelName?: string
) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    // Renkler
    const colors = {
        primary: [102, 126, 234] as const,
        checkout: [239, 68, 68] as const,
        daily: [59, 130, 246] as const,
        text: [0, 0, 0] as const,
        lightGray: [243, 244, 246] as const,
        darkGray: [107, 114, 128] as const,
        white: [255, 255, 255] as const
    };

    // Header - Gradient effect simulation
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Başlık
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text(encodeText('Günlük Temizlik Planı'), margin + 5, 18);

    // Tarih
    doc.setFontSize(10);
    const dateStr = new Intl.DateTimeFormat('tr-TR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        weekday: 'long'
    }).format(date);
    doc.text(encodeText(dateStr), margin + 5, 26);

    // Otel adı
    if (hotelName) {
        doc.setFontSize(9);
        doc.text(encodeText(hotelName), margin + 5, 32);
    }

    yPosition = 50;

    // İstatistikler
    const checkoutTasks = tasks.filter(t => t.cleaningType === 'checkout');
    const dailyTasks = tasks.filter(t => t.cleaningType === 'daily');

    const boxWidth = (contentWidth - 10) / 3;
    const boxHeight = 20;

    // Toplam kutusu
    doc.setFillColor(...colors.lightGray);
    doc.roundedRect(margin, yPosition, boxWidth, boxHeight, 2, 2, 'F');
    doc.setTextColor(...colors.darkGray);
    doc.setFontSize(8);
    doc.text(encodeText('TOPLAM TEMİZLİK'), margin + boxWidth / 2, yPosition + 7, { align: 'center' });
    doc.setTextColor(...colors.text);
    doc.setFontSize(14);
    doc.text(tasks.length.toString(), margin + boxWidth / 2, yPosition + 16, { align: 'center' });

    // Tam Temizlik kutusu
    doc.setFillColor(254, 226, 226);
    doc.roundedRect(margin + boxWidth + 5, yPosition, boxWidth, boxHeight, 2, 2, 'F');
    doc.setTextColor(...colors.checkout);
    doc.setFontSize(8);
    doc.text(encodeText('TAM TEMİZLİK'), margin + boxWidth + 5 + boxWidth / 2, yPosition + 7, { align: 'center' });
    doc.setFontSize(14);
    doc.text(checkoutTasks.length.toString(), margin + boxWidth + 5 + boxWidth / 2, yPosition + 16, { align: 'center' });

    // Günlük Temizlik kutusu
    doc.setFillColor(219, 234, 254);
    doc.roundedRect(margin + (boxWidth + 5) * 2, yPosition, boxWidth, boxHeight, 2, 2, 'F');
    doc.setTextColor(...colors.daily);
    doc.setFontSize(8);
    doc.text(encodeText('GUNLUK TEMİZLİK'), margin + (boxWidth + 5) * 2 + boxWidth / 2, yPosition + 7, { align: 'center' });
    doc.setFontSize(14);
    doc.text(dailyTasks.length.toString(), margin + (boxWidth + 5) * 2 + boxWidth / 2, yPosition + 16, { align: 'center' });

    yPosition += boxHeight + 10;

    // Grid Ayarları
    const columns = 4;
    const gap = 4;
    const cardWidth = (contentWidth - ((columns - 1) * gap)) / columns;

    // Kart Çizim Fonksiyonu
    const drawTaskCard = (task: CleaningTask, x: number, y: number, width: number): number => {
        const isCheckout = task.cleaningType === 'checkout';
        const checklistItems = isCheckout ? [
            'Nevresim degisimi', 'Havlu degisimi', 'Toz alma',
            'Tuvalet temizligi', 'Genel temizlik'
        ] : [
            'Havlu degisimi', 'Cop bosaltma', 'Ayak ustu temizlik'
        ];

        // Yükseklik hesaplama (Auto height)
        const padding = 3;
        const headerHeight = 8;
        const titleHeight = 5;
        const itemHeight = 4;
        const itemGap = 1;
        const listHeight = checklistItems.length * (itemHeight + itemGap);
        const totalHeight = padding + headerHeight + titleHeight + listHeight + padding + 2;

        // Kart Arka Planı
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(isCheckout ? 239 : 59, isCheckout ? 68 : 130, isCheckout ? 68 : 246);
        doc.setLineWidth(0.3);
        doc.roundedRect(x, y, width, totalHeight, 1, 1, 'FD');

        // Oda No Badge
        doc.setFillColor(isCheckout ? 239 : 59, isCheckout ? 68 : 130, isCheckout ? 68 : 246);
        doc.roundedRect(x + padding, y + padding, width - (padding * 2), 6, 1, 1, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(encodeText(`ODA ${task.room_code}`), x + width / 2, y + padding + 4.2, { align: 'center' });

        // Checklist
        let currentY = y + padding + 14;
        const checkboxSize = 2.5;

        checklistItems.forEach(item => {
            // Checkbox
            doc.setDrawColor(150, 150, 150);
            doc.setLineWidth(0.2);
            doc.rect(x + padding, currentY - 2.2, checkboxSize, checkboxSize);

            // Metin
            doc.setTextColor(50, 50, 50);
            doc.setFontSize(6.5);
            doc.text(encodeText(item), x + padding + 4, currentY);

            currentY += itemHeight + itemGap;
        });

        return totalHeight;
    };

    // Katlara göre gruplama fonksiyonu
    const groupTasksByFloor = (tasks: CleaningTask[]) => {
        const floors = new Map<string, CleaningTask[]>();

        tasks.forEach(task => {
            const roomNo = task.room_no;
            let floorName = "DIGER";

            if (roomNo < 100) floorName = "ZEMIN KAT";
            else if (roomNo >= 100 && roomNo < 200) floorName = "1. KAT";
            else if (roomNo >= 200 && roomNo < 300) floorName = "2. KAT";
            else if (roomNo >= 300 && roomNo < 400) floorName = "3. KAT";
            else if (roomNo >= 400 && roomNo < 500) floorName = "4. KAT";
            else floorName = `${Math.floor(roomNo / 100)}. KAT`;

            if (!floors.has(floorName)) {
                floors.set(floorName, []);
            }
            floors.get(floorName)?.push(task);
        });

        // Katları sırala
        return Array.from(floors.entries()).sort((a, b) => {
            if (a[0].includes("ZEMIN")) return -1;
            if (b[0].includes("ZEMIN")) return 1;
            return a[0].localeCompare(b[0]);
        });
    };

    // Bölüm Çizim Fonksiyonu
    const drawSection = (title: string, tasks: CleaningTask[], headerColor: readonly number[]) => {
        if (tasks.length === 0) return;

        // Sayfa sonu kontrolü (Başlık için)
        if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = margin;
        }

        // Bölüm Başlığı
        doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
        doc.rect(margin, yPosition, contentWidth, 7, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(encodeText(title), margin + 3, yPosition + 5);
        yPosition += 10;

        // Grid Döngüsü
        let maxRowHeight = 0;

        tasks.forEach((task, index) => {
            const colIndex = index % columns;

            // Satır başı kontrolü (ilk eleman hariç)
            if (colIndex === 0 && index !== 0) {
                yPosition += maxRowHeight + gap;
                maxRowHeight = 0;

                // Sayfa sonu kontrolü
                if (yPosition > pageHeight - 30) { // Kart sığmazsa yeni sayfa
                    doc.addPage();
                    yPosition = margin;
                }
            }

            const xPosition = margin + (colIndex * (cardWidth + gap));

            // Kartı çiz ve yüksekliğini al
            const cardHeight = drawTaskCard(task, xPosition, yPosition, cardWidth);

            // Satırdaki en yüksek kartı güncelle
            if (cardHeight > maxRowHeight) {
                maxRowHeight = cardHeight;
            }
        });

        // Son satırın yüksekliğini ekle
        yPosition += maxRowHeight + 10;
    };

    // Katları çiz
    const floors = groupTasksByFloor(tasks);

    floors.forEach(([floorName, floorTasks]) => {
        // Odaları numaraya göre sırala
        floorTasks.sort((a, b) => a.room_no - b.room_no);

        // Bölümü çiz (Başlık rengi olarak primary rengi kullanıyoruz)
        drawSection(floorName, floorTasks, colors.primary);
    });

    // Footer - Her sayfaya
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);

        doc.setDrawColor(...colors.lightGray);
        doc.setLineWidth(0.5);
        doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

        doc.setFontSize(8);
        doc.setTextColor(...colors.darkGray);
        doc.text(
            encodeText(`Sayfa ${i} / ${totalPages}`),
            pageWidth / 2,
            pageHeight - 6,
            { align: 'center' }
        );

        const now = new Date();
        const timestamp = new Intl.DateTimeFormat('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(now);
        doc.text(
            encodeText(`${timestamp}`),
            pageWidth - margin,
            pageHeight - 6,
            { align: 'right' }
        );
    }

    // PDF'i indir
    const fileName = `Temizlik_Plani_${date.toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
};
