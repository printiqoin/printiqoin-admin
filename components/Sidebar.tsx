"use client";
import { useRouter, usePathname } from "next/navigation";

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (value: boolean) => void;
}

const NAV = [
  {
    id: "categories",
    label: "Categories",
    path: "/admin/categories",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    id: "products",
    label: "Products",
    path: "/admin/products",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    id: "banners",
    label: "Banners",
    path: "/admin/banners",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
      </svg>
    ),
  },
];

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavClick = (path: string) => {
    router.push(path);
    // Close sidebar on mobile after navigation
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/login");
  };

  return (
    <>
      <style>{`
        /* Overlay backdrop */
        .sidebar-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease-out;
          z-index: 40;
        }

        .sidebar-overlay.active {
          opacity: 1;
          pointer-events: auto;
        }

        /* Sidebar container */
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          width: 240px;
          height: 100vh;
          background: #ffffff;
          border-right: 2px solid #D32F2F;
          display: flex;
          flex-direction: column;
          padding: 0;
          transform: translateX(-100%);
          transition: transform 0.3s ease-out;
          z-index: 50;
          pointer-events: auto;
          overflow-y: auto;
          font-family: 'DM Sans', sans-serif;
          box-shadow: 2px 0 8px rgba(255, 140, 0, 0.1);
        }

        .sidebar.open {
          transform: translateX(0);
          pointer-events: auto;
        }

        /* Desktop - sidebar always visible, no positioning needed */
        @media (min-width: 768px) {
          .sidebar {
            position: relative;
            width: 240px;
            height: 100%;
            transform: translateX(0);
            z-index: auto;
            border-right: 2px solid #D32F2F;
            box-shadow: none;
            flex-shrink: 0;
          }

          .sidebar-overlay {
            display: none !important;
          }

          .sidebar-overlay.active {
            display: none !important;
          }
        }

        /* Sidebar header/logo */
        .sidebar-header {
          padding: 20px 16px;
          border-bottom: 2px solid #f3f4f6;
          background: #ffffff;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sidebar-logo-icon {
          width: 48px;
          height: 48px;
          border-radius: 6px;
          flex-shrink: 0;
          overflow: hidden;
          background: #ffffff;
        }

        .sidebar-logo {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #ffffff;
          margin: 0;
          line-height: 1.2;
        }

        .sidebar-logo-accent {
          color: #ffffff;
        }

        .sidebar-subtext {
          font-size: 10px;
          color: #ffffff;
          margin-top: 0;
          font-weight: 500;
          letter-spacing: 0.06em;
          opacity: 0.9;
        }

        /* Navigation section */
        .sidebar-nav {
          margin-top: 0;
          flex: 1;
          overflow-y: auto;
          padding-top: 12px;
        }

        .sidebar-nav-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #CCCCCC;
          padding: 12px 16px 8px;
          text-transform: uppercase;
        }

        /* Navigation items */
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #666666;
          border-left: 3px solid transparent;
          transition: all 0.18s ease;
          user-select: none;
          letter-spacing: 0.01em;
          margin: 0 8px;
          border-radius: 0 6px 6px 0;
        }

        .nav-item:hover {
          color: #D32F2F;
          background: #fff5f0;
          border-left-color: #D32F2F;
        }

        .nav-item.active {
          color: #D32F2F;
          background: #fff5f0;
          border-left-color: #D32F2F;
          font-weight: 600;
        }

        .nav-item.active svg {
          color: #D32F2F;
        }

        .nav-item svg {
          color: currentColor;
          transition: color 0.18s ease;
          flex-shrink: 0;
        }

        /* Sidebar footer */
        .sidebar-footer {
          padding: 16px;
          border-top: 2px solid #D32F2F;
          margin-top: auto;
          background: linear-gradient(135deg, #fff9f5 0%, #f5faf8 100%);
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-bottom: 12px;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #D32F2F, #374151);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
        }

        .user-info {
          min-width: 0;
          flex: 1;
        }

        .user-name {
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-email {
          font-size: 11px;
          color: #999999;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .logout-btn {
          padding: 12px 16px;
          cursor: pointer;
          color: #666666;
          border: none;
          background: transparent;
          border-radius: 6px;
          transition: all 0.2s ease;
          font-size: 14px;
          font-weight: 500;
          width: 100%;
          text-align: left;
          font-family: 'DM Sans', sans-serif;
        }

        .logout-btn:hover {
          color: #D32F2F;
          background: #fff5f0;
        }

        .logout-btn:active {
          background: #ffede0;
        }

        /* Mobile adjustments */
        @media (max-width: 767px) {
          .sidebar {
            width: 220px;
          }

          .sidebar-header {
            padding: 20px 24px 24px;
          }

          .nav-item {
            padding: 10px 24px;
            margin: 0;
            border-radius: 0;
            font-size: 13px;
          }

          .sidebar-footer {
            padding: 16px 24px;
          }
        }

        /* Scrollbar styling */
        .sidebar::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar::-webkit-scrollbar-thumb {
          background: #D32F2F;
          border-radius: 4px;
        }

        .sidebar::-webkit-scrollbar-thumb:hover {
          background: #B71C1C;
        }
      `}</style>

      {/* Overlay - click to close sidebar on mobile */}
      <div
        className={`sidebar-overlay${isSidebarOpen ? " active" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden={!isSidebarOpen}
      />

      {/* Sidebar */}
      <aside className={`sidebar${isSidebarOpen ? " open" : ""}`} role="navigation">
        {/* Logo Section */}
        <div className="sidebar-header" style={{ justifyContent: 'center' }}>
          <div className="sidebar-logo-icon" style={{ width: '64px', height: '64px', background: 'transparent' }}>
            <img src="/images/logo.png" alt="Printiqo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">Management</div>
          {NAV.map((item) => (
            <div
              key={item.id}
              className={`nav-item${pathname === item.path ? " active" : ""}`}
              onClick={() => handleNavClick(item.path)}
              role="menuitem"
              tabIndex={0}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        {/* Footer Section */}
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">A</div>
            <div className="user-info">
              <p className="user-name">Admin</p>
              <p className="user-email">admin@store.com</p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}