// src/app/lib/firebaseActions.ts
import { db } from "./firebaseConfig";
import { doc, collection, addDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { GeoPoint } from "firebase/firestore";

// Enhanced location fetching with timeout
const getLocation = (timeout = 10000): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }

    const timer: NodeJS.Timeout = setTimeout(() => {
      reject(new Error("Location request timed out. Please try again."));
    }, timeout);

    const options = {
      enableHighAccuracy: true,
      timeout,
      maximumAge: 0
    };

    const success = (position: GeolocationPosition) => {
      clearTimeout(timer);
      const { latitude, longitude } = position.coords;
      resolve({ latitude, longitude });
    };

    const error = (err: GeolocationPositionError) => {
      clearTimeout(timer);
      console.error("Geolocation error:", err);
      reject(new Error(
        err.code === err.PERMISSION_DENIED 
          ? "Location access denied. Please enable permissions." 
          : "Could not get your location. Please try again."
      ));
    };

    navigator.geolocation.getCurrentPosition(success, error, options);
  });
};

// Main tracking function with enhanced error handling
export async function startUserTracking(role: 'guest' | 'employee') {
  try {
    // First verify Firestore is connected
    if (!db) throw new Error("Database not initialized");

    // Get initial location with timeout
    const { latitude, longitude } = await getLocation();

    // Create tracking document
    const docRef = await addDoc(collection(db, "tracked_users"), {
      role,
      location: new GeoPoint(latitude, longitude),
      timestamp: serverTimestamp(),
      status: "active",
      lastUpdated: serverTimestamp()
    });

    // Setup real-time tracking
    let watchId: number | null = null;
    let isActive = true;

    const updateLocation = async (position: GeolocationPosition) => {
      if (!isActive) return;
      
      try {
        await updateDoc(docRef, {
          location: new GeoPoint(position.coords.latitude, position.coords.longitude),
          lastUpdated: serverTimestamp()
        });
      } catch (err) {
        console.error("Failed to update location:", err);
      }
    };

    watchId = navigator.geolocation.watchPosition(
      updateLocation,
      (err) => console.error("Tracking error:", err),
      { enableHighAccuracy: true, maximumAge: 10000 }
    );

    return {
      stopTracking: async () => {
        if (!isActive) return;
        isActive = false;
        
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
        }
        
        try {
          await updateDoc(docRef, {
            status: "checked-out",
            lastUpdated: serverTimestamp()
          });
        } catch (err) {
          console.error("Error during check-out:", err);
          throw err;
        }
      },
      docId: docRef.id
    };

  } catch (err) {
    console.error("Tracking initialization failed:", err);
    throw err;
  }
}

// Enhanced check-out function
export async function checkOutUser(docId: string) {
  if (!docId) throw new Error("No document ID provided");
  
  try {
    await updateDoc(doc(db, "tracked_users", docId), {
      status: "checked-out",
      lastUpdated: serverTimestamp()
    });
  } catch (err) {
    console.error("Check-out failed:", err);
    throw err;
  }
}