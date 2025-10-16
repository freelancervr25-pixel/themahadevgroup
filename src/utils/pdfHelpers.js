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

  // Safety Precautions (append at the end)
  const safetyBlockHeight = 60;
  if (yPosition + safetyBlockHeight > pageHeight - 20) {
    pdf.addPage();
    yPosition = 20;
  }
  // Draw a small warning icon (yellow circle with !)
  pdf.setFillColor(255, 235, 59); // yellow
  pdf.setDrawColor(251, 140, 0); // amber border
  pdf.circle(18, yPosition - 2, 4, "FD");
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(8);
  pdf.text("!", 18, yPosition, { align: "center" });

  // Title
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text("Safety Precautions", 26, yPosition);
  pdf.setFontSize(9);
  pdf.setTextColor(90, 90, 90);
  const safetyLines = [
    "- Always read and follow all instructions on the label.",
    "- Use fireworks outdoors in a clear, open area away from buildings and vehicles.",
    "- Keep water (bucket/hose) nearby. Never relight a malfunctioning item.",
    "- Maintain a safe distance. If a firework doesn't light, NEVER put your head above the exit point; wait 15 minutes, then soak it in water.",
    "- Light one firework at a time and move back quickly.",
    "- Never allow young children to handle fireworks; adult supervision is required.",
    "- Do not point or throw fireworks at people, animals, or objects.",
  ];
  let lineY = yPosition + 8;
  safetyLines.forEach((l) => {
    pdf.text(l, 22, lineY);
    lineY += 6;
  });

  // Simple caution diagram: tube exit point + unsafe head (X) and safe head (✓)
  // Diagram origin
  let dx = 22;
  let dy = lineY + 6;

  // Draw firework tube (rectangle)
  pdf.setDrawColor(120, 120, 120);
  pdf.setFillColor(230, 230, 230);
  pdf.rect(dx, dy, 14, 28, "FD");

  // Exit arrow (upwards)
  pdf.setDrawColor(211, 47, 47);
  // Arrow shaft
  pdf.line(dx + 7, dy, dx + 7, dy - 12);
  // Arrow head
  pdf.line(dx + 7, dy - 12, dx + 4, dy - 8);
  pdf.line(dx + 7, dy - 12, dx + 10, dy - 8);
  pdf.setFontSize(8);
  pdf.setTextColor(211, 47, 47);
  pdf.text("EXIT", dx + 11, dy - 6);

  // Unsafe head near exit (red X)
  const badHeadX = dx + 28;
  const badHeadY = dy - 6;
  pdf.setDrawColor(244, 67, 54);
  pdf.circle(badHeadX, badHeadY, 4);
  // X mark
  pdf.line(badHeadX - 3, badHeadY - 3, badHeadX + 3, badHeadY + 3);
  pdf.line(badHeadX + 3, badHeadY - 3, badHeadX - 3, badHeadY + 3);
  pdf.setTextColor(244, 67, 54);
  pdf.text("DON'T", badHeadX - 7, badHeadY + 9);

  // Safe head farther away (green check)
  const goodHeadX = dx + 60;
  const goodHeadY = dy + 8;
  pdf.setDrawColor(76, 175, 80);
  pdf.circle(goodHeadX, goodHeadY, 4);
  // Check mark
  pdf.line(goodHeadX - 2, goodHeadY + 1, goodHeadX - 0.5, goodHeadY + 3);
  pdf.line(goodHeadX - 0.5, goodHeadY + 3, goodHeadX + 3, goodHeadY - 1);
  pdf.setTextColor(76, 175, 80);
  pdf.text("SAFE", goodHeadX - 6, goodHeadY + 9);

  // Add comprehensive safety footer section (match SafetyFooter design)
  // Always append as a brand new page at the end for clarity
  pdf.addPage();
  let footerY = 20;

  // Header bar: yellow background with orange border and caution icon
  const headerBarHeight = 16;
  pdf.setFillColor(255, 215, 0); // #FFD700
  pdf.setDrawColor(255, 165, 0); // #FFA500
  pdf.rect(20, footerY, pageWidth - 40, headerBarHeight, "FD");

  // Caution icon (yellow circle with exclamation) inside header bar
  pdf.setFillColor(255, 215, 0);
  pdf.setDrawColor(255, 165, 0);
  pdf.circle(28, footerY + headerBarHeight / 2, 4, "FD");
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(9);
  pdf.text("!", 28, footerY + headerBarHeight / 2 + 2, { align: "center" });

  // Header title text
  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text("Safety Notice", pageWidth / 2, footerY + headerBarHeight - 4, {
    align: "center",
  });

  footerY += headerBarHeight + 8;

  // Warning section: red banner with white text
  const warnHeight = 16;
  pdf.setFillColor(255, 107, 107); // #FF6B6B
  pdf.setDrawColor(229, 62, 62); // #E53E3E
  pdf.rect(20, footerY, pageWidth - 40, warnHeight, "FD");
  pdf.setFontSize(10);
  pdf.setTextColor(255, 255, 255);
  pdf.text(
    "Fireworks can be dangerous if not handled properly. Please read and follow all safety instructions.",
    25,
    footerY + warnHeight - 5
  );

  footerY += warnHeight + 8;

  // Instructions block: yellow background, no border, simple bullet rows (single column)
  const blockX = 20;
  let blockY = footerY;
  const blockW = pageWidth - 40;

  // Title inside block
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);

  // Single-column content
  const items = [
    "Always read the instructions on the firecracker pack before use",
    "Maintain a safe distance from fireworks when lighting",
    "Never put your head above the exit point of a firework",
    "If a firework doesn't light, wait 15 minutes, then soak it in water",
    "Keep water or a fire extinguisher nearby",
    "Light fireworks in an open area away from buildings and trees",
    'Never relight a "dud" firework',
    "Supervise children at all times",
    "Wear safety glasses when handling fireworks",
    "Store fireworks in a cool, dry place",
  ];
  // Draw yellow background first so text remains visible
  const padX = 6;
  const padTop = 10;
  const lineStep = 6;
  pdf.setFillColor(255, 215, 0);
  pdf.rect(blockX, blockY, blockW, pageHeight - 40 - blockY, "F");

  // Title first
  pdf.text("Important Safety Instructions:", blockX + padX, blockY + padTop);
  let textY = blockY + padTop + 6;

  pdf.setFontSize(9);
  pdf.setTextColor(0, 0, 0);
  const maxTextWidth = blockW - padX * 2;

  items.forEach((t, i) => {
    // If near page bottom, draw current background, add page, and continue
    if (textY > pageHeight - 25) {
      // new page
      pdf.addPage();
      // reset positions
      blockY = 20;
      // paint background for the new page section
      pdf.setFillColor(255, 215, 0);
      pdf.rect(blockX, blockY, blockW, pageHeight - 40 - blockY, "F");
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text(
        "Important Safety Instructions:",
        blockX + padX,
        blockY + padTop
      );
      textY = blockY + padTop + 6;
      pdf.setFontSize(9);
    }

    const wrapped = pdf.splitTextToSize(`• ${t}`, maxTextWidth);
    wrapped.forEach((line) => {
      pdf.text(line, blockX + padX, textY);
      textY += lineStep;
    });
    // extra gap between bullet points
    textY += 2;
  });

  footerY = textY + 6;
  if (footerY > pageHeight - 25) {
    pdf.addPage();
    footerY = 20;
  }

  // Agreement banner: yellow with orange border, bold text
  const agreeH = 14;
  pdf.setFillColor(255, 215, 0);
  pdf.setDrawColor(255, 165, 0);
  pdf.rect(20, footerY, pageWidth - 40, agreeH, "FD");
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  pdf.text(
    "By using this website/catalogue, you agree to our Terms & Conditions and acknowledge the safety instructions.",
    25,
    footerY + agreeH - 4
  );

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
