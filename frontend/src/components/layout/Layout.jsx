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
  description = "clothing shop Explore our latest collections, enjoy exclusive discounts, and experience fashion like never before at CJ Attire—where style meets comfort!",
  keywords = "https://cj-attire.onrender.com cjattire.com cj-attire.onrender.com cloth,tshirt,dress cj attire,CJ-ATTIRE,CJ ATTIRE, oversized t shirt,kids",
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
