import { Schema, model, Document } from 'mongoose';

// Interface representing a document in MongoDB.
interface INotification extends Document {
  message: string;
  read: boolean;
  recipient_id: string;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>({
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  recipient_id: { type: String, required: true },
}, {
  timestamps: true, // This option automatically manages createdAt and updatedAt fields.
});

const Notification = model<INotification>('Notification', notificationSchema);

export default Notification;
export { INotification };