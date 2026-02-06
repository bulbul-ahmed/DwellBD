import { Shield } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl bg-white rounded-lg shadow-sm p-8 md:p-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Shield className="mx-auto h-16 w-16 text-primary-600 mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: February 2026</p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
          <p className="text-gray-700 mb-4">
            We collect information that you provide directly to us, including:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
            <li>Name, email address, and phone number</li>
            <li>Property listing details (for property owners)</li>
            <li>Messages and inquiries sent through our platform</li>
            <li>Profile information and preferences</li>
            <li>Payment information (processed securely by third-party providers)</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="text-gray-700 mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
            <li>Provide, maintain, and improve our services</li>
            <li>Connect tenants with property owners</li>
            <li>Send you updates, notifications, and marketing communications</li>
            <li>Verify property listings and user accounts</li>
            <li>Prevent fraud and ensure platform security</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Information Sharing</h2>
          <p className="text-gray-700 mb-4">
            We do not sell your personal information. We may share your information with:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
            <li><strong>Property owners and tenants:</strong> When you send an inquiry or list a property</li>
            <li><strong>Service providers:</strong> Who help us operate our platform</li>
            <li><strong>Legal authorities:</strong> When required by law</li>
            <li><strong>Business transfers:</strong> In case of merger, acquisition, or asset sale</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Data Security</h2>
          <p className="text-gray-700 mb-6">
            We implement appropriate technical and organizational measures to protect your personal
            information. However, no method of transmission over the internet is 100% secure, and we
            cannot guarantee absolute security.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Cookies and Tracking</h2>
          <p className="text-gray-700 mb-6">
            We use cookies and similar tracking technologies to improve your experience, analyze
            platform usage, and deliver personalized content. You can control cookies through your
            browser settings.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Your Rights</h2>
          <p className="text-gray-700 mb-4">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
            <li>Access and update your personal information</li>
            <li>Delete your account and associated data</li>
            <li>Opt-out of marketing communications</li>
            <li>Request a copy of your data</li>
            <li>Lodge a complaint with relevant authorities</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Children's Privacy</h2>
          <p className="text-gray-700 mb-6">
            Our services are not intended for users under 18 years of age. We do not knowingly
            collect information from children.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Changes to This Policy</h2>
          <p className="text-gray-700 mb-6">
            We may update this privacy policy from time to time. We will notify you of significant
            changes by posting the new policy on this page and updating the "Last updated" date.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Contact Us</h2>
          <p className="text-gray-700 mb-4">
            If you have questions about this privacy policy or our data practices, please contact us:
          </p>
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <p className="text-gray-700 mb-2"><strong>Email:</strong> privacy@bdfhub.com</p>
            <p className="text-gray-700 mb-2"><strong>Phone:</strong> +880 1712-345678</p>
            <p className="text-gray-700"><strong>Address:</strong> Dhaka, Bangladesh</p>
          </div>

          <div className="mt-12 p-6 bg-primary-50 rounded-lg border border-primary-200">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> By using BDFlatHub, you agree to this Privacy Policy and our Terms
              of Service. If you do not agree, please do not use our services.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
