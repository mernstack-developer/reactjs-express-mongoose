import React from 'react';
import { MenuItemType } from '../types';

interface MenuItemProps {
  item: MenuItemType;
}

const MenuItem: React.FC<MenuItemProps> = ({ item }) => {
  const hasChildren = item.children && item.children.length > 0;

  return (
    <li>
      <a href={item.url}>{item.icon} {item.name}</a>
      {hasChildren && (
        <ul>
          {item.children.map(child => (
            <MenuItem key={child._id} item={child} />
          ))}
        </ul>
      )}
    </li>
  );
};

export default MenuItem;