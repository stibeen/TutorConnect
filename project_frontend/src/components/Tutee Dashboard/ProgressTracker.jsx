export default function ProgressTracker() {
    const progress = [
      { subject: "Java Programming", percentage: 0 },
      { subject: "Web Development", percentage: 0 },
      { subject: "Introduction to C Programming", percentage: 0 },
    ];
  
    return (
      <div className="space-y-4">
        {progress.map((item) => (
          <div key={item.subject}>
            <div className="flex justify-between mb-1">
              <span>{item.subject}</span>
              <span>{item.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-[#efc940]"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }
  