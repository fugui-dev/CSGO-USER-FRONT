/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      Fontquan: ["Fontquan"],
      ZhenyanGB: ["ZhenyanGB"],
      MicrosoftYaHei: ["Microsoft YaHei"],
      SourceHanSansCN: ["Source Han Sans CN"],
      YouSheBiaoTiHei: ["YouSheBiaoTiHei Regular"],
      REEJI: ["REEJI-PinboGB"],
      HiraginoGB:['Hiragino-sans-gb']
    },
    extend: {
      backgroundImage: {
        "gradient-open-main":
          " linear-gradient(139deg, rgba(255,109,248,0.55) 0%, rgba(64,100,255,0.55) 100%)",
      },
      lineClamp: {
        1: '1',
        2: '2',
        3: '3',
        4: '4',
        5: '5',
        6: '6',
      }
    },
  },
  plugins: [
    // require("@tailwindcss/line-clamp")
  ],
  prefix: "tw-",
};
