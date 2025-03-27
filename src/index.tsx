import React from "react";
import ReactDOM from "react-dom/client";
import {
  ChakraProvider,
  extendTheme,
  ColorModeScript,
} from "@chakra-ui/react";
import App from "./App";

// Chakra UI theme config
const config = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  styles: {
    global: {
      "html, body": {
        transition: "background-color 0.3s ease, color 0.3s ease",
        bg: "gray.50",
        color: "gray.800",
        _dark: {
          bg: "gray.900",
          color: "whiteAlpha.900",
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
