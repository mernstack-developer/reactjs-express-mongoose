// src/components/Sidebar.tsx
import React, { useEffect } from 'react';
//import { useDispatch, useSelector } from 'react-redux';
import { fetchMenuItems } from '../../features/menu/menuSlice';
import MenuItem from '../Menu/MenuItem';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { RootState } from '../../store';

import './Sidebar.css'; 
const Sidebar: React.FC = () => {
  // Type the dispatch hook for async thunks
  const dispatch = useAppDispatch(); 
  
  // Type the selector result
  const menuItems = useAppSelector((state: RootState) => state.menu.menuItems);
  const menuStatus = useAppSelector((state: RootState) => state.menu.loading ? 'loading' : 'idle');
  useEffect(() => {
    if (menuStatus === 'idle') {
      dispatch(fetchMenuItems());
    }
  }, [ dispatch]);

  if (menuStatus === 'loading') {
    return <aside className="sidebar">Loading Menu...</aside>;
  }


  return (
    <aside className="sidebar">

      <nav>
        <ul>
            
          {menuItems?.map(item => (
            
            <MenuItem key={item._id} item={item} />
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
