import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Form from "../../components/form/Form";
import Label from "../../components/form/Label";
import Select from "../../components/form/Select";
import { zodResolver } from '@hookform/resolvers/zod';
import { ContactFormSchema } from "../../schemas/forms";
//import { useAppDispatch } from "../../hooks";
import { useForm } from "react-hook-form";

export default function Contact() {
      let inputClasses = ` h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 `;

    const options = [
        { value: "marketing", label: "Marketing" },
        { value: "template", label: "Template" },
        { value: "development", label: "Development" },
    ];
    const handleSelectChange = (value: string) => {
        console.log("Selected value:", value);
    };
   // const dispatch = useAppDispatch();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ContactFormSchema>({
        resolver: zodResolver(ContactFormSchema),
        defaultValues: {
            name: '',
            email: '',
            subject: '',
            message: '',
        },
    });
    const onSubmit = async (data: ContactFormSchema) => {
        try {
            console.log('Form Data:', data);
            //await dispatch().unwrap();
            reset();
        } catch (err) {
            console.error('Failed to add user:', err);
            // Optionally set an application-level error UI here
        }
    };
    return (
        <>
            <PageMeta title="Contact Us" description="Get in touch with us for any inquiries." />
            <PageBreadcrumb pageTitle="Contact Us" />
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold">Contact Us</h1>
                <p className="mt-4">
                    We are here to help you with any questions or concerns you may have.
                </p>
                <ComponentCard title="Get in Touch" desc="We'd love to hear from you!" >
                    <p className="mt-2">
                        Feel free to reach out to us via email at contact@ourcompany.com or call us at (123) 456-7890. We look forward to hearing from you!
                    </p>
                    <p className="mt-2">
                        Our team is dedicated to providing you with the support you need.
                    </p>
                    <p className="mt-2">
                        Don't hesitate to reach out with any questions or feedback!
                    </p>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-6">
                            <div>
                                <Label htmlFor="input">Name</Label>
                                <input type="text" id="input" {...register('name')}   className={inputClasses}  />
                            </div>
                            <div>
                                <Label htmlFor="inputTwo">Email</Label>
                                <input id="email"  type="email" {...register('email')} placeholder="info@gmail.com" className={inputClasses} />
                                {errors.email && <p className="error">{errors.email.message}</p>}

                            </div>
                            <div>
                                <Label>Select Input</Label>
                                <Select
                                    options={options}
                                    placeholder="Select an option"
                                    onChange={handleSelectChange}
                                    className="dark:bg-dark-900"
                                />
                            </div>
                            <div>
                                <Label>Message</Label>
                                <textarea
                                  
                                    rows={6}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-900"
                                    {...register('message')}    
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <button type="submit" disabled={isSubmitting} className="submit-button">
                                {isSubmitting ? 'Sending…' : 'Send Message'}
                            </button>
                        </div>


                    </Form>
                </ComponentCard>
            </div>
        </>
    );
}

