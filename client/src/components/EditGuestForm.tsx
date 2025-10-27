import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch } from '../hooks';
import { editGuest } from '../features/guests/guestsSlice';
import { Guest } from '../types/types';
import { GuestEditSchema, GuestEditForm } from '../schemas/forms';

interface EditGuestFormProps {
  guest: Guest;
  onClose: () => void;
}

const EditGuestForm: React.FC<EditGuestFormProps> = ({ guest, onClose }) => {
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GuestEditForm>({
    resolver: zodResolver(GuestEditSchema),
    defaultValues: {
      name: guest.name,
      phoneNumber: guest.phoneNumber,
      email: guest.email ?? '',
      status: guest.status,
    },
  });

  const onSubmit = async (data: GuestEditForm) => {
    try {
      await dispatch(editGuest({ guestId: guest.id, guestData: data })).unwrap();
      onClose();
    } catch (err) {
      console.error('Failed to edit guest:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="edit-form" noValidate>
      <h2>Edit Guest</h2>

      <div>
        <label htmlFor="name">Name</label>
        <input id="name" {...register('name')} />
        {errors.name && <p className="error">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="phoneNumber">Phone Number</label>
        <input id="phoneNumber" {...register('phoneNumber')} />
        {errors.phoneNumber && <p className="error">{errors.phoneNumber.message}</p>}
      </div>

      <div>
        <label htmlFor="email">Email (optional)</label>
        <input id="email" {...register('email')} />
        {errors.email && <p className="error">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="status">Status</label>
        <select id="status" {...register('status')}>
          <option value="PENDING">Pending</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="DECLINED">Declined</option>
        </select>
        {errors.status && <p className="error">{errors.status.message}</p>}
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

export default EditGuestForm;