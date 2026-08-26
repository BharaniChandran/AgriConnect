import React from 'react';

export default function AdminResolution() {
  return (
    <div className="bg-background text-on-background antialiased h-screen flex flex-col">
      <nav className="bg-surface-bright border-b border-outline-earth w-full sticky top-0 z-50">
        <div className="flex justify-between items-center px-mobile-margin md:px-tablet-margin lg:px-0 max-w-max-width-desktop mx-auto h-touch-target">
          <div className="font-headline-lg-mobile md:font-headline-lg text-primary flex items-center gap-2">
            <span className="material-symbols-outlined">gavel</span>
            AgriConnect Admin
          </div>
          <div className="hidden md:flex gap-6">
            <a className="text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors duration-200 px-3 py-2 rounded-md font-body-md text-body-md md:font-label-lg md:text-label-lg" href="#">Dashboard</a>
            <a className="text-primary border-b-2 border-primary pb-1 font-body-md text-body-md md:font-label-lg md:text-label-lg" href="#">Resolutions</a>
            <a className="text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors duration-200 px-3 py-2 rounded-md font-body-md text-body-md md:font-label-lg md:text-label-lg" href="#">Users</a>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors active:opacity-80">
              <span className="material-symbols-outlined">language</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant">
              <img alt="User profile photo" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuApo7wDWg5Vby4qMoMbB-DM6Q4Aqe-qT5rFqSlYuYgbHo8Y_VRqeC39DULDCdd0JbTm0dLqfxyBPihPp03Uonlxov6TVe1zNY4tN8AUAoAbx_FJ405ytyz4loZoiyVkMAlXJOi7zgyc2e52mz6Eb_TCbDME4XPUn_68fhHn3GkEMhmIMtNdJMyHNxKWTUrHi6yqhCN_h-49QIBAHCApjGqaqvTiqJQqa4r1eEgUsQr8H2RoXB61RmSt" />
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-hidden flex flex-col max-w-max-width-desktop w-full mx-auto px-mobile-margin md:px-tablet-margin lg:px-0 py-stack-md">
        <header className="flex justify-between items-end mb-stack-lg flex-shrink-0">
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">receipt_long</span> Claim #AC-9921-X
            </p>
            <h1 className="font-display-lg text-display-lg text-primary">Resolution Center</h1>
          </div>
          <div className="flex gap-3">
            <span className="bg-surface-container-highest text-on-surface px-3 py-1 rounded-full font-label-md text-label-md flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">calendar_today</span> 12 Oct 2023
            </span>
            <span className="bg-error-container text-on-error-container px-3 py-1 rounded-full font-label-md text-label-md flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">warning</span> High Priority
            </span>
          </div>
        </header>

        <div className="flex-1 flex gap-gutter min-h-0">
          <div className="flex-1 bg-surface-container-lowest border border-outline-earth rounded-xl flex flex-col shadow-sm overflow-hidden">
            <div className="bg-surface-container-low p-4 border-b border-outline-variant flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-2xl">storefront</span>
                <h2 className="font-headline-md text-headline-md text-on-surface">Buyer's Claim</h2>
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant">Green Grocers Ltd.</span>
            </div>
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <div className="mb-stack-lg">
                <h3 className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-wider mb-2">Issue Description</h3>
                <p className="font-body-md text-body-md text-on-surface bg-surface-container p-4 rounded-lg border border-surface-dim">
                  The delivery of 500kg of Roma Tomatoes arrived 2 days late. Additionally, upon inspection, approximately 15% of the produce showed signs of early rot and bruising, making it unsellable for our premium retail shelves. We request a partial refund for the damaged goods.
                </p>
              </div>
              <div className="mb-stack-lg">
                <h3 className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-wider mb-2">Evidence Provided</h3>
                <div className="grid grid-cols-2 gap-3">
                  <img alt="Damaged tomatoes 1" className="w-full h-32 object-cover rounded-lg border border-outline-variant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzN8_N32bCSrwAi4iicap_tzRch4QXqAQeyf-8zvjGGS1998ltmoYuTJp1YVxFdyUpXzjX5P45MutdS2aFxD_3-m4wCmpKm18uZTBGEhUkY7Myv3CTgo7SAthXAOcS5j9jNI9HK-peQ3HdD8qd-v5lEaScDLev2E3JQliW8d_v29jgGziJQHQzfJTDkdBxo5Sj74eMXQgqZcm_rwMwh1KWThvc8SO568PS6IWuYmQciFCdgWUF06qo" />
                  <img alt="Damaged tomatoes 2" className="w-full h-32 object-cover rounded-lg border border-outline-variant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcrqLPM1j__ApcboMs2wfpLiijF1pNR_orUV70sB3hwiSMCbFYPkkrUNYyJDG0py2IimuGHYuJj89YDTLHfa3vra03qJn1fVSWWlEVutCWlgwDnTSJSh1nRrVFLoKxfhCX8UwuEGjVgnZ7TlLSMwVnlPl_0o_FE89JUYFD70fa9VNOBFdITsZHc7U2bXKCkCxQjfFhBP17CZB2JBKHlICzrFfIcIc2Rnn7yqNZwc9k9VYmH6EKdOOP" />
                </div>
              </div>
              <div>
                <h3 className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-wider mb-2">Requested Resolution</h3>
                <div className="flex items-center justify-between bg-surface-container-highest p-3 rounded-lg">
                  <span className="font-body-md text-body-md font-semibold">Partial Refund (15%)</span>
                  <span className="font-headline-md text-headline-md text-error">$142.50</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-surface-container-lowest border border-outline-earth rounded-xl flex flex-col shadow-sm overflow-hidden">
            <div className="bg-surface-container p-4 border-b border-outline-variant flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-2xl">agriculture</span>
                <h2 className="font-headline-md text-headline-md text-on-surface">Farmer's Response</h2>
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant">Sunrise Farms</span>
            </div>
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <div className="mb-stack-lg">
                <h3 className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-wider mb-2">Rebuttal / Statement</h3>
                <p className="font-body-md text-body-md text-on-surface bg-surface-bright p-4 rounded-lg border border-surface-dim">
                  The shipment was dispatched on time according to the contract. The delay was entirely due to the logistics provider encountering road closures. As for the quality, the tomatoes were graded 'Class A' upon departure. Any degradation occurred during the extended transit time which is out of our control. We are willing to offer a 5% goodwill credit on their next order, but deny the cash refund.
                </p>
              </div>
              <div className="mb-stack-lg">
                <h3 className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-wider mb-2">Evidence Provided</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-outline-variant rounded-lg p-3 flex flex-col items-center justify-center bg-surface-container-low text-center h-32">
                    <span className="material-symbols-outlined text-3xl text-on-surface-variant mb-2">description</span>
                    <span className="font-label-md text-label-md">Quality Inspection Certificate.pdf</span>
                  </div>
                  <div className="border border-outline-variant rounded-lg p-3 flex flex-col items-center justify-center bg-surface-container-low text-center h-32">
                    <span className="material-symbols-outlined text-3xl text-on-surface-variant mb-2">local_shipping</span>
                    <span className="font-label-md text-label-md">Dispatch Logs &amp; Tracker.pdf</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-wider mb-2">Proposed Counter</h3>
                <div className="flex items-center justify-between bg-surface-container-highest p-3 rounded-lg">
                  <span className="font-body-md text-body-md font-semibold">Future Order Credit (5%)</span>
                  <span className="font-headline-md text-headline-md text-primary">$47.50</span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-80 bg-surface border border-outline-earth rounded-xl flex flex-col shadow-sm">
            <div className="p-4 border-b border-outline-variant bg-surface-dim">
              <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined">admin_panel_settings</span> Action
              </h2>
            </div>
            <div className="p-4 flex-1 flex flex-col gap-4">
              <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant mb-2">
                <p className="font-label-md text-label-md text-on-surface-variant mb-1">Total Transaction Value</p>
                <p className="font-headline-md text-headline-md">$950.00</p>
              </div>
              <label className="flex flex-col gap-1">
                <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Internal Notes</span>
                <textarea className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none h-24" placeholder="Add justification for decision..."></textarea>
              </label>
              <div className="mt-auto flex flex-col gap-3">
                <button className="w-full bg-primary text-on-primary py-3 px-4 rounded-lg font-label-lg text-label-lg shadow-[0_2px_0_0_rgba(21,66,18,0.5)] hover:bg-primary-container hover:text-on-primary-container transition-colors flex justify-center items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">done_all</span> Award Partial Refund
                </button>
                <button className="w-full bg-surface-container-highest border border-outline text-on-surface py-3 px-4 rounded-lg font-label-lg text-label-lg hover:bg-surface-dim transition-colors flex justify-center items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">local_activity</span> Enforce Farmer Credit
                </button>
                <button className="w-full bg-error-container text-on-error-container py-3 px-4 rounded-lg font-label-lg text-label-lg hover:bg-[#ffb4ab] transition-colors flex justify-center items-center gap-2 mt-2">
                  <span className="material-symbols-outlined text-[20px]">block</span> Dismiss Claim entirely
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
