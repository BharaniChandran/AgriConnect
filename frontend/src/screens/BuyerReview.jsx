import React from 'react';

export default function BuyerReview() {
  return (
    <div className="bg-background text-on-background min-h-screen font-body-md">
      <header className="w-full sticky top-0 z-50 bg-surface-bright border-b border-outline-earth">
        <div className="flex justify-between items-center px-tablet-margin lg:px-0 max-w-max-width-desktop mx-auto h-touch-target">
          <div className="flex items-center gap-6">
            <h1 className="font-headline-lg text-primary">AgriConnect</h1>
            <nav className="hidden md:flex items-center gap-4 h-full">
              <a className="font-label-lg text-label-lg text-on-surface-variant hover:text-primary transition-colors duration-200 hover:bg-surface-container-low h-full flex items-center px-3" href="#">Home</a>
              <a className="font-label-lg text-label-lg text-primary border-b-2 border-primary h-full flex items-center px-3" href="#">Lots</a>
              <a className="font-label-lg text-label-lg text-on-surface-variant hover:text-primary transition-colors duration-200 hover:bg-surface-container-low h-full flex items-center px-3" href="#">Deliveries</a>
              <a className="font-label-lg text-label-lg text-on-surface-variant hover:text-primary transition-colors duration-200 hover:bg-surface-container-low h-full flex items-center px-3" href="#">Payments</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-surface-container-low rounded-full transition-colors active:opacity-80">
              <span className="material-symbols-outlined text-on-surface-variant">language</span>
            </button>
            <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant">
              <img alt="User profile photo" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJmLV1NHxfbf9EPYWvJlXB35j4rccJO6-qOhy_huvMf7to8JoVayfKpvit6V82HasNNYGNm86hgCAJAi3ShCGNCoQWgKYoUC6NhVZmNu0iV_LeIuUtt4Pj5n_SibZl9t9S3yJTPUAdhFoQxbotn8YJ06odHc6TFCOpgkLo1ygdtzqMNLndyBymBVYjG7yI9zWALQ9XRtp6P4kuX22VyxE1_uO2cExbbMAaSHpf6IoO5tauzBDFMDak" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-max-width-desktop mx-auto px-tablet-margin py-stack-lg lg:px-0">
        <div className="mb-stack-lg flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2 text-on-surface-variant mb-2">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>arrow_back</span>
              <a className="font-label-lg text-label-lg hover:underline" href="#">Back to Lots</a>
            </div>
            <h2 className="font-display-lg text-display-lg text-primary">Review Lot #4829</h2>
          </div>
          <div className="flex gap-4">
            <button className="h-12 px-6 rounded-lg border-2 border-error text-error font-label-lg text-label-lg hover:bg-error-container transition-colors shadow-sm flex items-center gap-2">
              <span className="material-symbols-outlined">close</span>
              Reject
            </button>
            <button className="h-12 px-8 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-container transition-colors shadow-[0_2px_0_0_#154212] flex items-center gap-2">
              <span className="material-symbols-outlined">check</span>
              Accept Lot
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          <div className="lg:col-span-8 flex flex-col gap-gutter">
            <div className="grid grid-cols-3 gap-4 bg-surface rounded-xl p-4 border border-outline-earth shadow-sm">
              <div className="col-span-2 h-64 rounded-lg overflow-hidden bg-surface-container-high relative">
                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkYZNbffaBrwxwVRDZg-7hI6OJL0Bthw5JEbzJn-J-L7k_9dBH37B6-7FxXqXvrc0fB-HdJpRQe8n8QgZ-aj2lyE-DOBIOY1HK3o18hGRTz4OTdHdfPInyX0peOZUWaeWFQDRLVEa_xRcwgC-r2cMztZNopcyp-O-5mUJgKZ86zLa3T45AkshrrYrtXQ3qtNIuCE2UNcILrsdYJTL88L7VTkn1dAbZQVNarBPsTEA_nVU_TEXHrFLT" />
                <div className="absolute bottom-4 left-4 bg-surface/90 backdrop-blur-sm px-3 py-1 rounded-full border border-outline-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">photo_camera</span>
                  <span className="font-label-md text-label-md text-on-surface">Arrival Photo</span>
                </div>
              </div>
              <div className="col-span-1 flex flex-col gap-4">
                <div className="h-30 flex-1 rounded-lg overflow-hidden bg-surface-container-high">
                  <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrjQXJ_xMIpbN8tv7LD0efLkpTBCVnVzSefoIlS_kJ-6CK0j_IeUvCHxtZL9jkmieYHsyRqT9-n1N4qJ1nTrmwNA_4wj2Se4rFjGDAZPox-S3ZZmjbWyv75RiQbhJtSk4a9tjtl2HdPvtDjVos0U1kiS8NZf2E0H35Q_1NI7MG-nEPPPMbGqVXjlToPm_CLvUmXepM80RoQ1zFWFmXgujNGE_4vrZ2MhGIDwIPfoxkOwqa9rOscS9B" />
                </div>
                <div className="h-30 flex-1 rounded-lg overflow-hidden bg-surface-container-high">
                  <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNwtUXL8D9OHcHdVj2KpOHAL_gfWvC9NAJBPyybELGh5SC-uqyb235May1h-5jvTRQP4ldmkTL7fobdV61T8HBjeXg684dAloABDpbNSMvc9XrcXYCNw70lVN6OciGz1UHurTw8egxnHUZu8r3RV3aPzki68R6QQL-GtS34fhU1N9h8HXkQY6FFEVmSO9M-R7qorJhglWNRovzW6SVchmbSFqC0l-oUAYnWiw7B6NYq18dXyTn3m9d" />
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-xl p-6 border border-outline-earth shadow-sm">
              <h3 className="font-headline-md text-headline-md text-primary mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined">verified</span>
                Quality Specifications
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex flex-col gap-1">
                  <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Variety</span>
                  <span className="font-body-lg text-body-lg text-on-surface">Roma</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Grade</span>
                  <span className="font-body-lg text-body-lg text-primary font-bold">Grade A</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Total Weight</span>
                  <span className="font-body-lg text-body-lg text-on-surface">1,250 kg</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Bags/Crates</span>
                  <span className="font-body-lg text-body-lg text-on-surface">50 Crates</span>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-outline-variant">
                <h4 className="font-label-lg text-label-lg text-on-surface-variant mb-4">Inspection Notes</h4>
                <p className="font-body-md text-body-md text-on-surface">Visual inspection confirms uniform color and size. Moisture levels are within acceptable parameters (12%). Minor surface blemishes noted on approx 2% of yield, well within Grade A tolerance.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-gutter">
            <div className="bg-surface rounded-xl p-6 border border-outline-earth shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-surface-container-high border-2 border-primary-container overflow-hidden">
                    <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCL-uNYLIcO-e-1MVxvUuRhT0ZsCygC7uaup3ufXUa3se4B-xfKLl7xR2CCGC5Zy8Ntm4N6URETxduREQkNqRHyujiKxqGWoqJYTiN9Q1BRPFIgk__jvY6M-n-Vm-84RQP76NH20wYIU4PbUlQurYzYtTXSjnf8zxRQtfNpxsQo03M5mUF8K0ok0Plq7lcNcceoY5czZG0-Pu7KI11vuAahYYsHrSm2XSEFAzJ8vxUMqAYgoo215AJ4" />
                  </div>
                  <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface">Ram Singh</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      Nashik, Maharashtra
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mb-4">
                <span className="px-2 py-1 bg-surface-container-low border border-outline-variant rounded text-label-md font-label-md text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-secondary">star</span> 4.8 Rating
                </span>
                <span className="px-2 py-1 bg-surface-container-low border border-outline-variant rounded text-label-md font-label-md text-on-surface-variant">
                  Premium Partner
                </span>
              </div>
              <button className="w-full py-3 rounded border border-primary text-primary font-label-lg text-label-lg hover:bg-surface-container-low transition-colors flex justify-center items-center gap-2">
                <span className="material-symbols-outlined">chat</span>
                Contact Farmer
              </button>
            </div>

            <div className="bg-surface rounded-xl p-6 border border-outline-earth shadow-sm flex-1">
              <h3 className="font-headline-md text-headline-md text-primary mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined">local_shipping</span>
                Logistics
              </h3>
              <div className="relative pl-6 border-l-2 border-surface-variant flex flex-col gap-6">
                <div className="relative">
                  <div className="absolute w-3 h-3 bg-primary rounded-full -left-[1.65rem] top-1"></div>
                  <p className="font-label-md text-label-md text-on-surface-variant uppercase">Dispatched</p>
                  <p className="font-body-md text-body-md text-on-surface">Oct 24, 06:00 AM</p>
                </div>
                <div className="relative">
                  <div className="absolute w-3 h-3 bg-secondary rounded-full -left-[1.65rem] top-1"></div>
                  <p className="font-label-md text-label-md text-on-surface-variant uppercase">Arrived at Depot</p>
                  <p className="font-body-md text-body-md text-on-surface font-bold">Oct 24, 11:30 AM</p>
                </div>
                <div className="relative opacity-50">
                  <div className="absolute w-3 h-3 bg-outline-variant rounded-full -left-[1.65rem] top-1 border-2 border-surface"></div>
                  <p className="font-label-md text-label-md text-on-surface-variant uppercase">Payment Cleared</p>
                  <p className="font-body-md text-body-md text-on-surface">Pending Acceptance</p>
                </div>
              </div>
              <div className="mt-8 bg-surface-container-low p-4 rounded-lg border border-outline-variant">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-label-md text-label-md text-on-surface-variant">Market Price Match</span>
                  <span className="font-label-md text-label-md text-success-green flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">trending_up</span> +2%
                  </span>
                </div>
                <div className="w-full bg-surface-variant rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{width: '75%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
