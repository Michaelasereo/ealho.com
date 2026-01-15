interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-white/60">Step {currentStep} of {totalSteps}</span>
        <span className="text-sm text-white/60">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-[#1f1f1f] rounded-full h-2 overflow-hidden">
        <div
          className="bg-white h-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

