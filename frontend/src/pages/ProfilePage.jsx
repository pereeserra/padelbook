import { useEffect, useMemo, useRef, useState } from "react";
import api from "../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";

function ProfilePage() {
  const topFeedbackRef = useRef(null);
  const profileFormRef = useRef(null);
  const passwordFormRef = useRef(null);
  const feedbackTimeoutRef = useRef(null);

  const [isTabletOrMobile, setIsTabletOrMobile] = useState(window.innerWidth <= 980);

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
      setIsTabletOrMobile(window.innerWidth <= 980);
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

  const initials = useMemo(() => {
    const fullName = profile?.nom?.trim() || "Usuari";
    const parts = fullName.split(" ").filter(Boolean);

    if (parts.length === 1) {
      return parts[0].slice(0, 1).toUpperCase();
    }

    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
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

  const accountSummaryCards = [
    {
      label: "Estat del perfil",
      value: hasProfileChanges ? "Amb canvis" : "Actualitzat",
      text: hasProfileChanges
        ? "Hi ha informació pendent de guardar."
        : "Les dades actuals estan sincronitzades.",
    },
    {
      label: "Rol del compte",
      value: roleLabel,
      text:
        profile?.rol === "admin"
          ? "Tens accés a eines de gestió i administració."
          : "Tens accés a les funcionalitats habituals de reserva.",
    },
    {
      label: "Seguretat",
      value: `Nivell ${passwordStrengthText.toLowerCase()}`,
      text: "Pots reforçar la sessió actualitzant la contrasenya quan vulguis.",
    },
  ];

  const accountDetailItems = [
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
    {
      label: "Sessió",
      value: "Activa",
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
          ...(isTabletOrMobile ? styles.containerMobile : {}),
        }}
      >
        <section
          className="fade-in-up"
          style={{
            ...styles.hero,
            ...(isTabletOrMobile ? styles.heroMobile : {}),
          }}
        >
          <div
            style={{
              ...styles.heroLayout,
              ...(isTabletOrMobile ? styles.heroLayoutMobile : {}),
            }}
          >
            <div style={styles.heroMain}>
              <span style={styles.heroKicker}>El meu compte</span>

              <div style={styles.heroIdentityRow}>
                <div style={styles.heroAvatar}>{initials}</div>

                <div style={styles.heroIdentityText}>
                  <h1
                    style={{
                      ...styles.heroTitle,
                      ...(isTabletOrMobile ? styles.heroTitleMobile : {}),
                    }}
                  >
                    Hola, {firstName}
                  </h1>

                  <p style={styles.heroSubtitle}>
                    Revisa el perfil, mantén el correu actualitzat i reforça la
                    seguretat del compte des d’un espai molt més clar i ordenat.
                  </p>
                </div>
              </div>

              <div
                style={{
                  ...styles.heroActions,
                  ...(isTabletOrMobile ? styles.heroActionsMobile : {}),
                }}
              >
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => scrollToElementWithOffset(profileFormRef.current, 110)}
                  style={isTabletOrMobile ? styles.fullWidthButton : undefined}
                >
                  Editar perfil
                </button>

                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => scrollToElementWithOffset(passwordFormRef.current, 110)}
                  style={isTabletOrMobile ? styles.fullWidthButton : undefined}
                >
                  Canviar contrasenya
                </button>
              </div>
            </div>

            <aside style={styles.heroAside}>
              <div style={styles.heroAsideCard}>
                <div style={styles.heroAsideTopRow}>
                  <div style={styles.heroAsideIdentity}>
                    <span style={styles.heroAsideLabel}>Compte actual</span>
                    <span style={styles.heroAsideName}>{profile?.nom || "Usuari"}</span>
                    <p style={styles.heroAsideEmail}>{profile?.email || "-"}</p>
                  </div>

                  <span
                    className={`pb-badge-pill ${
                      profile?.rol === "admin"
                        ? "pb-badge-pill--blue"
                        : "pb-badge-pill--green"
                    }`}
                    style={styles.heroRoleBadge}
                  >
                    {roleLabel}
                  </span>
                </div>

                <div style={styles.heroAsideMiniStats}>
                  <div style={styles.heroAsideMiniStat}>
                    <span style={styles.heroAsideMiniLabel}>Perfil</span>
                    <span style={styles.heroAsideMiniValue}>
                      {hasProfileChanges ? "Pendent" : "Correcte"}
                    </span>
                  </div>

                  <div style={styles.heroAsideMiniStat}>
                    <span style={styles.heroAsideMiniLabel}>Seguretat</span>
                    <span style={styles.heroAsideMiniValue}>{passwordStrengthText}</span>
                  </div>
                </div>
              </div>
            </aside>
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
                ...(isTabletOrMobile ? styles.summaryGridMobile : {}),
              }}
            >
              {accountSummaryCards.map((item) => (
                <article key={item.label} className="pb-surface-card" style={styles.summaryCard}>
                  <span style={styles.summaryLabel}>{item.label}</span>
                  <span style={styles.summaryValue}>{item.value}</span>
                  <p style={styles.summaryText}>{item.text}</p>
                </article>
              ))}
            </section>

            <div
              style={{
                ...styles.contentLayout,
                ...(isTabletOrMobile ? styles.contentLayoutMobile : {}),
              }}
            >
              <main style={styles.mainColumn}>
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
                        Modifica el teu nom complet i el correu electrònic associat
                        a la sessió.
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
                    <div
                      style={{
                        ...styles.formGrid,
                        ...(isTabletOrMobile ? styles.formGridMobile : {}),
                      }}
                    >
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
                    </div>

                    <div style={styles.infoStrip}>
                      <div style={styles.infoStripIcon}>i</div>
                      <div>
                        <p style={styles.infoStripTitle}>Consell de perfil</p>
                        <p style={styles.infoStripText}>
                          Mantén un nom complet real i un correu vàlid per
                          identificar millor el compte i rebre comunicacions sense
                          errors.
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        ...styles.actions,
                        ...(isTabletOrMobile ? styles.actionsMobile : {}),
                      }}
                    >
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={savingProfile || !hasProfileChanges}
                        style={isTabletOrMobile ? styles.fullWidthButton : undefined}
                      >
                        {savingProfile ? "Guardant canvis..." : "Guardar canvis"}
                      </button>

                      <button
                        type="button"
                        className="btn btn-light"
                        onClick={handleResetProfileChanges}
                        disabled={!hasProfileChanges || savingProfile}
                        style={isTabletOrMobile ? styles.fullWidthButton : undefined}
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
                        Actualitza la contrasenya amb una validació clara i en temps
                        real.
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
                          ...(isTabletOrMobile ? styles.passwordWrapperMobile : {}),
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
                            ...(isTabletOrMobile ? styles.showButtonMobile : {}),
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
                          ...(isTabletOrMobile ? styles.passwordWrapperMobile : {}),
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
                            ...(isTabletOrMobile ? styles.showButtonMobile : {}),
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
                        <span style={styles.checklistCounter}>
                          {completedPasswordChecks}/6 complets
                        </span>
                      </div>

                      <div style={styles.progressTrack}>
                        <div
                          style={{
                            ...styles.progressFill,
                            width: `${(completedPasswordChecks / 6) * 100}%`,
                          }}
                        />
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
                        ...(isTabletOrMobile ? styles.actionsMobile : {}),
                      }}
                    >
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={changingPassword}
                        style={isTabletOrMobile ? styles.fullWidthButton : undefined}
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
                        style={isTabletOrMobile ? styles.fullWidthButton : undefined}
                      >
                        Netejar camps
                      </button>
                    </div>
                  </form>
                </section>
              </main>

              <aside style={styles.sidebarColumn}>
                <div
                  style={{
                    ...styles.sidebarStack,
                    ...(isTabletOrMobile ? styles.sidebarStackMobile : {}),
                  }}
                >
                  <section
                    className="fade-in-up delay-3 pb-surface-card"
                    style={styles.sidebarCard}
                  >
                    <div style={styles.sidebarCardHeader}>
                      <span className="pb-kicker">Resum del compte</span>
                      <h3 style={styles.sidebarTitle}>Vista ràpida</h3>
                    </div>

                    <div style={styles.accountList}>
                      {accountDetailItems.map((item) => (
                        <div key={item.label} style={styles.accountListItem}>
                          <span style={styles.accountListLabel}>{item.label}</span>
                          <span style={styles.accountListValue}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section
                    className="fade-in-up delay-4 pb-surface-card"
                    style={styles.sidebarCard}
                  >
                    <div style={styles.sidebarCardHeader}>
                      <span className="pb-kicker">Estat actual</span>
                      <h3 style={styles.sidebarTitle}>Seguiment</h3>
                    </div>

                    <div style={styles.statusStack}>
                      <div style={styles.statusRow}>
                        <span style={styles.statusLabel}>Canvis al perfil</span>
                        <span
                          className={`pb-badge-pill ${
                            hasProfileChanges
                              ? "pb-badge-pill--blue"
                              : "pb-badge-pill--green"
                          }`}
                        >
                          {hasProfileChanges ? "Pendents" : "Al dia"}
                        </span>
                      </div>

                      <div style={styles.statusRow}>
                        <span style={styles.statusLabel}>Contrasenya</span>
                        <span className={passwordStrengthClass}>{passwordStrengthText}</span>
                      </div>

                      <div style={styles.statusRow}>
                        <span style={styles.statusLabel}>Sessió</span>
                        <span className="pb-badge-pill pb-badge-pill--green">Activa</span>
                      </div>
                    </div>
                  </section>

                  <section
                    className="fade-in-up delay-4 pb-surface-card"
                    style={styles.sidebarCard}
                  >
                    <div style={styles.sidebarCardHeader}>
                      <span className="pb-kicker">Bones pràctiques</span>
                      <h3 style={styles.sidebarTitle}>Recomanacions</h3>
                    </div>

                    <div style={styles.tipList}>
                      <div style={styles.tipItem}>
                        <span style={styles.tipBullet}>•</span>
                        <p style={styles.tipText}>
                          Revisa el correu si canvies l’adreça principal del compte.
                        </p>
                      </div>

                      <div style={styles.tipItem}>
                        <span style={styles.tipBullet}>•</span>
                        <p style={styles.tipText}>
                          Evita reutilitzar la mateixa contrasenya en altres serveis.
                        </p>
                      </div>

                      <div style={styles.tipItem}>
                        <span style={styles.tipBullet}>•</span>
                        <p style={styles.tipText}>
                          Guarda els canvis del perfil abans de sortir de la pàgina.
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "1.7rem 0 3rem",
  },
  container: {
    maxWidth: "1240px",
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
    padding: "1.35rem",
    marginBottom: "1.2rem",
    background:
      "linear-gradient(135deg, rgba(15,23,42,0.97), rgba(37,99,235,0.88))",
    boxShadow: "0 28px 60px rgba(37,99,235,0.16)",
    color: "white",
  },
  heroMobile: {
    padding: "1.1rem",
    borderRadius: "24px",
  },
  heroLayout: {
    display: "grid",
    gridTemplateColumns: "1.35fr 0.8fr",
    gap: "0.95rem",
    alignItems: "stretch",
  },
  heroLayoutMobile: {
    gridTemplateColumns: "1fr",
  },
  heroMain: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  heroKicker: {
    alignSelf: "flex-start",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "34px",
    padding: "0.35rem 0.9rem",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.16)",
    color: "rgba(255,255,255,0.94)",
    fontSize: "0.84rem",
    fontWeight: "800",
    letterSpacing: "-0.01em",
    width: "fit-content",
    maxWidth: "100%",
    backdropFilter: "blur(8px)",
  },
  heroIdentityRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.9rem",
    marginTop: "0.95rem",
  },
  heroAvatar: {
    width: "58px",
    height: "58px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.14)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1rem",
    fontWeight: "800",
    color: "white",
    flexShrink: 0,
    backdropFilter: "blur(8px)",
  },
  heroIdentityText: {
    minWidth: 0,
  },
  heroTitle: {
    margin: 0,
    fontSize: "2.25rem",
    lineHeight: 1.02,
    letterSpacing: "-0.03em",
  },
  heroTitleMobile: {
    fontSize: "1.9rem",
  },
  heroSubtitle: {
    marginTop: "0.7rem",
    marginBottom: 0,
    fontSize: "0.98rem",
    lineHeight: 1.7,
    color: "rgba(255,255,255,0.84)",
    maxWidth: "700px",
  },
  heroActions: {
    display: "flex",
    gap: "0.7rem",
    flexWrap: "wrap",
    marginTop: "1.15rem",
  },
  heroActionsMobile: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  heroAside: {
    display: "flex",
  },
  heroAsideCard: {
    width: "100%",
    borderRadius: "24px",
    padding: "1rem",
    background: "rgba(255,255,255,0.11)",
    border: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: "blur(10px)",
    display: "flex",
    flexDirection: "column",
    gap: "0.85rem",
    justifyContent: "space-between",
  },
  heroAsideTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "0.8rem",
    flexWrap: "wrap",
  },
  heroAsideIdentity: {
    minWidth: 0,
    flex: "1 1 220px",
  },
  heroAsideLabel: {
    display: "block",
    fontSize: "0.76rem",
    fontWeight: "800",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.72)",
    marginBottom: "0.45rem",
  },
  heroAsideName: {
    display: "block",
    fontSize: "1rem",
    fontWeight: "800",
    lineHeight: 1.35,
  },
  heroAsideEmail: {
    margin: "0.45rem 0 0 0",
    color: "rgba(255,255,255,0.84)",
    lineHeight: 1.55,
    wordBreak: "break-word",
    fontSize: "0.94rem",
  },
  heroRoleBadge: {
    alignSelf: "flex-start",
  },
  heroAsideMiniStats: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.7rem",
  },
  heroAsideMiniStat: {
    borderRadius: "16px",
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.09)",
    padding: "0.8rem 0.9rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.22rem",
    minHeight: "auto",
  },
  heroAsideMiniLabel: {
    fontSize: "0.72rem",
    fontWeight: "800",
    color: "rgba(255,255,255,0.68)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  heroAsideMiniValue: {
    fontSize: "0.98rem",
    fontWeight: "800",
    color: "#ffffff",
    lineHeight: 1.3,
  },
  feedbackSection: {
    marginTop: "1.05rem",
    marginBottom: "1.05rem",
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
    fontSize: "1.08rem",
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
    fontSize: "0.8rem",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    marginBottom: "0.35rem",
  },
  summaryValue: {
    display: "block",
    color: "#0f172a",
    fontSize: "1.18rem",
    fontWeight: "800",
    marginBottom: "0.35rem",
  },
  summaryText: {
    margin: 0,
    color: "#64748b",
    lineHeight: 1.65,
  },
  contentLayout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.2fr) minmax(280px, 0.8fr)",
    gap: "1rem",
    alignItems: "start",
  },
  contentLayoutMobile: {
    gridTemplateColumns: "1fr",
  },
  mainColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  sidebarColumn: {
    minWidth: 0,
  },
  sidebarStack: {
    position: "sticky",
    top: "104px",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  sidebarStackMobile: {
    position: "static",
  },
  card: {
    padding: "1.35rem",
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
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
  },
  formGridMobile: {
    gridTemplateColumns: "1fr",
  },
  infoStrip: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.85rem",
    padding: "1rem",
    borderRadius: "18px",
    background: "linear-gradient(135deg, #f8fafc, #eff6ff)",
    border: "1px solid #dbeafe",
  },
  infoStripIcon: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    background: "#dbeafe",
    color: "#1d4ed8",
    fontWeight: "800",
    fontSize: "0.92rem",
  },
  infoStripTitle: {
    margin: 0,
    color: "#0f172a",
    fontWeight: "800",
    fontSize: "0.93rem",
  },
  infoStripText: {
    margin: "0.28rem 0 0 0",
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
  checklistCounter: {
    color: "#475569",
    fontSize: "0.84rem",
    fontWeight: "800",
  },
  progressTrack: {
    position: "relative",
    width: "100%",
    height: "10px",
    borderRadius: "999px",
    overflow: "hidden",
    background: "#e2e8f0",
  },
  progressFill: {
    height: "100%",
    borderRadius: "999px",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    transition: "width 0.25s ease",
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
  sidebarCard: {
    padding: "1.15rem",
  },
  sidebarCardHeader: {
    marginBottom: "0.95rem",
  },
  sidebarTitle: {
    margin: "0.32rem 0 0 0",
    color: "#0f172a",
    fontSize: "1.02rem",
    fontWeight: "800",
    letterSpacing: "-0.02em",
  },
  accountList: {
    display: "grid",
    gap: "0.8rem",
  },
  accountListItem: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    paddingBottom: "0.75rem",
    borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
  },
  accountListLabel: {
    color: "#64748b",
    fontSize: "0.78rem",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  accountListValue: {
    color: "#0f172a",
    fontWeight: "700",
    lineHeight: 1.5,
    wordBreak: "break-word",
  },
  statusStack: {
    display: "grid",
    gap: "0.75rem",
  },
  statusRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "0.8rem",
    flexWrap: "wrap",
  },
  statusLabel: {
    color: "#334155",
    fontWeight: "700",
  },
  tipList: {
    display: "grid",
    gap: "0.8rem",
  },
  tipItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.65rem",
  },
  tipBullet: {
    color: "#2563eb",
    fontWeight: "900",
    lineHeight: 1.5,
  },
  tipText: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.65,
  },
  fullWidthButton: {
    width: "100%",
  },
};

export default ProfilePage;