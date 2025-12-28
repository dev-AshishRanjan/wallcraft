export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-nord-6 mb-2">Privacy Policy</h1>
      <p className="text-nord-4/60 mb-8">Last updated: December 28, 2025</p>

      <div className="space-y-8 text-nord-4/80 leading-relaxed">
        
        <section>
          <h2 className="text-2xl font-bold text-nord-8 mb-4">1. Introduction</h2>
          <p>
            Welcome to WallCraft ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. 
            This Privacy Policy explains how we collect, use, and share your information when you visit our website.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-nord-8 mb-4">2. WallCraft Studio & Local Processing</h2>
          <p className="mb-4">
            <strong>We do not upload your images to any server.</strong>
          </p>
          <p>
            The "WallCraft Studio" feature operates entirely client-side using HTML5 Canvas technology. When you upload an image to apply a theme, 
            the processing happens directly within your web browser on your device. The image data never leaves your computer, and we do not have access to, 
            store, or transmit your files.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-nord-8 mb-4">3. Data We Collect</h2>
          <p>
            As a static website hosted on GitHub Pages, we operate with a "Zero-Database" architecture for user data. We do not require account registration, 
            and we do not collect personal identifiers like names, emails, or phone numbers.
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li><strong>Usage Data:</strong> We may collect anonymous usage statistics via GitHub Pages standard logging (e.g., browser type, referring site).</li>
            <li><strong>Local Storage:</strong> We use your browser's local storage to save your theme preferences. This data stays on your device.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-nord-8 mb-4">4. Third-Party Services</h2>
          <p>We rely on the following third-party services, which may collect their own data governed by their respective privacy policies:</p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li><strong>Unsplash:</strong> We fetch wallpapers via the Unsplash API. Please refer to <a href="https://unsplash.com/privacy" className="text-nord-8 underline">Unsplash's Privacy Policy</a>.</li>
            <li><strong>GitHub Pages:</strong> Our site is hosted by GitHub. Please refer to <a href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement" className="text-nord-8 underline">GitHub's Privacy Statement</a>.</li>
            <li><strong>jsDelivr:</strong> We use jsDelivr to serve database content.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-nord-8 mb-4">5. Changes to This Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. 
            You are advised to review this Privacy Policy periodically for any changes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-nord-8 mb-4">6. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us via our GitHub Repository issues page.
          </p>
        </section>

      </div>
    </div>
  );
}