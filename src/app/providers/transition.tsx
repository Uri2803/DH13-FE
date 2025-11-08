// src/app/providers/transition.tsx
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, Outlet } from "react-router-dom";

const variants = {
  initial: { opacity: 0, y: 8, filter: "blur(4px)" },
  in: { opacity: 1, y: 0, filter: "blur(0px)" },
  out: { opacity: 0, y: -8, filter: "blur(4px)" },
};

export default function PageTransitions() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={location.pathname}
        variants={variants}
        initial="initial"
        animate="in"
        exit="out"
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="container mx-auto p-4"
      >
        <Outlet />
      </motion.main>
    </AnimatePresence>
  );
}
