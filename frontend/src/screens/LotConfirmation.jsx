import React from 'react';

export default function LotConfirmation() {
  return (
    <div className="bg-background text-on-background font-body-md min-h-screen">
      <header className="hidden md:flex bg-surface-bright border-b border-outline-earth w-full sticky top-0 z-50 h-touch-target justify-between items-center px-tablet-margin lg:px-0 max-w-max-width-desktop mx-auto">
        <div className="font-headline-lg text-primary">AgriConnect</div>
        <nav className="flex space-x-8">
          <a className="text-on-surface-variant hover:text-primary transition-colors duration-200 hover:bg-surface-container-low px-4 py-2 rounded-xl" href="#">Home</a>
          <a className="text-primary border-b-2 border-primary pb-1 font-label-lg px-4 py-2" href="#">Lots</a>
          <a className="text-on-surface-variant hover:text-primary transition-colors duration-200 hover:bg-surface-container-low px-4 py-2 rounded-xl" href="#">Deliveries</a>
          <a className="text-on-surface-variant hover:text-primary transition-colors duration-200 hover:bg-surface-container-low px-4 py-2 rounded-xl" href="#">Payments</a>
        </nav>
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full hover:bg-surface-container-low transition-colors duration-200 text-on-surface-variant">
            <span className="material-symbols-outlined">language</span>
          </button>
          <div className="w-10 h-10 rounded-full bg-surface-container-high border border-outline flex items-center justify-center overflow-hidden">
            <img alt="User profile photo" className="object-cover w-full h-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpxl_x7LXpCZB_YDfLT9SL8YTROYlBDHgj7ZXrjw06eA-bgsjGUj_jZVmewaPmsRHk3JzHBCs_qHmY91h5UmZnI8ogqOEOZklQoE-3lFd-TIL1b75G_A_wX53ZY_3LaTuiHIZSvHIVJhbTnT5ZG0vAnb6yIuKTce6cW6LvpDYOGw1gJ90tEH5QSjpalhv_-1IHzn4VOjXdT88cbJi-cfXoT9UQ8QTvcs9KEo8vNLFU8HALJy60tO6v" />
          </div>
        </div>
      </header>

      <main className="max-w-max-width-desktop mx-auto px-mobile-margin md:px-tablet-margin py-8 md:py-12">
        <div className="mb-stack-lg md:mb-12 text-center md:text-left">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-container text-primary mb-6 shadow-sm border border-primary-fixed-dim">
            <span className="material-symbols-outlined" style={{fontSize: '32px', fontVariationSettings: "'FILL' 1"}}>check_circle</span>
          </div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-on-background mb-2">Lot Successfully Confirmed</h1>
          <p className="font-body-lg text-on-surface-variant max-w-2xl">Your produce lot has been registered and is now visible to verified buyers in the network.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-7 space-y-8">
            <div className="bg-surface-container-lowest border border-outline-earth rounded-xl p-6 shadow-sm">
              <h2 className="font-headline-md text-on-background mb-6 flex items-center">
                <span className="material-symbols-outlined mr-3 text-secondary">agriculture</span>
                Lot Summary
              </h2>
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <div className="bg-surface p-4 rounded-lg border border-surface-container-high">
                  <span className="block font-label-md text-on-surface-variant mb-1 uppercase tracking-wider">Crop</span>
                  <span className="block font-body-lg text-on-background font-semibold">Tomato</span>
                </div>
                <div className="bg-surface p-4 rounded-lg border border-surface-container-high">
                  <span className="block font-label-md text-on-surface-variant mb-1 uppercase tracking-wider">Quantity</span>
                  <span className="block font-body-lg text-on-background font-semibold">500 kg</span>
                </div>
                <div className="bg-surface p-4 rounded-lg border border-surface-container-high">
                  <span className="block font-label-md text-on-surface-variant mb-1 uppercase tracking-wider">Grade</span>
                  <span className="block font-body-lg text-on-background font-semibold text-secondary-container bg-surface-container-high inline-block px-2 py-0.5 rounded">Grade A</span>
                </div>
                <div className="bg-surface p-4 rounded-lg border border-surface-container-high">
                  <span className="block font-label-md text-on-surface-variant mb-1 uppercase tracking-wider">Base Price</span>
                  <span className="block font-body-lg text-on-background font-semibold text-primary">₹25 / kg</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-earth rounded-xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'radial-gradient(#154212 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
              <h2 className="font-headline-md text-on-background mb-6 flex items-center relative z-10">
                <span className="material-symbols-outlined mr-3 text-secondary">storefront</span>
                Designated Hub
              </h2>
              <div className="flex items-start space-x-4 relative z-10">
                <div className="w-16 h-16 rounded-lg bg-surface-container-high border border-outline flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-outline-earth" style={{fontSize: '32px'}}>map</span>
                </div>
                <div>
                  <h3 className="font-body-lg text-on-background mb-1">Azadpur Mandi</h3>
                  <p className="font-body-md text-on-surface-variant mb-4">Central Market, Block B, Entry Gate 4.</p>
                  <button className="inline-flex items-center font-label-lg text-primary hover:text-primary-container transition-colors">
                    <span className="material-symbols-outlined mr-1" style={{fontSize: '18px'}}>directions</span>
                    Get Directions
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 space-y-8">
            <div className="bg-surface-container-highest border border-outline-variant rounded-xl p-6 shadow-sm">
              <h2 className="font-headline-md text-on-background mb-6">What Happens Next?</h2>
              <div className="relative">
                <div className="absolute left-[15px] top-4 bottom-8 w-0.5 bg-outline-variant"></div>
                <div className="flex mb-8 relative">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 z-10 shadow-sm ring-4 ring-surface-container-highest">
                    <span className="material-symbols-outlined text-on-primary" style={{fontSize: '16px'}}>done</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-body-lg text-on-background">Lot Confirmed</h3>
                    <p className="font-body-md text-on-surface-variant mt-1">Your details have been saved securely.</p>
                  </div>
                </div>
                <div className="flex mb-8 relative">
                  <div className="w-8 h-8 rounded-full bg-surface border-2 border-primary flex items-center justify-center shrink-0 z-10 shadow-sm ring-4 ring-surface-container-highest">
                    <span className="material-symbols-outlined text-primary" style={{fontSize: '16px'}}>local_shipping</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-body-lg text-on-background">Arrange Transport</h3>
                    <p className="font-body-md text-on-surface-variant mt-1">Book a vehicle to move your produce to the mandi.</p>
                  </div>
                </div>
                <div className="flex relative">
                  <div className="w-8 h-8 rounded-full bg-surface border-2 border-outline-variant flex items-center justify-center shrink-0 z-10 shadow-sm ring-4 ring-surface-container-highest">
                    <span className="material-symbols-outlined text-outline-variant" style={{fontSize: '16px'}}>receipt_long</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-body-lg text-outline-variant">Quality Check &amp; Payment</h3>
                    <p className="font-body-md text-outline-variant mt-1 opacity-80">Produce is assessed at the hub before final payment.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button className="w-full h-touch-target bg-primary text-on-primary font-label-lg rounded-full shadow-sm flex items-center justify-center hover:bg-primary-container active:scale-[0.98] transition-all border-b-2 border-on-primary-fixed">
                <span className="material-symbols-outlined mr-2">local_shipping</span>
                Book Transport Now
              </button>
              <button className="w-full h-touch-target bg-surface text-primary border border-primary font-label-lg rounded-full flex items-center justify-center hover:bg-surface-container-low active:scale-[0.98] transition-all">
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
