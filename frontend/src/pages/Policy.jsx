import React from 'react'
import Layout from '../components/layout/Layout'

const policy = () => {
  return (
    <Layout title={'Privacy Policy - Tharu and Sons'}>
      <div className="bg-[#fcfcfc] min-h-screen py-16 px-4 sm:px-6 lg:px-8 antialiased font-sans text-[#222222]">
        <div className="max-w-5xl mx-auto">
          
          {/* Main Title Section - Styled like Tharu & Sons Headers */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#b3925a] font-medium block mb-3">
              Legal & Compliance
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wide uppercase text-[#111111] mb-6">
              Privacy Policy
            </h1>
            <div className="w-16 h-[1px] bg-[#b3925a] mx-auto mb-6"></div>
            <p className="text-xs uppercase tracking-widest text-neutral-400">
              Effective Date: 10-12-2026
            </p>
          </div>

          {/* Intro Section */}
          <div className="max-w-3xl mx-auto mb-16 text-center border-b border-neutral-100 pb-12">
            <p className="text-base sm:text-lg text-neutral-600 font-light leading-relaxed">
              <strong className="text-[#111111] font-medium">[Tharu and Sons]</strong> is fully committed to safeguarding your privacy. This policy details how we collect, handle, and securely manage your information when you interact with our boutique platform at <span className="text-[#111111] underline underline-offset-4 font-normal">[website URL]</span> or utilize our premium bespoke services.
            </p>
          </div>

          {/* Legal Sections Grid Layout */}
          <div className="space-y-16 max-w-4xl mx-auto">
            
            {/* 01. Information We Collect */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
              <div className="md:col-span-4">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#b3925a] block mb-1">01</span>
                <h2 className="text-lg uppercase tracking-wider font-medium text-[#111111]">Information We Collect</h2>
              </div>
              <div className="md:col-span-8 text-neutral-600 font-light leading-relaxed border-l border-neutral-200 pl-6 space-y-6">
                <p>We compile necessary information about your interactions through various touchpoints:</p>
                <div className="space-y-4">
                  <p>
                    <strong className="text-[#111111] block font-medium text-xs tracking-wider uppercase mb-1">Personal Profile Data</strong> 
                    When you register a custom profile, secure an order, or subscribe, we securely host credentials including your name, physical measurements, email addresses, contact details, and precise billing entries.
                  </p>
                  <p>
                    <strong className="text-[#111111] block font-medium text-xs tracking-wider uppercase mb-1">Digital Usage Metrics</strong> 
                    We log how you interface with our lookbooks and platforms, detailing your IP address configurations, browser distributions, and sequential page engagement histories.
                  </p>
                  <p>
                    <strong className="text-[#111111] block font-medium text-xs tracking-wider uppercase mb-1">Cookies & Architecture Tracking</strong> 
                    We utilize cookies and tracking configurations to polish navigation fluidities and extract performance metrics.
                  </p>
                </div>
              </div>
            </div>

            {/* 02. How We Use It */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
              <div className="md:col-span-4">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#b3925a] block mb-1">02</span>
                <h2 className="text-lg uppercase tracking-wider font-medium text-[#111111]">Purpose of Processing</h2>
              </div>
              <div className="md:col-span-8 text-neutral-600 font-light leading-relaxed border-l border-neutral-200 pl-6">
                <p className="mb-4">Collected information serves strictly to execute and improve operations:</p>
                <ul className="space-y-3 list-none pl-0">
                  {['Provide, calibrate, and protect our custom tailoring offerings.', 'Complete and ship transactional placements safely.', 'Dispatch direct operational alerts or customized luxury recommendations.', 'Iterate our presentation layouts based on real user interactions.'].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-[#b3925a] mt-2 text-[8px]">■</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 03. Sharing Your Information */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
              <div className="md:col-span-4">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#b3925a] block mb-1">03</span>
                <h2 className="text-lg uppercase tracking-wider font-medium text-[#111111]">Data Transmission</h2>
              </div>
              <div className="md:col-span-8 text-neutral-600 font-light leading-relaxed border-l border-neutral-200 pl-6">
                <p className="mb-4">We maintain strict confidentiality protocols and never distribute your credentials except:</p>
                <ul className="space-y-3 list-none pl-0">
                  {['With your explicitly logged authorization.', 'To specialized core operators supporting our delivery network and secure tokenized checkouts.', 'To satisfy regulatory parameters or defend intellectual safety provisions.'].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-[#b3925a] mt-2 text-[8px]">■</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 04. Data Security */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
              <div className="md:col-span-4">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#b3925a] block mb-1">04</span>
                <h2 className="text-lg uppercase tracking-wider font-medium text-[#111111]">Secured Protection</h2>
              </div>
              <div className="md:col-span-8 text-neutral-600 font-light leading-relaxed border-l border-neutral-200 pl-6">
                <p>
                  We leverage physical, cloud, and engineering frameworks to shield private identities. Note, however, that open digital interfaces cannot be guaranteed to be absolutely secure against unauthorized breaches.
                </p>
              </div>
            </div>

            {/* 05. Your Rights */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
              <div className="md:col-span-4">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#b3925a] block mb-1">05</span>
                <h2 className="text-lg uppercase tracking-wider font-medium text-[#111111]">Statutory Control</h2>
              </div>
              <div className="md:col-span-8 text-neutral-600 font-light leading-relaxed border-l border-neutral-200 pl-6">
                <p>
                  Depending on geographical parameters, you maintain concrete permissions to inquire, update, restrict, or wipe your recorded measurements and identities from our secure registries.
                </p>
              </div>
            </div>

            {/* 06. Policy Updates */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
              <div className="md:col-span-4">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#b3925a] block mb-1">06</span>
                <h2 className="text-lg uppercase tracking-wider font-medium text-[#111111]">Policy Revisions</h2>
              </div>
              <div className="md:col-span-8 text-neutral-600 font-light leading-relaxed border-l border-neutral-200 pl-6">
                <p>
                  We reserve the right to modify these privacy criteria. Updates will be visibly logged directly onto this platform with corresponding chronology adjustments.
                </p>
              </div>
            </div>

          </div>

          {/* Footer Accent Decoration */}
          <div className="w-12 h-[1px] bg-neutral-200 mx-auto mt-24"></div>
          
        </div>
      </div> 
    </Layout>
  )
}

export default policy