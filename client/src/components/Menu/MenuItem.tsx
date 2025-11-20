import React from 'react';
import { MenuItem } from '../../types/types';
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
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from '../../context/SidebarContext';

interface MenuItemProps {
    item: MenuItem;
}

const SidebarMenuItem: React.FC<MenuItemProps> = ({ item }) => {
    //const hasChildren = item.children && item.children.length > 0;
    const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
    const handleSubmenuToggle = (index: number, menuType: string) => {
        // Implement submenu toggle logic here
        console.log(index, menuType);
    }
    const isActive = (url: string) => {
        const location = useLocation();
        return location.pathname === url;
    };
    return (
        <li>
            <Link
                to={item.url}
                className={`menu-item group ${isActive(item.url) ? "menu-item-active" : "menu-item-inactive"
                    }`}
            >
                <span
                    className={`menu-item-icon-size ${isActive(item.url)
                            ? "menu-item-icon-active"
                            : "menu-item-icon-inactive"
                        }`}
                >
                    {item.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{item.name}</span>
                )}
            </Link>

            {item.children && item.children.length && (
                <ul>
                    {item.children.map(child => (
                       <Link
                to={child.url}
                className={`menu-item group ${isActive(child.url) ? "menu-item-active" : "menu-item-inactive"
                    }`}
            >
                            <span
                                className={`menu-item-icon-size`}
                            >
                                {child?.icon}
                            </span>
                            <span className="menu-item-text">{child.name}</span>
                        </Link>)

                    )}
                </ul>
            )}
        </li>

    );
};

export default SidebarMenuItem;