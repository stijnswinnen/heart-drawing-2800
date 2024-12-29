import { Link, useLocation } from "react-router-dom";

export const Navigation = () => {
  const location = useLocation();
  
  const links = [
    { path: "/", label: "Teken een hart" },
    { path: "/hearts", label: "Designs" },
    { path: "/over", label: "Over 2800.love" },
  ];

  return (
    <nav className="w-full py-4 mb-8">
      <ul className="flex justify-center items-center gap-8 font-['Montserrat_Alternates']">
        {links.map((link) => (
          <li key={link.path}>
            <Link
              to={link.path}
              className={`text-lg hover:opacity-70 transition-opacity ${
                location.pathname === link.path ? "underline" : ""
              }`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};