import { useEffect, useState } from "react";

function BackToTopButton() {
  const [visible, setVisible] = useState(false);
  const [isGoingUp, setIsGoingUp] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    // Funció per manejar l'esdeveniment de desplaçament
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setVisible(currentScrollY > 320);
      setIsGoingUp(currentScrollY < lastScrollY && currentScrollY > 320);

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Funció per desplaçar-se a la part superior de manera suau
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`backToTop ${visible ? "show" : ""} ${isGoingUp ? "scrolling-up" : ""}`}
      aria-label="Tornar a dalt"
      title="Tornar a dalt"
    >
      ↑
    </button>
  );
}

export default BackToTopButton;