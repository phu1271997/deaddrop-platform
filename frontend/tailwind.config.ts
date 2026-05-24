import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#000000",
          card: "#060606",
          elevated: "#0a0a0a",
          border: "#161616",
        },
        primary: {
          DEFAULT: "#dc2626", // red-600 (danger, whistleblower)
          glow: "rgba(220, 38, 38, 0.15)",
        },
        accent: {
          DEFAULT: "#f59e0b", // amber-500 (alert, pending)
          glow: "rgba(245, 158, 11, 0.15)",
        },
        success: {
          DEFAULT: "#10b981", // emerald-500 (verified)
          glow: "rgba(16, 185, 129, 0.15)",
        },
        cyber: {
          DEFAULT: "#22d3ee", // cyan-400 (encryption, code)
          glow: "rgba(34, 211, 238, 0.2)",
        },
        zinc: {
          950: "#020202",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
        serif: ["var(--font-instrument-serif)", "serif"],
      },
      animation: {
        "glitch-slow": "glitch 4s infinite linear alternate-reverse",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scanline": "scanline 6s linear infinite",
        "terminal-blink": "blink 1s step-end infinite",
      },
      keyframes: {
        glitch: {
          "0%, 100%": { transform: "translate(0)" },
          "20%": { transform: "translate(-1px, 1px)" },
          "40%": { transform: "translate(-1px, -1px)" },
          "60%": { transform: "translate(1px, 1px)" },
          "80%": { transform: "translate(1px, -1px)" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        blink: {
          "from, to": { opacity: "1" },
          "50%": { opacity: "0" },
        }
      },
      boxShadow: {
        "cyber-glow": "0 0 20px rgba(34, 211, 238, 0.15)",
        "red-glow": "0 0 25px rgba(220, 38, 38, 0.2)",
        "amber-glow": "0 0 25px rgba(245, 158, 11, 0.2)",
        "emerald-glow": "0 0 25px rgba(16, 185, 129, 0.2)",
      }
    },
  },
  plugins: [],
};
export default config;
