import EmptyState from '@/ui/EmptyState'

function PdfPlaceholderTab({ tabId }) {
  return (
    <>
      <h3>Coming Soon</h3>
      <EmptyState
        icon="🧩"
        title={`${tabId} tab ready`}
        text="This section was converted and can be expanded next."
      />
    </>
  )
}

export default PdfPlaceholderTab
