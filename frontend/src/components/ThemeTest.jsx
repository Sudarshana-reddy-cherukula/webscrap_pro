import { useTheme } from '../contexts/themeContext';

function ThemeTest() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        🔍 Theme Context Test
      </h2>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            <strong>Current Theme:</strong> {theme}
          </p>
          
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            <strong>Toggle Function:</strong> {toggleTheme ? 'Available' : 'Not Available'}
          </p>
          
          <button
            onClick={toggleTheme}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {toggleTheme ? 'Toggle to Dark' : 'Toggle to Light'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ThemeTest;
