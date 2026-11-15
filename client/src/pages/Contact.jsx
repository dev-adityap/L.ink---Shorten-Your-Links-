import { useState } from 'react';
import { Mail, MapPin } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState('idle');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: 'cec49f64-5058-4be9-b0a1-dfd54d762895',
          name: formData.name,
          email: formData.email,
          message: formData.message,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  const isSubmitting = status === 'submitting';

  return (
    <div className="min-h-screen bg-[#FDFCF7] dark:bg-slate-900 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-gray-900 dark:text-slate-50 mb-4">
            Contact Us
          </h1>
          <p className="font-sans text-sm sm:text-base text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
            Have a question, feedback, or need help? We&apos;d love to hear from you. Reach out and we&apos;ll get back to you as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#F8F7F2] dark:bg-slate-800 border border-[#EBE9E0] dark:border-slate-700 rounded-2xl p-8 shadow-sm">
            <h2 className="font-serif text-2xl font-bold text-gray-900 dark:text-slate-50 mb-4">
              Get in touch
            </h2>
            <p className="font-sans text-sm text-gray-600 dark:text-slate-400 mb-8 leading-relaxed">
              Whether you&apos;re exploring L.ink for personal use or need support with your links, our team is here to help. Drop us a message and we&apos;ll respond promptly.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#FBF9F4] dark:bg-slate-900/50 border border-[#EBE9E0] dark:border-slate-700 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-gray-900 dark:text-slate-50" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-400 mb-1">
                    Email
                  </p>
                  <a
                    href="mailto:support@link.app"
                    className="text-sm font-medium text-gray-900 dark:text-slate-50 hover:underline"
                  >
                    support@link.app
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#FBF9F4] dark:bg-slate-900/50 border border-[#EBE9E0] dark:border-slate-700 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-gray-900 dark:text-slate-50" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-400 mb-1">
                    Location
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-slate-50">
                    San Francisco, CA
                  </p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    Remote-first team
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#F8F7F2] dark:bg-slate-800 border border-[#EBE9E0] dark:border-slate-700 rounded-2xl p-8 shadow-sm">
            <h2 className="font-serif text-2xl font-bold text-gray-900 dark:text-slate-50 mb-6">
              Send a message
            </h2>

            {status === 'success' && (
              <div className="mb-6 p-3 bg-[#ecfdf5] dark:bg-emerald-900/20 border border-[#6ee7b7] dark:border-emerald-800 rounded-lg text-sm text-[#047857] dark:text-emerald-400">
                Thanks for reaching out! We&apos;ll get back to you soon.
              </div>
            )}

            {status === 'error' && (
              <div className="mb-6 p-3 bg-[#fef2f2] dark:bg-red-900/20 border border-[#fca5a5] dark:border-red-800 rounded-lg text-sm text-[#dc2626] dark:text-red-400">
                Something went wrong. Please try again.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="contact-name" className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Name
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 text-sm text-gray-900 dark:text-slate-100 bg-[#FBF9F4] dark:bg-slate-900/50 border border-[#EBE9E0] dark:border-slate-600 rounded-xl focus:outline-none focus:border-gray-900 dark:focus:border-slate-50 focus:ring-1 focus:ring-gray-900 dark:focus:ring-slate-50 placeholder:text-gray-500 dark:placeholder:text-slate-400"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Email
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 text-sm text-gray-900 dark:text-slate-100 bg-[#FBF9F4] dark:bg-slate-900/50 border border-[#EBE9E0] dark:border-slate-600 rounded-xl focus:outline-none focus:border-gray-900 dark:focus:border-slate-50 focus:ring-1 focus:ring-gray-900 dark:focus:ring-slate-50 placeholder:text-gray-500 dark:placeholder:text-slate-400"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 text-sm text-gray-900 dark:text-slate-100 bg-[#FBF9F4] dark:bg-slate-900/50 border border-[#EBE9E0] dark:border-slate-600 rounded-xl focus:outline-none focus:border-gray-900 dark:focus:border-slate-50 focus:ring-1 focus:ring-gray-900 dark:focus:ring-slate-50 placeholder:text-gray-500 dark:placeholder:text-slate-400 resize-y"
                  placeholder="How can we help you?"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 text-xs font-bold text-white bg-gray-900 dark:bg-slate-50 dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-slate-200 transition-colors tracking-tighter uppercase disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}