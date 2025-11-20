import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

// Assume these icons are imported from an icon library
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
  UserIcon
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";
import { fetchMenuItems } from "../features/menu/menuSlice";
import { MenuItem } from "../types/types";
import { RootState } from "../store";

interface DynamicNavItem {
  _id: string;
  name: string;
  url?: string;
  icon?: string;
  parent?: string | null;
  children?: DynamicNavItem[];
  isActive?: boolean;
  order: number;
}

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state for menu items
  const { menuItems, loading } = useSelector((state: RootState) => state.menu);
  
  const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(new Set());
  const [subMenuHeights, setSubMenuHeights] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Memoized convert function to prevent infinite re-renders
  const convertToNestedMenu = useCallback((items: MenuItem[]): DynamicNavItem[] => {
    const menuMap: Record<string, DynamicNavItem> = {};
    const rootItems: DynamicNavItem[] = [];
    
    // First pass: create all menu items
    items.forEach(item => {
      menuMap[item._id] = {
        ...item,
        children: []
      };
    });
    
    // Second pass: build parent-child relationships
    items.forEach(item => {
      if (item.parent) {
        if (menuMap[item.parent]) {
          menuMap[item.parent].children!.push(menuMap[item._id]);
        }
      } else {
        rootItems.push(menuMap[item._id]);
      }
    });
    
    // Sort by order
    const sortItems = (items: DynamicNavItem[]): DynamicNavItem[] => {
      return items
        .sort((a, b) => a.order - b.order)
        .map(item => ({
          ...item,
          children: item.children ? sortItems(item.children) : []
        }));
    };
    
    return sortItems(rootItems);
  }, []);

  // Memoized nested menu items to prevent unnecessary recalculations
  const nestedMenuItems = useMemo(() => convertToNestedMenu(menuItems), [menuItems, convertToNestedMenu]);
  
  // Debug: Check if submenu items exist
  useEffect(() => {
    if (menuItems.length > 0) {
      console.log('Menu items from Redux:', menuItems.length);
      console.log('First few menu items:', menuItems.slice(0, 5));
      
      const nested = convertToNestedMenu(menuItems);
      console.log('Nested menu items:', nested);
      nested.forEach(item => {
        if (item.children && item.children.length > 0) {
          console.log(`Menu item "${item.name}" has ${item.children.length} submenu items:`, item.children.map(c => c.name));
        }
      });
    }
  }, [menuItems, convertToNestedMenu]);
  
  // Memoize isActive function to prevent infinite re-renders
  const isActive = useMemo(() => {
    return (path?: string) => {
      if (!path) return false;
      return location.pathname === path;
    };
  }, [location.pathname]);

  useEffect(() => {
    if (!loading && menuItems.length === 0) {
      // @ts-ignore - Ignore type error for async thunk dispatch
      dispatch(fetchMenuItems());
    }
  }, [dispatch, loading, menuItems.length]); // Stable dependency array
console.log(menuItems);
  useEffect(() => {
    // Auto-expand submenus when active
    const activeSubmenus = new Set<string>();
    
    const findActiveSubmenus = (items: DynamicNavItem[]) => {
      items.forEach(item => {
        if (item.children && item.children.length > 0) {
          // Check if any child is active
          const hasActiveChild = item.children.some(child => isActive(child.url));
          if (hasActiveChild) {
            activeSubmenus.add(item._id);
          }
          findActiveSubmenus(item.children);
        }
      });
    };
    
    findActiveSubmenus(nestedMenuItems);
    setOpenSubmenus(activeSubmenus);
  }, [location.pathname, nestedMenuItems]);

  // Handle submenu toggle
  const handleSubmenuToggle = (menuId: string) => {
    setOpenSubmenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(menuId)) {
        newSet.delete(menuId);
      } else {
        newSet.add(menuId);
      }
      return newSet;
    });
  };

  // Update submenu heights with stable reference
  useEffect(() => {
    const newHeights: Record<string, number> = {};
    openSubmenus.forEach(menuId => {
      const key = `menu-${menuId}`;
      if (subMenuRefs.current[key]) {
        newHeights[key] = subMenuRefs.current[key]?.scrollHeight || 0;
      }
    });
    setSubMenuHeights(prev => {
      // Only update if heights actually changed
      const hasChanges = Object.keys(newHeights).some(key => prev[key] !== newHeights[key]);
      return hasChanges ? { ...prev, ...newHeights } : prev;
    });
  }, [openSubmenus]);

  // Render dynamic menu items
  const renderDynamicMenuItems = (items: DynamicNavItem[]) => (
    <ul className="flex flex-col gap-4">
      {items.map((item) => (
        <li key={item._id}>
          {item.children && item.children.length > 0 ? (
            <button
              onClick={() => handleSubmenuToggle(item._id)}
              className={`menu-item group ${
                openSubmenus.has(item._id)
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size  ${
                  openSubmenus.has(item._id)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {item.icon ? (
                  <span className="text-lg">{item.icon}</span>
                ) : (
                  <ListIcon />
                )}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{item.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenus.has(item._id)
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            item.url && (
              <button
                role="link"
                onClick={() => {
                  console.log('Menu item clicked:', item.name, 'URL:', item.url);
                  if (item.url) {
                    try {
                      navigate(item.url);
                    } catch (error) {
                      console.warn('Navigation failed, falling back to window.location:', error);
                      window.location.href = item.url;
                    }
                  }
                }}
                className={`menu-item group ${
                  isActive(item.url) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(item.url)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {item.icon ? (
                    <span className="text-lg">{item.icon}</span>
                  ) : (
                    <ListIcon />
                  )}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{item.name}</span>
                )}
              </button>
            )
          )}
          {item.children && item.children.length > 0 && (isExpanded || isHovered || isMobileOpen) && (
<div
              ref={(el) => {
                subMenuRefs.current[`menu-${item._id}`] = el;
              }}
              className="overflow-hidden transition-all duration-300 border-l-2 border-blue-200"
              style={{
                height: openSubmenus.has(item._id)
                  ? `${subMenuHeights[`menu-${item._id}`] || 'auto'}` 
                  : "0px",
                opacity: openSubmenus.has(item._id) ? 1 : 0,
                background: openSubmenus.has(item._id) ? '#f8fafc' : 'transparent',
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {item.children.map((subItem) => (
                  <li key={subItem._id}>
                    <button
                      role="link"
                      onClick={() => {
                        console.log('Submenu item clicked:', subItem.name, 'URL:', subItem.url);
                        if (subItem.url) {
                          try {
                            navigate(subItem.url);
                          } catch (error) {
                            console.warn('Submenu navigation failed, falling back to window.location:', error);
                            window.location.href = subItem.url;
                          }
                        }
                      }}
                      className={`menu-dropdown-item ${
                        isActive(subItem.url)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.icon && <span className="mr-2 text-lg">{subItem.icon}</span>}
                      {subItem.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
    );  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">

              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                renderDynamicMenuItems(nestedMenuItems)
              )}

          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
