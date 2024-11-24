'use client'

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { FiSun, FiMoon } from "react-icons/fi";
import styles from "../app/ThemeSwitch.module.css";

export default function ThemeSwitch() {
    const [mounted, setMounted] = useState(false);
    const { setTheme, resolvedTheme } = useTheme();

    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    const isDark = resolvedTheme === "dark";

    return (
        <motion.div
            className={styles.switchContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div
                className={`${styles.switch} ${isDark ? styles.dark : styles.light}`}
                onClick={() => setTheme(isDark ? "light" : "dark")}
                role="button"
                title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
            >
                <motion.div
                    className={styles.toggle}
                    layout
                    transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                    }}
                >
                    {isDark ? (
                        <FiMoon className={styles.icon} />
                    ) : (
                        <FiSun className={styles.icon} />
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
}
