import Card from "../../components/common/Card";
import Toggle from "../../components/common/Toggle";
import { useUIStore } from "../../store/uiStore";

function Settings() {
  const { theme, setTheme } = useUIStore();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your app preferences
        </p>
      </div>

      <Card>
        <Card.Header>
          <Card.Title>Appearance</Card.Title>
        </Card.Header>
        <Card.Content className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Theme</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose your preferred theme
              </p>
            </div>
            <div className="flex gap-2">
              {[
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
                { value: "system", label: "System" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    theme === option.value
                      ? "bg-primary-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Notifications</Card.Title>
        </Card.Header>
        <Card.Content className="space-y-4">
          <Toggle
            checked={false}
            onChange={() => {}}
            label="Daily Reminder"
            description="Get a notification to log your habits"
          />
          <Toggle
            checked={false}
            onChange={() => {}}
            label="Weekly Summary"
            description="Receive a weekly progress report via email"
          />
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Data</Card.Title>
        </Card.Header>
        <Card.Content className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Export Data
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Download all your habit data as CSV
              </p>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
              Export
            </button>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}

export default Settings;
