import { useState } from 'react'
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
  category: string
}

const faqData: FAQItem[] = [
  // For Tenants
  {
    category: 'For Tenants',
    question: 'How do I search for properties?',
    answer: 'Use the search bar on the home page or browse properties page. You can filter by area, property type, price range, number of bedrooms, and amenities to find the perfect match.',
  },
  {
    category: 'For Tenants',
    question: 'Are the properties verified?',
    answer: 'Properties with a "Verified" badge have been reviewed by our admin team. We verify property ownership, photos, and basic details to ensure authenticity.',
  },
  {
    category: 'For Tenants',
    question: 'How do I contact a property owner?',
    answer: 'Click on any property to view details, then use the "Send Message" button to contact the owner directly. You can also call or email using the contact information provided.',
  },
  {
    category: 'For Tenants',
    question: 'Is there a fee for tenants?',
    answer: 'No, BDFlatHub is completely free for tenants. You can search, save favorites, and contact property owners without any charges.',
  },
  {
    category: 'For Tenants',
    question: 'Can I save properties to view later?',
    answer: 'Yes! Click the heart icon on any property card to add it to your favorites. Access your saved properties from your profile.',
  },

  // For Property Owners
  {
    category: 'For Property Owners',
    question: 'How do I list my property?',
    answer: 'Create an account as a property owner, then go to your dashboard and click "Add Property". Fill in all required details, upload photos, and submit for verification.',
  },
  {
    category: 'For Property Owners',
    question: 'How long does verification take?',
    answer: 'Property verification typically takes 24-48 hours. Our admin team reviews all submitted properties to ensure quality and authenticity.',
  },
  {
    category: 'For Property Owners',
    question: 'Can I edit my property listing?',
    answer: 'Yes, you can edit your property details anytime from your owner dashboard. Changes may require re-verification if significant details are modified.',
  },
  {
    category: 'For Property Owners',
    question: 'What information should I include?',
    answer: 'Include clear photos, accurate property details (size, bedrooms, bathrooms), amenities, rent amount, location, and a detailed description. More information leads to better inquiries.',
  },
  {
    category: 'For Property Owners',
    question: 'How do I manage inquiries?',
    answer: 'All inquiries are sent to your registered email and phone number. You can also view and manage them from your owner dashboard.',
  },

  // General
  {
    category: 'General',
    question: 'What areas does BDFlatHub cover?',
    answer: 'We currently cover all major areas of Dhaka including Dhanmondi, Gulshan, Uttara, Banani, Mirpur, Mohammadpur, Bashundhara, and more.',
  },
  {
    category: 'General',
    question: 'Is my personal information safe?',
    answer: 'Yes, we take data security seriously. Your personal information is encrypted and never shared with third parties without your consent. Read our Privacy Policy for details.',
  },
  {
    category: 'General',
    question: 'How do I report a fraudulent listing?',
    answer: 'If you encounter a suspicious listing, please contact our support team immediately at support@bdfhub.com with the property ID and details.',
  },
  {
    category: 'General',
    question: 'Can I use BDFlatHub on my mobile?',
    answer: 'Yes! BDFlatHub is fully mobile-responsive and works seamlessly on all devices including smartphones and tablets.',
  },
  {
    category: 'General',
    question: 'How do I delete my account?',
    answer: 'Contact our support team at support@bdfhub.com with your account deletion request. We will process it within 48 hours.',
  },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  const categories = ['All', 'For Tenants', 'For Property Owners', 'General']

  const filteredFAQs =
    selectedCategory === 'All'
      ? faqData
      : faqData.filter((faq) => faq.category === selectedCategory)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <HelpCircle className="mx-auto h-16 w-16 text-primary-600 mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-gray-600">
            Find answers to common questions about using BDFlatHub
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFAQs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <span className="text-xs font-medium text-primary-600 uppercase tracking-wide">
                    {faq.category}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900 mt-1">{faq.question}</h3>
                </div>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0 ml-4" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0 ml-4" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="mt-12 bg-primary-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Still have questions?</h2>
          <p className="text-gray-700 mb-6">
            Our support team is here to help you with any questions or concerns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@bdfhub.com"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              Email Support
            </a>
            <a
              href="tel:+8801712345678"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary-600 font-medium rounded-lg border-2 border-primary-600 hover:bg-primary-50 transition-colors"
            >
              Call Us
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
