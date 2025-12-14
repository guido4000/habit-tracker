import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import Button from "../../components/common/Button";

function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "Up to 5 habits",
        "3 tags",
        "Basic statistics",
        "Mobile & desktop",
      ],
      cta: "Get Started",
      ctaLink: "/signup",
      popular: false,
    },
    {
      name: "Standard",
      price: "$5",
      period: "month",
      yearlyPrice: "$40/year",
      description: "For serious habit builders",
      features: [
        "Unlimited habits",
        "Unlimited tags",
        "Advanced statistics",
        "Data export",
        "Priority support",
      ],
      cta: "Start Free Trial",
      ctaLink: "/signup",
      popular: true,
    },
  ];

  return (
    <div className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Start free, upgrade when you need more
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-2 lg:max-w-4xl lg:mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 ${
                plan.popular
                  ? "border-2 border-primary-500 bg-white dark:bg-gray-800 relative"
                  : "border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary-500 px-4 py-1 text-sm font-medium text-white">
                  Most Popular
                </div>
              )}
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {plan.name}
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                {plan.description}
              </p>
              <p className="mt-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  {plan.price}
                </span>
                <span className="text-gray-600 dark:text-gray-300">
                  /{plan.period}
                </span>
              </p>
              {plan.yearlyPrice && (
                <p className="mt-1 text-sm text-gray-500">
                  {plan.yearlyPrice} (save 33%)
                </p>
              )}
              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-success-500" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <Link to={plan.ctaLink} className="mt-8 block">
                <Button
                  className="w-full"
                  variant={plan.popular ? "primary" : "outline"}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-20">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:max-w-4xl lg:mx-auto">
            {[
              {
                q: "Can I cancel anytime?",
                a: "Yes, you can cancel your subscription at any time. No questions asked.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards through Stripe.",
              },
              {
                q: "Is there a free trial?",
                a: "Yes! Start with our free plan and upgrade whenever you're ready.",
              },
              {
                q: "Can I export my data?",
                a: "Premium users can export their data as CSV at any time.",
              },
            ].map((faq) => (
              <div
                key={faq.q}
                className="rounded-lg border border-gray-200 p-6 dark:border-gray-700"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {faq.q}
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pricing;
