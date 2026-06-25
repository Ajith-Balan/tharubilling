import React from 'react'
import Layout from '../components/layout/Layout'
const policy = () => {
  return (
    <div>
      <Layout title={'privacy policy'}>
      <div className="privacy-policy p-4">
      <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
      <p><strong>Effective Date:</strong> [Insert Date]</p>

      <p className="mb-4">
        [CJ ATTIRE]  is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website [website URL] or use our services. Please read this policy carefully to understand our practices regarding your personal data.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
      <p>We collect information about you in various ways:</p>
      <ul className="list-disc ml-6 mb-4">
        <li>
          <strong>Personal Data</strong>: When you register on our site, place an order, subscribe to our newsletter, or interact with us, we may collect personal information such as your name, email address, phone number, and billing information.
        </li>
        <li>
          <strong>Usage Data</strong>: We collect information on how you access and interact with our website, including your IP address, browser type, and pages visited.
        </li>
        <li>
          <strong>Cookies and Tracking Technologies</strong>: We use cookies and similar tracking technologies to enhance user experience and analyze how our services are used.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. How We Use Your Information</h2>
      <p>We use your personal information to:</p>
      <ul className="list-disc ml-6 mb-4">
        <li>Provide and maintain our services.</li>
        <li>Process your transactions.</li>
        <li>Communicate with you about updates, offers, or changes to our services.</li>
        <li>Improve our website and tailor your experience.</li>
        <li>Analyze and understand how users interact with our services.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Sharing Your Information</h2>
      <p>We do not share your personal information with third parties except:</p>
      <ul className="list-disc ml-6 mb-4">
        <li>With your consent.</li>
        <li>With service providers that help us operate our website, such as payment processors or email service providers.</li>
        <li>If required by law or to protect our rights and safety.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Security of Your Information</h2>
      <p className="mb-4">
        We use administrative, technical, and physical security measures to protect your personal information. However, please be aware that no method of transmission over the internet is 100% secure.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Your Data Protection Rights</h2>
      <p className="mb-4">
        Depending on your jurisdiction, you may have certain rights regarding your personal data, including the right to access, correct, or delete the information we hold about you.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">6. Changes to This Privacy Policy</h2>
      <p className="mb-4">
        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page. We encourage you to review this policy periodically.
      </p>

    </div>     
     </Layout>
    </div>
  )
}

export default policy
