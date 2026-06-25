import React from 'react';

const Fq = () => {
  const faqs = [
    {
      question: 'What services do Taru & Sons offer?',
      answer:
        'Taru & Sons provides a wide range of cleaning and laundry services, including fully mechanized laundry on a BOOT basis, linen management, onboard housekeeping, room services, and much more.',
    },
    {
      question: 'How can I contact Taru & Sons for service inquiries?',
      answer:
        'You can reach out to us through our contact form on the website or by calling our customer service at the provided contact number.',
    },
    {
      question: 'Do you provide laundry services for hotels?',
      answer:
        'Yes, we specialize in providing laundry services for hotels, including luxury hotels, offering high-quality linen management and cleaning services.',
    },
    {
      question: 'What is the turnaround time for laundry services?',
      answer:
        'Our typical turnaround time for laundry services is 24 to 48 hours, depending on the order size and service type.',
    },
    {
      question: 'Are your cleaning products safe for delicate fabrics?',
      answer:
        'Yes, we use eco-friendly and gentle cleaning products that are safe for all types of fabrics, including delicate ones.',
    },
    {
      question: 'Do you offer any discounts for bulk laundry orders?',
      answer:
        'Yes, we provide special discounts for bulk laundry orders, especially for hotels, organizations, and large events. Please contact us for more details.',
    },
  ];

  return (
    <div className="container mx-auto p-7 font-space-grotesk">
          <div className="text-center mb-12">
        <h1 className="text-3xl font-semibold text-teal-500 mb-4">Frequently Asked Questions</h1>
        <p className="text-gray-600 text-lg font-medium">
          Here are some of the most common questions our customers ask about our cleaning and laundry services.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white  p-6">
            <h3 className="text-xl font-semibold text-teal-500 mb-2">{faq.question}</h3>
            <p className="text-gray-600">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Fq;
