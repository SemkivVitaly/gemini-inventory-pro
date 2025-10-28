
import React, { useEffect, useRef } from 'react';

// This is a global from the script loaded in index.html
declare const Html5Qrcode: any;

interface QrScannerProps {
  onSuccess: (decodedText: string) => void;
  onError: (errorMessage: string) => void;
}

const QrScanner: React.FC<QrScannerProps> = ({ onSuccess, onError }) => {
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    const html5QrCode = new Html5Qrcode("qr-reader");

    scannerRef.current = html5QrCode;

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          onSuccess,
          (errorMessage: string) => {
            // This is the verbose error callback, we can ignore it for continuous scanning
          }
        );
      } catch (err: any) {
        onError(err.message || "Failed to start scanner.");
      }
    };
    
    startScanner();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch((err: any) => console.error("Failed to stop scanner", err));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div id="qr-reader" className="w-full"></div>;
};

export default QrScanner;
