/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans JP"', "sans-serif"],
      },
      colors: {
        primary: "#000957", // メインカラー：濃紺
        accent: "#344CB7", // アクセントカラー：青
        sub1: "#577BC1", // サブカラー1：明るい青
        sub2: "#FFEB00", // サブカラー2：黄色
        background: "#FFFFFF",
        text: "#333333",
        border: "#E0E0E0",
        success: "#4CAF50",
        warning: "#FFA726",
        info: "#2196F3",
        error: "#D32F2F",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
