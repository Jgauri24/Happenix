import QRCode from 'qrcode';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate QR code for booking
 */
export const generateQRCode = async (bookingData) => {
  try {
    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, '../uploads/qr-codes');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const qrData = JSON.stringify({
      bookingId: bookingData.bookingId,
      eventId: bookingData.eventId,
      userId: bookingData.userId,
      timestamp: bookingData.timestamp || new Date().toISOString()
    });

    const fileName = `qr-${bookingData.bookingId}-${Date.now()}.png`;
    const filePath = path.join(uploadsDir, fileName);

    await QRCode.toFile(filePath, qrData, {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: 300,
      margin: 1
    });

    const qrCodeUrl = `/uploads/qr-codes/${fileName}`;
    
    return {
      qrCodeUrl,
      qrCodeData: JSON.parse(qrData)
    };
  } catch (error) {
    console.error('QR code generation error:', error);
    throw error;
  }
};

/**
 * Generate QR code as data URL (for immediate display)
 */
export const generateQRCodeDataURL = async (bookingData) => {
  try {
    const qrData = JSON.stringify({
      bookingId: bookingData.bookingId,
      eventId: bookingData.eventId,
      userId: bookingData.userId,
      timestamp: bookingData.timestamp || new Date().toISOString()
    });

    const dataURL = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      width: 300
    });

    return dataURL;
  } catch (error) {
    console.error('QR code generation error:', error);
    throw error;
  }
};



