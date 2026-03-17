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

  const passwordStrengthStyle =
    completedPasswordChecks >= 5
      ? styles.securityStrong
      : completedPasswordChecks >= 3
      ? styles.securityMedium
      : styles.securityLow;

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
          <div
            style={{
              ...styles.heroGrid,
              ...(isMobileView ? styles.heroGridMobile : {}),
            }}
          >
            <div>
              <span style={styles.badge}>El meu compte</span>
              <h1
                style={{
                  ...styles.title,
                  ...(isMobileView ? styles.titleMobile : {}),
                }}
              >
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
                  onClick={() => scrollToElementWithOffset(profileFormRef.current, 140)}
                  style={isMobileView ? styles.fullWidthButton : undefined}
                >
                  Editar perfil
                </button>

                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => scrollToElementWithOffset(passwordFormRef.current, 140)}
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

        {loadError ? (
          <section className="scale-in" style={styles.feedbackSection}>
            <div style={styles.errorBox}>
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
              <article style={styles.summaryCard}>
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

              <article style={styles.summaryCard}>
                <span style={styles.summaryLabel}>Seguretat</span>
                <span style={styles.summaryValue}>Contrasenya</span>
                <p style={styles.summaryText}>
                  Pots actualitzar-la quan vulguis amb validació en temps real.
                </p>
              </article>

              <article style={styles.summaryCard}>
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
                className="fade-in-up delay-2"
                style={styles.card}
              >
                <div style={styles.cardHeader}>
                  <div>
                    <span style={styles.cardKicker}>Dades personals</span>
                    <h2 style={styles.cardTitle}>Informació del compte</h2>
                    <p style={styles.cardText}>
                      Modifica el teu nom complet i el correu electrònic associat.
                    </p>
                  </div>

                  <span
                    style={{
                      ...styles.statusBadge,
                      ...(hasProfileChanges
                        ? styles.statusBadgePending
                        : styles.statusBadgeStable),
                    }}
                  >
                    {hasProfileChanges ? "Canvis pendents" : "Sense canvis"}
                  </span>
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

                  <div style={styles.tipBox}>
                    <span style={styles.tipTitle}>Consell</span>
                    <p style={styles.tipText}>
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
                className="fade-in-up delay-3"
                style={styles.card}
              >
                <div style={styles.cardHeader}>
                  <div>
                    <span style={styles.cardKicker}>Seguretat</span>
                    <h2 style={styles.cardTitle}>Canviar contrasenya</h2>
                    <p style={styles.cardText}>
                      Crea una contrasenya més robusta amb ajuda visual en temps real.
                    </p>
                  </div>

                  <span
                    style={{
                      ...styles.securityBadge,
                      ...passwordStrengthStyle,
                    }}
                  >
                    Seguretat: {passwordStrengthText}
                  </span>
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
  badge: {
    display: "inline-block",
    padding: "0.5rem 0.85rem",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.14)",
    fontWeight: "800",
    marginBottom: "1rem",
  },
  title: {
    margin: 0,
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
  feedbackBox: {
    borderRadius: "18px",
    padding: "1rem 1.1rem",
    border: "1px solid transparent",
    boxShadow: "0 10px 24px rgba(15,23,42,0.04)",
  },
  feedbackSuccess: {
    background: "#ecfdf5",
    borderColor: "#86efac",
  },
  feedbackError: {
    background: "#fff1f2",
    borderColor: "#fecdd3",
  },
  feedbackText: {
    margin: 0,
    fontWeight: "800",
    lineHeight: 1.6,
    color: "#0f172a",
  },
  errorBox: {
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    borderRadius: "24px",
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.9rem",
    boxShadow: "0 10px 24px rgba(15,23,42,0.04)",
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
    background: "rgba(255,255,255,0.84)",
    border: "1px solid rgba(148,163,184,0.18)",
    borderRadius: "22px",
    padding: "1.1rem",
    boxShadow: "0 16px 34px rgba(15,23,42,0.05)",
    backdropFilter: "blur(10px)",
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
    background: "rgba(255,255,255,0.84)",
    border: "1px solid rgba(148,163,184,0.18)",
    borderRadius: "28px",
    padding: "1.4rem",
    boxShadow: "0 18px 40px rgba(15,23,42,0.06)",
    backdropFilter: "blur(10px)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
    flexWrap: "wrap",
    marginBottom: "1.15rem",
  },
  cardKicker: {
    display: "inline-block",
    marginBottom: "0.45rem",
    padding: "0.38rem 0.7rem",
    borderRadius: "999px",
    background: "rgba(37,99,235,0.08)",
    color: "#1d4ed8",
    fontWeight: "800",
    fontSize: "0.8rem",
  },
  cardTitle: {
    margin: 0,
    fontSize: "1.65rem",
    color: "#0f172a",
  },
  cardText: {
    marginTop: "0.45rem",
    marginBottom: 0,
    color: "#64748b",
    lineHeight: 1.7,
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "38px",
    padding: "0.45rem 0.8rem",
    borderRadius: "999px",
    fontSize: "0.84rem",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },
  statusBadgePending: {
    background: "#eff6ff",
    color: "#1d4ed8",
    border: "1px solid #bfdbfe",
  },
  statusBadgeStable: {
    background: "#f8fafc",
    color: "#475569",
    border: "1px solid #e2e8f0",
  },
  securityBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "38px",
    padding: "0.45rem 0.8rem",
    borderRadius: "999px",
    fontSize: "0.84rem",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },
  securityLow: {
    background: "#fff1f2",
    color: "#be123c",
    border: "1px solid #fecdd3",
  },
  securityMedium: {
    background: "#fff7ed",
    color: "#c2410c",
    border: "1px solid #fdba74",
  },
  securityStrong: {
    background: "#ecfdf5",
    color: "#15803d",
    border: "1px solid #86efac",
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
    fontSize: "0.94rem",
    fontWeight: "800",
    color: "#1e293b",
  },
  input: {
    width: "100%",
    padding: "1rem 1rem",
    fontSize: "1rem",
    border: "1px solid #cbd5e1",
    borderRadius: "16px",
    outline: "none",
    background: "rgba(255,255,255,0.96)",
    color: "#0f172a",
    boxShadow: "0 6px 16px rgba(15,23,42,0.03)",
    boxSizing: "border-box",
  },
  tipBox: {
    background: "#f8fbff",
    border: "1px solid #dbeafe",
    borderRadius: "18px",
    padding: "1rem",
  },
  tipTitle: {
    display: "block",
    color: "#1d4ed8",
    fontWeight: "800",
    marginBottom: "0.3rem",
  },
  tipText: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.65,
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