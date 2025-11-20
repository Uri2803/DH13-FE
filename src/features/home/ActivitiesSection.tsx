// src/pages/home/components/ActivitiesSection.tsx
import React from 'react';

interface ActivityItem {
  title: string;
  description: string;
  image: string;
}

interface ActivitiesSectionProps {
  isVisible: boolean;
  activities: ActivityItem[];
}

const ActivitiesSection: React.FC<ActivitiesSectionProps> = ({
  isVisible,
  activities,
}) => {
  return (
    <section className="py-20 bg-gradient-to-br from-cyan-50 to-cyan-100/30">
      <div className="container mx-auto px-4">
        <div
          className={`text-center mb-16 transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-700 bg-clip-text text-transparent mb-6">
            HOẠT ĐỘNG CHÍNH
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Các mảng hoạt động trọng tâm của Hội Sinh viên Trường trong nhiệm kỳ mới.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {activities.map((activity, index) => (
            <div
              key={index}
              className={`group bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
              style={{ transitionDelay: `${1000 + index * 200}ms` }}
            >
              <div className="text-center">
                <div className="relative overflow-hidden rounded-xl mb-6">
                  <img
                    alt={activity.title}
                    className="w-full h-56 object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    src={activity.image}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-cyan-600/20 to-transparent" />
                </div>
                <h3 className="text-1xl font-bold mb-4 text-gray-800 truncate">
                <span className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white text-sm px-4 py-2 rounded-full mb-4 inline-block">{activity.title}</span>
                </h3>




                <p className="text-gray-600 text-lg leading-relaxed">
                  {activity.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ActivitiesSection;
