import { useState } from "react";
import { User, CreditCard, Shield, Crown } from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Badge from "../../components/common/Badge";
import { useAuthStore } from "../../store/authStore";

function Account() {
  const { user, updateProfile, isLoading } = useAuthStore();
  const isPremium =
    user?.subscriptionStatus === "standard_monthly" ||
    user?.subscriptionStatus === "standard_yearly";
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  const handleUpdateProfile = async () => {
    await updateProfile({ name, email });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Account
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account settings
        </p>
      </div>

      {/* Profile */}
      <Card>
        <Card.Header>
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-gray-500" />
            <Card.Title>Profile</Card.Title>
          </div>
        </Card.Header>
        <Card.Content className="space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button onClick={handleUpdateProfile} loading={isLoading}>
            Save Changes
          </Button>
        </Card.Content>
      </Card>

      {/* Subscription */}
      <Card>
        <Card.Header>
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-gray-500" />
            <Card.Title>Subscription</Card.Title>
          </div>
        </Card.Header>
        <Card.Content>
          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center gap-3">
              {isPremium ? (
                <Crown className="h-6 w-6 text-amber-500" />
              ) : (
                <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-600" />
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {isPremium ? "Standard Plan" : "Free Plan"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isPremium
                    ? "Unlimited habits & advanced features"
                    : "Up to 5 habits"}
                </p>
              </div>
            </div>
            <Badge variant={isPremium ? "success" : "default"}>
              {isPremium ? "Active" : "Free"}
            </Badge>
          </div>

          {!isPremium ? (
            <div className="mt-4">
              <Button className="w-full">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Premium - $5/month
              </Button>
              <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
                or $40/year (save 33%)
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Next billing date: January 15, 2025
              </p>
              <Button variant="outline" size="sm">
                Manage Subscription
              </Button>
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Security */}
      <Card>
        <Card.Header>
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-gray-500" />
            <Card.Title>Security</Card.Title>
          </div>
        </Card.Header>
        <Card.Content className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Password
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Last changed 30 days ago
              </p>
            </div>
            <Button variant="outline" size="sm">
              Change Password
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Connected Accounts
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Google: connected
              </p>
            </div>
            <Button variant="outline" size="sm">
              Manage
            </Button>
          </div>
        </Card.Content>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900">
        <Card.Header>
          <Card.Title className="text-red-600 dark:text-red-400">
            Danger Zone
          </Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Delete Account
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="danger" size="sm">
              Delete
            </Button>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}

export default Account;
