const EmptyState = ({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) => {
    return (
      <div className="text-center py-10">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-slate-500 mt-2">{description}</p>
        {action && <div className="mt-4">{action}</div>}
      </div>
    )
  }
  
  export default EmptyState;
  