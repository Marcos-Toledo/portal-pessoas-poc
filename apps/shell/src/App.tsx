import { Route, Routes } from 'react-router-dom';
import { Spinner } from '@portal/ui';
import { usePortal } from './portal';
import { Layout } from './components/Layout';
import { HomePage } from './components/HomePage';
import { CatalogPage } from './components/CatalogPage';
import { JourneyPage } from './components/JourneyPage';

export function App() {
  const { ready } = usePortal();

  if (!ready) return <Spinner label="Inicializando o Portal Pessoas..." />;

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="catalogo" element={<CatalogPage />} />
        <Route path="jornada/:id" element={<JourneyPage />} />
        <Route path="*" element={<HomePage />} />
      </Route>
    </Routes>
  );
}
