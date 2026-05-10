import Card from './Card'
import Button from './Button'

function QuickTools({ tools = [], columns = 2 }) {
  return (
    <Card className="quick-tools-card">
      <h3>Quick Tools</h3>
      <div className={`quick-tools-grid grid-${columns}`}>
        {tools.map((tool, idx) => (
          <div key={idx} className="quick-tool-item">
            <div className="tool-header">
              <span className="tool-icon">{tool.icon}</span>
              <h4>{tool.name}</h4>
            </div>
            {tool.description && <p className="text-small">{tool.description}</p>}
            
            {tool.actions && (
              <div className="tool-actions">
                {tool.actions.map((action, actionIdx) => (
                  <Button
                    key={actionIdx}
                    size={action.size || 'small'}
                    variant={action.variant || 'secondary'}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className={action.className}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

export default QuickTools
