import React from 'react';

export default function PaymentStatus() {
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <header className="w-full sticky top-0 z-50 border-b border-outline-earth dark:border-outline-variant flat no-shadows bg-surface-bright dark:bg-surface-dim">
        <div className="flex justify-between items-center px-mobile-margin md:px-tablet-margin lg:px-0 max-w-max-width-desktop mx-auto h-touch-target">
          <div className="font-headline-lg-mobile md:font-headline-lg text-primary dark:text-primary-fixed">AgriConnect</div>
          <nav className="hidden md:flex space-x-gutter">
            <a className="font-body-md text-body-md md:font-label-lg md:text-label-lg text-on-surface-variant dark:text-outline-variant hover:text-primary hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-colors duration-200 px-3 py-2 rounded-lg" href="#">Home</a>
            <a className="font-body-md text-body-md md:font-label-lg md:text-label-lg text-on-surface-variant dark:text-outline-variant hover:text-primary hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-colors duration-200 px-3 py-2 rounded-lg" href="#">Lots</a>
            <a className="font-body-md text-body-md md:font-label-lg md:text-label-lg text-on-surface-variant dark:text-outline-variant hover:text-primary hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-colors duration-200 px-3 py-2 rounded-lg" href="#">Deliveries</a>
            <a className="font-body-md text-body-md md:font-label-lg md:text-label-lg text-primary dark:text-primary-fixed-dim border-b-2 border-primary dark:border-primary-fixed-dim pb-1 hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-colors duration-200 px-3 py-2 rounded-lg" href="#">Payments</a>
          </nav>
          <div className="flex items-center space-x-4">
            <button className="active:opacity-80 transition-opacity p-2 rounded-full hover:bg-surface-container-low dark:hover:bg-surface-container-highest">
              <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim">language</span>
            </button>
            <img alt="User profile photo" className="w-8 h-8 rounded-full object-cover border border-outline-earth" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgn0DmeErf79eQR1B7eksbWiBr8vZaorxuuNINbhNhBRKZleFsszYI5mu-u2RLroAGbemsPWAGTgRaDZnwuQ4PyED9kxPnJfIDvTyY0utql4F2ta3oQ499c7rBdczva3aHgvU-Hd_7tpco6z3QlLt_9mzyJBjZ-hD345n9TYKdCjCBECLjZnuqOPwu0N_uD4VJAfYCfz2arnWfiB7xVZRP7SM5B88DfnngMlhQgle_IC13damd7b6h" />
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-max-width-desktop mx-auto px-mobile-margin md:px-tablet-margin py-stack-lg w-full">
        <div className="mb-stack-lg">
          <h1 className="font-display-lg text-display-lg text-on-surface">Payment Status</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Track the status of your recent lot delivery payment.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          <div className="lg:col-span-8 flex flex-col space-y-gutter">
            <section className="bg-surface-container-lowest border border-outline-earth rounded-xl p-stack-lg relative overflow-hidden shadow-sm">
              <div className="relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-headline-md text-headline-md text-on-surface">Held Amount</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-1">Payment is currently held pending quality inspection.</p>
                  </div>
                  <span className="material-symbols-outlined text-4xl text-secondary-container" style={{fontVariationSettings: "'FILL' 1"}}>lock</span>
                </div>
                <div className="mt-stack-md flex items-end space-x-2">
                  <span className="font-display-lg text-display-lg text-primary">₹1,24,500</span>
                  <span className="font-body-lg text-body-lg text-on-surface-variant pb-2">.00</span>
                </div>
              </div>
            </section>
            
            <section className="bg-surface-container-lowest border border-outline-earth rounded-xl p-stack-lg shadow-sm">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-stack-md">Process Status</h3>
              <div className="flex flex-col md:flex-row justify-between relative mt-stack-lg">
                <div className="hidden md:block absolute top-6 left-12 right-12 h-1 bg-surface-variant z-0 rounded-full"></div>
                <div className="hidden md:block absolute top-6 left-12 w-1/2 h-1 bg-secondary-container z-0 rounded-full"></div>
                
                <div className="relative z-10 flex flex-col items-center flex-1 mb-stack-lg md:mb-0">
                  <div className="w-12 h-12 rounded-full bg-secondary-container text-on-primary flex items-center justify-center shadow-md mb-3 border-2 border-surface-container-lowest">
                    <span className="material-symbols-outlined">pause_circle</span>
                  </div>
                  <span className="font-label-lg text-label-lg text-on-surface text-center">Held</span>
                  <span className="font-label-md text-label-md text-on-surface-variant text-center mt-1">रोक लिया गया</span>
                  <span className="font-label-md text-label-md text-outline mt-2 text-center">Oct 24, 10:00 AM</span>
                </div>
                
                <div className="relative z-10 flex flex-col items-center flex-1 mb-stack-lg md:mb-0">
                  <div className="w-12 h-12 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center shadow-sm mb-3 border-2 border-outline-variant">
                    <span className="material-symbols-outlined animate-spin-slow">sync</span>
                  </div>
                  <span className="font-label-lg text-label-lg text-on-surface text-center">Under Review</span>
                  <span className="font-label-md text-label-md text-on-surface-variant text-center mt-1">समीक्षाधीन</span>
                  <span className="font-label-md text-label-md text-outline mt-2 text-center">In Progress</span>
                </div>
                
                <div className="relative z-10 flex flex-col items-center flex-1">
                  <div className="w-12 h-12 rounded-full bg-surface-variant text-outline flex items-center justify-center mb-3 border-2 border-surface-variant">
                    <span className="material-symbols-outlined">check_circle</span>
                  </div>
                  <span className="font-label-lg text-label-lg text-outline text-center">Released</span>
                  <span className="font-label-md text-label-md text-outline text-center mt-1">जारी किया गया</span>
                  <span className="font-label-md text-label-md text-outline mt-2 text-center">Pending</span>
                </div>
              </div>
              <div className="mt-stack-lg bg-surface-container-low p-stack-md rounded-lg border border-outline-variant">
                <div className="flex items-start space-x-3">
                  <span className="material-symbols-outlined text-secondary-container mt-1">info</span>
                  <div>
                    <p className="font-body-md text-body-md text-on-surface"><strong>Explanation:</strong> Your payment is currently under review by our quality control team. This usually takes 24-48 hours. Once approved, the funds will be released to your registered account.</p>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-2"><strong>स्पष्टीकरण:</strong> आपके भुगतान की वर्तमान में हमारी गुणवत्ता नियंत्रण टीम द्वारा समीक्षा की जा रही है। इसमें आमतौर पर 24-48 घंटे लगते हैं। स्वीकृत होने के बाद, धनराशि आपके पंजीकृत खाते में जारी कर दी जाएगी।</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
          
          <div className="lg:col-span-4 flex flex-col space-y-gutter">
            <section className="bg-surface-container-lowest border border-outline-earth rounded-xl p-stack-lg shadow-sm">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-stack-md">Transaction Details</h3>
              <ul className="space-y-4">
                <li className="flex justify-between items-center border-b border-outline-variant pb-2">
                  <span className="font-body-md text-body-md text-on-surface-variant">Lot ID</span>
                  <span className="font-label-lg text-label-lg text-on-surface">#LOT-8923-A</span>
                </li>
                <li className="flex justify-between items-center border-b border-outline-variant pb-2">
                  <span className="font-body-md text-body-md text-on-surface-variant">Crop Type</span>
                  <span className="font-label-lg text-label-lg text-on-surface">Premium Wheat</span>
                </li>
                <li className="flex justify-between items-center border-b border-outline-variant pb-2">
                  <span className="font-body-md text-body-md text-on-surface-variant">Quantity</span>
                  <span className="font-label-lg text-label-lg text-on-surface">5,000 kg</span>
                </li>
                <li className="flex justify-between items-center border-b border-outline-variant pb-2">
                  <span className="font-body-md text-body-md text-on-surface-variant">Base Rate</span>
                  <span className="font-label-lg text-label-lg text-on-surface">₹24.90 / kg</span>
                </li>
                <li className="flex justify-between items-center pt-2">
                  <span className="font-label-lg text-label-lg text-on-surface">Expected Total</span>
                  <span className="font-headline-md text-headline-md text-primary">₹1,24,500</span>
                </li>
              </ul>
            </section>
            
            <section className="bg-surface-container-lowest border border-outline-earth rounded-xl p-stack-lg shadow-sm">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-stack-md">Actions</h3>
              <div className="flex flex-col space-y-3">
                <button className="w-full bg-primary text-on-primary font-label-lg text-label-lg py-3 rounded-lg shadow-sm hover:bg-primary-container hover:text-on-primary-container active:scale-95 transition-all flex items-center justify-center h-touch-target">
                  <span className="material-symbols-outlined mr-2">download</span>
                  Download Receipt
                </button>
                <button className="w-full bg-surface-container-lowest border border-primary text-primary font-label-lg text-label-lg py-3 rounded-lg hover:bg-surface-container-low active:scale-95 transition-all flex items-center justify-center h-touch-target">
                  <span className="material-symbols-outlined mr-2">support_agent</span>
                  Contact Support
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
