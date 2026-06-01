import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import TeamPage from './pages/TeamPage';
import AthleteDetailPage from './pages/AthleteDetailPage';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="app-shell">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/team/:id" element={<AthleteDetailPage />} />
        </Routes>
      </main>
    </>
  );
}
