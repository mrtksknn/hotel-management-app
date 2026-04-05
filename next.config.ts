import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  devIndicators: false,

  // Aşağıdaki yapılandırmaları projeye ekleyin:
  output: "export", // Uygulamayı statik HTML sekrinde build etmesini sağlar

  // Eğer sayfanızın adresi username.github.io/hotel-management-app şeklinde olacaksa:
  // Repo isminizi '/' ile başlayacak şekilde basePath'e eklemelisiniz.
  // Özel bir domain kullanacaksanız veya repo adınız "KullaniciAdi.github.io" ise basePath kısmını silebilirsiniz.
  basePath: "/hotel-management-app",

  images: {
    unoptimized: true, // GitHub Pages standart Next.js resim optimizasyon sunucusunu desteklemediği için zorunludur.
  },
};

export default nextConfig;
