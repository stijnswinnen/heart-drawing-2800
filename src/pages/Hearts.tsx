import { Navigation } from "@/components/Navigation";
import { RandomApprovedHeart } from "@/components/RandomApprovedHeart";
import { HeartTrail } from "@/components/HeartTrail";
import { Link } from "react-router-dom";

export default function Hearts() {
  return (
    <div className="min-h-screen flex flex-col">
      <HeartTrail />
      <Navigation />
      <div className="container mx-auto px-4 flex-grow flex items-center justify-center pt-4">
        <RandomApprovedHeart />
      </div>
      
      <footer className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-center">
          <Link 
            to="/" 
            className="text-primary hover:text-primary-dark transition-colors underline-offset-4 hover:underline"
          >
            Teken je hart voor Mechelen
          </Link>
          <Link 
            to="/mijn-favoriete-plek" 
            className="text-primary hover:text-primary-dark transition-colors underline-offset-4 hover:underline"
          >
            Vertel over je favoriete plek
          </Link>
        </div>
      </footer>
    </div>
  );
}