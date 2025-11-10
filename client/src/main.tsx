import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import '../styles/addGuestForm.css';
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { Provider } from 'react-redux';
import { store } from './store.ts';
import AuthProvider  from ".././src/features/auth/AuthProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AppWrapper>
        <Provider store={store}>
      {/* AuthProvider handles initial auth check */}
      <AuthProvider> 
        <App />
      </AuthProvider>
        </Provider>
      </AppWrapper>
    </ThemeProvider>
  </StrictMode>,
);