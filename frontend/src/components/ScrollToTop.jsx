import { useEffect, useState } from "react";

function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isScrollingUp, setIsScrollingUp] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Mostrar si has baixat prou
      if (currentScrollY > 250) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      // Detectar direcció del scroll (extra UX 🔥)
      if (currentScrollY < lastScrollY) {
        setIsScrollingUp(true);
      } else {
        setIsScrollingUp(false);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={handleClick}
      className={`backToTop ${
        isVisible ? "show" : ""
      } ${isScrollingUp ? "scrolling-up" : ""}`}
      aria-label="Tornar amunt"
      title="Tornar a dalt"
    >
      ↑
    </button>
  );
}

export default ScrollToTop;