import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../api/axios";

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verificant el teu compte...");
  const hasRequestedRef = useRef(false);

  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  useEffect(() => {
    if (hasRequestedRef.current) return;
    hasRequestedRef.current = true;

    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("No s'ha proporcionat cap token de verificació.");
        return;
      }

      try {
        const response = await api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
        const successMessage =
          response?.data?.message ||
          response?.data?.data?.message ||
          "Compte verificat correctament.";

        setStatus("success");
        setMessage(successMessage);
      } catch (err) {
        console.error(err);

        const backendError =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          "No s'ha pogut verificar el compte. El token pot ser invàlid o haver caducat.";

        setStatus("error");
        setMessage(backendError);
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div
      style={{
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem 3rem",
      }}
    >
      <div
        className="pb-surface-card fade-in-up"
        style={{
          width: "100%",
          maxWidth: "720px",
          padding: "2rem",
          borderRadius: "30px",
          textAlign: "center",
        }}
      >
        <span className="pb-kicker">
          {status === "loading"
            ? "Verificant"
            : status === "success"
            ? "Compte verificat"
            : "Error de verificació"}
        </span>

        <h1
          style={{
            marginBottom: "0.75rem",
            color: "#0f172a",
            fontSize: "clamp(2rem, 4vw, 3rem)",
            lineHeight: 1.05,
          }}
        >
          {status === "loading"
            ? "Un moment..."
            : status === "success"
            ? "El teu correu ja està verificat"
            : "No s'ha pogut verificar el compte"}
        </h1>

        <p
          style={{
            margin: "0 auto 1.5rem",
            maxWidth: "580px",
            color: "#64748b",
            lineHeight: 1.7,
            fontSize: "1rem",
          }}
        >
          {message}
        </p>

        {status === "loading" && (
          <div className="pb-loading-shell pb-loading-shell--compact" style={{ marginTop: "0.5rem" }}>
            <div className="pb-loading-orb">
              <div className="pb-loading-ring" />
              <div className="pb-loading-ring pb-loading-ring--delay" />
              <div className="pb-loading-core" />
            </div>
            <div className="pb-loading-content">
              <span className="pb-loading-badge">Verificació en curs</span>
              <p className="pb-loading-text">
                Estam comprovant el teu enllaç de verificació.
              </p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "0.9rem",
              flexWrap: "wrap",
              marginTop: "1.25rem",
            }}
          >
            <Link to="/login" className="btn btn-primary">
              Anar a login
            </Link>

            <Link to="/" className="btn btn-light">
              Tornar a l'inici
            </Link>
          </div>
        )}

        {status === "error" && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "0.9rem",
              flexWrap: "wrap",
              marginTop: "1.25rem",
            }}
          >
            <Link to="/login" className="btn btn-light">
              Anar a login
            </Link>

            <Link to="/register" className="btn btn-primary">
              Crear un altre compte
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmailPage;