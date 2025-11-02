import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch } from '../hooks';
import { editUser } from '../features/users/usersSlice';
import { User } from '../types/types';
import { UserEditSchema, UserEditForm } from '../schemas/forms';

interface EditUserFormProps {
  user: User;
  onClose: () => void;
}

const EditUserForm: React.FC<EditUserFormProps> = ({ user, onClose }) => {
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserEditForm>({
    resolver: zodResolver(UserEditSchema),
    defaultValues: {
      firstname: user.firstname,
      email: user.email,
      role: user.role,
    },
  });

  const onSubmit = async (data: UserEditForm) => {
    try {
      await dispatch(editUser({ userId: user._id, userData: data })).unwrap();
      onClose();
    } catch (err) {
      console.error('Failed to edit user:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="edit-form" noValidate>
      <h2>Edit User</h2>

      <div>
        <label htmlFor="firstname">First Name</label>
        <input id="firstname" {...register('firstname')} />
        {errors.firstname && <p className="error">{errors.firstname.message}</p>}
      </div>
      <div>
        <label htmlFor="lastname">Last Name</label>
        <input id="lastname" {...register('lastname')} />
        {errors.lastname && <p className="error">{errors.lastname.message}</p>}
      </div>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" {...register('email')} />
        {errors.email && <p className="error">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="role">Role</label>
        <select id="role" {...register('role')}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        {errors.role && <p className="error">{errors.role.message}</p>}
      </div>

      <div className="form-actions">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save Changes'}
        </button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EditUserForm;