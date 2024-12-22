import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AnimeList from './pages/AnimeList';
import AnimePage from './pages/AnimePage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/list/:type" element={<AnimeList />} />
      <Route path="/anime/:id" element={<AnimePage />} />
    </Routes>
  );
};

export default AppRoutes;
