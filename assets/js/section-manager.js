/**
 * Bongkar Section & Elements Manager
 * Provides clean, modern, zero-bloat layouts & components
 */

window.BongkarSectionManager = (function () {
    let pendingInsertIndex = -1;
    let currentTargetInfo = null;

    const templates = {
        // Layouts
        'layout-1col': `
            <section class="bongkar-section" style="padding: 60px 20px; font-family: inherit;">
                <div style="max-width: 1100px; margin: 0 auto; text-align: center;">
                    <h2 style="font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 16px;">Section 1 Kolom Penuh</h2>
                    <p style="font-size: 16px; color: #475569; max-width: 700px; margin: 0 auto; line-height: 1.6;">
                        Gunakan section ini untuk teks panjang, video banner, atau konten pengantar yang fokus.
                    </p>
                </div>
            </section>
        `,
        'layout-2col': `
            <section class="bongkar-section" style="padding: 60px 20px; font-family: inherit;">
                <div style="max-width: 1150px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 40px; align-items: center;">
                    <div class="bongkar-column">
                        <h2 style="font-size: 34px; font-weight: 800; color: #0f172a; margin-bottom: 16px; line-height: 1.25;">Solusi Terbaik untuk Kebutuhan Anda</h2>
                        <p style="font-size: 16px; color: #475569; line-height: 1.6; margin-bottom: 24px;">
                            Jelaskan keunggulan utama layanan atau properti Anda di kolom teks ini secara meyakinkan.
                        </p>
                        <a href="#" style="display: inline-block; background: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 15px;">Pelajari Detail &rarr;</a>
                    </div>
                    <div class="bongkar-column">
                        <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80" alt="Gambar Properti" style="width: 100%; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);" />
                    </div>
                </div>
            </section>
        `,
        'layout-2col-asym-left': `
            <section class="bongkar-section" style="padding: 60px 20px; font-family: inherit;">
                <div style="max-width: 1150px; margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr; gap: 40px; align-items: start;">
                    <div class="bongkar-column" style="min-height: 120px;">
                        <h2 style="font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 16px; line-height: 1.25;">Kolom Utama (66%)</h2>
                        <p style="font-size: 16px; color: #475569; line-height: 1.6; margin-bottom: 20px;">
                            Area konten utama yang lebih luas, sangat ideal untuk narasi produk, galeri portofolio, artikel penjelasan, atau materi edukasi klien.
                        </p>
                        <a href="#" style="display: inline-block; background: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 15px;">Mulai Sekarang &rarr;</a>
                    </div>
                    <div class="bongkar-column" style="min-height: 120px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
                        <h3 style="font-size: 18px; font-weight: 700; color: #1e293b; margin-top: 0; margin-bottom: 12px;">Sidebar Ringkas (33%)</h3>
                        <p style="font-size: 14px; color: #64748b; line-height: 1.5; margin-bottom: 16px;">Sediakan ringkasan cepat, form pesanan kilat, atau info kontak langsung.</p>
                        <a href="#" style="display: block; text-align: center; background: #0f172a; color: #ffffff; text-decoration: none; padding: 10px; border-radius: 6px; font-weight: 700; font-size: 13px;">Kontak CS</a>
                    </div>
                </div>
            </section>
        `,
        'layout-2col-asym-right': `
            <section class="bongkar-section" style="padding: 60px 20px; font-family: inherit;">
                <div style="max-width: 1150px; margin: 0 auto; display: grid; grid-template-columns: 1fr 2fr; gap: 40px; align-items: start;">
                    <div class="bongkar-column" style="min-height: 120px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
                        <h3 style="font-size: 18px; font-weight: 700; color: #1e293b; margin-top: 0; margin-bottom: 12px;">Navigasi & Info (33%)</h3>
                        <p style="font-size: 14px; color: #64748b; line-height: 1.5; margin-bottom: 16px;">Poin keunggulan singkat atau indeks konten bab penjelasan.</p>
                    </div>
                    <div class="bongkar-column" style="min-height: 120px;">
                        <h2 style="font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 16px; line-height: 1.25;">Kolom Utama Kanan (66%)</h2>
                        <p style="font-size: 16px; color: #475569; line-height: 1.6; margin-bottom: 20px;">
                            Sajikan materi presentasi, ulasan mendalam, atau katalog penawaran Anda di area luas sebelah kanan ini.
                        </p>
                        <a href="#" style="display: inline-block; background: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 15px;">Pelajari Detail &rarr;</a>
                    </div>
                </div>
            </section>
        `,
        'layout-3col': `
            <section class="bongkar-section" style="padding: 60px 20px; font-family: inherit; background: #f8fafc;">
                <div style="max-width: 1150px; margin: 0 auto;">
                    <div style="text-align: center; margin-bottom: 40px;">
                        <h2 style="font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">Keunggulan Utama</h2>
                        <p style="font-size: 16px; color: #64748b;">Kenapa banyak klien mempercayakan pilihan kepada kami</p>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px;">
                        <div class="bongkar-column" style="background: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid #e2e8f0; text-align: left;">
                            <i class="fa-solid fa-shield-halved" style="font-size: 32px; color: #4f46e5; margin-bottom: 16px; display: inline-block;"></i>
                            <h3 style="font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 10px;">100% Aman & Terpercaya</h3>
                            <p style="font-size: 14px; color: #64748b; line-height: 1.6; margin: 0;">Legalitas terjamin lengkap dan proses transaksi transparan.</p>
                        </div>
                        <div class="bongkar-column" style="background: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid #e2e8f0; text-align: left;">
                            <i class="fa-solid fa-location-dot" style="font-size: 32px; color: #4f46e5; margin-bottom: 16px; display: inline-block;"></i>
                            <h3 style="font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 10px;">Lokasi Super Strategis</h3>
                            <p style="font-size: 14px; color: #64748b; line-height: 1.6; margin: 0;">Dekat akses tol, stasiun, pusat perbelanjaan dan sekolah.</p>
                        </div>
                        <div class="bongkar-column" style="background: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid #e2e8f0; text-align: left;">
                            <i class="fa-solid fa-gem" style="font-size: 32px; color: #4f46e5; margin-bottom: 16px; display: inline-block;"></i>
                            <h3 style="font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 10px;">Kualitas Premium</h3>
                            <p style="font-size: 14px; color: #64748b; line-height: 1.6; margin: 0;">Spesifikasi material kelas satu dengan desain arsitektur modern.</p>
                        </div>
                    </div>
                </div>
            </section>
        `,
        'layout-4col': `
            <section class="bongkar-section" style="padding: 50px 20px; font-family: inherit;">
                <div style="max-width: 1150px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; text-align: center;">
                    <div class="bongkar-column" style="padding: 20px; background: #f8fafc; border-radius: 10px;">
                        <h4 style="font-size: 32px; font-weight: 800; color: #4f46e5; margin: 0;">500+</h4>
                        <p style="font-size: 14px; color: #64748b; margin: 6px 0 0 0;">Unit Terjual</p>
                    </div>
                    <div class="bongkar-column" style="padding: 20px; background: #f8fafc; border-radius: 10px;">
                        <h4 style="font-size: 32px; font-weight: 800; color: #4f46e5; margin: 0;">98%</h4>
                        <p style="font-size: 14px; color: #64748b; margin: 6px 0 0 0;">Klien Puas</p>
                    </div>
                    <div class="bongkar-column" style="padding: 20px; background: #f8fafc; border-radius: 10px;">
                        <h4 style="font-size: 32px; font-weight: 800; color: #4f46e5; margin: 0;">12 Thn</h4>
                        <p style="font-size: 14px; color: #64748b; margin: 6px 0 0 0;">Pengalaman</p>
                    </div>
                    <div class="bongkar-column" style="padding: 20px; background: #f8fafc; border-radius: 10px;">
                        <h4 style="font-size: 32px; font-weight: 800; color: #4f46e5; margin: 0;">24/7</h4>
                        <p style="font-size: 14px; color: #64748b; margin: 6px 0 0 0;">Layanan CS</p>
                    </div>
                </div>
            </section>
        `,

        // Basic Elements
        'element-heading': `<h2 style="font-size: 30px; font-weight: 800; color: #0f172a; margin-bottom: 14px; line-height: 1.25;">Judul Heading Baru</h2>`,
        'element-paragraph': `<p style="font-size: 16px; color: #475569; line-height: 1.6; margin-bottom: 16px;">Tuliskan konten atau deskripsi paragraf di sini dengan bahasa yang jelas dan persuasif.</p>`,
        'element-button': `<a href="#" style="display: inline-block; background: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);">Tombol Aksi &rarr;</a>`,
        'element-image': `<img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80" alt="Gambar Baru" style="width: 100%; border-radius: 8px; margin-bottom: 16px; display: block;" />`,
        'element-video': `
            <div class="bongkar-video-wrapper" style="position: relative; width: 100%; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); margin: 20px 0;">
                <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Video Player" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
        `,
        'element-icon-box': `
            <div class="bongkar-icon-box" style="display: flex; gap: 18px; align-items: flex-start; padding: 20px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; margin: 14px 0;">
                <div style="flex-shrink: 0; width: 48px; height: 48px; border-radius: 10px; background: #e0e7ff; color: #4f46e5; display: flex; align-items: center; justify-content: center; font-size: 22px;">
                    <i class="fa-solid fa-bolt"></i>
                </div>
                <div>
                    <h4 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 6px 0;">Fitur Cepat & Unggul</h4>
                    <p style="font-size: 14px; color: #64748b; line-height: 1.5; margin: 0;">Teknologi mutakhir yang siap meningkatkan efisiensi dan performa bisnis Anda secara instan.</p>
                </div>
            </div>
        `,
        'element-icon': `<i class="fa-solid fa-star" style="font-size: 28px; color: #f59e0b; margin: 8px;"></i>`,
        'element-card': `
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.04); margin-bottom: 20px;">
                <h3 style="font-size: 20px; font-weight: 700; color: #1e293b; margin-top: 0; margin-bottom: 10px;">Judul Kartu</h3>
                <p style="font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 16px;">Deskripsi kartu informasi dapat dituliskan di sini dengan jelas dan menarik.</p>
                <a href="#" style="font-size: 14px; font-weight: 700; color: #4f46e5; text-decoration: none;">Selengkapnya &rarr;</a>
            </div>
        `,
        'element-rating': `
            <div class="bongkar-rating-widget" style="display: inline-flex; align-items: center; gap: 10px; padding: 8px 14px; background: #fefce8; border: 1px solid #fef08a; border-radius: 30px; margin: 10px 0;">
                <div style="color: #f59e0b; font-size: 16px; display: flex; gap: 2px;">
                    <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i>
                </div>
                <span style="font-size: 13px; font-weight: 700; color: #854d0e;">4.9 / 5.0 (2,400+ Ulasan Puas)</span>
            </div>
        `,
        'element-divider': `
            <div class="bongkar-divider" style="display: flex; align-items: center; text-align: center; margin: 30px 0; width: 100%;">
                <div style="flex-grow: 1; border-bottom: 1px solid #e2e8f0;"></div>
                <span style="padding: 0 16px; color: #94a3b8; font-size: 14px;"><i class="fa-solid fa-asterisk"></i></span>
                <div style="flex-grow: 1; border-bottom: 1px solid #e2e8f0;"></div>
            </div>
        `,
        'element-spacer': `
            <div class="bongkar-spacer" style="height: 40px; width: 100%;" aria-hidden="true"></div>
        `,

        // Form & Lead Capture Components
        'form-lead': `
            <section class="bongkar-section" style="padding: 70px 20px; font-family: inherit; background: #f8fafc;">
                <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 36px 32px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06);">
                    <div style="text-align: center; margin-bottom: 26px;">
                        <span style="display: inline-block; background: #e0e7ff; color: #4338ca; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; margin-bottom: 10px;">Formulir Pemesanan</span>
                        <h2 style="font-size: 26px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0;">Konsultasi & Promo Spesial</h2>
                        <p style="font-size: 14px; color: #64748b; margin: 0;">Isi formulir di bawah ini, data akan langsung diteruskan ke WhatsApp & spreadsheet.</p>
                    </div>
                    <form data-bongkar-form="true" data-bongkar-wa="true" data-wa-number="628123456789" data-wa-template="Halo Admin, saya *[nama]* tertarik konsultasi.%0ANo HP: [telepon]%0ALayanan: [layanan]%0ACatatan: [pesan]" data-bongkar-gsheet="false" data-gsheet-url="" data-success-msg="Terima kasih! Pesanan / pesan Anda telah diterima." style="display: flex; flex-direction: column; gap: 16px;">
                        <div>
                            <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Nama Lengkap <span style="color: #ef4444;">*</span></label>
                            <input type="text" name="nama" required placeholder="Contoh: Budi Santoso" style="width: 100%; padding: 12px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; outline: none; box-sizing: border-box;" />
                        </div>
                        <div>
                            <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Nomor WhatsApp / HP <span style="color: #ef4444;">*</span></label>
                            <input type="tel" name="telepon" required placeholder="Contoh: 08123456789" style="width: 100%; padding: 12px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; outline: none; box-sizing: border-box;" />
                        </div>
                        <div>
                            <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Pilihan Kebutuhan</label>
                            <select name="layanan" style="width: 100%; padding: 12px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; background: #ffffff; outline: none; box-sizing: border-box;">
                                <option value="Konsultasi Umum">Konsultasi Umum</option>
                                <option value="Klaim Diskon / Promo">Klaim Diskon / Promo</option>
                                <option value="Pemesanan Langsung">Pemesanan Langsung</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Catatan atau Pesan</label>
                            <textarea name="pesan" rows="3" placeholder="Tuliskan detail pertanyaan atau pesanan Anda..." style="width: 100%; padding: 12px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; outline: none; resize: vertical; box-sizing: border-box;"></textarea>
                        </div>
                        <button type="submit" class="bongkar-submit-btn" style="background: #25d366; color: #ffffff; border: none; padding: 14px 24px; border-radius: 8px; font-weight: 700; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 14px rgba(37, 211, 102, 0.4); margin-top: 6px;">
                            <i class="fa-brands fa-whatsapp" style="font-size: 18px;"></i> Kirim Sekarang
                        </button>
                    </form>
                </div>
            </section>
        `,
        'element-wa-floating': `
            <a href="https://wa.me/628123456789?text=Halo%20Admin%2C%20saya%20tertarik%20dengan%20produk%20Anda" target="_blank" class="bongkar-wa-floating-btn" style="position: fixed; bottom: 24px; right: 24px; z-index: 9999; background: #25d366; color: #ffffff; text-decoration: none; padding: 14px 20px; border-radius: 50px; font-weight: 700; font-size: 15px; display: inline-flex; align-items: center; gap: 10px; box-shadow: 0 6px 20px rgba(37, 211, 102, 0.45); transition: transform 0.2s ease;">
                <i class="fa-brands fa-whatsapp" style="font-size: 22px;"></i>
                <span>Chat WhatsApp</span>
            </a>
        `,
        'element-countdown': `
            <div class="bongkar-countdown-box countdown" data-countdown="true" style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); color: #ffffff; padding: 24px 30px; border-radius: 14px; text-align: center; margin: 24px 0; border: 1px solid #334155;">
                <div style="font-size: 13px; font-weight: 700; color: #fbbf24; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
                    <i class="fa-solid fa-bolt"></i> Flash Sale Berakhir Dalam:
                </div>
                <div style="display: flex; gap: 14px; justify-content: center; align-items: center;">
                    <div style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 10px 16px; min-width: 60px;">
                        <div class="countdown-days" style="font-size: 26px; font-weight: 800; color: #ffffff; line-height: 1;">02</div>
                        <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; margin-top: 4px;">Hari</div>
                    </div>
                    <div style="font-size: 22px; font-weight: 800; color: #818cf8;">:</div>
                    <div style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 10px 16px; min-width: 60px;">
                        <div class="countdown-hours" style="font-size: 26px; font-weight: 800; color: #ffffff; line-height: 1;">14</div>
                        <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; margin-top: 4px;">Jam</div>
                    </div>
                    <div style="font-size: 22px; font-weight: 800; color: #818cf8;">:</div>
                    <div style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 10px 16px; min-width: 60px;">
                        <div class="countdown-minutes" style="font-size: 26px; font-weight: 800; color: #ffffff; line-height: 1;">45</div>
                        <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; margin-top: 4px;">Menit</div>
                    </div>
                    <div style="font-size: 22px; font-weight: 800; color: #818cf8;">:</div>
                    <div style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 10px 16px; min-width: 60px;">
                        <div class="countdown-seconds" style="font-size: 26px; font-weight: 800; color: #f43f5e; line-height: 1;">28</div>
                        <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; margin-top: 4px;">Detik</div>
                    </div>
                </div>
            </div>
        `,
        'element-trust-badges': `
            <div class="bongkar-trust-badges" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin: 24px 0; padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center;">
                <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
                    <i class="fa-solid fa-shield-halved" style="font-size: 26px; color: #3b82f6;"></i>
                    <strong style="font-size: 13px; color: #0f172a;">100% Garansi Resmi</strong>
                    <span style="font-size: 11px; color: #64748b;">Jaminan uang kembali</span>
                </div>
                <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
                    <i class="fa-solid fa-truck-fast" style="font-size: 26px; color: #10b981;"></i>
                    <strong style="font-size: 13px; color: #0f172a;">Pengiriman Cepat</strong>
                    <span style="font-size: 11px; color: #64748b;">Langsung kirim hari ini</span>
                </div>
                <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
                    <i class="fa-solid fa-lock" style="font-size: 26px; color: #8b5cf6;"></i>
                    <strong style="font-size: 13px; color: #0f172a;">Transaksi Aman</strong>
                    <span style="font-size: 11px; color: #64748b;">Enkripsi SSL 256-bit</span>
                </div>
                <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
                    <i class="fa-solid fa-headset" style="font-size: 26px; color: #f59e0b;"></i>
                    <strong style="font-size: 13px; color: #0f172a;">Dukungan 24/7</strong>
                    <span style="font-size: 11px; color: #64748b;">CS siap melayani ramah</span>
                </div>
            </div>
        `,
        'element-input': `
            <div style="margin-bottom: 14px;">
                <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Label Input Baru</label>
                <input type="text" name="field_baru" placeholder="Ketik teks di sini..." style="width: 100%; padding: 12px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; box-sizing: border-box;" />
            </div>
        `,
        'element-textarea': `
            <div style="margin-bottom: 14px;">
                <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Label Catatan</label>
                <textarea name="catatan" rows="3" placeholder="Tuliskan catatan lengkap di sini..." style="width: 100%; padding: 12px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; resize: vertical; box-sizing: border-box;"></textarea>
            </div>
        `,
        'element-select': `
            <div style="margin-bottom: 14px;">
                <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Pilihan Dropdown</label>
                <select name="pilihan" style="width: 100%; padding: 12px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; background: #ffffff; box-sizing: border-box;">
                    <option value="Opsi 1">Opsi Pilihan 1</option>
                    <option value="Opsi 2">Opsi Pilihan 2</option>
                    <option value="Opsi 3">Opsi Pilihan 3</option>
                </select>
            </div>
        `,
        'element-submit': `
            <button type="submit" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: #4f46e5; color: #ffffff; border: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 16px; cursor: pointer; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);">
                <i class="fa-solid fa-paper-plane"></i> Kirim Formulir
            </button>
        `,

        // Custom Embed / HTML Widget
        'element-embed': `
            <div class="bongkar-custom-embed" data-bongkar-embed="true" style="padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 12px; margin: 20px 0; border: 1px solid #334155;">
                <div style="text-align: center; color: #94a3b8; font-family: sans-serif; font-size: 14px;">
                    <i class="fa-solid fa-code" style="font-size: 26px; color: #818cf8; margin-bottom: 8px; display: block;"></i>
                    <strong style="color: #ffffff; font-size: 15px;">HTML &amp; Script Embed Widget</strong>
                    <p style="margin: 6px 0 0 0; font-size: 12px; color: #94a3b8;">Klik elemen ini lalu masukkan kode HTML, script, Google Maps iframe, atau widget khusus di tab Inspector.</p>
                </div>
            </div>
        `,

        // Prebuilt Components
        'section-hero': `
            <section class="bongkar-section" style="padding: 100px 20px; background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); color: #ffffff; text-align: center; font-family: inherit;">
                <div style="max-width: 800px; margin: 0 auto;">
                    <span style="display: inline-block; background: rgba(79, 70, 229, 0.3); border: 1px solid rgba(99, 102, 241, 0.4); color: #c7d2fe; padding: 6px 16px; border-radius: 30px; font-size: 13px; font-weight: 700; margin-bottom: 20px; text-transform: uppercase;">
                        Promo Spesial Bulan Ini
                    </span>
                    <h1 style="font-size: 44px; font-weight: 800; color: #ffffff; margin-bottom: 20px; line-height: 1.2;">
                        Wujudkan Hunian Impian Anda di Lokasi Terbaik
                    </h1>
                    <p style="font-size: 18px; color: #cbd5e1; line-height: 1.6; margin-bottom: 32px;">
                        Hunian eksklusif dengan fasilitas lengkap, akses tol langsung, dan cicilan ringan mulai 3 jutaan per bulan.
                    </p>
                    <div style="display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;">
                        <a href="#booking" style="background: #4f46e5; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);">
                            Klaim Promo Sekarang &rarr;
                        </a>
                        <a href="#brosur" style="background: rgba(255,255,255,0.1); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 16px; border: 1px solid rgba(255,255,255,0.2);">
                            Download Brosur
                        </a>
                    </div>
                </div>
            </section>
        `,
        'section-features': `
            <section class="bongkar-section" style="padding: 70px 20px; font-family: inherit; background: #ffffff;">
                <div style="max-width: 1150px; margin: 0 auto;">
                    <div style="text-align: center; max-width: 600px; margin: 0 auto 50px auto;">
                        <h2 style="font-size: 34px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">Fasilitas Bintang Lima</h2>
                        <p style="font-size: 16px; color: #64748b;">Nikmati kenyamanan tinggal terbaik dengan fasilitas terpadu.</p>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px;">
                        <div class="bongkar-column" style="background: #f8fafc; padding: 28px; border-radius: 12px; border: 1px solid #e2e8f0;">
                            <i class="fa-solid fa-swimming-pool" style="font-size: 30px; color: #06b6d4; margin-bottom: 16px; display: inline-block;"></i>
                            <h3 style="font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">Kolam Renang Infinity</h3>
                            <p style="font-size: 14px; color: #64748b; line-height: 1.5; margin: 0;">Area santai keluarga dengan pemandangan hijau asri.</p>
                        </div>
                        <div class="bongkar-column" style="background: #f8fafc; padding: 28px; border-radius: 12px; border: 1px solid #e2e8f0;">
                            <i class="fa-solid fa-shield-halved" style="font-size: 30px; color: #10b981; margin-bottom: 16px; display: inline-block;"></i>
                            <h3 style="font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">One Gate Security 24 Jam</h3>
                            <p style="font-size: 14px; color: #64748b; line-height: 1.5; margin: 0;">Dilengkapi CCTV di setiap sudut dan patroli berkala.</p>
                        </div>
                        <div class="bongkar-column" style="background: #f8fafc; padding: 28px; border-radius: 12px; border: 1px solid #e2e8f0;">
                            <i class="fa-solid fa-tree" style="font-size: 30px; color: #84cc16; margin-bottom: 16px; display: inline-block;"></i>
                            <h3 style="font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">Taman Terbuka Hijau</h3>
                            <p style="font-size: 14px; color: #64748b; line-height: 1.5; margin: 0;">Jogging track dan playground untuk tumbuh kembang anak.</p>
                        </div>
                    </div>
                </div>
            </section>
        `,
        'section-cta': `
            <section class="bongkar-section" style="padding: 80px 20px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; text-align: center; font-family: inherit;">
                <div style="max-width: 850px; margin: 0 auto;">
                    <h2 style="font-size: 38px; font-weight: 800; color: #ffffff; margin-bottom: 16px; line-height: 1.25;">
                        Siap Mengembangkan Bisnis Anda ke Level Berikutnya?
                    </h2>
                    <p style="font-size: 18px; color: #e0e7ff; line-height: 1.6; margin-bottom: 32px; max-width: 680px; margin-left: auto; margin-right: auto;">
                        Dapatkan konsultasi gratis &amp; penawaran khusus promo bulan ini. Kuota terbatas hanya untuk 10 pendaftar pertama!
                    </p>
                    <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
                        <a href="#" style="background: #ffffff; color: #4338ca; text-decoration: none; padding: 16px 36px; border-radius: 8px; font-weight: 800; font-size: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
                            Klaim Promo Sekarang &rarr;
                        </a>
                        <a href="#" style="background: rgba(255,255,255,0.15); color: #ffffff; text-decoration: none; padding: 16px 30px; border-radius: 8px; font-weight: 700; font-size: 16px; border: 1px solid rgba(255,255,255,0.3);">
                            Tanya via WhatsApp
                        </a>
                    </div>
                </div>
            </section>
        `,
        'section-gallery': `
            <section class="bongkar-section" style="padding: 70px 20px; font-family: inherit; background: #ffffff;">
                <div style="max-width: 1150px; margin: 0 auto;">
                    <div style="text-align: center; margin-bottom: 40px;">
                        <h2 style="font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 10px;">Galeri & Dokumentasi</h2>
                        <p style="font-size: 15px; color: #64748b;">Lihat keindahan detail dan bukti hasil kerja nyata tim kami</p>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                        <div style="border-radius: 12px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06);">
                            <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=700&q=80" alt="Galeri 1" style="width: 100%; height: 240px; object-fit: cover; display: block; transition: transform 0.3s ease;" />
                        </div>
                        <div style="border-radius: 12px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06);">
                            <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=700&q=80" alt="Galeri 2" style="width: 100%; height: 240px; object-fit: cover; display: block; transition: transform 0.3s ease;" />
                        </div>
                        <div style="border-radius: 12px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06);">
                            <img src="https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=700&q=80" alt="Galeri 3" style="width: 100%; height: 240px; object-fit: cover; display: block; transition: transform 0.3s ease;" />
                        </div>
                    </div>
                </div>
            </section>
        `,
        'section-testimonials': `
            <section class="bongkar-section" style="padding: 70px 20px; font-family: inherit; background: #f8fafc;">
                <div style="max-width: 1100px; margin: 0 auto; text-align: center;">
                    <h2 style="font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 40px;">Apa Kata Pembeli Kami?</h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; text-align: left;">
                        <div class="bongkar-column" style="background: #ffffff; padding: 26px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 10px rgba(0,0,0,0.03);">
                            <div style="color: #f59e0b; margin-bottom: 12px;">
                                <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i>
                            </div>
                            <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 16px;">"Proses pengajuan KPR dibantu tuntas dari awal sampai serah terima kunci. Lokasinya beneran dekat tol dan bebas banjir."</p>
                            <div style="font-weight: 700; font-size: 14px; color: #1e293b;">Bpk. Hendra Wijaya</div>
                            <div style="font-size: 12px; color: #94a3b8;">Wiraswasta, Tangerang</div>
                        </div>
                        <div class="bongkar-column" style="background: #ffffff; padding: 26px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 10px rgba(0,0,0,0.03);">
                            <div style="color: #f59e0b; margin-bottom: 12px;">
                                <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i>
                            </div>
                            <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 16px;">"Desain rumahnya modern dan pencahayaan alaminya bagus banget. Sangat rekomendasi buat keluarga muda."</p>
                            <div style="font-weight: 700; font-size: 14px; color: #1e293b;">Ibu Siska Pratama</div>
                            <div style="font-size: 12px; color: #94a3b8;">Karyawan Swasta, Jakarta Barat</div>
                        </div>
                    </div>
                </div>
            </section>
        `,
        'section-faq': `
            <section class="bongkar-section" style="padding: 70px 20px; font-family: inherit; background: #ffffff;">
                <div style="max-width: 800px; margin: 0 auto;">
                    <div style="text-align: center; margin-bottom: 40px;">
                        <h2 style="font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">Pertanyaan Sering Diajukan (FAQ)</h2>
                        <p style="font-size: 15px; color: #64748b;">Informasi penting yang perlu Anda ketahui sebelum membeli.</p>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 14px;">
                        <details style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; cursor: pointer;">
                            <summary style="font-weight: 700; font-size: 16px; color: #1e293b;">Apakah bisa dibantu pengajuan KPR?</summary>
                            <p style="font-size: 14px; color: #475569; margin-top: 10px; line-height: 1.6;">Ya, kami bekerja sama dengan berbagai bank ternama (BCA, Mandiri, BNI, BTN) untuk membantu proses KPR hingga disetujui.</p>
                        </details>
                        <details style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; cursor: pointer;">
                            <summary style="font-weight: 700; font-size: 16px; color: #1e293b;">Berapa DP minimum yang dibutuhkan?</summary>
                            <p style="font-size: 14px; color: #475569; margin-top: 10px; line-height: 1.6;">Untuk promo bulan ini, tersedia promo subsidi DP 0% dengan booking fee hanya 5 juta rupiah.</p>
                        </details>
                        <details style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; cursor: pointer;">
                            <summary style="font-weight: 700; font-size: 16px; color: #1e293b;">Kapan serah terima unit dilakukan?</summary>
                            <p style="font-size: 14px; color: #475569; margin-top: 10px; line-height: 1.6;">Tersedia unit ready stock siap huni dan unit indent dengan waktu serah terima 6–8 bulan.</p>
                        </details>
                    </div>
                </div>
            </section>
        `,
        'section-blog': `
            <section class="bongkar-section" style="padding: 70px 20px; font-family: inherit; background: #f8fafc;">
                <div style="max-width: 1200px; margin: 0 auto;">
                    <div style="text-align: center; max-width: 650px; margin: 0 auto 48px auto;">
                        <span style="display: inline-block; background: #e0e7ff; color: #4338ca; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px;">
                            Artikel &amp; Berita Terbaru
                        </span>
                        <h2 style="font-size: clamp(26px, 3vw, 36px); font-weight: 800; color: #0f172a; margin-bottom: 12px; line-height: 1.25;">
                            Wawasan &amp; Informasi Terupdate
                        </h2>
                        <p style="font-size: 15px; color: #64748b; margin: 0; line-height: 1.6;">
                            Temukan artikel edukasi, tips terbaik, dan kabar terkini dari tim kami langsung.
                        </p>
                    </div>
                    <div class="bongkar-dynamic-posts-grid" data-bongkar-dynamic-posts="true" data-post-filter="recent" data-post-count="6" data-post-cols="3" data-category-id="0" data-post-ids="">
                        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: #ffffff; border: 1px dashed #cbd5e1; border-radius: 12px; color: #64748b;">
                            <i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; color: #4f46e5; margin-bottom: 12px; display: block;"></i>
                            <strong>Feed Artikel WordPress (Dinamis)</strong>
                            <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8;">Artikel akan otomatis dimuat langsung dari postingan WordPress saat halaman dibuka atau disimpan.</p>
                        </div>
                    </div>
                </div>
            </section>
        `,
        'element-post-grid': `
            <div class="bongkar-dynamic-posts-grid" data-bongkar-dynamic-posts="true" data-post-filter="recent" data-post-count="6" data-post-cols="3" data-category-id="0" data-post-ids="" style="margin: 24px 0;">
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; color: #64748b;">
                    <i class="fa-solid fa-spinner fa-spin" style="font-size: 24px; color: #4f46e5; margin-bottom: 12px; display: block;"></i>
                    <strong>Grid Postingan WordPress Dinamis</strong>
                    <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8;">Postingan otomatis diambil dari database WordPress sesuai kriteria yang dipilih.</p>
                </div>
            </div>
        `,
        'section-pricing': `
            <section class="bongkar-section" style="padding: 70px 20px; font-family: inherit; background: #f8fafc;">
                <div style="max-width: 1050px; margin: 0 auto; text-align: center;">
                    <h2 style="font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">Pilihan Tipe Unit</h2>
                    <p style="font-size: 15px; color: #64748b; margin-bottom: 40px;">Pilih tipe rumah yang sesuai dengan kebutuhan keluarga Anda</p>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; text-align: left;">
                        <div class="bongkar-column" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px;">
                            <h3 style="font-size: 20px; font-weight: 700; color: #1e293b; margin: 0 0 10px 0;">Tipe 36 / 60</h3>
                            <div style="font-size: 28px; font-weight: 800; color: #4f46e5; margin-bottom: 16px;">Rp 450 Jt</div>
                            <ul style="list-style: none; padding: 0; margin: 0 0 24px 0; font-size: 14px; color: #475569; line-height: 2;">
                                <li><i class="fa-solid fa-check" style="color: #22c55e; margin-right: 8px;"></i> 2 Kamar Tidur</li>
                                <li><i class="fa-solid fa-check" style="color: #22c55e; margin-right: 8px;"></i> 1 Kamar Mandi</li>
                                <li><i class="fa-solid fa-check" style="color: #22c55e; margin-right: 8px;"></i> Carport 1 Mobil</li>
                            </ul>
                            <a href="#" style="display: block; text-align: center; background: #f1f5f9; color: #1e293b; text-decoration: none; padding: 10px; border-radius: 6px; font-weight: 700; font-size: 14px;">Pilih Tipe Ini</a>
                        </div>
                        <div class="bongkar-column" style="background: #ffffff; border: 2px solid #4f46e5; border-radius: 12px; padding: 30px; position: relative;">
                            <span style="position: absolute; top: -12px; right: 20px; background: #4f46e5; color: #ffffff; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; text-transform: uppercase;">Terlaris</span>
                            <h3 style="font-size: 20px; font-weight: 700; color: #1e293b; margin: 0 0 10px 0;">Tipe 60 / 84</h3>
                            <div style="font-size: 28px; font-weight: 800; color: #4f46e5; margin-bottom: 16px;">Rp 750 Jt</div>
                            <ul style="list-style: none; padding: 0; margin: 0 0 24px 0; font-size: 14px; color: #475569; line-height: 2;">
                                <li><i class="fa-solid fa-check" style="color: #22c55e; margin-right: 8px;"></i> 3 Kamar Tidur (2 Lantai)</li>
                                <li><i class="fa-solid fa-check" style="color: #22c55e; margin-right: 8px;"></i> 2 Kamar Mandi</li>
                                <li><i class="fa-solid fa-check" style="color: #22c55e; margin-right: 8px;"></i> Carport 2 Mobil</li>
                            </ul>
                            <a href="#" style="display: block; text-align: center; background: #4f46e5; color: #ffffff; text-decoration: none; padding: 10px; border-radius: 6px; font-weight: 700; font-size: 14px;">Pilih Tipe Ini</a>
                        </div>
                    </div>
                </div>
            </section>
        `,
        'section-footer': `
            <footer class="bongkar-section" style="padding: 40px 20px; background: #0f172a; color: #94a3b8; text-align: center; font-family: inherit; font-size: 14px;">
                <div style="max-width: 1000px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px; align-items: center;">
                    <div style="font-weight: 800; font-size: 20px; color: #ffffff;">Nama Perusahaan / Proyek</div>
                    <div style="display: flex; gap: 16px;">
                        <a href="#" style="color: #94a3b8; font-size: 18px;"><i class="fa-brands fa-whatsapp"></i></a>
                        <a href="#" style="color: #94a3b8; font-size: 18px;"><i class="fa-brands fa-instagram"></i></a>
                        <a href="#" style="color: #94a3b8; font-size: 18px;"><i class="fa-brands fa-facebook"></i></a>
                    </div>
                    <div>&copy; 2026 Seluruh hak cipta dilindungi. Dibuat dengan Bongkar Canvas.</div>
                </div>
            </footer>
        `
    };

    function init() {
        // Attach click and drag handlers to Add Elements cards in sidebar
        document.querySelectorAll('.element-card[data-insert]').forEach(card => {
            card.setAttribute('draggable', 'true');
            card.addEventListener('dragstart', (e) => {
                const type = card.getAttribute('data-insert');
                e.dataTransfer.setData('text/plain', type);
                e.dataTransfer.setData('bongkar/widget', type);
                e.dataTransfer.effectAllowed = 'copy';
                window.__bongkarCurrentDraggedWidget = type;
            });
            card.addEventListener('dragend', () => {
                window.__bongkarCurrentDraggedWidget = null;
            });
            card.addEventListener('click', () => {
                const type = card.getAttribute('data-insert');
                insertComponent(type);
            });
        });

        // Initialize Live Search for Elements
        initSearch();

        // Initialize Contextual Target Cancel Handler
        const cancelTargetBtn = document.getElementById('btn-cancel-target-insert');
        if (cancelTargetBtn) {
            cancelTargetBtn.addEventListener('click', () => {
                clearPendingTarget();
            });
        }
    }

    /**
     * Live search filtering for Elements / Widgets
     */
    function initSearch() {
        const searchInput = document.getElementById('elements-search-input');
        const clearBtn = document.getElementById('btn-clear-elements-search');
        const emptyState = document.getElementById('elements-search-empty');
        const cards = document.querySelectorAll('.elements-grid .element-card');
        const categories = document.querySelectorAll('.elements-widget-category');

        if (!searchInput) return;

        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim().toLowerCase();

            if (clearBtn) {
                clearBtn.style.display = query ? 'block' : 'none';
            }

            if (!query) {
                cards.forEach(c => c.style.display = '');
                categories.forEach(cat => cat.style.display = '');
                if (emptyState) emptyState.style.display = 'none';
                return;
            }

            let totalMatches = 0;

            categories.forEach(cat => {
                const catCards = cat.querySelectorAll('.element-card');
                let catMatches = 0;

                catCards.forEach(c => {
                    const text = (c.innerText || '').toLowerCase();
                    const title = (c.getAttribute('title') || '').toLowerCase();
                    const key = (c.getAttribute('data-insert') || '').toLowerCase();

                    if (text.includes(query) || title.includes(query) || key.includes(query)) {
                        c.style.display = 'flex';
                        catMatches++;
                        totalMatches++;
                    } else {
                        c.style.display = 'none';
                    }
                });

                // If this is a category with cards and no cards matched, hide the whole category section
                if (catCards.length > 0) {
                    cat.style.display = catMatches > 0 ? '' : 'none';
                }
            });

            if (emptyState) {
                emptyState.style.display = totalMatches === 0 ? 'block' : 'none';
            }
        });

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                searchInput.value = '';
                searchInput.dispatchEvent(new Event('input'));
                searchInput.focus();
            });
        }
    }

    /**
     * Contextual Target Info Management
     */
    function setPendingTarget(targetInfo) {
        currentTargetInfo = targetInfo;
        const banner = document.getElementById('elements-target-banner');
        const label = document.getElementById('elements-target-label');
        if (banner && label) {
            if (targetInfo && targetInfo.label) {
                label.textContent = targetInfo.label;
                banner.style.display = 'flex';
            } else {
                banner.style.display = 'none';
            }
        }
    }

    function clearPendingTarget() {
        currentTargetInfo = null;
        pendingInsertIndex = -1;
        const banner = document.getElementById('elements-target-banner');
        if (banner) banner.style.display = 'none';
    }

    function setPendingInsertIndex(index, targetInfo) {
        pendingInsertIndex = index;
        if (targetInfo) {
            setPendingTarget(targetInfo);
        }
        // Open the elements tab in sidebar
        const elementsTabBtn = document.querySelector('.sidebar-tab-btn[data-tab="elements"]');
        if (elementsTabBtn) elementsTabBtn.click();
    }

    function insertComponent(type) {
        const html = templates[type];
        if (!html) return;

        const iframe = document.getElementById('bongkar-iframe-canvas');
        if (!iframe || !iframe.contentWindow) return;

        iframe.contentWindow.postMessage({
            type: 'BONGKAR_INSERT_HTML',
            html: html,
            insertIndex: pendingInsertIndex,
            targetInfo: currentTargetInfo,
            widgetType: type
        }, '*');

        pendingInsertIndex = -1; // reset
        clearPendingTarget();

        // Switch to Inspector tab
        const inspectorTabBtn = document.querySelector('.sidebar-tab-btn[data-tab="inspector"]');
        if (inspectorTabBtn) inspectorTabBtn.click();
    }

    return {
        init: init,
        setPendingInsertIndex: setPendingInsertIndex,
        setPendingTarget: setPendingTarget,
        clearPendingTarget: clearPendingTarget,
        insertComponent: insertComponent,
        getTemplates: () => templates
    };
})();
