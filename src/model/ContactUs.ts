import mongoose, { Document, Schema } from 'mongoose';

interface ContactUsDocument extends Document {
  email: string;
  message: string;
}

const ContactUsSchema = new Schema<ContactUsDocument>({
    email: { type: String, required: true },
    message: { type: String, required: true },
});

const ContactUs = mongoose.model<ContactUsDocument>('ContactUs', ContactUsSchema);

export default ContactUs;
