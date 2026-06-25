import React, { useEffect, useRef } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FaStar } from 'react-icons/fa';

const Testimonials = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 }); 
  }, []);

  const testimonials = [
    {
      name: 'John Doe',
      review: 'Taru & Sons provided exceptional service! My clothes have never looked better, and their punctuality is unmatched.',
      rating: 5,
    },
    {
      name: 'Sarah Lee',
      review: 'I am very impressed with the professionalism and quality of service. The laundry was returned fresh, clean, and perfectly pressed.',
      rating: 4,
    },
    {
      name: 'Michael Smith',
      review: 'Fantastic service! I will definitely be using Taru & Sons again. Their customer care is top-notch.',
      rating: 5,
    },
    {
      name: 'Emily Davis',
      review: 'The cleaning service was excellent. My linens were spotless, and the team was very accommodating to my needs.',
      rating: 4,
    },
  ];

  const testimonialContainerRef = useRef(null);

  useEffect(() => {
    const scrollTestimonials = () => {
      if (testimonialContainerRef.current) {
        const container = testimonialContainerRef.current;
        const firstTestimonial = container.querySelector('.testimonial');
        const testimonialWidth = firstTestimonial.offsetWidth + 20;

        container.scrollBy({
          left: testimonialWidth,
          behavior: 'smooth',
        });

        if (container.scrollLeft >= testimonialWidth * (testimonials.length - 1)) {
          container.scrollLeft = 0; 
        }
      }
    };

    const interval = setInterval(scrollTestimonials, 3000); 

    return () => clearInterval(interval); 
  }, []);

  return (
    <div className="container mx-auto p-7 bg-teal-50 rounded-lg shadow-lg my-16">
      <div className="text-center mb-12" data-aos="fade-up">
        <h1 className="text-4xl font-semibold text-teal-600 mb-4 font-space-grotesk">What Our Clients Say</h1>
        <p className="text-gray-700 text-lg font-medium font-space-grotesk">
          Here's what our happy clients have to say about our cleaning and laundry services:
        </p>
      </div>

      <div
        ref={testimonialContainerRef}
        className="flex overflow-x-auto gap-10 snap-x scrollbar-thin scrollbar-thumb-teal-500 scrollbar-track-teal-200"
      >
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="testimonial p-8 bg-gradient-to-r from-teal-500 via-teal-400 to-teal-300 shadow-2xl rounded-lg text-center flex-shrink-0 w-96 snap-start"
            data-aos="fade-up"
          >
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={`text-yellow-400 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <p className="text-gray-100 mb-4 italic text-lg font-space-grotesk">{testimonial.review}</p>
            <h2 className="text-2xl font-semibold text-yellow-400 font-space-grotesk">{testimonial.name}</h2>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;
