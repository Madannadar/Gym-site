import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { apiClient } from "../AxiosSetup";
import { useAuth } from "../AuthProvider";

const AttendanceScanPage = () => {
  const { userId } = useAuth();
  const [scannedData, setScannedData] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const qrRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    const startScanner = async () => {
      try {
        const qrRegionId = "qr-reader";
        html5QrCodeRef.current = new Html5Qrcode(qrRegionId);

        await Html5Qrcode.getCameras().then((devices) => {
          if (devices && devices.length) {
            const cameraId = devices[0].id;
            html5QrCodeRef.current.start(
              cameraId,
              {
                fps: 10,
                qrbox: 250,
              },
              handleScan,
              handleError,
            );
          }
        });
      } catch (err) {
        console.error("Camera init failed:", err);
        setError("Failed to access camera.");
      }
    };

    startScanner();

    return () => {
      html5QrCodeRef.current?.stop().then(() => {
        html5QrCodeRef.current?.clear();
      });
    };
  }, []);

  const handleScan = async (data) => {
    if (data && data !== scannedData) {
      setScannedData(data);
      try {
        const res = await apiClient.post(`/api/attendance/log`, {
          user_id: userId,
          scanned_qr_code: data,
        });
        setMessage("✅ Attendance marked successfully.");
        setError("");
      } catch (err) {
        setMessage("");
        const msg =
          err.response?.data?.error || "❌ Failed to mark attendance.";
        setError(msg);
        console.error("❌ Error marking attendance:", err);
      }
    }
  };

  const handleError = (err) => {
    console.error("QR Scan Error:", err);
    setError("QR scan error or camera issue.");
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Scan QR to Mark Attendance</h1>
      <div
        id="qr-reader"
        style={{ width: "300px", height: "300px", margin: "0 auto" }}
        ref={qrRef}
      ></div>
      <div style={{ marginTop: "1rem" }}>
        {message && <p style={{ color: "green" }}>{message}</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {scannedData && (
          <p>
            <strong>Scanned:</strong> {scannedData}
          </p>
        )}
      </div>
    </div>
  );
};

export default AttendanceScanPage;
