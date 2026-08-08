import React, { useState } from 'react';
import { Download, Share2, Copy, Check, RefreshCw, Bookmark, ShieldCheck, Layers, BookOpen, Ban, Sparkles } from 'lucide-react';

// High-end editorial color collections and vocabulary
const UNDERTONE_DATA = {
  Warm: {
    title: "Warm Undertone",
    subtitle: "Luminous Gold Calibration",
    badgeGlow: "rgba(251, 146, 60, 0.25)",
    badgeGradient: "linear-gradient(135deg, #C6A16A, #FB923C)",
    telemetry: "An editorial masterpiece of thermal illumination. Mapped melanin metrics register a rich, lipid-dominant baseline that mirrors golden-hour filtration. Terracotta glazes, toasted honey, and rich forest moss align with your skin's natural luminance. Your presence radiates warmth, demanding wardrobe elements that embrace deep organic tones and high-carat gold reflectances.",
    signatureTitle: "Golden Yellow-Based Glow Aura",
    signatureDesc: "Your dermal spectrum is anchored by peach, gold, and warm amber baselines. Your skin thrives in natural daylight, reflecting golden hues. Gold accessories harmonize instantly with your natural highlights, and sun exposure develops into a smooth, even bronze.",
    hex: "#FB923C",
    season: "AUTUMN / SPRING SPREAD",
    fabulous: [
      { name: "Terracotta Sunset", hex: "#C2410C", desc: "A rich, clay-red shade that anchors warm structural outerwear." },
      { name: "Rich Forest Moss", hex: "#15803D", desc: "A deep botanical green bringing organic contrast to linen knits." },
      { name: "Toasted Honey Mustard", hex: "#B45309", desc: "A luxury golden-yellow shade adding premium highlight layers." },
      { name: "Premium Peach Coral", hex: "#FB923C", desc: "A fresh warm coral that amplifies natural cheek radiance." },
      { name: "Desert Amber", hex: "#D97706", desc: "A warm, translucent brown reflecting late afternoon sunlight." },
      { name: "Olive Branch", hex: "#65A30D", desc: "A soft yellow-green serving as a gorgeous mid-tone neutral." },
      { name: "Warm Toasted Cocoa", hex: "#78350F", desc: "A rich chocolate shade forming an elegant wardrobe foundation." },
      { name: "Marigold Bloom", hex: "#F59E0B", desc: "A vibrant sunshine hue that turns heads in editorial spreads." }
    ],
    jewellery: ["18K Yellow Gold", "Rose Gold", "Hammered Bronze"],
    jewelleryDesc: "Your warm calibrated skin tone reflects best off high-polish yellow and red metals, which harmonize with the gold baselines in your skin.",
    hair: ["Honey Blonde", "Honey Brown", "Warm Chestnut", "Copper", "Golden Black", "Rich Auburn"],
    wrongColors: [
      { title: "Icy Grey", example: "#9CA3AF", desc: "Fades out your natural golden warmth, making your complexion look washed out." },
      { title: "Neon Violet", example: "#A855F7", desc: "Clashes aggressively with warm lipid and golden undertones." },
      { title: "Lavender Blue", example: "#818CF8", desc: "Creates an unharmonious grey cast on warm skin." }
    ],
    tips: [
      "Wear rich cream or warm ecru instead of stark, clinical white.",
      "Earth tones (terracotta, sage, sand) elevate your complexion instantly.",
      "Incorporate gold or bronze statement accessories to create harmony.",
      "Avoid icy pastel shirts or cool-toned silver-grey fabrics near the face."
    ]
  },
  Cool: {
    title: "Cool Undertone",
    subtitle: "Porcelain Silver Calibration",
    badgeGlow: "rgba(96, 165, 250, 0.25)",
    badgeGradient: "linear-gradient(135deg, #7C3AED, #60A5FA)",
    telemetry: "A study in crisp contrasts and porcelain clarity. Calibrated capillary coordinates reveal a cool hemoglobin-dominated baseline that mirrors mountain daylight and twilight shadows. Midnight navy, deep royal sapphire, and rich plum frame your face with striking, high-contrast clarity. Your styling direction thrives on icy accents and platinum finishes.",
    signatureTitle: "Rosy Pink-Blue Aura",
    signatureDesc: "Your spectrum is characterized by cool pink, blue, or rosy-violet baselines. Your skin reflects light with crisp, high-contrast clarity. Silver and platinum accessories enhance your natural glow, while sun exposure requires careful defense as it leans sensitive.",
    hex: "#60A5FA",
    season: "WINTER / SUMMER SPREAD",
    fabulous: [
      { name: "Navy Velvet", hex: "#1E3A8A", desc: "A deep midnight blue that provides ultimate baseline structure." },
      { name: "Royal Sapphire", hex: "#1D4ED8", desc: "A vibrant gemstone blue reflecting cool light beautifully." },
      { name: "Majestic Emerald", hex: "#047857", desc: "A rich cool-toned green that brings out eye highlights." },
      { name: "Royal Plum", hex: "#581C87", desc: "A deep luxurious violet creating a high-end statement outline." },
      { name: "Wild Berry", hex: "#BE185D", desc: "A sharp raspberry pink providing editorial lip and coat pops." },
      { name: "Editorial Charcoal", hex: "#374151", desc: "A sleek dark slate serving as your primary neutral backdrop." },
      { name: "Royal Blue", hex: "#2563EB", desc: "A saturated azure that frames cool complexions beautifully." },
      { name: "Soft Rose Pink", hex: "#EC4899", desc: "A delicate cool blush pink reflecting youthful radiance." }
    ],
    jewellery: ["Pure Silver", "White Gold", "Polished Platinum"],
    jewelleryDesc: "Cool base pigments look highly polished when paired with white metals. Yellow gold can sometimes clash with your rosy-blue highlights.",
    hair: ["Ash Blonde", "Cool Ash Brown", "Dark Espresso", "Jet Black", "Silver Grey"],
    wrongColors: [
      { title: "Mustard Gold", example: "#CA8A04", desc: "Highlights sallow tones in cool skin, creating an fatigued look." },
      { title: "Orange", example: "#F97316", desc: "Clashes with pink and blue baselines, dominating your natural features." },
      { title: "Olive Green", example: "#65A30D", desc: "Drabs down cool complexions and washes out porcelain clarity." }
    ],
    tips: [
      "Wear stark, crisp white rather than warm ivory or cream.",
      "Deep jewel tones (sapphire, ruby, emerald) elevate your look.",
      "Opt for silver, white gold, or platinum jewelry to anchor details.",
      "Avoid mustard yellows, bright oranges, or warm earth tones near the face."
    ]
  },
  Neutral: {
    title: "Neutral Undertone",
    subtitle: "Chameleon Harmony Calibration",
    badgeGlow: "rgba(163, 163, 163, 0.25)",
    badgeGradient: "linear-gradient(135deg, #78716C, #A3A3A3)",
    telemetry: "The ultimate chromatic equilibrium. Your dermal profile represents a balanced hybrid of warm lipid and cool hemoglobin pigments, rendering you an absolute styling chameleon. You navigate both warm earth sands and cool slates with complete fluid elegance. Your wardrobe can transition seamlessly between tones, creating premium detail tension by mixing metals.",
    signatureTitle: "Balanced Harmony Aura",
    signatureDesc: "Your spectrum displays a perfect equilibrium, showing no dominant bias toward warm or cool pigments. Your veins present mixed green-blue tones, you can wear both gold and silver with equal elegance, and your sun response is neutral.",
    hex: "#A3A3A3",
    season: "NEUTRAL HYBRID SPREAD",
    fabulous: [
      { name: "Warm Taupe", hex: "#78716C", desc: "A beautiful grey-brown neutral that balances warm and cool." },
      { name: "Editorial Stone", hex: "#A8A29E", desc: "A clean mineral grey that acts as a superb baseline layer." },
      { name: "Soft Olive", hex: "#84CC16", desc: "A dusty yellow-green that flatters balanced skin tones." },
      { name: "Dusty Blue", hex: "#60A5FA", desc: "A soft, muted blue that provides a relaxed fashion contrast." },
      { name: "Slate Warm Grey", hex: "#737373", desc: "A classic neutral that frames balanced complexions cleanly." },
      { name: "Soft Linen White", hex: "#F5F5F5", desc: "A luxurious off-white that acts as an easy styling canvas." },
      { name: "Muted Sage", hex: "#A3E635", desc: "A quiet botanical green perfect for cashmere and jackets." },
      { name: "Rich Mocha", hex: "#78350F", desc: "A balanced coffee brown that provides warm depth." }
    ],
    jewellery: ["18K Yellow Gold", "Pure Silver", "Rose Gold", "Mixed Metals"],
    jewelleryDesc: "Having a neutral undertone means you can wear gold, silver, or rose gold with equal success. Mixing metals in single look creates high-end editorial tension.",
    hair: ["Soft Brown", "Chocolate Brown", "Natural Black", "Caramel Highlights", "Champagne Blonde"],
    wrongColors: [
      { title: "Neon Lime", example: "#84CC16", desc: "Overpowers balanced pigments, drawing attention away from your features." },
      { title: "Electric Orange", example: "#FF5722", desc: "Too saturated for the soft, balanced neutrality of your skin." },
      { title: "Hot Pink", example: "#FF4081", desc: "Disrupts the calm, balanced pigment distribution." }
    ],
    tips: [
      "You can wear both stark white and cream; try layering them together.",
      "Muted, dusty, and mid-tone colors highlight your natural balance.",
      "Experiment with mixed-metal jewelry (gold + silver chains) for detail contrast.",
      "Avoid overly saturated neon colors that wash out your subtle skin markers."
    ]
  }
};

