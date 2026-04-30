# BMU1208 Rapor Notları

Bu dosya, üniversite raporuna doğrudan uyarlanabilecek Türkçe içerik sağlar.

## Proje Özeti

Bu proje, Rust programlama dili ile yazılan performans kritik fonksiyonların WebAssembly formatına derlenerek tarayıcı içinde çalıştırılmasını gösteren etkileşimli bir web uygulamasıdır. Uygulama, JavaScript ve Rust/WASM sürümlerini aynı girdiler üzerinde çalıştırır, gerçek süreleri ölçer ve hızlanma oranlarını kullanıcıya gösterir.

## Problem Tanımı

Modern web uygulamalarında görüntü işleme, kriptografik hashleme, fraktal çizimi, QR üretimi ve dosya sıkıştırma gibi CPU yoğun işler kullanıcı arayüzünü yavaşlatabilir. Bu işlemler yalnızca JavaScript ile yazıldığında özellikle büyük girdilerde ana thread üzerinde bloklama yaşanabilir.

## Amaç ve Kapsam

Amaç, Rust'tan WebAssembly'ye derlenen kodun tarayıcıda nasıl kullanılabileceğini ve hangi durumlarda JavaScript'e göre performans avantajı sağlayabileceğini ölçülebilir şekilde göstermektir.

Kapsam:

- Tarayıcı içinde çalışan React + TypeScript arayüzü
- Rust 2024 ile yazılmış WASM hesaplama çekirdeği
- JavaScript referans implementasyonları
- Gerçek zamanlı ve toplu benchmark ekranları
- Web Worker ile arayüz donmasını azaltma
- Türkçe ve İngilizce arayüz
- Güvenlik ve gizlilik odaklı istemci tarafı mimari

## Kullanıcı Personaları

- Öğrenci: WebAssembly kavramını uygulamalı öğrenmek ister.
- Frontend geliştirici: CPU yoğun işlemleri tarayıcıda daha verimli çalıştırmak ister.
- Rust öğrenen geliştirici: Rust kodunun web ortamına nasıl taşındığını görmek ister.
- Performans meraklısı: JavaScript ve WASM sürelerini gerçek cihazında karşılaştırmak ister.

## Jobs To Be Done

- Bir geliştirici olarak, aynı algoritmanın JS ve WASM sürümlerini tek ekranda çalıştırıp farkı görmek istiyorum.
- Bir öğrenci olarak, raporumda kullanabileceğim gerçek benchmark çıktıları üretmek istiyorum.
- Bir kullanıcı olarak, yüklediğim dosya veya görselin sunucuya gitmediğinden emin olmak istiyorum.
- Bir geliştirici olarak, ağır bir hesaplama çalışırken arayüzün donmadığını göstermek istiyorum.

## Kullanıcı Hikayeleri

- Kullanıcı görsel yükler, filtre seçer, JS veya WASM ile çalıştırır ve süreyi görür.
- Kullanıcı kamera izni verir, canlı karelere filtre uygular ve FPS değerini izler.
- Kullanıcı Mandelbrot parametrelerini değiştirir, JS/WASM sürelerini karşılaştırır.
- Kullanıcı demo amaçlı parola ve salt girer, PBKDF2 hash çıktısını görür.
- Kullanıcı metin girer, QR kod üretir ve PNG olarak indirir.
- Kullanıcı dosya yükler, sıkıştırır, oranı görür ve mümkünse açma işlemiyle doğrular.
- Kullanıcı tüm benchmarkları çalıştırır ve JSON olarak dışa aktarır.

## Fonksiyonel Olmayan Gereksinimler Matrisi

| Gereksinim | Karşılık |
| --- | --- |
| Performans | WASM çekirdeği, benchmark ortalaması, Web Worker |
| Kullanılabilirlik | Responsive tasarım, hata durumları, boş durumlar |
| Erişilebilirlik | Etiketli kontroller, klavye focus, kontrast |
| Güvenlik | Dosya/parola/kamera verisi tarayıcıda kalır |
| Dağıtılabilirlik | Cloudflare Pages ve `_headers` yapılandırması |
| Test edilebilirlik | Rust, wasm-bindgen, TypeScript ve Vitest testleri |
| Sürdürülebilirlik | Modüler crate, reusable React bileşenleri |

