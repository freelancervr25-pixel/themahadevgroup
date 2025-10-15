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
export const generateCataloguePDF = async (products) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Header
  pdf.setFontSize(20);
  pdf.setTextColor(211, 47, 47); // Red color
  pdf.text("Fireworks Store", pageWidth / 2, 20, { align: "center" });

  pdf.setFontSize(16);
  pdf.setTextColor(251, 192, 45); // Gold color
  pdf.text("Full Catalogue", pageWidth / 2, 30, { align: "center" });

  let yPosition = 40;
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

    pdf.setDrawColor(230, 230, 230);
    pdf.line(20, yPosition + 65, pageWidth - 20, yPosition + 65);

    catalogueTotal += Number(product.price || 0);
    yPosition += 75;
  }

  // Removed overall total display for catalogue as requested

  // Footer
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text(
    "Thank you for choosing Fireworks Store!",
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  );

  pdf.save("Fireworks_Store_Catalogue.pdf");
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

  // Header
  pdf.setFontSize(20);
  pdf.setTextColor(211, 47, 47);
  pdf.text("Fireworks Store", pageWidth / 2, 20, { align: "center" });

  pdf.setFontSize(16);
  pdf.setTextColor(251, 192, 45);
  pdf.text("Order Summary", pageWidth / 2, 30, { align: "center" });

  // Customer Info
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Customer Name: ${customerInfo.name}`, 20, 50);
  pdf.text(`Mobile: ${customerInfo.mobile}`, 20, 60);
  pdf.text(`Order Date: ${new Date().toLocaleString()}`, 20, 70);

  // Line separator
  pdf.setDrawColor(211, 47, 47);
  pdf.line(20, 80, pageWidth - 20, 80);

  let yPosition = 90;

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

  // Table header
  pdf.setFontSize(10);
  pdf.setTextColor(255, 255, 255);
  pdf.setFillColor(211, 47, 47);
  pdf.rect(20, yPosition - 5, pageWidth - 40, 10, "F");
  pdf.text("Item", 25, yPosition);
  pdf.text("Qty", 100, yPosition);
  pdf.text("Price", 120, yPosition);
  pdf.text("Total", 150, yPosition);

  yPosition += 15;

  // Order items
  for (const item of cartItems) {
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

      yPosition += 25;
    } catch (error) {
      console.error("Error adding image to PDF:", error);
      // Add text without image if image fails
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(item.name, 20, yPosition + 10);
      pdf.text(item.quantity.toString(), 100, yPosition + 10);
      pdf.text(`Rs ${item.price}`, 120, yPosition + 10);
      pdf.text(`Rs ${item.price * item.quantity}`, 150, yPosition + 10);
      yPosition += 20;
    }
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

  // Footer
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text(
    "Thank you for shopping with Fireworks Store!",
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  );

  const fileName = `Order_${customerInfo.name}_${
    new Date().toISOString().split("T")[0]
  }.pdf`;
  pdf.save(fileName);
};
