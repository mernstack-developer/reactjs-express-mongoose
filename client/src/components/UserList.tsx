import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { fetchUsers, deleteUser } from '../features/users/usersSlice';
import EditUserForm from './EditUserForm';
import { User } from '../types/types';
//import ComponentCard from './common/ComponentCard';
//import BasicTableOne from './tables/BasicTables/BasicTableOne';
import { Table, TableBody, TableCell, TableHeader, TableRow } from './ui/table';
import ComponentCard from './common/ComponentCard';

const UserList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: users, loading, error } = useAppSelector(state => state.users);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleEdit = (user: User) => {
    setEditingUser(user);
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await dispatch(deleteUser(userId)).unwrap();
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="user-list">
     
      {editingUser && (
        <div className="modal">
          <EditUserForm
            user={editingUser}
            onClose={() => setEditingUser(null)}
          />
        </div>
      )}
 <ComponentCard title="Users List">
      <Table>
        {/* Table Header */}
        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
          <TableRow>
            <TableCell
              isHeader
              className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              User
            </TableCell>
            
            <TableCell
              isHeader
              className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              Phone
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              Email
            </TableCell>
            <TableCell
              isHeader
              className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              Role
            </TableCell>
            <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Bio
              </TableCell>
            <TableCell
              isHeader
              className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
            >
              
              Action
            </TableCell>
          </TableRow>
        </TableHeader>
            {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">

        {users.map(user => (
           <TableRow key={user._id}>
             <TableCell className="px-5 py-3 text-gray-500 dark:text-gray-400">
               {user.firstname} {user.lastname}
             </TableCell>
             <TableCell className="px-5 py-3 text-gray-500 dark:text-gray-400">
              {user.phone || 'N/A'}
              </TableCell>
             <TableCell className="px-5 py-3 text-gray-500 dark:text-gray-400">
               {user.email}
             </TableCell>
             <TableCell className="px-5 py-3 text-gray-500 dark:text-gray-400">
               {user.role}
             </TableCell>
             <TableCell className="px-5 py-3 text-gray-500 dark:text-gray-400">
              {user.bio || 'N/A'}
             </TableCell>
             <TableCell className="px-5 py-3 text-gray-500 dark:text-gray-400">
               <button onClick={() => handleEdit(user)}>Edit</button>
               <button
                 onClick={() => handleDelete(user._id)}
                 className="delete-button"
               >
                 Delete
               </button>
             </TableCell>
           </TableRow>
        ))}
            
      </TableBody>
      </Table>
      </ComponentCard>
    </div>
  );
};

export default UserList;