import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './styles.css';

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

import Agendamentos from './pages/Agendamentos';
import Clientes from './pages/Clientes';
import Colaboradores from './pages/Colaboradores';
import Servicos from './pages/Servicos';
import Horarios from './pages/Horarios';



const AppRoutes = () => {
  return (
    <>
      <Header />
      <div className="container-fluid h-100">
        <div className="row h-100">
            <Router>
          <Sidebar />
          <Routes>
            <Route path="/" exact element={<Agendamentos />} />
            <Route path="/clientes"exact element={<Clientes />} />
            <Route path="/colaboradores"exact element={<Colaboradores />} />
            <Route path="/servicos"exact element={<Servicos />} />
            <Route path="/horarios"exact element={<Horarios />} />

          </Routes>
          </Router>
        </div>
      </div>
      </>
  );
};

export default AppRoutes;