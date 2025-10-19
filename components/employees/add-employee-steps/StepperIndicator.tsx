import { Check, LucideIcon } from "lucide-react";

interface Step {
  number: number;
  title: string;
  icon: LucideIcon;
}

interface StepperIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export default function StepperIndicator({
  steps,
  currentStep,
}: StepperIndicatorProps) {
  return (
    <div className="px-6 py-4 border-b bg-gray-50 dark:bg-gray-800/50">
      <div className="flex items-center justify-center gap-4 max-w-4xl mx-auto">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;

          return (
            <div key={step.number} className="flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center min-w-[80px]">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isActive
                      ? "bg-teal-600 text-white ring-4 ring-teal-200 dark:ring-teal-800"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <StepIcon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium text-center ${
                    isActive || isCompleted
                      ? "text-teal-600 dark:text-teal-400"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {step.title}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex items-center mb-6">
                  <div
                    className={`w-20 h-0.5 transition-all duration-300 ${
                      currentStep > step.number
                        ? "bg-green-500"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
