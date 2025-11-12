import React from 'react';
import UserPermissionManager from '../components/UserPermissionManager';
import PageBreadCrumb from '../components/common/PageBreadCrumb';

const UserRolesPage: React.FC = () => {
  return (
    <div>
      <PageBreadCrumb pageTitle="User Roles & Permissions" />
      <UserPermissionManager />
    </div>
  );
};

export default UserRolesPage;
