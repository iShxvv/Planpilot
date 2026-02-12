import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from "./pages/LandingPage.tsx";
import FormPage from "./pages/FormPage.tsx";
import PlanPage from "./pages/PlanPage.tsx";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/form" element={<FormPage />} />
        <Route path="/plan/:id" element={<PlanPage />} />
      </Routes>
    </Router>
  );
}
