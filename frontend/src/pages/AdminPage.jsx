import { useEffect, useMemo, useRef, useState } from "react";
import api from "../api/axios";
import CreateCourtForm from "../components/CreateCourtForm";
import CourtCard from "../components/CourtCard";
import AdminReservationsTable from "../components/AdminReservationsTable";
import LoadingSpinner from "../components/LoadingSpinner";

function AdminPage() {
  const emptyCourt = {
    nom_pista: "",
    tipus: "dobles",
    coberta: 0,
    estat: "disponible",
    descripcio: "",
  };

  const editSectionRef = useRef(null);
  const dashboardSectionRef = useRef(null);
  const reservationsSectionRef = useRef(null);
  const courtsSectionRef = useRef(null);
  const feedbackRef = useRef(null);

  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);

  const [reservations, setReservations] = useState([]);
  const [courts, setCourts] = useState([]);

  const [overviewStats, setOverviewStats] = useState({});
  const [statsByCourt, setStatsByCourt] = useState([]);
  const [statsByTimeslot, setStatsByTimeslot] = useState([]);
  const [statsByDate, setStatsByDate] = useState([]);
  const [adminLogs, setAdminLogs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [error, setError] = useState("");

  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("success");
  const [feedbackAction, setFeedbackAction] = useState(null);

  const [confirmingCourtId, setConfirmingCourtId] = useState(null);
  const [deletingCourtId, setDeletingCourtId] = useState(null);
  const [creatingCourt, setCreatingCourt] = useState(false);
  const [editingCourtId, setEditingCourtId] = useState(null);
  const [highlightedCourtId, setHighlightedCourtId] = useState(null);

  const [newCourt, setNewCourt] = useState(emptyCourt);

  const [courtSearch, setCourtSearch] = useState("");
  const [courtStatusFilter, setCourtStatusFilter] = useState("totes");
  const [courtTypeFilter, setCourtTypeFilter] = useState("tots");

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scrollToElementWithOffset = (element, offset = 110) => {
    if (!element) return;

    const targetTop = element.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({
      top: targetTop,
      behavior: "smooth",
    });
  };

  const scrollToCourtCard = (courtId) => {
    const card = document.getElementById(`court-${courtId}`);
    if (!card) return;

    scrollToElementWithOffset(card, 120);
    setHighlightedCourtId(courtId);

    setTimeout(() => {
      setHighlightedCourtId(null);
    }, 2500);
  };

  const normalizeCollectionResponse = (responseData) => {
    if (Array.isArray(responseData)) return responseData;
    if (Array.isArray(responseData?.data)) return responseData.data;
    if (Array.isArray(responseData?.items)) return responseData.items;
    if (Array.isArray(responseData?.results)) return responseData.results;
    if (Array.isArray(responseData?.logs)) return responseData.logs;
    if (Array.isArray(responseData?.reservations)) return responseData.reservations;
    if (Array.isArray(responseData?.courts)) return responseData.courts;
    return [];
  };

  const normalizeOverview = (data, reservationsSource = [], courtsSource = []) => {
    return {
      totalReservations:
        data?.totalReservations ??
        data?.total_reservations ??
        data?.reservesTotals ??
        data?.reservations ??
        reservationsSource.length ??
        0,

      activeReservations:
        data?.activeReservations ??
        data?.active_reservations ??
        data?.reservesActives ??
        reservationsSource.filter((reservation) => {
          const status = (reservation.estat || "").toLowerCase();
          return status === "activa" || status === "active";
        }).length,

      cancelledReservations:
        data?.cancelledReservations ??
        data?.cancelled_reservations ??
        data?.canceledReservations ??
        data?.canceled_reservations ??
        data?.reservesCancelades ??
        reservationsSource.filter((reservation) => {
          const status = (reservation.estat || "").toLowerCase();
          return status !== "activa" && status !== "active";
        }).length,

      totalCourts:
        data?.totalCourts ??
        data?.total_courts ??
        data?.pistesTotals ??
        courtsSource.length ??
        0,

      availableCourts:
        data?.availableCourts ??
        data?.available_courts ??
        data?.pistesDisponibles ??
        courtsSource.filter((court) => court.estat === "disponible").length,

      coveredCourts:
        data?.coveredCourts ??
        data?.covered_courts ??
        data?.pistesCobertes ??
        courtsSource.filter((court) => Number(court.coberta) === 1).length,
    };
  };

  const normalizeCourtStat = (item, index) => ({
    id: item?.id ?? item?.court_id ?? item?.pista_id ?? `court-${index}`,
    label:
      item?.nom_pista ??
      item?.court_name ??
      item?.court ??
      item?.name ??
      item?.pista ??
      `Pista ${index + 1}`,
    value:
      Number(
        item?.total ??
          item?.count ??
          item?.reservations ??
          item?.total_reserves ??
          item?.value ??
          0
      ) || 0,
  });

  const normalizeTimeslotStat = (item, index) => ({
    id:
      item?.id ??
      item?.time_slot_id ??
      item?.slot_id ??
      item?.franja_id ??
      `slot-${index}`,
    label:
      item?.hora ??
      item?.time_slot ??
      item?.slot ??
      item?.franja ??
      item?.label ??
      `Franja ${index + 1}`,
    value:
      Number(
        item?.total ??
          item?.count ??
          item?.reservations ??
          item?.total_reserves ??
          item?.value ??
          0
      ) || 0,
  });

  const normalizeDateStat = (item, index) => ({
    id: item?.id ?? item?.date ?? item?.data ?? `date-${index}`,
    label: item?.data ?? item?.date ?? item?.label ?? `Data ${index + 1}`,
    value:
      Number(
        item?.total ??
          item?.count ??
          item?.reservations ??
          item?.total_reserves ??
          item?.value ??
          0
      ) || 0,
  });

  const normalizeLogItem = (log, index) => ({
    id: log?.id ?? `log-${index}`,
    action:
      log?.accio ??
      log?.action ??
      log?.tipus ??
      log?.type ??
      "ACCIO_DESCONEGUDA",
    adminName:
      log?.admin_nom ??
      log?.adminName ??
      log?.admin ??
      log?.nom_admin ??
      log?.user_name ??
      "Administrador",
    adminId: log?.admin_id ?? log?.adminId ?? log?.user_id ?? null,
    details:
      log?.detalls ??
      log?.details ??
      log?.descripcio ??
      log?.description ??
      "",
    createdAt:
      log?.created_at ??
      log?.createdAt ??
      log?.data ??
      log?.date ??
      null,
  });

  const showFeedbackMessage = (message, type = "success", action = null) => {
    setFeedback(message);
    setFeedbackType(type);
    setFeedbackAction(action);

    setTimeout(() => {
      setFeedback("");
      setFeedbackAction(null);
    }, 5000);

    setTimeout(() => {
      scrollToElementWithOffset(feedbackRef.current, 120);
    }, 60);
  };

  const fetchDashboardData = async (
    reservationsSource = reservations,
    courtsSource = courts
  ) => {
    try {
      setLoadingDashboard(true);

      const [overviewRes, byCourtRes, byTimeslotRes, byDateRes, logsRes] =
        await Promise.all([
          api.get("/admin/stats/overview"),
          api.get("/admin/stats/by-court"),
          api.get("/admin/stats/by-timeslot"),
          api.get("/admin/stats/by-date"),
          api.get("/admin/logs?page=1&limit=8"),
        ]);

      setOverviewStats(
        normalizeOverview(overviewRes.data?.data || {}, reservationsSource, courtsSource)
      );
      setStatsByCourt(
        normalizeCollectionResponse(byCourtRes.data).map(normalizeCourtStat)
      );
      setStatsByTimeslot(
        normalizeCollectionResponse(byTimeslotRes.data).map(normalizeTimeslotStat)
      );
      setStatsByDate(
        normalizeCollectionResponse(byDateRes.data).map(normalizeDateStat)
      );
      setAdminLogs(normalizeCollectionResponse(logsRes.data).map(normalizeLogItem));
    } catch (err) {
      console.error(err);
      showFeedbackMessage(
        "No s'han pogut carregar algunes dades del dashboard administratiu.",
        "error"
      );
    } finally {
      setLoadingDashboard(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError("");

      const [reservationsRes, courtsRes] = await Promise.all([
        api.get("/admin/reservations"),
        api.get("/courts"),
      ]);

      const normalizedReservations = normalizeCollectionResponse(
        reservationsRes.data
      );
      const normalizedCourts = normalizeCollectionResponse(courtsRes.data);

      setReservations(normalizedReservations);
      setCourts(normalizedCourts);

      return {
        reservations: normalizedReservations,
        courts: normalizedCourts,
      };
    } catch (err) {
      console.error(err);
      setError("Error carregant dades d'administració");
      return { reservations: [], courts: [] };
    } finally {
      setLoading(false);
    }
  };

  const refreshAllAdminData = async () => {
    const baseData = await fetchAdminData();

    const safeReservations = Array.isArray(baseData?.reservations)
      ? baseData.reservations
      : [];

    const safeCourts = Array.isArray(baseData?.courts) ? baseData.courts : [];

    setOverviewStats(normalizeOverview({}, safeReservations, safeCourts));

    await fetchDashboardData(safeReservations, safeCourts);
  };

  const resetCourtForm = () => {
    setNewCourt(emptyCourt);
    setEditingCourtId(null);
  };

  const resetCourtFilters = () => {
    setCourtSearch("");
    setCourtStatusFilter("totes");
    setCourtTypeFilter("tots");
  };

  const handleCreateOrUpdateCourt = async (e) => {
    e.preventDefault();

    try {
      setCreatingCourt(true);

      const payload = {
        ...newCourt,
        coberta: Number(newCourt.coberta),
      };

      if (editingCourtId) {
        await api.put(`/admin/courts/${editingCourtId}`, payload);
        await refreshAllAdminData();

        showFeedbackMessage(
          "La pista s'ha actualitzat correctament.",
          "success",
          {
            label: "Veure pista editada",
            onClick: () => scrollToCourtCard(editingCourtId),
          }
        );

        resetCourtForm();
      } else {
        const createResponse = await api.post("/admin/courts", payload);
        const createdCourtId = createResponse?.data?.data?.id || null;

        const refreshedData = await fetchAdminData();
        await fetchDashboardData(refreshedData.reservations, refreshedData.courts);

        if (createdCourtId) {
          showFeedbackMessage(
            "La pista s'ha creat correctament.",
            "success",
            {
              label: "Veure pista creada",
              onClick: () => scrollToCourtCard(createdCourtId),
            }
          );
        } else {
          const createdMatches = refreshedData.courts.filter(
            (court) => court.nom_pista === payload.nom_pista
          );

          const createdCourt =
            createdMatches.length > 0
              ? createdMatches[createdMatches.length - 1]
              : null;

          if (createdCourt) {
            showFeedbackMessage(
              "La pista s'ha creat correctament.",
              "success",
              {
                label: "Veure pista creada",
                onClick: () => scrollToCourtCard(createdCourt.id),
              }
            );
          } else {
            showFeedbackMessage("La pista s'ha creat correctament.", "success");
          }
        }

        resetCourtForm();
      }
    } catch (err) {
      console.error(err);

      const backendError =
        err.response?.data?.error ||
        (editingCourtId
          ? "No s'han pogut guardar els canvis de la pista."
          : "No s'ha pogut crear la pista. Revisa les dades i torna-ho a provar.");

      showFeedbackMessage(backendError, "error");
    } finally {
      setCreatingCourt(false);
    }
  };

  const handleStartEditCourt = (court) => {
    setEditingCourtId(court.id);
    setNewCourt({
      nom_pista: court.nom_pista || "",
      tipus: court.tipus || "dobles",
      coberta: Number(court.coberta) || 0,
      estat: court.estat || "disponible",
      descripcio: court.descripcio || "",
    });
    setConfirmingCourtId(null);

    setTimeout(() => {
      scrollToElementWithOffset(editSectionRef.current, 90);
    }, 80);
  };

  const handleDeleteCourt = async (courtId) => {
    try {
      setDeletingCourtId(courtId);

      await api.delete(`/admin/courts/${courtId}`);

      setConfirmingCourtId(null);

      if (editingCourtId === courtId) {
        resetCourtForm();
      }

      showFeedbackMessage("La pista s'ha eliminat correctament.", "success");

      await refreshAllAdminData();
    } catch (err) {
      console.error(err);

      const backendError =
        err.response?.data?.error ||
        "No s'ha pogut eliminar la pista. Torna-ho a provar.";

      showFeedbackMessage(backendError, "error");
    } finally {
      setDeletingCourtId(null);
    }
  };

  useEffect(() => {
    refreshAllAdminData();
  }, []);

  const availableCourts = useMemo(() => {
    return courts.filter((court) => court.estat === "disponible");
  }, [courts]);

  const coveredCourts = useMemo(() => {
    return courts.filter((court) => Number(court.coberta) === 1);
  }, [courts]);

  const activeReservationsCount = useMemo(() => {
    return reservations.filter((reservation) => {
      const status = (reservation.estat || "").toLowerCase();
      return status === "activa" || status === "active";
    }).length;
  }, [reservations]);

  const cancelledReservationsCount = useMemo(() => {
    return reservations.filter((reservation) => {
      const status = (reservation.estat || "").toLowerCase();
      return status !== "activa" && status !== "active";
    }).length;
  }, [reservations]);

  const topCourtValue = useMemo(() => {
    if (!statsByCourt.length) return 0;
    return Math.max(...statsByCourt.map((item) => item.value), 0);
  }, [statsByCourt]);

  const topTimeslotValue = useMemo(() => {
    if (!statsByTimeslot.length) return 0;
    return Math.max(...statsByTimeslot.map((item) => item.value), 0);
  }, [statsByTimeslot]);

  const topDateValue = useMemo(() => {
    if (!statsByDate.length) return 0;
    return Math.max(...statsByDate.map((item) => item.value), 0);
  }, [statsByDate]);

  const recentDateStats = useMemo(() => {
    return statsByDate.slice(0, 7);
  }, [statsByDate]);

  const topCourt = useMemo(() => {
    if (!statsByCourt.length) return null;
    return [...statsByCourt].sort((a, b) => b.value - a.value)[0];
  }, [statsByCourt]);

  const topTimeslot = useMemo(() => {
    if (!statsByTimeslot.length) return null;
    return [...statsByTimeslot].sort((a, b) => b.value - a.value)[0];
  }, [statsByTimeslot]);

  const busiestDate = useMemo(() => {
    if (!statsByDate.length) return null;
    return [...statsByDate].sort((a, b) => b.value - a.value)[0];
  }, [statsByDate]);

  const filteredCourts = useMemo(() => {
    const query = courtSearch.trim().toLowerCase();

    return courts.filter((court) => {
      const name = (court.nom_pista || "").toLowerCase();
      const description = (court.descripcio || "").toLowerCase();
      const status = (court.estat || "").toLowerCase();
      const type = (court.tipus || "").toLowerCase();

      const matchesQuery =
        !query || name.includes(query) || description.includes(query);

      const matchesStatus =
        courtStatusFilter === "totes" || status === courtStatusFilter;

      const matchesType =
        courtTypeFilter === "tots" || type === courtTypeFilter;

      return matchesQuery && matchesStatus && matchesType;
    });
  }, [courts, courtSearch, courtStatusFilter, courtTypeFilter]);

  const filteredAvailableCourtsCount = useMemo(() => {
    return filteredCourts.filter((court) => court.estat === "disponible").length;
  }, [filteredCourts]);

  const filteredMaintenanceCourtsCount = useMemo(() => {
    return filteredCourts.filter((court) => court.estat === "manteniment").length;
  }, [filteredCourts]);

  const formatDateTime = (value) => {
    if (!value) return "Data no disponible";

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;

    return parsed.toLocaleString("ca-ES", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatActionLabel = (action) => {
    const actionMap = {
      CREATE_COURT: "Crear pista",
      UPDATE_COURT: "Editar pista",
      DELETE_COURT: "Eliminar pista",
      CREATE_MAINTENANCE: "Crear manteniment",
    };

    return actionMap[action] || action?.replaceAll("_", " ") || "Acció";
  };

  const dashboardCards = [
    {
      label: "Reserves totals",
      value: overviewStats.totalReservations ?? reservations.length ?? 0,
      icon: "📅",
      accent: styles.accentBlue,
    },
    {
      label: "Reserves actives",
      value: overviewStats.activeReservations ?? activeReservationsCount,
      icon: "✅",
      accent: styles.accentGreen,
    },
    {
      label: "Reserves cancel·lades",
      value: overviewStats.cancelledReservations ?? cancelledReservationsCount,
      icon: "🧾",
      accent: styles.accentRose,
    },
    {
      label: "Pistes totals",
      value: overviewStats.totalCourts ?? courts.length ?? 0,
      icon: "🎾",
      accent: styles.accentIndigo,
    },
    {
      label: "Pistes disponibles",
      value: overviewStats.availableCourts ?? availableCourts.length,
      icon: "🟢",
      accent: styles.accentEmerald,
    },
    {
      label: "Pistes cobertes",
      value: overviewStats.coveredCourts ?? coveredCourts.length,
      icon: "🏟️",
      accent: styles.accentAmber,
    },
  ];

  const quickInsights = [
    {
      label: "Pista amb més reserves",
      value: topCourt ? `${topCourt.label} · ${topCourt.value}` : "Sense dades",
    },
    {
      label: "Franja més demandada",
      value: topTimeslot
        ? `${topTimeslot.label} · ${topTimeslot.value}`
        : "Sense dades",
    },
    {
      label: "Dia amb més activitat",
      value: busiestDate
        ? `${busiestDate.label} · ${busiestDate.value}`
        : "Sense dades",
    },
  ];

  if (loading && !feedback) {
    return (
      <LoadingSpinner
        text="Carregant dades d'administració..."
        minHeight="260px"
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
              <span className="pb-chip">Administració</span>

              <h1
                style={{
                  ...styles.title,
                  ...(isMobileView ? styles.titleMobile : {}),
                }}
              >
                Panell d’administració
              </h1>

              <p style={styles.subtitle}>
                Controla pistes, reserves, estadístiques i activitat recent des d’un
                espai més complet, més ordenat i amb millor lectura visual.
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
                  onClick={() => scrollToElementWithOffset(dashboardSectionRef.current, 140)}
                  style={isMobileView ? styles.fullWidthButton : undefined}
                >
                  Veure dashboard
                </button>

                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => scrollToElementWithOffset(editSectionRef.current, 140)}
                  style={isMobileView ? styles.fullWidthButton : undefined}
                >
                  Crear o editar pista
                </button>

                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => scrollToElementWithOffset(reservationsSectionRef.current, 140)}
                  style={isMobileView ? styles.fullWidthButton : undefined}
                >
                  Veure reserves
                </button>

                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => scrollToElementWithOffset(courtsSectionRef.current, 140)}
                  style={isMobileView ? styles.fullWidthButton : undefined}
                >
                  Gestionar pistes
                </button>
              </div>
            </div>

            {!error && (
              <div style={styles.heroPanel}>
                <span style={styles.heroPanelLabel}>Resum executiu</span>

                <div style={styles.heroPanelGrid}>
                  <div style={styles.heroPanelCard}>
                    <span style={styles.heroPanelCardLabel}>Pistes totals</span>
                    <span style={styles.heroPanelCardValue}>{courts.length}</span>
                  </div>

                  <div style={styles.heroPanelCard}>
                    <span style={styles.heroPanelCardLabel}>Disponibles</span>
                    <span style={styles.heroPanelCardValue}>{availableCourts.length}</span>
                  </div>

                  <div style={styles.heroPanelCard}>
                    <span style={styles.heroPanelCardLabel}>Reserves</span>
                    <span style={styles.heroPanelCardValue}>{reservations.length}</span>
                  </div>

                  <div style={styles.heroPanelCard}>
                    <span style={styles.heroPanelCardLabel}>Cobertes</span>
                    <span style={styles.heroPanelCardValue}>{coveredCourts.length}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <div ref={feedbackRef} />

        {feedback && (
          <section className="scale-in" style={styles.feedbackSection}>
            <div
              className={`pb-feedback ${
                feedbackType === "success"
                  ? "pb-feedback--success"
                  : "pb-feedback--error"
              }`}
            >
              <div
                style={{
                  ...styles.feedbackRow,
                  ...(isMobileView ? styles.feedbackRowMobile : {}),
                }}
              >
                <p className="pb-feedback__text">{feedback}</p>

                {feedbackAction && (
                  <button
                    type="button"
                    className="btn btn-light btn-sm"
                    onClick={feedbackAction.onClick}
                    style={isMobileView ? styles.fullWidthButton : undefined}
                  >
                    {feedbackAction.label}
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {loadingDashboard && (
          <section className="scale-in" style={styles.feedbackSection}>
            <div className="pb-feedback pb-feedback--info">
              <p className="pb-feedback__text">Actualitzant dashboard administratiu...</p>
            </div>
          </section>
        )}

        {error && (
          <section className="scale-in" style={styles.feedbackSection}>
            <div className="pb-feedback pb-feedback--error" style={styles.errorWrapper}>
              <p style={styles.errorTitle}>
                No s'han pogut carregar les dades d'administració
              </p>
              <p style={styles.errorText}>{error}</p>

              <button
                type="button"
                className="btn btn-primary"
                onClick={refreshAllAdminData}
              >
                Tornar-ho a intentar
              </button>
            </div>
          </section>
        )}

        {!error && (
          <>
            <section
              ref={dashboardSectionRef}
              className="fade-in-up delay-1"
              style={styles.section}
            >
              <div
                style={{
                  ...styles.sectionHeader,
                  ...(isMobileView ? styles.sectionHeaderMobile : {}),
                }}
              >
                <div>
                  <span className="pb-kicker">Visió general</span>
                  <h2
                    className="pb-panel-title"
                    style={isMobileView ? styles.sectionTitleMobile : undefined}
                  >
                    Dashboard administratiu
                  </h2>
                  <p className="pb-panel-text">
                    Visió ràpida de l’estat del sistema, volum de reserves i pistes.
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => fetchDashboardData()}
                  style={isMobileView ? styles.fullWidthButton : undefined}
                >
                  Actualitzar dashboard
                </button>
              </div>

              <div
                style={{
                  ...styles.dashboardStatsGrid,
                  ...(isMobileView ? styles.dashboardStatsGridMobile : {}),
                }}
              >
                {dashboardCards.map((card) => (
                  <article
                    key={card.label}
                    className="pb-surface-card"
                    style={{
                      ...styles.dashboardStatCard,
                      ...card.accent,
                    }}
                  >
                    <div style={styles.dashboardStatTop}>
                      <span style={styles.dashboardStatIcon}>{card.icon}</span>
                      <span style={styles.dashboardStatLabel}>{card.label}</span>
                    </div>

                    <span
                      style={{
                        ...styles.dashboardStatValue,
                        ...(isMobileView ? styles.dashboardStatValueMobile : {}),
                      }}
                    >
                      {card.value}
                    </span>
                  </article>
                ))}
              </div>
            </section>

            <section className="fade-in-up delay-2" style={styles.section}>
              <div className="pb-surface-card" style={styles.sectionCard}>
                <div
                  style={{
                    ...styles.analyticsHeader,
                    ...(isMobileView ? styles.analyticsHeaderMobile : {}),
                  }}
                >
                  <div>
                    <span className="pb-kicker">Resum ràpid</span>
                    <h3 style={styles.analyticsTitle}>Insights clau</h3>
                  </div>
                  <span className="pb-badge-pill pb-badge-pill--blue">Executiu</span>
                </div>

                <div
                  style={{
                    ...styles.insightsGrid,
                    ...(isMobileView ? styles.insightsGridMobile : {}),
                  }}
                >
                  {quickInsights.map((insight) => (
                    <article
                      className="pb-surface-card"
                      style={styles.insightCard}
                      key={insight.label}
                    >
                      <span style={styles.insightLabel}>{insight.label}</span>
                      <span style={styles.insightValue}>{insight.value}</span>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section className="fade-in-up delay-2" style={styles.section}>
              <div
                style={{
                  ...styles.analyticsGrid,
                  ...(isMobileView ? styles.analyticsGridMobile : {}),
                }}
              >
                <div className="pb-surface-card" style={styles.sectionCard}>
                  <div
                    style={{
                      ...styles.analyticsHeader,
                      ...(isMobileView ? styles.analyticsHeaderMobile : {}),
                    }}
                  >
                    <div>
                      <span className="pb-kicker">Anàlisi</span>
                      <h3 style={styles.analyticsTitle}>Reserves per pista</h3>
                    </div>
                    <span className="pb-badge-pill pb-badge-pill--blue">
                      {statsByCourt.length} pistes
                    </span>
                  </div>

                  {statsByCourt.length > 0 ? (
                    <div style={styles.metricList}>
                      {statsByCourt.map((item) => {
                        const width =
                          topCourtValue > 0
                            ? `${(item.value / topCourtValue) * 100}%`
                            : "0%";

                        return (
                          <div key={item.id} style={styles.metricItem}>
                            <div
                              style={{
                                ...styles.metricTopRow,
                                ...(isMobileView ? styles.metricTopRowMobile : {}),
                              }}
                            >
                              <span style={styles.metricLabel}>{item.label}</span>
                              <span style={styles.metricValue}>{item.value}</span>
                            </div>

                            <div style={styles.metricBarTrack}>
                              <div style={{ ...styles.metricBarFill, width }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p style={styles.emptyAnalyticsText}>
                      Encara no hi ha dades disponibles per pista.
                    </p>
                  )}
                </div>

                <div className="pb-surface-card" style={styles.sectionCard}>
                  <div
                    style={{
                      ...styles.analyticsHeader,
                      ...(isMobileView ? styles.analyticsHeaderMobile : {}),
                    }}
                  >
                    <div>
                      <span className="pb-kicker">Demanda</span>
                      <h3 style={styles.analyticsTitle}>Franges més reservades</h3>
                    </div>
                    <span className="pb-badge-pill pb-badge-pill--green">
                      {statsByTimeslot.length} franges
                    </span>
                  </div>

                  {statsByTimeslot.length > 0 ? (
                    <div style={styles.metricList}>
                      {statsByTimeslot.map((item) => {
                        const width =
                          topTimeslotValue > 0
                            ? `${(item.value / topTimeslotValue) * 100}%`
                            : "0%";

                        return (
                          <div key={item.id} style={styles.metricItem}>
                            <div
                              style={{
                                ...styles.metricTopRow,
                                ...(isMobileView ? styles.metricTopRowMobile : {}),
                              }}
                            >
                              <span style={styles.metricLabel}>{item.label}</span>
                              <span style={styles.metricValue}>{item.value}</span>
                            </div>

                            <div style={styles.metricBarTrack}>
                              <div style={{ ...styles.metricBarFillSecondary, width }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p style={styles.emptyAnalyticsText}>
                      Encara no hi ha dades disponibles per franja.
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className="fade-in-up delay-3" style={styles.section}>
              <div
                style={{
                  ...styles.analyticsGrid,
                  ...(isMobileView ? styles.analyticsGridMobile : {}),
                }}
              >
                <div className="pb-surface-card" style={styles.sectionCard}>
                  <div
                    style={{
                      ...styles.analyticsHeader,
                      ...(isMobileView ? styles.analyticsHeaderMobile : {}),
                    }}
                  >
                    <div>
                      <span className="pb-kicker">Tendència</span>
                      <h3 style={styles.analyticsTitle}>Activitat per dates</h3>
                    </div>
                    <span className="pb-badge-pill pb-badge-pill--amber">
                      {recentDateStats.length} registres
                    </span>
                  </div>

                  {recentDateStats.length > 0 ? (
                    <div style={styles.metricList}>
                      {recentDateStats.map((item) => {
                        const width =
                          topDateValue > 0
                            ? `${(item.value / topDateValue) * 100}%`
                            : "0%";

                        return (
                          <div key={item.id} style={styles.metricItem}>
                            <div
                              style={{
                                ...styles.metricTopRow,
                                ...(isMobileView ? styles.metricTopRowMobile : {}),
                              }}
                            >
                              <span style={styles.metricLabel}>{item.label}</span>
                              <span style={styles.metricValue}>{item.value}</span>
                            </div>

                            <div style={styles.metricBarTrack}>
                              <div style={{ ...styles.metricBarFillTertiary, width }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p style={styles.emptyAnalyticsText}>
                      Encara no hi ha dades disponibles per dates.
                    </p>
                  )}
                </div>

                <div className="pb-surface-card" style={styles.sectionCard}>
                  <div
                    style={{
                      ...styles.analyticsHeader,
                      ...(isMobileView ? styles.analyticsHeaderMobile : {}),
                    }}
                  >
                    <div>
                      <span className="pb-kicker">Traçabilitat</span>
                      <h3 style={styles.analyticsTitle}>Activitat recent admin</h3>
                    </div>
                    <span className="pb-badge-pill pb-badge-pill--rose">
                      {adminLogs.length} accions
                    </span>
                  </div>

                  {adminLogs.length > 0 ? (
                    <div style={styles.logsList}>
                      {adminLogs.map((log) => (
                        <article key={log.id} style={styles.logItem}>
                          <div
                            style={{
                              ...styles.logTopRow,
                              ...(isMobileView ? styles.logTopRowMobile : {}),
                            }}
                          >
                            <span
                              className="pb-badge-pill pb-badge-pill--blue"
                              style={styles.logActionBadge}
                            >
                              {formatActionLabel(log.action)}
                            </span>
                            <span style={styles.logDate}>
                              {formatDateTime(log.createdAt)}
                            </span>
                          </div>

                          <p style={styles.logAdmin}>
                            {log.adminName}
                            {log.adminId ? ` · ID ${log.adminId}` : ""}
                          </p>

                          <p style={styles.logDetails}>
                            {log.details || "Sense detalls addicionals."}
                          </p>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p style={styles.emptyAnalyticsText}>
                      Encara no hi ha activitat recent registrada.
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section
              ref={editSectionRef}
              className="fade-in-up delay-1"
              style={styles.section}
            >
              <div
                style={{
                  ...styles.sectionHeader,
                  ...(isMobileView ? styles.sectionHeaderMobile : {}),
                }}
              >
                <div>
                  <span className="pb-kicker">
                    {editingCourtId ? "Edició" : "Creació"}
                  </span>
                  <h2
                    className="pb-panel-title"
                    style={isMobileView ? styles.sectionTitleMobile : undefined}
                  >
                    {editingCourtId ? "Editar pista" : "Crear nova pista"}
                  </h2>
                  <p className="pb-panel-text">
                    {editingCourtId
                      ? "Modifica les dades de la pista seleccionada i guarda els canvis."
                      : "Afegeix una pista nova al sistema i defineix-ne les dades principals."}
                  </p>
                </div>

                {editingCourtId && (
                  <span className="pb-badge-pill pb-badge-pill--amber">Mode edició</span>
                )}
              </div>

              <div className="pb-surface-card" style={styles.sectionCard}>
                <CreateCourtForm
                  newCourt={newCourt}
                  setNewCourt={setNewCourt}
                  onSubmit={handleCreateOrUpdateCourt}
                  creatingCourt={creatingCourt}
                  isEditing={!!editingCourtId}
                  onCancelEdit={resetCourtForm}
                />
              </div>
            </section>

            <section
              ref={reservationsSectionRef}
              className="fade-in-up delay-2"
              style={styles.section}
            >
              <div
                style={{
                  ...styles.sectionHeader,
                  ...(isMobileView ? styles.sectionHeaderMobile : {}),
                }}
              >
                <div>
                  <span className="pb-kicker">Control operatiu</span>
                  <h2
                    className="pb-panel-title"
                    style={isMobileView ? styles.sectionTitleMobile : undefined}
                  >
                    Reserves del sistema
                  </h2>
                  <p className="pb-panel-text">
                    Consulta, filtra i revisa totes les reserves registrades.
                  </p>
                </div>

                <span className="pb-badge-pill pb-badge-pill--blue">
                  {reservations.length} reserves
                </span>
              </div>

              <div
                className="pb-surface-card"
                style={{
                  ...styles.sectionCard,
                  ...(isMobileView ? styles.sectionCardMobile : {}),
                }}
              >
                <AdminReservationsTable reservations={reservations} />
              </div>
            </section>

            <section
              ref={courtsSectionRef}
              className="fade-in-up delay-3"
              style={styles.section}
            >
              <div
                style={{
                  ...styles.sectionHeader,
                  ...(isMobileView ? styles.sectionHeaderMobile : {}),
                }}
              >
                <div>
                  <span className="pb-kicker">Gestió d’espais</span>
                  <h2
                    className="pb-panel-title"
                    style={isMobileView ? styles.sectionTitleMobile : undefined}
                  >
                    Pistes
                  </h2>
                  <p className="pb-panel-text">
                    Cerca, filtra i gestiona les pistes existents amb més rapidesa.
                  </p>
                </div>

                <span className="pb-badge-pill pb-badge-pill--green">
                  {filteredCourts.length} visibles
                </span>
              </div>

              <div className="pb-surface-card" style={styles.sectionCard}>
                <div
                  style={{
                    ...styles.courtToolsGrid,
                    ...(isMobileView ? styles.courtToolsGridMobile : {}),
                  }}
                >
                  <div style={styles.courtFilterField}>
                    <label htmlFor="courtSearch" style={styles.filterLabel}>
                      Cercar pista
                    </label>
                    <input
                      id="courtSearch"
                      type="text"
                      value={courtSearch}
                      onChange={(e) => setCourtSearch(e.target.value)}
                      placeholder="Nom o descripció..."
                      className="pb-input"
                    />
                  </div>

                  <div style={styles.courtFilterField}>
                    <label htmlFor="courtStatusFilter" style={styles.filterLabel}>
                      Estat
                    </label>
                    <select
                      id="courtStatusFilter"
                      value={courtStatusFilter}
                      onChange={(e) => setCourtStatusFilter(e.target.value)}
                      className="pb-input"
                    >
                      <option value="totes">Totes</option>
                      <option value="disponible">Disponibles</option>
                      <option value="manteniment">Manteniment</option>
                    </select>
                  </div>

                  <div style={styles.courtFilterField}>
                    <label htmlFor="courtTypeFilter" style={styles.filterLabel}>
                      Tipus
                    </label>
                    <select
                      id="courtTypeFilter"
                      value={courtTypeFilter}
                      onChange={(e) => setCourtTypeFilter(e.target.value)}
                      className="pb-input"
                    >
                      <option value="tots">Tots</option>
                      <option value="dobles">Dobles</option>
                      <option value="individual">Individual</option>
                    </select>
                  </div>

                  <div style={styles.courtFilterActions}>
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={resetCourtFilters}
                      style={isMobileView ? styles.fullWidthButton : undefined}
                    >
                      Netejar filtres
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    ...styles.courtQuickStats,
                    ...(isMobileView ? styles.courtQuickStatsMobile : {}),
                  }}
                >
                  <div style={styles.courtQuickStat}>
                    <span style={styles.courtQuickStatLabel}>Mostrades</span>
                    <span style={styles.courtQuickStatValue}>{filteredCourts.length}</span>
                  </div>

                  <div style={styles.courtQuickStat}>
                    <span style={styles.courtQuickStatLabel}>Disponibles</span>
                    <span style={styles.courtQuickStatValue}>{filteredAvailableCourtsCount}</span>
                  </div>

                  <div style={styles.courtQuickStat}>
                    <span style={styles.courtQuickStatLabel}>Manteniment</span>
                    <span style={styles.courtQuickStatValue}>{filteredMaintenanceCourtsCount}</span>
                  </div>
                </div>
              </div>

              {filteredCourts.length > 0 ? (
                <div
                  style={{
                    ...styles.cards,
                    ...(isMobileView ? styles.cardsMobile : {}),
                  }}
                >
                  {filteredCourts.map((court) => (
                    <CourtCard
                      key={court.id}
                      court={court}
                      onEdit={() => handleStartEditCourt(court)}
                      onStartDelete={() => {
                        setConfirmingCourtId(court.id);

                        setTimeout(() => {
                          scrollToCourtCard(court.id);
                        }, 150);
                      }}
                      onAbortDelete={() => setConfirmingCourtId(null)}
                      onDelete={() => handleDeleteCourt(court.id)}
                      confirmingDelete={confirmingCourtId === court.id}
                      isDeleting={deletingCourtId === court.id}
                      isHighlighted={highlightedCourtId === court.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="pb-surface-card" style={styles.emptyFilteredState}>
                  <p style={styles.emptyFilteredTitle}>No hi ha pistes que coincideixin</p>
                  <p style={styles.emptyFilteredText}>
                    Revisa els filtres aplicats o neteja la cerca per tornar a veure
                    totes les pistes.
                  </p>

                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={resetCourtFilters}
                  >
                    Mostrar totes les pistes
                  </button>
                </div>
              )}
            </section>
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
    gridTemplateColumns: "1fr 1fr",
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
  },
  feedbackSection: {
    marginTop: "1.25rem",
    marginBottom: "1.25rem",
  },
  feedbackRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "0.9rem",
    flexWrap: "wrap",
  },
  feedbackRowMobile: {
    flexDirection: "column",
    alignItems: "stretch",
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
  section: {
    marginTop: "2rem",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "1rem",
    flexWrap: "wrap",
  },
  sectionHeaderMobile: {
    alignItems: "stretch",
  },
  sectionTitleMobile: {
    fontSize: "1.55rem",
  },
  fullWidthButton: {
    width: "100%",
  },
  sectionCard: {
    padding: "1.25rem",
  },
  sectionCardMobile: {
    padding: "1rem",
    overflowX: "auto",
  },
  dashboardStatsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "1rem",
  },
  dashboardStatsGridMobile: {
    gridTemplateColumns: "1fr",
    gap: "0.8rem",
  },
  dashboardStatCard: {
    padding: "1.15rem",
  },
  dashboardStatTop: {
    display: "flex",
    alignItems: "center",
    gap: "0.7rem",
  },
  dashboardStatIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.15rem",
    backgroundColor: "rgba(255,255,255,0.75)",
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.45)",
  },
  dashboardStatLabel: {
    color: "#334155",
    fontWeight: "800",
    lineHeight: 1.5,
  },
  dashboardStatValue: {
    display: "block",
    marginTop: "0.7rem",
    fontSize: "1.9rem",
    fontWeight: "800",
    color: "#0f172a",
  },
  dashboardStatValueMobile: {
    fontSize: "1.6rem",
  },
  accentBlue: {
    background: "linear-gradient(180deg, #f8fbff, #eef6ff)",
  },
  accentGreen: {
    background: "linear-gradient(180deg, #f3fff8, #eafcf2)",
  },
  accentRose: {
    background: "linear-gradient(180deg, #fff8fa, #fff1f4)",
  },
  accentIndigo: {
    background: "linear-gradient(180deg, #f8f9ff, #eef2ff)",
  },
  accentEmerald: {
    background: "linear-gradient(180deg, #f4fffb, #eafdf6)",
  },
  accentAmber: {
    background: "linear-gradient(180deg, #fffdf7, #fff7e6)",
  },
  analyticsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "1rem",
    alignItems: "start",
  },
  analyticsGridMobile: {
    gridTemplateColumns: "1fr",
  },
  analyticsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "0.8rem",
    marginBottom: "1rem",
    flexWrap: "wrap",
  },
  analyticsHeaderMobile: {
    alignItems: "flex-start",
  },
  analyticsTitle: {
    margin: 0,
    fontSize: "1.25rem",
    color: "#0f172a",
  },
  insightsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "1rem",
  },
  insightsGridMobile: {
    gridTemplateColumns: "1fr",
    gap: "0.8rem",
  },
  insightCard: {
    padding: "1rem",
  },
  insightLabel: {
    color: "#64748b",
    fontSize: "0.88rem",
    fontWeight: "800",
  },
  insightValue: {
    display: "block",
    marginTop: "0.45rem",
    color: "#0f172a",
    fontWeight: "800",
    lineHeight: 1.55,
  },
  metricList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.95rem",
  },
  metricItem: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  metricTopRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "0.75rem",
    alignItems: "center",
  },
  metricTopRowMobile: {
    alignItems: "flex-start",
    flexDirection: "column",
    gap: "0.25rem",
  },
  metricLabel: {
    color: "#0f172a",
    fontWeight: "700",
    lineHeight: 1.5,
  },
  metricValue: {
    color: "#334155",
    fontWeight: "800",
  },
  metricBarTrack: {
    width: "100%",
    height: "11px",
    background: "#e2e8f0",
    borderRadius: "999px",
    overflow: "hidden",
  },
  metricBarFill: {
    height: "100%",
    background: "linear-gradient(90deg, #2563eb, #1d4ed8)",
    borderRadius: "999px",
  },
  metricBarFillSecondary: {
    height: "100%",
    background: "linear-gradient(90deg, #10b981, #059669)",
    borderRadius: "999px",
  },
  metricBarFillTertiary: {
    height: "100%",
    background: "linear-gradient(90deg, #f59e0b, #d97706)",
    borderRadius: "999px",
  },
  emptyAnalyticsText: {
    margin: 0,
    color: "#64748b",
    lineHeight: 1.7,
  },
  logsList: {
    display: "grid",
    gap: "0.85rem",
  },
  logItem: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  logTopRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "0.8rem",
    alignItems: "center",
    flexWrap: "wrap",
  },
  logTopRowMobile: {
    alignItems: "flex-start",
    flexDirection: "column",
  },
  logActionBadge: {
    minHeight: "unset",
    padding: "0.35rem 0.7rem",
    fontSize: "0.8rem",
  },
  logDate: {
    color: "#64748b",
    fontSize: "0.84rem",
    fontWeight: "700",
  },
  logAdmin: {
    margin: 0,
    color: "#0f172a",
    fontWeight: "800",
  },
  logDetails: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.65,
  },
  courtToolsGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.4fr) repeat(2, minmax(180px, 0.8fr)) auto",
    gap: "0.9rem",
    alignItems: "end",
  },
  courtToolsGridMobile: {
    gridTemplateColumns: "1fr",
  },
  courtFilterField: {
    display: "flex",
    flexDirection: "column",
    gap: "0.45rem",
  },
  filterLabel: {
    fontSize: "0.88rem",
    fontWeight: "800",
    color: "#334155",
  },
  courtFilterActions: {
    display: "flex",
    alignItems: "end",
  },
  courtQuickStats: {
    marginTop: "1rem",
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "0.85rem",
  },
  courtQuickStatsMobile: {
    gridTemplateColumns: "1fr",
  },
  courtQuickStat: {
    borderRadius: "18px",
    padding: "0.95rem 1rem",
    background: "linear-gradient(180deg, #f8fafc, #ffffff)",
    border: "1px solid rgba(148, 163, 184, 0.18)",
  },
  courtQuickStatLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "0.78rem",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    marginBottom: "0.35rem",
  },
  courtQuickStatValue: {
    color: "#0f172a",
    fontSize: "1.3rem",
    fontWeight: "800",
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "1rem",
    marginTop: "1rem",
  },
  cardsMobile: {
    gridTemplateColumns: "1fr",
  },
  emptyFilteredState: {
    marginTop: "1rem",
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.8rem",
    alignItems: "flex-start",
  },
  emptyFilteredTitle: {
    margin: 0,
    color: "#0f172a",
    fontWeight: "800",
    fontSize: "1.05rem",
  },
  emptyFilteredText: {
    margin: 0,
    color: "#64748b",
    lineHeight: 1.65,
  },
};

export default AdminPage;