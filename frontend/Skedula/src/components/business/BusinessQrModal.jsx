import React, { useState } from 'react';
import { toast } from 'react-toastify';

const BusinessQrModal = ({ business, bookingUrl, onClose }) => {
  const [copied, setCopied] = useState(false);

  // Generate high-resolution QR code URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=15&data=${encodeURIComponent(bookingUrl)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    toast.success('Direct Booking Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = `📅 Book your appointment directly with *${business?.name || 'us'}* on Skedula:\n👉 ${bookingUrl}\n\n1-tap instant reservation with escrow security!`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Pop-up blocked. Please allow pop-ups to print the counter stand.');
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Counter Stand - ${business?.name || 'Skedula'}</title>
          <style>
            @page { size: auto; margin: 15mm; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              text-align: center;
              padding: 40px;
              color: #1A3C26;
              background: #fff;
            }
            .stand-card {
              max-width: 420px;
              margin: 0 auto;
              border: 2px solid #1A3C26;
              border-radius: 28px;
              padding: 36px 28px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.06);
            }
            .badge {
              display: inline-block;
              background: #B9E959;
              color: #1A3C26;
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 1px;
              padding: 6px 16px;
              border-radius: 999px;
              margin-bottom: 18px;
            }
            h1 {
              font-size: 26px;
              margin: 0 0 8px;
              font-weight: 800;
            }
            p.sub {
              font-size: 13px;
              color: #555;
              margin: 0 0 24px;
            }
            .qr-frame {
              background: #F5F2EB;
              border-radius: 20px;
              padding: 20px;
              display: inline-block;
              margin-bottom: 20px;
            }
            .qr-img {
              width: 220px;
              height: 220px;
              display: block;
            }
            .scan-tip {
              font-size: 13px;
              font-weight: 700;
              color: #1A3C26;
              margin: 0 0 4px;
            }
            .url-text {
              font-family: monospace;
              font-size: 11px;
              color: #666;
              word-break: break-all;
            }
            .footer {
              margin-top: 24px;
              font-size: 10px;
              color: #888;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
          </style>
        </head>
        <body>
          <div class="stand-card">
            <span class="badge">Official Booking Stand</span>
            <h1>${business?.name || 'Direct Booking'}</h1>
            <p class="sub">Scan with any camera app to view services & reserve slots instantly</p>
            <div class="qr-frame">
              <img src="${qrCodeUrl}" class="qr-img" alt="QR Code" />
            </div>
            <p class="scan-tip">📲 Scan to Book Instantly</p>
            <p class="url-text">${bookingUrl}</p>
            <div class="footer">Powered by Skedula Smart Escrow Booking</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-neutral-border shadow-2xl space-y-6 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-neutral-background hover:bg-neutral-border text-brand-primary flex items-center justify-center transition-colors cursor-pointer"
          title="Close Modal"
        >
          <i className="bi bi-x-lg text-sm"></i>
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <span className="inline-block bg-brand-secondary text-brand-primary text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            Front-Desk Stand & Social QR
          </span>
          <h3 className="text-2xl font-bold font-primary text-brand-primary">
            {business?.name || '1-Tap Booking Link'}
          </h3>
          <p className="text-xs text-text-secondary">
            Scan to book appointments directly with zero search friction.
          </p>
        </div>

        {/* QR Code Frame */}
        <div className="bg-brand-dark rounded-3xl p-6 text-center border border-white/10 shadow-inner space-y-4">
          <div className="bg-white p-4 rounded-2xl inline-block shadow-md">
            <img
              src={qrCodeUrl}
              alt="Direct Booking QR Code"
              className="w-48 h-48 mx-auto object-contain"
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-brand-secondary flex items-center justify-center gap-1.5">
              <i className="bi bi-qr-code-scan"></i>
              <span>Point Camera to Reserve</span>
            </p>
            <p className="text-[11px] text-white/70 font-mono truncate px-4">
              {bookingUrl}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleCopy}
              className={`py-3 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                copied
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-brand-primary text-white hover:bg-brand-dark border-brand-primary'
              }`}
            >
              <i className={`bi ${copied ? 'bi-check2' : 'bi-link-45deg'} text-base`}></i>
              <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <i className="bi bi-whatsapp text-base text-brand-secondary"></i>
              <span>Share WhatsApp</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="w-full bg-neutral-background hover:bg-neutral-border/60 text-brand-primary py-3 rounded-2xl text-xs font-bold border border-neutral-border/80 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <i className="bi bi-printer text-sm"></i>
            <span>Print Counter Stand Poster</span>
          </button>
        </div>

        {/* Pro Tip */}
        <div className="p-3 bg-neutral-background/70 rounded-2xl border border-neutral-border/60 text-[11px] text-text-secondary flex items-start gap-2">
          <i className="bi bi-lightbulb-fill text-amber-500 mt-0.5"></i>
          <span>
            <strong>Pro Tip:</strong> Add this link to your Instagram bio and print this QR stand for your clinic or salon reception counter.
          </span>
        </div>
      </div>
    </div>
  );
};

export default BusinessQrModal;
