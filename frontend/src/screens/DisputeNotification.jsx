import React from 'react';

export default function DisputeNotification() {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <nav className="hidden md:flex w-full sticky top-0 z-50 bg-surface-bright dark:bg-surface-dim border-b border-outline-earth dark:border-outline-variant flat no-shadows justify-between items-center px-tablet-margin lg:px-0 max-w-max-width-desktop mx-auto h-touch-target">
        <div className="font-headline-lg text-primary dark:text-primary-fixed">AgriConnect</div>
        <ul className="flex space-x-8">
          <li><a className="font-label-lg text-label-lg text-on-surface-variant dark:text-outline-variant hover:text-primary hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-colors duration-200 active:opacity-80 transition-opacity px-2 py-1 rounded" href="#">Home</a></li>
          <li><a className="font-label-lg text-label-lg text-on-surface-variant dark:text-outline-variant hover:text-primary hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-colors duration-200 active:opacity-80 transition-opacity px-2 py-1 rounded" href="#">Lots</a></li>
          <li><a className="font-label-lg text-label-lg text-primary dark:text-primary-fixed-dim border-b-2 border-primary dark:border-primary-fixed-dim pb-1 hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-colors duration-200 active:opacity-80 transition-opacity px-2 py-1 rounded" href="#">Deliveries</a></li>
          <li><a className="font-label-lg text-label-lg text-on-surface-variant dark:text-outline-variant hover:text-primary hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-colors duration-200 active:opacity-80 transition-opacity px-2 py-1 rounded" href="#">Payments</a></li>
        </ul>
        <div className="flex items-center space-x-4">
          <span className="material-symbols-outlined text-primary cursor-pointer hover:bg-surface-container-low rounded-full p-1">language</span>
          <img alt="User profile photo" className="w-8 h-8 rounded-full border border-outline-earth" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaWRoZzuGy0GLrCvl_bwuOQNWELuxB3RbNr0LrPGW6WxOKX5E5pOvKqtqOURyQJVzKcYL9wB5pj8mMSPPk1Lkyx35c0ksQ1u8f8dGOgOTw63AT2Hm4VunOd2iZdRs0zJzjWxm9gVGVUhz4yoZHyLpxbLVfPSsrsdfIx17pKzzneVobEaTwvN001_lj0KzQBooFxJY5q_2vG3hMNba6auEOVrSYjnsjIG3c2Zttr7s2K2RVC_C49F2L" />
        </div>
      </nav>

      <main className="flex-grow w-full max-w-4xl mx-auto px-mobile-margin md:px-tablet-margin py-8 md:py-12">
        <div className="mb-stack-lg">
          <div className="flex items-center space-x-2 text-error mb-2">
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>warning</span>
            <span className="font-label-lg text-label-lg uppercase tracking-wider">Action Required</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-on-background">Dispute Notification</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-stack-sm">A buyer has raised an issue with Delivery #DLV-8924. Please review the details below to respond.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <div className="md:col-span-1 bg-surface-container-lowest border border-outline-earth rounded-xl p-stack-md flex flex-col justify-between shadow-sm">
            <div>
              <h2 className="font-headline-md text-headline-md mb-stack-md">Delivery Details</h2>
              <ul className="space-y-stack-sm">
                <li className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface-variant uppercase">Buyer</span>
                  <span className="font-body-md text-body-md font-semibold">Green Valley Grocers</span>
                </li>
                <li className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface-variant uppercase">Lot ID</span>
                  <span className="font-body-md text-body-md">#L-409 (Organic Carrots)</span>
                </li>
                <li className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface-variant uppercase">Date Delivered</span>
                  <span className="font-body-md text-body-md">Oct 24, 2023</span>
                </li>
              </ul>
            </div>
            <div className="mt-stack-lg pt-stack-md border-t border-surface-dim">
              <span className="font-label-md text-label-md text-on-surface-variant uppercase block mb-1">Dispute Status</span>
              <span className="inline-block bg-error-container text-on-error-container font-label-lg text-label-lg px-3 py-1 rounded-full">Pending Review</span>
            </div>
          </div>

          <div className="md:col-span-2 bg-surface-container-lowest border border-outline-earth rounded-xl p-stack-md shadow-sm">
            <h2 className="font-headline-md text-headline-md mb-stack-md flex items-center">
              <span className="material-symbols-outlined mr-2 text-secondary">description</span>
              Buyer's Notes
            </h2>
            <div className="bg-surface-container p-stack-md rounded-lg border border-surface-dim">
              <p className="font-body-md text-body-md text-on-surface italic">"The delivery was received on time, but upon inspection, approximately 15% of the carrot bags at the bottom of the pallet were crushed and showing signs of early spoilage due to moisture damage during transit. The affected bags are unsellable. Requesting a partial refund for the damaged goods."</p>
            </div>
            <div className="mt-stack-lg">
              <h3 className="font-label-lg text-label-lg uppercase text-on-surface-variant mb-stack-sm">Reported Damage</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="material-symbols-outlined text-tertiary">inventory_2</span>
                  <span className="font-body-md text-body-md">15% Quantity</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="material-symbols-outlined text-tertiary">water_drop</span>
                  <span className="font-body-md text-body-md">Moisture/Crush</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 bg-surface-container-lowest border border-outline-earth rounded-xl p-stack-md shadow-sm">
            <h2 className="font-headline-md text-headline-md mb-stack-md">Evidence Photos</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
              <img className="w-full h-32 object-cover rounded-lg border border-surface-dim hover:opacity-90 cursor-pointer transition-opacity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLyPu7hdyB2X3g1NP6IFO61VIXDabMZ99n0mH26QlMf3S42DolVMkWpWIN8E2u25FDoep-WIAzgFblr1clOB-vFkByUCKiBhjpZkT5DAilsXbrVzgPptxagxXq-LV9oj-nlrIysfb_IMr7iYFDyzk3hiXkoqjQCVFzERoC_hUzWU3zYbTDC9aDLlkH3MkYjXSEl9yH6cKQB0qc57VIw9TgUaI_C1H1ngnhQyHJZlYh2i7eZ0VnzHbM" />
              <img className="w-full h-32 object-cover rounded-lg border border-surface-dim hover:opacity-90 cursor-pointer transition-opacity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqzzAANCGDDg5tMCn6p4rFQLWr9bhfxA-8zSsqNBSI85wY8ulgzsABV4fGmOvMHTb8a-3PcuLepg7Ywd0852G4BHdh0ij0t5ia1YmOF4li8ZCmBvDXbH_Nt2v810yXB1mMgYEtGfoehBBsTcsQCr9IH5DVlxLWBxjsb7zgckBRgkRR3PxVPbxVY3IUzffONQwH5rpsQkrGa4Y3j1rRMf5z8d8W-iTTrf54t7asvYum-fHpqQg63zUh" />
              <div className="w-full h-32 bg-surface-container rounded-lg border border-surface-dim flex items-center justify-center cursor-pointer hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant text-4xl">add_photo_alternate</span>
                <span className="sr-only">View all 3 photos</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 mt-stack-md flex justify-end space-x-gutter">
            <button className="px-6 py-3 min-h-[48px] rounded-full border-2 border-outline text-primary font-label-lg text-label-lg hover:bg-surface-container-low transition-colors shadow-sm">
              Contact Buyer
            </button>
            <button className="px-6 py-3 min-h-[48px] rounded-full bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm shadow-primary/20 flex items-center">
              <span className="material-symbols-outlined mr-2" style={{fontVariationSettings: "'FILL' 1"}}>reply</span>
              Respond to Dispute
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
