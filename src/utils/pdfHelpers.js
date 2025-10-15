import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
  pdf.text("Full Catalogue 🎇", pageWidth / 2, 30, { align: "center" });

  let yPosition = 50;
  const itemsPerPage = 4;
  let currentPage = 1;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];

    // Check if we need a new page
    if (yPosition > pageHeight - 80) {
      pdf.addPage();
      currentPage++;
      yPosition = 20;
    }

    try {
      // Add product image
      const imgData = await imageToBase64(product.image);
      pdf.addImage(imgData, "JPEG", 20, yPosition, 30, 30);

      // Add product details
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text(product.name, 60, yPosition + 10);

      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Original: ₹${product.originalPrice}`, 60, yPosition + 18);

      pdf.setFontSize(14);
      pdf.setTextColor(211, 47, 47);
      pdf.text(`₹${product.price}`, 60, yPosition + 28);

      yPosition += 50;
    } catch (error) {
      console.error("Error adding image to PDF:", error);
      // Add text without image if image fails
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text(product.name, 20, yPosition + 10);
      pdf.setFontSize(14);
      pdf.setTextColor(211, 47, 47);
      pdf.text(`₹${product.price}`, 20, yPosition + 20);
      yPosition += 40;
    }
  }

  // Footer
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text(
    "Thank you for choosing Fireworks Store! 🎆",
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  );

  pdf.save("Shree_Ram_Fireworks_Catalogue.pdf");
};

// Generate Order PDF
export const generateOrderPDF = async (cartItems, customerInfo, totalPrice) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Header
  pdf.setFontSize(20);
  pdf.setTextColor(211, 47, 47);
  pdf.text("Fireworks Store", pageWidth / 2, 20, { align: "center" });

  pdf.setFontSize(16);
  pdf.setTextColor(251, 192, 45);
  pdf.text("Order Summary 🧾", pageWidth / 2, 30, { align: "center" });

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
      pdf.addImage(imgData, "JPEG", 20, yPosition, 15, 15);

      // Add item details
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(item.name, 40, yPosition + 10);
      pdf.text(item.quantity.toString(), 100, yPosition + 10);
      pdf.text(`₹${item.price}`, 120, yPosition + 10);
      pdf.text(`₹${item.price * item.quantity}`, 150, yPosition + 10);

      yPosition += 25;
    } catch (error) {
      console.error("Error adding image to PDF:", error);
      // Add text without image if image fails
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(item.name, 20, yPosition + 10);
      pdf.text(item.quantity.toString(), 100, yPosition + 10);
      pdf.text(`₹${item.price}`, 120, yPosition + 10);
      pdf.text(`₹${item.price * item.quantity}`, 150, yPosition + 10);
      yPosition += 20;
    }
  }

  // Total
  pdf.setFontSize(14);
  pdf.setTextColor(211, 47, 47);
  pdf.text(`Total: ₹${totalPrice.toFixed(2)}`, pageWidth - 50, yPosition + 10, {
    align: "right",
  });

  // Footer
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text(
    "Thank you for shopping with Fireworks Store! 🎆",
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  );

  const fileName = `Order_${customerInfo.name}_${
    new Date().toISOString().split("T")[0]
  }.pdf`;
  pdf.save(fileName);
};
