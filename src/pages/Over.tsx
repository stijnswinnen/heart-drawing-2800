import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const Over = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const lines = entry.target.querySelectorAll("p");
            lines.forEach((line, index) => {
              setTimeout(() => {
                line.classList.add("opacity-100");
              }, index * 200); // 200ms delay between each line
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen w-full py-12 px-4 md:px-8">
      <div 
        ref={containerRef}
        className="max-w-[1200px] mx-auto md:pl-[20%] text-left"
      >
        <h1 className="font-['Montserrat_Alternates'] text-4xl md:text-[70px] font-light mb-12 opacity-0 transition-opacity duration-500 ease-in">
          Over 2800.love
        </h1>
        
        <div className="space-y-8 font-['Montserrat_Alternates'] text-xl md:text-[70px] font-light">
          <p className="opacity-0 transition-opacity duration-500 ease-in">
            2800.love is een groeiend project dat de liefde voor Mechelen viert – en jij kan meedoen! We combineren nieuwe media, generatieve kunst en jouw creatieve input om onze geliefde stad in de kijker te zetten.
          </p>

          <p className="opacity-0 transition-opacity duration-500 ease-in">
            Ken je de hashtag #2800love al? Die duikt overal in Mechelen op, van slogans tot op fanartikelen. Nu krijgt die hashtag een nieuwe dimensie met dit project. Hoe? Door <em>jouw</em> hart!
          </p>

          <p className="opacity-0 transition-opacity duration-500 ease-in">
            Teken een hart en voeg het toe aan de collectie. We verzamelen 2800 hartjes! Met behulp van animatie en AI brengen we jouw hart later tot leven. Elk hart wordt deel van het steeds veranderende logo van 2800.love, wat elk ontwerp uniek maakt. Zo bouwen we samen aan een visuele ode aan Mechelen.
          </p>

          <p className="opacity-0 transition-opacity duration-500 ease-in">
            2800.love is een initiatief van Mechels fotograaf Stijn Swinnen en wordt onafhankelijk gefinancierd. Het project ontwikkelt zich in verschillende fases over de komende jaren. Het is onze manier om iets terug te geven aan de gemeenschap en onze liefde voor Mechelen te delen.
          </p>

          <p className="opacity-0 transition-opacity duration-500 ease-in">
            Doe mee en teken jouw hart voor Mechelen! <Link to="/" className="underline">Teken hier je hart</Link> en laat je creativiteit de vrije loop. Volg ons ook op Instagram <a href="https://www.instagram.com/2800loves" target="_blank" rel="noopener noreferrer" className="underline">@2800loves</a> om op de hoogte te blijven van de laatste ontwikkelingen.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Over;