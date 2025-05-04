
import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode; // Placeholder for icon component/element
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
      <div className="mb-4 text-indigo-600"> {/* Icon container */}
        {icon}
      </div>
      {/* Added responsive text sizing: text-lg on small screens, text-xl on medium and up */}
      <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      {/* Added responsive text sizing: text-sm on small screens, text-base on medium and up */}
      <p className="text-gray-600 text-sm md:text-base">{description}</p>
    </div>
  );
};

export default FeatureCard;


