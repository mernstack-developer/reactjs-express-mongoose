import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch } from '../hooks';
import { addUser } from '../features/users/usersSlice';
import { UserCreateSchema, UserCreateForm } from '../schemas/forms';

const AddUserForm: React.FC = () => {
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserCreateForm>({
    resolver: zodResolver(UserCreateSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'user',
    },
  });

  const onSubmit = async (data: UserCreateForm) => {
    try {
      await dispatch(addUser(data)).unwrap();
      reset();
    } catch (err) {
      console.error('Failed to add user:', err);
      // Optionally set an application-level error UI here
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="add-guest-form" noValidate>
      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input id="name" {...register('name')} />
        {errors.name && <p className="error">{errors.name.message}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="role">Role</label>
        <select id="role" {...register('role')}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        {errors.role && <p className="error">{errors.role.message}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="email">Email (optional)</label>
        <input id="email" {...register('email')} />
        {errors.email && <p className="error">{errors.email.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting} className="submit-button">
        {isSubmitting ? 'Adding…' : 'Add Guest'}
      </button>
    </form>
  );
};

export default AddUserForm;