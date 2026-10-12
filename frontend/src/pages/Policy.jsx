
import React from 'react';
import Layout from '../components/layout/Layout';

const Policy = () => {
  const effectiveDate = '09-10-2026';

  const sections = [
    {
      number: '01',
      title: 'Information We Collect',
      content: (
        <>
          <p>Tharu and Sons may collect information that you provide when using our website or contacting us, including:</p>
          <div className="space-y-4 mt-5">
            <p>
              <strong className="text-[#111111] block font-medium text-xs tracking-wider uppercase mb-1">
                Personal Information
              </strong>
              Information such as your name, email address, phone number, postal address, and other details you voluntarily provide through our website, enquiries, or service requests.
            </p>
            <p>
              <strong className="text-[#111111] block font-medium text-xs tracking-wider uppercase mb-1">
                Transaction Information
              </strong>
              Information related to purchases, payments, billing, invoices, and services you request from us, where applicable.
            </p>
            <p>
              <strong className="text-[#111111] block font-medium text-xs tracking-wider uppercase mb-1">
                Technical Information
              </strong>
              Information such as your IP address, browser type, device information, pages visited, and website usage data, where collected through server logs, cookies, or analytics tools.
            </p>
          </div>
        </>
      ),
    },
    {
      number: '02',
      title: 'How We Use Your Information',
      content: (
        <>
          <p className="mb-4">We may use the information collected for the following purposes:</p>
          <ul className="space-y-3 list-none pl-0">
            {[
              'To respond to enquiries and provide requested services.',
              'To process transactions, maintain billing records, and manage customer or business relationships.',
              'To communicate important updates regarding our services.',
              'To maintain, secure, and improve our website.',
              'To comply with applicable legal and regulatory requirements.',
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-[#b3925a] mt-2 text-[8px]">■</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </>
      ),
    },
    {
      number: '03',
      title: 'Sharing Your Information',
      content: (
        <>
          <p className="mb-4">
            We do not sell your personal information. We may share information when reasonably necessary in the following circumstances:
          </p>
          <ul className="space-y-3 list-none pl-0">
            {[
              'With authorized service providers who help operate our website or deliver our services.',
              'When required by applicable law, a court order, or a lawful request from an authorized authority.',
              'When necessary to protect our rights, property, website, or the safety of others.',
              'With your consent or at your direction, where applicable.',
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-[#b3925a] mt-2 text-[8px]">■</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </>
      ),
    },
    {
      number: '04',
      title: 'Data Security',
      content: (
        <p>
          We take reasonable technical and organizational measures to protect personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmitting or storing information electronically can be guaranteed to be completely secure.
        </p>
      ),
    },
    {
      number: '05',
      title: 'Cookies and Website Analytics',
      content: (
        <p>
          Our website may use cookies or similar technologies to support essential functionality, understand website usage, and improve the user experience. You can manage cookies through your browser settings. Disabling certain cookies may affect some website features. Any analytics or tracking tools used should be disclosed in accordance with applicable requirements.
        </p>
      ),
    },
    {
      number: '06',
      title: 'Data Retention and Your Rights',
      content: (
        <p>
          We retain personal information only for as long as reasonably necessary for the purposes described in this policy, including applicable legal, accounting, and business requirements. Subject to applicable law, you may request access to, correction of, or deletion of your personal information, or raise concerns about how it is used.
        </p>
      ),
    },
    {
      number: '07',
      title: 'Third-Party Websites',
      content: (
        <p>
          Our website may contain links to third-party websites or services. We are not responsible for the privacy practices or content of those third parties. We encourage you to review their privacy policies before providing personal information.
        </p>
      ),
    },
    {
      number: '08',
      title: 'Policy Updates',
      content: (
        <p>
          We may update this Privacy Policy from time to time to reflect changes in our services, business practices, or applicable laws. The revised policy will be published on this page along with its updated effective date.
        </p>
      ),
    },
    {
      number: '09',
      title: 'Contact Us',
      content: (
        <p>
          If you have questions about this Privacy Policy or how your information is handled, please contact Tharu and Sons through the contact details provided on our website at{' '}
          <a
            href="https://tharuandsons.com"
            className="text-[#111111] underline underline-offset-4"
          >
            tharuandsons.com
          </a>.
        </p>
      ),
    },
  ];

  return (
    <Layout title="Privacy Policy - Tharu and Sons">
      <div className="bg-[#fcfcfc] min-h-screen py-16 px-4 sm:px-6 lg:px-8 antialiased font-sans text-[#222222]">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#b3925a] font-medium block mb-3">
              Legal & Compliance
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wide uppercase text-[#111111] mb-6">
              Privacy Policy
            </h1>

            <div className="w-16 h-[1px] bg-[#b3925a] mx-auto mb-6" />

            <p className="text-xs uppercase tracking-widest text-neutral-400">
              Effective Date: {effectiveDate}
            </p>
          </div>

          {/* Introduction */}
          <div className="max-w-3xl mx-auto mb-16 text-center border-b border-neutral-100 pb-12">
            <p className="text-base sm:text-lg text-neutral-600 font-light leading-relaxed">
              <strong className="text-[#111111] font-medium">
                Tharu and Sons
              </strong>{' '}
              respects your privacy and is committed to handling your personal
              information responsibly. This Privacy Policy explains how we may
              collect, use, store, and share information when you visit our
              website at{' '}
              <a
                href="https://tharuandsons.com"
                className="text-[#111111] underline underline-offset-4 font-normal"
              >
                tharuandsons.com
              </a>{' '}
              or interact with our services.
            </p>
          </div>

          {/* Policy Sections */}
          <div className="space-y-16 max-w-4xl mx-auto">
            {sections.map((section) => (
              <section
                key={section.number}
                className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start"
              >
                <div className="md:col-span-4">
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#b3925a] block mb-1">
                    {section.number}
                  </span>
                  <h2 className="text-lg uppercase tracking-wider font-medium text-[#111111]">
                    {section.title}
                  </h2>
                </div>

                <div className="md:col-span-8 text-neutral-600 font-light leading-relaxed border-l border-neutral-200 pl-6">
                  {section.content}
                </div>
              </section>
            ))}
          </div>

          {/* Footer Accent */}
          <div className="w-12 h-[1px] bg-neutral-200 mx-auto mt-24" />
        </div>
      </div>
    </Layout>
  );
};

export default Policy;

