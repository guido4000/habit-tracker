import { Link } from "react-router-dom";
import {
  Check,
  Calendar,
  BarChart3,
  Moon,
  Smartphone,
  Wifi,
  Star,
  ArrowRight,
} from "lucide-react";
import Button from "../../components/common/Button";

function Landing() {
  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              Build Better Habits,{" "}
              <span className="text-primary-500">One Day at a Time</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
              The simple, beautiful habit tracker that helps you stay consistent
              and achieve your goals. See your entire month at a glance and
              build lasting routines.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link to="/signup">
                <Button size="lg">
                  Start Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/why">
                <Button variant="outline" size="lg">
                  See How It Works
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Image Placeholder */}
          <div className="mt-16 rounded-2xl border border-gray-200 bg-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800 sm:p-8">
            <div className="aspect-video rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 flex items-center justify-center">
              <div className="text-center">
                <Calendar className="mx-auto h-16 w-16 text-primary-500" />
                <p className="mt-4 text-lg font-medium text-primary-600 dark:text-primary-400">
                  App Screenshot Coming Soon
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Everything you need to build habits
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Simple yet powerful features designed for real habit building
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Calendar,
                title: "Full Month View",
                description:
                  "See your entire month at a glance. No more scrolling through days.",
              },
              {
                icon: Wifi,
                title: "Works Offline",
                description:
                  "Track your habits anywhere. Syncs automatically when you're back online.",
              },
              {
                icon: BarChart3,
                title: "Beautiful Statistics",
                description:
                  "Visualize your progress with charts, streaks, and insights.",
              },
              {
                icon: Moon,
                title: "Light & Dark Mode",
                description:
                  "Easy on the eyes, day or night. Automatically matches your system.",
              },
              {
                icon: Smartphone,
                title: "Works Everywhere",
                description:
                  "Responsive design that works perfectly on desktop, tablet, and mobile.",
              },
              {
                icon: Check,
                title: "One-Tap Tracking",
                description:
                  "Mark habits done with a single tap. No friction, no excuses.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Start tracking your habits in seconds
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "1",
                title: "Create Habits",
                desc: "Add up to 5 habits for free",
              },
              { step: "2", title: "Track Daily", desc: "One tap to mark done" },
              {
                step: "3",
                title: "See Progress",
                desc: "Watch your streaks grow",
              },
              {
                step: "4",
                title: "Build Routines",
                desc: "Make habits stick for life",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-500 text-xl font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Loved by habit builders
            </h2>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                quote:
                  "Finally, a habit tracker that doesn't overwhelm me. I can see my whole month and it keeps me motivated!",
                author: "Sarah M.",
                role: "Designer",
              },
              {
                quote:
                  "Been using Easy Habit Pro for 6 months. Lost 20 lbs by tracking my exercise and diet habits daily.",
                author: "Michael T.",
                role: "Software Engineer",
              },
              {
                quote:
                  "The simplest habit tracker I've found. No gimmicks, just results.",
                author: "Jennifer L.",
                role: "Marketing Manager",
              },
              {
                quote:
                  "I tried 10 different habit apps. This is the one that stuck.",
                author: "David K.",
                role: "Entrepreneur",
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="mt-4 text-gray-600 dark:text-gray-300">
                  "{testimonial.quote}"
                </p>
                <div className="mt-4">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Start free, upgrade when you need more
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-2 lg:max-w-4xl lg:mx-auto">
            {/* Free Plan */}
            <div className="rounded-xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Free
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Perfect for getting started
              </p>
              <p className="mt-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  $0
                </span>
                <span className="text-gray-600 dark:text-gray-300">
                  /forever
                </span>
              </p>
              <ul className="mt-8 space-y-3">
                {[
                  "Up to 5 habits",
                  "3 tags",
                  "Basic statistics",
                  "Mobile & desktop",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-success-500" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <Link to="/signup" className="mt-8 block">
                <Button variant="outline" className="w-full">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="rounded-xl border-2 border-primary-500 bg-white p-8 dark:bg-gray-800 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary-500 px-4 py-1 text-sm font-medium text-white">
                Popular
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Standard
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                For serious habit builders
              </p>
              <p className="mt-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  $5
                </span>
                <span className="text-gray-600 dark:text-gray-300">/month</span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                or $40/year (save 33%)
              </p>
              <ul className="mt-8 space-y-3">
                {[
                  "Unlimited habits",
                  "Unlimited tags",
                  "Advanced statistics",
                  "Data export",
                  "Priority support",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-success-500" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <Link to="/signup" className="mt-8 block">
                <Button className="w-full">Start Free Trial</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-primary-500 dark:bg-primary-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to build better habits?
          </h2>
          <p className="mt-4 text-lg text-primary-100">
            Join thousands of people building lasting habits with Easy Habit Pro
          </p>
          <div className="mt-8">
            <Link to="/signup">
              <Button
                size="lg"
                className="bg-white text-primary-600 hover:bg-primary-50"
              >
                Start Free Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Landing;
