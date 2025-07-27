import { useEffect, useState } from "react";
import { apiClient } from "../AxiosSetup";
import { QRCodeCanvas } from "qrcode.react"; // ✅ correct

const TodaysQRPage = () => {
  const [qrString, setQrString] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQRString = async () => {
      try {
        const res = await apiClient.get(`/api/attendance/qr/string`);
        setQrString(res.data.qr_code);
      } catch (err) {
        console.error("❌ Failed to fetch QR string:", err);
        setQrString("");
      } finally {
        setLoading(false);
      }
    };

    fetchQRString();
  }, []);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Today’s Attendance QR Code</h1>
      {loading ? (
        <p>Loading QR Code...</p>
      ) : qrString ? (
        <>
          <QRCodeCanvas value={qrString} size={256} /> {/* ✅ */}
          <p style={{ marginTop: "1rem" }}>
            <strong>QR String:</strong> {qrString}
          </p>
        </>
      ) : (
        <p>QR Code not available.</p>
      )}
    </div>
  );
};

export default TodaysQRPage;
