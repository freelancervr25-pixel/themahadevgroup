import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Fit an image inside a box (object-fit: contain) when drawing into jsPDF
const drawImageContain = (pdf, imgData, x, y, maxW, maxH, format = "JPEG") => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const iw = img.width || 1;
        const ih = img.height || 1;
        const scale = Math.min(maxW / iw, maxH / ih);
        const w = Math.max(1, Math.min(maxW, iw * scale));
        const h = Math.max(1, Math.min(maxH, ih * scale));
        const cx = x + (maxW - w) / 2;
        const cy = y + (maxH - h) / 2;
        pdf.addImage(imgData, format, cx, cy, w, h);
        resolve();
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = reject;
    img.src = imgData;
  });
};

// Helper function to convert image URL to base64
export const imageToBase64 = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/jpeg"));
    };
    img.onerror = reject;
    img.src = url;
  });
};

// Generate Full Catalogue PDF
export const generateCataloguePDF = async (products, options = {}) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Header (brand removed)
  pdf.setFontSize(16);
  pdf.setTextColor(251, 192, 45); // Gold color
  pdf.text("Full Catalogue", pageWidth / 2, 20, { align: "center" });

  // Promo note (bigger + highlighted banner)
  const promoText = "Get extra 15% OFF on total";
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  // Draw a light highlight banner behind the text
  const bannerY = 32; // moved down
  const bannerH = 10;
  pdf.setFillColor(255, 248, 225); // light yellow
  pdf.rect(20, bannerY - 7, pageWidth - 40, bannerH + 4, "F");
  pdf.setTextColor(211, 47, 47); // red text
  pdf.text(promoText, pageWidth / 2, bannerY, { align: "center" });
  // Reset font weight
  pdf.setFont("helvetica", "normal");

  let yPosition = 45; // push content further down
  let catalogueTotal = 0;
  for (let i = 0; i < products.length; i++) {
    const product = products[i] || {};

    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = 20;
    }

    try {
      if (product.image) {
        const imgData = product.image.startsWith("data:image/")
          ? product.image
          : await imageToBase64(product.image);
        await drawImageContain(pdf, imgData, 20, yPosition, 60, 60, "JPEG");
      }
    } catch {}

    const textX = 90;
    pdf.setFontSize(13);
    pdf.setTextColor(0, 0, 0);
    pdf.text(String(product.name || "Unnamed"), textX, yPosition + 8);

    pdf.setFontSize(10);
    pdf.setTextColor(120, 120, 120);
    pdf.text(
      `Original: Rs ${Number(product.originalPrice || 0).toFixed(2)}`,
      textX,
      yPosition + 18
    );

    pdf.setFontSize(14);
    pdf.setTextColor(211, 47, 47);
    pdf.text(
      `Rs ${Number(product.price || 0).toFixed(2)}`,
      textX,
      yPosition + 30
    );

    // Possible 15% discount preview per item
    const basePrice = Number(product.price || 0);
    const discountPercent = 15;
    const discountAmount = (basePrice * discountPercent) / 100;
    const netPrice = Math.max(0, basePrice - discountAmount);

    pdf.setFontSize(11);
    pdf.setTextColor(120, 120, 120);
    pdf.text(
      `Save ${discountPercent}%: Rs ${discountAmount.toFixed(2)}`,
      textX,
      yPosition + 40
    );

    pdf.setFontSize(12);
    pdf.setTextColor(46, 125, 50); // green
    pdf.text(`You pay: Rs ${netPrice.toFixed(2)}`, textX, yPosition + 50);

    pdf.setDrawColor(230, 230, 230);
    pdf.line(20, yPosition + 65, pageWidth - 20, yPosition + 65);

    catalogueTotal += Number(product.price || 0);
    yPosition += 75;
  }

  // Removed overall total display for catalogue as requested

  // Footer (brand removed)
  // Intentionally left blank

  pdf.save("Catalogue.pdf");
};

