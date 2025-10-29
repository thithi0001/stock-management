import { Link, useLocation } from "react-router-dom";
import { ROLES } from "../../constants/roles";
import { useAuth } from "../../context/AuthContext";

const Sidebar = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const links = [
    { name: "Home", path: "/", roles: Object.values(ROLES) },
    { name: "Sản phẩm", path: "/products", roles: Object.values(ROLES) },
    { name: "Kho hàng", path: "/stocks", roles: [ROLES.MANAGER, ROLES.STOREKEEPER] },
    { name: "Phê duyệt đơn xuất", path: "/approval-export", roles: [ROLES.STOREKEEPER] },
    { name: "Nhập hàng", path: "/import", roles: [ROLES.IMPORTSTAFF] },
    { name: "Phê duyệt đơn nhập", path: "/approval-import", roles: [ROLES.STOREKEEPER] },
    { name: "Xuất hàng", path: "/export", roles: [ROLES.EXPORTSTAFF] },
    { name: "Nhà cung cấp", path: "/suppliers", roles: Object.values(ROLES) },
    { name: "Khách hàng", path: "/customers", roles: Object.values(ROLES) },
    {
      name: "Thống kê (đang phát triển)",
      path: "/reports",
      roles: [ROLES.MANAGER, ROLES.STOREKEEPER],
    },
  ];

  return (
    <div className="w-56 bg-white shadow-md flex flex-col">
      <div className="p-4 text-center font-bold text-lg border-b">Kho hàng</div>
      <nav className="flex-1">
        {links
          .filter((l) => l.roles?.includes(user?.role))
          .map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`block px-4 py-2 text-gray-700 hover:bg-blue-100 ${
                pathname === link.path ? "bg-blue-200 font-semibold" : ""
              }`}
            >
              {link.name}
            </Link>
          ))}
      </nav>
    </div>
  );
};

export default Sidebar;
