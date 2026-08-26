import React from 'react';

export default function Settings() {
  return (
    <div className="bg-background text-on-background min-h-screen">
      <nav className="bg-surface-bright dark:bg-surface-dim font-body-md text-body-md md:font-label-lg md:text-label-lg w-full sticky top-0 z-50 border-b border-outline-earth dark:border-outline-variant flat no-shadows">
        <div className="flex justify-between items-center px-mobile-margin md:px-tablet-margin lg:px-0 max-w-max-width-desktop mx-auto h-touch-target">
          <div className="font-headline-lg-mobile md:font-headline-lg text-primary dark:text-primary-fixed">AgriConnect</div>
          <div className="hidden md:flex space-x-6">
            <a className="text-on-surface-variant dark:text-outline-variant hover:text-primary hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-colors duration-200 active:opacity-80 transition-opacity" href="#">Home</a>
            <a className="text-on-surface-variant dark:text-outline-variant hover:text-primary hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-colors duration-200 active:opacity-80 transition-opacity" href="#">Lots</a>
            <a className="text-on-surface-variant dark:text-outline-variant hover:text-primary hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-colors duration-200 active:opacity-80 transition-opacity" href="#">Deliveries</a>
            <a className="text-on-surface-variant dark:text-outline-variant hover:text-primary hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-colors duration-200 active:opacity-80 transition-opacity" href="#">Payments</a>
          </div>
          <div className="flex items-center space-x-4">
            <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim cursor-pointer">language</span>
            <img alt="User profile photo" className="w-8 h-8 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCD2AgqCaVbZrIhXrOMj9twgE9Pm8s_I55kYD0X-XpXCbMZDDv9qcxk0mBQIdFhQWpb9W4wUgp2qWg4qIoGzbLHukmFbFfKVkXRjC1TM1u4tyTQnTangIzs2sGBxGw7gdQDF7cGwgTV9o721nW74xJ4WbawdhLauCk9kWFg0mqdxKFkuDBH8brQgPwVGXGpOIFG7tX3vKHxpMN4ppD-eJdGLPbuepYmANniyZ6FL__ZsKaZak6m9q-M" />
          </div>
        </div>
      </nav>

      <main className="max-w-max-width-desktop mx-auto px-mobile-margin md:px-tablet-margin lg:px-0 py-8">
        <header className="mb-8">
          <h1 className="font-headline-lg text-headline-lg text-primary">Settings</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">Manage your account preferences and language settings.</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          <div className="md:col-span-5 lg:col-span-4">
            <div className="bg-surface-container-lowest border border-outline-earth rounded-xl p-6 h-full flex flex-col shadow-[0_2px_0_0_rgba(21,66,18,0.1)]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-headline-md text-headline-md text-primary">Language</h2>
                <span className="material-symbols-outlined text-primary">translate</span>
              </div>
              <div className="flex-grow flex flex-col justify-center items-center py-8">
                <div className="text-center">
                  <span className="font-display-lg text-display-lg text-on-surface block mb-2">EN</span>
                  <span className="font-body-lg text-body-lg text-on-surface-variant">English (US)</span>
                </div>
              </div>
              <button className="w-full bg-primary text-on-primary font-label-lg text-label-lg py-3 rounded-lg shadow-[0_2px_0_0_rgba(21,66,18,0.5)] hover:bg-primary-container hover:text-on-primary-container transition-colors duration-200 mt-auto flex items-center justify-center space-x-2 h-touch-target">
                <span className="material-symbols-outlined">edit</span>
                <span>Change Language</span>
              </button>
            </div>
          </div>
          <div className="md:col-span-7 lg:col-span-8 space-y-4">
            <section className="bg-surface-container-lowest border border-outline-earth rounded-xl overflow-hidden">
              <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant">
                <h3 className="font-headline-md text-headline-md text-primary">Account Preferences</h3>
              </div>
              <div className="divide-y divide-outline-variant">
                <a className="flex items-center justify-between p-6 hover:bg-surface-container-lowest transition-colors duration-200 group" href="#">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors duration-200">
                      <span className="material-symbols-outlined">person</span>
                    </div>
                    <div>
                      <h4 className="font-body-lg text-body-lg text-on-surface">Personal Information</h4>
                      <p className="font-body-md text-body-md text-on-surface-variant">Update your name, email, and phone number</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline-earth group-hover:text-primary transition-colors duration-200">chevron_right</span>
                </a>
                <a className="flex items-center justify-between p-6 hover:bg-surface-container-lowest transition-colors duration-200 group" href="#">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors duration-200">
                      <span className="material-symbols-outlined">lock</span>
                    </div>
                    <div>
                      <h4 className="font-body-lg text-body-lg text-on-surface">Security</h4>
                      <p className="font-body-md text-body-md text-on-surface-variant">Manage password and two-factor authentication</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline-earth group-hover:text-primary transition-colors duration-200">chevron_right</span>
                </a>
              </div>
            </section>
            <section className="bg-surface-container-lowest border border-outline-earth rounded-xl overflow-hidden">
              <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant">
                <h3 className="font-headline-md text-headline-md text-primary">Notifications</h3>
              </div>
              <div className="divide-y divide-outline-variant">
                <div className="flex items-center justify-between p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">notifications_active</span>
                    </div>
                    <div>
                      <h4 className="font-body-lg text-body-lg text-on-surface">Push Notifications</h4>
                      <p className="font-body-md text-body-md text-on-surface-variant">Receive alerts on your device</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input className="sr-only peer" type="checkbox" defaultChecked />
                    <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">mail</span>
                    </div>
                    <div>
                      <h4 className="font-body-lg text-body-lg text-on-surface">Email Updates</h4>
                      <p className="font-body-md text-body-md text-on-surface-variant">Weekly summaries and important alerts</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input className="sr-only peer" type="checkbox" />
                    <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
