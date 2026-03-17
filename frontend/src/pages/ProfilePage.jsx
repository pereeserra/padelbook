import { useEffect, useMemo, useRef, useState } from "react";
import api from "../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";

function ProfilePage() {
  const topFeedbackRef = useRef(null);
  const profileFormRef = useRef(null);
  const passwordFormRef = useRef(null);
  const feedbackTimeoutRef = useRef(null);

  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profile, setProfile] = useState(null);
  const [loadError, setLoadError] = useState("");

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

  useEffect(() => {
    fetchProfile();

    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  const normalizeSpaces = (value) => value.trim().replace(/\s+/g, " ");

  const scrollToElementWithOffset = (element, offset = 120) => {
    if (!element) return;

    const targetTop = element.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({
      top: targetTop,
      behavior: "smooth",
    });
  };

  const showFeedbackMessage = (message, type = "success") => {
    setFeedback(message);
    setFeedbackType(type);

    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }

    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedback("");
    }, 4500);

    setTimeout(() => {
      scrollToElementWithOffset(topFeedbackRef.current, 130);
    }, 80);
  };

  const clearFeedback = () => {
    setFeedback("");
  };

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      setLoadError("");
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

      const errorMessage =
        err.response?.data?.error ||
        "No s'han pogut carregar les dades del compte.";

      setLoadError(errorMessage);
      showFeedbackMessage(errorMessage, "error");
    } finally {
      setLoadingProfile(false);
    }
  };

  const roleLabel = useMemo(() => {
    if (!profile?.rol) return "Usuari";
    return profile.rol === "admin" ? "Administrador" : "Usuari";
  }, [profile]);

  const normalizedProfile = useMemo(() => {
    return {
      nom: normalizeSpaces(profile?.nom || ""),
      email: (profile?.email || "").trim().toLowerCase(),
    };
  }, [profile]);

  const normalizedForm = useMemo(() => {
    return {
      nom: normalizeSpaces(formData.nom || ""),
      email: (formData.email || "").trim().toLowerCase(),
    };
  }, [formData]);

  const hasProfileChanges = useMemo(() => {
    if (!profile) return false;

    return (
      normalizedProfile.nom !== normalizedForm.nom ||
      normalizedProfile.email !== normalizedForm.email
    );
  }, [profile, normalizedProfile, normalizedForm]);

  const firstName = useMemo(() => {
    if (!profile?.nom) return "Usuari";
    return profile.nom.split(" ")[0];
  }, [profile]);

  const passwordChecks = useMemo(() => {
    const newPassword = passwordData.newPassword;

    return {
      minLength: newPassword.length >= 8,
      lowercase: /[a-z]/.test(newPassword),
      uppercase: /[A-Z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      symbol: /[^A-Za-z0-9]/.test(newPassword),
      different:
        !!newPassword &&
        !!passwordData.currentPassword &&
        newPassword !== passwordData.currentPassword,
    };
  }, [passwordData]);

  const completedPasswordChecks = Object.values(passwordChecks).filter(Boolean).length;

  const passwordStrengthText =
    completedPasswordChecks <= 2
      ? "Baixa"
      : completedPasswordChecks <= 4
      ? "Mitjana"
      : "Alta";

  const passwordStrengthClass =
    completedPasswordChecks >= 5
      ? "pb-badge-pill pb-badge-pill--green"
      : completedPasswordChecks >= 3
      ? "pb-badge-pill pb-badge-pill--amber"
      : "pb-badge-pill pb-badge-pill--rose";

  const accountSummary = [
    {
      label: "Nom complet",
      value: profile?.nom || "-",
    },
    {
      label: "Correu",
      value: profile?.email || "-",
    },
    {
      label: "Rol",
      value: roleLabel,
    },
  ];

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

  const handleResetProfileChanges = () => {
    if (!profile) return;

    setFormData({
      nom: profile.nom || "",
      email: profile.email || "",
    });

    showFeedbackMessage("S'han restablert els canvis pendents del perfil.", "success");
  };

  const handleClearPasswordForm = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
    });

    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setCapsLockCurrent(false);
    setCapsLockNew(false);

    showFeedbackMessage("S'han netejat els camps de la contrasenya.", "success");
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    const validationError = validateProfileForm();
    if (validationError) {
      showFeedbackMessage(validationError, "error");
      return;
    }

    if (!hasProfileChanges) {
      showFeedbackMessage("No hi ha canvis per guardar al perfil.", "error");
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
      <div style={{ ...styles.container, ...(isMobileView ? styles.containerMobile : {}) }}>
        <section
          className="fade-in-up"
          style={{ ...styles.hero, ...(isMobileView ? styles.heroMobile : {}) }}
        >
          <div
            style={{
              ...styles.heroGrid,
              ...(isMobileView ? styles.heroGridMobile : {}),
            }}
          >
            <div>
              <span className="pb-chip">El meu compte</span>

              <h1 style={{ ...styles.title, ...(isMobileView ? styles.titleMobile : {}) }}>
                Hola, {firstName}
              </h1>

              <p style={styles.subtitle}>
                Gestiona les dades del teu compte, actualitza el correu i reforça
                la seguretat de la sessió des d’un entorn més clar i més complet.
              </p>

              <div
                style={{
                  ...styles.heroActions,
                  ...(isMobileView ? styles.heroActionsMobile : {}),
                }}
              >
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => scrollToElementWithOffset(profileFormRef.current, 110)}
                  style={isMobileView ? styles.fullWidthButton : undefined}
                >
                  Editar perfil
                </button>

                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => scrollToElementWithOffset(passwordFormRef.current, 110)}
                  style={isMobileView ? styles.fullWidthButton : undefined}
                >
                  Canviar contrasenya
                </button>
              </div>
            </div>

            <div style={styles.heroPanel}>
              <span style={styles.heroPanelLabel}>Estat del compte</span>

              <div style={styles.heroPanelGrid}>
                {accountSummary.map((item) => (
                  <div key={item.label} style={styles.heroPanelCard}>
                    <span style={styles.heroPanelCardLabel}>{item.label}</span>
                    <span style={styles.heroPanelCardValue}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div ref={topFeedbackRef} />

        {feedback && (
          <section className="scale-in" style={styles.feedbackSection}>
            <div
              className={`pb-feedback ${
                feedbackType === "success"
                  ? "pb-feedback--success"
                  : "pb-feedback--error"
              }`}
            >
              <p className="pb-feedback__text">{feedback}</p>
            </div>
          </section>
        )}

        {loadError ? (
          <section className="scale-in" style={styles.feedbackSection}>
            <div className="pb-feedback pb-feedback--error" style={styles.errorWrapper}>
              <p style={styles.errorTitle}>No s'han pogut carregar les dades</p>
              <p style={styles.errorText}>{loadError}</p>

              <button
                type="button"
                className="btn btn-primary"
                onClick={fetchProfile}
              >
                Tornar-ho a intentar
              </button>
            </div>
          </section>
        ) : (
          <>
            <section
              className="fade-in-up delay-1"
              style={{
                ...styles.summaryGrid,
                ...(isMobileView ? styles.summaryGridMobile : {}),
              }}
            >
              <article className="pb-surface-card" style={styles.summaryCard}>
                <span style={styles.summaryLabel}>Canvis pendents</span>
                <span style={styles.summaryValue}>
                  {hasProfileChanges ? "Sí" : "No"}
                </span>
                <p style={styles.summaryText}>
                  {hasProfileChanges
                    ? "Hi ha dades modificades pendents de guardar."
                    : "El perfil actual està sincronitzat."}
                </p>
              </article>

              <article className="pb-surface-card" style={styles.summaryCard}>
                <span style={styles.summaryLabel}>Seguretat</span>
                <span style={styles.summaryValue}>Contrasenya</span>
                <p style={styles.summaryText}>
                  Pots actualitzar-la quan vulguis amb validació en temps real.
                </p>
              </article>

              <article className="pb-surface-card" style={styles.summaryCard}>
                <span style={styles.summaryLabel}>Sessió</span>
                <span style={styles.summaryValue}>Activa</span>
                <p style={styles.summaryText}>
                  Els canvis es reflecteixen també a la sessió actual.
                </p>
              </article>
            </section>

            <div
              style={{
                ...styles.grid,
                ...(isMobileView ? styles.gridMobile : {}),
              }}
            >
              <section
                ref={profileFormRef}
                className="fade-in-up delay-2 pb-surface-card"
                style={styles.card}
              >
                <div style={styles.cardHeader}>
                  <div>
                    <span className="pb-kicker">Dades personals</span>
                    <h2 className="pb-panel-title">Informació del compte</h2>
                    <p className="pb-panel-text">
                      Modifica el teu nom complet i el correu electrònic associat.
                    </p>
                  </div>

                  <span
                    className={`pb-badge-pill ${
                      hasProfileChanges
                        ? "pb-badge-pill--blue"
                        : "pb-badge-pill--green"
                    }`}
                  >
                    {hasProfileChanges ? "Canvis pendents" : "Sense canvis"}
                  </span>
                </div>

                <form onSubmit={handleUpdateProfile} style={styles.form}>
                  <div className="pb-form-field">
                    <label htmlFor="nom" className="pb-form-label">
                      Nom i llinatges
                    </label>
                    <input
                      id="nom"
                      name="nom"
                      type="text"
                      value={formData.nom}
                      onChange={handleProfileChange}
                      placeholder="Ex: Pere Serra"
                      className="pb-input"
                      required
                    />
                  </div>

                  <div className="pb-form-field">
                    <label htmlFor="email" className="pb-form-label">
                      Correu electrònic
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleProfileChange}
                      placeholder="exemple@correu.com"
                      className="pb-input"
                      required
                    />
                  </div>

                  <div className="pb-soft-box">
                    <span className="pb-soft-box__title">Consell</span>
                    <p className="pb-soft-box__text">
                      Usa un correu vàlid i un nom complet real per mantenir el
                      compte ben identificat.
                    </p>
                  </div>

                  <div
                    style={{
                      ...styles.actions,
                      ...(isMobileView ? styles.actionsMobile : {}),
                    }}
                  >
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={savingProfile || !hasProfileChanges}
                      style={isMobileView ? styles.fullWidthButton : undefined}
                    >
                      {savingProfile ? "Guardant canvis..." : "Guardar canvis"}
                    </button>

                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={handleResetProfileChanges}
                      disabled={!hasProfileChanges || savingProfile}
                      style={isMobileView ? styles.fullWidthButton : undefined}
                    >
                      Restablir
                    </button>
                  </div>
                </form>
              </section>

              <section
                ref={passwordFormRef}
                className="fade-in-up delay-3 pb-surface-card"
                style={styles.card}
              >
                <div style={styles.cardHeader}>
                  <div>
                    <span className="pb-kicker">Seguretat</span>
                    <h2 className="pb-panel-title">Canviar contrasenya</h2>
                    <p className="pb-panel-text">
                      Crea una contrasenya més robusta amb ajuda visual en temps real.
                    </p>
                  </div>

                  <span className={passwordStrengthClass}>
                    Seguretat: {passwordStrengthText}
                  </span>
                </div>

                <form onSubmit={handleChangePassword} style={styles.form}>
                  <div className="pb-form-field">
                    <label htmlFor="currentPassword" className="pb-form-label">
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
                        className="pb-input"
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

                  <div className="pb-form-field">
                    <label htmlFor="newPassword" className="pb-form-label">
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
                        className="pb-input"
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
                  </div>

                  <div style={styles.checklistPanel}>
                    <div style={styles.checklistHeader}>
                      <span style={styles.checklistTitle}>
                        Requisits de la nova contrasenya
                      </span>
                    </div>

                    <div style={styles.checklist}>
                      <div style={styles.checkItem}>
                        <span style={passwordChecks.minLength ? styles.checkOk : styles.checkPending}>
                          {passwordChecks.minLength ? "✓" : "•"}
                        </span>
                        <span>Almenys 8 caràcters</span>
                      </div>

                      <div style={styles.checkItem}>
                        <span style={passwordChecks.lowercase ? styles.checkOk : styles.checkPending}>
                          {passwordChecks.lowercase ? "✓" : "•"}
                        </span>
                        <span>Inclou una minúscula</span>
                      </div>

                      <div style={styles.checkItem}>
                        <span style={passwordChecks.uppercase ? styles.checkOk : styles.checkPending}>
                          {passwordChecks.uppercase ? "✓" : "•"}
                        </span>
                        <span>Inclou una majúscula</span>
                      </div>

                      <div style={styles.checkItem}>
                        <span style={passwordChecks.number ? styles.checkOk : styles.checkPending}>
                          {passwordChecks.number ? "✓" : "•"}
                        </span>
                        <span>Inclou un número</span>
                      </div>

                      <div style={styles.checkItem}>
                        <span style={passwordChecks.symbol ? styles.checkOk : styles.checkPending}>
                          {passwordChecks.symbol ? "✓" : "•"}
                        </span>
                        <span>Inclou un símbol</span>
                      </div>

                      <div style={styles.checkItem}>
                        <span style={passwordChecks.different ? styles.checkOk : styles.checkPending}>
                          {passwordChecks.different ? "✓" : "•"}
                        </span>
                        <span>Ha de ser diferent de l’actual</span>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      ...styles.actions,
                      ...(isMobileView ? styles.actionsMobile : {}),
                    }}
                  >
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

                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={handleClearPasswordForm}
                      disabled={
                        changingPassword ||
                        (!passwordData.currentPassword && !passwordData.newPassword)
                      }
                      style={isMobileView ? styles.fullWidthButton : undefined}
                    >
                      Netejar camps
                    </button>
                  </div>
                </form>
              </section>
            </div>
          </>
        )}
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
    position: "relative",
    overflow: "hidden",
    borderRadius: "30px",
    padding: "2rem",
    marginBottom: "1.5rem",
    background:
      "linear-gradient(135deg, rgba(15,23,42,0.94), rgba(37,99,235,0.88))",
    boxShadow: "0 26px 56px rgba(37,99,235,0.16)",
    color: "white",
  },
  heroMobile: {
    padding: "1.25rem",
    borderRadius: "24px",
  },
  heroGrid: {
    display: "grid",
    gridTemplateColumns: "1.08fr 0.92fr",
    gap: "1.3rem",
    alignItems: "center",
  },
  heroGridMobile: {
    gridTemplateColumns: "1fr",
  },
  title: {
    margin: "1rem 0 0 0",
    fontSize: "3rem",
    lineHeight: 1.03,
  },
  titleMobile: {
    fontSize: "2.2rem",
  },
  subtitle: {
    marginTop: "0.9rem",
    marginBottom: 0,
    fontSize: "1.05rem",
    lineHeight: 1.75,
    color: "rgba(255,255,255,0.84)",
    maxWidth: "760px",
  },
  heroActions: {
    display: "flex",
    gap: "0.8rem",
    flexWrap: "wrap",
    marginTop: "1.4rem",
  },
  heroActionsMobile: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  heroPanel: {
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "24px",
    padding: "1.15rem",
    backdropFilter: "blur(10px)",
  },
  heroPanelLabel: {
    display: "block",
    fontSize: "0.82rem",
    fontWeight: "800",
    opacity: 0.82,
    marginBottom: "0.85rem",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  heroPanelGrid: {
    display: "grid",
    gap: "0.7rem",
  },
  heroPanelCard: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "18px",
    padding: "0.9rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  heroPanelCardLabel: {
    fontSize: "0.78rem",
    fontWeight: "800",
    opacity: 0.8,
  },
  heroPanelCardValue: {
    fontWeight: "800",
    lineHeight: 1.55,
    wordBreak: "break-word",
  },
  feedbackSection: {
    marginTop: "1.25rem",
    marginBottom: "1.25rem",
  },
  errorWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "0.9rem",
  },
  errorTitle: {
    margin: 0,
    color: "#9f1239",
    fontWeight: "800",
    fontSize: "1.1rem",
  },
  errorText: {
    margin: 0,
    color: "#881337",
    lineHeight: 1.6,
    fontWeight: "600",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "1rem",
    marginBottom: "1rem",
  },
  summaryGridMobile: {
    gridTemplateColumns: "1fr",
  },
  summaryCard: {
    padding: "1.1rem",
  },
  summaryLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "0.82rem",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    marginBottom: "0.35rem",
  },
  summaryValue: {
    display: "block",
    color: "#0f172a",
    fontSize: "1.2rem",
    fontWeight: "800",
    marginBottom: "0.35rem",
  },
  summaryText: {
    margin: 0,
    color: "#64748b",
    lineHeight: 1.65,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
    alignItems: "start",
  },
  gridMobile: {
    gridTemplateColumns: "1fr",
  },
  card: {
    padding: "1.4rem",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
    flexWrap: "wrap",
    marginBottom: "1.15rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  passwordWrapper: {
    display: "flex",
    gap: "0.55rem",
    alignItems: "stretch",
  },
  passwordWrapperMobile: {
    flexDirection: "column",
  },
  showButton: {
    border: "1px solid #cbd5e1",
    borderRadius: "14px",
    padding: "0 1rem",
    background: "white",
    cursor: "pointer",
    fontWeight: "700",
    minWidth: "110px",
    color: "#334155",
  },
  showButtonMobile: {
    width: "100%",
    minHeight: "46px",
  },
  capsWarning: {
    color: "#b91c1c",
    fontSize: "0.85rem",
    fontWeight: "700",
  },
  checklistPanel: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.9rem",
  },
  checklistHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "0.8rem",
    flexWrap: "wrap",
  },
  checklistTitle: {
    fontSize: "0.92rem",
    fontWeight: "800",
    color: "#0f172a",
  },
  checklist: {
    display: "grid",
    gap: "0.55rem",
  },
  checkItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.55rem",
    color: "#334155",
    fontSize: "0.92rem",
    lineHeight: 1.5,
  },
  checkOk: {
    display: "inline-flex",
    width: "20px",
    justifyContent: "center",
    color: "#15803d",
    fontWeight: "800",
  },
  checkPending: {
    display: "inline-flex",
    width: "20px",
    justifyContent: "center",
    color: "#94a3b8",
    fontWeight: "800",
  },
  actions: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
    marginTop: "0.25rem",
  },
  actionsMobile: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  fullWidthButton: {
    width: "100%",
  },
};

export default ProfilePage;