import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const resetScroll = () => {
      window.scrollTo({
        top: 0,
        behavior: "auto",
      });
    };

    requestAnimationFrame(resetScroll);
  }, [pathname]);

  return null;
}

export default ScrollToTop;