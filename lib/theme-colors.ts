export type ThemeColor = "blue" | "green" | "purple" | "orange" | "red";

export interface ColorTheme {
  name: string;
  value: ThemeColor;
  light: {
    primary: string;
    primaryForeground: string;
  };
  dark: {
    primary: string;
    primaryForeground: string;
  };
}

export const themeColors: ColorTheme[] = [
  {
    name: "Blue",
    value: "blue",
    light: {
      primary: "221.2 83.2% 53.3%", // Blue
      primaryForeground: "210 40% 98%",
    },
    dark: {
      primary: "217.2 91.2% 59.8%", // Lighter blue for dark mode
      primaryForeground: "222.2 47.4% 11.2%",
    },
  },
  {
    name: "Green",
    value: "green",
    light: {
      primary: "142.1 76.2% 36.3%", // Green
      primaryForeground: "355.7 100% 97.3%",
    },
    dark: {
      primary: "142.1 70.6% 45.3%", // Lighter green for dark mode
      primaryForeground: "144.9 80.4% 10%",
    },
  },
  {
    name: "Purple",
    value: "purple",
    light: {
      primary: "262.1 83.3% 57.8%", // Purple
      primaryForeground: "210 40% 98%",
    },
    dark: {
      primary: "263.4 70% 50.4%", // Lighter purple for dark mode
      primaryForeground: "210 40% 98%",
    },
  },
  {
    name: "Orange",
    value: "orange",
    light: {
      primary: "24.6 95% 53.1%", // Orange
      primaryForeground: "60 9.1% 97.8%",
    },
    dark: {
      primary: "20.5 90.2% 48.2%", // Lighter orange for dark mode
      primaryForeground: "60 9.1% 97.8%",
    },
  },
  {
    name: "Red",
    value: "red",
    light: {
      primary: "0 72.2% 50.6%", // Red
      primaryForeground: "0 85.7% 97.3%",
    },
    dark: {
      primary: "0 62.8% 30.6%", // Darker red for dark mode
      primaryForeground: "0 85.7% 97.3%",
    },
  },
];

export const defaultThemeColor: ThemeColor = "blue";
