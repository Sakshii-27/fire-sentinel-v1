// app/qr/page.tsx
"use client";
import { useState } from "react";
import { startUserTracking } from "../firebaseActions";
import QRScanner from "../../../components/QRScanner";
import QRGenerator from "../../../components/QRGenerator";
import { collection, addDoc, serverTimestamp, GeoPoint } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function QRPage() {
  const [activeTab, setActiveTab] = useState<"scan" | "generate">("scan");
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [status, setStatus] = useState("Scan QR code to check in");

  const handleScan = async (data: string) => {
    try {
      // Get user's location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000
        });
      });

      // Save scan data to Firestore
      await addDoc(collection(db, "tracked_users"), {
        scanData: data,
        location: new GeoPoint(
          position.coords.latitude,
          position.coords.longitude
        ),
        timestamp: serverTimestamp(),
        accuracy: position.coords.accuracy,
        type: "qr_scan"
      });

      setStatus(`QR code scanned successfully! Location recorded at ${new Date().toLocaleTimeString()}`);
      setShowRoleSelection(true);
    } catch (error) {
      console.error("Scan failed:", error);
      setStatus(`Error: ${error instanceof Error ? error.message : 'Failed to scan QR code'}`);
    }
  };

  const handleRoleSelect = async (role: "guest" | "employee") => {
    try {
      await startUserTracking(role);
      setStatus(`Tracking started as ${role}`);
      setShowRoleSelection(false);
    } catch {
      setStatus(`Error: Could not start tracking as ${role}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Building Safety Tracking</h1>
        
        {/* Tab Selection */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("scan")}
            className={`flex-1 py-2 rounded-md ${activeTab === "scan" ? "bg-blue-600 text-white" : "text-gray-700"}`}
          >
            Scan QR
          </button>
          <button
            onClick={() => setActiveTab("generate")}
            className={`flex-1 py-2 rounded-md ${activeTab === "generate" ? "bg-blue-600 text-white" : "text-gray-700"}`}
          >
            Generate QR
          </button>
        </div>

        {/* Content Area */}
        {activeTab === "generate" ? (
          <QRGenerator />
        ) : (
          <div className="space-y-4">
            <QRScanner onScan={handleScan} />
            <button
              onClick={() => handleScan("simulated_scan")}
              className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Simulate QR Scan
            </button>
          </div>
        )}

        {/* Status Message */}
        <div className={`text-center my-4 p-4 rounded-lg ${
          status.startsWith("Error") ? "bg-red-100 text-red-800" : 
          status.includes("Success") ? "bg-green-100 text-green-800" : 
          "text-gray-700"
        }`}>
          <p>{status}</p>
        </div>

        {/* Role Selection */}
        {showRoleSelection && (
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => handleRoleSelect("guest")}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              I&apos;m a Guest
            </button>
            <button
              onClick={() => handleRoleSelect("employee")}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
            >
              I&apos;m Staff
            </button>
          </div>
        )}
      </div>
    </div>
  );
}