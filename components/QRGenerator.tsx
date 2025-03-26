"use client";
import { useState } from "react";
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues
const QRCode = dynamic(
  () => import("react-qr-code").then((mod) => mod.default),
  { ssr: false }
);

const QRGenerator = () => {
  const [qrData, setQrData] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerateQR = () => {
    const buildingToken = "bldng-" + Date.now().toString(36);
    setQrData(buildingToken);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(qrData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Generate Building QR Code</h2>
      
      <button
        onClick={handleGenerateQR}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        disabled={!!qrData}
      >
        {qrData ? "QR Code Generated" : "Generate Building QR Code"}
      </button>

      {qrData && (
        <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex justify-center mb-4">
            <QRCode 
              value={qrData} 
              size={200}
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
            />
          </div>
          
          <div className="flex items-center justify-between bg-white p-2 rounded border border-gray-300">
            <span className="text-sm font-mono text-gray-600 truncate">
              Token: {qrData}
            </span>
            <button
              onClick={copyToClipboard}
              className="text-sm bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
              disabled={copied}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          <p className="mt-2 text-sm text-gray-500 text-center">
            Scan this code at building entrances
          </p>
        </div>
      )}
    </div>
  );
};

export default QRGenerator;