## Teknoloji Yığını Açıklaması

- Rust: Performans kritik algoritmaların güvenli ve hızlı yazılması için kullanıldı.
- WebAssembly: Rust kodunun tarayıcıda çalışmasını sağlayan düşük seviyeli hedef format.
- wasm-bindgen: Rust fonksiyonlarının JavaScript/TypeScript tarafından çağrılmasını sağlar.
- React + TypeScript: Etkileşimli, tip güvenli ve bileşen tabanlı arayüz.
- Vite: Hızlı geliştirme sunucusu ve üretim build aracı.
- Web Worker: Ağır hesaplamayı ana UI thread dışına taşır.
- Cloudflare Pages: Statik yayınlama ve COOP/COEP header desteği.

## Mimari Açıklaması

Uygulama tamamen istemci tarafında çalışır. React arayüzü kullanıcı girdilerini alır, aynı işlem için JavaScript ve WASM fonksiyonlarını çalıştırır, süreleri ölçer ve sonuçları görselleştirir. Rust kodu `crates/wasm-core` içinde modüler olarak tutulur. `wasm-pack` build süreci sonucunda TypeScript tarafından import edilebilen WASM paketi üretilir.

Backend yoktur. Bu nedenle `openapi.yaml` gerekli değildir. Veri akışı tarayıcı belleği içinde kalır.

## Güvenlik Notları

- Parolalar hiçbir yere gönderilmez.
- Kamera kareleri yalnızca tarayıcı belleğinde işlenir.
- Yüklenen dosyalar sunucuya gönderilmez.
- Dosya ve görsel boyutu sınırlandırılmıştır.
- `dangerouslySetInnerHTML` kullanılmamıştır.
- Cloudflare Pages için COOP/COEP headerları eklenmiştir.
- Uygulama OWASP açısından XSS yüzeyini düşük tutar çünkü kullanıcı HTML'i DOM'a ham olarak basılmaz.

## Performans Notları

WebAssembly küçük girdilerde her zaman daha hızlı olmayabilir. WASM çağrı sınırı ve veri kopyalama maliyeti vardır. Daha büyük ve CPU yoğun girdilerde Rust/WASM daha belirgin avantaj sağlayabilir. Bu nedenle uygulama sahte sonuç üretmez; cihazdaki gerçek sonuçları gösterir.

## Test Stratejisi

- Rust unit testleri algoritma doğruluğunu test eder.
- wasm-bindgen testleri export edilen WASM fonksiyonlarının çalıştığını doğrular.
- TypeScript strict kontrolü tip hatalarını yakalar.
- Vitest yardımcı fonksiyonları test eder.
- Manuel QA listesi kamera, dosya, benchmark ve responsive kullanım senaryolarını kapsar.

## Karşılaşılan Zorluklar ve Çözümler

- Argon2 WASM bağımlılıkları karmaşık olabileceği için eğitim amaçlı güvenli fallback olarak PBKDF2/SHA-256 kullanıldı.
- Gerçek WASM thread desteği SharedArrayBuffer ve COOP/COEP gerektirir. Bu proje Cloudflare headerlarını ekler ve en az bir ağır işi Web Worker içinde çalıştırır.
- JS ve WASM compression formatları farklı olabilir. Bu nedenle sonuçlar roundtrip doğrulamasıyla yorumlanır.
- Küçük benchmarklarda JavaScript bazen daha hızlı çıkabilir. Rapor bu durumu dürüstçe açıklamalıdır.

## Gelecek Çalışmalar

- `wasm-bindgen-rayon` ile gerçek paralel WASM çekirdekleri
- SIMD optimizasyonları
- Playwright uçtan uca testleri
- Benchmark CSV dışa aktarma
- Daha gelişmiş görüntü filtreleri
- Kullanıcı tarafından seçilebilir benchmark presetleri

## AI Araçları Kullanım Beyanı

Proje geliştirme sürecinde yapay zeka destekli kod üretimi ve dokümantasyon desteği kullanılmıştır. Üretilen kodlar derleme, test ve manuel inceleme süreçlerinden geçirilerek proje gereksinimlerine göre düzenlenmiştir. Benchmark sonuçları yapay olarak üretilmemiştir; uygulama kullanıcının tarayıcısında gerçek ölçüm yapar.

