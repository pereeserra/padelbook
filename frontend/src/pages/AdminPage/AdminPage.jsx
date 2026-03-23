import { useEffect, useMemo, useRef, useState } from "react";
import api from "../../api/axios";
import CreateCourtForm from "../../components/CreateCourtForm/CreateCourtForm";
import CourtCard from "../../components/CourtCard/CourtCard";
import AdminReservationsTable from "../../components/AdminReservationsTable/AdminReservationsTable";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import {
  scrollToElementWithOffset,
  normalizeCollectionResponse,
} from "../../utils/helpers";
import "./AdminPage.css";

function AdminPage() {
  const emptyCourt = {
    nom_pista: "",
    tipus: "dobles",
    coberta: 0,
    estat: "disponible",
    descripcio: "",
    preu_reserva: "",
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
  const [activeTab, setActiveTab] = useState("dashboard");

  const [newCourt, setNewCourt] = useState(emptyCourt);

  const [courtSearch, setCourtSearch] = useState("");
  const [courtStatusFilter, setCourtStatusFilter] = useState("totes");
  const [courtTypeFilter, setCourtTypeFilter] = useState("tots");

  const [showAllActivity, setShowAllActivity] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scrollToCourtCard = (courtId) => {
    const card = document.getElementById(`court-${courtId}`);
    if (!card) return;

    scrollToElementWithOffset(card, 120);
    setHighlightedCourtId(courtId);

    setTimeout(() => {
      setHighlightedCourtId(null);
    }, 2500);
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
        normalizeOverview(
          overviewRes.data?.data || {},
          reservationsSource,
          courtsSource
        )
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
      setAdminLogs(
        normalizeCollectionResponse(logsRes.data).map(normalizeLogItem)
      );
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

        showFeedbackMessage("La pista s'ha actualitzat correctament.", "success", {
          label: "Veure pista editada",
          onClick: () => scrollToCourtCard(editingCourtId),
        });

        resetCourtForm();
      } else {
        const createResponse = await api.post("/admin/courts", payload);
        const createdCourtId = createResponse?.data?.data?.id || null;

        const refreshedData = await fetchAdminData();
        await fetchDashboardData(refreshedData.reservations, refreshedData.courts);

        if (createdCourtId) {
          showFeedbackMessage("La pista s'ha creat correctament.", "success", {
            label: "Veure pista creada",
            onClick: () => scrollToCourtCard(createdCourtId),
          });
        } else {
          const createdMatches = refreshedData.courts.filter(
            (court) => court.nom_pista === payload.nom_pista
          );

          const createdCourt =
            createdMatches.length > 0
              ? createdMatches[createdMatches.length - 1]
              : null;

          if (createdCourt) {
            showFeedbackMessage("La pista s'ha creat correctament.", "success", {
              label: "Veure pista creada",
              onClick: () => scrollToCourtCard(createdCourt.id),
            });
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
    setActiveTab("courts");
    setEditingCourtId(court.id);
    setNewCourt({
      nom_pista: court.nom_pista || "",
      tipus: court.tipus || "dobles",
      coberta: Number(court.coberta) || 0,
      estat: court.estat || "disponible",
      descripcio: court.descripcio || "",
      preu_reserva: court.preu_reserva || "",
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

      const matchesType = courtTypeFilter === "tots" || type === courtTypeFilter;

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
      accentClass: "admin__accent-blue",
    },
    {
      label: "Reserves actives",
      value: overviewStats.activeReservations ?? activeReservationsCount,
      icon: "✅",
      accentClass: "admin__accent-green",
    },
    {
      label: "Reserves cancel·lades",
      value: overviewStats.cancelledReservations ?? cancelledReservationsCount,
      icon: "🧾",
      accentClass: "admin__accent-rose",
    },
    {
      label: "Pistes totals",
      value: overviewStats.totalCourts ?? courts.length ?? 0,
      icon: "🎾",
      accentClass: "admin__accent-indigo",
    },
    {
      label: "Pistes disponibles",
      value: overviewStats.availableCourts ?? availableCourts.length,
      icon: "🟢",
      accentClass: "admin__accent-emerald",
    },
    {
      label: "Pistes cobertes",
      value: overviewStats.coveredCourts ?? coveredCourts.length,
      icon: "🏟️",
      accentClass: "admin__accent-amber",
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
    <div className="admin__page">
      <div
        className={`admin__container ${
          isMobileView ? "admin__container--mobile" : ""
        }`}
      >
        <section
          className={`fade-in-up admin__hero ${
            isMobileView ? "admin__hero--mobile" : ""
          }`}
        >
          <div
            className={`admin__hero-grid ${
              isMobileView ? "admin__hero-grid--mobile" : ""
            }`}
          >
            <div>
              <span className="pb-chip">Administració</span>

              <h1
                className={`admin__title ${
                  isMobileView ? "admin__title--mobile" : ""
                }`}
              >
                Panell d’administració
              </h1>

              <p className="admin__subtitle">
                Controla pistes, reserves, estadístiques i activitat recent des
                d’un espai més complet, més ordenat i amb millor lectura visual.
              </p>

              <div
                className={`admin__hero-actions ${
                  isMobileView ? "admin__hero-actions--mobile" : ""
                }`}
              >
                <button
                  type="button"
                  className={`btn ${
                    activeTab === "dashboard" ? "btn-primary" : "btn-light"
                  }`}
                  onClick={() => setActiveTab("dashboard")}
                >
                  Dashboard
                </button>

                <button
                  type="button"
                  className={`btn ${
                    activeTab === "courts" ? "btn-primary" : "btn-light"
                  }`}
                  onClick={() => {
                    setActiveTab("courts");
                    setEditingCourtId(null);
                  }}
                >
                  Gestió de pistes
                </button>

                <button
                  type="button"
                  className={`btn ${
                    activeTab === "reservations" ? "btn-primary" : "btn-light"
                  }`}
                  onClick={() => setActiveTab("reservations")}
                >
                  Reserves
                </button>
              </div>
            </div>

            {!error && (
              <div className="admin__hero-panel">
                <span className="admin__hero-panel-label">Resum executiu</span>

                <div className="admin__hero-panel-grid">
                  <div className="admin__hero-panel-card">
                    <span className="admin__hero-panel-card-label">
                      Pistes totals
                    </span>
                    <span className="admin__hero-panel-card-value">
                      {courts.length}
                    </span>
                  </div>

                  <div className="admin__hero-panel-card">
                    <span className="admin__hero-panel-card-label">
                      Disponibles
                    </span>
                    <span className="admin__hero-panel-card-value">
                      {availableCourts.length}
                    </span>
                  </div>

                  <div className="admin__hero-panel-card">
                    <span className="admin__hero-panel-card-label">
                      Reserves
                    </span>
                    <span className="admin__hero-panel-card-value">
                      {reservations.length}
                    </span>
                  </div>

                  <div className="admin__hero-panel-card">
                    <span className="admin__hero-panel-card-label">
                      Cobertes
                    </span>
                    <span className="admin__hero-panel-card-value">
                      {coveredCourts.length}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <div ref={feedbackRef} />

        {feedback && (
          <section className="scale-in admin__feedback-section">
            <div
              className={`pb-feedback ${
                feedbackType === "success"
                  ? "pb-feedback--success"
                  : "pb-feedback--error"
              }`}
            >
              <div
                className={`admin__feedback-row ${
                  isMobileView ? "admin__feedback-row--mobile" : ""
                }`}
              >
                <p className="pb-feedback__text">{feedback}</p>

                {feedbackAction && (
                  <button
                    type="button"
                    className="btn btn-light btn-sm"
                    onClick={feedbackAction.onClick}
                  >
                    {feedbackAction.label}
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {loadingDashboard && (
          <section className="scale-in admin__feedback-section">
            <div className="pb-feedback pb-feedback--info">
              <p className="pb-feedback__text">
                Actualitzant dashboard administratiu...
              </p>
            </div>
          </section>
        )}

        {error && (
          <section className="scale-in admin__feedback-section">
            <div className="pb-feedback pb-feedback--error admin__error-wrapper">
              <p className="admin__error-title">
                No s'han pogut carregar les dades d'administració
              </p>
              <p className="admin__error-text">{error}</p>

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
            {activeTab === "dashboard" && (
              <>
                <section
                  ref={dashboardSectionRef}
                  className="fade-in-up delay-1 admin__section"
                >
                  <div
                    className={`admin__section-header ${
                      isMobileView ? "admin__section-header--mobile" : ""
                    }`}
                  >
                    <div>
                      <span className="pb-kicker">Visió general</span>
                      <h2
                        className={`pb-panel-title ${
                          isMobileView ? "admin__section-title--mobile" : ""
                        }`}
                      >
                        Dashboard administratiu
                      </h2>
                      <p className="pb-panel-text">
                        Visió ràpida de l’estat del sistema, volum de reserves i
                        pistes.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={() => fetchDashboardData()}
                    >
                      Actualitzar dashboard
                    </button>
                  </div>

                  <div
                    className={`admin__dashboard-stats-grid ${
                      isMobileView ? "admin__dashboard-stats-grid--mobile" : ""
                    }`}
                  >
                    {dashboardCards.map((card) => (
                      <article
                        key={card.label}
                        className={`pb-surface-card admin__dashboard-stat-card ${card.accentClass}`}
                      >
                        <div className="admin__dashboard-stat-top">
                          <span className="admin__dashboard-stat-icon">
                            {card.icon}
                          </span>
                          <span className="admin__dashboard-stat-label">
                            {card.label}
                          </span>
                        </div>

                        <span
                          className={`admin__dashboard-stat-value ${
                            isMobileView
                              ? "admin__dashboard-stat-value--mobile"
                              : ""
                          }`}
                        >
                          {card.value}
                        </span>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="fade-in-up delay-2 admin__section">
                  <div className="pb-surface-card admin__section-card">
                    <div
                      className={`admin__analytics-header ${
                        isMobileView ? "admin__analytics-header--mobile" : ""
                      }`}
                    >
                      <div>
                        <span className="pb-kicker">Resum ràpid</span>
                        <h3 className="admin__analytics-title">Insights clau</h3>
                      </div>
                      <span className="pb-badge-pill pb-badge-pill--blue">
                        Executiu
                      </span>
                    </div>

                    <div
                      className={`admin__insights-grid ${
                        isMobileView ? "admin__insights-grid--mobile" : ""
                      }`}
                    >
                      {quickInsights.map((insight) => (
                        <article
                          className="pb-surface-card admin__insight-card"
                          key={insight.label}
                        >
                          <span className="admin__insight-label">
                            {insight.label}
                          </span>
                          <span className="admin__insight-value">
                            {insight.value}
                          </span>
                        </article>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="fade-in-up delay-2 admin__section">
                  <div
                    className={`admin__analytics-grid ${
                      isMobileView ? "admin__analytics-grid--mobile" : ""
                    }`}
                  >
                    <div className="pb-surface-card admin__section-card">
                      <div
                        className={`admin__analytics-header ${
                          isMobileView ? "admin__analytics-header--mobile" : ""
                        }`}
                      >
                        <div>
                          <span className="pb-kicker">Anàlisi</span>
                          <h3 className="admin__analytics-title">
                            Reserves per pista
                          </h3>
                        </div>
                        <span className="pb-badge-pill pb-badge-pill--blue">
                          {statsByCourt.length} pistes
                        </span>
                      </div>

                      {statsByCourt.length > 0 ? (
                        <div className="admin__metric-list">
                          {statsByCourt.map((item) => {
                            const width =
                              topCourtValue > 0
                                ? `${(item.value / topCourtValue) * 100}%`
                                : "0%";

                            return (
                              <div key={item.id} className="admin__metric-item">
                                <div
                                  className={`admin__metric-top-row ${
                                    isMobileView
                                      ? "admin__metric-top-row--mobile"
                                      : ""
                                  }`}
                                >
                                  <span className="admin__metric-label">
                                    {item.label}
                                  </span>
                                  <span className="admin__metric-value">
                                    {item.value}
                                  </span>
                                </div>

                                <div className="admin__metric-bar-track">
                                  <div
                                    className="admin__metric-bar-fill"
                                    style={{ width }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="admin__empty-analytics-text">
                          Encara no hi ha dades disponibles per pista.
                        </p>
                      )}
                    </div>

                    <div className="pb-surface-card admin__section-card">
                      <div
                        className={`admin__analytics-header ${
                          isMobileView ? "admin__analytics-header--mobile" : ""
                        }`}
                      >
                        <div>
                          <span className="pb-kicker">Demanda</span>
                          <h3 className="admin__analytics-title">
                            Franges més reservades
                          </h3>
                        </div>
                        <span className="pb-badge-pill pb-badge-pill--green">
                          {statsByTimeslot.length} franges
                        </span>
                      </div>

                      {statsByTimeslot.length > 0 ? (
                        <div className="admin__metric-list">
                          {statsByTimeslot.map((item) => {
                            const width =
                              topTimeslotValue > 0
                                ? `${(item.value / topTimeslotValue) * 100}%`
                                : "0%";

                            return (
                              <div key={item.id} className="admin__metric-item">
                                <div
                                  className={`admin__metric-top-row ${
                                    isMobileView
                                      ? "admin__metric-top-row--mobile"
                                      : ""
                                  }`}
                                >
                                  <span className="admin__metric-label">
                                    {item.label}
                                  </span>
                                  <span className="admin__metric-value">
                                    {item.value}
                                  </span>
                                </div>

                                <div className="admin__metric-bar-track">
                                  <div
                                    className="admin__metric-bar-fill--secondary"
                                    style={{ width }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="admin__empty-analytics-text">
                          Encara no hi ha dades disponibles per franja.
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                <section className="fade-in-up delay-3 admin__section">
                  <div
                    className={`admin__analytics-grid ${
                      isMobileView ? "admin__analytics-grid--mobile" : ""
                    }`}
                  >
                    <div className="pb-surface-card admin__section-card">
                      <div
                        className={`admin__analytics-header ${
                          isMobileView ? "admin__analytics-header--mobile" : ""
                        }`}
                      >
                        <div>
                          <span className="pb-kicker">Tendència</span>
                          <h3 className="admin__analytics-title">
                            Activitat per dates
                          </h3>
                        </div>
                        <span className="pb-badge-pill pb-badge-pill--amber">
                          {recentDateStats.length} registres
                        </span>
                      </div>

                      {recentDateStats.length > 0 ? (
                        <div className="admin__metric-list">
                          {recentDateStats.map((item) => {
                            const width =
                              topDateValue > 0
                                ? `${(item.value / topDateValue) * 100}%`
                                : "0%";

                            return (
                              <div key={item.id} className="admin__metric-item">
                                <div
                                  className={`admin__metric-top-row ${
                                    isMobileView
                                      ? "admin__metric-top-row--mobile"
                                      : ""
                                  }`}
                                >
                                  <span className="admin__metric-label">
                                    {item.label}
                                  </span>
                                  <span className="admin__metric-value">
                                    {item.value}
                                  </span>
                                </div>

                                <div className="admin__metric-bar-track">
                                  <div
                                    className="admin__metric-bar-fill--tertiary"
                                    style={{ width }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="admin__empty-analytics-text">
                          Encara no hi ha dades disponibles per dates.
                        </p>
                      )}
                    </div>

                    <div className="pb-surface-card admin__section-card">
                      <div
                        className={`admin__analytics-header ${
                          isMobileView ? "admin__analytics-header--mobile" : ""
                        }`}
                      >
                        <div>
                          <span className="pb-kicker">Traçabilitat</span>
                          <h3 className="admin__analytics-title">
                            Activitat recent admin
                          </h3>
                        </div>

                        <span className="pb-badge-pill pb-badge-pill--rose">
                          {adminLogs.length} accions
                        </span>
                      </div>

                      {adminLogs.length > 0 ? (
                        <>
                          <div className="admin__logs-list admin__logs-list--compact">
                            {(showAllActivity
                              ? adminLogs
                              : adminLogs.slice(0, 4)
                            ).map((log) => (
                              <article
                                key={log.id}
                                className="admin__log-item admin__log-item--compact"
                              >
                                <div
                                  className={`admin__log-top-row ${
                                    isMobileView
                                      ? "admin__log-top-row--mobile"
                                      : ""
                                  }`}
                                >
                                  <span className="pb-badge-pill pb-badge-pill--blue admin__log-action-badge">
                                    {formatActionLabel(log.action)}
                                  </span>

                                  <span className="admin__log-date">
                                    {formatDateTime(log.createdAt)}
                                  </span>
                                </div>

                                <p className="admin__log-admin">
                                  {log.adminName}
                                  {log.adminId ? ` · ID ${log.adminId}` : ""}
                                </p>

                                <p className="admin__log-details">
                                  {log.details ||
                                    "Sense detalls addicionals."}
                                </p>
                              </article>
                            ))}
                          </div>

                          {adminLogs.length > 4 && (
                            <div className="admin__logs-toggle">
                              <button
                                type="button"
                                className="btn btn-light"
                                onClick={() =>
                                  setShowAllActivity((prev) => !prev)
                                }
                              >
                                {showAllActivity
                                  ? "Mostrar menys"
                                  : "Veure totes les accions"}
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="admin__empty-analytics-text">
                          Encara no hi ha activitat recent registrada.
                        </p>
                      )}
                    </div>
                  </div>
                </section>
              </>
            )}

            {activeTab === "reservations" && (
              <section
                ref={reservationsSectionRef}
                className="fade-in-up delay-2 admin__section"
              >
                <div
                  className={`admin__section-header ${
                    isMobileView ? "admin__section-header--mobile" : ""
                  }`}
                >
                  <div>
                    <span className="pb-kicker">Control operatiu</span>
                    <h2
                      className={`pb-panel-title ${
                        isMobileView ? "admin__section-title--mobile" : ""
                      }`}
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
                  className={`pb-surface-card admin__section-card ${
                    isMobileView ? "admin__section-card--mobile" : ""
                  }`}
                >
                  <AdminReservationsTable reservations={reservations} />
                </div>
              </section>
            )}

            {activeTab === "courts" && (
              <>
                <section
                  ref={editSectionRef}
                  className="fade-in-up delay-1 admin__section"
                >
                  <div
                    className={`admin__section-header ${
                      isMobileView ? "admin__section-header--mobile" : ""
                    }`}
                  >
                    <div>
                      <span className="pb-kicker">
                        {editingCourtId ? "Edició" : "Creació"}
                      </span>
                      <h2
                        className={`pb-panel-title ${
                          isMobileView ? "admin__section-title--mobile" : ""
                        }`}
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
                      <span className="pb-badge-pill pb-badge-pill--amber">
                        Mode edició
                      </span>
                    )}
                  </div>

                  <div className="pb-surface-card admin__section-card">
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
                  ref={courtsSectionRef}
                  className="fade-in-up delay-3 admin__section"
                >
                  <div
                    className={`admin__section-header ${
                      isMobileView ? "admin__section-header--mobile" : ""
                    }`}
                  >
                    <div>
                      <span className="pb-kicker">Gestió d’espais</span>
                      <h2
                        className={`pb-panel-title ${
                          isMobileView ? "admin__section-title--mobile" : ""
                        }`}
                      >
                        Pistes
                      </h2>
                      <p className="pb-panel-text">
                        Cerca, filtra i gestiona les pistes existents amb més
                        rapidesa.
                      </p>
                    </div>

                    <span className="pb-badge-pill pb-badge-pill--green">
                      {filteredCourts.length} visibles
                    </span>
                  </div>

                  <div className="pb-surface-card admin__section-card">
                    <div
                      className={`admin__court-tools-grid ${
                        isMobileView ? "admin__court-tools-grid--mobile" : ""
                      }`}
                    >
                      <div className="admin__court-filter-field">
                        <label
                          htmlFor="courtSearch"
                          className="admin__filter-label"
                        >
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

                      <div className="admin__court-filter-field">
                        <label
                          htmlFor="courtStatusFilter"
                          className="admin__filter-label"
                        >
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

                      <div className="admin__court-filter-field">
                        <label
                          htmlFor="courtTypeFilter"
                          className="admin__filter-label"
                        >
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

                      <div className="admin__court-filter-actions">
                        <button
                          type="button"
                          className="btn btn-light"
                          onClick={resetCourtFilters}
                        >
                          Netejar filtres
                        </button>
                      </div>
                    </div>

                    <div
                      className={`admin__court-quick-stats ${
                        isMobileView
                          ? "admin__court-quick-stats--mobile"
                          : ""
                      }`}
                    >
                      <div className="admin__court-quick-stat">
                        <span className="admin__court-quick-stat-label">
                          Mostrades
                        </span>
                        <span className="admin__court-quick-stat-value">
                          {filteredCourts.length}
                        </span>
                      </div>

                      <div className="admin__court-quick-stat">
                        <span className="admin__court-quick-stat-label">
                          Disponibles
                        </span>
                        <span className="admin__court-quick-stat-value">
                          {filteredAvailableCourtsCount}
                        </span>
                      </div>

                      <div className="admin__court-quick-stat">
                        <span className="admin__court-quick-stat-label">
                          Manteniment
                        </span>
                        <span className="admin__court-quick-stat-value">
                          {filteredMaintenanceCourtsCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  {filteredCourts.length > 0 ? (
                    <div
                      className={`admin__cards ${
                        isMobileView ? "admin__cards--mobile" : ""
                      }`}
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
                    <div className="pb-surface-card admin__empty-filtered-state">
                      <p className="admin__empty-filtered-title">
                        No hi ha pistes que coincideixin
                      </p>
                      <p className="admin__empty-filtered-text">
                        Revisa els filtres aplicats o neteja la cerca per tornar
                        a veure totes les pistes.
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
          </>
        )}
      </div>
    </div>
  );
}

export default AdminPage;