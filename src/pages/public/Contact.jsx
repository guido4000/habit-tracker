import { useState } from "react";
import { Mail, MapPin, Send } from "lucide-react";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Contact Us
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Have a question? We'd love to hear from you.
          </p>
        </div>

        {submitted ? (
          <div className="mt-12 rounded-lg bg-success-50 p-8 text-center dark:bg-success-900/20">
            <Send className="mx-auto h-12 w-12 text-success-500" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
              Message Sent!
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              We'll get back to you within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-12 space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <Input label="Name" placeholder="Your name" required />
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <Input label="Subject" placeholder="How can we help?" required />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Message
              </label>
              <textarea
                rows={5}
                placeholder="Your message..."
                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Send Message
            </Button>
          </form>
        )}

        <div className="mt-16 grid gap-8 sm:grid-cols-2">
          <div className="flex gap-4">
            <Mail className="h-6 w-6 text-primary-500" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Email
              </h3>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                support@easyhabitpro.com
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <MapPin className="h-6 w-6 text-primary-500" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Location
              </h3>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                San Francisco, CA
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
