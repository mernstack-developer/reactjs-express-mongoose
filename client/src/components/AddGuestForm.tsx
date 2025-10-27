import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch } from '../hooks';
import { addGuest } from '../features/guests/guestsSlice';
import { GuestCreateSchema, GuestCreateForm } from '../schemas/forms';

const AddGuestForm: React.FC = () => {
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GuestCreateForm>({
    resolver: zodResolver(GuestCreateSchema),
    defaultValues: {
      name: '',
      phoneNumber: '',
      email: '',
      status: 'PENDING',
    },
  });

  const onSubmit = async (data: GuestCreateForm) => {
    try {
      // ensure status exists (schema marks it optional)
      const payload = { ...data, status: data.status ?? 'PENDING' } as unknown;
      await dispatch(addGuest(payload as any)).unwrap();
      reset();
    } catch (err) {
      console.error('Failed to add guest:', err);
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
        <label htmlFor="phoneNumber">Phone Number</label>
        <input id="phoneNumber" {...register('phoneNumber')} />
        {errors.phoneNumber && <p className="error">{errors.phoneNumber.message}</p>}
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

export default AddGuestForm;