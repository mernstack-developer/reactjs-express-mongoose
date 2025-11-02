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
      firstname: '',
      lastname: '',
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
        <label htmlFor="firstname">First Name</label>
        <input id="firstname" {...register('firstname')} />
        {errors.firstname && <p className="error">{errors.firstname.message}</p>}
      </div>
      <div className="form-group">
        <label htmlFor="lastname">Last Name</label>
        <input id="lastname" {...register('lastname')} />
        {errors.lastname && <p className="error">{errors.lastname.message}</p>}
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