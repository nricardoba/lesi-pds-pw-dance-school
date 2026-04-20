import '../pagesCss/HomePage.css';
import StatsCards from "../components/statsCards/StatsCards";
import Schedule from "../components/schedule/Schedule";
import TeacherHomePage from "./TeacherHomePage";
import StudentHomePage from "./StudentHomePage";
import { useAuth } from "../context/useAuth";

const HomePage = () => {
  const { role } = useAuth();

  if (role === 'teacher') {
    return <TeacherHomePage />;
  }

  if (role === 'student') {
    return <StudentHomePage />;
  }

  return (
    <div className="dashboard-grid">
      <div className="primary-column">
        <StatsCards />

        <div className="secondary-column">
          <Schedule />
        </div>
      </div>
      
    </div>
  );
};

export default HomePage;