// Generate Order PDF
export const generateOrderPDF = async (
  cartItems,
  customerInfo,
  totalPrice,
  options = {}
) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const topMargin = 20;
  const bottomMargin = 20;

  // Header (brand removed)
  pdf.setFontSize(16);
  pdf.setTextColor(251, 192, 45);
  pdf.text("Order Summary", pageWidth / 2, topMargin, { align: "center" });

  // Customer Info
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Customer Name: ${customerInfo.name}`, 20, topMargin + 20);
  pdf.text(`Mobile: ${customerInfo.mobile}`, 20, topMargin + 30);
  pdf.text(`Order Date: ${new Date().toLocaleString()}`, 20, topMargin + 40);

  // Line separator
  pdf.setDrawColor(211, 47, 47);
  pdf.line(20, topMargin + 50, pageWidth - 20, topMargin + 50);

  let yPosition = topMargin + 60;

  // Optional coupon/discount block
  if (options && (options.couponApplied || options.coupon_code)) {
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    const orderTotal = Number(options.orderTotal ?? totalPrice);
    const discountPercent = Number(options.discountPercent ?? 0);
    const discountAmount = Number(options.discountAmount ?? 0);
    const netTotal = Number(options.netTotal ?? totalPrice);

    pdf.text(
      `Coupon: ${options.couponCode || options.coupon_code || "(applied)"}`,
      20,
      yPosition
    );
    yPosition += 7;
    pdf.text(`Order Total: Rs ${orderTotal.toFixed(2)}`, 20, yPosition);
    yPosition += 7;
    pdf.text(
      `Discount: ${discountPercent}% (Rs ${discountAmount.toFixed(2)})`,
      20,
      yPosition
    );
    yPosition += 7;
    pdf.text(`Net Total: Rs ${netTotal.toFixed(2)}`, 20, yPosition);
    yPosition += 10;

    // separator
    pdf.setDrawColor(211, 47, 47);
    pdf.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 10;
  }

  // Helper to draw table header
  const drawTableHeader = () => {
    pdf.setFontSize(10);
    pdf.setTextColor(255, 255, 255);
    pdf.setFillColor(211, 47, 47);
    pdf.rect(20, yPosition - 5, pageWidth - 40, 10, "F");
    pdf.text("Item", 25, yPosition);
    pdf.text("Qty", 100, yPosition);
    pdf.text("Price", 120, yPosition);
    pdf.text("Total", 150, yPosition);
    yPosition += 15;
  };

  // Draw initial header
  drawTableHeader();

  const rowHeight = 25; // with image
  const rowHeightNoImg = 20; // without image

  // Order items
  for (const item of cartItems) {
    // Check space; if not enough for next row + totals, add page and header
    const needed = rowHeight;
    if (yPosition + needed > pageHeight - bottomMargin) {
      pdf.addPage();
      yPosition = topMargin; // start near top on new page
      drawTableHeader();
    }

    try {
      // Add product image
      const imgData = await imageToBase64(item.image);
      await drawImageContain(pdf, imgData, 20, yPosition, 15, 15, "JPEG");

      // Add item details
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(item.name, 40, yPosition + 10);
      pdf.text(item.quantity.toString(), 100, yPosition + 10);
      pdf.text(`Rs ${item.price}`, 120, yPosition + 10);
      pdf.text(`Rs ${item.price * item.quantity}`, 150, yPosition + 10);

      yPosition += rowHeight;
    } catch (error) {
      // Add text without image if image fails
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(item.name, 20, yPosition + 10);
      pdf.text(item.quantity.toString(), 100, yPosition + 10);
      pdf.text(`Rs ${item.price}`, 120, yPosition + 10);
      pdf.text(`Rs ${item.price * item.quantity}`, 150, yPosition + 10);
      yPosition += rowHeightNoImg;
    }
  }

  // Ensure space for totals; if not, add a new page
  const totalsBlockHeight =
    options && (options.couponApplied || options.discountAmount) ? 24 : 8;
  if (yPosition + totalsBlockHeight > pageHeight - bottomMargin) {
    pdf.addPage();
    yPosition = topMargin;
  }

  // Totals (with optional discount summary)
  pdf.setFontSize(14);
  pdf.setTextColor(211, 47, 47);
  const baseY = yPosition + 10;
  if (options && (options.couponApplied || options.discountAmount)) {
    // Show order total, discount, and net total stacked at the bottom-right
    pdf.text(
      `Order Total: Rs ${Number(options.orderTotal ?? totalPrice).toFixed(2)}`,
      pageWidth - 50,
      baseY,
      { align: "right" }
    );
    pdf.text(
      `Discount: ${Number(options.discountPercent || 0)}% (Rs ${Number(
        options.discountAmount || 0
      ).toFixed(2)})`,
      pageWidth - 50,
      baseY + 8,
      { align: "right" }
    );
    pdf.text(
      `Total: Rs ${Number(options.netTotal ?? totalPrice).toFixed(2)}`,
      pageWidth - 50,
      baseY + 16,
      { align: "right" }
    );
  } else {
    pdf.text(`Total: Rs ${totalPrice.toFixed(2)}`, pageWidth - 50, baseY, {
      align: "right",
    });
  }

  // Footer (brand removed)
  // Intentionally left blank

  const fileName = `Order_${customerInfo.name}_$${
    new Date().toISOString().split("T")[0]
  }.pdf`;
  pdf.save(fileName);
};
