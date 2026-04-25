import "./styles/index.css";
import { BrowserRouter as Router, useRoutes } from "react-router-dom";
import routes from "./Routes";
import { AuthProvider } from "./context/AuthContext";
import VacationModeWrapper from "./components/VacationModeWrapper"; // Add this import

const AppRoutes = () => {
  return useRoutes(routes);
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <VacationModeWrapper> {/* Wrap your app with VacationModeWrapper */}
          <AppRoutes />
        </VacationModeWrapper>
      </AuthProvider>
    </Router>
  );
};

export default App;