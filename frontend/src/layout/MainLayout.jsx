import { Outlet } from 'react-router-dom'; 
import Sidebar from '../components/sidebar/Sidebar'
import Header from '../components/header/Header';
import './MainLayout.css';



const MainLayout = () => { 
  return (
    <div className="main-layout">
      <Sidebar />
      <main className="main-content">
        <Header />
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;