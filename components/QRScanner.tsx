"use client";
import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: Error) => void; // Added optional error callback
}

const QRScanner = ({ onScan, onError }: QRScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState("Point camera at QR code");
  const [scanning, setScanning] = useState(true);
  const animationRef = useRef<number | null>(null);
  
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        video.srcObject = stream;
        video.onerror = () => {
          throw new Error("Video playback failed");
        };
        await video.play();
        scanFrame();
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Camera access failed");
        setStatus("Camera access denied. Please enable permissions.");
        console.error("Camera error:", error);
        onError?.(error); // Call error handler if provided
      }
    };

    const scanFrame = () => {
      if (!scanning || !videoRef.current) return;
      
      try {
        const video = videoRef.current;
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          const context = canvas.getContext('2d');
          if (context) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);

            if (code) {
              setStatus("Scan successful!");
              onScan(code.data);
              setScanning(false);
              return;
            }
          }
        }
        animationRef.current = requestAnimationFrame(scanFrame);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Scanning failed");
        setStatus("Scanning error occurred");
        console.error("Scan error:", error);
        onError?.(error);
        setScanning(false);
      }
    };

    startCamera();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (video?.srcObject) {
        (video.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, [onScan, scanning, onError]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Scan Building QR Code</h2>
      
      <div className="relative">
        <video 
          ref={videoRef} 
          className="w-full rounded-lg border border-gray-300"
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="hidden" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="border-2 border-blue-500 rounded-lg w-64 h-64"></div>
        </div>
      </div>
      
      <div className={`text-center py-2 px-4 rounded ${
        status.includes("success") ? "bg-green-100 text-green-800" : 
        status.includes("denied") || status.includes("error") ? "bg-red-100 text-red-800" : 
        "bg-blue-100 text-blue-800"
      }`}>
        {status}
      </div>

      {!scanning && (
        <button
          onClick={() => {
            setScanning(true);
            setStatus("Point camera at QR code");
          }}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Scan Again
        </button>
      )}
    </div>
  );
};

export default QRScanner;