const UNIVERSAL_COLORS = [
  { name: "Classic Navy", hex: "#1E293B", desc: "A timeless dark blue that adds instant structure and depth." },
  { name: "Muted Charcoal", hex: "#334155", desc: "A soft slate grey that coordinates with every color palette." },
  { name: "Warm Gray-Taupe", hex: "#D6D3D1", desc: "A luxurious sandy neutral that flatters all skin textures." },
  { name: "Crisp Off-White", hex: "#F8FAFC", desc: "A soft, clean canvas white that highlights jewelry details." }
];

export default function ResultsPage({ userProfile, setUserProfile, setScreen }) {
  const activeUndertoneKey = userProfile?.undertone || 'Warm';
  const data = UNDERTONE_DATA[activeUndertoneKey];

  const [copiedId, setCopiedId] = useState(null);
  const [saveStatus, setSaveStatus] = useState(userProfile?.saved ? 'saved' : 'idle');
  const [printState, setPrintState] = useState(false);
  const [activeTab, setActiveTab] = useState('palette');
  const [shareNotify, setShareNotify] = useState('');

  const shareUrl = `${window.location.origin}${window.location.pathname}?undertone=${activeUndertoneKey}&ts=${encodeURIComponent(userProfile?.timestamp || new Date().toISOString())}`;

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveProfile = () => {
    if (userProfile) {
      const updated = { ...userProfile, saved: true };
      setUserProfile(updated);
      localStorage.setItem('vogue_vista_profile', JSON.stringify(updated));
      setSaveStatus('saved');
    } else {
      const dummy = { undertone: 'Warm', timestamp: new Date().toISOString(), saved: true };
      setUserProfile(dummy);
      localStorage.setItem('vogue_vista_profile', JSON.stringify(dummy));
      setSaveStatus('saved');
    }
  };

  const handleRetake = () => {
    setScreen('analysis');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const colorsList = data.fabulous.map(c => `
      <div class="color-card">
        <div class="color-box" style="background-color: ${c.hex};"></div>
        <div class="color-info">
          <div class="color-name">${c.name}</div>
          <div class="color-hex">${c.hex}</div>
          <div class="color-desc">${c.desc}</div>
        </div>
      </div>
    `).join('');

    const staplesList = UNIVERSAL_COLORS.map(c => `
      <div class="color-card">
        <div class="color-box" style="background-color: ${c.hex};"></div>
        <div class="color-info">
          <div class="color-name">${c.name}</div>
          <div class="color-hex">${c.hex}</div>
          <div class="color-desc">${c.desc}</div>
        </div>
      </div>
    `).join('');

    const wrongList = data.wrongColors.map(wc => `
      <div class="avoid-card">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px;">
          <div class="avoid-name">${wc.title}</div>
          <div style="width: 16px; height: 16px; border-radius: 50%; background-color: ${wc.example}; border: 1px solid #ddd;"></div>
        </div>
        <div class="avoid-desc">${wc.desc}</div>
      </div>
    `).join('');

    const tipsList = data.tips.map(tip => `
      <li class="guide-item">${tip}</li>
    `).join('');

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Vogue Vista - ${activeUndertoneKey} Undertone Report</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,500;1,300&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: 'Inter', sans-serif;
              color: #111111;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
              padding: 3rem 2rem;
              background-color: #FAFAFA;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #C6A16A;
              padding-bottom: 2rem;
              margin-bottom: 2.5rem;
            }
            .logo-vogue {
              font-family: 'Cormorant Garamond', Georgia, serif;
              font-size: 3rem;
              font-weight: 300;
              letter-spacing: 0.1em;
              text-transform: uppercase;
              margin: 0;
            }
            .logo-vista {
              font-family: 'Cormorant Garamond', Georgia, serif;
              font-size: 1.6rem;
              font-style: italic;
              color: #C6A16A;
              margin-top: -5px;
            }
            .report-title {
              font-family: 'Cormorant Garamond', Georgia, serif;
              font-size: 2.2rem;
              font-weight: 300;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin-top: 1.5rem;
              margin-bottom: 0.5rem;
            }
            .report-subtitle {
              font-family: 'Cormorant Garamond', Georgia, serif;
              font-style: italic;
              font-size: 1.2rem;
              color: #555555;
              margin-bottom: 1rem;
            }
            .metadata {
              font-size: 0.75rem;
              letter-spacing: 0.1em;
              text-transform: uppercase;
              color: #7E7E7E;
            }
            .section {
              background: #FFFFFF;
              padding: 2rem;
              border-radius: 12px;
              border: 1px solid #E5E5E5;
              margin-bottom: 2.5rem;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
            }
            .section-title {
              font-family: 'Cormorant Garamond', Georgia, serif;
              font-size: 1.5rem;
              font-weight: 500;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              border-bottom: 1px solid #E5E5E5;
              padding-bottom: 0.5rem;
              margin-bottom: 1.2rem;
              color: #111111;
            }
            .color-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 1.2rem;
            }
            .color-card {
              display: flex;
              align-items: center;
              gap: 1rem;
              padding: 1rem;
              border: 1px solid #E5E5E5;
              border-radius: 8px;
              background-color: #FAFAFA;
            }
            .color-box {
              width: 50px;
              height: 50px;
              border-radius: 6px;
              flex-shrink: 0;
              border: 1px solid rgba(0,0,0,0.06);
            }
            .color-info {
              display: flex;
              flex-direction: column;
              gap: 0.15rem;
            }
            .color-name {
              font-weight: 600;
              font-size: 0.85rem;
              text-transform: uppercase;
              letter-spacing: 0.02em;
            }
            .color-hex {
              font-family: monospace;
              font-size: 0.8rem;
              color: #7E7E7E;
            }
            .color-desc {
              font-size: 0.72rem;
              color: #4A4A4A;
              line-height: 1.3;
            }
            .avoid-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 1.2rem;
            }
            .avoid-card {
              padding: 1rem;
              border: 1px solid rgba(239, 68, 68, 0.15);
              border-radius: 8px;
              background-color: #FFF5F5;
            }
            .avoid-name {
              font-weight: 600;
              font-size: 0.85rem;
              color: #EF4444;
              text-transform: uppercase;
            }
            .avoid-desc {
              font-size: 0.75rem;
              color: #555555;
              line-height: 1.4;
            }
            .guide-list {
              padding-left: 1.2rem;
              margin: 0;
            }
            .guide-item {
              margin-bottom: 0.8rem;
              font-size: 0.88rem;
              color: #111111;
            }
            .footer-note {
              text-align: center;
              font-size: 0.7rem;
              color: #7E7E7E;
              letter-spacing: 0.1em;
              text-transform: uppercase;
              margin-top: 4rem;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-vogue">Vogue</div>
            <div class="logo-vista">Vista</div>
            <div class="report-title">${activeUndertoneKey} Undertone Report</div>
            <div class="report-subtitle">${data.subtitle}</div>
            <div class="metadata">Generated: ${new Date(userProfile?.timestamp || Date.now()).toLocaleDateString()}</div>
          </div>
          
          <div class="section">
            <div class="section-title">Dermal Reflectance Summary</div>
            <p style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.2rem; font-style: italic; line-height: 1.5; color: #111111;">
              "${data.telemetry}"
            </p>
            <div style="margin-top: 1.5rem; font-size: 0.85rem; display: flex; justify-content: space-between; border-top: 1px solid #E5E5E5; padding-top: 1rem;">
              <span><strong>Aura:</strong> ${data.season}</span>
              <span><strong>Signature Color:</strong> <span style="font-family: monospace; font-weight: 600;">${data.hex}</span></span>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">High-Yield Seasonal Spectrum</div>
            <div class="color-grid">
              ${colorsList}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Everyday Staples Spectrum</div>
            <div class="color-grid">
              ${staplesList}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Styling Chemistry Advisory</div>
            <p style="font-size: 0.9rem; margin-bottom: 1rem;">
              <strong>Jewellery Metals:</strong> ${data.jewellery.join(', ')}
            </p>
            <p style="font-size: 0.85rem; color: #4A4A4A; margin-bottom: 1.5rem; line-height: 1.5;">
              ${data.jewelleryDesc}
            </p>
            <p style="font-size: 0.9rem; margin-bottom: 0.5rem;">
              <strong>Recommended Hair Shades:</strong>
            </p>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              ${data.hair.map(h => `<span style="padding: 0.3rem 0.6rem; border: 1px solid #E5E5E5; border-radius: 4px; font-size: 0.72rem; font-weight: 500; text-transform: uppercase; background-color: #FAFAFA;">${h}</span>`).join('')}
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Wardrobe Guidelines</div>
            <ul class="guide-list">
              ${tipsList}
            </ul>
          </div>
          
          <div class="section" style="border: 1px solid rgba(239, 68, 68, 0.2);">
            <div class="section-title" style="color: #EF4444; border-bottom: 1px solid rgba(239, 68, 68, 0.15);">Colors to Avoid</div>
            <div class="avoid-grid">
              ${wrongList}
            </div>
          </div>

          <div class="footer-note">
            Vogue Vista AI Dermal Consultant &copy; 2026. All rights reserved.
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              }
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleCopyPalette = () => {
    const allHexes = data.fabulous.map(c => `${c.name}: ${c.hex}`).join('\n');
    handleCopy(allHexes, 'palette-all');
  };

  return (
    <section 
      style={{
        padding: '4rem 0',
        backgroundColor: 'var(--bg-primary)',
        position: 'relative'
      }}
      className="print-section"
    >
      <div className="editorial-container" style={{ maxWidth: '1100px' }}>
        
        {/* Large Editorial Headline & Tagline */}
        <div 
          style={{
            borderBottom: '1px solid var(--border-light)',
            paddingBottom: '1.8rem',
            marginBottom: '2.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1.5rem'
          }}
        >
          <div>
            <h1 
              className="editorial-glow-title"
              style={{ 
                fontFamily: 'var(--font-editorial)', 
                fontSize: '3.6rem', 
                fontWeight: 300, 
                lineHeight: '1.05', 
                textTransform: 'none',
                letterSpacing: '0.01em', 
                color: 'var(--text-primary)',
                margin: 0
              }}
            >
              {activeUndertoneKey} <span style={{ fontFamily: 'var(--font-cursive)', color: 'var(--accent-gold)', fontSize: '1.15em' }}>Undertone</span>
            </h1>
            <p 
              style={{ 
                fontFamily: 'var(--font-editorial)', 
                fontSize: '1.3rem', 
                fontStyle: 'italic', 
                color: 'var(--text-secondary)', 
                marginTop: '0.6rem', 
                marginBottom: 0,
                opacity: 0.95,
                lineHeight: '1.4'
              }}
            >
              {activeUndertoneKey === 'Warm' 
                ? "A masterclass in thermal radiance and golden hour elegance." 
                : activeUndertoneKey === 'Cool' 
                ? "A dialogue between porcelain shadows and alpine brilliance." 
                : "An equilibrium of sand and slate, written in skin."}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.5rem' }} className="no-print">
            <button 
              className="btn-lux-outline" 
              onClick={handleRetake}
              style={{ padding: '0.5rem 1.1rem', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem', borderRadius: '4px' }}
            >
              <RefreshCw size={11} />
              <span>Retake</span>
            </button>
            <button 
              className="btn-lux" 
              onClick={handleSaveProfile}
              style={{ padding: '0.5rem 1.1rem', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem', borderRadius: '4px' }}
            >
              <Bookmark size={11} style={{ color: 'var(--accent-gold)' }} />
              <span>{saveStatus === 'saved' ? "Committed" : "Save Spread"}</span>
            </button>
          </div>
        </div>

        {/* Core Calibration Dashboard Card */}
        <div 
          className="lux-card"
          style={{
            borderRadius: '12px',
            padding: '1.8rem',
            marginBottom: '2.5rem',
            backgroundColor: 'var(--bg-secondary)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.8rem',
            border: '1px solid var(--border-light)',
            alignItems: 'center'
          }}
        >
          <div>
            <span style={{ fontFamily: 'var(--font-accent)', fontSize: '0.58rem', letterSpacing: '0.2em', color: 'var(--accent-gold)', textTransform: 'uppercase', fontWeight: 600 }}>
              Dermal Reflectance Summary
            </span>
            <p style={{ fontSize: '0.95rem', fontFamily: 'var(--font-editorial)', fontStyle: 'italic', lineHeight: '1.5', color: 'var(--text-primary)', marginTop: '0.6rem' }}>
              "{data.telemetry}"
            </p>
          </div>

          {/* Aura & Hex Signature Box */}
          <div 
            style={{
              borderLeft: '1px solid var(--border-medium)',
              paddingLeft: '1.8rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.8rem'
            }}
            className="aura-signature-box"
          >
            <div>
              <span style={{ fontSize: '0.58rem', fontFamily: 'var(--font-accent)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Aura Classification</span>
              <h4 style={{ fontSize: '1.1rem', textTransform: 'uppercase', marginTop: '0.1rem', fontWeight: 400, letterSpacing: '0.05em' }}>{data.season}</h4>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div 
                style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '6px', 
                  backgroundColor: data.hex, 
                  cursor: 'pointer', 
                  border: '1px solid var(--border-medium)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }} 
                onClick={() => handleCopy(data.hex, 'signature-hex-copy')}
                title="Copy Hex Code"
              />
              <div>
                <span style={{ fontSize: '0.58rem', fontFamily: 'var(--font-accent)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Calibrated Hex</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.05rem' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 600 }}>{data.hex}</span>
                  <button 
                    onClick={() => handleCopy(data.hex, 'signature-hex-copy-btn')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                  >
                    {copiedId === 'signature-hex-copy' || copiedId === 'signature-hex-copy-btn' ? <Check size={11} style={{ color: 'var(--accent-gold)' }} /> : <Copy size={11} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Editorial Tab Index */}
        <div 
          className="no-print"
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-light)',
            marginBottom: '2.2rem',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.1rem'
          }}
        >
          {[
            { id: 'palette', label: 'Chromatic Palette', icon: <Layers size={12} /> },
            { id: 'styling', label: 'Styling Chemistry', icon: <Sparkles size={12} /> },
            { id: 'advisory', label: 'Advisory Rules', icon: <BookOpen size={12} /> },
            { id: 'export', label: 'Save & Export', icon: <Download size={12} /> }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.7rem 1.2rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: isActive ? '2px solid var(--accent-gold)' : '2px solid transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontFamily: 'var(--font-accent)',
                  fontSize: '0.7rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.25s ease'
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab contents */}
        <div>
          
          {/* TAB 1: CHROMATIC PALETTE */}
          <div className="tab-content-panel" style={{ display: (activeTab === 'palette' || printState) ? 'block' : 'none' }}>
            
            {/* Fabulous Colors */}
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.2rem' }}>
                <h3 style={{ fontSize: '1.4rem', textTransform: 'uppercase', fontWeight: 300, letterSpacing: '0.05em', fontFamily: 'var(--font-editorial)', fontStyle: 'italic' }}>High-Yield Seasonal Spectrum</h3>
                <button 
                  onClick={handleCopyPalette}
                  className="btn-lux-outline" 
                  style={{ padding: '0.35rem 0.8rem', fontSize: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem', borderRadius: '4px' }}
                >
                  {copiedId === 'palette-all' ? <Check size={10} style={{ color: 'var(--accent-gold)' }} /> : <Copy size={10} />}
                  <span>Copy Palette Codes</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '1.5rem' }}>
                {data.fabulous.map((color, idx) => (
                  <div 
                    key={idx}
                    className="lux-card"
                    style={{
                      padding: '0',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-tertiary)',
                      transition: 'transform 0.3s ease'
                    }}
                  >
                    <div style={{ backgroundColor: color.hex, height: '80px', width: '100%', position: 'relative' }}>
                      <button
                        onClick={() => handleCopy(color.hex, `color-${idx}`)}
                        style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                        }}
                        title="Copy Hex"
                      >
                        {copiedId === `color-${idx}` ? <Check size={10} style={{ color: 'var(--accent-gold)' }} /> : <Copy size={10} />}
                      </button>
                    </div>
                    <div style={{ padding: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, fontFamily: 'var(--font-accent)', textTransform: 'uppercase', letterSpacing: '0.02em', color: 'var(--text-primary)' }}>{color.name}</span>
                        <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{color.hex}</span>
                      </div>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.35' }}>{color.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Universal Colors */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.4rem', textTransform: 'uppercase', fontWeight: 300, marginBottom: '1rem', letterSpacing: '0.05em', fontFamily: 'var(--font-editorial)', fontStyle: 'italic' }}>Everyday Capsule Staples</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '1.5rem' }}>
                {UNIVERSAL_COLORS.map((color, idx) => (
                  <div 
                    key={idx}
                    className="lux-card"
                    style={{
                      padding: '0',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-tertiary)'
                    }}
                  >
                    <div style={{ backgroundColor: color.hex, height: '55px', width: '100%' }} />
                    <div style={{ padding: '0.75rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, fontFamily: 'var(--font-accent)', textTransform: 'uppercase', color: 'var(--text-primary)' }}>{color.name}</span>
                        <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{color.hex}</span>
                      </div>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.35' }}>{color.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* TAB 2: STYLING CHEMISTRY */}
          <div className="tab-content-panel" style={{ display: (activeTab === 'styling' || printState) ? 'block' : 'none' }}>
            
            {/* Jewel advisory */}
            <div className="lux-card" style={{ borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1.2rem', padding: '1.8rem', border: '1px solid var(--border-light)', marginBottom: '2rem' }}>
              <span style={{ fontFamily: 'var(--font-accent)', fontSize: '0.58rem', letterSpacing: '0.15em', color: 'var(--accent-gold)', textTransform: 'uppercase', fontWeight: 600 }}>Glow Chemistry</span>
              <h3 style={{ fontSize: '1.4rem', textTransform: 'uppercase', fontWeight: 300, letterSpacing: '0.05em', fontFamily: 'var(--font-editorial)', fontStyle: 'italic' }}>High Jewelry Selections</h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {data.jewellery.map((metal, idx) => (
                  <span key={idx} style={{ padding: '0.35rem 0.8rem', borderRadius: '16px', border: '1px solid var(--border-medium)', fontSize: '0.7rem', fontFamily: 'var(--font-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{metal}</span>
                ))}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{data.jewelleryDesc}</p>
            </div>

            {/* Crown hair harmony */}
            <div style={{ marginTop: '2rem' }}>
              <div className="lux-card" style={{ borderRadius: '10px', padding: '1.8rem', border: '1px solid var(--border-light)' }}>
                <span style={{ fontFamily: 'var(--font-accent)', fontSize: '0.58rem', letterSpacing: '0.15em', color: 'var(--accent-gold)', textTransform: 'uppercase', display: 'block', marginBottom: '0.6rem', fontWeight: 600 }}>Crown Harmony</span>
                <h3 style={{ fontSize: '1.4rem', textTransform: 'uppercase', fontWeight: 300, marginBottom: '1rem', fontFamily: 'var(--font-editorial)', fontStyle: 'italic', letterSpacing: '0.05em' }}>Hair Shade Consultation</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem' }}>
                  {data.hair.map((shade, idx) => (
                    <div key={idx} style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: '4px', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 500, letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
                      {shade}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* TAB 3: ADVISORY RULES */}
          <div className="tab-content-panel" style={{ display: (activeTab === 'advisory' || printState) ? 'block' : 'none' }}>
            
            {/* Wrong Colors / Mismatches */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '1.4rem', textTransform: 'uppercase', fontWeight: 300, marginBottom: '1rem', letterSpacing: '0.05em', fontFamily: 'var(--font-editorial)', fontStyle: 'italic' }}>Colors to Avoid</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                {data.wrongColors.map((item, idx) => (
                  <div key={idx} className="lux-card" style={{ borderRadius: '8px', padding: '1.1rem', border: '1px solid rgba(239, 68, 68, 0.15)', backgroundColor: 'var(--bg-tertiary)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#EF4444' }}>
                        <Ban size={12} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', fontFamily: 'var(--font-accent)' }}>{item.title}</span>
                      </div>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: item.example, border: '1px solid var(--border-medium)' }} />
                    </div>
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Styling Tips */}
            <div>
              <div className="lux-card" style={{ borderRadius: '10px', padding: '1.8rem', border: '1px solid var(--border-light)' }}>
                <span style={{ fontFamily: 'var(--font-accent)', fontSize: '0.58rem', letterSpacing: '0.15em', color: 'var(--accent-gold)', textTransform: 'uppercase', display: 'block', marginBottom: '0.6rem', fontWeight: 600 }}>Advisory Guidelines</span>
                <h3 style={{ fontSize: '1.4rem', textTransform: 'uppercase', fontWeight: 300, marginBottom: '1rem', fontFamily: 'var(--font-editorial)', fontStyle: 'italic', letterSpacing: '0.05em' }}>Wardrobe Rules</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  {data.tips.map((tip, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', padding: '0.4rem 0' }}>
                      <div style={{ color: 'var(--accent-gold)', flexShrink: 0, marginTop: '1px' }}>
                        <ShieldCheck size={14} />
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: '1.45', margin: 0 }}>{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* TAB 4: SAVE & EXPORT */}
          <div className="tab-content-panel" style={{ display: (activeTab === 'export' || printState) ? 'block' : 'none' }}>
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '2rem',
                alignItems: 'stretch'
              }}
            >
              {/* Export Panel */}
              <div 
                className="lux-card" 
                style={{
                  borderRadius: '12px',
                  padding: '2.2rem 1.8rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-light)',
                  textAlign: 'left'
                }}
              >
                <div>
                  <span style={{ fontFamily: 'var(--font-accent)', fontSize: '0.58rem', letterSpacing: '0.15em', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Archiving Systems</span>
                  <h3 style={{ fontSize: '1.4rem', textTransform: 'uppercase', marginTop: '0.2rem', fontWeight: 300, fontFamily: 'var(--font-editorial)', fontStyle: 'italic', letterSpacing: '0.02em' }}>Export spread options</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: '1.45' }}>
                    Save your custom analysis spread to your local profile database, or export a high-yield print-ready PDF transcript of your results.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }} className="no-print">
                  <button onClick={handleDownloadPDF} className="btn-lux" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 1.4rem', fontSize: '0.68rem', borderRadius: '4px' }}>
                    <Download size={12} style={{ color: 'var(--accent-gold)' }} />
                    <span>Download PDF</span>
                  </button>

                  <button onClick={handleSaveProfile} className="btn-lux-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 1.4rem', fontSize: '0.68rem', borderRadius: '4px' }}>
                    <Bookmark size={12} />
                    <span>{saveStatus === 'saved' ? "Committed" : "Save Spread"}</span>
                  </button>
                </div>
              </div>

              {/* Share Panel */}
              <div 
                className="lux-card" 
                style={{
                  borderRadius: '12px',
                  padding: '2.2rem 1.8rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-light)',
                  textAlign: 'left'
                }}
              >
                <div>
                  <span style={{ fontFamily: 'var(--font-accent)', fontSize: '0.58rem', letterSpacing: '0.15em', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Share spread</span>
                  <h3 style={{ fontSize: '1.4rem', textTransform: 'uppercase', marginTop: '0.2rem', fontWeight: 300, fontFamily: 'var(--font-editorial)', fontStyle: 'italic', letterSpacing: '0.02em' }}>Share your analysis</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: '1.45' }}>
                    Use the unique access link below to retrieve this exact dermal analysis spread at any time, or share it with others on your socials.
                  </p>
                </div>

                {/* Unique link copy-box */}
                <div style={{ display: 'flex', width: '100%', border: '1px solid var(--border-medium)', borderRadius: '6px', overflow: 'hidden', backgroundColor: 'var(--bg-tertiary)', marginTop: '0.5rem' }} className="no-print">
                  <input 
                    type="text" 
                    readOnly 
                    value={shareUrl} 
                    style={{ flex: 1, border: 'none', padding: '0.6rem 0.8rem', fontSize: '0.75rem', color: 'var(--text-secondary)', backgroundColor: 'transparent', outline: 'none', fontFamily: 'monospace' }}
                  />
                  <button 
                    onClick={() => handleCopy(shareUrl, 'share-url')} 
                    style={{ border: 'none', borderLeft: '1px solid var(--border-medium)', padding: '0.6rem 1rem', background: 'none', cursor: 'pointer', fontFamily: 'var(--font-accent)', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.3s ease', fontWeight: 500 }}
                  >
                    {copiedId === 'share-url' ? <Check size={11} /> : <Copy size={11} />}
                    <span>{copiedId === 'share-url' ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                {/* Social media sharing grid */}
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', width: '100%', marginTop: '0.5rem' }} className="no-print">
                  {/* Twitter / X */}
                  <a 
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I just analyzed my skin undertone on Vogue Vista and found out I have a ${activeUndertoneKey} Undertone! Analyze yours here:`)}&url=${encodeURIComponent(shareUrl)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="share-social-btn"
                    title="Share on Twitter / X"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span>Twitter</span>
                  </a>

                  {/* Facebook */}
                  <a 
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="share-social-btn"
                    title="Share on Facebook"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/>
                    </svg>
                    <span>Facebook</span>
                  </a>

                  {/* Snapchat */}
                  <button 
                    onClick={() => {
                      handleCopy(shareUrl, 'snapchat');
                      setShareNotify('Snapchat Share: Access link copied! Paste it in your Snapchat stories or chats to share your spread.');
                      setTimeout(() => setShareNotify(''), 60000);
                    }}
                    className="share-social-btn"
                    title="Share on Snapchat"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61-.1.21-.24.57-.24.96 0 .97.79 1.43 1.76 1.43 h1c.42 1.34 1.54 2 2.76 2 .93 0 1.63-.37 2.1-.9.47.53 1.17.9 2.1.9 1.22 0 2.34-.66 2.76-2h1c.97 0 1.76-.46 1.76-1.43 0-.39-.14-.75-.24-.96 1.23-1.54 1.97-3.49 1.97-5.61 0-4.97-4.03-9-9-9zm0 2c3.87 0 7 3.13 7 7 0 1.56-.51 3.01-1.38 4.18-.75-.6-1.85-.98-3.05-1.07.24-.48.43-1.01.43-1.61 0-1.66-1.34-3-3-3s-3 1.34-3 3c0 .6.19 1.13.43 1.61-1.2.09-2.3.47-3.05 1.07A6.979 6.979 0 015 11c0-3.87 3.13-7 7-7zm0 6c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"/>
                    </svg>
                    <span>Snapchat</span>
                  </button>

                  {/* Instagram */}
                  <button 
                    onClick={() => {
                      handleCopy(shareUrl, 'instagram');
                      setShareNotify('Instagram Share: Access link copied! Add it to your Instagram Story Link sticker or Bio to share your spread.');
                      setTimeout(() => setShareNotify(''), 60000);
                    }}
                    className="share-social-btn"
                    title="Share on Instagram"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                    <span>Instagram</span>
                  </button>
                </div>

                {shareNotify && (
                  <div style={{ marginTop: '0.8rem', padding: '0.6rem 0.8rem', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--accent-gold)', borderRadius: '6px', fontSize: '0.72rem', color: 'var(--text-primary)', width: '100%', animation: 'fadeIn 0.4s ease forwards' }}>
                    {shareNotify}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Styled settings for compact, tabbed presentation and printing layouts */}
      <style>{`
        .share-social-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 1rem;
          border: 1px solid var(--border-medium);
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
          font-family: var(--font-accent);
          font-size: 0.68rem;
          font-weight: 500;
          border-radius: 4px;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .share-social-btn:hover {
          border-color: var(--accent-gold);
          color: var(--accent-gold);
          transform: translateY(-1px);
        }
        @media print {
          *, *::before, *::after {
            background-color: transparent !important;
            color: #000000 !important;
            box-shadow: none !important;
            text-shadow: none !important;
          }
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          header, footer, .no-print, .btn-lux, .btn-lux-outline, .threed-viewer-container {
            display: none !important;
          }
          .print-section {
            padding: 0 !important;
            margin: 0 !important;
          }
          .editorial-container {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .lux-card {
            border: 1px solid #111111 !important;
            box-shadow: none !important;
            background-color: transparent !important;
            padding: 1rem !important;
            page-break-inside: avoid;
            margin-bottom: 1.2rem !important;
          }
          .tab-content-panel {
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
          }
        }
      `}</style>
    </section>
  );
}
