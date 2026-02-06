import { FileText } from 'lucide-react'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl bg-white rounded-lg shadow-sm p-8 md:p-12">
        {/* Header */}
        <div className="text-center mb-12">
          <FileText className="mx-auto h-16 w-16 text-primary-600 mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600">Last updated: February 2026</p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-700 mb-6">
            By accessing or using BDFlatHub ("the Service"), you agree to be bound by these Terms of
            Service. If you do not agree to these terms, please do not use our Service.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Description of Service</h2>
          <p className="text-gray-700 mb-6">
            BDFlatHub is an online platform that connects property owners with potential tenants in
            Bangladesh. We provide tools for listing properties, searching for rentals, and
            facilitating communication between parties.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. User Accounts</h2>
          <p className="text-gray-700 mb-4">
            To use certain features, you must create an account. You agree to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Notify us immediately of unauthorized use</li>
            <li>Be responsible for all activities under your account</li>
            <li>Not share your account with others</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Property Listings</h2>
          <p className="text-gray-700 mb-4">
            Property owners agree to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
            <li>Provide accurate and truthful property information</li>
            <li>Upload genuine photos of the property</li>
            <li>Ensure they have the right to list the property</li>
            <li>Respond promptly to genuine inquiries</li>
            <li>Update or remove listings when properties are no longer available</li>
            <li>Comply with all applicable laws and regulations</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. User Conduct</h2>
          <p className="text-gray-700 mb-4">
            You agree NOT to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
            <li>Post false, misleading, or fraudulent information</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Upload malicious code or viruses</li>
            <li>Violate intellectual property rights</li>
            <li>Use automated tools to scrape or collect data</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Use the Service for illegal purposes</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Content Ownership</h2>
          <p className="text-gray-700 mb-6">
            You retain ownership of content you post on BDFlatHub. By posting content, you grant us a
            non-exclusive, worldwide license to use, display, and distribute your content in
            connection with the Service.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Verification and Moderation</h2>
          <p className="text-gray-700 mb-6">
            BDFlatHub reserves the right to verify, moderate, or remove any content or user account at
            our discretion. We do not guarantee the accuracy of user-provided information.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Disclaimer of Warranties</h2>
          <p className="text-gray-700 mb-6">
            The Service is provided "as is" without warranties of any kind. We do not guarantee:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
            <li>Uninterrupted or error-free service</li>
            <li>Accuracy of listings or user information</li>
            <li>Success in finding properties or tenants</li>
            <li>Quality, safety, or legality of listed properties</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Limitation of Liability</h2>
          <p className="text-gray-700 mb-6">
            BDFlatHub is not liable for any damages arising from your use of the Service, including:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
            <li>Disputes between users</li>
            <li>Property condition or rental agreements</li>
            <li>Loss of data or profits</li>
            <li>Third-party actions</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Termination</h2>
          <p className="text-gray-700 mb-6">
            We reserve the right to suspend or terminate your account at any time for violating these
            terms or for any other reason. You may also terminate your account at any time by
            contacting support.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Governing Law</h2>
          <p className="text-gray-700 mb-6">
            These terms are governed by the laws of Bangladesh. Any disputes shall be resolved in the
            courts of Dhaka, Bangladesh.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">12. Changes to Terms</h2>
          <p className="text-gray-700 mb-6">
            We may modify these terms at any time. Continued use of the Service after changes
            constitutes acceptance of the new terms.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">13. Contact Information</h2>
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <p className="text-gray-700 mb-2"><strong>Email:</strong> legal@bdfhub.com</p>
            <p className="text-gray-700 mb-2"><strong>Phone:</strong> +880 1712-345678</p>
            <p className="text-gray-700"><strong>Address:</strong> Dhaka, Bangladesh</p>
          </div>

          <div className="mt-12 p-6 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-gray-700">
              <strong>Important:</strong> BDFlatHub is a platform connecting property owners and
              tenants. We are not party to rental agreements and do not guarantee any transactions.
              Users are responsible for verifying property details and conducting due diligence.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
