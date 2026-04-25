import { useLocation } from "react-router-dom";
import NavbarLanding from "../components/NavbarLanding";
import NavbarDefault from "../components/NavbarDefault";

const MainLayout = ({ children }) => {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <>
      {/* {isLanding ? <NavbarLanding /> : <NavbarDefault />} */}
      <NavbarLanding/>
      <div className="pt-10 min-h-screen bg-gray-100 font-roboto">
        {children}
      </div>
    </>
  );
};

export default MainLayout;
