import { Link, useLocation } from "react-router-dom";

export const Navigation = () => {
  const location = useLocation();
  
  const links = [
    { path: "/", label: "Teken een hart" },
    { path: "/hearts", label: "Designs" },
    { path: "/over", label: "Over 2800.love" },
  ];

  return (
    <nav className="w-full py-8">
      <ul className="flex justify-center items-center gap-8 font-['Inter']">
        {links.map((link) => (
          <li key={link.path}>
            <Link
              to={link.path}
              className={`text-lg hover:opacity-70 transition-opacity ${
                location.pathname === link.path ? "opacity-70" : "opacity-100"
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