import { Link } from "react-router-dom";
import { Brain, Eye, Zap, Heart, ArrowRight } from "lucide-react";
import Button from "../../components/common/Button";

function Why() {
  return (
    <div className="py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Why Easy Habit Pro?
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            The science of habit building and why our approach works
          </p>
        </div>

        {/* Psychology Section */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            The Psychology Behind Habits
          </h2>

          <div className="mt-8 space-y-8">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  The Habit Loop
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Based on Charles Duhigg's research in "The Power of Habit",
                  every habit consists of three parts:
                  <strong> Cue</strong> (the trigger), <strong>Routine</strong>{" "}
                  (the behavior), and <strong>Reward</strong> (the benefit).
                  Easy Habit Pro makes the cue visual (seeing your monthly
                  grid), the routine simple (one click), and the reward
                  satisfying (watching your progress grow).
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400">
                <Eye className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Atomic Habits Principles
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  James Clear's framework guides our design:{" "}
                  <strong>Make it Obvious</strong> (full-month view keeps habits
                  visible),
                  <strong> Make it Attractive</strong> (clean design and
                  progress visualization),
                  <strong> Make it Easy</strong> (one-tap tracking), and
                  <strong> Make it Satisfying</strong> (streaks and achievements
                  celebrate your wins).
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Don't Break the Chain
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Jerry Seinfeld's productivity secret: Mark an X on a calendar
                  for every day you complete your habit. Your only job is to not
                  break the chain. Our monthly grid is designed exactly for this
                  psychological technique— seeing those streaks grow becomes
                  powerfully motivating.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Differentiation */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Why We're Different
          </h2>

          <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Problem with Other Apps
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Our Solution
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {[
                  ["Feature Overload", "Focused Simplicity—just what you need"],
                  ["Notification Fatigue", "Optional & gentle reminders"],
                  ["Can't See Big Picture", "Full month view at a glance"],
                  ["Complicated Setup", "Start tracking in seconds"],
                  [
                    "Expensive Premium ($10-15/mo)",
                    "Affordable at $5/mo or $40/year",
                  ],
                  ["Data Locked In", "Export your data anytime"],
                  ["No Offline Mode", "Works offline, syncs when connected"],
                ].map(([problem, solution]) => (
                  <tr key={problem}>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {problem}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                      {solution}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Philosophy */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Our Philosophy
          </h2>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {[
              {
                title: "Less is More",
                desc: "The best tool is one you'll actually use. We've stripped away everything unnecessary.",
              },
              {
                title: "Friction-Free",
                desc: "Every extra tap is a reason to skip. One tap to mark done—no confirmations, no modals.",
              },
              {
                title: "Celebrate Wins",
                desc: "Building habits is hard. Visual progress, streaks, and achievements keep you motivated.",
              },
              {
                title: "Privacy-First",
                desc: "Your habits are personal. We don't sell data, show ads, or track more than needed.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-gray-200 p-6 dark:border-gray-700"
              >
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                </div>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Ready to build better habits?
          </h2>
          <div className="mt-6">
            <Link to="/signup">
              <Button size="lg">
                Start Free Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Why;
