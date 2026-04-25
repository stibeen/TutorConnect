import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import React from "react";
import Hero from "../landing page sections/Hero";
import Feature from "../landing page sections/Feature";
import Subjects from "../landing page sections/Subjects";

const LandingPage = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollToId) {
      const element = document.getElementById(location.state.scrollToId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);
  return (
    <div>
      <section id="get-started">
        <Hero />
      </section>
      <section id="how-it-works">
        <Feature />
      </section>
      <section id="subjects-we-cover">
        <Subjects />
      </section>
    </div>
  );
};

export default LandingPage;
