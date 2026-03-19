import { Link, useLocation } from "react-router-dom";
import "./Footer.css";

function Footer() {
  const location = useLocation();

  const scrollToTopSmooth = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleFooterLinkClick = (event, path) => {
    if (location.pathname === path) {
      event.preventDefault();
      scrollToTopSmooth();
    }
  };

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__left">
          <Link
            to="/"
            className="footer__brand-link"
            onClick={(event) => handleFooterLinkClick(event, "/")}
          >
            <span className="footer__brand">PadelBook</span>
          </Link>

          <p className="footer__text">
            Gestió moderna de reserves de pistes de pàdel.
          </p>
        </div>

        <div className="footer__center">
          <Link
            to="/"
            className="footer__link"
            onClick={(event) => handleFooterLinkClick(event, "/")}
          >
            Inici
          </Link>

          <Link
            to="/availability"
            className="footer__link"
            onClick={(event) => handleFooterLinkClick(event, "/availability")}
          >
            Reservar
          </Link>

          <Link
            to="/my-account"
            className="footer__link"
            onClick={(event) => handleFooterLinkClick(event, "/my-account")}
          >
            El meu compte
          </Link>
        </div>

        <div className="footer__right">
          <span className="footer__copy">
            © {new Date().getFullYear()} PadelBook
          </span>
          <span className="footer__meta">Projecte DAW</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;