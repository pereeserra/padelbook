import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";

function ProfilePage() {
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    nom: "",
    email: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [capsLockCurrent, setCapsLockCurrent] = useState(false);
  const [capsLockNew, setCapsLockNew] = useState(false);

  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("success");

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const normalizeSpaces = (value) => value.trim().replace(/\s+/g, " ");

  const showFeedbackMessage = (message, type = "success") => {
    setFeedback(message);
    setFeedbackType(type);

    setTimeout(() => {
      setFeedback("");
    }, 4500);
  };

  const clearFeedback = () => {
    setFeedback("");
  };

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      clearFeedback();

      const response = await api.get("/auth/me");
      const userData = response?.data?.data || null;

      if (!userData) {
        throw new Error("No s'han pogut carregar les dades del compte.");
      }

      setProfile(userData);
      setFormData({
        nom: userData.nom || "",
        email: userData.email || "",
      });

      localStorage.setItem("user", JSON.stringify(userData));
    } catch (err) {
      console.error(err);
      showFeedbackMessage(
        err.response?.data?.error ||
          "No s'han pogut carregar les dades del compte.",
        "error"
      );
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const roleLabel = useMemo(() => {
    if (!profile?.rol) return "Usuari";
    return profile.rol === "admin" ? "Administrador" : "Usuari";
  }, [profile]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;

    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateProfileForm = () => {
    const cleanNom = normalizeSpaces(formData.nom);
    const cleanEmail = formData.email.trim().toLowerCase();

    if (!cleanNom || !cleanEmail) {
      return "Has d'omplir el nom i el correu electrònic.";
    }

    if (cleanNom.length < 5) {
      return "El nom complet ha de tenir almenys 5 caràcters.";
    }

    const words = cleanNom.split(" ").filter(Boolean);
    if (words.length < 2) {
      return "Has d'introduir com a mínim nom i llinatge.";
    }

    const emailRegex = /^[^\s@]{2,}@[^\s@]{2,}\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      return "Introdueix un correu electrònic vàlid.";
    }

    return "";
  };

  const validatePasswordForm = () => {
    const { currentPassword, newPassword } = passwordData;

    if (!currentPassword.trim() || !newPassword.trim()) {
      return "Has d'omplir la contrasenya actual i la nova.";
    }

    if (newPassword.length < 8) {
      return "La nova contrasenya ha de tenir almenys 8 caràcters.";
    }

    if (!/[a-z]/.test(newPassword)) {
      return "La nova contrasenya ha d'incloure almenys una lletra minúscula.";
    }

    if (!/[A-Z]/.test(newPassword)) {
      return "La nova contrasenya ha d'incloure almenys una lletra majúscula.";
    }

    if (!/[0-9]/.test(newPassword)) {
      return "La nova contrasenya ha d'incloure almenys un número.";
    }

    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      return "La nova contrasenya ha d'incloure almenys un símbol.";
    }

    if (currentPassword === newPassword) {
      return "La nova contrasenya ha de ser diferent de l'actual.";
    }

    return "";
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    const validationError = validateProfileForm();
    if (validationError) {
      showFeedbackMessage(validationError, "error");
      return;
    }

    try {
      setSavingProfile(true);
      clearFeedback();

      const payload = {
        nom: normalizeSpaces(formData.nom),
        email: formData.email.trim().toLowerCase(),
      };

      const response = await api.put("/auth/me", payload);
      const updatedUser = response?.data?.data || {
        ...profile,
        ...payload,
      };

      setProfile(updatedUser);
      setFormData({
        nom: updatedUser.nom || payload.nom,
        email: updatedUser.email || payload.email,
      });

      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("profile-updated"));

      showFeedbackMessage("Perfil actualitzat correctament.", "success");
    } catch (err) {
      console.error(err);

      const backendError =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "No s'ha pogut actualitzar el perfil.";

      showFeedbackMessage(backendError, "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    const validationError = validatePasswordForm();
    if (validationError) {
      showFeedbackMessage(validationError, "error");
      return;
    }

    try {
      setChangingPassword(true);
      clearFeedback();

      await api.put("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
      });

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setCapsLockCurrent(false);
      setCapsLockNew(false);

      showFeedbackMessage("Contrasenya canviada correctament.", "success");
    } catch (err) {
      console.error(err);

      const backendError =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "No s'ha pogut canviar la contrasenya.";

      showFeedbackMessage(backendError, "error");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCapsLockCurrent = (e) => {
    setCapsLockCurrent(e.getModifierState("CapsLock"));
  };

  const handleCapsLockNew = (e) => {
    setCapsLockNew(e.getModifierState("CapsLock"));
  };

  if (loadingProfile) {
    return (
      <LoadingSpinner
        text="Carregant dades del teu compte..."
        minHeight="250px"
      />
    );
  }

  return (
    <div style={styles.page}>
      <div
        style={{
          ...styles.container,
          ...(isMobileView ? styles.containerMobile : {}),
        }}
      >
        <section
          className="fade-in-up"
          style={{
            ...styles.hero,
            ...(isMobileView ? styles.heroMobile : {}),
          }}
        >
          <span style={styles.badge}>El meu compte</span>
          <h1
            style={{
              ...styles.title,
              ...(isMobileView ? styles.titleMobile : {}),
            }}
          >
            Perfil d’usuari
          </h1>
          <p style={styles.subtitle}>
            Consulta la informació del teu compte, actualitza les teves dades i
            canvia la contrasenya des d’un únic espai.
          </p>

          {profile && (
            <div
              style={{
                ...styles.heroStats,
                ...(isMobileView ? styles.heroStatsMobile : {}),
              }}
            >
              <div style={styles.statCard}>
                <span style={styles.statLabel}>Nom</span>
                <span style={styles.statValue}>{profile.nom}</span>
              </div>

              <div style={styles.statCard}>
                <span style={styles.statLabel}>Email</span>
                <span style={styles.statValue}>{profile.email}</span>
              </div>

              <div style={styles.statCard}>
                <span style={styles.statLabel}>Rol</span>
                <span style={styles.statValue}>{roleLabel}</span>
              </div>
            </div>
          )}
        </section>

        {feedback && (
          <section className="scale-in" style={styles.feedbackSection}>
            <div
              style={{
                ...styles.feedbackBox,
                ...(feedbackType === "success"
                  ? styles.feedbackSuccess
                  : styles.feedbackError),
              }}
            >
              <p style={styles.feedbackText}>{feedback}</p>
            </div>
          </section>
        )}

        <div
          style={{
            ...styles.grid,
            ...(isMobileView ? styles.gridMobile : {}),
          }}
        >
          <section className="fade-in-up delay-1" style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h2 style={styles.cardTitle}>Informació del compte</h2>
                <p style={styles.cardText}>
                  Modifica el teu nom i el correu electrònic associat al compte.
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} style={styles.form}>
              <div style={styles.field}>
                <label htmlFor="nom" style={styles.label}>
                  Nom i llinatges
                </label>
                <input
                  id="nom"
                  name="nom"
                  type="text"
                  value={formData.nom}
                  onChange={handleProfileChange}
                  placeholder="Ex: Pere Serra"
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.field}>
                <label htmlFor="email" style={styles.label}>
                  Correu electrònic
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleProfileChange}
                  placeholder="exemple@correu.com"
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.actions}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={savingProfile}
                  style={isMobileView ? styles.fullWidthButton : undefined}
                >
                  {savingProfile ? "Guardant canvis..." : "Guardar canvis"}
                </button>
              </div>
            </form>
          </section>

          <section className="fade-in-up delay-2" style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h2 style={styles.cardTitle}>Canviar contrasenya</h2>
                <p style={styles.cardText}>
                  Introdueix la contrasenya actual i defineix-ne una de nova amb
                  els requisits de seguretat necessaris.
                </p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} style={styles.form}>
              <div style={styles.field}>
                <label htmlFor="currentPassword" style={styles.label}>
                  Contrasenya actual
                </label>

                <div
                  style={{
                    ...styles.passwordWrapper,
                    ...(isMobileView ? styles.passwordWrapperMobile : {}),
                  }}
                >
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={handlePasswordInputChange}
                    onKeyDown={handleCapsLockCurrent}
                    onKeyUp={handleCapsLockCurrent}
                    placeholder="Introdueix la contrasenya actual"
                    style={styles.input}
                    required
                  />

                  <button
                    type="button"
                    style={{
                      ...styles.showButton,
                      ...(isMobileView ? styles.showButtonMobile : {}),
                    }}
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                  >
                    {showCurrentPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>

                {capsLockCurrent && (
                  <span style={styles.capsWarning}>
                    ⚠️ Tens el bloqueig de majúscules activat
                  </span>
                )}
              </div>

              <div style={styles.field}>
                <label htmlFor="newPassword" style={styles.label}>
                  Nova contrasenya
                </label>

                <div
                  style={{
                    ...styles.passwordWrapper,
                    ...(isMobileView ? styles.passwordWrapperMobile : {}),
                  }}
                >
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={handlePasswordInputChange}
                    onKeyDown={handleCapsLockNew}
                    onKeyUp={handleCapsLockNew}
                    placeholder="Mínim 8 caràcters"
                    style={styles.input}
                    required
                  />

                  <button
                    type="button"
                    style={{
                      ...styles.showButton,
                      ...(isMobileView ? styles.showButtonMobile : {}),
                    }}
                    onClick={() => setShowNewPassword((prev) => !prev)}
                  >
                    {showNewPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>

                {capsLockNew && (
                  <span style={styles.capsWarning}>
                    ⚠️ Tens el bloqueig de majúscules activat
                  </span>
                )}

                <span style={styles.helpText}>
                  Ha d'incloure majúscula, minúscula, número i símbol.
                </span>
              </div>

              <div style={styles.actions}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={changingPassword}
                  style={isMobileView ? styles.fullWidthButton : undefined}
                >
                  {changingPassword
                    ? "Canviant contrasenya..."
                    : "Canviar contrasenya"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "2rem 0 3rem",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 1.5rem",
  },
  containerMobile: {
    padding: "0 1rem",
  },
  hero: {
    background: "linear-gradient(135deg, #1e40af, #2563eb)",
    color: "white",
    padding: "2rem",
    borderRadius: "18px",
    marginBottom: "1.75rem",
    boxShadow: "0 10px 24px rgba(37,99,235,0.22)",
  },
  heroMobile: {
    padding: "1.35rem",
    borderRadius: "16px",
  },
  badge: {
    display: "inline-block",
    backgroundColor: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.18)",
    padding: "0.45rem 0.8rem",
    borderRadius: "999px",
    fontWeight: "700",
    marginBottom: "1rem",
  },
  title: {
    margin: 0,
    fontSize: "2.5rem",
  },
  titleMobile: {
    fontSize: "2rem",
  },
  subtitle: {
    marginTop: "0.75rem",
    marginBottom: 0,
    fontSize: "1.05rem",
    lineHeight: 1.7,
    opacity: 0.96,
    maxWidth: "760px",
  },
  heroStats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "0.9rem",
    marginTop: "1.5rem",
  },
  heroStatsMobile: {
    gridTemplateColumns: "1fr",
  },
  statCard: {
    backgroundColor: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: "16px",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.3rem",
  },
  statLabel: {
    opacity: 0.88,
    lineHeight: 1.4,
    fontSize: "0.85rem",
    fontWeight: "700",
  },
  statValue: {
    fontSize: "1.1rem",
    fontWeight: "800",
    wordBreak: "break-word",
  },
  feedbackSection: {
    marginTop: "1.25rem",
    marginBottom: "1.25rem",
  },
  feedbackBox: {
    borderRadius: "16px",
    padding: "1rem 1.1rem",
    border: "1px solid transparent",
    boxShadow: "0 8px 22px rgba(0,0,0,0.04)",
  },
  feedbackSuccess: {
    backgroundColor: "#ecfdf5",
    borderColor: "#86efac",
  },
  feedbackError: {
    backgroundColor: "#fff1f2",
    borderColor: "#fecdd3",
  },
  feedbackText: {
    margin: 0,
    fontWeight: "700",
    lineHeight: 1.6,
    color: "#0f172a",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "1.2rem",
    alignItems: "start",
  },
  gridMobile: {
    gridTemplateColumns: "1fr",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "18px",
    padding: "1.5rem",
    boxShadow: "0 8px 22px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
  },
  cardHeader: {
    marginBottom: "1.25rem",
  },
  cardTitle: {
    marginTop: 0,
    marginBottom: "0.45rem",
    fontSize: "1.7rem",
    color: "#0f172a",
  },
  cardText: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.65,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.45rem",
  },
  label: {
    fontSize: "0.95rem",
    fontWeight: "700",
    color: "#1e293b",
  },
  input: {
    flex: 1,
    padding: "0.95rem 1rem",
    fontSize: "1rem",
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    outline: "none",
    backgroundColor: "#ffffff",
    color: "#0f172a",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
    width: "100%",
    boxSizing: "border-box",
  },
  passwordWrapper: {
    display: "flex",
    gap: "0.5rem",
    alignItems: "stretch",
  },
  passwordWrapperMobile: {
    flexDirection: "column",
  },
  showButton: {
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    padding: "0 0.9rem",
    backgroundColor: "white",
    cursor: "pointer",
    fontWeight: "700",
    color: "#334155",
    minWidth: "96px",
  },
  showButtonMobile: {
    width: "100%",
    minHeight: "44px",
  },
  capsWarning: {
    color: "#b91c1c",
    fontSize: "0.85rem",
    fontWeight: "600",
  },
  helpText: {
    fontSize: "0.82rem",
    color: "#64748b",
    lineHeight: 1.5,
  },
  actions: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
    marginTop: "0.3rem",
  },
  fullWidthButton: {
    width: "100%",
  },
};

export default ProfilePage;