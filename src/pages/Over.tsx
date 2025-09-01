import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { HeartTrail } from "@/components/HeartTrail";

const AnimatedWord = ({ children }: { children: React.ReactNode }) => (
  <span className="transition-colors duration-2000 hover:text-[#D22B2B]">
    {children}
  </span>
);

const Over = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100");
          }
        });
      },
      { 
        threshold: 0.1,
        rootMargin: "50px"
      }
    );

    const paragraphs = document.querySelectorAll(".fade-in-p");
    paragraphs.forEach((p) => observer.observe(p));

    return () => {
      paragraphs.forEach((p) => observer.unobserve(p));
    };
  }, []);

  return (
    <div className="min-h-screen w-full px-4 md:px-8">
      <HeartTrail />
      <Navigation />
      <div className="max-w-[1200px] mx-auto md:pl-[10%] text-left mt-8">
        <div className="space-y-8 font-['Montserrat_Alternates'] text-xl md:text-[50px] font-normal md:leading-[4rem] leading-8">
          <p className="opacity-0 transition-opacity duration-1000 ease-in fade-in-p">
            2800.<AnimatedWord>love</AnimatedWord> is een groeiend project dat de <AnimatedWord>liefde</AnimatedWord> voor Mechelen viert – en jij kan meedoen!
          </p>

          <p className="opacity-0 transition-opacity duration-1000 ease-in fade-in-p">
            Met dit initiatief zetten we de fijnste plekken in de stad Mechelen op een positieve manier in de kijker.
          </p>

          <p className="opacity-0 transition-opacity duration-1000 ease-in fade-in-p">
            Ken je de hashtag #<AnimatedWord>2800love</AnimatedWord> al? Die duikt overal in Mechelen op, van slogans tot op fanartikelen. Nu krijgt die hashtag een nieuwe dimensie met dit project.
          </p>

          <p className="opacity-0 transition-opacity duration-1000 ease-in fade-in-p">
            Hoe? Door <em>jouw</em> <AnimatedWord>hart</AnimatedWord>!
          </p>

          <p className="opacity-0 transition-opacity duration-1000 ease-in fade-in-p">
            <Link to="/" className="underline hover:opacity-70 transition-opacity">Teken een <AnimatedWord>hart</AnimatedWord></Link> en voeg het toe aan de collectie. Zo willen we 2800 unieke hartjes verzamelen. Met behulp van animatie en AI brengen we jouw <AnimatedWord>hart</AnimatedWord> later tot leven.
          </p>

          <p className="opacity-0 transition-opacity duration-1000 ease-in fade-in-p">
            Elk <AnimatedWord>hart</AnimatedWord> wordt deel van het steeds veranderende logo van 2800.<AnimatedWord>love</AnimatedWord>, wat elk ontwerp uniek maakt. Zo bouwen we samen aan een visuele ode aan Mechelen.
          </p>

          <p className="opacity-0 transition-opacity duration-1000 ease-in fade-in-p">
            We zoeken ook naar jouw <AnimatedWord>liefde</AnimatedWord>splek in Mechelen om te genieten, te chillen, te rusten, <AnimatedWord>lief</AnimatedWord> te hebben, <AnimatedWord>geliefd</AnimatedWord> te worden. <Link to="/mijn-favoriete-plek" className="underline hover:opacity-70 transition-opacity">Deel jouw plek</Link> en inspireer anderen.
          </p>

          <p className="opacity-0 transition-opacity duration-1000 ease-in fade-in-p">
            2800.<AnimatedWord>love</AnimatedWord> is een initiatief van Mechels fotograaf <a href="https://www.stijnswinnen.be" target="_blank" className="underline">Stijn Swinnen</a> en wordt onafhankelijk gefinancierd. Het project ontwikkelt zich in verschillende fases over de komende jaren.
          </p>


          <p className="opacity-0 transition-opacity duration-1000 ease-in fade-in-p">
            <Link to="/" className="underline">Doe mee en teken jouw <AnimatedWord>hart</AnimatedWord></Link> voor Mechelen! Volg dit project op Instagram <a href="https://www.instagram.com/2800loves" target="_blank" rel="noopener noreferrer" className="underline">@2800loves</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Over;
