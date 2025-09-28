import React from 'react';
import { Navbar } from './Navbar';
import Hero from './Home/Hero';
/* import Beneficios from './Home/Beneficios.jsx'; */
import Cta from './Home/Cta.jsx';
import Footer from './Home/Footer.jsx';

const Home = () => {
  return (/* 
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 overflow-hidden"> */
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 overflow-hidden">
      {/* Fondo decorativo animado */}
   {/*    <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 lg:w-60 lg:h-60 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 lg:w-60 lg:h-60 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-20 left-20 w-40 h-40 lg:w-60 lg:h-60 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div> */}

      {/* Navbar modular con navegación interna */}
      <Navbar tipo="home" mostrarNavegacionInterna={true} />

      {/* Hero Section con enfoque emocional */}
      <Hero/>


      {/* Beneficios para profesionales */}
{/*       <Beneficios/> */}
      

     

      {/* Call to action final */}
      <Cta/>
      {/* Footer mejorado */}
      <Footer/>
    </div>
  );
};

export default Home; 