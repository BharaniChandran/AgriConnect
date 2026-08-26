import React from 'react';

export default function RejectionFlow() {
  return (
    <div className="bg-background text-on-surface font-body-md h-screen flex flex-col overflow-hidden">
      <header className="bg-surface-bright border-b border-outline-earth w-full flex-none">
        <div className="flex justify-between items-center px-mobile-margin md:px-tablet-margin lg:px-0 max-w-max-width-desktop mx-auto h-touch-target">
          <div className="flex items-center gap-4">
            <button className="text-on-surface-variant hover:bg-surface-container-low transition-colors duration-200 rounded-full p-2 flex items-center justify-center">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="font-headline-lg text-primary">AgriConnect</h1>
          </div>
          <div className="text-on-surface-variant">
            <span className="font-label-lg text-label-lg uppercase tracking-wider">Lot #8472-A</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto w-full max-w-max-width-desktop mx-auto px-mobile-margin md:px-tablet-margin lg:px-0 py-stack-lg">
        <div className="mb-stack-lg">
          <h2 className="font-display-lg text-display-lg text-on-surface">Report Rejection</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Document issues with the incoming delivery.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full pb-20">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-surface-container-lowest border border-outline-earth rounded-xl p-6">
              <h3 className="font-headline-md text-headline-md mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">error</span>
                Primary Reason
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="cursor-pointer">
                  <input className="peer sr-only" name="reason" type="radio" />
                  <div className="border border-outline-variant rounded-lg p-4 text-center peer-checked:border-primary peer-checked:bg-primary-container peer-checked:text-on-primary-container transition-all hover:bg-surface-container-low">
                    <span className="material-symbols-outlined block mb-2 mx-auto">pest_control</span>
                    <span className="font-label-md text-label-md">Quality</span>
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input defaultChecked className="peer sr-only" name="reason" type="radio" />
                  <div className="border border-outline-variant rounded-lg p-4 text-center peer-checked:border-primary peer-checked:bg-primary-container peer-checked:text-on-primary-container transition-all hover:bg-surface-container-low">
                    <span className="material-symbols-outlined block mb-2 mx-auto">water_drop</span>
                    <span className="font-label-md text-label-md">Spoilage</span>
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input className="peer sr-only" name="reason" type="radio" />
                  <div className="border border-outline-variant rounded-lg p-4 text-center peer-checked:border-primary peer-checked:bg-primary-container peer-checked:text-on-primary-container transition-all hover:bg-surface-container-low">
                    <span className="material-symbols-outlined block mb-2 mx-auto">scale</span>
                    <span className="font-label-md text-label-md">Underweight</span>
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input className="peer sr-only" name="reason" type="radio" />
                  <div className="border border-outline-variant rounded-lg p-4 text-center peer-checked:border-primary peer-checked:bg-primary-container peer-checked:text-on-primary-container transition-all hover:bg-surface-container-low">
                    <span className="material-symbols-outlined block mb-2 mx-auto">more_horiz</span>
                    <span className="font-label-md text-label-md">Other</span>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="bg-surface-container-lowest border border-outline-earth rounded-xl p-6">
              <h3 className="font-headline-md text-headline-md mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">pie_chart</span>
                Quantity Split
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">Total Delivery: <strong>1,200 kg</strong></p>
              
              <div className="relative h-12 w-full bg-error-container rounded-lg overflow-hidden flex mb-8">
                <div className="bg-primary h-full transition-all duration-300 flex items-center px-4" id="accepted-bar" style={{width: '75%'}}>
                  <span className="font-label-lg text-label-lg text-on-primary">Accepted</span>
                </div>
                <div className="flex-1 h-full bg-error flex items-center justify-end px-4 transition-all duration-300" id="rejected-bar">
                  <span className="font-label-lg text-label-lg text-on-error">Rejected</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Accepted Quantity (kg)</label>
                  <input className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary text-on-surface font-body-lg p-3 outline-none rounded-t-md transition-colors" type="number" defaultValue="900" />
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Rejected Quantity (kg)</label>
                  <input className="w-full bg-error-container border-b-2 border-error focus:border-error text-on-surface font-body-lg p-3 outline-none rounded-t-md transition-colors" type="number" defaultValue="300" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-surface-container-lowest border border-outline-earth rounded-xl p-6 flex-1">
              <h3 className="font-headline-md text-headline-md mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">add_a_photo</span>
                Evidence
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-4">Upload photos of the spoiled goods.</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="relative aspect-square rounded-lg overflow-hidden border border-outline-variant group">
                  <div className="bg-cover bg-center w-full h-full" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBfrMSeMMv1SMJAdTGb0ahE_7SSF05Amyx8MzWh0ZQsac22vYOlXWc-OCQGanFSbi9wGeTol1U_fQJhpCRR7tyWYgyrGVHICGyNryN2FOLAlxZNVgo7HaWSgLoa2Vl7fNqOUSxbdfKhoBt5dO3cq8gg4TLOF4UYeftWZSN7VnwvW96uAeiPM1c8LpNPnypJu816IzGAYYI4WZ0CsxqNAH802q5SGR8TkonUX3FNsMLn4hpSPFI7RqBm')"}}></div>
                  <button className="absolute top-2 right-2 bg-inverse-surface/80 text-inverse-on-surface p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
                <button className="aspect-square rounded-lg border-2 border-dashed border-outline-variant hover:border-primary hover:bg-surface-container-low flex flex-col items-center justify-center gap-2 text-on-surface-variant transition-colors">
                  <span className="material-symbols-outlined text-3xl">upload</span>
                  <span className="font-label-md text-label-md">Add Photo</span>
                </button>
              </div>
              <div className="mt-6">
                <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Additional Notes</label>
                <textarea className="w-full bg-surface-container-low border border-outline-variant focus:border-primary text-on-surface font-body-md p-3 rounded-lg outline-none min-h-[120px] resize-none" placeholder="Describe the severity of the spoilage..."></textarea>
              </div>
            </div>
            
            <div className="bg-surface-container-lowest border border-outline-earth rounded-xl p-6 shadow-[0_2px_0_0_rgba(21,66,18,0.1)]">
              <div className="flex flex-col gap-4">
                <button className="w-full bg-error text-on-error font-label-lg text-label-lg py-4 rounded-full shadow-[0_2px_0_0_rgba(186,26,26,0.3)] active:translate-y-[2px] active:shadow-none transition-all flex justify-center items-center gap-2">
                  <span className="material-symbols-outlined">assignment_returned</span>
                  Confirm Rejection
                </button>
                <button className="w-full bg-transparent border border-outline-earth text-on-surface font-label-lg text-label-lg py-4 rounded-full hover:bg-surface-container-low transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
