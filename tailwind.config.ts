import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          "100": "#FF7000",
          "500": "#FFF1E6",
        },
        dark: {
          "100": "#000000",
          "200": "#0F1117",
          "300": "#151821",
          "400": "#212734",
          "500": "#3F4354",
        },
        light: {
          "900": "#FFFFFF",
          "850": "#FDFDFD",
          "800": "#F4F6F8",
          "700": "#DCE3F1",
          "500": "#7B8EC8",
          "400": "#858EAD",
        },
      },
      boxShadow: {
        "light-100":
          "0px 12px 20px 0px rgba(184, 184, 184, 0.03), 0px 6px 12px 0px rgba(184, 184, 184, 0.02), 0px 2px 4px 0px rgba(184, 184, 184, 0.03)",
        "light-200": "10px 10px 20px 0px rgba(218, 213, 213, 0.10)",
        "light-300": "-10px 10px 20px 0px rgba(218, 213, 213, 0.10)",

        // box-shadow: 0px 12px 20px 0px #B8B8B808;
        // box-shadow: 0px 6px 12px 0px #B8B8B805;
        // box-shadow: 0px 2px 4px 0px #B8B8B808;

        // box-shadow: 10px 10px 20px 0px #DAD5D51A;
        // box-shadow: -10px 10px 20px 0px #DAD5D51A;

        "dark-100": "0px 2px 10px 0px rgba(46, 52, 56, 0.10)",
        "dark-200": "2px 0px 20px 0px rgba(39, 36, 36, 0.04)",

        // box-shadow: 0px 2px 10px 0px #2E34381A;
        // box-shadow: 2px 0px 20px 0px #2724241A;

        // below are not added
        // light mode
        // box-shadow: 10px 10px 20px 0px #DAD5D530;
        // box-shadow: 0px 1px 20px 0px #00000021;
        // dark mode
        // box-shadow: 0px 4px 4px 0px #00000040;
      },
      screens: {
        xs: "420px",
      },
    },
  },
  plugins: [],
};
export default config;
