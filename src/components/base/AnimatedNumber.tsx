// Tạo file mới, ví dụ: src/components/base/AnimatedNumber.tsx
import { useEffect, useState } from "react";
import { animate, motion } from "framer-motion";

type Props = {
  to: number;
  from?: number;
};

export const AnimatedNumber: React.FC<Props> = ({ to, from = 0 }) => {
  const [displayValue, setDisplayValue] = useState(from);

  useEffect(() => {
    const controls = animate(from, to, {
      duration: 2, // Đếm trong 2 giây
      ease: "easeOut",
      onUpdate(value) {
        setDisplayValue(Math.round(value));
      },
    });
    return () => controls.stop();
  }, [from, to]);

  // Dùng toLocaleString để format số (vd: 15,000)
  return <motion.span>{displayValue.toLocaleString("vi-VN")}</motion.span>;
};