export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-nord-6 mb-2">Terms of Service</h1>
      <p className="text-nord-4/60 mb-8">Last updated: December 28, 2025</p>

      <div className="space-y-8 text-nord-4/80 leading-relaxed">
        
        <section>
          <h2 className="text-2xl font-bold text-nord-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using WallCraft, you accept and agree to be bound by the terms and provision of this agreement. 
            If you do not agree to abide by these above, please do not use this service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-nord-8 mb-4">2. Intellectual Property & Licenses</h2>
          
          <h3 className="text-xl font-semibold text-nord-6 mt-4 mb-2">2.1 The Source Code</h3>
          <p>
            The source code for WallCraft is open-source and licensed under the <strong>MIT License</strong>. You are free to use, copy, modify, merge, 
            publish, distribute, sublicense, and/or sell copies of the Software, subject to the conditions of the license.
          </p>

          <h3 className="text-xl font-semibold text-nord-6 mt-4 mb-2">2.2 The Wallpapers</h3>
          <p>
            The wallpapers generated and displayed on this site are derived from images sourced from <strong>Unsplash</strong>. 
            These images are subject to the <a href="https://unsplash.com/license" className="text-nord-8 underline">Unsplash License</a>.
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>You can download and use these photos for free (commercial and non-commercial purposes).</li>
            <li>You do not need to ask permission from or provide credit to the photographer or Unsplash, although it is appreciated.</li>
            <li><strong>Restriction:</strong> You cannot sell the photos without significant modification, nor can you compile them to replicate a similar or competing service.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-nord-8 mb-4">3. User Conduct</h2>
          <p>
            You agree not to use the website or its services to:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Upload any content to the "Studio" that is illegal, harmful, threatening, or offensive.</li>
            <li>Attempt to bypass API rate limits or interfere with the proper working of the automation scripts.</li>
            <li>Use the service for any purpose that is unlawful or prohibited by these Terms.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-nord-8 mb-4">4. Disclaimer of Warranties</h2>
          <p>
            The service is provided on an "AS IS" and "AS AVAILABLE" basis. WallCraft makes no representations or warranties of any kind, 
            express or implied, as to the operation of their services, or the information, content, or materials included therein.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-nord-8 mb-4">5. Limitation of Liability</h2>
          <p>
            In no event shall WallCraft, its contributors, or suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, 
            or due to business interruption) arising out of the use or inability to use the materials on WallCraft's website.
          </p>
        </section>

      </div>
    </div>
  );
}