import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { Helmet } from 'react-helmet';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BackButton from './BackButton';

const Layout = ({
  children,
  title = "Tharu & sons ",
  description = "Tharu & Sons is a professional service provider specializing in railway cleaning, coach housekeeping, bed sheet and linen laundry services, and facility management. We are committed to delivering reliable, hygienic, and quality services with a focus on customer satisfaction and operational excellence across India.",
  keywords = "Tharu and Sons, Tharu & Sons, railway cleaning services, railway housekeeping services, train cleaning contractors, railway coach cleaning, railway laundry services, railway linen management, bed sheet laundry services, railway bed sheet washing, train housekeeping, railway facility management, coach maintenance services, Indian railway contractors, railway sanitation services, professional housekeeping services, commercial laundry services, train cleaning company, railway service provider, railway maintenance contractor, facility management Kerala, housekeeping company Kerala, laundry services India.",
  author = "ajith-balan"
}) => {
  return (
    <div className="flex flex-col ">
      <Helmet>
        <meta charSet="utf-8" />
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="author" content={author} />
        <title>{title}</title>
      </Helmet>
      <Header />
      <main className="flex-grow">
        <ToastContainer/>
        {/* <BackButton/> */}
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
