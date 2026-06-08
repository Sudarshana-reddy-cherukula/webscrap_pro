import { useTheme } from '@/hooks/useTheme'

function ThemeTest() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Theme Test
      </h2>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-700 mb-2">
            Current theme: <strong>{theme}</strong>
          </p>
          <p className="text-sm text-gray-700 mb-2">
            Available actions: toggleTheme (locked to light mode)
          </p>
        </div>
      </div>
    </div>
  )
}

export default ThemeTest
